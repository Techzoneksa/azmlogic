import { getPrismaClient } from "@/lib/db/prisma";
import { initialDrivers, initialOrders, initialParcels, initialPartners } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

export async function getDashboardSummary() {
  const prisma = getPrismaClient();
  if (!prisma) {
    return serviceFallback({
      partners: initialPartners.length,
      drivers: initialDrivers.length,
      orders: initialOrders.length,
      parcels: initialParcels.length
    });
  }

  try {
    const [partners, drivers, orders, parcels] = await Promise.all([
      prisma.partner.count(),
      prisma.driver.count(),
      prisma.order.count(),
      prisma.parcel.count()
    ]);
    return serviceOk({ partners, drivers, orders, parcels });
  } catch {
    return serviceError({
      partners: initialPartners.length,
      drivers: initialDrivers.length,
      orders: initialOrders.length,
      parcels: initialParcels.length
    });
  }
}
