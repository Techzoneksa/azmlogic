"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  ClipboardPlus,
  Download,
  Eye,
  FileText,
  Filter,
  Home,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  LucideIcon,
  MapPinned,
  MoreHorizontal,
  Navigation,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  X
} from "lucide-react";
import {
  ActivityLog,
  CoverageArea,
  DeliveryAttempt,
  Driver,
  DriverAreaAssignment,
  Order,
  Parcel,
  Partner,
  PickupPoint,
  ReturnRecord,
  RoleKey,
  TransportDocument,
  Vehicle,
  bayanChecklistItems,
  cities,
  initialActivityLogs,
  initialAttempts,
  initialCoverageAreas,
  initialDriverAreaAssignments,
  initialDocuments,
  initialDrivers,
  initialOrders,
  initialParcels,
  initialPartners,
  initialPickupPoints,
  initialReturns,
  initialVehicles,
  orderStatuses,
  partnerTypes,
  roles
} from "@/lib/demo-data";

type Field = {
  label: string;
  value: string;
};

type Row = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  href: string;
  fields: Field[];
};

type Toast = {
  id: number;
  message: string;
};

type DrawerState = {
  title: string;
  subtitle: string;
  status: string;
  fields: Field[];
};

type ConfirmState = {
  title: string;
  message: string;
  label: string;
  onConfirm: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type AssignmentMeta = {
  coverageAreaId: string;
  coverageAreaName: string;
  assignedDriverId: string;
  assignedDriverName: string;
  vehicleId: string;
  vehicleLabel: string;
  assignmentStatus: string;
  relationship: string;
  assignedAt: string;
  assignedBy: string;
  reassignmentRequired: boolean;
};

type OperationalRow = Row & {
  kind: "order" | "parcel";
  city: string;
  district: string;
  partner: string;
  taskType: string;
  assignedDriverId: string;
  coverageAreaId: string;
  assignmentStatus: string;
  relationship: string;
  vehicleLabel: string;
  due: string;
  actionLabel: string;
  weight?: string;
  pieces?: string;
};

type DriverFormDraft = {
  name: string;
  phone: string;
  nationalId: string;
  identityType: string;
  nationality: string;
  birthDate: string;
  age: string;
  email: string;
  city: string;
  address: string;
  emergencyContactName: string;
  emergencyContactMobile: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseStatus: string;
  identityExpiryDate: string;
  identityStatus: string;
  agreementType: string;
  baseSalary: string;
  commissionPerOrder: string;
  commissionPerParcel: string;
  dailyMinimum: string;
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: string;
  workType: string;
  workHours: string;
  workDays: string;
  offDays: string;
  type: string;
  primaryAreaId: string;
  secondaryAreaIds: string;
  coverageType: string;
  coverageTime: string;
  vehicleId: string;
  vehicle: string;
  status: string;
  reviewReason: string;
  notes: string;
};

const numberFormatter = new Intl.NumberFormat("ar-SA");

const operationsNav: NavItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/partners", label: "الشركاء", icon: Users },
  { href: "/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/parcels", label: "الطرود", icon: Package },
  { href: "/dispatch", label: "لوحة التوزيع", icon: Send },
  { href: "/drivers", label: "المناديب", icon: UserRound },
  { href: "/coverage-areas", label: "المناطق والتغطية", icon: MapPinned },
  { href: "/vehicles", label: "المركبات", icon: Car },
  { href: "/pickup-points", label: "نقاط الاستلام", icon: MapPinned },
  { href: "/delivery-attempts", label: "محاولات التسليم", icon: ClipboardCheck },
  { href: "/returns", label: "المرتجعات", icon: RotateCcw },
  { href: "/transport-documents", label: "وثائق النقل", icon: FileText },
  { href: "/bayan-readiness", label: "جاهزية بيان", icon: ShieldCheck },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/activity-log", label: "سجل الأنشطة", icon: Activity },
  { href: "/settings", label: "الإعدادات", icon: Settings }
];

const navByHref = (href: string) => operationsNav.find((item) => item.href === href)!;

const operationsNavGroups: NavGroup[] = [
  {
    label: "التشغيل",
    items: ["/dashboard", "/partners", "/orders", "/parcels", "/dispatch"].map(navByHref)
  },
  {
    label: "الموارد الميدانية",
    items: ["/drivers", "/coverage-areas", "/vehicles", "/pickup-points"].map(navByHref)
  },
  {
    label: "المتابعة والامتثال",
    items: ["/delivery-attempts", "/returns", "/transport-documents", "/bayan-readiness"].map(navByHref)
  },
  {
    label: "النظام",
    items: ["/reports", "/activity-log", "/settings"].map(navByHref)
  }
];

const operationsBottomNav: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/orders", label: "المهام", icon: ClipboardList },
  { href: "/dispatch", label: "التوزيع", icon: Send },
  { href: "/coverage-areas", label: "المناطق", icon: MapPinned },
  { href: "/settings", label: "المزيد", icon: MoreHorizontal }
];

const driverBottomNav: NavItem[] = [
  { href: "/driver", label: "الرئيسية", icon: Home },
  { href: "/driver/tasks", label: "مهامي", icon: ClipboardList },
  { href: "/driver/tasks", label: "المسار", icon: Route },
  { href: "/driver", label: "الإشعارات", icon: Bell },
  { href: "/driver", label: "حسابي", icon: UserRound }
];

function ar(value: number) {
  return numberFormatter.format(value);
}

function percent(value: number) {
  return `${ar(value)}٪`;
}

function safe(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return "غير محدد";
  }
  if (typeof value === "number") {
    return ar(value);
  }
  return value;
}

function statusTone(status: string) {
  if (/(تم التسليم|ناجح|نشط|نشطة|جاهزة|جاهز|ساري|مقبولة|مربوط)/.test(status)) {
    return "green";
  }
  if (/(قيد|جديد|خارج|مسند|مستلم|مسودة)/.test(status)) {
    return "blue";
  }
  if (/(متأخر|انتظار|بانتظار|مراجعة|ناقصة|تجهيز|يحتاج|ينتهي)/.test(status)) {
    return "amber";
  }
  if (/(تعذر|فشل|مرفوض|ملغي|صيانة|موقوف|متوقف|غير متاح)/.test(status)) {
    return "red";
  }
  if (/(مرتجع|إرجاع)/.test(status)) {
    return "purple";
  }
  return "";
}

function Badge({ children }: { children: ReactNode }) {
  const text = String(children);
  return <span className={`badge ${statusTone(text)}`}>{children}</span>;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function pageTitle(pathname: string) {
  const clean = pathname === "/" ? "/dashboard" : pathname;
  const exact: Record<string, string> = {
    "/login": "تسجيل الدخول",
    "/dashboard": "لوحة التحكم",
    "/partners": "الشركاء",
    "/partners/new": "إضافة شريك",
    "/orders": "الطلبات",
    "/orders/new": "إضافة طلب",
    "/parcels": "الطرود",
    "/parcels/new": "إضافة طرد",
    "/dispatch": "لوحة التوزيع",
    "/drivers": "المناديب",
    "/coverage-areas": "المناطق والتغطية",
    "/coverage-areas/new": "إضافة منطقة تغطية",
    "/vehicles": "المركبات",
    "/pickup-points": "نقاط الاستلام",
    "/delivery-attempts": "محاولات التسليم",
    "/returns": "المرتجعات",
    "/transport-documents": "وثائق النقل",
    "/bayan-readiness": "جاهزية الربط مع بيان",
    "/reports": "التقارير",
    "/activity-log": "سجل الأنشطة",
    "/settings": "الإعدادات",
    "/driver": "تطبيق المندوب",
    "/driver/tasks": "مهامي"
  };
  if (exact[clean]) return exact[clean];
  if (clean.startsWith("/partners/")) return "ملف الشريك";
  if (clean.startsWith("/orders/")) return "تفاصيل الطلب";
  if (clean.startsWith("/parcels/")) return "تفاصيل الطرد";
  if (clean.startsWith("/drivers/")) return "ملف المندوب";
  if (clean.startsWith("/coverage-areas/")) return "ملف منطقة التغطية";
  if (clean.startsWith("/vehicles/")) return "ملف المركبة";
  if (clean.startsWith("/transport-documents/")) return "تفاصيل وثيقة النقل";
  if (clean.startsWith("/driver/task/")) return "تفاصيل المهمة";
  return "لوحة التحكم";
}

function field(label: string, value: string | number | undefined | null): Field {
  return { label, value: safe(value) };
}

function routeId(id: string) {
  return encodeURIComponent(id);
}

export function OperationsApp() {
  const router = useRouter();
  const pathname = decodePath(usePathname());
  const activePath = pathname === "/" ? "/dashboard" : pathname;
  const [role, setRole] = useState<RoleKey>("general");
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [parcels, setParcels] = useState<Parcel[]>(initialParcels);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>(initialCoverageAreas);
  const [driverAreaAssignments, setDriverAreaAssignments] = useState<DriverAreaAssignment[]>(initialDriverAreaAssignments);
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [pickupPoints] = useState<PickupPoint[]>(initialPickupPoints);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>(initialAttempts);
  const [returns, setReturns] = useState<ReturnRecord[]>(initialReturns);
  const [documents, setDocuments] = useState<TransportDocument[]>(initialDocuments);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [partnerFilter, setPartnerFilter] = useState("الكل");
  const [cityFilter, setCityFilter] = useState("الكل");
  const [areaFilter, setAreaFilter] = useState("الكل");
  const [districtFilter, setDistrictFilter] = useState("الكل");
  const [driverFilter, setDriverFilter] = useState("الكل");
  const [assignmentFilter, setAssignmentFilter] = useState("الكل");
  const [taskStatusFilter, setTaskStatusFilter] = useState("الكل");
  const [taskKindFilter, setTaskKindFilter] = useState("الكل");
  const [driverCityFilter, setDriverCityFilter] = useState("الكل");
  const [driverAreaFilter, setDriverAreaFilter] = useState("الكل");
  const [driverIdentityFilter, setDriverIdentityFilter] = useState("الكل");
  const [driverLicenseFilter, setDriverLicenseFilter] = useState("الكل");
  const [driverContractFilter, setDriverContractFilter] = useState("الكل");
  const [driverAgreementFilter, setDriverAgreementFilter] = useState("الكل");
  const [driverTypeFilter, setDriverTypeFilter] = useState("الكل");
  const [driverVehicleFilter, setDriverVehicleFilter] = useState("الكل");
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(bayanChecklistItems.map((item, index) => [item, index < 6]))
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("azm-demo-role") as RoleKey | null;
    if (saved && roles.some((item) => item.key === saved)) {
      setRole(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("azm-demo-role", role);
  }, [role]);

  const roleLabel = roles.find((item) => item.key === role)?.label ?? "المدير العام";

  function toast(message: string) {
    const id = Date.now();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }

  function addLog(action: string, related: string, notes: string, status = "ناجح") {
    setActivityLogs((current) => [
      {
        id: `س-${ar(current.length + 701)}`,
        user: roleLabel,
        action,
        time: "الآن",
        related,
        status,
        notes
      },
      ...current
    ]);
  }

  function updateTaskStatus(taskId: string, status: string) {
    const found = orders.some((order) => order.id === taskId) || parcels.some((parcel) => parcel.id === taskId);
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== taskId) return order;
        return { ...order, status };
      })
    );
    setParcels((current) =>
      current.map((parcel) => {
        if (parcel.id !== taskId) return parcel;
        return { ...parcel, status };
      })
    );
    if (found) {
      toast("تم تحديث حالة المهمة");
      addLog("تغيير حالة", taskId, `تم تحديث الحالة إلى ${status}`);
    }
  }

  function assignTask(taskId: string, driverName: string) {
    const driver = drivers.find((item) => item.name === driverName) ?? drivers[0];
    const vehicle = vehicles.find((item) => item.id === driver.vehicleId || item.plate === driver.vehicle);
    const buildHistory = (task: Order | Parcel, previousDriver: string) => {
      const areaId = task.coverageAreaId ?? areaForLocation(task.city, task.district);
      const inArea = driverCoversArea(driver.id, areaId);
      return [
        ...(task.assignmentHistory ?? assignmentHistoryFor(task)),
        {
          time: "الآن",
          user: roleLabel,
          action: previousDriver && !previousDriver.includes("غير") ? "تمت إعادة الإسناد" : "تم إسناد مندوب",
          fromDriver: previousDriver || "غير مسند",
          toDriver: driver.name,
          area: areaName(areaId),
          note: inArea ? "المندوب داخل منطقة التغطية" : "تم الإسناد خارج النطاق مع ملاحظة تشغيلية"
        }
      ];
    };
    setOrders((current) =>
      current.map((order) =>
        order.id === taskId
          ? {
              ...order,
              driver: driver.name,
              vehicle: vehicle?.plate ?? driver.vehicle,
              assignedDriverId: driver.id,
              vehicleId: vehicle?.id ?? driver.vehicleId,
              assignmentStatus: driverCoversArea(driver.id, order.coverageAreaId ?? areaForLocation(order.city, order.district)) ? "مسند" : "خارج نطاق المندوب",
              assignedAt: "الآن",
              assignedBy: roleLabel,
              isDriverInArea: driverCoversArea(driver.id, order.coverageAreaId ?? areaForLocation(order.city, order.district)),
              reassignmentRequired: !driverCoversArea(driver.id, order.coverageAreaId ?? areaForLocation(order.city, order.district)),
              assignmentHistory: buildHistory(order, order.driver),
              status: order.status === "جديد" ? "مسند إلى مندوب" : order.status
            }
          : order
      )
    );
    setParcels((current) =>
      current.map((parcel) =>
        parcel.id === taskId
          ? {
              ...parcel,
              driver: driver.name,
              vehicle: vehicle?.plate ?? driver.vehicle,
              assignedDriverId: driver.id,
              vehicleId: vehicle?.id ?? driver.vehicleId,
              assignmentStatus: driverCoversArea(driver.id, parcel.coverageAreaId ?? areaForLocation(parcel.city, parcel.district)) ? "مسند" : "خارج نطاق المندوب",
              assignedAt: "الآن",
              assignedBy: roleLabel,
              isDriverInArea: driverCoversArea(driver.id, parcel.coverageAreaId ?? areaForLocation(parcel.city, parcel.district)),
              reassignmentRequired: !driverCoversArea(driver.id, parcel.coverageAreaId ?? areaForLocation(parcel.city, parcel.district)),
              assignmentHistory: buildHistory(parcel, parcel.driver),
              status: parcel.status === "جاهز للتوزيع" ? "مسند إلى مندوب" : parcel.status
            }
          : parcel
      )
    );
    toast("تم إسناد المهمة للمندوب");
    addLog("إسناد لمندوب", taskId, `تم إسناد المهمة إلى ${driver.name}`);
  }

  function unassignTask(taskId: string) {
    const clearAssignment = (task: Order | Parcel) => ({
      driver: "غير مسند",
      vehicle: "غير محدد",
      assignedDriverId: "",
      vehicleId: "",
      assignmentStatus: "غير مسند",
      assignedAt: "غير مسند",
      assignedBy: roleLabel,
      isDriverInArea: false,
      reassignmentRequired: true,
      assignmentHistory: [
        ...(task.assignmentHistory ?? assignmentHistoryFor(task)),
        {
          time: "الآن",
          user: roleLabel,
          action: "تم فك الإسناد",
          fromDriver: task.driver,
          toDriver: "غير مسند",
          area: areaName(task.coverageAreaId ?? areaForLocation(task.city, task.district)),
          note: "تم فك إسناد المهمة وإعادتها لقائمة المهام غير المسندة"
        }
      ]
    });
    setOrders((current) => current.map((order) => order.id === taskId ? { ...order, ...clearAssignment(order) } : order));
    setParcels((current) => current.map((parcel) => parcel.id === taskId ? { ...parcel, ...clearAssignment(parcel) } : parcel));
    addLog("فك الإسناد", taskId, "تم فك إسناد المهمة وإعادتها لقائمة غير المسند");
    toast("تم فك الإسناد");
  }

  function recordFailedAttempt(taskId: string) {
    const task = allTasks.find((item) => item.id === taskId);
    if (!task) return;
    const newAttempt: DeliveryAttempt = {
      id: `ح-${ar(attempts.length + 401)}`,
      taskId,
      taskType: task.taskType,
      partner: task.partner,
      driver: task.driver,
      customer: "عميل تجريبي",
      time: "الآن",
      result: "العميل غير متاح",
      reason: "عدم الرد على الاتصال",
      notes: "تم تسجيل محاولة فاشلة من تجربة العرض",
      proof: "ملاحظة"
    };
    setAttempts((current) => [newAttempt, ...current]);
    updateTaskStatus(taskId, "تعذر التسليم");
    addLog("تسجيل محاولة تسليم", taskId, "تم تسجيل محاولة تعذر التسليم", "يحتاج متابعة");
    toast("تم تسجيل محاولة التسليم");
  }

  function recordReturn(taskId: string) {
    const task = allTasks.find((item) => item.id === taskId);
    if (!task) return;
    const newReturn: ReturnRecord = {
      id: `ر-${ar(returns.length + 501)}`,
      taskId,
      partner: task.partner,
      customer: "عميل تجريبي",
      driver: task.driver,
      reason: "تعذر التسليم",
      status: "بانتظار الإرجاع",
      date: "الآن",
      point: task.pickup,
      notes: "تم إنشاء مرتجع تجريبي"
    };
    setReturns((current) => [newReturn, ...current]);
    updateTaskStatus(taskId, task.taskType === "طرد" ? "مرتجع للشريك" : "مرتجع");
    addLog("تسجيل مرتجع", taskId, "تم فتح مسار إرجاع للمهمة", "يحتاج متابعة");
    toast("تم تسجيل المرتجع");
  }

  function createTransportDraft(taskId?: string) {
    const task = taskId ? allTasks.find((item) => item.id === taskId) : allTasks[0];
    const draft: TransportDocument = {
      id: `وث-${ar(documents.length + 601)}`,
      type: "مسودة وثيقة",
      taskId: task?.id ?? "غير محدد",
      partner: task?.partner ?? "غير محدد",
      sender: task?.pickup ?? "غير محدد",
      receiver: "عميل تجريبي",
      origin: task?.pickup ?? "غير محدد",
      destination: task?.delivery ?? "غير محدد",
      vehicle: "غير محدد",
      driver: task?.driver ?? "غير مسند",
      cargo: task?.taskType === "طرد" ? "طرد ميل أخير" : "طلب توصيل",
      pieces: "قطعة واحدة",
      weight: "غير محدد",
      status: "مسودة",
      bayanNumber: "",
      issuer: "",
      notes: "مسودة محفوظة دون إرسال لأي جهة خارجية"
    };
    setDocuments((current) => [draft, ...current]);
    addLog("إنشاء وثيقة نقل", draft.id, "تم إنشاء مسودة وثيقة نقل");
    toast("تم إنشاء مسودة وثيقة النقل");
  }

  const areaName = useCallback((areaId?: string) => {
    return coverageAreas.find((area) => area.id === areaId)?.name ?? "غير محدد";
  }, [coverageAreas]);

  const assignmentsForDriver = useCallback((driverId: string) => {
    return driverAreaAssignments.filter((assignment) => assignment.driverId === driverId);
  }, [driverAreaAssignments]);

  const primaryAssignment = useCallback((driverId: string) => {
    return assignmentsForDriver(driverId).find((assignment) => assignment.coverageType === "أساسي") ?? assignmentsForDriver(driverId)[0];
  }, [assignmentsForDriver]);

  function driverReadiness(driver: Driver) {
    if (driver.readinessRate) return driver.readinessRate;
    if (driver.status.includes("مراجعة")) return 58;
    if (driver.status.includes("خارج")) return 72;
    return 92;
  }

  function driverCompliance(driver: Driver) {
    if (driver.complianceStatus) return driver.complianceStatus;
    if (driver.status.includes("مراجعة")) return "يحتاج مراجعة";
    return "ساري";
  }

  function driverDisplayName(driver: Driver) {
    return driver.fullName ?? driver.name;
  }

  function driverMobile(driver: Driver) {
    return driver.mobile ?? driver.phone;
  }

  function driverIdentity(driver: Driver) {
    return driver.identityNumber ?? driver.nationalId;
  }

  function driverStatus(driver: Driver) {
    return driver.driverStatus ?? driver.status;
  }

  function driverReadinessScore(driver: Driver) {
    return driver.readinessScore ?? driver.readinessRate ?? driverReadiness(driver);
  }

  function driverPrimaryArea(driver: Driver) {
    return primaryAssignment(driver.id)?.areaId ?? driver.primaryAreaId ?? "";
  }

  function driverAreaLabel(driver: Driver) {
    const areaId = driverPrimaryArea(driver);
    return areaId ? areaName(areaId) : "بلا منطقة";
  }

  function driverVehicleLabel(driver: Driver) {
    const vehicle = vehicles.find((item) => item.id === driver.vehicleId || item.plate === driver.vehicle);
    return vehicle?.plate ?? driver.vehicle ?? "بلا مركبة";
  }

  function driverLicenseStatus(driver: Driver) {
    return driver.licenseStatus ?? (driverStatus(driver).includes("مراجعة") ? "يحتاج مراجعة" : "ساري");
  }

  function driverIdentityStatus(driver: Driver) {
    return driver.identityStatus ?? (driverStatus(driver).includes("مراجعة") ? "يحتاج مراجعة" : "ساري");
  }

  function driverContractStatus(driver: Driver) {
    return driver.contractStatus ?? "ساري";
  }

  function areaForLocation(city: string, district: string) {
    const text = `${city} ${district}`;
    if (text.includes("مكة") || text.includes("العزيزية") || text.includes("العوالي") || text.includes("الشرايع")) return "area-mak";
    if (text.includes("الرياض") || text.includes("النخيل") || text.includes("الملقا") || text.includes("الياسمين")) return "area-ryd";
    if (text.includes("السلامة") || text.includes("الشاطئ") || text.includes("النعيم") || text.includes("المحمدية") || text.includes("أبحر")) return "area-jed-north";
    if (text.includes("الروضة") || text.includes("الخالدية") || text.includes("الفيصلية") || text.includes("الأندلس")) return "area-jed-center";
    if (text.includes("الجامعة") || text.includes("السنابل") || text.includes("الخمرة") || text.includes("الأجاويد")) return "area-jed-south";
    if (text.includes("الصفا") || text.includes("المروة") || text.includes("السامر")) return "area-jed-east";
    return coverageAreas.find((area) => city.includes(area.city))?.id ?? coverageAreas[0]?.id ?? "";
  }

  function driverByName(name?: string) {
    if (!name || name.includes("غير")) return undefined;
    return drivers.find((driver) => driver.name === name);
  }

  function driverCoversArea(driverId: string | undefined, areaId: string) {
    if (!driverId || !areaId) return false;
    return assignmentsForDriver(driverId).some((assignment) => assignment.areaId === areaId);
  }

  function assignmentMeta(task: Order | Parcel): AssignmentMeta {
    const areaId = task.coverageAreaId ?? areaForLocation(task.city, task.district);
    const driver = task.assignedDriverId
      ? drivers.find((item) => item.id === task.assignedDriverId)
      : driverByName(task.driver);
    const assignedDriverId = driver?.id ?? "";
    const hasDriver = Boolean(driver) && !task.driver.includes("غير");
    const inArea = task.isDriverInArea ?? driverCoversArea(assignedDriverId, areaId);
    const driverNeedsReview = driver ? driverReadiness(driver) < 85 || driverCompliance(driver) !== "ساري" : false;
    const vehicle = task.vehicleId ? vehicles.find((item) => item.id === task.vehicleId) : vehicles.find((item) => item.plate === task.vehicle);
    let assignmentStatus = task.assignmentStatus;
    if (!assignmentStatus) {
      if (!hasDriver) assignmentStatus = "غير مسند";
      else if (task.status.includes("تم التسليم")) assignmentStatus = "مكتمل";
      else if (!inArea) assignmentStatus = "خارج نطاق المندوب";
      else if (task.reassignmentRequired || driverNeedsReview || task.status.includes("تعذر") || task.status.includes("متأخر")) assignmentStatus = "يحتاج إعادة إسناد";
      else if (task.status.includes("قيد") || task.status.includes("خارج")) assignmentStatus = "قيد التنفيذ";
      else assignmentStatus = "مسند";
    }
    const relationship = !hasDriver
      ? "لا يوجد مندوب مسند"
      : driverNeedsReview
        ? "يحتاج مراجعة"
        : inArea
          ? "ضمن منطقة المندوب"
          : "خارج منطقة المندوب";
    return {
      coverageAreaId: areaId,
      coverageAreaName: areaName(areaId),
      assignedDriverId,
      assignedDriverName: driver?.name ?? "غير مسند",
      vehicleId: vehicle?.id ?? task.vehicleId ?? "",
      vehicleLabel: vehicle?.plate ?? task.vehicle ?? "غير محدد",
      assignmentStatus,
      relationship,
      assignedAt: task.assignedAt ?? (hasDriver ? "اليوم 09:20" : "غير مسند"),
      assignedBy: task.assignedBy ?? (hasDriver ? "منسق التشغيل" : "لم يتم الإسناد"),
      reassignmentRequired: task.reassignmentRequired ?? (assignmentStatus.includes("إعادة") || assignmentStatus.includes("خارج"))
    };
  }

  function assignmentHistoryFor(task: Order | Parcel) {
    const meta = assignmentMeta(task);
    if (task.assignmentHistory?.length) return task.assignmentHistory;
    return [
      {
        time: "اليوم 08:00",
        user: "النظام التجريبي",
        action: "تم إنشاء المهمة",
        fromDriver: "لا يوجد",
        toDriver: "غير مسند",
        note: "تم تسجيل المهمة ضمن العرض المحلي"
      },
      {
        time: meta.assignedAt,
        user: meta.assignedBy,
        action: meta.assignedDriverId ? "تم إسنادها إلى مندوب" : "بانتظار الإسناد",
        fromDriver: "غير مسند",
        toDriver: meta.assignedDriverName,
        note: meta.reassignmentRequired ? "تحتاج مراجعة إسناد بسبب المنطقة أو الجاهزية" : "الإسناد متوافق مع بيانات العرض"
      },
      {
        time: "الآن",
        user: "لوحة التشغيل",
        action: "تم تحديث الحالة",
        fromDriver: meta.assignedDriverName,
        toDriver: meta.assignedDriverName,
        note: `الحالة الحالية: ${task.status}`
      }
    ];
  }

  function availableDriversForArea(areaId: string) {
    return drivers.filter((driver) => {
      const ready = !driver.status.includes("موقوف") && !driver.status.includes("خارج");
      return ready && driverCoversArea(driver.id, areaId);
    });
  }

  function driverSuitability(driver: Driver | undefined, areaId: string) {
    if (!driver) {
      return {
        label: "لا يوجد مندوب",
        warnings: ["لا يوجد مندوب مسند لهذه المهمة"]
      };
    }
    const warnings = [
      !driverCoversArea(driver.id, areaId) ? "المندوب خارج منطقة التغطية" : "",
      (driver.licenseStatus ?? driverCompliance(driver)).includes("منتهي") ? "رخصة المندوب منتهية" : "",
      (driver.identityStatus ?? driverCompliance(driver)).includes("منتهي") ? "هوية المندوب منتهية" : "",
      driver.status.includes("مشغول") ? "المندوب مشغول" : "",
      driver.vehicle.includes("غير") ? "المركبة غير جاهزة" : ""
    ].filter(Boolean);
    return {
      label: warnings.length ? (warnings.length > 1 ? "غير مناسب" : "مناسب مع ملاحظة") : "مناسب",
      warnings
    };
  }

  const allTasks = [
    ...orders.map((order) => {
      const meta = assignmentMeta(order);
      return {
        id: order.id,
        taskType: "طلب",
        href: `/orders/${routeId(order.id)}`,
        partner: order.partner,
        pickup: order.pickup,
        delivery: order.delivery,
        status: order.status,
        priority: order.priority,
        driver: meta.assignedDriverName,
        due: order.deliveryTime,
        city: order.city,
        district: order.district,
        coverageAreaName: meta.coverageAreaName,
        assignmentStatus: meta.assignmentStatus,
        relationship: meta.relationship,
        vehicleLabel: meta.vehicleLabel
      };
    }),
    ...parcels.map((parcel) => {
      const meta = assignmentMeta(parcel);
      return {
        id: parcel.id,
        taskType: "طرد",
        href: `/parcels/${routeId(parcel.id)}`,
        partner: parcel.partner,
        pickup: parcel.pickup,
        delivery: parcel.delivery,
        status: parcel.status,
        priority: parcel.fragile === "نعم" ? "عالية" : "متوسطة",
        driver: meta.assignedDriverName,
        due: "اليوم",
        city: parcel.city,
        district: parcel.district,
        coverageAreaName: meta.coverageAreaName,
        assignmentStatus: meta.assignmentStatus,
        relationship: meta.relationship,
        vehicleLabel: meta.vehicleLabel
      };
    })
  ];

  const partnerRows = useMemo<Row[]>(
    () =>
      partners.map((partner) => ({
        id: partner.id,
        title: partner.name,
        subtitle: partner.type,
        status: partner.status,
        href: `/partners/${routeId(partner.id)}`,
        fields: [
          field("نوع الشريك", partner.type),
          field("المدينة", partner.city),
          field("جهة الاتصال", partner.contact),
          field("رقم الجوال", partner.phone),
          field("البريد الإلكتروني", "محجوب للعرض التجريبي"),
          field("نوع التشغيل", partner.operation),
          field("نقاط الاستلام", partner.pickupPoints),
          field("عدد الطلبات", partner.orders),
          field("عدد الطرود", partner.parcels),
          field("نسبة التسليم", percent(partner.successRate)),
          field("المرتجعات", partner.returns),
          field("ملاحظات تشغيلية", partner.notes)
        ]
      })),
    [partners]
  );

  const operationalOrderRows: OperationalRow[] = orders.map((order) => {
    const meta = assignmentMeta(order);
    return {
      id: order.id,
      title: order.id,
      subtitle: `${order.partner} · ${order.type}`,
      status: order.status,
      href: `/orders/${routeId(order.id)}`,
      kind: "order",
      city: order.city,
      district: order.district,
      partner: order.partner,
      taskType: order.type,
      assignedDriverId: meta.assignedDriverId,
      coverageAreaId: meta.coverageAreaId,
      assignmentStatus: meta.assignmentStatus,
      relationship: meta.relationship,
      vehicleLabel: meta.vehicleLabel,
      due: order.deliveryTime,
      actionLabel: meta.assignedDriverId ? "إعادة إسناد" : "إسناد مندوب",
      fields: [
        field("رقم طلب الشريك", order.partnerRef),
        field("الشريك", order.partner),
        field("المدينة", order.city),
        field("الحي", order.district),
        field("منطقة التغطية", meta.coverageAreaName),
        field("المندوب المسند", meta.assignedDriverName),
        field("المركبة", meta.vehicleLabel),
        field("حالة الإسناد", meta.assignmentStatus),
        field("علاقة المندوب بالمنطقة", meta.relationship),
        field("وقت التسليم المتوقع", order.deliveryTime)
      ]
    };
  });

  const operationalParcelRows: OperationalRow[] = parcels.map((parcel) => {
    const meta = assignmentMeta(parcel);
    return {
      id: parcel.id,
      title: parcel.id,
      subtitle: `${parcel.partner} · ${parcel.tracking}`,
      status: parcel.status,
      href: `/parcels/${routeId(parcel.id)}`,
      kind: "parcel",
      city: parcel.city,
      district: parcel.district,
      partner: parcel.partner,
      taskType: "طرد",
      assignedDriverId: meta.assignedDriverId,
      coverageAreaId: meta.coverageAreaId,
      assignmentStatus: meta.assignmentStatus,
      relationship: meta.relationship,
      vehicleLabel: meta.vehicleLabel,
      due: "اليوم",
      actionLabel: meta.assignedDriverId ? "إعادة إسناد" : "إسناد مندوب",
      weight: parcel.weight,
      pieces: parcel.pieces,
      fields: [
        field("رقم التتبع", parcel.tracking),
        field("الشريك", parcel.partner),
        field("المدينة", parcel.city),
        field("الحي", parcel.district),
        field("منطقة التغطية", meta.coverageAreaName),
        field("المندوب المسند", meta.assignedDriverName),
        field("المركبة", meta.vehicleLabel),
        field("حالة الإسناد", meta.assignmentStatus),
        field("علاقة المندوب بالمنطقة", meta.relationship),
        field("الوزن والقطع", `${parcel.weight} · ${parcel.pieces}`)
      ]
    };
  });

  const coverageAreaRows = useMemo<Row[]>(
    () =>
      coverageAreas.map((area) => ({
        id: area.id,
        title: area.name,
        subtitle: `${area.city} · ${area.areaType}`,
        status: area.status,
        href: `/coverage-areas/${routeId(area.id)}`,
        fields: [
          field("المدينة", area.city),
          field("الأحياء", area.neighborhoods.join("، ")),
          field("نوع المنطقة", area.areaType),
          field("الشركاء المرتبطون", area.partnerIds.length),
          field("نقاط الاستلام", area.pickupPointIds.length),
          field("المناديب المعينون", area.assignedDriverIds.length),
          field("الطاقة التشغيلية", area.capacity),
          field("عدد مهام اليوم", area.tasksToday),
          field("نسبة النجاح", percent(area.successRate)),
          field("مستوى الضغط التشغيلي", area.pressureLevel),
          field("ملاحظات", area.notes)
        ]
      })),
    [coverageAreas]
  );

  const vehicleRows = useMemo<Row[]>(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.plate,
        subtitle: `${vehicle.type} · ${vehicle.model}`,
        status: vehicle.status,
        href: `/vehicles/${routeId(vehicle.id)}`,
        fields: [
          field("نوع المركبة", vehicle.type),
          field("الموديل", vehicle.model),
          field("سنة الصنع", vehicle.year),
          field("المندوب المرتبط", vehicle.driver),
          field("التأمين", vehicle.insurance),
          field("الاستمارة", vehicle.registration),
          field("الفحص الدوري", vehicle.inspection),
          field("المدينة", vehicle.city),
          field("ملاحظات", vehicle.notes)
        ]
      })),
    [vehicles]
  );

  const pickupRows = useMemo<Row[]>(
    () =>
      pickupPoints.map((point) => ({
        id: point.id,
        title: point.name,
        subtitle: `${point.partner} · ${point.type}`,
        status: point.status,
        href: `/pickup-points/${routeId(point.id)}`,
        fields: [
          field("الشريك", point.partner),
          field("نوع النقطة", point.type),
          field("المدينة", point.city),
          field("الحي", point.district),
          field("العنوان", point.address),
          field("جهة الاتصال", point.contact),
          field("رقم الجوال", point.phone),
          field("أوقات العمل", point.hours),
          field("ملاحظات", point.notes)
        ]
      })),
    [pickupPoints]
  );

  const attemptRows = useMemo<Row[]>(
    () =>
      attempts.map((attempt) => ({
        id: attempt.id,
        title: attempt.taskId,
        subtitle: `${attempt.partner} · ${attempt.driver}`,
        status: attempt.result,
        href: `/delivery-attempts/${routeId(attempt.id)}`,
        fields: [
          field("نوع المهمة", attempt.taskType),
          field("الشريك", attempt.partner),
          field("المندوب", attempt.driver),
          field("العميل", attempt.customer),
          field("وقت المحاولة", attempt.time),
          field("نتيجة المحاولة", attempt.result),
          field("سبب التعثر", attempt.reason),
          field("ملاحظات", attempt.notes),
          field("إثبات التسليم", attempt.proof)
        ]
      })),
    [attempts]
  );

  const returnRows = useMemo<Row[]>(
    () =>
      returns.map((item) => ({
        id: item.id,
        title: item.id,
        subtitle: `${item.partner} · ${item.taskId}`,
        status: item.status,
        href: `/returns/${routeId(item.id)}`,
        fields: [
          field("مرتبط بطلب أو طرد", item.taskId),
          field("الشريك", item.partner),
          field("العميل", item.customer),
          field("المندوب", item.driver),
          field("سبب الإرجاع", item.reason),
          field("تاريخ الإرجاع", item.date),
          field("نقطة الإرجاع", item.point),
          field("ملاحظات", item.notes)
        ]
      })),
    [returns]
  );

  const documentRows = useMemo<Row[]>(
    () =>
      documents.map((document) => ({
        id: document.id,
        title: document.id,
        subtitle: `${document.partner} · ${document.taskId}`,
        status: document.status,
        href: `/transport-documents/${routeId(document.id)}`,
        fields: [
          field("نوع الوثيقة", document.type),
          field("مرتبط بطلب أو طرد", document.taskId),
          field("الشريك", document.partner),
          field("المرسل", document.sender),
          field("المستلم", document.receiver),
          field("نقطة الانطلاق", document.origin),
          field("نقطة الوصول", document.destination),
          field("بيانات المركبة", document.vehicle),
          field("بيانات المندوب", document.driver),
          field("وصف الشحنة", document.cargo),
          field("عدد القطع", document.pieces),
          field("الوزن", document.weight),
          field("رقم وثيقة بيان", document.bayanNumber || "غير مدخل"),
          field("الجهة المصدرة", document.issuer || "غير مدخلة"),
          field("ملاحظات", document.notes)
        ]
      })),
    [documents]
  );

  const activityRows = useMemo<Row[]>(
    () =>
      activityLogs.map((log) => ({
        id: log.id,
        title: log.action,
        subtitle: `${log.user} · ${log.related}`,
        status: log.status,
        href: `/activity-log/${routeId(log.id)}`,
        fields: [
          field("المستخدم", log.user),
          field("الإجراء", log.action),
          field("الوقت", log.time),
          field("العنصر المرتبط", log.related),
          field("القيمة السابقة", "محفوظة في سجل التدقيق"),
          field("القيمة الجديدة", "محفوظة في سجل التدقيق"),
          field("ملاحظات", log.notes)
        ]
      })),
    [activityLogs]
  );

  if (activePath === "/login") {
    return (
      <div className="app-root">
        <LoginPage
          role={role}
          setRole={setRole}
          onEnter={() => router.push(role === "driver" ? "/driver" : "/dashboard")}
        />
        <ToastRegion toasts={toasts} />
      </div>
    );
  }

  if (activePath === "/driver" || activePath.startsWith("/driver/")) {
    return (
      <div className="app-root">
        <DriverExperience
          pathname={activePath}
          tasks={allTasks}
          orders={orders}
          parcels={parcels}
          drivers={drivers}
          coverageAreas={coverageAreas}
          driverAreaAssignments={driverAreaAssignments}
          onStatus={updateTaskStatus}
          onFailed={recordFailedAttempt}
          onReturn={(taskId) =>
            setConfirm({
              title: "تأكيد تسجيل المرتجع",
              message: "سيتم فتح مسار إرجاع تجريبي للمهمة المحددة.",
              label: "تسجيل المرتجع",
              onConfirm: () => recordReturn(taskId)
            })
          }
          onNote={() => {
            toast("تم حفظ الملاحظة التجريبية");
            addLog("إضافة ملاحظة", "مهمة مندوب", "تمت إضافة ملاحظة من واجهة المندوب");
          }}
        />
        <BottomNav items={driverBottomNav} pathname={activePath} />
        <ConfirmModal state={confirm} onClose={() => setConfirm(null)} />
        <ToastRegion toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="shell">
        <Sidebar pathname={activePath} role={role} setRole={setRole} />
        <main className="main">
          <Topbar title={pageTitle(activePath)} roleLabel={roleLabel} />
          <div className="content">{renderContent()}</div>
        </main>
      </div>
      <BottomNav items={operationsBottomNav} pathname={activePath} />
      <DetailDrawer drawer={drawer} onClose={() => setDrawer(null)} />
      <ConfirmModal state={confirm} onClose={() => setConfirm(null)} />
      <ToastRegion toasts={toasts} />
    </div>
  );

  function renderContent() {
    const parts = activePath.split("/").filter(Boolean);
    const section = parts[0] ?? "dashboard";
    const id = parts[1] ?? "";
    const action = parts[2] ?? "";

    if (activePath === "/" || activePath === "/dashboard") {
      return <DashboardPage />;
    }

    if (section === "partners") {
      if (id === "new") return <NewPartnerForm />;
      if (id) return <DetailPage title="ملف الشريك" row={partnerRows.find((row) => row.id === id)} />;
      return (
        <EntityPage
          title="الشركاء"
          description="إدارة شركاء التشغيل والربط التشغيلي ونقاط الاستلام"
          rows={partnerRows}
          newHref="/partners/new"
          newLabel="إضافة شريك"
        />
      );
    }

    if (section === "orders") {
      if (id === "new") return <NewOrderForm />;
      if (id) return <OrderDetailsPage order={orders.find((order) => order.id === id)} />;
      return (
        <OperationalTasksPage
          title="الطلبات"
          description="طلبات التوصيل مع وضوح منطقة التغطية والمندوب وحالة الإسناد قبل التنفيذ"
          rows={operationalOrderRows}
          newHref="/orders/new"
          newLabel="إضافة طلب"
          extraAction={{
            label: "تسجيل محاولة",
            icon: AlertTriangle,
            onClick: () => {
              if (allTasks[0]) recordFailedAttempt(allTasks[0].id);
            }
          }}
        />
      );
    }

    if (section === "parcels") {
      if (id === "new") return <NewParcelForm />;
      if (id) return <ParcelDetailsPage parcel={parcels.find((parcel) => parcel.id === id)} />;
      return (
        <OperationalTasksPage
          title="الطرود"
          description="تشغيل طرود الميل الأخير مع تتبع الإسناد والمنطقة والمندوب وإثبات التسليم"
          rows={operationalParcelRows}
          newHref="/parcels/new"
          newLabel="إضافة طرد"
          extraAction={{
            label: "إنشاء وثيقة",
            icon: FileText,
            onClick: () => createTransportDraft()
          }}
        />
      );
    }

    if (section === "dispatch") {
      return <DispatchPage />;
    }

    if (section === "drivers") {
      if (id === "new") return <DriverFormPage mode="new" />;
      if (id && action === "edit") return <DriverFormPage mode="edit" driver={drivers.find((driver) => driver.id === id)} />;
      if (id) return <DriverProfilePage driver={drivers.find((driver) => driver.id === id)} />;
      return <DriversAdminPage />;
    }

    if (section === "coverage-areas") {
      if (id === "new") return <NewCoverageAreaForm />;
      if (id) return <CoverageAreaProfilePage area={coverageAreas.find((area) => area.id === id)} />;
      return (
        <EntityPage
          title="المناطق والتغطية"
          description="إدارة مناطق التشغيل والتسليم وربط المناديب ونقاط الاستلام والشركاء حسب نطاق التغطية"
          rows={coverageAreaRows}
          newHref="/coverage-areas/new"
          newLabel="إضافة منطقة"
        />
      );
    }

    if (section === "vehicles") {
      if (id) return <DetailPage title="ملف المركبة" row={vehicleRows.find((row) => row.id === id)} />;
      return (
        <EntityPage
          title="المركبات"
          description="جاهزية المركبات والتأمين والاستمارة والفحص الدوري"
          rows={vehicleRows}
        />
      );
    }

    if (section === "pickup-points") {
      return (
        <EntityPage
          title="نقاط الاستلام"
          description="نقاط تابعة للشركاء وليست مستودعات مملوكة لعزم في هذه المرحلة"
          rows={pickupRows}
        />
      );
    }

    if (section === "delivery-attempts") {
      return (
        <EntityPage
          title="محاولات التسليم"
          description="سجل المحاولات الناجحة والمتعثرة مع أسباب التعثر وإثبات التسليم"
          rows={attemptRows}
          extraAction={{
            label: "محاولة فاشلة",
            icon: AlertTriangle,
            onClick: () => {
              if (allTasks[0]) recordFailedAttempt(allTasks[0].id);
            }
          }}
        />
      );
    }

    if (section === "returns") {
      return (
        <EntityPage
          title="المرتجعات"
          description="تتبع المرتجعات من التعثر حتى الإرجاع للشريك"
          rows={returnRows}
          extraAction={{
            label: "تسجيل مرتجع",
            icon: RotateCcw,
            onClick: () =>
              setConfirm({
                title: "تأكيد تسجيل المرتجع",
                message: "سيتم إنشاء مرتجع تجريبي للمهمة الأولى في قائمة التشغيل.",
                label: "تسجيل المرتجع",
                onConfirm: () => {
                  if (allTasks[0]) recordReturn(allTasks[0].id);
                }
              })
          }}
        />
      );
    }

    if (section === "transport-documents") {
      if (id) {
        return <DetailPage title="تفاصيل وثيقة النقل" row={documentRows.find((row) => row.id === id)} />;
      }
      return (
        <EntityPage
          title="وثائق النقل"
          description="مسودات وسجلات محفوظة استعدادا للربط المستقبلي دون اعتماد رسمي"
          rows={documentRows}
          extraAction={{
            label: "مسودة وثيقة",
            icon: ClipboardPlus,
            onClick: () => createTransportDraft()
          }}
        />
      );
    }

    if (section === "bayan-readiness") {
      return <BayanReadinessPage />;
    }

    if (section === "reports") {
      return <ReportsPage />;
    }

    if (section === "activity-log") {
      return (
        <EntityPage
          title="سجل الأنشطة"
          description="أثر تدقيق تشغيلي يعرض المستخدم والإجراء والعنصر والقيم المرتبطة"
          rows={activityRows}
        />
      );
    }

    if (section === "settings") {
      return <SettingsPage />;
    }

    return <DashboardPage />;
  }

  function DashboardPage() {
    const delivered = [...orders, ...parcels].filter((item) => item.status === "تم التسليم").length;
    const failed = [...orders, ...parcels].filter((item) => item.status.includes("تعذر")).length;
    const activeDrivers = drivers.filter((driver) => ["متاح", "مشغول", "في الطريق"].includes(driver.status)).length;
    const readyVehicles = vehicles.filter((vehicle) => vehicle.status === "جاهزة").length;
    const totalTasks = orders.length + parcels.length;
    const activePartners = partners.filter((partner) => partner.status === "نشط").length;
    const coveredAreas = coverageAreas.filter((area) => area.assignedDriverIds.length > 0).length;
    const uncoveredAreas = coverageAreas.filter((area) => area.assignedDriverIds.length === 0).length;
    const readyDrivers = drivers.filter((driver) => driverReadiness(driver) >= 85 && driverCompliance(driver) === "ساري").length;
    const reviewDrivers = drivers.filter((driver) => driverReadiness(driver) < 85 || driverCompliance(driver) !== "ساري").length;
    const expiredDocuments = drivers.filter((driver) => ["منتهي", "ناقص"].includes(driver.licenseStatus ?? driver.documentStatus ?? "")).length;
    const expiringLicenses = drivers.filter((driver) => (driver.licenseStatus ?? "").includes("ينتهي")).length;
    const expiringIdentities = drivers.filter((driver) => (driver.identityStatus ?? "").includes("ينتهي")).length;
    const orderAssignmentMeta = orders.map((order) => assignmentMeta(order));
    const parcelAssignmentMeta = parcels.map((parcel) => assignmentMeta(parcel));
    const assignmentMetaList = [...orderAssignmentMeta, ...parcelAssignmentMeta];
    const unassignedOrders = orderAssignmentMeta.filter((item) => item.assignmentStatus === "غير مسند").length;
    const unassignedParcels = parcelAssignmentMeta.filter((item) => item.assignmentStatus === "غير مسند").length;
    const tasksNeedReassignment = assignmentMetaList.filter((item) => item.assignmentStatus.includes("إعادة")).length;
    const tasksOutsideScope = assignmentMetaList.filter((item) => item.assignmentStatus.includes("خارج") || item.relationship.includes("خارج")).length;
    const weakCoverageAreas = coverageAreas.filter((area) => area.assignedDriverIds.length === 0 || area.status.includes("ضعيفة")).length;
    const availableDriversInAreas = drivers.filter((driver) => {
      const primary = primaryAssignment(driver.id);
      return ["متاح", "في الطريق", "مشغول"].includes(driver.status) && Boolean(primary);
    }).length;
    const actionTasks = [...operationalOrderRows, ...operationalParcelRows].filter((row) => row.assignmentStatus === "غير مسند" || row.assignmentStatus.includes("إعادة") || row.relationship.includes("خارج"));

    const kpis = [
      { label: "إجمالي مهام اليوم", value: totalTasks, icon: Layers, trend: "جاهز للتوسع بالترقيم" },
      { label: "الطلبات", value: orders.length, icon: ClipboardList, trend: "فلترة حسب الشريك" },
      { label: "الطرود", value: parcels.length, icon: Package, trend: "إثباتات تسليم مهيأة" },
      { label: "طلبات غير مسندة", value: unassignedOrders, icon: Send, trend: "تحتاج مندوب" },
      { label: "طرود غير مسندة", value: unassignedParcels, icon: Package, trend: "تحتاج مندوب" },
      { label: "تحتاج إعادة إسناد", value: tasksNeedReassignment, icon: RefreshCw, trend: "مراجعة تشغيلية" },
      { label: "خارج نطاق المندوب", value: tasksOutsideScope, icon: MapPinned, trend: "تحقق منطقة" },
      { label: "مناطق ضعيفة", value: weakCoverageAreas, icon: AlertTriangle, trend: "تغطية ناقصة" },
      { label: "مناديب داخل مناطقهم", value: availableDriversInAreas, icon: BadgeCheck, trend: "جاهزون للتوزيع" },
      { label: "قيد التوصيل", value: allTasks.filter((item) => /قيد|خارج/.test(item.status)).length, icon: Truck, trend: "متابعة مباشرة" },
      { label: "تم التسليم", value: delivered, icon: CheckCircle2, trend: percent(Math.round((delivered / Math.max(totalTasks, 1)) * 100)) },
      { label: "تعثر التسليم", value: failed, icon: AlertTriangle, trend: "إجراءات متابعة" },
      { label: "المرتجعات", value: returns.length, icon: RotateCcw, trend: "مسار إرجاع واضح" },
      { label: "المناديب النشطون", value: activeDrivers, icon: UserRound, trend: "جاهزية ميدانية" },
      { label: "المركبات الجاهزة", value: readyVehicles, icon: Car, trend: "فحص تشغيلي" },
      { label: "الشركاء النشطون", value: activePartners, icon: Users, trend: "تغطية متعددة" },
      { label: "مناطق مغطاة", value: coveredAreas, icon: MapPinned, trend: "إسناد مناطق" },
      { label: "مناطق بدون مناديب", value: uncoveredAreas, icon: AlertTriangle, trend: "تحتاج إسناد" },
      { label: "مناديب جاهزون", value: readyDrivers, icon: BadgeCheck, trend: "امتثال ساري" },
      { label: "مناديب يحتاجون مراجعة", value: reviewDrivers, icon: AlertTriangle, trend: "وثائق أو عقد" },
      { label: "وثائق منتهية", value: expiredDocuments, icon: FileText, trend: "مراجعة فورية" },
      { label: "رخص تنتهي قريباً", value: expiringLicenses, icon: ClipboardCheck, trend: "تنبيه امتثال" },
      { label: "هويات تنتهي قريباً", value: expiringIdentities, icon: ShieldCheck, trend: "تنبيه امتثال" },
      { label: "وثائق النقل", value: documents.length, icon: FileText, trend: "حفظ دون حذف" },
      { label: "حالة جاهزية بيان", value: Object.values(checklist).filter(Boolean).length, icon: ShieldCheck, trend: "قيد التجهيز" }
    ];

    return (
      <div className="page-grid">
        <section className="kpi-grid">
          {kpis.map((item) => (
            <article className="card kpi-card" key={item.label}>
              <header>
                <h3>{item.label}</h3>
                <item.icon size={22} color="#F39818" />
              </header>
              <div className="kpi-value">{ar(item.value)}</div>
              <span className="kpi-trend">{item.trend}</span>
            </article>
          ))}
        </section>

        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>مهام تحتاج إجراء</h3>
              <p>طلبات وطرود يظهر فيها نقص إسناد أو تعارض بين المندوب ومنطقة التغطية.</p>
            </div>
            <Badge>{ar(actionTasks.length)}</Badge>
          </div>
          {actionTasks.length ? (
            <div className="three-grid">
              {actionTasks.slice(0, 6).map((task) => (
                <article className="task-card" key={task.id}>
                  <h4>{task.id}</h4>
                  <div className="task-meta">
                    <Badge>{task.assignmentStatus}</Badge>
                    <span className="route-chip">{areaName(task.coverageAreaId)}</span>
                  </div>
                  <dl className="compact-list">
                    <div><dt>الشريك</dt><dd>{task.partner}</dd></div>
                    <div><dt>المدينة والحي</dt><dd>{task.city} · {task.district}</dd></div>
                    <div><dt>المندوب</dt><dd>{task.fields.find((item) => item.label === "المندوب المسند")?.value ?? "غير مسند"}</dd></div>
                    <div><dt>العلاقة</dt><dd>{task.relationship}</dd></div>
                  </dl>
                  <Link className="ghost-button" href={task.href}>
                    <ChevronLeft size={18} />
                    فتح التفاصيل
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="لا توجد مهام حرجة" text="كل المهام المعروضة لديها إسناد متوافق مع منطقة التغطية" icon={CheckCircle2} />
          )}
        </section>

        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>تغطية المناطق اليوم</h3>
              <p>نظرة سريعة على توزيع المناديب والمهام ونسبة النجاح حسب المنطقة.</p>
            </div>
            <Link className="ghost-button" href="/coverage-areas">
              <MapPinned size={18} />
              إدارة المناطق
            </Link>
          </div>
          <div className="three-grid">
            {coverageAreas.slice(0, 4).map((area) => (
              <article className="task-card" key={area.id}>
                <h4>{area.name}</h4>
                <div className="task-meta">
                  <Badge>{area.status}</Badge>
                  <span className="route-chip">{area.city}</span>
                </div>
                <dl className="compact-list">
                  <div><dt>عدد المناديب</dt><dd>{ar(area.assignedDriverIds.length)}</dd></div>
                  <div><dt>مهام اليوم</dt><dd>{ar(area.tasksToday)}</dd></div>
                  <div><dt>نسبة النجاح</dt><dd>{percent(area.successRate)}</dd></div>
                  <div><dt>حالة التغطية</dt><dd>{area.status}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="section-grid">
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>تغطية الشركاء اليوم</h3>
                <p>مؤشرات تشغيل لكل شريك مع نسب نجاح وتعثر ومرتجعات</p>
              </div>
              <Badge>نشط</Badge>
            </div>
            <div className="three-grid">
              {partners.slice(0, 6).map((partner) => (
                <article className="task-card" key={partner.id}>
                  <h4>{partner.name}</h4>
                  <div className="task-meta">
                    <Badge>{partner.status}</Badge>
                    <span className="route-chip">
                      <Package size={15} />
                      {ar(partner.orders + partner.parcels)} مهمة
                    </span>
                  </div>
                  <dl className="compact-list">
                    <div>
                      <dt>تم التسليم</dt>
                      <dd>{percent(partner.successRate)}</dd>
                    </div>
                    <div>
                      <dt>قيد التوصيل</dt>
                      <dd>{ar(Math.max(1, Math.round((partner.orders + partner.parcels) * 0.08)))}</dd>
                    </div>
                    <div>
                      <dt>متعثرة</dt>
                      <dd>{ar(Math.max(0, Math.round((partner.orders + partner.parcels) * 0.03)))}</dd>
                    </div>
                    <div>
                      <dt>مرتجعة</dt>
                      <dd>{ar(partner.returns)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>خريطة تشغيلية</h3>
                <p>موضع تجريبي لتغطية المدن والمسارات دون ربط خرائط فعلي</p>
              </div>
              <MapPinned color="#F39818" />
            </div>
            <div className="map-placeholder" aria-label="خريطة تشغيلية تجريبية">
              <div className="map-route" />
              <span className="map-pin one" />
              <span className="map-pin two" />
              <span className="map-pin three" />
            </div>
          </div>
        </section>

        <section className="section-grid">
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>أداء المناديب</h3>
                <p>قراءة سريعة للحالة الحالية ونسبة النجاح اليومية</p>
              </div>
              <Link className="ghost-button" href="/drivers">
                <Eye size={18} />
                عرض الكل
              </Link>
            </div>
            <div className="three-grid">
              {drivers.slice(0, 3).map((driver) => (
                <article className="task-card" key={driver.id}>
                  <h4>{driver.name}</h4>
                  <div className="task-meta">
                    <Badge>{driver.status}</Badge>
                    <span className="route-chip">{driver.city}</span>
                  </div>
                  <dl className="compact-list">
                    <div>
                      <dt>المهام النشطة</dt>
                      <dd>{ar(driver.tasksToday)}</dd>
                    </div>
                    <div>
                      <dt>تم التسليم اليوم</dt>
                      <dd>{ar(driver.deliveredToday)}</dd>
                    </div>
                    <div>
                      <dt>محاولات فاشلة</dt>
                      <dd>{ar(driver.failedAttempts)}</dd>
                    </div>
                    <div>
                      <dt>نسبة النجاح</dt>
                      <dd>{percent(driver.successRate)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>تنبيهات تشغيلية</h3>
                <p>قائمة متابعة للمهام التي تحتاج تدخل سريع</p>
              </div>
              <Badge>متابعة</Badge>
            </div>
            <div className="timeline">
              {[
                "طلب متأخر عن وقت التسليم المتوقع",
                "مندوب لم يبدأ المسار",
                "محاولة تسليم فاشلة",
                "طلب يحتاج إعادة جدولة",
                "وثيقة نقل ناقصة البيانات"
              ].map((item) => (
                <div className="timeline-item" key={item}>
                  <span className="timeline-dot">
                    <AlertTriangle size={16} />
                  </span>
                  <div>
                    <strong>{item}</strong>
                    <p>تم إدراجها في قائمة المتابعة التشغيلية لهذا اليوم</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>آخر الأنشطة</h3>
              <p>سجل تدقيق مختصر يربط الإجراء بالمستخدم والعنصر التشغيلي</p>
            </div>
            <Link className="ghost-button" href="/activity-log">
              <Activity size={18} />
              سجل الأنشطة
            </Link>
          </div>
          <div className="timeline">
            {activityLogs.slice(0, 5).map((log) => (
              <div className="timeline-item" key={log.id}>
                <span className="timeline-dot">
                  <Activity size={16} />
                </span>
                <div>
                  <strong>{log.action}</strong>
                  <p>
                    {log.user} · {log.related} · {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function DispatchPage() {
    const unassigned = allTasks.filter((task) => task.driver === "غير مسند" || task.driver === "غير محدد");
    const assigned = allTasks.filter((task) => !unassigned.includes(task));
    const availableDrivers = drivers.filter((driver) => driver.status !== "خارج الدوام" && driver.status !== "موقوف");

    return (
      <div className="page-grid">
        <div className="toolbar">
          <div className="toolbar-group">
            <div className="search-wrap">
              <Search size={18} />
              <input
                className="search-box"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث حسب الشريك أو المدينة أو الحالة"
              />
            </div>
            <button className="ghost-button" type="button">
              <Filter size={18} />
              تصفية متقدمة
            </button>
            <Select name="dispatchCity" label="المدينة" options={["الكل", ...cities]} compact />
            <Select name="dispatchArea" label="المنطقة" options={["الكل", ...coverageAreas.map((area) => area.name)]} compact />
            <Select name="dispatchPartner" label="الشريك" options={["الكل", ...partners.slice(0, 6).map((partner) => partner.name)]} compact />
            <Select name="dispatchTaskType" label="نوع المهمة" options={["الكل", "طلب", "طرد"]} compact />
            <Select name="dispatchStatus" label="الحالة" options={["الكل", "جديد", "جاهز للتوزيع", "قيد التوصيل", "متأخر"]} compact />
            <Select name="dispatchDriver" label="المندوب" options={["الكل", ...drivers.map((driver) => driver.name)]} compact />
          </div>
          <div className="toolbar-group">
            <button className="ghost-button" type="button">
              <ListChecks size={18} />
              عرض محفوظ
            </button>
            <button className="primary-button" type="button" onClick={() => unassigned[0] && assignTask(unassigned[0].id, availableDrivers[0].name)}>
              <Send size={18} />
              إسناد سريع
            </button>
          </div>
        </div>

        <section className="dispatch-board">
          <div className="command-card dispatch-column">
            <div className="card-header">
              <div>
                <h3>مهام غير مسندة</h3>
                <p>طلبات وطرود جاهزة للإسناد</p>
              </div>
              <Badge>{ar(unassigned.length)}</Badge>
            </div>
            {unassigned.length ? (
              unassigned.map((task) => <DispatchTaskCard key={task.id} task={task} drivers={availableDrivers} onAssign={assignTask} />)
            ) : (
              <EmptyState title="لا توجد مهام غير مسندة" text="كل المهام الحالية لديها مندوب مرتبط" icon={CheckCircle2} />
            )}
          </div>

          <div className="command-card dispatch-column">
            <div className="card-header">
              <div>
                <h3>المناديب المتاحون</h3>
                <p>اختيار سريع حسب المدينة والحالة</p>
              </div>
              <Badge>{ar(availableDrivers.length)}</Badge>
            </div>
            {availableDrivers.map((driver) => (
              <article className="task-card" key={driver.id}>
                <h4>{driver.name}</h4>
                <div className="task-meta">
                  <Badge>{driver.status}</Badge>
                  <span className="route-chip">{driver.city}</span>
                  <span className="route-chip">{driver.vehicle}</span>
                  <span className="route-chip">{areaName(primaryAssignment(driver.id)?.areaId)}</span>
                </div>
                <p className="muted">الوثائق: {driverCompliance(driver)} · الجاهزية: {percent(driverReadiness(driver))}</p>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => unassigned[0] && assignTask(unassigned[0].id, driver.name)}
                >
                  <Send size={18} />
                  إسناد أول مهمة
                </button>
              </article>
            ))}
          </div>

          <div className="command-card dispatch-column">
            <div className="card-header">
              <div>
                <h3>مهام نشطة</h3>
                <p>إعادة الإسناد وتغيير الأولوية من نفس الشاشة</p>
              </div>
              <Badge>{ar(assigned.length)}</Badge>
            </div>
            {assigned.map((task) => (
              <article className="task-card" key={task.id}>
                <h4>{task.href ? <Link href={task.href}>{task.id}</Link> : task.id}</h4>
                <div className="task-meta">
                  <Badge>{task.status}</Badge>
                  <Badge>{task.taskType}</Badge>
                </div>
                <dl className="compact-list">
                  <div>
                    <dt>الشريك</dt>
                    <dd>{task.partner}</dd>
                  </div>
                  <div>
                    <dt>المندوب</dt>
                    <dd>{task.driver}</dd>
                  </div>
                  <div>
                    <dt>منطقة التغطية</dt>
                    <dd>{task.coverageAreaName}</dd>
                  </div>
                  <div>
                    <dt>حالة الإسناد</dt>
                    <dd>{task.assignmentStatus}</dd>
                  </div>
                  <div>
                    <dt>علاقة المندوب بالمنطقة</dt>
                    <dd>{task.relationship}</dd>
                  </div>
                  <div>
                    <dt>المركبة</dt>
                    <dd>{task.vehicleLabel}</dd>
                  </div>
                  <div>
                    <dt>وقت التسليم المتوقع</dt>
                    <dd>{task.due}</dd>
                  </div>
                </dl>
                <div className="row-actions">
                  {task.href ? (
                    <Link className="ghost-button" href={task.href}>
                      <Eye size={18} />
                      التفاصيل
                    </Link>
                  ) : null}
                  <button className="ghost-button" type="button" onClick={() => assignTask(task.id, availableDrivers[0].name)}>
                    <RefreshCw size={18} />
                    إعادة إسناد
                  </button>
                  <button className="danger-button" type="button" onClick={() => recordFailedAttempt(task.id)}>
                    <AlertTriangle size={18} />
                    تعثر
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function DriverFormPage({ mode, driver }: { mode: "new" | "edit"; driver?: Driver }) {
    const missingDriver = mode === "edit" && !driver;
    const initialDraft: DriverFormDraft = {
      name: driver ? driverDisplayName(driver) : "",
      phone: driver ? driverMobile(driver) : "",
      nationalId: driver ? driverIdentity(driver) : "",
      identityType: driver?.identityType ?? "هوية وطنية",
      nationality: driver?.nationality ?? "",
      birthDate: driver?.birthDate ?? "",
      age: String(driver?.age ?? ""),
      email: driver?.email ?? "",
      city: driver?.city ?? "جدة",
      address: driver?.address ?? driver?.lastLocation ?? "",
      emergencyContactName: driver?.emergencyContactName ?? driver?.emergencyContact ?? "",
      emergencyContactMobile: driver?.emergencyContactMobile ?? "",
      licenseNumber: driver?.licenseNumber ?? "",
      licenseType: driver?.licenseType ?? "خصوصي",
      licenseIssueDate: driver?.licenseIssueDate ?? "",
      licenseExpiryDate: driver?.licenseExpiryDate ?? "",
      licenseStatus: driverLicenseStatus(driver ?? initialDrivers[0]),
      identityExpiryDate: driver?.identityExpiryDate ?? "",
      identityStatus: driver ? driverIdentityStatus(driver) : "ساري",
      agreementType: driver?.agreementType ?? "راتب + عمولة",
      baseSalary: String(driver?.baseSalary ?? ""),
      commissionPerOrder: String(driver?.commissionPerOrder ?? ""),
      commissionPerParcel: String(driver?.commissionPerParcel ?? ""),
      dailyMinimum: String(driver?.dailyMinimum ?? ""),
      contractStartDate: driver?.contractStartDate ?? "",
      contractEndDate: driver?.contractEndDate ?? "",
      contractStatus: driver ? driverContractStatus(driver) : "ساري",
      workType: driver?.workType ?? "دوام كامل",
      workHours: driver?.workHours ?? "8 ساعات",
      workDays: driver?.workDays ?? "الأحد - الخميس",
      offDays: driver?.offDays ?? "الجمعة والسبت",
      type: driver?.type ?? "موظف",
      primaryAreaId: driverPrimaryArea(driver ?? initialDrivers[0]),
      secondaryAreaIds: driver?.secondaryAreaIds?.join("، ") ?? "",
      coverageType: driver?.coverageType ?? "أساسية",
      coverageTime: driver?.coverageTime ?? "08:00 - 16:00",
      vehicleId: driver?.vehicleId ?? "",
      vehicle: driver ? driverVehicleLabel(driver) : "",
      status: driver ? driverStatus(driver) : "جاهز للعمل",
      reviewReason: "",
      notes: driver?.notes ?? ""
    };
    const [draft, setDraft] = useState<DriverFormDraft>(initialDraft);
    const [errors, setErrors] = useState<string[]>([]);
    if (missingDriver) {
      return <EmptyState title="المندوب غير موجود" text="لم يتم العثور على ملف المندوب المطلوب للتحرير" icon={AlertTriangle} />;
    }
    const setValue = (name: keyof DriverFormDraft, value: string) => setDraft((current) => ({ ...current, [name]: value }));
    const input = (name: keyof DriverFormDraft, label: string, type = "text") => (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <input id={name} value={draft[name]} type={type} onChange={(event) => setValue(name, event.target.value)} />
      </div>
    );
    const select = (name: keyof DriverFormDraft, label: string, options: string[]) => (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <select id={name} value={draft[name]} onChange={(event) => setValue(name, event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    );
    const textarea = (name: keyof DriverFormDraft, label: string) => (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <textarea id={name} value={draft[name]} onChange={(event) => setValue(name, event.target.value)} />
      </div>
    );
    const upload = (label: string) => (
      <div className="upload-placeholder">
        <FileText size={18} />
        <span>{label}</span>
        <small>مرفق تجريبي فقط</small>
      </div>
    );

    function validateDriver() {
      const nextErrors: string[] = [];
      const phoneDigits = draft.phone.replace(/\D/g, "");
      if (!draft.name.trim()) nextErrors.push("الاسم الكامل مطلوب");
      if (!draft.phone.trim()) nextErrors.push("رقم الجوال مطلوب");
      if (phoneDigits.length < 9) nextErrors.push("رقم الجوال يجب أن يكون بصيغة سعودية صحيحة");
      if (draft.nationalId.replace(/\D/g, "").length < 10) nextErrors.push("رقم الهوية / الإقامة يجب أن يكون 10 أرقام");
      if (!draft.nationality.trim()) nextErrors.push("الجنسية مطلوبة");
      if (!draft.birthDate) nextErrors.push("تاريخ الميلاد مطلوب");
      if (!draft.licenseNumber.trim()) nextErrors.push("رقم الرخصة مطلوب");
      if (!draft.licenseExpiryDate) nextErrors.push("تاريخ انتهاء الرخصة مطلوب");
      if (!draft.identityExpiryDate) nextErrors.push("تاريخ انتهاء الهوية مطلوب");
      if (!draft.agreementType) nextErrors.push("نوع الاتفاق مطلوب");
      if (!draft.primaryAreaId) nextErrors.push("المنطقة الأساسية مطلوبة");
      if (!draft.status) nextErrors.push("حالة المندوب مطلوبة");
      setErrors(nextErrors);
      return nextErrors.length === 0;
    }

    function saveDriver(asDraft = false) {
      if (!asDraft && !validateDriver()) return;
      const linkedVehicle = vehicles.find((item) => item.id === draft.vehicleId || item.plate === draft.vehicle);
      const nextDriver: Driver = {
        ...(driver ?? initialDrivers[0]),
        id: driver?.id ?? `م-${ar(drivers.length + 101)}`,
        name: draft.name,
        fullName: draft.name,
        phone: draft.phone,
        mobile: draft.phone,
        nationalId: draft.nationalId,
        identityNumber: draft.nationalId,
        identityType: draft.identityType,
        nationality: draft.nationality,
        birthDate: draft.birthDate,
        age: Number(draft.age) || 0,
        email: draft.email,
        city: draft.city,
        address: draft.address,
        emergencyContactName: draft.emergencyContactName,
        emergencyContactMobile: draft.emergencyContactMobile,
        licenseNumber: draft.licenseNumber,
        licenseType: draft.licenseType,
        licenseIssueDate: draft.licenseIssueDate,
        licenseExpiryDate: draft.licenseExpiryDate,
        licenseStatus: draft.licenseStatus,
        identityExpiryDate: draft.identityExpiryDate,
        identityStatus: draft.identityStatus,
        agreementType: draft.agreementType,
        baseSalary: Number(draft.baseSalary) || 0,
        commissionPerOrder: Number(draft.commissionPerOrder) || 0,
        commissionPerParcel: Number(draft.commissionPerParcel) || 0,
        dailyMinimum: Number(draft.dailyMinimum) || 0,
        contractStartDate: draft.contractStartDate,
        contractEndDate: draft.contractEndDate,
        contractStatus: draft.contractStatus,
        workType: draft.workType,
        workHours: draft.workHours,
        workDays: draft.workDays,
        offDays: draft.offDays,
        type: draft.type,
        primaryAreaId: draft.primaryAreaId,
        secondaryAreaIds: draft.secondaryAreaIds.split(/[،,]/).map((item) => item.trim()).filter(Boolean),
        coverageType: draft.coverageType,
        coverageTime: draft.coverageTime,
        vehicleId: linkedVehicle?.id ?? draft.vehicleId,
        vehicle: linkedVehicle?.plate ?? (draft.vehicle || "بلا مركبة"),
        status: asDraft ? "مسودة" : draft.status,
        driverStatus: asDraft ? "مسودة" : draft.status,
        readinessRate: asDraft ? 40 : driverReadinessScore(driver ?? initialDrivers[0]),
        readinessScore: asDraft ? 40 : driverReadinessScore(driver ?? initialDrivers[0]),
        lastLocation: draft.address || draft.city,
        notes: draft.notes,
        tasksToday: driver?.tasksToday ?? 0,
        deliveredToday: driver?.deliveredToday ?? 0,
        failedAttempts: driver?.failedAttempts ?? 0,
        successRate: driver?.successRate ?? 0
      };
      setDrivers((current) => mode === "edit" ? current.map((item) => item.id === nextDriver.id ? nextDriver : item) : [nextDriver, ...current]);
      if (draft.primaryAreaId && !driverAreaAssignments.some((item) => item.driverId === nextDriver.id && item.areaId === draft.primaryAreaId)) {
        setDriverAreaAssignments((current) => [{
          driverId: nextDriver.id,
          areaId: draft.primaryAreaId,
          coverageType: draft.coverageType,
          startDate: "2026-07-01",
          endDate: "2026-12-31",
          timeWindow: draft.coverageTime,
          priority: "أولوية متوسطة",
          notes: "إسناد تجريبي من نموذج المناديب"
        }, ...current]);
      }
      toast(mode === "edit" ? "تم تحديث بيانات المندوب بنجاح" : "تم إنشاء ملف مندوب جديد");
      addLog(mode === "edit" ? "تحديث بيانات مندوب" : "إنشاء مندوب", nextDriver.id, mode === "edit" ? "تم تحديث بيانات المندوب بنجاح" : "تم إنشاء ملف مندوب جديد.");
      router.push(`/drivers/${routeId(nextDriver.id)}`);
    }

    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div><h3>{mode === "edit" ? "تحرير مندوب" : "إضافة مندوب"}</h3><p>نموذج تجريبي لإدارة بيانات المندوب والوثائق والاتفاق والمنطقة والمركبة.</p></div>
            <Link className="ghost-button" href="/drivers"><ChevronLeft size={18} />رجوع للمناديب</Link>
          </div>
          {errors.length ? <div className="form-errors">{errors.map((error) => <p key={error}>{error}</p>)}</div> : null}
        </section>
        <FormCard title="البيانات الشخصية" description="بيانات تعريف المندوب والتواصل والطوارئ">
          <div className="two-grid">{input("name", "الاسم الكامل")}{input("phone", "رقم الجوال")}{input("nationalId", "رقم الهوية / الإقامة")}{select("identityType", "نوع الهوية", ["هوية وطنية", "إقامة", "أخرى"])}{input("nationality", "الجنسية")}{input("birthDate", "تاريخ الميلاد", "date")}{input("age", "العمر", "number")}{input("email", "البريد الإلكتروني", "email")}{select("city", "المدينة", cities)}{input("address", "العنوان")}{input("emergencyContactName", "جهة اتصال للطوارئ")}{input("emergencyContactMobile", "رقم جوال الطوارئ")}</div>
          {textarea("notes", "ملاحظات")}
        </FormCard>
        <FormCard title="الرخصة والوثائق" description="حقول وثائقية مع مرفقات تجريبية فقط">
          <div className="two-grid">{input("licenseNumber", "رقم رخصة القيادة")}{input("licenseType", "نوع الرخصة")}{input("licenseIssueDate", "تاريخ إصدار الرخصة", "date")}{input("licenseExpiryDate", "تاريخ انتهاء الرخصة", "date")}{select("licenseStatus", "حالة الرخصة", ["ساري", "ينتهي قريبًا", "منتهي", "غير مرفق", "يحتاج مراجعة"])}{input("identityExpiryDate", "تاريخ انتهاء الهوية / الإقامة", "date")}{select("identityStatus", "حالة الهوية", ["ساري", "ينتهي قريبًا", "منتهي", "غير مرفق", "يحتاج مراجعة"])}</div>
          <div className="three-grid">{upload("صورة الهوية")}{upload("صورة الرخصة")}{upload("صورة العقد")}</div>
        </FormCard>
        <FormCard title="العقد والاتفاق" description="هذه بيانات اتفاق تشغيلية وليست نظام رواتب أو محاسبة.">
          <div className="two-grid">{select("agreementType", "نوع الاتفاق", ["راتب ثابت", "عمولة فقط", "راتب + عمولة", "عقد مؤقت", "عقد موسمي", "متعاقد بالطلب"])}{input("baseSalary", "الراتب الأساسي", "number")}{input("commissionPerOrder", "عمولة الطلب", "number")}{input("commissionPerParcel", "عمولة الطرد", "number")}{input("dailyMinimum", "الحد الأدنى اليومي", "number")}{input("contractStartDate", "تاريخ بداية العقد", "date")}{input("contractEndDate", "تاريخ نهاية العقد", "date")}{select("contractStatus", "حالة العقد", ["ساري", "ينتهي قريبًا", "منتهي", "يحتاج مراجعة"])}{input("workType", "نوع الدوام")}{input("workHours", "عدد ساعات الدوام")}{input("workDays", "أيام العمل")}{input("offDays", "أيام الإجازة")}</div>
        </FormCard>
        <FormCard title="المنطقة والتغطية" description="إسناد محلي تجريبي لمناطق التغطية">
          <div className="two-grid">{select("primaryAreaId", "المنطقة الأساسية", coverageAreas.map((area) => area.id))}{input("secondaryAreaIds", "مناطق إضافية")}{select("coverageType", "نوع التغطية", ["أساسية", "احتياطية", "موسمية", "عند الطلب"])}{input("coverageTime", "أوقات التغطية")}</div>
        </FormCard>
        <FormCard title="المركبة والحالة" description="ربط المركبة وحالة المندوب التشغيلية">
          <div className="two-grid">{select("vehicleId", "ربط مركبة", ["", ...vehicles.map((vehicle) => vehicle.id)])}{input("vehicle", "رقم اللوحة")}{select("type", "نوع المندوب", ["موظف", "متعاقد", "بديل", "موسمي"])}{select("status", "حالة المندوب", ["جاهز للعمل", "متاح", "خارج الدوام", "موقوف", "يحتاج مراجعة", "غير مؤهل مؤقتًا"])}{input("reviewReason", "سبب الإيقاف أو المراجعة")}</div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={() => saveDriver(false)}><CheckCircle2 size={18} />حفظ المندوب</button>
            <button className="ghost-button" type="button" onClick={() => saveDriver(true)}><FileText size={18} />حفظ كمسودة</button>
            <Link className="ghost-button" href="/drivers">إلغاء</Link>
          </div>
        </FormCard>
      </div>
    );
  }

  function DriversAdminPage() {
    const driverTabs = ["الكل", "جاهزون", "يحتاج مراجعة", "رخص منتهية", "هويات منتهية", "بلا منطقة", "بلا مركبة", "موقوفون"];
    const effectiveTab = driverTabs.includes(statusFilter) ? statusFilter : "الكل";
    const driverKpis = [
      { label: "إجمالي المناديب", value: drivers.length, icon: UserRound },
      { label: "جاهزون للعمل", value: drivers.filter((driver) => driverReadinessScore(driver) >= 85 && driverCompliance(driver) === "ساري" && !driverStatus(driver).includes("موقوف")).length, icon: BadgeCheck },
      { label: "يحتاجون مراجعة", value: drivers.filter((driver) => driverReadinessScore(driver) < 85 || driverCompliance(driver) !== "ساري" || driverStatus(driver).includes("مراجعة")).length, icon: AlertTriangle },
      { label: "رخص منتهية", value: drivers.filter((driver) => driverLicenseStatus(driver).includes("منتهي")).length, icon: ClipboardCheck },
      { label: "هويات منتهية", value: drivers.filter((driver) => driverIdentityStatus(driver).includes("منتهي")).length, icon: ShieldCheck },
      { label: "عقود منتهية", value: drivers.filter((driver) => driverContractStatus(driver).includes("منتهي")).length, icon: FileText },
      { label: "بلا منطقة", value: drivers.filter((driver) => !driverPrimaryArea(driver)).length, icon: MapPinned },
      { label: "بلا مركبة", value: drivers.filter((driver) => driverVehicleLabel(driver).includes("بلا") || driverVehicleLabel(driver).includes("غير")).length, icon: Car }
    ];
    const cityOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driver.city)))];
    const areaOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverAreaLabel(driver))))];
    const statusOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverStatus(driver))))];
    const identityOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverIdentityStatus(driver))))];
    const licenseOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverLicenseStatus(driver))))];
    const contractOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverContractStatus(driver))))];
    const agreementOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driver.agreementType ?? "راتب + عمولة")))];
    const typeOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driver.type)))];
    const vehicleOptions = ["الكل", ...Array.from(new Set(drivers.map((driver) => driverVehicleLabel(driver))))];

    const tabMatches = (driver: Driver) => {
      if (effectiveTab === "الكل") return true;
      if (effectiveTab === "جاهزون") return driverReadinessScore(driver) >= 85 && driverCompliance(driver) === "ساري";
      if (effectiveTab === "يحتاج مراجعة") return driverReadinessScore(driver) < 85 || driverCompliance(driver) !== "ساري" || driverStatus(driver).includes("مراجعة");
      if (effectiveTab === "رخص منتهية") return driverLicenseStatus(driver).includes("منتهي");
      if (effectiveTab === "هويات منتهية") return driverIdentityStatus(driver).includes("منتهي");
      if (effectiveTab === "بلا منطقة") return !driverPrimaryArea(driver);
      if (effectiveTab === "بلا مركبة") return driverVehicleLabel(driver).includes("بلا") || driverVehicleLabel(driver).includes("غير");
      if (effectiveTab === "موقوفون") return driverStatus(driver).includes("موقوف");
      return true;
    };

    const filtered = drivers.filter((driver) => {
      const source = [driverDisplayName(driver), driverMobile(driver), driverIdentity(driver), driver.city, driverAreaLabel(driver), driverVehicleLabel(driver), driverStatus(driver)].join(" ");
      return (!query || source.includes(query))
        && (driverCityFilter === "الكل" || driver.city === driverCityFilter)
        && (driverAreaFilter === "الكل" || driverAreaLabel(driver) === driverAreaFilter)
        && (driverFilter === "الكل" || driverStatus(driver) === driverFilter)
        && (driverIdentityFilter === "الكل" || driverIdentityStatus(driver) === driverIdentityFilter)
        && (driverLicenseFilter === "الكل" || driverLicenseStatus(driver) === driverLicenseFilter)
        && (driverContractFilter === "الكل" || driverContractStatus(driver) === driverContractFilter)
        && (driverAgreementFilter === "الكل" || (driver.agreementType ?? "راتب + عمولة") === driverAgreementFilter)
        && (driverTypeFilter === "الكل" || driver.type === driverTypeFilter)
        && (driverVehicleFilter === "الكل" || driverVehicleLabel(driver) === driverVehicleFilter)
        && tabMatches(driver);
    });

    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>المناديب</h3>
              <p>إدارة بيانات المناديب والهوية والرخصة والعقود والمناطق</p>
            </div>
            <div className="row-actions">
              <button className="ghost-button" type="button"><Download size={18} />تصدير</button>
              <button className="ghost-button" type="button"><RefreshCw size={18} />تحديث</button>
              <button className="ghost-button" type="button"><Filter size={18} />فلاتر</button>
              <Link className="primary-button" href="/drivers/new"><Plus size={18} />إضافة مندوب</Link>
            </div>
          </div>
        </section>

        <section className="kpi-grid">
          {driverKpis.map((item) => (
            <article className="card kpi-card" key={item.label}>
              <header><h3>{item.label}</h3><item.icon size={22} color="#F39818" /></header>
              <div className="kpi-value">{ar(item.value)}</div>
              <span className="kpi-trend">محسوبة من بيانات العرض</span>
            </article>
          ))}
        </section>

        <section className="table-card">
          <div className="toolbar">
            <div className="toolbar-group">
              <div className="search-wrap">
                <Search size={18} />
                <input className="search-box" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث بالاسم أو الجوال أو الهوية" />
              </div>
              <FilterSelect label="المدينة" value={driverCityFilter} options={cityOptions} onChange={setDriverCityFilter} />
              <FilterSelect label="المنطقة" value={driverAreaFilter} options={areaOptions} onChange={setDriverAreaFilter} />
              <FilterSelect label="حالة المندوب" value={driverFilter} options={statusOptions} onChange={setDriverFilter} />
              <FilterSelect label="الهوية" value={driverIdentityFilter} options={identityOptions} onChange={setDriverIdentityFilter} />
              <FilterSelect label="الرخصة" value={driverLicenseFilter} options={licenseOptions} onChange={setDriverLicenseFilter} />
              <FilterSelect label="العقد" value={driverContractFilter} options={contractOptions} onChange={setDriverContractFilter} />
              <FilterSelect label="الاتفاق" value={driverAgreementFilter} options={agreementOptions} onChange={setDriverAgreementFilter} />
              <FilterSelect label="النوع" value={driverTypeFilter} options={typeOptions} onChange={setDriverTypeFilter} />
              <FilterSelect label="المركبة" value={driverVehicleFilter} options={vehicleOptions} onChange={setDriverVehicleFilter} />
            </div>
          </div>
          <div className="segmented" role="tablist" aria-label="تبويبات المناديب">
            {driverTabs.map((tab) => (
              <button key={tab} className={effectiveTab === tab ? "is-active" : ""} type="button" onClick={() => setStatusFilter(tab)}>{tab}</button>
            ))}
          </div>

          {filtered.length ? (
            <>
              <div className="data-table-wrap" style={{ marginTop: 14 }}>
                <table className="data-table drivers-table">
                  <thead>
                    <tr>
                      <th>المندوب</th><th>الجوال</th><th>الهوية / الإقامة</th><th>الجنسية</th><th>العمر</th><th>المدينة</th><th>المنطقة الأساسية</th><th>نوع الاتفاق</th><th>الهوية</th><th>الرخصة</th><th>العقد</th><th>المركبة</th><th>الجاهزية</th><th>الحالة</th><th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((driver) => (
                      <tr key={driver.id}>
                        <td><strong>{driverDisplayName(driver)}</strong><div className="muted">{driver.type}</div></td>
                        <td>{driverMobile(driver)}</td>
                        <td>{driverIdentity(driver)}</td>
                        <td>{driver.nationality ?? "غير محدد"}</td>
                        <td>{ar(driver.age ?? 32)}</td>
                        <td>{driver.city}</td>
                        <td>{driverAreaLabel(driver)}</td>
                        <td>{driver.agreementType ?? "راتب + عمولة"}</td>
                        <td><Badge>{driverIdentityStatus(driver)}</Badge></td>
                        <td><Badge>{driverLicenseStatus(driver)}</Badge></td>
                        <td><Badge>{driverContractStatus(driver)}</Badge></td>
                        <td>{driverVehicleLabel(driver)}</td>
                        <td>{percent(driverReadinessScore(driver))}</td>
                        <td><Badge>{driverStatus(driver)}</Badge></td>
                        <td>
                          <div className="row-actions">
                            <Link className="icon-button" title="عرض الملف" href={`/drivers/${routeId(driver.id)}`}><Eye size={18} /></Link>
                            <Link className="icon-button" title="تحرير" href={`/drivers/${routeId(driver.id)}/edit`}><RefreshCw size={18} /></Link>
                            <button className="icon-button" type="button" title="ربط مركبة" onClick={() => toast("تم فتح إجراء ربط مركبة كتجربة محلية")}><Car size={18} /></button>
                            <button className="icon-button" type="button" title="إسناد منطقة" onClick={() => assignDriverToNextArea(driver)}><MapPinned size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-list" style={{ marginTop: 14 }}>
                {filtered.map((driver) => (
                  <article className="mobile-card card" key={driver.id}>
                    <div className="card-header"><div><h3>{driverDisplayName(driver)}</h3><p>{driverMobile(driver)} · {driver.city}</p></div><Badge>{driverStatus(driver)}</Badge></div>
                    <dl>
                      <div><dt>الهوية</dt><dd>{driverIdentity(driver)}</dd></div>
                      <div><dt>الجنسية</dt><dd>{driver.nationality ?? "غير محدد"}</dd></div>
                      <div><dt>المنطقة</dt><dd>{driverAreaLabel(driver)}</dd></div>
                      <div><dt>نوع الاتفاق</dt><dd>{driver.agreementType ?? "راتب + عمولة"}</dd></div>
                      <div><dt>الجاهزية</dt><dd>{percent(driverReadinessScore(driver))}</dd></div>
                      <div><dt>الرخصة</dt><dd>{driverLicenseStatus(driver)}</dd></div>
                      <div><dt>الهوية</dt><dd>{driverIdentityStatus(driver)}</dd></div>
                    </dl>
                    <div className="form-actions">
                      <Link className="ghost-button" href={`/drivers/${routeId(driver.id)}`}><Eye size={18} />عرض</Link>
                      <Link className="ghost-button" href={`/drivers/${routeId(driver.id)}/edit`}><RefreshCw size={18} />تحرير</Link>
                      <button className="primary-button" type="button" onClick={() => assignDriverToNextArea(driver)}><MapPinned size={18} />إسناد منطقة</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="لا يوجد مناديب بعد" text="عدّل الفلاتر أو أضف مندوبًا جديدًا لعرضه هنا" icon={UserRound} />
          )}
        </section>
      </div>
    );
  }

  function EntityPage({
    title,
    description,
    rows,
    newHref,
    newLabel,
    extraAction
  }: {
    title: string;
    description: string;
    rows: Row[];
    newHref?: string;
    newLabel?: string;
    extraAction?: { label: string; icon: LucideIcon; onClick: () => void };
  }) {
    const statuses = ["الكل", ...Array.from(new Set(rows.map((row) => row.status)))];
    const effectiveStatus = statuses.includes(statusFilter) ? statusFilter : "الكل";
    const filtered = rows.filter((row) => {
      const source = [row.title, row.subtitle, row.status, ...row.fields.map((item) => item.value)].join(" ");
      const queryMatch = !query || source.includes(query);
      const statusMatch = effectiveStatus === "الكل" || row.status === effectiveStatus;
      return queryMatch && statusMatch;
    });

    return (
      <section className="table-card">
        <div className="card-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <Badge>{ar(filtered.length)} سجل</Badge>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <div className="search-wrap">
              <Search size={18} />
              <input
                className="search-box"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث في السجلات"
              />
            </div>
            <button className="ghost-button" type="button">
              <Filter size={18} />
              تصفية
            </button>
            <button className="ghost-button" type="button">
              <ListChecks size={18} />
              إجراء جماعي
            </button>
          </div>
          <div className="toolbar-group">
            {extraAction ? (
              <button className="ghost-button" type="button" onClick={extraAction.onClick}>
                <extraAction.icon size={18} />
                {extraAction.label}
              </button>
            ) : null}
            <button className="ghost-button" type="button">
              <Download size={18} />
              تصدير
            </button>
            {newHref ? (
              <Link className="primary-button" href={newHref}>
                <Plus size={18} />
                {newLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="segmented" role="tablist" aria-label="تصفية الحالة">
          {statuses.slice(0, 6).map((status) => (
            <button
              key={status}
              className={effectiveStatus === status ? "is-active" : ""}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <>
            <div className="data-table-wrap" style={{ marginTop: 14 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المرجع</th>
                    <th>العنوان</th>
                    <th>الحالة</th>
                    <th>{filtered[0]?.fields[0]?.label ?? "الحقل الأول"}</th>
                    <th>{filtered[0]?.fields[1]?.label ?? "الحقل الثاني"}</th>
                    <th>{filtered[0]?.fields[2]?.label ?? "الحقل الثالث"}</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        <strong>{row.title}</strong>
                        <div className="muted">{row.subtitle}</div>
                      </td>
                      <td>
                        <Badge>{row.status}</Badge>
                      </td>
                      <td>{row.fields[0]?.value ?? "غير محدد"}</td>
                      <td>{row.fields[1]?.value ?? "غير محدد"}</td>
                      <td>{row.fields[2]?.value ?? "غير محدد"}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" type="button" title="عرض التفاصيل" onClick={() => setDrawer(row)}>
                            <Eye size={18} />
                          </button>
                          <Link className="icon-button" title="فتح الصفحة" href={row.href}>
                            <ChevronLeft size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-list" style={{ marginTop: 14 }}>
              {filtered.map((row) => (
                <article className="mobile-card card" key={row.id}>
                  <div className="card-header">
                    <div>
                      <h3>{row.title}</h3>
                      <p>{row.subtitle}</p>
                    </div>
                    <Badge>{row.status}</Badge>
                  </div>
                  <dl>
                    {row.fields.slice(0, 4).map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="form-actions">
                    <button className="ghost-button" type="button" onClick={() => setDrawer(row)}>
                      <Eye size={18} />
                      عرض التفاصيل
                    </button>
                    <Link className="primary-button" href={row.href}>
                      <ChevronLeft size={18} />
                      فتح الصفحة
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="لا توجد سجلات مطابقة" text="عدّل الفلاتر أو امسح البحث لعرض البيانات التجريبية" icon={Search} />
        )}

        <div className="toolbar" style={{ marginTop: 14, marginBottom: 0 }}>
          <span className="muted">الصفحة ١ من ١ · الترقيم جاهز للتفعيل عند الربط بالخادم</span>
          <span className="muted">فرز وتصفية من جهة الخادم عند الانتقال للإنتاج</span>
        </div>
      </section>
    );
  }

  function FilterSelect({
    label,
    value,
    options,
    onChange
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
  }) {
    return (
      <label className="filter-select">
        <span>{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function OperationalTasksPage({
    title,
    description,
    rows,
    newHref,
    newLabel,
    extraAction
  }: {
    title: string;
    description: string;
    rows: OperationalRow[];
    newHref: string;
    newLabel: string;
    extraAction?: { label: string; icon: LucideIcon; onClick: () => void };
  }) {
    const statusTabs = [
      "الكل",
      "غير مسند",
      "مسند",
      "قيد التوصيل",
      "تم التسليم",
      "تعثر التسليم",
      "يحتاج إعادة إسناد",
      "خارج نطاق المندوب"
    ];
    const effectiveStatus = statusTabs.includes(statusFilter) ? statusFilter : "الكل";
    const partnerOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.partner)))];
    const cityOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.city)))];
    const areaOptions = ["الكل", ...Array.from(new Set(rows.map((row) => areaName(row.coverageAreaId))))];
    const districtOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.district)))];
    const driverOptions = ["الكل", "غير مسند", ...drivers.map((driver) => driver.name)];
    const assignmentOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.assignmentStatus)))];
    const taskStatusOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.status)))];
    const taskKindOptions = ["الكل", ...Array.from(new Set(rows.map((row) => row.kind === "order" ? row.taskType : row.weight ?? "طرد")))];

    const tabMatches = (row: OperationalRow) => {
      if (effectiveStatus === "الكل") return true;
      if (effectiveStatus === "غير مسند") return row.assignmentStatus === "غير مسند";
      if (effectiveStatus === "مسند") return row.assignmentStatus !== "غير مسند";
      if (effectiveStatus === "قيد التوصيل") return row.status.includes("قيد") || row.status.includes("خارج");
      if (effectiveStatus === "تم التسليم") return row.status.includes("تم التسليم");
      if (effectiveStatus === "تعثر التسليم") return row.status.includes("تعذر") || row.status.includes("فشل");
      if (effectiveStatus === "يحتاج إعادة إسناد") return row.assignmentStatus.includes("إعادة");
      if (effectiveStatus === "خارج نطاق المندوب") return row.assignmentStatus.includes("خارج") || row.relationship.includes("خارج");
      return row.status === effectiveStatus;
    };

    const filtered = rows.filter((row) => {
      const source = [row.id, row.subtitle, row.partner, row.city, row.district, areaName(row.coverageAreaId), row.assignmentStatus, row.relationship, ...row.fields.map((item) => item.value)].join(" ");
      const queryMatch = !query || source.includes(query);
      const partnerMatch = partnerFilter === "الكل" || row.partner === partnerFilter;
      const cityMatch = cityFilter === "الكل" || row.city === cityFilter;
      const areaMatch = areaFilter === "الكل" || areaName(row.coverageAreaId) === areaFilter;
      const districtMatch = districtFilter === "الكل" || row.district === districtFilter;
      const driverName = row.fields.find((item) => item.label === "المندوب المسند")?.value ?? "غير مسند";
      const driverMatch = driverFilter === "الكل" || driverName === driverFilter || (driverFilter === "غير مسند" && !row.assignedDriverId);
      const assignmentMatch = assignmentFilter === "الكل" || row.assignmentStatus === assignmentFilter;
      const taskStatusMatch = taskStatusFilter === "الكل" || row.status === taskStatusFilter;
      const taskKindValue = row.kind === "order" ? row.taskType : row.weight ?? "طرد";
      const taskKindMatch = taskKindFilter === "الكل" || taskKindValue === taskKindFilter;
      return queryMatch && partnerMatch && cityMatch && areaMatch && districtMatch && driverMatch && assignmentMatch && taskStatusMatch && taskKindMatch && tabMatches(row);
    });

    return (
      <section className="table-card">
        <div className="card-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <Badge>{ar(filtered.length)} سجل</Badge>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <div className="search-wrap">
              <Search size={18} />
              <input
                className="search-box"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="بحث بالمرجع أو الشريك أو المدينة أو المندوب"
              />
            </div>
            <FilterSelect label="الشريك" value={partnerFilter} options={partnerOptions} onChange={setPartnerFilter} />
            <FilterSelect label="المدينة" value={cityFilter} options={cityOptions} onChange={setCityFilter} />
            <FilterSelect label="المنطقة" value={areaFilter} options={areaOptions} onChange={setAreaFilter} />
            <FilterSelect label="الحي" value={districtFilter} options={districtOptions} onChange={setDistrictFilter} />
            <FilterSelect label="المندوب" value={driverFilter} options={driverOptions} onChange={setDriverFilter} />
            <FilterSelect label="الإسناد" value={assignmentFilter} options={assignmentOptions} onChange={setAssignmentFilter} />
            <FilterSelect label="حالة المهمة" value={taskStatusFilter} options={taskStatusOptions} onChange={setTaskStatusFilter} />
            <FilterSelect label={rows[0]?.kind === "order" ? "نوع الطلب" : "الوزن"} value={taskKindFilter} options={taskKindOptions} onChange={setTaskKindFilter} />
          </div>
          <div className="toolbar-group">
            {extraAction ? (
              <button className="ghost-button" type="button" onClick={extraAction.onClick}>
                <extraAction.icon size={18} />
                {extraAction.label}
              </button>
            ) : null}
            <button className="ghost-button" type="button" onClick={() => {
              setPartnerFilter("الكل");
              setCityFilter("الكل");
              setAreaFilter("الكل");
              setDistrictFilter("الكل");
              setDriverFilter("الكل");
              setAssignmentFilter("الكل");
              setTaskStatusFilter("الكل");
              setTaskKindFilter("الكل");
              setStatusFilter("الكل");
            }}>
              <RefreshCw size={18} />
              مسح الفلاتر
            </button>
            <Link className="primary-button" href={newHref}>
              <Plus size={18} />
              {newLabel}
            </Link>
          </div>
        </div>

        <div className="segmented" role="tablist" aria-label="تصفية حالة الإسناد والتسليم">
          {statusTabs.map((status) => (
            <button
              key={status}
              className={effectiveStatus === status ? "is-active" : ""}
              type="button"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <>
            <div className="data-table-wrap" style={{ marginTop: 14 }}>
              <table className="data-table operational-table">
                <thead>
                  <tr>
                    <th>المرجع</th>
                    <th>{rows[0]?.kind === "order" ? "رقم طلب الشريك" : "رقم مرجع الشريك"}</th>
                    <th>الشريك</th>
                    <th>{rows[0]?.kind === "order" ? "نوع الطلب" : "الوزن والقطع"}</th>
                    <th>المدينة</th>
                    <th>الحي</th>
                    <th>المنطقة</th>
                    <th>المندوب المسند</th>
                    <th>المركبة</th>
                    <th>حالة الإسناد</th>
                    <th>حالة المهمة</th>
                    <th>{rows[0]?.kind === "order" ? "وقت التسليم المتوقع" : "بيانات الحمولة"}</th>
                    <th>توافق المندوب مع المنطقة</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td><Link href={row.href}>{row.id}</Link></td>
                      <td>{row.fields[0]?.value ?? row.id}</td>
                      <td>
                        <strong>{row.partner}</strong>
                        <div className="muted">{row.taskType}</div>
                      </td>
                      <td>{row.kind === "order" ? row.taskType : `${row.weight ?? "غير محدد"} · ${row.pieces ?? "غير محدد"}`}</td>
                      <td>{row.city}</td>
                      <td>{row.district}</td>
                      <td><Link href={`/coverage-areas/${routeId(row.coverageAreaId)}`}>{areaName(row.coverageAreaId)}</Link></td>
                      <td>{row.fields.find((item) => item.label === "المندوب المسند")?.value ?? "غير مسند"}</td>
                      <td>{row.vehicleLabel}</td>
                      <td>
                        <Badge>{row.assignmentStatus}</Badge>
                      </td>
                      <td><Badge>{row.status}</Badge></td>
                      <td>{row.kind === "order" ? row.due : `${row.weight ?? "غير محدد"} · ${row.pieces ?? "غير محدد"}`}</td>
                      <td>
                        <Badge>{row.relationship}</Badge>
                        {row.relationship.includes("خارج") ? <div className="muted">المندوب المسند لا يغطي هذه المنطقة بشكل أساسي.</div> : null}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="ghost-button" type="button" onClick={() => assignTask(row.id, drivers[0]?.name ?? "غير محدد")}>
                            <Send size={18} />
                            {row.actionLabel}
                          </button>
                          <Link className="icon-button" title="فتح التفاصيل" href={row.href}>
                            <ChevronLeft size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-list" style={{ marginTop: 14 }}>
              {filtered.map((row) => (
                <article className="mobile-card card" key={row.id}>
                  <div className="card-header">
                    <div>
                      <h3>{row.id}</h3>
                      <p>{row.partner} · {row.city} · {row.district}</p>
                    </div>
                    <Badge>{row.assignmentStatus}</Badge>
                  </div>
                  <dl>
                    <div><dt>منطقة التغطية</dt><dd>{areaName(row.coverageAreaId)}</dd></div>
                    <div><dt>المندوب</dt><dd>{row.fields.find((item) => item.label === "المندوب المسند")?.value ?? "غير مسند"}</dd></div>
                    <div><dt>المركبة</dt><dd>{row.vehicleLabel}</dd></div>
                    <div><dt>حالة المهمة</dt><dd>{row.status}</dd></div>
                  </dl>
                  <div className="form-actions">
                    <button className="ghost-button" type="button" onClick={() => assignTask(row.id, drivers[0]?.name ?? "غير محدد")}>
                      <Send size={18} />
                      {row.actionLabel}
                    </button>
                    <Link className="primary-button" href={row.href}>
                      <ChevronLeft size={18} />
                      التفاصيل
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="لا توجد مهام مطابقة" text="غيّر الفلاتر أو امسح البحث لعرض بيانات التشغيل التجريبية" icon={Search} />
        )}
      </section>
    );
  }

  function OrderDetailsPage({ order }: { order?: Order }) {
    if (!order) {
      return <EmptyState title="الطلب غير موجود" text="لم يتم العثور على الطلب ضمن بيانات العرض" icon={AlertTriangle} />;
    }
    const meta = assignmentMeta(order);
    const history = assignmentHistoryFor(order);
    const driver = drivers.find((item) => item.id === meta.assignedDriverId);
    const areaId = meta.coverageAreaId;
    const area = coverageAreas.find((item) => item.id === areaId);
    const availableInArea = availableDriversForArea(areaId);
    const suitability = driverSuitability(driver, areaId);
    const linkedVehicle = vehicles.find((item) => item.id === meta.vehicleId || item.plate === meta.vehicleLabel);

    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>{order.id}</h3>
              <p>{order.partner} · {order.type} · {order.city} · {order.district}</p>
            </div>
            <div className="row-actions">
              <Badge>{order.status}</Badge>
              <Badge>{meta.assignmentStatus}</Badge>
              <Link className="ghost-button" href="/orders"><ChevronLeft size={18} />رجوع للطلبات</Link>
            </div>
          </div>
          <div className="task-meta">
            <Badge>{meta.assignmentStatus}</Badge>
            <span className="route-chip">{meta.coverageAreaName}</span>
            <span className="route-chip">{meta.assignedDriverName}</span>
            <span className="route-chip">{meta.vehicleLabel}</span>
          </div>
          <div className="row-actions">
            <button className="primary-button" type="button" onClick={() => assignTask(order.id, drivers[0]?.name ?? "غير محدد")}>
              <Send size={18} />
              {meta.assignedDriverId ? "إعادة إسناد الطلب" : "إسناد الطلب"}
            </button>
            <button className="ghost-button" type="button" onClick={() => unassignTask(order.id)}>
              <RefreshCw size={18} />
              فك الإسناد
            </button>
            <button className="ghost-button" type="button" onClick={() => {
              addLog("ملاحظة إسناد", order.id, "تمت إضافة ملاحظة تشغيلية على إسناد الطلب");
              toast("تم حفظ ملاحظة الإسناد");
            }}>
              <Activity size={18} />
              إضافة ملاحظة
            </button>
            <button className="danger-button" type="button" onClick={() => recordFailedAttempt(order.id)}>
              <AlertTriangle size={18} />
              تسجيل تعثر
            </button>
            <button className="ghost-button" type="button" onClick={() => recordReturn(order.id)}>
              <RotateCcw size={18} />
              تسجيل مرتجع
            </button>
          </div>
        </section>

        <section className="kpi-grid detail-kpis">
          {[
            ["الشريك", order.partner],
            ["المنطقة", meta.coverageAreaName],
            ["المندوب المسند", meta.assignedDriverName],
            ["المركبة", meta.vehicleLabel],
            ["وقت التسليم المتوقع", order.deliveryTime],
            ["توافق المندوب", suitability.label]
          ].map(([label, value]) => (
            <article className="card kpi-card" key={label}>
              <h3>{label}</h3>
              <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
            </article>
          ))}
        </section>

        {suitability.warnings.length ? (
          <section className="command-card warning-card">
            <div className="card-header">
              <div>
                <h3>{driver ? "تنبيهات توافق المندوب" : "لا يوجد مندوب مسند لهذه المهمة"}</h3>
                <p>{driver ? "راجع هذه الملاحظات قبل اعتماد الإسناد أو إعادة الإسناد." : "اختر مندوبًا مناسبًا من نفس منطقة التغطية."}</p>
              </div>
              <Badge>{suitability.label}</Badge>
            </div>
            <div className="task-meta">{suitability.warnings.map((warning) => <Badge key={warning}>{warning}</Badge>)}</div>
          </section>
        ) : null}

        <section className="section-grid">
          <InfoPanel
            title="بيانات الطلب"
            fields={[
              field("رقم طلب الشريك", order.partnerRef),
              field("الشريك", order.partner),
              field("نوع الطلب", order.type),
              field("الأولوية", order.priority),
              field("وقت الاستلام المتوقع", order.pickupTime),
              field("وقت التسليم المتوقع", order.deliveryTime)
            ]}
          />
          <InfoPanel
            title="الموقع والعميل"
            fields={[
              field("العميل", order.customer),
              field("جوال العميل", order.phone),
              field("نقطة الاستلام", order.pickup),
              field("عنوان التسليم", order.delivery),
              field("ملاحظة العنوان", order.notes),
              field("المدينة", order.city),
              field("الحي", order.district),
              field("منطقة التغطية", meta.coverageAreaName),
              field("هل المنطقة مغطاة؟", area && area.assignedDriverIds.length ? "نعم" : "تحتاج تغطية"),
              field("المناديب المتاحون في نفس المنطقة", availableInArea.map((item) => item.name).join("، ") || "لا يوجد مناديب متاحون")
            ]}
          />
        </section>

        <section className="section-grid">
          <InfoPanel
            title="الإسناد والتغطية"
            note={meta.relationship}
            fields={[
              field("منطقة التغطية", meta.coverageAreaName),
              field("حالة الإسناد", meta.assignmentStatus),
              field("المندوب المسند", meta.assignedDriverName),
              field("حالة المندوب", driver?.status ?? "غير مسند"),
              field("رقم الجوال", driver?.phone ?? "غير مسند"),
              field("منطقة المندوب الأساسية", driver ? areaName(primaryAssignment(driver.id)?.areaId ?? driver.primaryAreaId) : "غير مسند"),
              field("مناطق إضافية", driver?.secondaryAreaIds?.map((item) => areaName(item)).join("، ") || "لا توجد"),
              field("جاهزية المندوب", driver ? percent(driverReadiness(driver)) : "غير مسند"),
              field("امتثال المندوب", driver ? driverCompliance(driver) : "غير مسند"),
              field("حالة الرخصة", driver?.licenseStatus ?? (driver ? driverCompliance(driver) : "غير مسند")),
              field("حالة الهوية", driver?.identityStatus ?? (driver ? driverCompliance(driver) : "غير مسند")),
              field("حالة العقد", driver?.contractStatus ?? (driver ? "ساري" : "غير مسند")),
              field("المركبة", meta.vehicleLabel),
              field("حالة المركبة", linkedVehicle?.status ?? "غير محدد"),
              field("هل مناسب لهذه المهمة؟", suitability.label),
              field("وقت الإسناد", meta.assignedAt),
              field("المسند بواسطة", meta.assignedBy)
            ]}
          />
          <section className="command-card">
            <div className="card-header"><div><h3>سجل الإسناد</h3><p>أثر تجريبي يوضح كيف وصل الطلب إلى حالته الحالية.</p></div></div>
            <div className="timeline">
              {history.map((item) => (
                <article key={`${item.time}-${item.action}`}>
                  <strong>{item.action}</strong>
                  <p>{item.time} · {item.user}</p>
                  <p className="muted">{item.fromDriver} ← {item.toDriver} · {item.area ?? meta.coverageAreaName} · {item.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>إسناد أو إعادة إسناد تجريبية</h3>
              <p>اختر مندوبًا وشاهد توافقه مع منطقة الطلب قبل الحفظ.</p>
            </div>
            <Badge>{meta.coverageAreaName}</Badge>
          </div>
          <div className="three-grid">
            {drivers.slice(0, 6).map((candidate) => {
              const candidateSuitability = driverSuitability(candidate, areaId);
              return (
                <article className="task-card" key={candidate.id}>
                  <h4>{candidate.name}</h4>
                  <div className="task-meta">
                    <Badge>{candidate.status}</Badge>
                    <Badge>{candidateSuitability.label}</Badge>
                  </div>
                  <dl className="compact-list">
                    <div><dt>منطقته</dt><dd>{areaName(primaryAssignment(candidate.id)?.areaId ?? candidate.primaryAreaId)}</dd></div>
                    <div><dt>المهمة</dt><dd>{meta.coverageAreaName}</dd></div>
                    <div><dt>الجاهزية</dt><dd>{percent(driverReadiness(candidate))}</dd></div>
                    <div><dt>الوثائق</dt><dd>{driverCompliance(candidate)}</dd></div>
                  </dl>
                  {candidateSuitability.warnings.length ? <p className="muted">{candidateSuitability.warnings.join("، ")}</p> : null}
                  <button className="primary-button" type="button" onClick={() => assignTask(order.id, candidate.name)}>
                    <Send size={18} />
                    إسناد إلى {candidate.name}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  function ParcelDetailsPage({ parcel }: { parcel?: Parcel }) {
    if (!parcel) {
      return <EmptyState title="الطرد غير موجود" text="لم يتم العثور على الطرد ضمن بيانات العرض" icon={AlertTriangle} />;
    }
    const meta = assignmentMeta(parcel);
    const history = assignmentHistoryFor(parcel);
    const driver = drivers.find((item) => item.id === meta.assignedDriverId);
    const areaId = meta.coverageAreaId;
    const area = coverageAreas.find((item) => item.id === areaId);
    const suitability = driverSuitability(driver, areaId);
    const linkedVehicle = vehicles.find((item) => item.id === meta.vehicleId || item.plate === meta.vehicleLabel);
    const linkedDocument = documents.find((item) => item.taskId === parcel.id);
    const relatedAttempts = attempts.filter((item) => item.taskId === parcel.id);
    const relatedReturns = returns.filter((item) => item.taskId === parcel.id);

    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>{parcel.id}</h3>
              <p>{parcel.partner} · {parcel.tracking} · {parcel.city} · {parcel.district}</p>
            </div>
            <div className="row-actions">
              <Badge>{parcel.status}</Badge>
              <Badge>{meta.assignmentStatus}</Badge>
              <Link className="ghost-button" href="/parcels"><ChevronLeft size={18} />رجوع للطرود</Link>
            </div>
          </div>
          <div className="task-meta">
            <Badge>{meta.assignmentStatus}</Badge>
            <span className="route-chip">{meta.coverageAreaName}</span>
            <span className="route-chip">{meta.assignedDriverName}</span>
            <span className="route-chip">{parcel.weight} · {parcel.pieces}</span>
          </div>
          <div className="row-actions">
            <button className="primary-button" type="button" onClick={() => assignTask(parcel.id, drivers[0]?.name ?? "غير محدد")}>
              <Send size={18} />
              {meta.assignedDriverId ? "إعادة إسناد الطرد" : "إسناد الطرد"}
            </button>
            <button className="ghost-button" type="button" onClick={() => unassignTask(parcel.id)}>
              <RefreshCw size={18} />
              فك الإسناد
            </button>
            <button className="ghost-button" type="button" onClick={() => createTransportDraft(parcel.id)}>
              <FileText size={18} />
              مسودة وثيقة
            </button>
            <button className="danger-button" type="button" onClick={() => recordFailedAttempt(parcel.id)}>
              <AlertTriangle size={18} />
              تسجيل محاولة فاشلة
            </button>
            <button className="ghost-button" type="button" onClick={() => recordReturn(parcel.id)}>
              <RotateCcw size={18} />
              تسجيل مرتجع
            </button>
          </div>
        </section>

        <section className="kpi-grid detail-kpis">
          {[
            ["الشريك", parcel.partner],
            ["المنطقة", meta.coverageAreaName],
            ["المندوب المسند", meta.assignedDriverName],
            ["المركبة", meta.vehicleLabel],
            ["الوزن", parcel.weight],
            ["عدد القطع", parcel.pieces],
            ["توافق المندوب", suitability.label]
          ].map(([label, value]) => (
            <article className="card kpi-card" key={label}>
              <h3>{label}</h3>
              <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
            </article>
          ))}
        </section>

        {suitability.warnings.length ? (
          <section className="command-card warning-card">
            <div className="card-header">
              <div>
                <h3>{driver ? "تنبيهات توافق المندوب" : "لا يوجد مندوب مسند لهذه المهمة"}</h3>
                <p>{driver ? "راجع هذه الملاحظات قبل اعتماد الإسناد أو إعادة الإسناد." : "اختر مندوبًا مناسبًا من نفس منطقة التغطية."}</p>
              </div>
              <Badge>{suitability.label}</Badge>
            </div>
            <div className="task-meta">{suitability.warnings.map((warning) => <Badge key={warning}>{warning}</Badge>)}</div>
          </section>
        ) : null}

        <section className="section-grid">
          <InfoPanel
            title="بيانات الطرد"
            fields={[
              field("رقم التتبع", parcel.tracking),
              field("الشريك", parcel.partner),
              field("الوزن", parcel.weight),
              field("عدد القطع", parcel.pieces),
              field("قابل للكسر", parcel.fragile),
              field("يحتاج توقيع", parcel.signature),
              field("إثبات التسليم", parcel.proof)
            ]}
          />
          <InfoPanel
            title="المرسل والمستلم"
            fields={[
              field("المرسل", parcel.partner),
              field("جوال المرسل", "محجوب للعرض التجريبي"),
              field("نقطة الاستلام", parcel.pickup),
              field("المستلم", parcel.customer),
              field("جوال المستلم", parcel.phone),
              field("عنوان التسليم", parcel.delivery),
              field("المدينة", parcel.city),
              field("الحي", parcel.district),
              field("منطقة التغطية", meta.coverageAreaName),
              field("هل المنطقة مغطاة؟", area && area.assignedDriverIds.length ? "نعم" : "تحتاج تغطية")
            ]}
          />
        </section>

        <section className="section-grid">
          <InfoPanel
            title="الإسناد والتغطية"
            note={meta.relationship}
            fields={[
              field("منطقة التغطية", meta.coverageAreaName),
              field("حالة الإسناد", meta.assignmentStatus),
              field("المندوب المسند", meta.assignedDriverName),
              field("حالة المندوب", driver?.status ?? "غير مسند"),
              field("رقم الجوال", driver?.phone ?? "غير مسند"),
              field("منطقة المندوب الأساسية", driver ? areaName(primaryAssignment(driver.id)?.areaId ?? driver.primaryAreaId) : "غير مسند"),
              field("مناطق إضافية", driver?.secondaryAreaIds?.map((item) => areaName(item)).join("، ") || "لا توجد"),
              field("جاهزية المندوب", driver ? percent(driverReadiness(driver)) : "غير مسند"),
              field("امتثال المندوب", driver ? driverCompliance(driver) : "غير مسند"),
              field("حالة الرخصة", driver?.licenseStatus ?? (driver ? driverCompliance(driver) : "غير مسند")),
              field("حالة الهوية", driver?.identityStatus ?? (driver ? driverCompliance(driver) : "غير مسند")),
              field("حالة العقد", driver?.contractStatus ?? (driver ? "ساري" : "غير مسند")),
              field("المركبة", meta.vehicleLabel),
              field("حالة المركبة", linkedVehicle?.status ?? "غير محدد"),
              field("هل مناسب لهذه المهمة؟", suitability.label),
              field("وقت الإسناد", meta.assignedAt),
              field("المسند بواسطة", meta.assignedBy)
            ]}
          />
          <section className="command-card">
            <div className="card-header"><div><h3>سجل الإسناد</h3><p>تسلسل تجريبي للإسناد والمتابعة بدون ربط خارجي.</p></div></div>
            <div className="timeline">
              {history.map((item) => (
                <article key={`${item.time}-${item.action}`}>
                  <strong>{item.action}</strong>
                  <p>{item.time} · {item.user}</p>
                  <p className="muted">{item.fromDriver} ← {item.toDriver} · {item.area ?? meta.coverageAreaName} · {item.note}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="section-grid">
          <InfoPanel
            title="وثيقة النقل المرتبطة"
            note={linkedDocument ? "مسودة محلية محفوظة دون إرسال لأي جهة خارجية." : "لا توجد وثيقة نقل مرتبطة."}
            fields={[
              field("رقم الوثيقة الداخلي", linkedDocument?.id ?? "لا توجد وثيقة نقل مرتبطة"),
              field("حالة الوثيقة", linkedDocument?.status ?? "غير منشأة"),
              field("رقم وثيقة بيان", linkedDocument?.bayanNumber || "لا يوجد رقم رسمي"),
              field("الجهة المصدرة", linkedDocument?.issuer || "مسودة داخلية"),
              field("ملاحظات", linkedDocument?.notes ?? "يمكن إنشاء مسودة وثيقة نقل تجريبية")
            ]}
          />
          <section className="command-card">
            <div className="card-header"><div><h3>محاولات التسليم والمرتجعات</h3><p>سجلات مرتبطة بالطرد من بيانات العرض المحلية.</p></div></div>
            {[...relatedAttempts, ...relatedReturns].length ? (
              <div className="timeline">
                {relatedAttempts.map((item) => (
                  <article key={item.id}><strong>{item.result}</strong><p>{item.time} · {item.driver}</p><p className="muted">{item.reason} · {item.notes}</p></article>
                ))}
                {relatedReturns.map((item) => (
                  <article key={item.id}><strong>{item.status}</strong><p>{item.date} · {item.driver}</p><p className="muted">{item.reason} · {item.notes}</p></article>
                ))}
              </div>
            ) : (
              <EmptyState title="لا توجد محاولات أو مرتجعات مرتبطة" text="لا توجد سجلات متابعة لهذا الطرد حتى الآن" icon={ClipboardList} />
            )}
          </section>
        </section>

        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>إسناد أو إعادة إسناد تجريبية</h3>
              <p>اختر مندوبًا وشاهد توافقه مع منطقة الطرد قبل الحفظ.</p>
            </div>
            <Badge>{meta.coverageAreaName}</Badge>
          </div>
          <div className="three-grid">
            {drivers.slice(0, 6).map((candidate) => {
              const candidateSuitability = driverSuitability(candidate, areaId);
              return (
                <article className="task-card" key={candidate.id}>
                  <h4>{candidate.name}</h4>
                  <div className="task-meta">
                    <Badge>{candidate.status}</Badge>
                    <Badge>{candidateSuitability.label}</Badge>
                  </div>
                  <dl className="compact-list">
                    <div><dt>منطقته</dt><dd>{areaName(primaryAssignment(candidate.id)?.areaId ?? candidate.primaryAreaId)}</dd></div>
                    <div><dt>المهمة</dt><dd>{meta.coverageAreaName}</dd></div>
                    <div><dt>الجاهزية</dt><dd>{percent(driverReadiness(candidate))}</dd></div>
                    <div><dt>الوثائق</dt><dd>{driverCompliance(candidate)}</dd></div>
                  </dl>
                  {candidateSuitability.warnings.length ? <p className="muted">{candidateSuitability.warnings.join("، ")}</p> : null}
                  <button className="primary-button" type="button" onClick={() => assignTask(parcel.id, candidate.name)}>
                    <Send size={18} />
                    إسناد إلى {candidate.name}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  function DetailPage({ title, row }: { title: string; row?: Row }) {
    if (!row) {
      return <EmptyState title="السجل غير موجود" text="لم يتم العثور على السجل المطلوب ضمن بيانات العرض" icon={AlertTriangle} />;
    }

    return (
      <section className="command-card">
        <div className="card-header">
          <div>
            <h3>{title}</h3>
            <p>{row.subtitle}</p>
          </div>
          <Badge>{row.status}</Badge>
        </div>
        <dl className="detail-list">
          <div>
            <dt>المرجع الداخلي</dt>
            <dd>{row.id}</dd>
          </div>
          {row.fields.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="drawer-actions">
          <button className="ghost-button" type="button" onClick={() => setDrawer(row)}>
            <Eye size={18} />
            فتح درج التفاصيل
          </button>
          <button className="ghost-button" type="button">
            <Activity size={18} />
            عرض سجل الحالة
          </button>
        </div>
      </section>
    );
  }

  function DriverProfilePage({ driver }: { driver?: Driver }) {
    const profileTabs = ["نظرة عامة", "البيانات الشخصية", "الرخصة والوثائق", "العقد والاتفاق", "المناطق والتغطية", "المركبة", "الأداء", "المهام", "سجل الأنشطة"];
    const [profileTab, setProfileTab] = useState(profileTabs[0]);
    if (!driver) {
      return <EmptyState title="المندوب غير موجود" text="لم يتم العثور على ملف المندوب ضمن بيانات العرض" icon={AlertTriangle} />;
    }

    const assignments = assignmentsForDriver(driver.id);
    const primary = primaryAssignment(driver.id);
    const linkedVehicle = vehicles.find((vehicle) => vehicle.plate === driver.vehicle || vehicle.id === driver.vehicleId);
    const driverTasks = allTasks.filter((task) => task.driver === driver.name);
    const profileFields = [
      field("الاسم الكامل", driver.name),
      field("رقم الهوية / الإقامة", driver.nationalId),
      field("نوع الهوية", driver.identityType ?? "هوية وطنية"),
      field("الجنسية", driver.nationality ?? "سعودي"),
      field("تاريخ الميلاد", driver.birthDate ?? "1992-01-01"),
      field("العمر", driver.age ?? 32),
      field("رقم الجوال", driver.phone),
      field("البريد الإلكتروني", driver.email ?? "driver@example.sa"),
      field("المدينة", driver.city),
      field("العنوان", driver.address ?? driver.lastLocation),
      field("جهة اتصال للطوارئ", driver.emergencyContact ?? "غير محدد"),
      field("ملاحظات", driver.notes)
    ];
    const documentFields = [
      field("رقم رخصة القيادة", driver.licenseNumber ?? "L-DEMO"),
      field("نوع الرخصة", driver.licenseType ?? "خصوصي"),
      field("تاريخ إصدار الرخصة", driver.licenseIssueDate ?? "2024-01-01"),
      field("تاريخ انتهاء الرخصة", driver.licenseExpiryDate ?? "2028-01-01"),
      field("حالة الرخصة", driver.licenseStatus ?? driverCompliance(driver)),
      field("تاريخ انتهاء الهوية / الإقامة", driver.identityExpiryDate ?? "2028-01-01"),
      field("حالة الهوية", driver.identityStatus ?? driverCompliance(driver)),
      field("صورة الهوية", driver.identityFile ?? "مرفق تجريبي"),
      field("صورة الرخصة", driver.licenseFile ?? "مرفق تجريبي"),
      field("صورة العقد", driver.contractFile ?? "مرفق تجريبي"),
      field("صورة التأمين", driver.insuranceFile ?? "مرفق تجريبي")
    ];
    const agreementFields = [
      field("نوع الاتفاق", driver.agreementType ?? "راتب + عمولة"),
      field("الراتب الأساسي", driver.baseSalary ?? 0),
      field("عمولة الطلب", driver.commissionPerOrder ?? 0),
      field("عمولة الطرد", driver.commissionPerParcel ?? 0),
      field("تاريخ بداية العقد", driver.contractStartDate ?? "2026-01-01"),
      field("تاريخ نهاية العقد", driver.contractEndDate ?? "2026-12-31"),
      field("حالة العقد", driver.contractStatus ?? "ساري"),
      field("نوع الدوام", driver.workType ?? "دوام كامل"),
      field("عدد ساعات الدوام", driver.workHours ?? "8 ساعات"),
      field("أيام العمل", driver.workDays ?? "الأحد - الخميس"),
      field("أيام الإجازة", driver.offDays ?? "الجمعة والسبت")
    ];
    const performance = [
      ["إجمالي المهام", driver.tasksToday],
      ["تم التسليم", driver.deliveredToday],
      ["تعثر التسليم", driver.failedAttempts],
      ["المرتجعات", driver.returnsThisMonth ?? 0],
      ["نسبة النجاح", percent(driver.successRate)],
      ["متوسط وقت التسليم", driver.averageDeliveryTime ?? "35 دقيقة"],
      ["تقييم الالتزام", driver.commitmentRating ?? "جيد"],
      ["أيام الغياب", driver.absenceDays ?? 0]
    ];
    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <span className="section-eyebrow">ملف مندوب رئيسي</span>
              <h3>{driver.name}</h3>
              <p>بيانات الهوية والرخصة والعقد والمنطقة والمركبة والجاهزية التشغيلية في سجل واحد.</p>
            </div>
            <div className="row-actions">
              <Badge>{driverStatus(driver)}</Badge>
              <Link className="ghost-button" href={`/drivers/${routeId(driver.id)}/edit`}><RefreshCw size={18} />تحرير</Link>
              <button className="ghost-button" type="button" onClick={() => assignDriverToNextArea(driver)}><MapPinned size={18} />إسناد منطقة</button>
              <button className="ghost-button" type="button" onClick={() => toast("تم فتح إجراء ربط مركبة كتجربة محلية")}><Car size={18} />ربط مركبة</button>
              <button className="danger-button" type="button" onClick={() => toast(driverStatus(driver).includes("موقوف") ? "تم تفعيل المندوب تجريبيًا" : "تم إيقاف المندوب تجريبيًا")}><AlertTriangle size={18} />إيقاف / تفعيل</button>
              <Link className="ghost-button" href="/drivers"><ChevronLeft size={18} />رجوع للمناديب</Link>
            </div>
          </div>
          <div className="kpi-grid">
            {[
              ["حالة المندوب", driver.status],
              ["نسبة الجاهزية", percent(driverReadiness(driver))],
              ["المنطقة الأساسية", areaName(primary?.areaId ?? driver.primaryAreaId)],
              ["نوع الاتفاق", driver.agreementType ?? "راتب + عمولة"],
              ["حالة الهوية", driver.identityStatus ?? driverCompliance(driver)],
              ["حالة الرخصة", driver.licenseStatus ?? driverCompliance(driver)],
              ["المهام المنجزة هذا الشهر", driver.completedThisMonth ?? driver.deliveredToday],
              ["آخر نشاط", driver.lastActivity ?? "اليوم"]
            ].map(([label, value]) => (
              <article className="card kpi-card" key={String(label)}>
                <h3>{String(label)}</h3>
                <div className="kpi-value" style={{ fontSize: 22 }}>{String(value)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="command-card">
          <div className="segmented profile-tabs" role="tablist" aria-label="تبويبات ملف المندوب">
            {profileTabs.map((tab) => (
              <button key={tab} className={profileTab === tab ? "is-active" : ""} type="button" onClick={() => setProfileTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 12 }}>التبويب الحالي: {profileTab}. كل بيانات الملف معروضة أدناه للعرض الإداري السريع.</p>
        </section>

        <section className="two-grid">
          <InfoPanel title="البيانات الشخصية" fields={profileFields} />
          <InfoPanel title="الرخصة والوثائق" fields={documentFields} />
        </section>

        <section className="two-grid">
          <InfoPanel title="العقد والاتفاقيات" fields={agreementFields} note="هذه بيانات اتفاق تشغيلية وليست نظام رواتب أو محاسبة." />
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>المناطق والتغطية</h3>
                <p>إسناد المندوب إلى منطقة أساسية ومناطق احتياطية.</p>
              </div>
              <button className="primary-button" type="button" onClick={() => assignDriverToNextArea(driver)}>
                <MapPinned size={18} />
                إسناد إلى منطقة
              </button>
            </div>
            <div className="page-grid">
              {assignments.map((assignment) => (
                <article className="task-card" key={`${assignment.driverId}-${assignment.areaId}`}>
                  <h4>{areaName(assignment.areaId)}</h4>
                  <div className="task-meta">
                    <Badge>{assignment.coverageType}</Badge>
                    <span className="route-chip">{assignment.timeWindow}</span>
                  </div>
                  <dl className="compact-list">
                    <div><dt>بداية التعيين</dt><dd>{assignment.startDate}</dd></div>
                    <div><dt>نهاية التعيين</dt><dd>{assignment.endDate}</dd></div>
                    <div><dt>أولوية التوزيع</dt><dd>{assignment.priority}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="two-grid">
          <InfoPanel
            title="المركبة"
            fields={[
              field("رقم اللوحة", linkedVehicle?.plate ?? driver.vehicle),
              field("نوع المركبة", linkedVehicle?.type ?? "غير محدد"),
              field("حالة المركبة", linkedVehicle?.status ?? "غير محدد"),
              field("التأمين", linkedVehicle?.insurance ?? "غير محدد"),
              field("الاستمارة", linkedVehicle?.registration ?? "غير محدد"),
              field("الفحص الدوري", linkedVehicle?.inspection ?? "غير محدد"),
              field("تاريخ الربط بالمندوب", "2026-07-01"),
              field("ملاحظات", linkedVehicle?.notes ?? "لا توجد ملاحظات")
            ]}
          />
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>الأداء</h3>
                <p>قراءة تشغيلية مختصرة دون بناء نظام محاسبة أو رواتب.</p>
              </div>
              <Badge>{percent(driver.successRate)}</Badge>
            </div>
            <div className="three-grid">
              {performance.map(([label, value]) => (
                <article className="task-card" key={String(label)}>
                  <span className="muted">{String(label)}</span>
                  <strong>{String(value)}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="two-grid">
          <div className="command-card">
            <div className="card-header"><div><h3>المهام</h3><p>آخر المهام المسندة للقراءة فقط.</p></div><Badge>{ar(driverTasks.length)}</Badge></div>
            <div className="page-grid">
              {driverTasks.length ? driverTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <h4>{task.id}</h4>
                  <div className="task-meta"><Badge>{task.taskType}</Badge><Badge>{task.status}</Badge></div>
                  <dl className="compact-list">
                    <div><dt>الشريك</dt><dd>{task.partner}</dd></div>
                    <div><dt>الاستلام</dt><dd>{task.pickup}</dd></div>
                    <div><dt>التسليم</dt><dd>{task.delivery}</dd></div>
                  </dl>
                </article>
              )) : <EmptyState title="لا توجد مهام مسندة" text="لا توجد مهام حالية مرتبطة بهذا المندوب" icon={ClipboardList} />}
            </div>
          </div>
          <div className="command-card">
            <div className="card-header"><div><h3>سجل الأنشطة</h3><p>أثر تدقيق تجريبي خاص بملف المندوب.</p></div><Badge>تجريبي</Badge></div>
            <div className="timeline">
              {["تم إنشاء المندوب", "تم تحديث الرخصة", "تم ربط مركبة", "تم إسناده إلى منطقة", "تم تغيير نوع الاتفاق"].map((item) => (
                <div className="timeline-item" key={item}>
                  <span className="timeline-dot"><Activity size={16} /></span>
                  <div><strong>{item}</strong><p>{driver.name} · سجل تجريبي محفوظ محلياً</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  function CoverageAreaProfilePage({ area }: { area?: CoverageArea }) {
    if (!area) {
      return <EmptyState title="المنطقة غير موجودة" text="لم يتم العثور على منطقة التغطية المطلوبة" icon={AlertTriangle} />;
    }
    const areaAssignments = driverAreaAssignments.filter((assignment) => assignment.areaId === area.id);
    const assignedDrivers = drivers.filter((driver) => area.assignedDriverIds.includes(driver.id) || areaAssignments.some((assignment) => assignment.driverId === driver.id));
    const linkedPickupPoints = pickupPoints.filter((point) => area.pickupPointIds.includes(point.id));

    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <span className="section-eyebrow">منطقة تغطية</span>
              <h3>{area.name}</h3>
              <p>{area.city} · {area.neighborhoods.join("، ")}</p>
            </div>
            <Badge>{area.status}</Badge>
          </div>
          <div className="kpi-grid">
            {[
              ["المدينة", area.city],
              ["المناديب المعينون", assignedDrivers.length],
              ["نقاط الاستلام", linkedPickupPoints.length],
              ["مهام اليوم", area.tasksToday],
              ["نسبة التسليم", percent(area.successRate)],
              ["مستوى الضغط التشغيلي", area.pressureLevel],
              ["الطاقة التشغيلية", area.capacity],
              ["متوسط وقت التسليم", area.averageDeliveryTime]
            ].map(([label, value]) => (
              <article className="card kpi-card" key={String(label)}>
                <h3>{String(label)}</h3>
                <div className="kpi-value" style={{ fontSize: 22 }}>{String(value)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="two-grid">
          <InfoPanel title="الأحياء" fields={area.neighborhoods.map((name, index) => field(`حي ${ar(index + 1)}`, name))} />
          <div className="command-card">
            <div className="card-header">
              <div><h3>المناديب المعينون</h3><p>ربط المنطقة بعدة مناديب مع نوع التغطية.</p></div>
              <button className="primary-button" type="button" onClick={() => addDriverToArea(area)}>
                <UserRound size={18} />
                إضافة مندوب للمنطقة
              </button>
            </div>
            <div className="page-grid">
              {assignedDrivers.length ? assignedDrivers.map((driver) => {
                const assignment = areaAssignments.find((item) => item.driverId === driver.id);
                return (
                  <article className="task-card" key={driver.id}>
                    <h4>{driver.name}</h4>
                    <div className="task-meta"><Badge>{assignment?.coverageType ?? "أساسي"}</Badge><Badge>{driver.status}</Badge></div>
                    <dl className="compact-list">
                      <div><dt>وقت التغطية</dt><dd>{assignment?.timeWindow ?? "غير محدد"}</dd></div>
                      <div><dt>مهام اليوم</dt><dd>{ar(driver.tasksToday)}</dd></div>
                      <div><dt>نسبة النجاح</dt><dd>{percent(driver.successRate)}</dd></div>
                    </dl>
                  </article>
                );
              }) : <EmptyState title="لا يوجد مناديب معينون لهذه المنطقة" text="يمكن إضافة مندوب للمنطقة من زر الإسناد التجريبي" icon={UserRound} />}
            </div>
          </div>
        </section>

        <section className="two-grid">
          <div className="command-card">
            <div className="card-header"><div><h3>نقاط الاستلام</h3><p>النقاط المرتبطة بنطاق المنطقة.</p></div><Badge>{ar(linkedPickupPoints.length)}</Badge></div>
            <div className="page-grid">
              {linkedPickupPoints.length ? linkedPickupPoints.map((point) => (
                <article className="task-card" key={point.id}>
                  <h4>{point.name}</h4>
                  <div className="task-meta"><Badge>{point.status}</Badge><span className="route-chip">{point.partner}</span></div>
                  <p className="muted">{point.type} · {point.district}</p>
                </article>
              )) : <EmptyState title="لا توجد نقاط استلام مضافة بعد" text="لا توجد نقاط مرتبطة بهذه المنطقة في بيانات العرض" icon={MapPinned} />}
            </div>
          </div>
          <div className="command-card">
            <div className="card-header"><div><h3>أداء المنطقة</h3><p>مؤشرات تشغيلية يومية للمنطقة.</p></div><Badge>{percent(area.successRate)}</Badge></div>
            <div className="three-grid">
              {[
                ["مهام اليوم", area.tasksToday],
                ["تم التسليم", Math.round(area.tasksToday * area.successRate / 100)],
                ["قيد التوصيل", Math.max(0, area.tasksToday - Math.round(area.tasksToday * area.successRate / 100))],
                ["تعثر التسليم", Math.max(1, Math.round(area.tasksToday * 0.04))],
                ["مرتجعات", Math.max(0, Math.round(area.tasksToday * 0.02))],
                ["متوسط وقت التسليم", area.averageDeliveryTime]
              ].map(([label, value]) => <article className="task-card" key={String(label)}><span className="muted">{String(label)}</span><strong>{String(value)}</strong></article>)}
            </div>
          </div>
        </section>

        <section className="command-card">
          <div className="card-header"><div><h3>خريطة تجريبية</h3><p>خريطة تجريبية لتوضيح نطاق التغطية.</p></div><MapPinned color="#F39818" /></div>
          <div className="map-placeholder"><div className="map-route" /><span className="map-pin one" /><span className="map-pin two" /><span className="map-pin three" /></div>
        </section>
      </div>
    );
  }

  function InfoPanel({ title, fields, note }: { title: string; fields: Field[]; note?: string }) {
    return (
      <section className="command-card">
        <div className="card-header"><div><h3>{title}</h3>{note ? <p>{note}</p> : null}</div></div>
        <dl className="detail-list">
          {fields.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
        </dl>
      </section>
    );
  }

  function assignDriverToNextArea(driver: Driver) {
    const currentAreaIds = assignmentsForDriver(driver.id).map((assignment) => assignment.areaId);
    const target = coverageAreas.find((area) => !currentAreaIds.includes(area.id)) ?? coverageAreas[0];
    if (!target) return;
    if (driverCompliance(driver) !== "ساري") {
      toast("لا يمكن اعتماد الإسناد لأن بيانات المندوب تحتاج مراجعة. تم حفظه كتجربة مع تحذير.");
    }
    const assignment: DriverAreaAssignment = {
      driverId: driver.id,
      areaId: target.id,
      coverageType: currentAreaIds.length ? "احتياطي" : "أساسي",
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      timeWindow: "09:00 - 17:00",
      priority: "أولوية متوسطة",
      notes: "إسناد تجريبي محفوظ محلياً"
    };
    setDriverAreaAssignments((current) => [assignment, ...current]);
    setCoverageAreas((current) => current.map((area) => area.id === target.id ? { ...area, assignedDriverIds: Array.from(new Set([...area.assignedDriverIds, driver.id])) } : area));
    addLog("إسناد مندوب إلى منطقة", driver.id, `تم إسناد ${driver.name} إلى ${target.name}`);
    toast("تم حفظ إسناد المنطقة التجريبي");
  }

  function addDriverToArea(area: CoverageArea) {
    const driver = drivers.find((item) => !area.assignedDriverIds.includes(item.id)) ?? drivers[0];
    if (!driver) return;
    if (driverCompliance(driver) !== "ساري") {
      toast("المندوب يحتاج مراجعة وثائق قبل الاعتماد النهائي. تم الحفظ كتجربة.");
    }
    const assignment: DriverAreaAssignment = {
      driverId: driver.id,
      areaId: area.id,
      coverageType: area.assignedDriverIds.length ? "احتياطي" : "أساسي",
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      timeWindow: "10:00 - 18:00",
      priority: "أولوية متوسطة",
      notes: "إضافة تجريبية من ملف المنطقة"
    };
    setDriverAreaAssignments((current) => [assignment, ...current]);
    setCoverageAreas((current) => current.map((item) => item.id === area.id ? { ...item, assignedDriverIds: Array.from(new Set([...item.assignedDriverIds, driver.id])) } : item));
    addLog("إضافة مندوب لمنطقة", area.id, `تمت إضافة ${driver.name} إلى ${area.name}`);
    toast("تمت إضافة المندوب للمنطقة");
  }

  function NewCoverageAreaForm() {
    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = String(data.get("name") ?? "").trim();
      const city = String(data.get("city") ?? "").trim();
      if (!name || !city) {
        toast("اسم المنطقة والمدينة مطلوبة");
        return;
      }
      const area: CoverageArea = {
        id: `area-demo-${coverageAreas.length + 1}`,
        name,
        city,
        neighborhoods: String(data.get("neighborhoods") ?? "حي تجريبي").split("،").map((item) => item.trim()).filter(Boolean),
        status: "تحتاج مراجعة",
        areaType: String(data.get("areaType") ?? "منطقة تشغيل"),
        capacity: Number(data.get("capacity") ?? 4),
        assignedDriverIds: [],
        pickupPointIds: [],
        partnerIds: [],
        tasksToday: 0,
        successRate: 0,
        pressureLevel: "غير محدد",
        averageDeliveryTime: "غير محدد",
        notes: String(data.get("notes") ?? "منطقة تجريبية")
      };
      setCoverageAreas((current) => [area, ...current]);
      addLog("إنشاء منطقة تغطية", area.id, `تم إنشاء منطقة ${area.name}`);
      toast("تم حفظ منطقة التغطية");
      router.push("/coverage-areas");
    }

    return (
      <FormCard title="إضافة منطقة تغطية" description="إنشاء منطقة تشغيل تجريبية دون ربط خرائط أو تتبع فعلي">
        <form className="form-stack" onSubmit={submit}>
          <div className="two-grid">
            <Input name="name" label="اسم المنطقة" placeholder="شمال جدة" />
            <Select name="city" label="المدينة" options={cities} />
            <Select name="areaType" label="نوع المنطقة" options={["منطقة تشغيل", "منطقة استلام", "منطقة تسليم", "منطقة مشتركة", "منطقة موسمية", "منطقة عالية الطلب"]} />
            <Input name="capacity" label="الطاقة التشغيلية" placeholder="6" type="number" />
          </div>
          <TextArea name="neighborhoods" label="الأحياء" placeholder="أبحر، النعيم، السلامة" />
          <TextArea name="notes" label="ملاحظات" placeholder="ملاحظات تشغيلية للمنطقة" />
          <FormActions />
        </form>
      </FormCard>
    );
  }

  function NewPartnerForm() {
    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const name = String(data.get("name") ?? "").trim();
      const type = String(data.get("type") ?? "").trim();
      const city = String(data.get("city") ?? "").trim();
      const phone = String(data.get("phone") ?? "").trim();
      if (!name || !type || !city) {
        toast("الشريك مطلوب والمدينة مطلوبة");
        return;
      }
      if (phone && !/^٠٥/.test(phone)) {
        toast("رقم الجوال غير صحيح");
        return;
      }
      const partner: Partner = {
        id: `ش-${ar(partners.length + 1001)}`,
        name,
        type,
        contact: String(data.get("contact") ?? "جهة اتصال تشغيلية"),
        phone: phone || "غير محدد",
        email: "",
        city,
        operation: String(data.get("operation") ?? "تشغيل توصيل"),
        pickupPoints: "نقطة واحدة",
        status: "قيد التجهيز",
        orders: 0,
        parcels: 0,
        successRate: 0,
        returns: 0,
        notes: String(data.get("notes") ?? "تم إنشاء الشريك من العرض التجريبي")
      };
      setPartners((current) => [partner, ...current]);
      addLog("إنشاء شريك", partner.id, "تم إنشاء شريك جديد في العرض التجريبي");
      toast("تم إنشاء الشريك");
      router.push("/partners");
    }

    return (
      <FormCard title="إضافة شريك" description="إدخال بيانات شريك تشغيل جديد مع رسائل تحقق عربية">
        <form className="form-stack" onSubmit={submit}>
          <div className="two-grid">
            <Input name="name" label="اسم الشريك" placeholder="مثال: متجر إلكتروني" />
            <Select name="type" label="نوع الشريك" options={partnerTypes} />
            <Input name="contact" label="جهة الاتصال" placeholder="مسؤول التشغيل" />
            <Input name="phone" label="رقم الجوال" placeholder="٠٥٥١٢٣٤٥٦٧" />
            <Select name="city" label="المدينة" options={cities} />
            <Input name="operation" label="نوع التشغيل" placeholder="طلبات وطرود" />
          </div>
          <TextArea name="notes" label="ملاحظات تشغيلية" placeholder="ملاحظات مختصرة عن التشغيل المتوقع" />
          <FormActions />
        </form>
      </FormCard>
    );
  }

  function NewOrderForm() {
    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const partner = String(data.get("partner") ?? "").trim();
      const pickup = String(data.get("pickup") ?? "").trim();
      const delivery = String(data.get("delivery") ?? "").trim();
      const driver = String(data.get("driver") ?? "").trim();
      if (!partner) return toast("الشريك مطلوب");
      if (!pickup) return toast("نقطة الاستلام مطلوبة");
      if (!delivery) return toast("عنوان التسليم مطلوب");
      if (!driver) return toast("المندوب مطلوب");
      const selectedDriver = drivers.find((item) => item.name === driver);
      const order: Order = {
        id: `عزم-طلب-${ar(orders.length + 1001)}`,
        partnerRef: `شريك-${ar(orders.length + 8500)}`,
        partner,
        type: String(data.get("type") ?? "طلب شركة"),
        customer: "عميل تجريبي",
        phone: "٠٥٠٠٠٠٩٩٩٩",
        pickup,
        delivery,
        city: String(data.get("city") ?? "جدة"),
        district: String(data.get("district") ?? "حي تجريبي"),
        driver,
        vehicle: selectedDriver?.vehicle ?? "غير محدد",
        status: "مسند إلى مندوب",
        priority: String(data.get("priority") ?? "متوسطة"),
        pickupTime: "اليوم",
        deliveryTime: "اليوم",
        notes: String(data.get("notes") ?? "طلب تجريبي جديد")
      };
      setOrders((current) => [order, ...current]);
      addLog("إنشاء طلب", order.id, "تم إنشاء طلب جديد وإسناده");
      toast("تم إنشاء الطلب");
      router.push("/orders");
    }

    return (
      <FormCard title="إضافة طلب" description="طلب توصيل للتطبيقات أو الشركات مع إسناد أولي للمندوب">
        <form className="form-stack" onSubmit={submit}>
          <div className="two-grid">
            <Select name="partner" label="الشريك" options={partners.map((item) => item.name)} />
            <Select name="type" label="نوع الطلب" options={["طلب مطعم", "طلب متجر", "طلب سريع", "طلب مجدول", "طلب شركة"]} />
            <Input name="pickup" label="نقطة الاستلام" placeholder="اسم الفرع أو نقطة الاستلام" />
            <Input name="delivery" label="عنوان التسليم" placeholder="الحي والشارع" />
            <Select name="city" label="المدينة" options={cities} />
            <Input name="district" label="الحي" placeholder="حي تجريبي" />
            <Select name="driver" label="المندوب" options={drivers.map((item) => item.name)} />
            <Select name="priority" label="أولوية الطلب" options={["عاجلة", "عالية", "متوسطة", "عادية"]} />
          </div>
          <TextArea name="notes" label="ملاحظات" placeholder="أي ملاحظة تشغيلية مهمة" />
          <FormActions />
        </form>
      </FormCard>
    );
  }

  function NewParcelForm() {
    function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const partner = String(data.get("partner") ?? "").trim();
      const pickup = String(data.get("pickup") ?? "").trim();
      const delivery = String(data.get("delivery") ?? "").trim();
      const driver = String(data.get("driver") ?? "").trim();
      if (!partner) return toast("الشريك مطلوب");
      if (!pickup) return toast("نقطة الاستلام مطلوبة");
      if (!delivery) return toast("عنوان التسليم مطلوب");
      if (!driver) return toast("المندوب مطلوب");
      const selectedDriver = drivers.find((item) => item.name === driver);
      const parcel: Parcel = {
        id: `عزم-طرد-${ar(parcels.length + 2001)}`,
        tracking: `تتبع-${ar(parcels.length + 4500)}`,
        partner,
        customer: "عميل تجريبي",
        phone: "٠٥١١١١٩٩٩٩",
        pickup,
        delivery,
        city: String(data.get("city") ?? "جدة"),
        district: String(data.get("district") ?? "حي تجريبي"),
        weight: String(data.get("weight") ?? "١ كجم"),
        pieces: String(data.get("pieces") ?? "قطعة واحدة"),
        fragile: String(data.get("fragile") ?? "لا"),
        signature: String(data.get("signature") ?? "نعم"),
        proof: String(data.get("proof") ?? "رمز تحقق"),
        driver,
        vehicle: selectedDriver?.vehicle ?? "غير محدد",
        status: "مسند إلى مندوب",
        notes: String(data.get("notes") ?? "طرد تجريبي جديد")
      };
      setParcels((current) => [parcel, ...current]);
      addLog("إنشاء طرد", parcel.id, "تم إنشاء طرد جديد وإسناده");
      toast("تم إنشاء الطرد");
      router.push("/parcels");
    }

    return (
      <FormCard title="إضافة طرد" description="إدخال طرد ميل أخير مع إثبات التسليم والوزن وعدد القطع">
        <form className="form-stack" onSubmit={submit}>
          <div className="two-grid">
            <Select name="partner" label="الشريك" options={partners.map((item) => item.name)} />
            <Input name="pickup" label="نقطة الاستلام" placeholder="نقطة الشريك أو مركز التوزيع" />
            <Input name="delivery" label="عنوان التسليم" placeholder="المدينة والحي والشارع" />
            <Select name="city" label="المدينة" options={cities} />
            <Input name="district" label="الحي" placeholder="حي تجريبي" />
            <Input name="weight" label="الوزن" placeholder="٢ كجم" />
            <Select name="pieces" label="عدد القطع" options={["قطعة واحدة", "قطعتان", "ثلاث قطع"]} />
            <Select name="fragile" label="قابل للكسر" options={["لا", "نعم"]} />
            <Select name="signature" label="يحتاج توقيع" options={["نعم", "لا"]} />
            <Select name="proof" label="طريقة إثبات التسليم" options={["توقيع العميل", "صورة التسليم", "رمز تحقق", "ملاحظة"]} />
            <Select name="driver" label="المندوب" options={drivers.map((item) => item.name)} />
          </div>
          <TextArea name="notes" label="ملاحظات" placeholder="أي ملاحظة تشغيلية مهمة" />
          <FormActions />
        </form>
      </FormCard>
    );
  }

  function BayanReadinessPage() {
    const completed = Object.values(checklist).filter(Boolean).length;
    const cards = [
      { label: "الحالة الحالية", value: "غير مربوط", icon: ShieldCheck },
      { label: "الجاهزية", value: "قيد التجهيز", icon: ListChecks },
      { label: "آخر فحص", value: "غير متوفر", icon: AlertTriangle },
      { label: "آخر مزامنة", value: "لا توجد", icon: Activity }
    ];
    return (
      <div className="page-grid">
        <section className="kpi-grid">
          {cards.map(({ label, value, icon: Icon }) => (
            <article className="card kpi-card" key={label}>
              <header>
                <h3>{label}</h3>
                <Icon size={22} color="#F39818" />
              </header>
              <div className="kpi-value" style={{ fontSize: 28 }}>
                {value}
              </div>
              <span className="kpi-trend">بيئة الربط غير مفعلة</span>
            </article>
          ))}
        </section>

        <section className="section-grid">
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>متطلبات البيانات</h3>
                <p>{ar(completed)} من {ar(bayanChecklistItems.length)} عناصر مكتملة للجاهزية التجريبية</p>
              </div>
              <Badge>قيد التجهيز</Badge>
            </div>
            <div className="checklist">
              {bayanChecklistItems.map((item) => (
                <div className="check-row" key={item}>
                  <span>{item}</span>
                  <button
                    className={checklist[item] ? "secondary-button" : "ghost-button"}
                    type="button"
                    onClick={() => {
                      setChecklist((current) => ({ ...current, [item]: !current[item] }));
                      addLog("تحديث جاهزية بيان", item, "تم تحديث حالة عنصر من قائمة الجاهزية", "قيد التجهيز");
                    }}
                  >
                    <CheckCircle2 size={18} />
                    {checklist[item] ? "مكتمل" : "غير مكتمل"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>بيانات المنشأة</h3>
                <p>حقول تحضيرية فقط دون اتصال حكومي في هذه المرحلة</p>
              </div>
              <Badge>قيد المراجعة</Badge>
            </div>
            <dl className="detail-list">
              <div>
                <dt>اسم المنشأة</dt>
                <dd>شركة عزم للخدمات اللوجستية</dd>
              </div>
              <div>
                <dt>رقم السجل التجاري</dt>
                <dd>محجوب للعرض</dd>
              </div>
              <div>
                <dt>الرقم الضريبي</dt>
                <dd>محجوب للعرض</dd>
              </div>
              <div>
                <dt>نوع الترخيص</dt>
                <dd>تشغيل لوجستي</dd>
              </div>
              <div>
                <dt>رقم الترخيص</dt>
                <dd>غير مدخل</dd>
              </div>
              <div>
                <dt>المدينة</dt>
                <dd>جدة</dd>
              </div>
              <div>
                <dt>حالة البيانات</dt>
                <dd>ناقصة البيانات</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section-grid">
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>إعدادات الربط</h3>
                <p>قيم حساسة مخفية ومهيأة لاحقا من متغيرات البيئة</p>
              </div>
              <Badge>غير مربوط</Badge>
            </div>
            <dl className="detail-list">
              <div>
                <dt>رابط الخدمة</dt>
                <dd>غير مفعل</dd>
              </div>
              <div>
                <dt>معرف العميل</dt>
                <dd>********</dd>
              </div>
              <div>
                <dt>المفتاح السري</dt>
                <dd>********</dd>
              </div>
              <div>
                <dt>بيئة الربط</dt>
                <dd>غير مفعلة</dd>
              </div>
              <div>
                <dt>حالة الربط</dt>
                <dd>غير مربوط</dd>
              </div>
            </dl>
          </div>

          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>سجل المزامنة</h3>
                <p>لم يتم تنفيذ أي مزامنة فعلية</p>
              </div>
              <Badge>لم يبدأ</Badge>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot">
                  <Activity size={16} />
                </span>
                <div>
                  <strong>لا توجد مزامنة فعلية</strong>
                  <p>النظام جاهز لتسجيل محاولات الربط عند توفر بيانات الاعتماد</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot">
                  <ListChecks size={16} />
                </span>
                <div>
                  <strong>تحضير السجلات</strong>
                  <p>وثائق النقل محفوظة ولا يتم حذفها أو الكتابة فوقها</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  function ReportsPage() {
    const reports = [
      "تقرير الشركاء",
      "تقرير المناديب",
      "تقرير الطلبات",
      "تقرير الطرود",
      "تقرير التسليم",
      "تقرير التعثر",
      "تقرير المرتجعات",
      "تقرير جاهزية بيان"
    ];
    return (
      <div className="page-grid">
        <section className="command-card">
          <div className="card-header">
            <div>
              <h3>التقارير</h3>
              <p>تقارير تشغيلية بمحددات تاريخ وشريك ومدينة ومندوب وحالة</p>
            </div>
            <button className="ghost-button" type="button">
              <Download size={18} />
              تصدير التقرير
            </button>
          </div>
          <div className="toolbar">
            <div className="toolbar-group">
              <Select name="date" label="التاريخ" options={["اليوم", "آخر سبعة أيام", "هذا الشهر"]} compact />
              <Select name="partner" label="الشريك" options={["كل الشركاء", ...partners.map((item) => item.name)]} compact />
              <Select name="city" label="المدينة" options={["كل المدن", ...cities]} compact />
              <Select name="status" label="الحالة" options={["كل الحالات", ...orderStatuses.slice(0, 5)]} compact />
            </div>
          </div>
          <div className="report-chart" aria-label="رسم بياني تجريبي">
            {[62, 78, 54, 88, 72, 96, 68, 82].map((height, index) => (
              <div className="report-bar" style={{ height: `${height}%` }} key={height + index}>
                <span>{ar(height)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="three-grid">
          {reports.map((report, index) => (
            <article className="card" key={report}>
              <div className="card-header">
                <div>
                  <h3>{report}</h3>
                  <p>جاهز للعرض والتصدير عند ربط مصادر البيانات</p>
                </div>
                <Badge>{index < 4 ? "نشط" : "قيد التجهيز"}</Badge>
              </div>
              <dl className="compact-list">
                <div>
                  <dt>عدد السجلات</dt>
                  <dd>{ar(120 + index * 17)}</dd>
                </div>
                <div>
                  <dt>آخر تحديث</dt>
                  <dd>اليوم</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </div>
    );
  }

  function SettingsPage() {
    const permissions = [
      "عرض",
      "إنشاء",
      "تعديل",
      "حذف",
      "اعتماد",
      "إسناد",
      "تصدير",
      "إدارة الإعدادات",
      "إدارة الربط",
      "عرض التقارير",
      "عرض السجلات"
    ];

    return (
      <div className="page-grid">
        <section className="section-grid">
          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>وضع الأدوار التجريبي</h3>
                <p>تبديل الدور يغيّر منظور العرض دون مصادقة حقيقية في المرحلة الأولى</p>
              </div>
              <Badge>{roleLabel}</Badge>
            </div>
            <div className="role-grid">
              {roles.map((item) => (
                <button
                  className={`role-option ${role === item.key ? "is-active" : ""}`}
                  type="button"
                  key={item.key}
                  onClick={() => {
                    setRole(item.key);
                    toast("تم تبديل الدور التجريبي");
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="command-card">
            <div className="card-header">
              <div>
                <h3>جاهزية الإنتاج</h3>
                <p>الإعدادات الحساسة تأتي من متغيرات البيئة ولا تظهر في الواجهة</p>
              </div>
              <Badge>جاهز للتوثيق</Badge>
            </div>
            <dl className="detail-list">
              <div>
                <dt>عنوان التطبيق العام</dt>
                <dd>من متغير البيئة</dd>
              </div>
              <div>
                <dt>قاعدة البيانات</dt>
                <dd>جاهزة للإضافة لاحقا</dd>
              </div>
              <div>
                <dt>أسرار الربط</dt>
                <dd>مخفية بالكامل</dd>
              </div>
              <div>
                <dt>الاستضافة</dt>
                <dd>مهيأة لهوستنجر</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="table-card">
          <div className="card-header">
            <div>
              <h3>الصلاحيات</h3>
              <p>صلاحيات قائمة على الإجراء وقابلة للربط لاحقا بنظام مصادقة</p>
            </div>
            <Badge>تجريبي</Badge>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدور</th>
                  <th>الصلاحيات</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td>{item.key === "driver" ? "عرض، تعديل حالة، إثبات التسليم" : permissions.join("، ")}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }
}

function LoginPage({
  role,
  setRole,
  onEnter
}: {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  onEnter: () => void;
}) {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div>
            <div className="brand-mark">عزم</div>
            <h1>منصة عزم للتشغيل اللوجستي</h1>
            <p>
              مركز قيادة عربي لإدارة الطلبات والطرود والمناديب والمركبات والشركاء، مصمم كقاعدة أولى لنظام
              تشغيل مؤسسي قابل للتوسع.
            </p>
          </div>
          <div className="login-metrics">
            <div className="login-metric">
              <strong>١٢</strong>
              <span>مؤشر تشغيلي</span>
            </div>
            <div className="login-metric">
              <strong>٢٨</strong>
              <span>مسار صفحة</span>
            </div>
            <div className="login-metric">
              <strong>٦</strong>
              <span>أدوار تجريبية</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <span className="section-eyebrow">دخول تجريبي</span>
          <h2>تسجيل الدخول</h2>
          <p className="muted">اختر الدور المناسب للدخول إلى تجربة المرحلة الأولى.</p>
          <div className="form-stack">
            <Input name="login" label="البريد الإلكتروني أو رقم الجوال" placeholder="٠٥٥١٢٣٤٥٦٧" />
            <Input name="password" label="كلمة المرور" placeholder="••••••••" type="password" />
            <div>
              <label className="section-eyebrow">الدور التجريبي</label>
              <div className="role-grid">
                {roles.map((item) => (
                  <button
                    className={`role-option ${role === item.key ? "is-active" : ""}`}
                    type="button"
                    key={item.key}
                    onClick={() => setRole(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-button" type="button" onClick={onEnter}>
              <ArrowUpRight size={18} />
              دخول إلى المنصة
            </button>
            <p className="muted">لا توجد مصادقة حقيقية في هذه المرحلة، وجميع البيانات تجريبية وغير شخصية.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Sidebar({
  pathname,
  role,
  setRole
}: {
  pathname: string;
  role: RoleKey;
  setRole: (role: RoleKey) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">عزم</div>
        <div>
          <strong>عزم للتشغيل</strong>
          <span>مركز العمليات اللوجستية</span>
        </div>
      </div>

      <nav className="sidebar-nav-scroll" aria-label="التنقل الرئيسي">
        {operationsNavGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            <div className="nav-list">
              {group.items.map((item) => (
                <Link className={`nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`} href={item.href} key={item.href}>
                  <span className="nav-icon">
                    <item.icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="account-card">
          <div className="account-avatar">م</div>
          <div className="account-copy">
            <span>المدير العام</span>
            <strong>متصل</strong>
          </div>
        </div>
        <select className="role-pill" value={role} onChange={(event) => setRole(event.target.value as RoleKey)} aria-label="الدور التجريبي">
          {roles.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <Link className="logout-link" href="/login">
          <LogOut size={17} />
          تسجيل الخروج
        </Link>
      </div>
    </aside>
  );
}

function Topbar({ title, roleLabel }: { title: string; roleLabel: string }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>إدارة تشغيلية عربية جاهزة للعرض المؤسسي والتوسع المستقبلي</p>
      </div>
      <div className="topbar-actions">
        <span className="badge blue desktop-only">{roleLabel}</span>
        <button className="icon-button" type="button" title="الإشعارات">
          <Bell size={18} />
        </button>
        <span className="badge amber desktop-only">٣ تنبيهات</span>
      </div>
    </header>
  );
}

function BottomNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="bottom-nav" aria-label="التنقل السفلي">
      {items.map((item) => (
        <Link className={isActive(pathname, item.href) ? "is-active" : ""} href={item.href} key={`${item.href}-${item.label}`}>
          <item.icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function DetailDrawer({ drawer, onClose }: { drawer: DrawerState | null; onClose: () => void }) {
  if (!drawer) return null;
  return (
    <>
      <button className="drawer-backdrop" type="button" aria-label="إغلاق التفاصيل" onClick={onClose} />
      <aside className="detail-drawer" aria-label="درج التفاصيل">
        <div className="drawer-header">
          <div>
            <h3 className="drawer-title">{drawer.title}</h3>
            <p className="muted">{drawer.subtitle}</p>
          </div>
          <button className="icon-button" type="button" title="إغلاق" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <Badge>{drawer.status}</Badge>
        <dl className="detail-list">
          {drawer.fields.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="drawer-actions">
          <button className="ghost-button" type="button">
            <Activity size={18} />
            سجل الحالة
          </button>
          <button className="ghost-button" type="button">
            <BadgeCheck size={18} />
            اعتماد داخلي
          </button>
        </div>
      </aside>
    </>
  );
}

function ConfirmModal({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  if (!state) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={state.title}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="drawer-title">{state.title}</h3>
            <p className="muted">{state.message}</p>
          </div>
          <button className="icon-button" type="button" title="إغلاق" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="form-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              state.onConfirm();
              onClose();
            }}
          >
            <CheckCircle2 size={18} />
            {state.label}
          </button>
          <button className="ghost-button" type="button" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastRegion({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <CheckCircle2 size={18} color="#159455" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function DispatchTaskCard({
  task,
  drivers,
  onAssign
}: {
  task: {
    id: string;
    taskType: string;
    href?: string;
    partner: string;
    pickup: string;
    delivery: string;
    status: string;
    priority: string;
    due: string;
    coverageAreaName?: string;
    assignmentStatus?: string;
    relationship?: string;
    vehicleLabel?: string;
  };
  drivers: Driver[];
  onAssign: (taskId: string, driver: string) => void;
}) {
  const firstDriver = drivers[0]?.name ?? "غير محدد";
  return (
    <article className="task-card">
      <h4>{task.href ? <Link href={task.href}>{task.id}</Link> : task.id}</h4>
      <div className="task-meta">
        <Badge>{task.taskType}</Badge>
        <Badge>{task.status}</Badge>
        <Badge>{task.priority}</Badge>
        {task.assignmentStatus ? <Badge>{task.assignmentStatus}</Badge> : null}
        {task.relationship?.includes("خارج") ? <Badge>تحذير نطاق</Badge> : null}
      </div>
      <dl className="compact-list">
        <div>
          <dt>الشريك</dt>
          <dd>{task.partner}</dd>
        </div>
        <div>
          <dt>نقطة الاستلام</dt>
          <dd>{task.pickup}</dd>
        </div>
        <div>
          <dt>عنوان التسليم</dt>
          <dd>{task.delivery}</dd>
        </div>
        <div>
          <dt>منطقة التغطية</dt>
          <dd>{task.coverageAreaName ?? "غير محدد"}</dd>
        </div>
        <div>
          <dt>علاقة المندوب بالمنطقة</dt>
          <dd>{task.relationship ?? "بانتظار التحقق"}</dd>
        </div>
        <div>
          <dt>المركبة</dt>
          <dd>{task.vehicleLabel ?? "غير محدد"}</dd>
        </div>
        <div>
          <dt>وقت التسليم المتوقع</dt>
          <dd>{task.due}</dd>
        </div>
      </dl>
      <div className="checklist">
        {["هل المندوب يغطي نفس المنطقة؟", "هل المندوب متاح؟", "هل وثائقه سارية؟", "هل مركبته جاهزة؟"].map((item) => (
          <div className="check-row" key={item}>
            <span>{item}</span>
            <Badge>{item.includes("المنطقة") ? "تحقق قبل الاعتماد" : "جاهز للتجربة"}</Badge>
          </div>
        ))}
      </div>
      <p className="muted">إذا كان المندوب خارج منطقة التغطية الأساسية تظهر ملاحظة تجاوز تجريبية قبل الاعتماد.</p>
      {task.href ? (
        <Link className="ghost-button" href={task.href}>
          <Eye size={18} />
          فتح التفاصيل
        </Link>
      ) : null}
      <button className="primary-button" type="button" onClick={() => onAssign(task.id, firstDriver)}>
        <Send size={18} />
        إسناد إلى {firstDriver}
      </button>
    </article>
  );
}

function DriverExperience({
  pathname,
  tasks,
  orders,
  parcels,
  drivers,
  coverageAreas,
  driverAreaAssignments,
  onStatus,
  onFailed,
  onReturn,
  onNote
}: {
  pathname: string;
  tasks: {
    id: string;
    taskType: string;
    partner: string;
    pickup: string;
    delivery: string;
    status: string;
    priority: string;
    driver: string;
    due: string;
  }[];
  orders: Order[];
  parcels: Parcel[];
  drivers: Driver[];
  coverageAreas: CoverageArea[];
  driverAreaAssignments: DriverAreaAssignment[];
  onStatus: (taskId: string, status: string) => void;
  onFailed: (taskId: string) => void;
  onReturn: (taskId: string) => void;
  onNote: () => void;
}) {
  const assigned = tasks.filter((task) => task.driver !== "غير مسند" && task.driver !== "غير محدد");
  const active = assigned.filter((task) => !["تم التسليم", "تعذر التسليم", "مرتجع", "مرتجع للشريك"].includes(task.status));
  const taskId = pathname.startsWith("/driver/task/") ? decodePath(pathname.replace("/driver/task/", "")) : "";
  const selected = assigned.find((task) => task.id === taskId) ?? active[0] ?? assigned[0];
  const currentDriver = drivers[0];
  const currentAssignment = currentDriver ? driverAreaAssignments.find((assignment) => assignment.driverId === currentDriver.id) : undefined;
  const currentArea = coverageAreas.find((area) => area.id === currentAssignment?.areaId);

  if (pathname.startsWith("/driver/task/") && selected) {
    const isParcel = parcels.some((parcel) => parcel.id === selected.id);
    return (
      <main className="driver-app">
        <DriverHeader title="تفاصيل المهمة" />
        <article className="card mobile-card">
          <div className="card-header">
            <div>
              <h3>{selected.id}</h3>
              <p>{selected.partner}</p>
            </div>
            <Badge>{selected.status}</Badge>
          </div>
          <dl>
            <div>
              <dt>نوع المهمة</dt>
              <dd>{selected.taskType}</dd>
            </div>
            <div>
              <dt>نقطة الاستلام</dt>
              <dd>{selected.pickup}</dd>
            </div>
            <div>
              <dt>عنوان التسليم</dt>
              <dd>{selected.delivery}</dd>
            </div>
            <div>
              <dt>جوال العميل</dt>
              <dd>٠٥٠٠٠٠٠٠٠٠</dd>
            </div>
            <div>
              <dt>إثبات التسليم</dt>
              <dd>{isParcel ? "رمز تحقق أو صورة" : "توقيع العميل"}</dd>
            </div>
          </dl>
        </article>
        <section className="card driver-task-actions" style={{ marginTop: 14 }}>
          <button className="secondary-button" type="button" onClick={() => onStatus(selected.id, selected.taskType === "طرد" ? "خارج للتوصيل" : "قيد التوصيل")}>
            <Navigation size={18} />
            بدء المهمة
          </button>
          <button className="ghost-button" type="button" onClick={() => onStatus(selected.id, selected.taskType === "طرد" ? "مستلم من الشريك" : "تم الاستلام")}>
            <Package size={18} />
            تم الاستلام
          </button>
          <button className="primary-button" type="button" onClick={() => onStatus(selected.id, "تم التسليم")}>
            <CheckCircle2 size={18} />
            تم التسليم
          </button>
          <button className="danger-button" type="button" onClick={() => onFailed(selected.id)}>
            <AlertTriangle size={18} />
            تعذر التسليم
          </button>
          <button className="ghost-button" type="button" onClick={() => onReturn(selected.id)}>
            <RotateCcw size={18} />
            تسجيل مرتجع
          </button>
          <button className="ghost-button" type="button" onClick={onNote}>
            <ClipboardPlus size={18} />
            إضافة ملاحظة
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="driver-app">
      <DriverHeader title={pathname === "/driver/tasks" ? "مهامي" : "الرئيسية"} />
      {pathname !== "/driver/tasks" ? (
        <section className="card mobile-card" style={{ marginBottom: 14 }}>
          <div className="card-header">
            <div>
              <h3>منطقتي اليوم</h3>
              <p>{currentArea?.name ?? "غير محددة"} · {currentArea?.city ?? currentDriver?.city ?? "غير محدد"}</p>
            </div>
            <Badge>{currentDriver?.complianceStatus ?? "ساري"}</Badge>
          </div>
          <dl>
            <div><dt>أوقات التغطية</dt><dd>{currentAssignment?.timeWindow ?? "09:00 - 17:00"}</dd></div>
            <div><dt>مهامي في المنطقة</dt><dd>{ar(assigned.length)}</dd></div>
            <div><dt>نقاط الاستلام القريبة</dt><dd>{currentArea ? ar(currentArea.pickupPointIds.length) : "غير محدد"}</dd></div>
            <div><dt>حالة الجاهزية</dt><dd>{currentDriver?.status ?? "متاح"}</dd></div>
            <div><dt>تنبيهات الوثائق</dt><dd>{currentDriver?.licenseStatus === "منتهي" ? "الرخصة تحتاج مراجعة" : "لا توجد تنبيهات حالية"}</dd></div>
          </dl>
        </section>
      ) : null}
      <section className="kpi-grid">
        {[
          ["مهامي اليوم", assigned.length],
          ["قيد التنفيذ", active.length],
          ["تم التسليم", [...orders, ...parcels].filter((item) => item.status === "تم التسليم").length],
          ["محاولات فاشلة", [...orders, ...parcels].filter((item) => item.status.includes("تعذر")).length],
          ["مرتجعات", [...orders, ...parcels].filter((item) => item.status.includes("مرتجع")).length]
        ].map(([label, value]) => (
          <article className="card kpi-card" key={String(label)}>
            <h3>{String(label)}</h3>
            <div className="kpi-value">{ar(Number(value))}</div>
          </article>
        ))}
      </section>

      <section className="page-grid" style={{ marginTop: 14 }}>
        {assigned.map((task) => (
          <article className="card mobile-card" key={task.id}>
            <div className="card-header">
              <div>
                <h3>{task.id}</h3>
                <p>{task.partner}</p>
              </div>
              <Badge>{task.status}</Badge>
            </div>
            <dl>
              <div>
                <dt>نوع المهمة</dt>
                <dd>{task.taskType}</dd>
              </div>
              <div>
                <dt>نقطة الاستلام</dt>
                <dd>{task.pickup}</dd>
              </div>
              <div>
                <dt>عنوان التسليم</dt>
                <dd>{task.delivery}</dd>
              </div>
            </dl>
            <Link className="primary-button" href={`/driver/task/${routeId(task.id)}`} style={{ width: "100%", marginTop: 12 }}>
              <ChevronLeft size={18} />
              فتح المهمة
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function DriverHeader({ title }: { title: string }) {
  return (
    <header className="driver-header">
      <div>
        <h1>{title}</h1>
        <span className="muted">واجهة ميدانية بثلاث نقرات أو أقل</span>
      </div>
      <span className="brand-mark" style={{ width: 44, height: 44, fontSize: 18 }}>
        عزم
      </span>
    </header>
  );
}

function FormCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="command-card">
      <div className="card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <Badge>تحقق عربي</Badge>
      </div>
      {children}
    </section>
  );
}

function FormActions() {
  return (
    <div className="form-actions">
      <button className="primary-button" type="submit">
        <CheckCircle2 size={18} />
        حفظ السجل
      </button>
      <Link className="ghost-button" href="/dashboard">
        إلغاء
      </Link>
    </div>
  );
}

function Input({
  name,
  label,
  placeholder,
  type = "text"
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} placeholder={placeholder} type={type} />
    </div>
  );
}

function TextArea({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} placeholder={placeholder} />
    </div>
  );
}

function Select({
  name,
  label,
  options,
  compact = false
}: {
  name: string;
  label: string;
  options: string[];
  compact?: boolean;
}) {
  return (
    <div className="field" style={compact ? { minWidth: 180 } : undefined}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return (
    <div className="empty-state">
      <div>
        <Icon size={38} />
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="skeleton-line" style={{ width: 220, margin: "18px auto 0" }} />
      </div>
    </div>
  );
}
