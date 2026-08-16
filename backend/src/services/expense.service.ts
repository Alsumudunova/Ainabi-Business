import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { toNumber } from "../utils/money";
import { ExpenseInput, ExpenseQuery } from "../validators/expense.validator";

export async function listExpenses(businessId: string, query: ExpenseQuery) {
  const expenses = await prisma.expense.findMany({
    where: {
      businessId,
      category: query.category,
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    },
    include: { employee: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return expenses.map((e) => ({
    id: e.id,
    category: e.category,
    amount: toNumber(e.amount),
    comment: e.comment,
    addedBy: e.employee.user.name,
    createdAt: e.createdAt,
  }));
}

export function createExpense(businessId: string, employeeId: string, input: ExpenseInput) {
  return prisma.expense.create({
    data: { businessId, employeeId, category: input.category, amount: input.amount, comment: input.comment || null },
  });
}

export async function deleteExpense(businessId: string, id: string) {
  const existing = await prisma.expense.findFirst({ where: { id, businessId } });
  if (!existing) throw ApiError.notFound("Чыгым табылган жок.");
  await prisma.expense.delete({ where: { id } });
}
