import { NextRequest, NextResponse } from "next/server";
import { getDataMode, dataModeLabel } from "@/lib/db/data-mode";
import { addActivityLog, listActivityLogs } from "@/lib/services/activity-log.service";
import { getUserSessionFoundation, listRoles } from "@/lib/services/auth.service";
import { getBayanReadinessSettings } from "@/lib/services/bayan.service";
import { listCoverageAreas } from "@/lib/services/coverage-areas.service";
import { getDashboardSummary } from "@/lib/services/dashboard.service";
import { createDriver, getDriverById, listDrivers, updateDriver } from "@/lib/services/drivers.service";
import { listDispatchTasks } from "@/lib/services/dispatch.service";
import { createOrder, getOrderById, listOrders, updateOrderAssignment } from "@/lib/services/orders.service";
import { createParcel, getParcelById, listParcels, updateParcelAssignment } from "@/lib/services/parcels.service";
import { listPartners } from "@/lib/services/partners.service";
import { createTransportDocumentDraft, listTransportDocuments } from "@/lib/services/transport-documents.service";
import { listVehicles } from "@/lib/services/vehicles.service";

type RouteContext = {
  params: Promise<{
    resource?: string[];
  }>;
};

function apiJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function notFound() {
  return apiJson(
    {
      ok: false,
      message: "لا توجد سجلات",
      mode: getDataMode()
    },
    404
  );
}

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const parts = (await context.params).resource ?? [];
  const [resource, id, action] = parts;

  if (!resource || resource === "status") {
    return apiJson({
      ok: true,
      mode: getDataMode(),
      label: dataModeLabel()
    });
  }

  if (resource === "dashboard") return apiJson(await getDashboardSummary());
  if (resource === "partners") return apiJson(await listPartners());
  if (resource === "drivers") return apiJson(id ? await getDriverById(id) : await listDrivers());
  if (resource === "vehicles") return apiJson(await listVehicles());
  if (resource === "coverage-areas") return apiJson(await listCoverageAreas());
  if (resource === "orders") return apiJson(id ? await getOrderById(id) : await listOrders());
  if (resource === "parcels") return apiJson(id ? await getParcelById(id) : await listParcels());
  if (resource === "dispatch") return apiJson(await listDispatchTasks());
  if (resource === "transport-documents") return apiJson(await listTransportDocuments());
  if (resource === "bayan-readiness") return apiJson(await getBayanReadinessSettings());
  if (resource === "activity-logs") return apiJson(await listActivityLogs());
  if (resource === "roles") return apiJson(await listRoles());

  if (resource === "session" && id === "foundation") {
    const email = request.nextUrl.searchParams.get("email") ?? "";
    return apiJson(await getUserSessionFoundation(email));
  }

  if ((resource === "orders" || resource === "parcels") && action === "assignment") {
    return notFound();
  }

  return notFound();
}

export async function POST(request: NextRequest, context: RouteContext) {
  const parts = (await context.params).resource ?? [];
  const [resource] = parts;
  const body = await readJson(request);

  if (resource === "drivers") return apiJson(await createDriver(body), 201);
  if (resource === "orders") return apiJson(await createOrder(body), 201);
  if (resource === "parcels") return apiJson(await createParcel(body), 201);
  if (resource === "transport-documents") return apiJson(await createTransportDocumentDraft(body), 201);
  if (resource === "activity-logs") return apiJson(await addActivityLog(body), 201);

  return notFound();
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const parts = (await context.params).resource ?? [];
  const [resource, id, action] = parts;
  const body = await readJson(request);

  if (!id) return notFound();
  if (resource === "drivers") return apiJson(await updateDriver(id, body));
  if (resource === "orders" && action === "assignment") return apiJson(await updateOrderAssignment(id, body));
  if (resource === "parcels" && action === "assignment") return apiJson(await updateParcelAssignment(id, body));

  return notFound();
}
