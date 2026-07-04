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
    await prisma.permission.create({
      data: {
        key: permission,
        name: permission,
        description: "صلاحية تأسيسية للمرحلة الثانية"
      }
    });
  }

  for (const role of roles) {
    const createdRole = await prisma.role.create({
      data: {
        key: role.key,
        name: role.label,
        description: role.description
      }
    });

    const rolePermissions = rolePermissionMap[role.key] ?? [];
    for (const permissionKey of rolePermissions) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key: permissionKey } });
      await prisma.rolePermission.create({
        data: {
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
    const created = await prisma.partner.create({
      data: {
        externalId: partner.id,
        name: partner.name,
        type: partner.type,
        contactName: partner.contact,
        mobile: partner.phone,
        email: partner.email,
        city: partner.city,
        status: partner.status,
        contractType: partner.operation,
        notes: partner.notes,
        contacts: {
          create: {
            name: partner.contact,
            mobile: partner.phone,
            email: partner.email,
            role: "مسؤول التشغيل"
          }
        }
      }
    });
    partnerIds.set(partner.name, created.id);
  }

  for (const area of initialCoverageAreas) {
    const created = await prisma.coverageArea.create({
      data: {
        externalId: area.id,
        name: area.name,
        city: area.city,
        status: area.status,
        coverageType: area.areaType,
        capacity: area.capacity,
        notes: area.notes,
        neighborhoods: {
          create: area.neighborhoods.map((name) => ({ name }))
        },
        pickupPoints: {
          create: area.pickupPointIds.map((id) => ({
            name: id,
            city: area.city,
            status: "نشط"
          }))
        }
      }
    });
    areaIds.set(area.id, created.id);
    areaIds.set(area.name, created.id);
  }

  for (const driver of initialDrivers) {
    const created = await prisma.driver.create({
      data: {
        externalId: driver.id,
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
        notes: driver.notes,
        documents: {
          create: [
            { type: "الهوية", status: driver.identityStatus ?? "قيد المراجعة", fileUrl: driver.identityFile, notes: "ملف تجريبي" },
            { type: "الرخصة", status: driver.licenseStatus ?? "قيد المراجعة", fileUrl: driver.licenseFile, notes: "ملف تجريبي" },
            { type: "التأمين", status: driver.documentStatus ?? "قيد المراجعة", fileUrl: driver.insuranceFile, notes: "ملف تجريبي" }
          ]
        },
        agreements: {
          create: {
            type: driver.agreementType ?? driver.type,
            status: driver.contractStatus ?? "نشط",
            notes: "اتفاق تشغيلي تجريبي وليس نظام رواتب"
          }
        }
      }
    });
    driverIds.set(driver.id, created.id);
    driverIds.set(driver.name, created.id);
  }

  for (const vehicle of initialVehicles) {
    const plate = splitPlate(vehicle.plate);
    const linkedDriverId = vehicle.driver ? driverIds.get(vehicle.driver) : undefined;
    const created = await prisma.vehicle.create({
      data: {
        externalId: vehicle.id,
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
      }
    });
    vehicleIds.set(vehicle.id, created.id);
    vehicleIds.set(vehicle.plate, created.id);
  }

  for (const assignment of initialDriverAreaAssignments) {
    const driverId = driverIds.get(assignment.driverId);
    const areaId = areaIds.get(assignment.areaId);
    if (!driverId || !areaId) continue;
    await prisma.driverAreaAssignment.create({
      data: {
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
    const created = await prisma.order.create({
      data: {
        internalRef: order.id,
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
        notes: order.notes,
        assignmentHistory: {
          create: (order.assignmentHistory ?? []).map((item) => ({
            fromDriverName: item.fromDriver,
            toDriverName: item.toDriver,
            areaName: item.area,
            action: item.action,
            userName: item.user,
            note: item.note
          }))
        },
        statusHistory: {
          create: {
            status: order.status,
            notes: "حالة أولية من بيانات العرض"
          }
        }
      }
    });
    orderIds.set(order.id, created.id);
  }

  for (const parcel of initialParcels) {
    const created = await prisma.parcel.create({
      data: {
        internalRef: parcel.id,
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
        notes: parcel.notes,
        assignmentHistory: {
          create: (parcel.assignmentHistory ?? []).map((item) => ({
            fromDriverName: item.fromDriver,
            toDriverName: item.toDriver,
            areaName: item.area,
            action: item.action,
            userName: item.user,
            note: item.note
          }))
        },
        statusHistory: {
          create: {
            status: parcel.status,
            notes: "حالة أولية من بيانات العرض"
          }
        }
      }
    });
    parcelIds.set(parcel.id, created.id);
  }

  for (const order of initialOrders) {
    await prisma.dispatchTask.create({
      data: {
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
    await prisma.dispatchTask.create({
      data: {
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
    await prisma.deliveryAttempt.create({
      data: {
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
    await prisma.returnRequest.create({
      data: {
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
    await prisma.transportDocument.create({
      data: {
        internalDocumentNumber: document.id,
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
      }
    });
  }
}

async function seedPlatform() {
  const roleByKey = new Map((await prisma.role.findMany()).map((role) => [role.key, role.id]));
  const driver = await prisma.driver.findFirst();

  for (const role of roles) {
    const user = await prisma.user.create({
      data: {
        name: role.label,
        email: `${role.key}@azm.demo`,
        mobile: "0500000000",
        status: "نشط",
        driverId: role.key === "driver" ? driver?.id : undefined
      }
    });
    const roleId = roleByKey.get(role.key);
    if (roleId) {
      await prisma.userRole.create({ data: { userId: user.id, roleId } });
    }
  }

  await prisma.bayanIntegrationSetting.create({
    data: {
      mode: "not-configured",
      status: "غير مربوط",
      appIdMasked: "غير مضبوط",
      appKeyMasked: "غير مضبوط",
      notes: "لا توجد مزامنة فعلية ولا توجد بيانات اعتماد رسمية في هذه المرحلة"
    }
  });

  for (const log of initialActivityLogs) {
    await prisma.activityLog.create({
      data: {
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
  await resetDatabase();
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
