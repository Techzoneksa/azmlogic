"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
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
  DeliveryAttempt,
  Driver,
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

const numberFormatter = new Intl.NumberFormat("ar-SA");

const operationsNav: NavItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/partners", label: "الشركاء", icon: Users },
  { href: "/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/parcels", label: "الطرود", icon: Package },
  { href: "/dispatch", label: "لوحة التوزيع", icon: Send },
  { href: "/drivers", label: "المناديب", icon: UserRound },
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

const operationsBottomNav: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/orders", label: "المهام", icon: ClipboardList },
  { href: "/dispatch", label: "التوزيع", icon: Send },
  { href: "/drivers", label: "المناديب", icon: UserRound },
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
  const [drivers] = useState<Driver[]>(initialDrivers);
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [pickupPoints] = useState<PickupPoint[]>(initialPickupPoints);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>(initialAttempts);
  const [returns, setReturns] = useState<ReturnRecord[]>(initialReturns);
  const [documents, setDocuments] = useState<TransportDocument[]>(initialDocuments);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
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
    setOrders((current) =>
      current.map((order) =>
        order.id === taskId
          ? { ...order, driver: driver.name, vehicle: driver.vehicle, status: "مسند إلى مندوب" }
          : order
      )
    );
    setParcels((current) =>
      current.map((parcel) =>
        parcel.id === taskId
          ? { ...parcel, driver: driver.name, vehicle: driver.vehicle, status: "مسند إلى مندوب" }
          : parcel
      )
    );
    toast("تم إسناد المهمة للمندوب");
    addLog("إسناد لمندوب", taskId, `تم إسناد المهمة إلى ${driver.name}`);
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

  const allTasks = useMemo(
    () => [
      ...orders.map((order) => ({
        id: order.id,
        taskType: "طلب",
        partner: order.partner,
        pickup: order.pickup,
        delivery: order.delivery,
        status: order.status,
        priority: order.priority,
        driver: order.driver,
        due: order.deliveryTime
      })),
      ...parcels.map((parcel) => ({
        id: parcel.id,
        taskType: "طرد",
        partner: parcel.partner,
        pickup: parcel.pickup,
        delivery: parcel.delivery,
        status: parcel.status,
        priority: parcel.fragile === "نعم" ? "عالية" : "متوسطة",
        driver: parcel.driver,
        due: "اليوم"
      }))
    ],
    [orders, parcels]
  );

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

  const orderRows = useMemo<Row[]>(
    () =>
      orders.map((order) => ({
        id: order.id,
        title: order.id,
        subtitle: `${order.partner} · ${order.type}`,
        status: order.status,
        href: `/orders/${routeId(order.id)}`,
        fields: [
          field("رقم طلب الشريك", order.partnerRef),
          field("الشريك", order.partner),
          field("نوع الطلب", order.type),
          field("اسم العميل", order.customer),
          field("جوال العميل", order.phone),
          field("نقطة الاستلام", order.pickup),
          field("عنوان التسليم", order.delivery),
          field("المدينة", order.city),
          field("الحي", order.district),
          field("المندوب", order.driver),
          field("المركبة", order.vehicle),
          field("أولوية الطلب", order.priority),
          field("وقت الاستلام المتوقع", order.pickupTime),
          field("وقت التسليم المتوقع", order.deliveryTime),
          field("ملاحظات", order.notes)
        ]
      })),
    [orders]
  );

  const parcelRows = useMemo<Row[]>(
    () =>
      parcels.map((parcel) => ({
        id: parcel.id,
        title: parcel.id,
        subtitle: `${parcel.partner} · ${parcel.tracking}`,
        status: parcel.status,
        href: `/parcels/${routeId(parcel.id)}`,
        fields: [
          field("رقم التتبع", parcel.tracking),
          field("الشريك", parcel.partner),
          field("اسم العميل", parcel.customer),
          field("جوال العميل", parcel.phone),
          field("نقطة الاستلام", parcel.pickup),
          field("عنوان التسليم", parcel.delivery),
          field("المدينة", parcel.city),
          field("الحي", parcel.district),
          field("الوزن", parcel.weight),
          field("عدد القطع", parcel.pieces),
          field("قابل للكسر", parcel.fragile),
          field("يحتاج توقيع", parcel.signature),
          field("طريقة إثبات التسليم", parcel.proof),
          field("المندوب", parcel.driver),
          field("المركبة", parcel.vehicle),
          field("ملاحظات", parcel.notes)
        ]
      })),
    [parcels]
  );

  const driverRows = useMemo<Row[]>(
    () =>
      drivers.map((driver) => ({
        id: driver.id,
        title: driver.name,
        subtitle: `${driver.city} · ${driver.type}`,
        status: driver.status,
        href: `/drivers/${routeId(driver.id)}`,
        fields: [
          field("رقم الجوال", driver.phone),
          field("رقم الهوية أو الإقامة", driver.nationalId),
          field("نوع المندوب", driver.type),
          field("المدينة", driver.city),
          field("المركبة المرتبطة", driver.vehicle),
          field("عدد المهام اليوم", driver.tasksToday),
          field("تم التسليم اليوم", driver.deliveredToday),
          field("محاولات فاشلة", driver.failedAttempts),
          field("نسبة النجاح", percent(driver.successRate)),
          field("آخر موقع معروف", driver.lastLocation),
          field("ملاحظات", driver.notes)
        ]
      })),
    [drivers]
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

  if (activePath.startsWith("/driver")) {
    return (
      <div className="app-root">
        <DriverExperience
          pathname={activePath}
          tasks={allTasks}
          orders={orders}
          parcels={parcels}
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
      if (id) return <DetailPage title="تفاصيل الطلب" row={orderRows.find((row) => row.id === id)} />;
      return (
        <EntityPage
          title="الطلبات"
          description="طلبات التوصيل من التطبيقات والشركات مع فلترة جاهزة للتوسع"
          rows={orderRows}
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
      if (id) return <DetailPage title="تفاصيل الطرد" row={parcelRows.find((row) => row.id === id)} />;
      return (
        <EntityPage
          title="الطرود"
          description="تشغيل طرود التجارة الإلكترونية والميل الأخير بإثباتات وتسلسل حالات واضح"
          rows={parcelRows}
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
      if (id) return <DetailPage title="ملف المندوب" row={driverRows.find((row) => row.id === id)} />;
      return (
        <EntityPage
          title="المناديب"
          description="متابعة جاهزية المناديب وأدائهم ومهامهم اليومية"
          rows={driverRows}
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

    const kpis = [
      { label: "إجمالي مهام اليوم", value: totalTasks, icon: Layers, trend: "جاهز للتوسع بالترقيم" },
      { label: "الطلبات", value: orders.length, icon: ClipboardList, trend: "فلترة حسب الشريك" },
      { label: "الطرود", value: parcels.length, icon: Package, trend: "إثباتات تسليم مهيأة" },
      { label: "قيد التوصيل", value: allTasks.filter((item) => /قيد|خارج/.test(item.status)).length, icon: Truck, trend: "متابعة مباشرة" },
      { label: "تم التسليم", value: delivered, icon: CheckCircle2, trend: percent(Math.round((delivered / Math.max(totalTasks, 1)) * 100)) },
      { label: "تعثر التسليم", value: failed, icon: AlertTriangle, trend: "إجراءات متابعة" },
      { label: "المرتجعات", value: returns.length, icon: RotateCcw, trend: "مسار إرجاع واضح" },
      { label: "المناديب النشطون", value: activeDrivers, icon: UserRound, trend: "جاهزية ميدانية" },
      { label: "المركبات الجاهزة", value: readyVehicles, icon: Car, trend: "فحص تشغيلي" },
      { label: "الشركاء النشطون", value: activePartners, icon: Users, trend: "تغطية متعددة" },
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
                </div>
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
                <h4>{task.id}</h4>
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
                    <dt>وقت التسليم المتوقع</dt>
                    <dd>{task.due}</dd>
                  </div>
                </dl>
                <div className="row-actions">
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
      <nav className="nav-list" aria-label="التنقل الرئيسي">
        {operationsNav.map((item) => (
          <Link className={`nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`} href={item.href} key={item.href}>
            <item.icon size={19} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <select className="role-pill" value={role} onChange={(event) => setRole(event.target.value as RoleKey)} aria-label="الدور التجريبي">
          {roles.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
        <Link className="nav-link" href="/login">
          <LogOut size={18} />
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
    partner: string;
    pickup: string;
    delivery: string;
    status: string;
    priority: string;
    due: string;
  };
  drivers: Driver[];
  onAssign: (taskId: string, driver: string) => void;
}) {
  const firstDriver = drivers[0]?.name ?? "غير محدد";
  return (
    <article className="task-card">
      <h4>{task.id}</h4>
      <div className="task-meta">
        <Badge>{task.taskType}</Badge>
        <Badge>{task.status}</Badge>
        <Badge>{task.priority}</Badge>
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
          <dt>وقت التسليم المتوقع</dt>
          <dd>{task.due}</dd>
        </div>
      </dl>
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
  onStatus: (taskId: string, status: string) => void;
  onFailed: (taskId: string) => void;
  onReturn: (taskId: string) => void;
  onNote: () => void;
}) {
  const assigned = tasks.filter((task) => task.driver !== "غير مسند" && task.driver !== "غير محدد");
  const active = assigned.filter((task) => !["تم التسليم", "تعذر التسليم", "مرتجع", "مرتجع للشريك"].includes(task.status));
  const taskId = pathname.startsWith("/driver/task/") ? decodePath(pathname.replace("/driver/task/", "")) : "";
  const selected = assigned.find((task) => task.id === taskId) ?? active[0] ?? assigned[0];

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
