import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { CategoryInput } from "../validators/category.validator";

export function listCategories(businessId: string) {
  return prisma.category.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(businessId: string, input: CategoryInput) {
  const exists = await prisma.category.findFirst({ where: { businessId, name: input.name } });
  if (exists) throw ApiError.conflict("Мындай категория мурунтан бар.");
  return prisma.category.create({ data: { businessId, name: input.name } });
}

export async function updateCategory(businessId: string, id: string, input: CategoryInput) {
  const category = await prisma.category.findFirst({ where: { id, businessId } });
  if (!category) throw ApiError.notFound("Категория табылган жок.");
  return prisma.category.update({ where: { id }, data: { name: input.name } });
}

export async function deleteCategory(businessId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, businessId } });
  if (!category) throw ApiError.notFound("Категория табылган жок.");
  await prisma.category.delete({ where: { id } });
}
