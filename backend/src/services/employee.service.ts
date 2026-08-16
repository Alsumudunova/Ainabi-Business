import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";
import { InviteEmployeeInput, UpdateEmployeeInput } from "../validators/employee.validator";

export async function listEmployees(businessId: string) {
  const employees = await prisma.employee.findMany({
    where: { businessId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return employees.map((e) => ({
    id: e.id,
    name: e.user.name,
    email: e.user.email,
    phone: e.user.phone,
    role: e.role,
    status: e.status,
    lastLoginAt: e.lastLoginAt,
    createdAt: e.createdAt,
  }));
}

export async function inviteEmployee(businessId: string, input: InviteEmployeeInput) {
  let user = await prisma.user.findUnique({ where: { email: input.email } });

  if (user) {
    const existingLink = await prisma.employee.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });
    if (existingLink) throw ApiError.conflict("Бул колдонуучу мурунтан кызматкер катары кошулган.");
  } else {
    const passwordHash = await hashPassword(input.password);
    user = await prisma.user.create({
      data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
    });
  }

  const employee = await prisma.employee.create({
    data: { userId: user.id, businessId, role: input.role, status: "ACTIVE" },
    include: { user: true },
  });

  return {
    id: employee.id,
    name: employee.user.name,
    email: employee.user.email,
    phone: employee.user.phone,
    role: employee.role,
    status: employee.status,
    lastLoginAt: employee.lastLoginAt,
    createdAt: employee.createdAt,
  };
}

export async function updateEmployee(businessId: string, id: string, input: UpdateEmployeeInput) {
  const employee = await prisma.employee.findFirst({ where: { id, businessId } });
  if (!employee) throw ApiError.notFound("Кызматкер табылган жок.");
  if (employee.role === "OWNER") throw ApiError.forbidden("Ээнин ролун өзгөртүүгө болбойт.");

  const updated = await prisma.employee.update({
    where: { id },
    data: { role: input.role, status: input.status },
    include: { user: true },
  });

  return {
    id: updated.id,
    name: updated.user.name,
    email: updated.user.email,
    phone: updated.user.phone,
    role: updated.role,
    status: updated.status,
    lastLoginAt: updated.lastLoginAt,
    createdAt: updated.createdAt,
  };
}

export async function removeEmployee(businessId: string, id: string) {
  const employee = await prisma.employee.findFirst({ where: { id, businessId } });
  if (!employee) throw ApiError.notFound("Кызматкер табылган жок.");
  if (employee.role === "OWNER") throw ApiError.forbidden("Ээни өчүрүүгө болбойт.");
  await prisma.employee.delete({ where: { id } });
}
