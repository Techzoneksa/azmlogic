import { getPrismaClient } from "@/lib/db/prisma";
import { initialPartners } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

export async function listPartners() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialPartners);

  try {
    return serviceOk(await prisma.partner.findMany({ orderBy: { createdAt: "desc" }, include: { contacts: true } }));
  } catch {
    return serviceError(initialPartners);
  }
}
