import { z } from "zod";
import { getPrismaClient } from "@/lib/db/prisma";
import { initialDrivers } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const driverInput = z.object({
  fullName: z.string().min(1),
  mobile: z.string().min(1),
  city: z.string().min(1),
  driverStatus: z.string().default("نشط"),
  notes: z.string().optional()
});

export async function listDrivers() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialDrivers);

  try {
    return serviceOk(await prisma.driver.findMany({ orderBy: { createdAt: "desc" }, include: { primaryArea: true, documents: true } }));
  } catch {
    return serviceFallback(initialDrivers);
  }
}

export async function getDriverById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialDrivers.find((driver) => driver.id === id) ?? null);

  try {
    return serviceOk(await prisma.driver.findFirst({ where: { OR: [{ id }, { externalId: id }] }, include: { primaryArea: true, documents: true, agreements: true } }));
  } catch {
    return serviceFallback(initialDrivers.find((driver) => driver.id === id) ?? null);
  }
}

export async function createDriver(input: unknown) {
  const parsed = driverInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.driver.create({ data: parsed.data }));
  } catch {
    return serviceError(null);
  }
}

export async function updateDriver(id: string, input: unknown) {
  const parsed = driverInput.partial().safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.driver.update({ where: { id }, data: parsed.data }));
  } catch {
    return serviceError(null);
  }
}
