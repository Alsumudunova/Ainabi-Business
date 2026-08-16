import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { toNumber } from "../utils/money";
import { CreateStockMovementInput, StockQuery } from "../validators/stock.validator";

export async function createMovement(businessId: string, employeeId: string, input: CreateStockMovementInput) {
  const product = await prisma.product.findFirst({ where: { id: input.productId, businessId } });
  if (!product) throw ApiError.notFound("Товар табылган жок.");

  const isOutgoing = input.type === "OUT" || input.type === "WRITE_OFF";
  if (isOutgoing && toNumber(product.quantity) < input.quantity) {
    throw ApiError.badRequest(`Складда жетишсиз калдык (учурдагы: ${toNumber(product.quantity)}).`);
  }

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        businessId,
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        supplierId: input.supplierId || null,
        employeeId,
        comment: input.comment || null,
      },
    }),
    prisma.product.update({
      where: { id: input.productId },
      data: {
        quantity: isOutgoing ? { decrement: input.quantity } : { increment: input.quantity },
        ...(input.type === "IN" && input.purchasePrice ? { purchasePrice: input.purchasePrice } : {}),
      },
    }),
  ]);

  return movement;
}

export async function listMovements(businessId: string, query: StockQuery) {
  const where = {
    businessId,
    type: query.type,
    productId: query.productId,
    ...(query.from || query.to
      ? {
          createdAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { product: true, supplier: true, employee: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    items: rows.map((m) => ({
      id: m.id,
      productName: m.product.name,
      type: m.type,
      quantity: toNumber(m.quantity),
      purchasePrice: m.purchasePrice ? toNumber(m.purchasePrice) : null,
      supplierName: m.supplier?.name ?? null,
      employeeName: m.employee?.user.name ?? null,
      comment: m.comment,
      createdAt: m.createdAt,
    })),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function stockSummary(businessId: string) {
  const products = await prisma.product.findMany({ where: { businessId, status: "ACTIVE" } });

  const totalQuantity = products.reduce((sum, p) => sum + toNumber(p.quantity), 0);
  const totalValue = products.reduce((sum, p) => sum + toNumber(p.quantity) * toNumber(p.purchasePrice), 0);
  const lowStock = products.filter((p) => toNumber(p.quantity) > 0 && toNumber(p.quantity) <= toNumber(p.minQuantity)).length;
  const outOfStock = products.filter((p) => toNumber(p.quantity) <= 0).length;

  return {
    totalProducts: products.length,
    totalQuantity,
    totalValue: Math.round(totalValue * 100) / 100,
    lowStock,
    outOfStock,
  };
}
