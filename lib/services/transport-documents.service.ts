import { z } from "zod";
import { getPrismaClient } from "@/lib/db/prisma";
import { initialDocuments } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const documentDraftInput = z.object({
  internalDocumentNumber: z.string().min(1),
  type: z.string().min(1),
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  status: z.string().default("مسودة"),
  notes: z.string().optional()
});

export async function listTransportDocuments() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialDocuments);

  try {
    return serviceOk(await prisma.transportDocument.findMany({ orderBy: { createdAt: "desc" }, include: { partner: true, driver: true, vehicle: true } }));
  } catch {
    return serviceFallback(initialDocuments);
  }
}

export async function createTransportDocumentDraft(input: unknown) {
  const parsed = documentDraftInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(await prisma.transportDocument.create({ data: { ...parsed.data, bayanDocumentNumber: null } }));
  } catch {
    return serviceError(null);
  }
}
