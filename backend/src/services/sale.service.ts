import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { toNumber, round2 } from "../utils/money";
import { CreateSaleInput, SaleQuery } from "../validators/sale.validator";

export async function createSale(businessId: string, employeeId: string, input: CreateSaleInput) {
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, businessId } });

  if (products.length !== productIds.length) {
    throw ApiError.badRequest("Тандалган товарлардын айрымдары табылган жок.");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = productMap.get(item.productId)!;
    if (toNumber(product.quantity) < item.quantity) {
      throw ApiError.badRequest(`"${product.name}" складда жетишсиз (калдык: ${toNumber(product.quantity)}).`);
    }
  }

  let subtotal = 0;
  let costTotal = 0;
  const lineItems = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const price = toNumber(product.salePrice);
    const costPrice = toNumber(product.purchasePrice);
    const total = round2(price * item.quantity);
    subtotal = round2(subtotal + total);
    costTotal = round2(costTotal + round2(costPrice * item.quantity));
    return { productId: item.productId, quantity: item.quantity, price, costPrice, total };
  });

  const discount = round2(input.discount);
  const total = round2(Math.max(0, subtotal - discount));

  if (input.paymentMethod === "DEBT" && !input.customerId) {
    throw ApiError.badRequest("Карызга сатуу үчүн кардар талап кылынат.");
  }

  const sale = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        businessId,
        employeeId,
        customerId: input.customerId || null,
        subtotal,
        discount,
        total,
        costTotal,
        paymentMethod: input.paymentMethod,
        items: { create: lineItems },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    for (const item of lineItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          businessId,
          productId: item.productId,
          type: "SALE",
          quantity: item.quantity,
          saleId: sale.id,
          employeeId,
          comment: "Сатуудан",
        },
      });
    }

    if (input.paymentMethod === "DEBT" && input.customerId) {
      await tx.debt.create({
        data: {
          businessId,
          customerId: input.customerId,
          saleId: sale.id,
          totalAmount: total,
          paidAmount: 0,
          remainingAmount: total,
          status: "OPEN",
          comment: "Сатуудан пайда болгон карыз",
        },
      });
    }

    return sale;
  });

  return {
    id: sale.id,
    subtotal,
    discount,
    total,
    paymentMethod: sale.paymentMethod,
    customer: sale.customer ? { id: sale.customer.id, name: sale.customer.name } : null,
    items: sale.items.map((i) => ({
      productId: i.productId,
      productName: i.product.name,
      quantity: toNumber(i.quantity),
      price: toNumber(i.price),
      total: toNumber(i.total),
    })),
    createdAt: sale.createdAt,
  };
}

export async function listSales(businessId: string, query: SaleQuery) {
  const where = {
    businessId,
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
    prisma.sale.findMany({
      where,
      include: { customer: true, employee: { include: { user: true } }, items: true },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    items: rows.map((s) => ({
      id: s.id,
      total: toNumber(s.total),
      discount: toNumber(s.discount),
      paymentMethod: s.paymentMethod,
      status: s.status,
      customerName: s.customer?.name ?? null,
      cashierName: s.employee.user.name,
      itemCount: s.items.length,
      createdAt: s.createdAt,
    })),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getSale(businessId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, businessId },
    include: { customer: true, employee: { include: { user: true } }, items: { include: { product: true } } },
  });
  if (!sale) throw ApiError.notFound("Сатуу табылган жок.");

  return {
    id: sale.id,
    subtotal: toNumber(sale.subtotal),
    discount: toNumber(sale.discount),
    total: toNumber(sale.total),
    paymentMethod: sale.paymentMethod,
    status: sale.status,
    customer: sale.customer ? { id: sale.customer.id, name: sale.customer.name } : null,
    cashierName: sale.employee.user.name,
    items: sale.items.map((i) => ({
      productName: i.product.name,
      quantity: toNumber(i.quantity),
      price: toNumber(i.price),
      total: toNumber(i.total),
    })),
    createdAt: sale.createdAt,
  };
}
