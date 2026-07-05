import { getPrismaClient } from "@/lib/db/prisma";
import { initialOrders, initialParcels } from "@/lib/demo-data";
import { serviceFallback, serviceOk } from "./service-response";

const demoDispatchTasks = [
  ...initialOrders.map((order) => ({ ...order, taskType: "order" })),
  ...initialParcels.map((parcel) => ({ ...parcel, taskType: "parcel" }))
];

export async function listDispatchTasks() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(demoDispatchTasks);

  try {
    return serviceOk(await prisma.dispatchTask.findMany({ orderBy: { createdAt: "desc" }, include: { order: true, parcel: true, driver: true, vehicle: true, coverageArea: true } }));
  } catch {
    return serviceFallback(demoDispatchTasks);
  }
}
