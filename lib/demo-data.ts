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
    id: "ش-١٠٠١",
    name: "هنقرستيشن",
    type: "تطبيق توصيل طلبات",
    contact: "مسؤول التشغيل",
    phone: "٠٥٥١٢٣٤٥٦٧",
    email: "ops@example.sa",
    city: "الرياض",
    operation: "طلبات مطاعم وطلبات سريعة",
    pickupPoints: "١٨ نقطة",
    status: "نشط",
    orders: 184,
    parcels: 0,
    successRate: 94,
    returns: 4,
    notes: "تغطية عالية خلال الذروة المسائية"
  },
  {
    id: "ش-١٠٠٢",
    name: "مرسول",
    type: "تطبيق توصيل طلبات",
    contact: "فريق الشراكات",
    phone: "٠٥٠٧٧٧١٢٠٠",
    email: "partners@example.sa",
    city: "جدة",
    operation: "طلبات متنوعة ومشاوير توصيل",
    pickupPoints: "١١ نقطة",
    status: "نشط",
    orders: 121,
    parcels: 8,
    successRate: 91,
    returns: 3,
    notes: "تحتاج بعض الطلبات إلى جدولة مسبقة"
  },
  {
    id: "ش-١٠٠٣",
    name: "كيتا",
    type: "تطبيق توصيل طلبات",
    contact: "مدير الحساب",
    phone: "٠٥٣٤٤٤٩٩٠٠",
    email: "account@example.sa",
    city: "الرياض",
    operation: "طلبات مطاعم",
    pickupPoints: "٩ نقاط",
    status: "قيد التجهيز",
    orders: 76,
    parcels: 0,
    successRate: 88,
    returns: 2,
    notes: "جاهزية الإطلاق التجريبي خلال أسبوع"
  },
  {
    id: "ش-١٠٠٤",
    name: "جاهز",
    type: "تطبيق توصيل طلبات",
    contact: "مشرف المنطقة",
    phone: "٠٥٦٢٢٢١١٠٠",
    email: "region@example.sa",
    city: "مكة",
    operation: "طلبات مطاعم مجدولة",
    pickupPoints: "٧ نقاط",
    status: "نشط",
    orders: 92,
    parcels: 0,
    successRate: 90,
    returns: 5,
    notes: "توجد مناطق تحتاج متابعة زمنية دقيقة"
  },
  {
    id: "ش-١٠٠٥",
    name: "نون",
    type: "منصة تجارة إلكترونية",
    contact: "منسق الميل الأخير",
    phone: "٠٥٤٨٨٨٣٠٠٠",
    email: "lastmile@example.sa",
    city: "جدة",
    operation: "طرود وميل أخير",
    pickupPoints: "٤ نقاط",
    status: "نشط",
    orders: 0,
    parcels: 233,
    successRate: 96,
    returns: 7,
    notes: "حجم طرود مرتفع صباحا"
  },
  {
    id: "ش-١٠٠٦",
    name: "أمازون",
    type: "منصة تجارة إلكترونية",
    contact: "مدير العمليات",
    phone: "٠٥٠٣٣٣٤٤٥٥",
    email: "ops-team@example.sa",
    city: "الدمام",
    operation: "طرود وشحنات صغيرة",
    pickupPoints: "٦ نقاط",
    status: "تحت المراجعة",
    orders: 0,
    parcels: 148,
    successRate: 92,
    returns: 6,
    notes: "مراجعة متطلبات إثبات التسليم"
  },
  {
    id: "ش-١٠٠٧",
    name: "متجر إلكتروني تجريبي",
    type: "متجر إلكتروني",
    contact: "مالك المتجر",
    phone: "٠٥٥٩٠٠١١٢٢",
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
    id: "ش-١٠٠٨",
    name: "شركة تجريبية",
    type: "شركة",
    contact: "منسق الخدمات",
    phone: "٠٥٠١١١٢٢٣٣",
    email: "services@example.sa",
    city: "مكة",
    operation: "طلبات شركات مجدولة",
    pickupPoints: "٣ نقاط",
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
    id: "م-١٠١",
    name: "أحمد السلمي",
    phone: "٠٥٥٣٣٣٢٢١١",
    nationalId: "********٢٣٤٥",
    type: "موظف",
    status: "متاح",
    city: "جدة",
    vehicle: "ج د د ٤٥١٢",
    tasksToday: 18,
    deliveredToday: 14,
    failedAttempts: 1,
    successRate: 96,
    lastLocation: "حي السلامة",
    notes: "مناسب للمناطق المركزية"
  },
  {
    id: "م-١٠٢",
    name: "محمد الحربي",
    phone: "٠٥٠٤٤٤١٠٠٠",
    nationalId: "********٨٨١٢",
    type: "متعاقد",
    status: "مشغول",
    city: "الرياض",
    vehicle: "ر ي ض ٧٢٢١",
    tasksToday: 21,
    deliveredToday: 16,
    failedAttempts: 2,
    successRate: 91,
    lastLocation: "حي النخيل",
    notes: "يمتلك خبرة في طلبات المطاعم"
  },
  {
    id: "م-١٠٣",
    name: "خالد العتيبي",
    phone: "٠٥٣٢١٠٤٤٥٥",
    nationalId: "********٥٤٤١",
    type: "بديل",
    status: "في الطريق",
    city: "مكة",
    vehicle: "م ك ة ٣١١٩",
    tasksToday: 12,
    deliveredToday: 8,
    failedAttempts: 1,
    successRate: 89,
    lastLocation: "العوالي",
    notes: "يغطي المسارات القصيرة"
  },
  {
    id: "م-١٠٤",
    name: "فهد الزهراني",
    phone: "٠٥٦٧٧٧٦٦٥٥",
    nationalId: "********٧٦٠٠",
    type: "موسمي",
    status: "متاح",
    city: "الدمام",
    vehicle: "د م م ٨٨١٣",
    tasksToday: 15,
    deliveredToday: 13,
    failedAttempts: 0,
    successRate: 98,
    lastLocation: "الشاطئ",
    notes: "أداء عال في الطرود"
  },
  {
    id: "م-١٠٥",
    name: "عمر الغامدي",
    phone: "٠٥٤٦٦٦٥٥٤٤",
    nationalId: "********٣٠٠٩",
    type: "موظف",
    status: "خارج الدوام",
    city: "جدة",
    vehicle: "ج د د ٩٩٢٠",
    tasksToday: 10,
    deliveredToday: 9,
    failedAttempts: 1,
    successRate: 93,
    lastLocation: "حي الروضة",
    notes: "متاح في الفترة الصباحية"
  },
  {
    id: "م-١٠٦",
    name: "ياسر القحطاني",
    phone: "٠٥٢١٢٣٩٩٠٠",
    nationalId: "********١٤٢٢",
    type: "متعاقد",
    status: "يحتاج مراجعة",
    city: "الرياض",
    vehicle: "ر ي ض ١١٠٨",
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
    id: "و-٢٠١",
    plate: "ج د د ٤٥١٢",
    type: "سيارة صغيرة",
    model: "هيونداي",
    year: "٢٠٢٣",
    driver: "أحمد السلمي",
    status: "جاهزة",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "جدة",
    notes: "مناسبة للطلبات السريعة"
  },
  {
    id: "و-٢٠٢",
    plate: "ر ي ض ٧٢٢١",
    type: "فان",
    model: "تويوتا",
    year: "٢٠٢٢",
    driver: "محمد الحربي",
    status: "قيد التشغيل",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "الرياض",
    notes: "سعة جيدة للطرود"
  },
  {
    id: "و-٢٠٣",
    plate: "م ك ة ٣١١٩",
    type: "دراجة",
    model: "ياماها",
    year: "٢٠٢٤",
    driver: "خالد العتيبي",
    status: "قيد التشغيل",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "مكة",
    notes: "فعالة في الزحام"
  },
  {
    id: "و-٢٠٤",
    plate: "د م م ٨٨١٣",
    type: "سيارة صغيرة",
    model: "نيسان",
    year: "٢٠٢١",
    driver: "فهد الزهراني",
    status: "جاهزة",
    insurance: "ساري",
    registration: "سارية",
    inspection: "ساري",
    city: "الدمام",
    notes: "جاهزة لمسارات الميل الأخير"
  },
  {
    id: "و-٢٠٥",
    plate: "ج د د ٩٩٢٠",
    type: "فان",
    model: "فورد",
    year: "٢٠٢٠",
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
    id: "عزم-طلب-١٠٠١",
    partnerRef: "شريك-٨٤١١",
    partner: "هنقرستيشن",
    type: "طلب مطعم",
    customer: "عميل تجريبي",
    phone: "٠٥٠٠٠٠١١١١",
    pickup: "مطعم حي السلامة",
    delivery: "شارع الأمير سلطان",
    city: "جدة",
    district: "السلامة",
    driver: "أحمد السلمي",
    vehicle: "ج د د ٤٥١٢",
    coverageAreaId: "area-jed-north",
    assignedDriverId: "م-١٠١",
    assignmentStatus: "مسند",
    assignedAt: "اليوم 09:20",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-٢٠١",
    status: "قيد التوصيل",
    priority: "عالية",
    pickupTime: "١٢:٢٠",
    deliveryTime: "١٣:٠٥",
    notes: "يرجى الاتصال قبل الوصول"
  },
  {
    id: "عزم-طلب-١٠٠٢",
    partnerRef: "شريك-٨٤١٢",
    partner: "جاهز",
    type: "طلب سريع",
    customer: "عميل تجريبي",
    phone: "٠٥٠٠٠٠٢٢٢٢",
    pickup: "فرع العزيزية",
    delivery: "مخطط الشرائع",
    city: "مكة",
    district: "العزيزية",
    driver: "خالد العتيبي",
    vehicle: "م ك ة ٣١١٩",
    coverageAreaId: "area-mak",
    assignedDriverId: "م-١٠٣",
    assignmentStatus: "مكتمل",
    assignedAt: "اليوم 10:00",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-٢٠٣",
    status: "تم التسليم",
    priority: "متوسطة",
    pickupTime: "١٠:١٠",
    deliveryTime: "١١:٠٠",
    notes: "تم التسليم بتوقيع العميل"
  },
  {
    id: "عزم-طلب-١٠٠٣",
    partnerRef: "شريك-٨٤١٣",
    partner: "كيتا",
    type: "طلب مطعم",
    customer: "عميل تجريبي",
    phone: "٠٥٠٠٠٠٣٣٣٣",
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
    pickupTime: "١٤:٠٠",
    deliveryTime: "١٤:٤٥",
    notes: "بحاجة إسناد سريع"
  },
  {
    id: "عزم-طلب-١٠٠٤",
    partnerRef: "شريك-٨٤١٤",
    partner: "مرسول",
    type: "طلب مجدول",
    customer: "عميل تجريبي",
    phone: "٠٥٠٠٠٠٤٤٤٤",
    pickup: "متجر حي الروضة",
    delivery: "شارع الأمير ماجد",
    city: "جدة",
    district: "الروضة",
    driver: "عمر الغامدي",
    vehicle: "ج د د ٩٩٢٠",
    coverageAreaId: "area-jed-south",
    assignedDriverId: "م-١٠٢",
    assignmentStatus: "يحتاج إعادة إسناد",
    assignedAt: "اليوم 09:05",
    assignedBy: "منسق التشغيل",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "و-٢٠٢",
    status: "متأخر",
    priority: "عاجلة",
    pickupTime: "٠٩:٣٠",
    deliveryTime: "١٠:٣٠",
    notes: "تأخير بسبب صيانة المركبة"
  }
];

export const initialParcels: Parcel[] = [
  {
    id: "عزم-طرد-٢٠٠١",
    tracking: "تتبع-٤٤١١",
    partner: "نون",
    customer: "عميل تجريبي",
    phone: "٠٥١١١١٢٢٢٢",
    pickup: "نقطة نون جدة",
    delivery: "حي الشاطئ",
    city: "جدة",
    district: "الشاطئ",
    weight: "٢٫٤ كجم",
    pieces: "قطعة واحدة",
    fragile: "لا",
    signature: "نعم",
    proof: "رمز تحقق",
    driver: "أحمد السلمي",
    vehicle: "ج د د ٤٥١٢",
    coverageAreaId: "area-jed-north",
    assignedDriverId: "م-١٠١",
    assignmentStatus: "مسند",
    assignedAt: "اليوم 08:45",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-٢٠١",
    status: "خارج للتوصيل",
    notes: "إثبات التسليم مطلوب"
  },
  {
    id: "عزم-طرد-٢٠٠٢",
    tracking: "تتبع-٤٤١٢",
    partner: "أمازون",
    customer: "عميل تجريبي",
    phone: "٠٥١١١١٣٣٣٣",
    pickup: "مركز الدمام",
    delivery: "حي الشاطئ",
    city: "الدمام",
    district: "الشاطئ",
    weight: "١٫١ كجم",
    pieces: "قطعتان",
    fragile: "نعم",
    signature: "لا",
    proof: "صورة التسليم",
    driver: "فهد الزهراني",
    vehicle: "د م م ٨٨١٣",
    coverageAreaId: "area-jed-south",
    assignedDriverId: "م-١٠٤",
    assignmentStatus: "مكتمل",
    assignedAt: "اليوم 07:50",
    assignedBy: "منسق التشغيل",
    isDriverInArea: true,
    reassignmentRequired: false,
    vehicleId: "و-٢٠٤",
    status: "تم التسليم",
    notes: "تم تصوير التسليم"
  },
  {
    id: "عزم-طرد-٢٠٠٣",
    tracking: "تتبع-٤٤١٣",
    partner: "متجر إلكتروني تجريبي",
    customer: "عميل تجريبي",
    phone: "٠٥١١١١٤٤٤٤",
    pickup: "مستودع الشريك",
    delivery: "حي الملقا",
    city: "الرياض",
    district: "الملقا",
    weight: "٣ كجم",
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
    id: "عزم-طرد-٢٠٠٤",
    tracking: "تتبع-٤٤١٤",
    partner: "نون",
    customer: "عميل تجريبي",
    phone: "٠٥١١١١٥٥٥٥",
    pickup: "نقطة نون الرياض",
    delivery: "حي الياسمين",
    city: "الرياض",
    district: "الياسمين",
    weight: "٠٫٨ كجم",
    pieces: "قطعة واحدة",
    fragile: "لا",
    signature: "لا",
    proof: "ملاحظة",
    driver: "محمد الحربي",
    vehicle: "ر ي ض ٧٢٢١",
    coverageAreaId: "area-jed-east",
    assignedDriverId: "م-١٠٢",
    assignmentStatus: "خارج نطاق المندوب",
    assignedAt: "اليوم 12:10",
    assignedBy: "منسق التشغيل",
    isDriverInArea: false,
    reassignmentRequired: true,
    vehicleId: "و-٢٠٢",
    status: "تعذر التسليم",
    notes: "العميل غير متاح"
  }
];

export const initialPickupPoints: PickupPoint[] = [
  {
    id: "ن-٣٠١",
    name: "فرع السلامة",
    partner: "هنقرستيشن",
    type: "مطعم",
    city: "جدة",
    district: "السلامة",
    address: "شارع صاري",
    contact: "مشرف الفرع",
    phone: "٠٥٥١١١٢٢٢٢",
    hours: "١٠ صباحا - ١٢ مساء",
    status: "نشطة",
    notes: "ذروة عالية بعد المغرب"
  },
  {
    id: "ن-٣٠٢",
    name: "مركز طرود جدة",
    partner: "نون",
    type: "مركز توزيع",
    city: "جدة",
    district: "الخالدية",
    address: "طريق المدينة",
    contact: "مسؤول الاستلام",
    phone: "٠٥٤٢٢٢٣٣٣٣",
    hours: "٨ صباحا - ٦ مساء",
    status: "نشطة",
    notes: "تحميل دفعات صباحية"
  },
  {
    id: "ن-٣٠٣",
    name: "نقطة الرياض",
    partner: "متجر إلكتروني تجريبي",
    type: "مستودع شريك",
    city: "الرياض",
    district: "الملقا",
    address: "طريق أنس بن مالك",
    contact: "ممثل المتجر",
    phone: "٠٥٣٣٣٣٤٤٤٤",
    hours: "٩ صباحا - ٥ مساء",
    status: "نشطة",
    notes: "يفضل الحضور قبل الظهيرة"
  }
];

export const initialAttempts: DeliveryAttempt[] = [
  {
    id: "ح-٤٠١",
    taskId: "عزم-طلب-١٠٠٢",
    taskType: "طلب",
    partner: "جاهز",
    driver: "خالد العتيبي",
    customer: "عميل تجريبي",
    time: "اليوم ١١:٠٠",
    result: "تم التسليم",
    reason: "لا يوجد",
    notes: "تم التحقق من الاستلام",
    proof: "توقيع العميل"
  },
  {
    id: "ح-٤٠٢",
    taskId: "عزم-طرد-٢٠٠٤",
    taskType: "طرد",
    partner: "نون",
    driver: "محمد الحربي",
    customer: "عميل تجريبي",
    time: "اليوم ١٢:١٥",
    result: "العميل غير متاح",
    reason: "عدم الرد على الاتصال",
    notes: "تم تسجيل محاولة وإرسال إشعار",
    proof: "ملاحظة"
  }
];

export const initialReturns: ReturnRecord[] = [
  {
    id: "ر-٥٠١",
    taskId: "عزم-طرد-٢٠٠٤",
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
    id: "وث-٦٠١",
    type: "وثيقة نقل داخلية",
    taskId: "عزم-طرد-٢٠٠١",
    partner: "نون",
    sender: "نقطة نون جدة",
    receiver: "عميل تجريبي",
    origin: "جدة",
    destination: "جدة",
    vehicle: "ج د د ٤٥١٢",
    driver: "أحمد السلمي",
    cargo: "طرد تجارة إلكترونية",
    pieces: "قطعة واحدة",
    weight: "٢٫٤ كجم",
    status: "جاهزة للمراجعة",
    bayanNumber: "",
    issuer: "",
    notes: "جاهزة للتحقق قبل أي ربط مستقبلي"
  },
  {
    id: "وث-٦٠٢",
    type: "مسودة وثيقة",
    taskId: "عزم-طلب-١٠٠٣",
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
    id: "س-٧٠١",
    user: "مدير العمليات",
    action: "إنشاء طلب",
    time: "اليوم ٠٩:١٠",
    related: "عزم-طلب-١٠٠١",
    status: "ناجح",
    notes: "تم تسجيل الطلب وإسناده"
  },
  {
    id: "س-٧٠٢",
    user: "منسق التشغيل",
    action: "إسناد لمندوب",
    time: "اليوم ٠٩:٢٠",
    related: "عزم-طرد-٢٠٠١",
    status: "ناجح",
    notes: "تم إسناد الطرد إلى أحمد السلمي"
  },
  {
    id: "س-٧٠٣",
    user: "المندوب",
    action: "تسجيل محاولة تسليم",
    time: "اليوم ١٢:١٥",
    related: "عزم-طرد-٢٠٠٤",
    status: "يحتاج متابعة",
    notes: "العميل غير متاح"
  },
  {
    id: "س-٧٠٤",
    user: "مسؤول الامتثال",
    action: "تحديث جاهزية بيان",
    time: "أمس ١٦:٣٠",
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
