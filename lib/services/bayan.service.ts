import { getPrismaClient } from "@/lib/db/prisma";
import { bayanChecklistItems } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const demoBayanReadiness = {
  mode: "not-configured",
  status: "غير مربوط",
  appIdMasked: "غير مضبوط",
  appKeyMasked: "غير مضبوط",
  notes: "لا توجد مزامنة فعلية ولا توجد بيانات اعتماد رسمية",
  checklist: bayanChecklistItems
};

export async function getBayanReadinessSettings() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(demoBayanReadiness);

  try {
    const setting = await prisma.bayanIntegrationSetting.findFirst({ orderBy: { createdAt: "desc" } });
    return serviceOk(setting ?? demoBayanReadiness);
  } catch {
    return serviceError(demoBayanReadiness);
  }
}
