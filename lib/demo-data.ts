export type RoleKey =
  | "general"
  | "operations"
  | "dispatcher"
  | "compliance"
  | "driver"
  | "reports";

export type Partner = {
  id: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  operation: string;
  pickupPoints: string;
  status: string;
  orders: number;
  parcels: number;
  successRate: number;
  returns: number;
  notes: string;
};

export type Order = {
  id: string;
  partnerRef: string;
  partner: string;
  type: string;
  customer: string;
  phone: string;
  pickup: string;
  delivery: string;
  city: string;
  district: string;
  driver: string;
  vehicle: string;
  coverageAreaId?: string;
  assignedDriverId?: string;
  assignmentStatus?: string;
  assignmentHistory?: AssignmentHistoryItem[];
  assignedAt?: string;
  assignedBy?: string;
  isDriverInArea?: boolean;
  reassignmentRequired?: boolean;
  vehicleId?: string;
  status: string;
  priority: string;
  pickupTime: string;
  deliveryTime: string;
  notes: string;
};

export type Parcel = {
  id: string;
  tracking: string;
  partner: string;
  customer: string;
  phone: string;
  pickup: string;
  delivery: string;
  city: string;
  district: string;
  weight: string;
  pieces: string;
  fragile: string;
  signature: string;
  proof: string;
  driver: string;
  vehicle: string;
  coverageAreaId?: string;
  assignedDriverId?: string;
  assignmentStatus?: string;
  assignmentHistory?: AssignmentHistoryItem[];
  assignedAt?: string;
  assignedBy?: string;
  isDriverInArea?: boolean;
  reassignmentRequired?: boolean;
  vehicleId?: string;
  status: string;
  notes: string;
};

export type AssignmentHistoryItem = {
  time: string;
  user: string;
  action: string;
  fromDriver: string;
  toDriver: string;
  area?: string;
  note: string;
};

export type Driver = {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  mobile?: string;
  nationalId: string;
  identityNumber?: string;
  identityType?: string;
  nationality?: string;
  birthDate?: string;
  age?: number;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  type: string;
  agreementType?: string;
  baseSalary?: number;
  commissionPerOrder?: number;
  commissionPerParcel?: number;
  dailyMinimum?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  contractStatus?: string;
  workType?: string;
  workHours?: string;
  workDays?: string;
  offDays?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  licenseStatus?: string;
  identityExpiryDate?: string;
  identityStatus?: string;
  documentStatus?: string;
  complianceStatus?: string;
  readinessRate?: number;
  readinessScore?: number;
  coverageType?: string;
  coverageTime?: string;
  driverStatus?: string;
  primaryAreaId?: string;
  secondaryAreaIds?: string[];
  vehicleId?: string;
  contractFile?: string;
  identityFile?: string;
  licenseFile?: string;
  insuranceFile?: string;
  lastActivity?: string;
  completedThisMonth?: number;
  returnsThisMonth?: number;
  averageDeliveryTime?: string;
  commitmentRating?: string;
  absenceDays?: number;
  status: string;
  city: string;
  vehicle: string;
  tasksToday: number;
  deliveredToday: number;
  failedAttempts: number;
  successRate: number;
  lastLocation: string;
  notes: string;
};

export type DriverAreaAssignment = {
  driverId: string;
  areaId: string;
  coverageType: string;
  startDate: string;
  endDate: string;
  timeWindow: string;
  priority: string;
  notes: string;
};

export type CoverageArea = {
  id: string;
  name: string;
  city: string;
  neighborhoods: string[];
  status: string;
  areaType: string;
  capacity: number;
  assignedDriverIds: string[];
  pickupPointIds: string[];
  partnerIds: string[];
  tasksToday: number;
  successRate: number;
  pressureLevel: string;
  averageDeliveryTime: string;
  notes: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  type: string;
  model: string;
  year: string;
  driver: string;
  status: string;
  insurance: string;
  registration: string;
  inspection: string;
  city: string;
  notes: string;
};

export type PickupPoint = {
  id: string;
  name: string;
  partner: string;
  type: string;
  city: string;
  district: string;
  address: string;
  contact: string;
  phone: string;
  hours: string;
  status: string;
  notes: string;
};

export type DeliveryAttempt = {
  id: string;
  taskId: string;
  taskType: string;
  partner: string;
  driver: string;
  customer: string;
  time: string;
  result: string;
  reason: string;
  notes: string;
  proof: string;
};

export type ReturnRecord = {
  id: string;
  taskId: string;
  partner: string;
  customer: string;
  driver: string;
  reason: string;
  status: string;
  date: string;
  point: string;
  notes: string;
};

export type TransportDocument = {
  id: string;
  type: string;
  taskId: string;
  partner: string;
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  cargo: string;
  pieces: string;
  weight: string;
  status: string;
  bayanNumber: string;
  issuer: string;
  notes: string;
};

export type ActivityLog = {
  id: string;
  user: string;
  action: string;
  time: string;
  related: string;
  status: string;
  notes: string;
};

export type TaskLike = {
  id: string;
  taskType: string;
  partner: string;
  pickup: string;
  delivery: string;
  status: string;
  priority: string;
  driver: string;
  due: string;
};

export const roles: { key: RoleKey; label: string; description: string }[] = [
  { key: "general", label: "المدير العام", description: "عرض شامل للتشغيل والامتثال والتقارير" },
  { key: "operations", label: "مدير العمليات", description: "إدارة الشركاء والطلبات والطرود والموارد" },
  { key: "dispatcher", label: "منسق التشغيل", description: "إسناد المهام ومتابعة التعثر والتأخير" },
  { key: "compliance", label: "مسؤول الامتثال", description: "جاهزية الربط والوثائق وسجلات التدقيق" },
  { key: "driver", label: "المندوب", description: "تجربة ميدانية مبسطة للمهام اليومية" },
  { key: "reports", label: "مشاهد التقارير", description: "عرض التقارير والمؤشرات دون تعديل" }
];

export const initialPartners: Partner[] = [
  {
    id: "ش-1001",
    name: "هنقرستيشن",
    type: "تطبيق توصيل طلبات",
    contact: "مسؤول التشغيل",
    phone: "0551234567",
    email: "ops@example.sa",
    city: "الرياض",
    operation: "طلبات مطاعم وطلبات سريعة",
    pickupPoints: "18 نقطة",
    status: "نشط",
    orders: 184,
    parcels: 0,
    successRate: 94,
    returns: 4,
    notes: "تغطية عالية خلال الذروة المسائية"
  },
  {
    id: "ش-1002",
    name: "مرسول",
    type: "تطبيق توصيل طلبات",
    contact: "فريق الشراكات",
    phone: "0507771200",
    email: "partners@example.sa",
    city: "جدة",
    operation: "طلبات متنوعة ومشاوير توصيل",
    pickupPoints: "11 نقطة",
    status: "نشط",
    orders: 121,
    parcels: 8,
    successRate: 91,
    returns: 3,
    notes: "تحتاج بعض الطلبات إلى جدولة مسبقة"
  },
  {
    id: "ش-1003",
    name: "كيتا",
    type: "تطبيق توصيل طلبات",
    contact: "مدير الحساب",
    phone: "0534449900",
    email: "account@example.sa",
    city: "الرياض",
    operation: "طلبات مطاعم",
    pickupPoints: "9 نقاط",
    status: "قيد التجهيز",
    orders: 76,
    parcels: 0,
    successRate: 88,
    returns: 2,
    notes: "جاهزية الإطلاق التجريبي خلال أسبوع"
  },
  {
    id: "ش-1004",
    name: "جاهز",
    type: "تطبيق توصيل طلبات",
    contact: "مشرف المنطقة",
    phone: "0562221100",
    email: "region@example.sa",
    city: "مكة",
    operation: "طلبات مطاعم مجدولة",
    pickupPoints: "7 نقاط",
    status: "نشط",
    orders: 92,
    parcels: 0,
    successRate: 90,
    returns: 5,
    notes: "توجد مناطق تحتاج متابعة زمنية دقيقة"
  },
  {
    id: "ش-1005",
    name: "نون",
    type: "منصة تجارة إلكترونية",
    contact: "منسق الميل الأخير",
    phone: "0548883000",
    email: "lastmile@example.sa",
    city: "جدة",
    operation: "طرود وميل أخير",
    pickupPoints: "4 نقاط",
    status: "نشط",
    orders: 0,
    parcels: 233,
    successRate: 96,
    returns: 7,
    notes: "حجم طرود مرتفع صباحا"
  },
  {
    id: "ش-1006",
    name: "أمازون",
    type: "منصة تجارة إلكترونية",
    contact: "مدير العمليات",
    phone: "0503334455",
    email: "ops-team@example.sa",
    city: "الدمام",
    operation: "طرود وشحنات صغيرة",
    pickupPoints: "6 نقاط",
    status: "تحت المراجعة",
    orders: 0,
    parcels: 148,
    successRate: 92,
    returns: 6,
    notes: "مراجعة متطلبات إثبات التسليم"
  },
  {
    id: "ش-1007",
    name: "متجر إلكتروني تجريبي",
    type: "متجر إلكتروني",
    contact: "مالك المتجر",
    phone: "0559001122",
    email: "store@example.sa",
    city: "الرياض",
    operation: "طلبات وطرود خفيفة",
    pickupPoints: "نقطتان",
    status: "نشط",
    orders: 34,
    parcels: 45,
    successRate: 89,
    returns: 5,
    notes: "يفضل التواصل قبل الاستلام"
  },
  {
    id: "ش-1008",
    name: "شركة تجريبية",
    type: "شركة",
    contact: "منسق الخدمات",
    phone: "0501112233",
    email: "services@example.sa",
    city: "مكة",
    operation: "طلبات شركات مجدولة",
    pickupPoints: "3 نقاط",
    status: "متوقف مؤقتا",
    orders: 19,
    parcels: 12,
    successRate: 84,
    returns: 3,
    notes: "موقوف لحين تحديث بيانات الاتصال"
  }
];

export const initialDrivers: Driver[] = [
  {
    id: "م-101",
    name: "أحمد السلمي",
    phone: "0553332211",
    nationalId: "********2345",
    type: "موظف",
    status: "متاح",
    city: "جدة",
    vehicle: "ج د د 4512",
    tasksToday: 18,
    deliveredToday: 14,
    failedAttempts: 1,
    successRate: 96,
    lastLocation: "حي السلامة",
    notes: "مناسب للمناطق المركزية"
  },
  {
    id: "م-102",
    name: "محمد الحربي",
    phone: "0504441000",
    nationalId: "********8812",
    type: "متعاقد",
    status: "مشغول",
    city: "الرياض",
    vehicle: "ر ي ض 7221",
    tasksToday: 21,
    deliveredToday: 16,
    failedAttempts: 2,
    successRate: 91,
    lastLocation: "حي النخيل",
    notes: "يمتلك خبرة في طلبات المطاعم"
  },
  {
    id: "م-103",
    name: "خالد العتيبي",
    phone: "0532104455",
    nationalId: "********5441",
    type: "بديل",
    status: "في الطريق",
    city: "مكة",
    vehicle: "م ك ة 3119",
    tasksToday: 12,
    deliveredToday: 8,
    failedAttempts: 1,
    successRate: 89,
    lastLocation: "العوالي",
    notes: "يغطي المسارات القصيرة"
  },
  {
    id: "م-104",
    name: "فهد الزهراني",
    phone: "0567776655",
    nationalId: "********7600",
    type: "موسمي",
    status: "متاح",
    city: "الدمام",
    vehicle: "د م م 8813",
    tasksToday: 15,
    deliveredToday: 13,
    failedAttempts: 0,
    successRate: 98,
    lastLocation: "الشاطئ",
    notes: "أداء عال في الطرود"
  },
  {
    id: "م-105",
    name: "عمر الغامدي",
    phone: "0546665544",
    nationalId: "********3009",
    type: "موظف",
    status: "خارج الدوام",
    city: "جدة",
    vehicle: "ج د د 9920",
    tasksToday: 10,
    deliveredToday: 9,
    failedAttempts: 1,
    successRate: 93,
    lastLocation: "حي الروضة",
    notes: "متاح في الفترة الصباحية"
  },
  {
    id: "م-106",
    name: "ياسر القحطاني",
    phone: "0521239900",
    nationalId: "********1422",
    type: "متعاقد",
    status: "يحتاج مراجعة",
    city: "الرياض",
    vehicle: "ر ي ض 1108",
    tasksToday: 8,
    deliveredToday: 5,
    failedAttempts: 2,
    successRate: 78,
    lastLocation: "حي الملقا",
    notes: "توجد ملاحظات على الالتزام الزمني"
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: "و-201",
    plate: "ج د د 4512",
    type: "سيارة صغيرة",
    model: "هيونداي",
    year: "2023",
    driver: "أحمد السلمي",
    status: "جاهزة",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "جدة",
    notes: "مناسبة للطلبات السريعة"
  },
  {
    id: "و-202",
    plate: "ر ي ض 7221",
    type: "فان",
    model: "تويوتا",
    year: "2022",
    driver: "محمد الحربي",
    status: "قيد التشغيل",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "الرياض",
    notes: "سعة جيدة للطرود"
  },
  {
    id: "و-203",
    plate: "م ك ة 3119",
    type: "دراجة",
    model: "ياماها",
    year: "2024",
    driver: "خالد العتيبي",
    status: "قيد التشغيل",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "مكة",
    notes: "فعالة في الزحام"
  },
  {
    id: "و-204",
    plate: "د م م 8813",
    type: "سيارة صغيرة",
    model: "نيسان",
    year: "2021",
    driver: "فهد الزهراني",
    status: "جاهزة",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "الدمام",
    notes: "جاهزة لمسارات الميل الأخير"
  },
  {
    id: "و-205",
    plate: "ج د د 9920",
    type: "فان",
    model: "فورد",
    year: "2020",
    driver: "عمر الغامدي",
    status: "صيانة",
    insurance: "ينتهي قريبا",
    registration: "سارية",
    inspection: "بحاجة مراجعة",
    city: "جدة",
    notes: "مراجعة فرامل قبل التشغيل"
  }
];

export const initialOrders: Order[] = [
  {
    id: "عزم-طلب-1001",
    partnerRef: "شريك-8411",
    partner: "هنقرستيشن",
    type: "طلب مطعم",
    customer: "عميل تجريبي",
    phone: "0500001111",
    pickup: "مطعم حي السلامة",
    delivery: "شارع الأمير سلطان",
    city: "جدة",
    district: "السلامة",
    driver: "أحمد السلمي",
    vehicle: "ج د د 4512",
    coverageAreaId: "area-jed-north",
    assignedDriverId: "م-101",
    assignmentStatus: "مسند",
    assignedAt: "اليوم 09:20",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-201",
    status: "قيد التوصيل",
    priority: "عالية",
    pickupTime: "12:20",
    deliveryTime: "13:05",
    notes: "يرجى الاتصال قبل الوصول"
  },
  {
    id: "عزم-طلب-1002",
    partnerRef: "شريك-8412",
    partner: "جاهز",
    type: "طلب سريع",
    customer: "عميل تجريبي",
    phone: "0500002222",
    pickup: "فرع العزيزية",
    delivery: "مخطط الشرائع",
    city: "مكة",
    district: "العزيزية",
    driver: "خالد العتيبي",
    vehicle: "م ك ة 3119",
    coverageAreaId: "area-mak",
    assignedDriverId: "م-103",
    assignmentStatus: "مكتمل",
    assignedAt: "اليوم 10:00",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-203",
    status: "تم التسليم",
    priority: "متوسطة",
    pickupTime: "10:10",
    deliveryTime: "11:00",
    notes: "تم التسليم بتوقيع العميل"
  },
  {
    id: "عزم-طلب-1003",
    partnerRef: "شريك-8413",
    partner: "كيتا",
    type: "طلب مطعم",
    customer: "عميل تجريبي",
    phone: "0500003333",
    pickup: "مطعم طريق الملك",
    delivery: "حي النخيل",
    city: "الرياض",
    district: "النخيل",
    driver: "غير مسند",
    vehicle: "غير محدد",
    coverageAreaId: "area-ryd",
    assignedDriverId: "",
    assignmentStatus: "غير مسند",
    assignedAt: "غير مسند",
    assignedBy: "لم يتم الإسناد",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "",
    status: "جديد",
    priority: "عالية",
    pickupTime: "14:00",
    deliveryTime: "14:45",
    notes: "بحاجة إسناد سريع"
  },
  {
    id: "عزم-طلب-1004",
    partnerRef: "شريك-8414",
    partner: "مرسول",
    type: "طلب مجدول",
    customer: "عميل تجريبي",
    phone: "0500004444",
    pickup: "متجر حي الروضة",
    delivery: "شارع الأمير ماجد",
    city: "جدة",
    district: "الروضة",
    driver: "عمر الغامدي",
    vehicle: "ج د د 9920",
    coverageAreaId: "area-jed-south",
    assignedDriverId: "م-102",
    assignmentStatus: "يحتاج إعادة إسناد",
    assignedAt: "اليوم 09:05",
    assignedBy: "منسق التشغيل",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "و-202",
    status: "متأخر",
    priority: "عاجلة",
    pickupTime: "09:30",
    deliveryTime: "10:30",
    notes: "تأخير بسبب صيانة المركبة"
  }
];

export const initialParcels: Parcel[] = [
  {
    id: "عزم-طرد-2001",
    tracking: "تتبع-4411",
    partner: "نون",
    customer: "عميل تجريبي",
    phone: "0511112222",
    pickup: "نقطة نون جدة",
    delivery: "حي الشاطئ",
    city: "جدة",
    district: "الشاطئ",
    weight: "2.4 كجم",
    pieces: "قطعة واحدة",
    fragile: "لا",
    signature: "نعم",
    proof: "رمز تحقق",
    driver: "أحمد السلمي",
    vehicle: "ج د د 4512",
    coverageAreaId: "area-jed-north",
    assignedDriverId: "م-101",
    assignmentStatus: "مسند",
    assignedAt: "اليوم 08:45",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-201",
    status: "خارج للتوصيل",
    notes: "إثبات التسليم مطلوب"
  },
  {
    id: "عزم-طرد-2002",
    tracking: "تتبع-4412",
    partner: "أمازون",
    customer: "عميل تجريبي",
    phone: "0511113333",
    pickup: "مركز الدمام",
    delivery: "حي الشاطئ",
    city: "الدمام",
    district: "الشاطئ",
    weight: "1.1 كجم",
    pieces: "قطعتان",
    fragile: "نعم",
    signature: "لا",
    proof: "صورة التسليم",
    driver: "فهد الزهراني",
    vehicle: "د م م 8813",
    coverageAreaId: "area-jed-south",
    assignedDriverId: "م-104",
    assignmentStatus: "مكتمل",
    assignedAt: "اليوم 07:50",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-204",
    status: "تم التسليم",
    notes: "تم تصوير التسليم"
  },
  {
    id: "عزم-طرد-2003",
    tracking: "تتبع-4413",
    partner: "متجر إلكتروني تجريبي",
    customer: "عميل تجريبي",
    phone: "0511114444",
    pickup: "مستودع الشريك",
    delivery: "حي الملقا",
    city: "الرياض",
    district: "الملقا",
    weight: "3 كجم",
    pieces: "قطعة واحدة",
    fragile: "لا",
    signature: "نعم",
    proof: "توقيع العميل",
    driver: "غير مسند",
    vehicle: "غير محدد",
    coverageAreaId: "area-ryd",
    assignedDriverId: "",
    assignmentStatus: "غير مسند",
    assignedAt: "غير مسند",
    assignedBy: "لم يتم الإسناد",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "",
    status: "جاهز للتوزيع",
    notes: "بانتظار الإسناد"
  },
  {
    id: "عزم-طرد-2004",
    tracking: "تتبع-4414",
    partner: "نون",
    customer: "عميل تجريبي",
    phone: "0511115555",
    pickup: "نقطة نون الرياض",
    delivery: "حي الياسمين",
    city: "الرياض",
    district: "الياسمين",
    weight: "0.8 كجم",
    pieces: "قطعة واحدة",
    fragile: "لا",
    signature: "لا",
    proof: "ملاحظة",
    driver: "محمد الحربي",
    vehicle: "ر ي ض 7221",
    coverageAreaId: "area-jed-east",
    assignedDriverId: "م-102",
    assignmentStatus: "خارج نطاق المندوب",
    assignedAt: "اليوم 12:10",
    assignedBy: "منسق التشغيل",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "و-202",
    status: "تعذر التسليم",
    notes: "العميل غير متاح"
  }
];

export const initialPickupPoints: PickupPoint[] = [
  {
    id: "ن-301",
    name: "فرع السلامة",
    partner: "هنقرستيشن",
    type: "مطعم",
    city: "جدة",
    district: "السلامة",
    address: "شارع صاري",
    contact: "مشرف الفرع",
    phone: "0551112222",
    hours: "10 صباحا - 12 مساء",
    status: "نشطة",
    notes: "ذروة عالية بعد المغرب"
  },
  {
    id: "ن-302",
    name: "مركز طرود جدة",
    partner: "نون",
    type: "مركز توزيع",
    city: "جدة",
    district: "الخالدية",
    address: "طريق المدينة",
    contact: "مسؤول الاستلام",
    phone: "0542223333",
    hours: "8 صباحا - 6 مساء",
    status: "نشطة",
    notes: "تحميل دفعات صباحية"
  },
  {
    id: "ن-303",
    name: "نقطة الرياض",
    partner: "متجر إلكتروني تجريبي",
    type: "مستودع شريك",
    city: "الرياض",
    district: "الملقا",
    address: "طريق أنس بن مالك",
    contact: "ممثل المتجر",
    phone: "0533334444",
    hours: "9 صباحا - 5 مساء",
    status: "نشطة",
    notes: "يفضل الحضور قبل الظهيرة"
  }
];

export const initialAttempts: DeliveryAttempt[] = [
  {
    id: "ح-401",
    taskId: "عزم-طلب-1002",
    taskType: "طلب",
    partner: "جاهز",
    driver: "خالد العتيبي",
    customer: "عميل تجريبي",
    time: "اليوم 11:00",
    result: "تم التسليم",
    reason: "لا يوجد",
    notes: "تم التحقق من الاستلام",
    proof: "توقيع العميل"
  },
  {
    id: "ح-402",
    taskId: "عزم-طرد-2004",
    taskType: "طرد",
    partner: "نون",
    driver: "محمد الحربي",
    customer: "عميل تجريبي",
    time: "اليوم 12:15",
    result: "العميل غير متاح",
    reason: "عدم الرد على الاتصال",
    notes: "تم تسجيل محاولة وإرسال إشعار",
    proof: "ملاحظة"
  }
];

export const initialReturns: ReturnRecord[] = [
  {
    id: "ر-501",
    taskId: "عزم-طرد-2004",
    partner: "نون",
    customer: "عميل تجريبي",
    driver: "محمد الحربي",
    reason: "تعذر التسليم",
    status: "بانتظار الإرجاع",
    date: "اليوم",
    point: "نقطة نون الرياض",
    notes: "ينتظر إعادة الجدولة أو الإرجاع"
  }
];

export const initialDocuments: TransportDocument[] = [
  {
    id: "وث-601",
    type: "وثيقة نقل داخلية",
    taskId: "عزم-طرد-2001",
    partner: "نون",
    sender: "نقطة نون جدة",
    receiver: "عميل تجريبي",
    origin: "جدة",
    destination: "جدة",
    vehicle: "ج د د 4512",
    driver: "أحمد السلمي",
    cargo: "طرد تجارة إلكترونية",
    pieces: "قطعة واحدة",
    weight: "2.4 كجم",
    status: "جاهزة للمراجعة",
    bayanNumber: "",
    issuer: "",
    notes: "جاهزة للتحقق قبل أي ربط مستقبلي"
  },
  {
    id: "وث-602",
    type: "مسودة وثيقة",
    taskId: "عزم-طلب-1003",
    partner: "كيتا",
    sender: "مطعم طريق الملك",
    receiver: "عميل تجريبي",
    origin: "الرياض",
    destination: "الرياض",
    vehicle: "غير محدد",
    driver: "غير مسند",
    cargo: "طلب مطعم",
    pieces: "طلب واحد",
    weight: "غير محدد",
    status: "ناقصة البيانات",
    bayanNumber: "",
    issuer: "",
    notes: "تحتاج بيانات مندوب ومركبة"
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "س-701",
    user: "مدير العمليات",
    action: "إنشاء طلب",
    time: "اليوم 09:10",
    related: "عزم-طلب-1001",
    status: "ناجح",
    notes: "تم تسجيل الطلب وإسناده"
  },
  {
    id: "س-702",
    user: "منسق التشغيل",
    action: "إسناد لمندوب",
    time: "اليوم 09:20",
    related: "عزم-طرد-2001",
    status: "ناجح",
    notes: "تم إسناد الطرد إلى أحمد السلمي"
  },
  {
    id: "س-703",
    user: "المندوب",
    action: "تسجيل محاولة تسليم",
    time: "اليوم 12:15",
    related: "عزم-طرد-2004",
    status: "يحتاج متابعة",
    notes: "العميل غير متاح"
  },
  {
    id: "س-704",
    user: "مسؤول الامتثال",
    action: "تحديث جاهزية بيان",
    time: "أمس 16:30",
    related: "جاهزية الربط",
    status: "قيد التجهيز",
    notes: "تمت مراجعة قائمة البيانات المطلوبة"
  }
];

export const initialCoverageAreas: CoverageArea[] = [
  {
    id: "area-jed-north",
    name: "شمال جدة",
    city: "جدة",
    neighborhoods: ["أبحر", "النعيم", "المحمدية", "الشاطئ", "السلامة"],
    status: "نشطة",
    areaType: "منطقة تشغيل",
    capacity: 7,
    assignedDriverIds: ["ظ…-ظ،ظ ظ،"],
    pickupPointIds: ["ظ†-ظ£ظ ظ،", "ظ†-ظ£ظ ظ¢"],
    partnerIds: ["ط´-ظ،ظ ظ ظ¢", "ط´-ظ،ظ ظ ظ¥"],
    tasksToday: 42,
    successRate: 94,
    pressureLevel: "متوسط",
    averageDeliveryTime: "34 دقيقة",
    notes: "تغطية أساسية للمطاعم والطرود في شمال جدة"
  },
  {
    id: "area-jed-center",
    name: "وسط جدة",
    city: "جدة",
    neighborhoods: ["الروضة", "الخالدية", "الفيصلية", "الأندلس"],
    status: "نشطة",
    areaType: "منطقة مشتركة",
    capacity: 6,
    assignedDriverIds: ["ظ…-ظ،ظ ظ¥", "ظ…-ظ،ظ ظ،"],
    pickupPointIds: ["ظ†-ظ£ظ ظ¢"],
    partnerIds: ["ط´-ظ،ظ ظ ظ¢", "ط´-ظ،ظ ظ ظ¥"],
    tasksToday: 36,
    successRate: 91,
    pressureLevel: "مرتفع",
    averageDeliveryTime: "38 دقيقة",
    notes: "منطقة كثيفة تحتاج متابعة وقت الذروة"
  },
  {
    id: "area-jed-south",
    name: "جنوب جدة",
    city: "جدة",
    neighborhoods: ["السنابل", "الخمرة", "الأجاويد"],
    status: "ضعيفة التغطية",
    areaType: "منطقة تسليم",
    capacity: 5,
    assignedDriverIds: ["ظ…-ظ،ظ ظ¤"],
    pickupPointIds: [],
    partnerIds: ["ط´-ظ،ظ ظ ظ§"],
    tasksToday: 18,
    successRate: 87,
    pressureLevel: "متوسط",
    averageDeliveryTime: "45 دقيقة",
    notes: "تحتاج مندوب احتياطي في الفترة المسائية"
  },
  {
    id: "area-jed-east",
    name: "شرق جدة",
    city: "جدة",
    neighborhoods: ["الصفا", "المروة", "السامر"],
    status: "بدون مناديب",
    areaType: "منطقة عالية الطلب",
    capacity: 4,
    assignedDriverIds: [],
    pickupPointIds: [],
    partnerIds: ["ط´-ظ،ظ ظ ظ¨"],
    tasksToday: 12,
    successRate: 0,
    pressureLevel: "يحتاج تدخل",
    averageDeliveryTime: "غير محدد",
    notes: "منطقة مطلوبة للتوسع وتحتاج إسناد مناديب"
  },
  {
    id: "area-mak",
    name: "مكة",
    city: "مكة",
    neighborhoods: ["العوالي", "العزيزية", "الشرايع"],
    status: "نشطة",
    areaType: "منطقة موسمية",
    capacity: 8,
    assignedDriverIds: ["ظ…-ظ،ظ ظ£"],
    pickupPointIds: [],
    partnerIds: ["ط´-ظ،ظ ظ ظ¤", "ط´-ظ،ظ ظ ظ¨"],
    tasksToday: 27,
    successRate: 90,
    pressureLevel: "مرتفع",
    averageDeliveryTime: "36 دقيقة",
    notes: "جاهزة للتوسع الموسمي"
  },
  {
    id: "area-ryd",
    name: "الرياض",
    city: "الرياض",
    neighborhoods: ["النخيل", "الملقا", "الياسمين"],
    status: "تحتاج مراجعة",
    areaType: "منطقة تشغيل",
    capacity: 9,
    assignedDriverIds: ["ظ…-ظ،ظ ظ¢", "ظ…-ظ،ظ ظ¦"],
    pickupPointIds: ["ظ†-ظ£ظ ظ£"],
    partnerIds: ["ط´-ظ،ظ ظ ظ£", "ط´-ظ،ظ ظ ظ§"],
    tasksToday: 39,
    successRate: 88,
    pressureLevel: "مرتفع",
    averageDeliveryTime: "42 دقيقة",
    notes: "تحتاج مراجعة امتثال أحد المناديب قبل الاعتماد"
  }
];

export const initialDriverAreaAssignments: DriverAreaAssignment[] = [
  {
    driverId: "ظ…-ظ،ظ ظ،",
    areaId: "area-jed-north",
    coverageType: "أساسي",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    timeWindow: "08:00 - 16:00",
    priority: "أولوية عالية",
    notes: "مندوب أساسي لشمال جدة"
  },
  {
    driverId: "ظ…-ظ،ظ ظ،",
    areaId: "area-jed-center",
    coverageType: "احتياطي",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    timeWindow: "16:00 - 22:00",
    priority: "أولوية متوسطة",
    notes: "احتياطي عند ضغط وسط جدة"
  },
  {
    driverId: "ظ…-ظ،ظ ظ¢",
    areaId: "area-ryd",
    coverageType: "أساسي",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    timeWindow: "10:00 - 18:00",
    priority: "أولوية عالية",
    notes: "الرخصة تنتهي قريباً ويجب مراجعتها"
  },
  {
    driverId: "ظ…-ظ،ظ ظ£",
    areaId: "area-mak",
    coverageType: "موسمي",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    timeWindow: "12:00 - 20:00",
    priority: "أولوية موسمية",
    notes: "تغطية موسمية داخل مكة"
  },
  {
    driverId: "ظ…-ظ،ظ ظ¤",
    areaId: "area-jed-south",
    coverageType: "أساسي",
    startDate: "2026-07-01",
    endDate: "2026-10-31",
    timeWindow: "09:00 - 17:00",
    priority: "أولوية متوسطة",
    notes: "مكلف بجنوب جدة مع قابلية التوسع"
  },
  {
    driverId: "ظ…-ظ،ظ ظ¥",
    areaId: "area-jed-center",
    coverageType: "أساسي",
    startDate: "2026-07-01",
    endDate: "2026-12-01",
    timeWindow: "07:00 - 15:00",
    priority: "أولوية عالية",
    notes: "لا يعتمد للإسناد حتى تحديث الرخصة"
  },
  {
    driverId: "ظ…-ظ،ظ ظ¦",
    areaId: "area-ryd",
    coverageType: "احتياطي",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    timeWindow: "17:00 - 23:00",
    priority: "أولوية منخفضة",
    notes: "يحتاج مراجعة وثائق قبل الاعتماد"
  }
];

export const bayanChecklistItems = [
  "بيانات الشركاء",
  "بيانات المناديب",
  "بيانات المركبات",
  "بيانات الطلبات",
  "بيانات الطرود",
  "عناوين الاستلام",
  "عناوين التسليم",
  "وصف الشحنة",
  "بيانات وثيقة النقل",
  "سجل العمليات"
];

export const partnerTypes = [
  "تطبيق توصيل طلبات",
  "منصة تجارة إلكترونية",
  "متجر إلكتروني",
  "شركة",
  "مركز توزيع",
  "شريك لوجستي",
  "تاجر محلي",
  "أخرى"
];

export const cities = ["جدة", "الرياض", "مكة", "الدمام"];

export const orderStatuses = [
  "جديد",
  "بانتظار الاستلام",
  "تم الاستلام",
  "مسند إلى مندوب",
  "قيد التوصيل",
  "متأخر",
  "تم التسليم",
  "تعذر التسليم",
  "مرتجع",
  "ملغي"
];

export const parcelStatuses = [
  "جديد",
  "مستلم من الشريك",
  "جاهز للتوزيع",
  "مسند إلى مندوب",
  "خارج للتوصيل",
  "تم التسليم",
  "تعذر التسليم",
  "مرتجع للشريك",
  "ملغي"
];
