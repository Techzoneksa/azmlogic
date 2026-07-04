import { getPrismaClient } from "@/lib/db/prisma";
import { roles } from "@/lib/demo-data";
import { serviceError, serviceFallback, serviceOk } from "./service-response";

export async function listRoles() {
  const prisma = getPrismaClient();
  if (!prisma) return serviceFallback(roles);

  try {
    return serviceOk(await prisma.role.findMany({ orderBy: { name: "asc" }, include: { permissions: { include: { permission: true } } } }));
  } catch {
    return serviceError(roles);
  }
}

export async function getUserSessionFoundation(email: string) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return serviceFallback({
      user: null,
      roles,
      message: "اختيار الدور التجريبي مفعل"
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } }, driver: true }
    });
    return serviceOk(user);
  } catch {
    return serviceError(null);
  }
}
