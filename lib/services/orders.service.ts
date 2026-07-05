import { z } from "zod";
import { getPrismaClient } from "@/lib/db/prisma";
import { initialOrders } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const orderInput = z.object({
  internalRef: z.string().min(1),
  orderType: z.string().min(1),
  customerName: z.string().min(1),
  customerMobile: z.string().optional(),
  pickupPoint: z.string().min(1),
  deliveryAddress: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  status: z.string().default("جديد"),
  priority: z.string().optional(),
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

export async function listOrders() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialOrders);

  try {
    return serviceOk(await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { partner: true, assignedDriver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceFallback(initialOrders);
  }
}

export async function getOrderById(id: string) {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialOrders.find((order) => order.id === id) ?? null);

  try {
    return serviceOk(await prisma.order.findFirst({ where: { OR: [{ id }, { internalRef: id }] }, include: { assignmentHistory: true, statusHistory: true, partner: true, assignedDriver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceFallback(initialOrders.find((order) => order.id === id) ?? null);
  }
}

export async function createOrder(input: unknown) {
  const parsed = orderInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.order.create({ data: parsed.data }));
  } catch {
    return serviceError(null);
  }
}

export async function updateOrderAssignment(id: string, input: unknown) {
  const parsed = assignmentInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.order.update({ where: { id }, data: { ...parsed.data, assignedAt: new Date() } }));
  } catch {
    return serviceError(null);
  }
}
