import { getPrismaClient } from "@/lib/db/prisma";
import { initialVehicles } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

export async function listVehicles() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialVehicles);

  try {
    return serviceOk(await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" }, include: { linkedDriver: true } }));
  } catch {
    return serviceError(initialVehicles);
  }
}
