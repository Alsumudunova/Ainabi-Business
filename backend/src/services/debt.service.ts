import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { round2, toNumber } from "../utils/money";
import { CreateDebtInput, CreateDebtPaymentInput } from "../validators/debt.validator";

export async function listDebts(businessId: string, status?: string) {
  const debts = await prisma.debt.findMany({
    where: { businessId, status: status === "OPEN" ? { in: ["OPEN", "PARTIAL"] } : undefined },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return debts.map((d) => ({
    id: d.id,
    customerId: d.customerId,
    customerName: d.customer.name,
    customerPhone: d.customer.phone,
    totalAmount: toNumber(d.totalAmount),
    paidAmount: toNumber(d.paidAmount),
    remainingAmount: toNumber(d.remainingAmount),
    status: d.status,
    comment: d.comment,
    createdAt: d.createdAt,
  }));
}

export async function debtSummary(businessId: string) {
  const debts = await prisma.debt.findMany({ where: { businessId, status: { in: ["OPEN", "PARTIAL"] } } });
  const total = debts.reduce((sum, d) => sum + toNumber(d.remainingAmount), 0);
  return { totalOutstanding: round2(total), openDebts: debts.length };
}

export async function createDebt(businessId: string, input: CreateDebtInput) {
  const customer = await prisma.customer.findFirst({ where: { id: input.customerId, businessId } });
  if (!customer) throw ApiError.notFound("Кардар табылган жок.");

  return prisma.debt.create({
    data: {
      businessId,
      customerId: input.customerId,
      totalAmount: input.totalAmount,
      paidAmount: 0,
      remainingAmount: input.totalAmount,
      status: "OPEN",
      comment: input.comment || null,
    },
  });
}

export async function addPayment(businessId: string, debtId: string, input: CreateDebtPaymentInput) {
  const debt = await prisma.debt.findFirst({ where: { id: debtId, businessId } });
  if (!debt) throw ApiError.notFound("Карыз табылган жок.");

  const remaining = toNumber(debt.remainingAmount);
  if (input.amount > remaining) {
    throw ApiError.badRequest(`Төлөм суммасы карыздан ашпашы керек (калган: ${remaining} сом).`);
  }

  const newPaid = round2(toNumber(debt.paidAmount) + input.amount);
  const newRemaining = round2(remaining - input.amount);

  const [payment] = await prisma.$transaction([
    prisma.debtPayment.create({
      data: { debtId, amount: input.amount, method: input.method, comment: input.comment || null },
    }),
    prisma.debt.update({
      where: { id: debtId },
      data: {
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status: newRemaining <= 0 ? "PAID" : "PARTIAL",
      },
    }),
  ]);

  return payment;
}
