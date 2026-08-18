import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { toNumber } from "../utils/money";
import { generateBarcodeFromSku } from "../utils/barcode";
import { ProductInput, ProductQuery } from "../validators/product.validator";

/** Assigns the next "SKU-0007"-style number for a business when the owner
 * leaves the SKU field blank — counting includes archived products so a
 * deleted item's number is never reused. */
async function generateSku(businessId: string): Promise<string> {
  const count = await prisma.product.count({ where: { businessId } });
  for (let attempt = count + 1; attempt < count + 21; attempt++) {
    const candidate = `SKU-${String(attempt).padStart(4, "0")}`;
    const exists = await prisma.product.findFirst({ where: { businessId, sku: candidate } });
    if (!exists) return candidate;
  }
  return `SKU-${Date.now()}`;
}

/** Same idea for the barcode, only reached when both SKU and barcode were
 * left blank (the frontend already derives+sends a barcode itself whenever
 * the owner typed an SKU by hand — see frontend/src/utils/barcode.ts). */
async function ensureUniqueBarcode(businessId: string, sku: string): Promise<string> {
  for (let salt = 0; salt < 20; salt++) {
    const candidate = generateBarcodeFromSku(sku, salt ? String(salt) : "");
    const exists = await prisma.product.findFirst({ where: { businessId, barcode: candidate } });
    if (!exists) return candidate;
  }
  return generateBarcodeFromSku(sku, String(Date.now()));
}

function serializeProduct(product: Prisma.ProductGetPayload<{ include: { category: true } }>) {
  const purchasePrice = toNumber(product.purchasePrice);
  const salePrice = toNumber(product.salePrice);
  const quantity = toNumber(product.quantity);
  const minQuantity = toNumber(product.minQuantity);

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    purchasePrice,
    salePrice,
    profit: Math.round((salePrice - purchasePrice) * 100) / 100,
    marginPercent: purchasePrice > 0 ? Math.round(((salePrice - purchasePrice) / purchasePrice) * 1000) / 10 : 0,
    quantity,
    minQuantity,
    unit: product.unit,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status,
    stockStatus: quantity <= 0 ? "OUT" : quantity <= minQuantity ? "LOW" : "OK",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function listProducts(businessId: string, query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    businessId,
    status: query.status ?? undefined,
    categoryId: query.categoryId || undefined,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { sku: { contains: query.search, mode: "insensitive" } },
            { barcode: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (query.stock === "out") {
    where.quantity = { lte: 0 };
  }

  // "low" compares two columns (quantity <= minQuantity), which Prisma's
  // filter API can't express directly, so it's applied in-memory below.
  if (query.stock === "low") {
    const all = await prisma.product.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } });
    const filtered = all.map(serializeProduct).filter((p) => p.stockStatus === "LOW");
    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    return {
      items: filtered.slice(start, start + query.pageSize),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map(serializeProduct),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getProduct(businessId: string, id: string) {
  const product = await prisma.product.findFirst({ where: { id, businessId }, include: { category: true } });
  if (!product) throw ApiError.notFound("Товар табылган жок.");
  return serializeProduct(product);
}

export async function createProduct(businessId: string, input: ProductInput) {
  if (input.barcode) {
    const exists = await prisma.product.findFirst({ where: { businessId, barcode: input.barcode } });
    if (exists) throw ApiError.conflict("Бул штрих-код менен товар мурунтан бар.");
  }

  const sku = input.sku || (await generateSku(businessId));
  const barcode = input.barcode || (await ensureUniqueBarcode(businessId, sku));

  const product = await prisma.product.create({
    data: {
      businessId,
      name: input.name,
      categoryId: input.categoryId || null,
      sku,
      barcode,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      quantity: input.quantity,
      minQuantity: input.minQuantity,
      unit: input.unit,
      imageUrl: input.imageUrl || null,
      description: input.description || null,
    },
    include: { category: true },
  });

  if (input.quantity > 0) {
    await prisma.stockMovement.create({
      data: {
        businessId,
        productId: product.id,
        type: "IN",
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        comment: "Баштапкы калдык",
      },
    });
  }

  return serializeProduct(product);
}

export async function updateProduct(businessId: string, id: string, input: ProductInput) {
  const existing = await prisma.product.findFirst({ where: { id, businessId } });
  if (!existing) throw ApiError.notFound("Товар табылган жок.");

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      categoryId: input.categoryId || null,
      sku: input.sku || null,
      barcode: input.barcode || null,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      minQuantity: input.minQuantity,
      unit: input.unit,
      imageUrl: input.imageUrl || null,
      description: input.description || null,
    },
    include: { category: true },
  });

  return serializeProduct(product);
}

export async function deleteProduct(businessId: string, id: string) {
  const existing = await prisma.product.findFirst({ where: { id, businessId } });
  if (!existing) throw ApiError.notFound("Товар табылган жок.");
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
}

export async function findByBarcode(businessId: string, barcode: string) {
  const product = await prisma.product.findFirst({
    where: { businessId, barcode, status: "ACTIVE" },
    include: { category: true },
  });
  if (!product) throw ApiError.notFound("Товар табылган жок.");
  return serializeProduct(product);
}
