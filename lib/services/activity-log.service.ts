import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/db/prisma";
import { initialActivityLogs } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

const activityInput = z.object({
  userId: z.string().optional(),
  entityType: z.string().min(1),
  entityId: z.string().optional(),
  action: z.string().min(1),
  description: z.string().min(1),
  metadataJson: z.record(z.string(), z.unknown()).optional()
});

export async function listActivityLogs() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(initialActivityLogs);

  try {
    return serviceOk(await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: true } }));
  } catch {
    return serviceError(initialActivityLogs);
  }
}

export async function addActivityLog(input: unknown) {
  const parsed = activityInput.safeParse(input);
  if (!parsed.success) return serviceError(null);

  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(null);

  try {
    return serviceOk(
      await prisma.activityLog.create({
        data: {
          entityType: parsed.data.entityType,
          entityId: parsed.data.entityId,
          action: parsed.data.action,
          description: parsed.data.description,
          metadataJson: parsed.data.metadataJson as Prisma.InputJsonObject | undefined,
          user: parsed.data.userId ? { connect: { id: parsed.data.userId } } : undefined
        }
      })
    );
  } catch {
    return serviceError(null);
  }
}
