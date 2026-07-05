import { PrismaClient } from "@prisma/client";
import {
  initialActivityLogs,
  initialAttempts,
  initialCoverageAreas,
  initialDocuments,
  initialDriverAreaAssignments,
  initialDrivers,
  initialOrders,
  initialParcels,
  initialPartners,
  initialReturns,
  initialVehicles,
  roles
} from "../lib/demo-data";

const prisma = new PrismaClient();

const permissions = [
  "partners.read",
  "partners.write",
  "orders.read",
  "orders.write",
  "parcels.read",
  "parcels.write",
  "drivers.read",
  "drivers.write",
  "dispatch.manage",
  "bayan.readiness",
  "reports.read",
  "settings.manage"
];

const rolePermissionMap: Record<string, string[]> = {
  general: permissions,
  operations: permissions.filter((item) => item !== "settings.manage"),
  dispatcher: ["orders.read", "parcels.read", "drivers.read", "dispatch.manage"],
  compliance: ["drivers.read", "bayan.readiness", "reports.read"],
  driver: ["orders.read", "parcels.read"],
  reports: ["reports.read", "partners.read", "orders.read", "parcels.read", "drivers.read"]
};

function parseYear(value?: string) {
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

function splitPlate(plate: string) {
  const parts = plate.split(" ");
  return {
    plateRightLetter: parts[0] ?? null,
    plateMiddleLetter: parts[1] ?? null,
    plateLeftLetter: parts[2] ?? null,
    plateNumber: parts.slice(3).join("") || plate
  };
}

async function resetDatabase() {
  await prisma.activityLog.deleteMany();
  await prisma.bayanSyncLog.deleteMany();
  await prisma.bayanIntegrationSetting.deleteMany();
  await prisma.transportDocument.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.deliveryAttempt.deleteMany();
  await prisma.dispatchTask.deleteMany();
  await prisma.parcelStatusHistory.deleteMany();
  await prisma.parcelAssignmentHistory.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderAssignmentHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.areaPickupPoint.deleteMany();
  await prisma.areaNeighborhood.deleteMany();
  await prisma.driverAreaAssignment.deleteMany();
  await prisma.coverageArea.deleteMany();
  await prisma.vehicleAssignment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driverActivity.deleteMany();
  await prisma.driverAgreement.deleteMany();
  await prisma.driverDocument.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.partnerContract.deleteMany();
  await prisma.partnerContact.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
}

async function seedRoles() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission },
      update: {
        name: permission,
        description: "صلاحية تأسيسية للمرحلة الثانية"
      },
      create: {
        key: permission,
        name: permission,
        description: "صلاحية تأسيسية للمرحلة الثانية"
      }
    });
  }

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { key: role.key },
      update: {
        name: role.label,
        description: role.description
      },
      create: {
        key: role.key,
        name: role.label,
        description: role.description
      }
    });

    const rolePermissions = rolePermissionMap[role.key] ?? [];
    for (const permissionKey of rolePermissions) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key: permissionKey } });
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: createdRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: createdRole.id,
          permissionId: permission.id
        }
      });
    }
  }
}

async function seedCoreData() {
  const partnerIds = new Map<string, string>();
  const driverIds = new Map<string, string>();
  const vehicleIds = new Map<string, string>();
  const areaIds = new Map<string, string>();
  const orderIds = new Map<string, string>();
  const parcelIds = new Map<string, string>();

  for (const partner of initialPartners) {
    const created = await prisma.partner.upsert({
      where: { externalId: partner.id },
      update: {
        name: partner.name,
        type: partner.type,
        contactName: partner.contact,
        mobile: partner.phone,
        email: partner.email,
        city: partner.city,
        status: partner.status,
        contractType: partner.operation,
        notes: partner.notes
      },
      create: {
        externalId: partner.id,
        name: partner.name,
        type: partner.type,
        contactName: partner.contact,
        mobile: partner.phone,
        email: partner.email,
        city: partner.city,
        status: partner.status,
        contractType: partner.operation,
        notes: partner.notes
      }
    });
    await prisma.partnerContact.deleteMany({ where: { partnerId: created.id } });
    await prisma.partnerContact.create({
      data: {
        partnerId: created.id,
        name: partner.contact,
        mobile: partner.phone,
        email: partner.email,
        role: "مسؤول التشغيل"
      }
    });
    partnerIds.set(partner.name, created.id);
  }

  for (const area of initialCoverageAreas) {
    const created = await prisma.coverageArea.upsert({
      where: { externalId: area.id },
      update: {
        name: area.name,
        city: area.city,
        status: area.status,
        coverageType: area.areaType,
        capacity: area.capacity,
        notes: area.notes
      },
      create: {
        externalId: area.id,
        name: area.name,
        city: area.city,
        status: area.status,
        coverageType: area.areaType,
        capacity: area.capacity,
        notes: area.notes
      }
    });
    await prisma.areaNeighborhood.deleteMany({ where: { areaId: created.id } });
    await prisma.areaPickupPoint.deleteMany({ where: { areaId: created.id } });
    await prisma.areaNeighborhood.createMany({
      data: area.neighborhoods.map((name) => ({ areaId: created.id, name }))
    });
    await prisma.areaPickupPoint.createMany({
      data: area.pickupPointIds.map((id) => ({
        areaId: created.id,
        name: id,
        city: area.city,
        status: "نشط"
      }))
    });
    areaIds.set(area.id, created.id);
    areaIds.set(area.name, created.id);
  }

  for (const driver of initialDrivers) {
    const driverData = {
      fullName: driver.fullName ?? driver.name,
      mobile: driver.mobile ?? driver.phone,
      identityNumber: driver.identityNumber ?? driver.nationalId,
      identityType: driver.identityType,
      nationality: driver.nationality,
      age: driver.age,
      email: driver.email,
      city: driver.city,
      address: driver.address,
      emergencyContactName: driver.emergencyContactName ?? driver.emergencyContact,
      emergencyContactMobile: driver.emergencyContactMobile,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseStatus: driver.licenseStatus,
      identityStatus: driver.identityStatus,
      agreementType: driver.agreementType ?? driver.type,
      baseSalary: driver.baseSalary,
      commissionPerOrder: driver.commissionPerOrder,
      commissionPerParcel: driver.commissionPerParcel,
      dailyMinimum: driver.dailyMinimum,
      contractStatus: driver.contractStatus,
      workType: driver.workType,
      workHours: driver.workHours,
      workDays: driver.workDays,
      offDays: driver.offDays,
      primaryAreaId: driver.primaryAreaId ? areaIds.get(driver.primaryAreaId) : undefined,
      driverStatus: driver.driverStatus ?? driver.status,
      readinessScore: driver.readinessScore ?? driver.readinessRate,
      notes: driver.notes
    };
    const created = await prisma.driver.upsert({
      where: { externalId: driver.id },
      update: driverData,
      create: {
        externalId: driver.id,
        ...driverData
      }
    });
    await prisma.driverDocument.deleteMany({ where: { driverId: created.id } });
    await prisma.driverAgreement.deleteMany({ where: { driverId: created.id } });
    await prisma.driverDocument.createMany({
      data: [
        { driverId: created.id, type: "الهوية", status: driver.identityStatus ?? "قيد المراجعة", fileUrl: driver.identityFile, notes: "ملف تجريبي" },
        { driverId: created.id, type: "الرخصة", status: driver.licenseStatus ?? "قيد المراجعة", fileUrl: driver.licenseFile, notes: "ملف تجريبي" },
        { driverId: created.id, type: "التأمين", status: driver.documentStatus ?? "قيد المراجعة", fileUrl: driver.insuranceFile, notes: "ملف تجريبي" }
      ]
    });
    await prisma.driverAgreement.create({
      data: {
        driverId: created.id,
        type: driver.agreementType ?? driver.type,
        status: driver.contractStatus ?? "نشط",
        notes: "اتفاق تشغيلي تجريبي وليس نظام رواتب"
      }
    });
    driverIds.set(driver.id, created.id);
    driverIds.set(driver.name, created.id);
  }

  for (const vehicle of initialVehicles) {
    const plate = splitPlate(vehicle.plate);
    const linkedDriverId = vehicle.driver ? driverIds.get(vehicle.driver) : undefined;
    const vehicleData = {
      plateNumber: plate.plateNumber,
      plateRightLetter: plate.plateRightLetter,
      plateMiddleLetter: plate.plateMiddleLetter,
      plateLeftLetter: plate.plateLeftLetter,
      vehicleType: vehicle.type,
      model: vehicle.model,
      year: parseYear(vehicle.year),
      status: vehicle.status,
      insuranceStatus: vehicle.insurance,
      registrationStatus: vehicle.registration,
      inspectionStatus: vehicle.inspection,
      linkedDriverId,
      notes: vehicle.notes
    };
    const created = await prisma.vehicle.upsert({
      where: { externalId: vehicle.id },
      update: vehicleData,
      create: {
        externalId: vehicle.id,
        ...vehicleData
      }
    });
    vehicleIds.set(vehicle.id, created.id);
    vehicleIds.set(vehicle.plate, created.id);
  }

  for (const assignment of initialDriverAreaAssignments) {
    const driverId = driverIds.get(assignment.driverId);
    const areaId = areaIds.get(assignment.areaId);
    if (!driverId || !areaId) continue;
    await prisma.driverAreaAssignment.upsert({
      where: {
        driverId_areaId: {
          driverId,
          areaId
        }
      },
      update: {
        coverageType: assignment.coverageType,
        timeWindow: assignment.timeWindow,
        priority: assignment.priority,
        notes: assignment.notes
      },
      create: {
        driverId,
        areaId,
        coverageType: assignment.coverageType,
        timeWindow: assignment.timeWindow,
        priority: assignment.priority,
        notes: assignment.notes
      }
    });
  }

  for (const order of initialOrders) {
    const orderData = {
      partnerOrderRef: order.partnerRef,
      partnerId: partnerIds.get(order.partner),
      orderType: order.type,
      customerName: order.customer,
      customerMobile: order.phone,
      pickupPoint: order.pickup,
      deliveryAddress: order.delivery,
      city: order.city,
      district: order.district,
      coverageAreaId: order.coverageAreaId ? areaIds.get(order.coverageAreaId) : undefined,
      assignedDriverId: order.assignedDriverId ? driverIds.get(order.assignedDriverId) : driverIds.get(order.driver),
      vehicleId: order.vehicleId ? vehicleIds.get(order.vehicleId) : vehicleIds.get(order.vehicle),
      assignmentStatus: order.assignmentStatus,
      status: order.status,
      priority: order.priority,
      assignedBy: order.assignedBy,
      isDriverInArea: Boolean(order.isDriverInArea),
      reassignmentRequired: Boolean(order.reassignmentRequired),
      notes: order.notes
    };
    const created = await prisma.order.upsert({
      where: { internalRef: order.id },
      update: orderData,
      create: {
        internalRef: order.id,
        ...orderData
      }
    });
    await prisma.orderAssignmentHistory.deleteMany({ where: { orderId: created.id } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: created.id } });
    await prisma.orderAssignmentHistory.createMany({
      data: (order.assignmentHistory ?? []).map((item) => ({
        orderId: created.id,
        fromDriverName: item.fromDriver,
        toDriverName: item.toDriver,
        areaName: item.area,
        action: item.action,
        userName: item.user,
        note: item.note
      }))
    });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: created.id,
        status: order.status,
        notes: "حالة أولية من بيانات العرض"
      }
    });
    orderIds.set(order.id, created.id);
  }

  for (const parcel of initialParcels) {
    const parcelData = {
      partnerParcelRef: parcel.tracking,
      partnerId: partnerIds.get(parcel.partner),
      recipientName: parcel.customer,
      recipientMobile: parcel.phone,
      pickupPoint: parcel.pickup,
      deliveryAddress: parcel.delivery,
      city: parcel.city,
      district: parcel.district,
      coverageAreaId: parcel.coverageAreaId ? areaIds.get(parcel.coverageAreaId) : undefined,
      assignedDriverId: parcel.assignedDriverId ? driverIds.get(parcel.assignedDriverId) : driverIds.get(parcel.driver),
      vehicleId: parcel.vehicleId ? vehicleIds.get(parcel.vehicleId) : vehicleIds.get(parcel.vehicle),
      assignmentStatus: parcel.assignmentStatus,
      status: parcel.status,
      weight: parcel.weight,
      pieces: parcel.pieces,
      fragile: parcel.fragile === "نعم",
      requiresSignature: parcel.signature === "نعم",
      proofOfDeliveryMethod: parcel.proof,
      assignedBy: parcel.assignedBy,
      isDriverInArea: Boolean(parcel.isDriverInArea),
      reassignmentRequired: Boolean(parcel.reassignmentRequired),
      notes: parcel.notes
    };
    const created = await prisma.parcel.upsert({
      where: { internalRef: parcel.id },
      update: parcelData,
      create: {
        internalRef: parcel.id,
        ...parcelData
      }
    });
    await prisma.parcelAssignmentHistory.deleteMany({ where: { parcelId: created.id } });
    await prisma.parcelStatusHistory.deleteMany({ where: { parcelId: created.id } });
    await prisma.parcelAssignmentHistory.createMany({
      data: (parcel.assignmentHistory ?? []).map((item) => ({
        parcelId: created.id,
        fromDriverName: item.fromDriver,
        toDriverName: item.toDriver,
        areaName: item.area,
        action: item.action,
        userName: item.user,
        note: item.note
      }))
    });
    await prisma.parcelStatusHistory.create({
      data: {
        parcelId: created.id,
        status: parcel.status,
        notes: "حالة أولية من بيانات العرض"
      }
    });
    parcelIds.set(parcel.id, created.id);
  }

  for (const order of initialOrders) {
    await prisma.dispatchTask.upsert({
      where: { externalId: `dispatch-${order.id}` },
      update: {
        taskType: "order",
        orderId: orderIds.get(order.id),
        driverId: order.assignedDriverId ? driverIds.get(order.assignedDriverId) : driverIds.get(order.driver),
        vehicleId: order.vehicleId ? vehicleIds.get(order.vehicleId) : vehicleIds.get(order.vehicle),
        coverageAreaId: order.coverageAreaId ? areaIds.get(order.coverageAreaId) : undefined,
        status: order.status,
        priority: order.priority,
        notes: order.notes
      },
      create: {
        externalId: `dispatch-${order.id}`,
        taskType: "order",
        orderId: orderIds.get(order.id),
        driverId: order.assignedDriverId ? driverIds.get(order.assignedDriverId) : driverIds.get(order.driver),
        vehicleId: order.vehicleId ? vehicleIds.get(order.vehicleId) : vehicleIds.get(order.vehicle),
        coverageAreaId: order.coverageAreaId ? areaIds.get(order.coverageAreaId) : undefined,
        status: order.status,
        priority: order.priority,
        notes: order.notes
      }
    });
  }

  for (const parcel of initialParcels) {
    await prisma.dispatchTask.upsert({
      where: { externalId: `dispatch-${parcel.id}` },
      update: {
        taskType: "parcel",
        parcelId: parcelIds.get(parcel.id),
        driverId: parcel.assignedDriverId ? driverIds.get(parcel.assignedDriverId) : driverIds.get(parcel.driver),
        vehicleId: parcel.vehicleId ? vehicleIds.get(parcel.vehicleId) : vehicleIds.get(parcel.vehicle),
        coverageAreaId: parcel.coverageAreaId ? areaIds.get(parcel.coverageAreaId) : undefined,
        status: parcel.status,
        notes: parcel.notes
      },
      create: {
        externalId: `dispatch-${parcel.id}`,
        taskType: "parcel",
        parcelId: parcelIds.get(parcel.id),
        driverId: parcel.assignedDriverId ? driverIds.get(parcel.assignedDriverId) : driverIds.get(parcel.driver),
        vehicleId: parcel.vehicleId ? vehicleIds.get(parcel.vehicleId) : vehicleIds.get(parcel.vehicle),
        coverageAreaId: parcel.coverageAreaId ? areaIds.get(parcel.coverageAreaId) : undefined,
        status: parcel.status,
        notes: parcel.notes
      }
    });
  }

  for (const attempt of initialAttempts) {
    await prisma.deliveryAttempt.upsert({
      where: { externalId: attempt.id },
      update: {
        orderId: orderIds.get(attempt.taskId),
        parcelId: parcelIds.get(attempt.taskId),
        driverId: driverIds.get(attempt.driver),
        reason: attempt.reason,
        status: attempt.result,
        notes: attempt.notes,
        proof: attempt.proof
      },
      create: {
        externalId: attempt.id,
        orderId: orderIds.get(attempt.taskId),
        parcelId: parcelIds.get(attempt.taskId),
        driverId: driverIds.get(attempt.driver),
        reason: attempt.reason,
        status: attempt.result,
        notes: attempt.notes,
        proof: attempt.proof
      }
    });
  }

  for (const returnRecord of initialReturns) {
    await prisma.returnRequest.upsert({
      where: { externalId: returnRecord.id },
      update: {
        orderId: orderIds.get(returnRecord.taskId),
        parcelId: parcelIds.get(returnRecord.taskId),
        driverId: driverIds.get(returnRecord.driver),
        reason: returnRecord.reason,
        status: returnRecord.status,
        point: returnRecord.point,
        notes: returnRecord.notes
      },
      create: {
        externalId: returnRecord.id,
        orderId: orderIds.get(returnRecord.taskId),
        parcelId: parcelIds.get(returnRecord.taskId),
        driverId: driverIds.get(returnRecord.driver),
        reason: returnRecord.reason,
        status: returnRecord.status,
        point: returnRecord.point,
        notes: returnRecord.notes
      }
    });
  }

  for (const document of initialDocuments) {
    const documentData = {
      type: document.type,
      linkedOrderId: orderIds.get(document.taskId),
      linkedParcelId: parcelIds.get(document.taskId),
      partnerId: partnerIds.get(document.partner),
      senderName: document.sender,
      recipientName: document.receiver,
      origin: document.origin,
      destination: document.destination,
      vehicleId: vehicleIds.get(document.vehicle),
      driverId: driverIds.get(document.driver),
      cargoDescription: document.cargo,
      pieces: document.pieces,
      weight: document.weight,
      status: document.status,
      bayanDocumentNumber: null,
      issuingEntity: "مسودة داخلية",
      notes: document.notes
    };
    await prisma.transportDocument.upsert({
      where: { internalDocumentNumber: document.id },
      update: documentData,
      create: {
        internalDocumentNumber: document.id,
        ...documentData
      }
    });
  }
}

async function seedPlatform() {
  const roleByKey = new Map((await prisma.role.findMany()).map((role) => [role.key, role.id]));
  const driver = await prisma.driver.findFirst();

  for (const role of roles) {
    const user = await prisma.user.upsert({
      where: { email: `${role.key}@azm.demo` },
      update: {
        name: role.label,
        mobile: "0500000000",
        status: "نشط",
        driverId: role.key === "driver" ? driver?.id : undefined
      },
      create: {
        name: role.label,
        email: `${role.key}@azm.demo`,
        mobile: "0500000000",
        status: "نشط",
        driverId: role.key === "driver" ? driver?.id : undefined
      }
    });
    const roleId = roleByKey.get(role.key);
    if (roleId) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId
          }
        },
        update: {},
        create: { userId: user.id, roleId }
      });
    }
  }

  await prisma.bayanIntegrationSetting.upsert({
    where: { id: "bayan-default" },
    update: {
      mode: "not-configured",
      status: "غير مربوط",
      appIdMasked: "غير مضبوط",
      appKeyMasked: "غير مضبوط",
      notes: "لا توجد مزامنة فعلية ولا توجد بيانات اعتماد رسمية في هذه المرحلة"
    },
    create: {
      id: "bayan-default",
      mode: "not-configured",
      status: "غير مربوط",
      appIdMasked: "غير مضبوط",
      appKeyMasked: "غير مضبوط",
      notes: "لا توجد مزامنة فعلية ولا توجد بيانات اعتماد رسمية في هذه المرحلة"
    }
  });

  for (const log of initialActivityLogs) {
    await prisma.activityLog.upsert({
      where: { externalId: log.id },
      update: {
        entityType: "demo",
        entityId: log.related,
        action: log.action,
        description: log.notes,
        metadataJson: {
          status: log.status,
          user: log.user,
          time: log.time
        }
      },
      create: {
        externalId: log.id,
        entityType: "demo",
        entityId: log.related,
        action: log.action,
        description: log.notes,
        metadataJson: {
          status: log.status,
          user: log.user,
          time: log.time
        }
      }
    });
  }
}

async function main() {
  if (process.env.AZM_SEED_RESET === "true") {
    await resetDatabase();
  }
  await seedRoles();
  await seedCoreData();
  await seedPlatform();
  console.log("تم تجهيز بيانات عزم التجريبية للمرحلة الثانية.");
}

main()
  .catch((error) => {
    console.error("تعذر تجهيز بيانات المرحلة الثانية.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
