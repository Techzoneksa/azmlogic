import { getPrismaClient } from "@/lib/db/prisma";
import { initialOrders, initialParcels } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

export async function listDispatchTasks() {
  const prisma = getPrismaClient();
  if (!prisma) {
    return serviceFallback([
      ...initialOrders.map((order) => ({ ...order, taskType: "order" })),
      ...initialParcels.map((parcel) => ({ ...parcel, taskType: "parcel" }))
    ]);
  }

  try {
    return serviceOk(await prisma.dispatchTask.findMany({ orderBy: { createdAt: "desc" }, include: { order: true, parcel: true, driver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceError([]);
  }
}
