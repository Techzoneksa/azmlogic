import { z } from "zod";
import { getPrismaClient } from "@/lib/db/prisma";
import { initialParcels } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const parcelInput = z.object({
  internalRef: z.string().min(1),
  recipientName: z.string().min(1),
  recipientMobile: z.string().optional(),
  pickupPoint: z.string().min(1),
  deliveryAddress: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  status: z.string().default("جديد"),
  weight: z.string().optional(),
  pieces: z.string().optional(),
  fragile: z.boolean().optional(),
  requiresSignature: z.boolean().optional(),
  notes: z.string().optional()
});

const assignmentInput = z.object({
  assignedDriverId: z.string().optional(),
  vehicleId: z.string().optional(),
  coverageAreaId: z.string().optional(),
  assignmentStatus: z.string().optional(),
  assignedBy: z.string().optional(),
  reassignmentRequired: z.boolean().optional()
});

export async function listParcels() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialParcels);

  try {
    return serviceOk(await prisma.parcel.findMany({ orderBy: { createdAt: "desc" }, include: { partner: true, assignedDriver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceFallback(initialParcels);
  }
}

export async function getParcelById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialParcels.find((parcel) => parcel.id === id) ?? null);

  try {
    return serviceOk(await prisma.parcel.findFirst({ where: { OR: [{ id }, { internalRef: id }] }, include: { assignmentHistory: true, statusHistory: true, partner: true, assignedDriver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceFallback(initialParcels.find((parcel) => parcel.id === id) ?? null);
  }
}

export async function createParcel(input: unknown) {
  const parsed = parcelInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.parcel.create({ data: parsed.data }));
  } catch {
    return serviceError(null);
  }
}

export async function updateParcelAssignment(id: string, input: unknown) {
  const parsed = assignmentInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.parcel.update({ where: { id }, data: { ...parsed.data, assignedAt: new Date() } }));
  } catch {
    return serviceError(null);
  }
}
