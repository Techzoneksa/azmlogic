import { getPrismaClient } from "@/lib/db/prisma";
import { initialCoverageAreas } from "@/lib/demo-data";
import { serviceFallback, serviceOk } from "./service-response";

export async function listCoverageAreas() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialCoverageAreas);

  try {
    return serviceOk(await prisma.coverageArea.findMany({ orderBy: { createdAt: "desc" }, include: { neighborhoods: true, pickupPoints: true } }));
  } catch {
    return serviceFallback(initialCoverageAreas);
  }
}
