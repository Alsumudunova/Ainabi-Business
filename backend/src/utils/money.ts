import { Prisma } from "@prisma/client";

/** Converts a Prisma Decimal (or numeric-ish value) to a plain JS number for API responses. */
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "object" ? Number(value.toString()) : Number(value);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
