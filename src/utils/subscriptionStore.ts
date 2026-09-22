import { safeGetItem, safeSetItem, safeRemoveItem } from "./safeStorage";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline?: string;
  price?: number;
  priceINR: number;
  originalPriceINR?: number;
  durationMonths: number;
  durationLabel?: string;
  description?: string;
  features: string[];
  popular?: boolean;
  [key: string]: any;
}

export interface UpiConfig {
  upiId?: string;
  receiverUpiId?: string;
  merchantName: string;
  notes?: string;
  [key: string]: any;
}

export interface StudentSubscriptionRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  grade?: string;
  board?: string;
  subject?: string;
  mediumOfLearning?: string;
  planId: string;
  planName: string;
  price?: number;
  amountINR?: number;
  status: "active" | "expired" | "revoked" | "pending" | "pending_verification";
  startDate?: string;
  expiryDate?: string;
  expiresAt?: string | number;
  utrNumber?: string;
  approvedBy?: string;
  notes?: string;
  updatedAt?: number;
  isPro?: boolean;
  [key: string]: any;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  isPro?: boolean;
  activePlan?: SubscriptionPlan;
  subscriptionRecord?: StudentSubscriptionRecord;
  expiryDate?: string;
  [key: string]: any;
}

export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "monthly_49",
    name: "Monthly Pro",
    price: 49,
    priceINR: 49,
    originalPriceINR: 99,
    durationMonths: 1,
    durationLabel: "1 Month",
    description: "Full access to live AI classroom & labs",
    features: [
      "Unlimited Socratic live voice classes",
      "Interactive STEM Virtual Lab",
      "10-Year PYQ 80/20 Analysis",
      "Offline Audio Podcasts",
    ],
  },
  {
    id: "semiannual_149",
    name: "Half-Yearly Topper",
    price: 149,
    priceINR: 149,
    originalPriceINR: 299,
    durationMonths: 6,
    durationLabel: "6 Months",
    description: "Most popular choice for board preparation",
    popular: true,
    features: [
      "Everything in Monthly Pro",
      "2026 AI Predicted Board Papers",
      "Priority Doubt Resolution",
      "Detailed Performance Analytics",
    ],
  },
  {
    id: "annual_249",
    name: "Annual Master",
    price: 249,
    priceINR: 249,
    originalPriceINR: 499,
    durationMonths: 12,
    durationLabel: "12 Months",
    description: "Complete academic year coverage",
    features: [
      "All features for 365 days",
      "Unlimited Predicted Mock Tests",
      "Direct Mentor Guidance Sessions",
      "Free future feature upgrades",
    ],
  },
];

export const SUBSCRIPTION_PLANS = DEFAULT_SUBSCRIPTION_PLANS;

export const DEFAULT_UPI_CONFIG: UpiConfig = {
  upiId: "onlinework0876@okaxis",
  merchantName: "Cherry AI Education",
  notes: "Cherry AI Pro Subscription",
};

export const DEFAULT_RECEIVER_UPI_ID = DEFAULT_UPI_CONFIG.upiId;
export const DEFAULT_MERCHANT_NAME = DEFAULT_UPI_CONFIG.merchantName;

const SUB_PLANS_KEY = "cherry_custom_sub_plans";
const UPI_CONFIG_KEY = "cherry_custom_upi_config";
const STUDENT_SUBS_KEY = "cherry_student_subscriptions";
const CURRENT_USER_SUB_KEY = "cherry_current_user_sub";

export function getInitialSubscriptionState(): SubscriptionState {
  return {
    isSubscribed: false,
  };
}

export function loadSubscriptionState(): SubscriptionState {
  try {
    const raw = safeGetItem(CURRENT_USER_SUB_KEY, "");
    if (!raw) return getInitialSubscriptionState();
    const state = JSON.parse(raw);
    if (state.expiryDate && new Date(state.expiryDate).getTime() < Date.now()) {
      return { ...state, isSubscribed: false };
    }
    return state;
  } catch {
    return getInitialSubscriptionState();
  }
}

export function saveSubscriptionState(state: SubscriptionState): void {
  safeSetItem(CURRENT_USER_SUB_KEY, JSON.stringify(state));
}

export function clearUserSubscriptionState(): void {
  safeRemoveItem(CURRENT_USER_SUB_KEY);
}

export function isStudentSubscribed(state?: SubscriptionState): boolean {
  const current = state || loadSubscriptionState();
  return Boolean(current.isSubscribed);
}

export function getActiveSubscriptionPlans(): SubscriptionPlan[] {
  try {
    const raw = safeGetItem(SUB_PLANS_KEY, "");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SUBSCRIPTION_PLANS;
}

export function saveCustomSubscriptionPlans(plans: SubscriptionPlan[]): void {
  safeSetItem(SUB_PLANS_KEY, JSON.stringify(plans));
}

export function resetCustomSubscriptionPlans(): SubscriptionPlan[] {
  safeRemoveItem(SUB_PLANS_KEY);
  return DEFAULT_SUBSCRIPTION_PLANS;
}

export function getActiveUpiConfig(): UpiConfig {
  try {
    const raw = safeGetItem(UPI_CONFIG_KEY, "");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_UPI_CONFIG,
        ...parsed,
        receiverUpiId: parsed.receiverUpiId || parsed.upiId || DEFAULT_UPI_CONFIG.upiId,
        upiId: parsed.upiId || parsed.receiverUpiId || DEFAULT_UPI_CONFIG.upiId,
      };
    }
  } catch {}
  return {
    ...DEFAULT_UPI_CONFIG,
    receiverUpiId: DEFAULT_UPI_CONFIG.upiId,
  };
}

export function saveCustomUpiConfig(config: UpiConfig): void {
  const normalized = {
    ...config,
    upiId: config.upiId || config.receiverUpiId || DEFAULT_UPI_CONFIG.upiId,
    receiverUpiId: config.receiverUpiId || config.upiId || DEFAULT_UPI_CONFIG.upiId,
  };
  safeSetItem(UPI_CONFIG_KEY, JSON.stringify(normalized));
}

export function resetCustomUpiConfig(): UpiConfig {
  safeRemoveItem(UPI_CONFIG_KEY);
  return {
    ...DEFAULT_UPI_CONFIG,
    receiverUpiId: DEFAULT_UPI_CONFIG.upiId,
  };
}

export function generateTransactionReference(): string {
  return `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function buildDynamicUpiUri(
  amountOrConfig: number | { receiverUpiId?: string; merchantName?: string; amount: number; transactionRef?: string; note?: string },
  orderId: string = "CHERRY"
): string {
  if (typeof amountOrConfig === "object" && amountOrConfig !== null) {
    const upi = getActiveUpiConfig();
    const pa = encodeURIComponent(amountOrConfig.receiverUpiId || upi.upiId);
    const pn = encodeURIComponent(amountOrConfig.merchantName || upi.merchantName);
    const tn = encodeURIComponent(amountOrConfig.note || `${upi.notes} - ${amountOrConfig.transactionRef || orderId}`);
    const am = (amountOrConfig.amount || 0).toFixed(2);
    return `upi://pay?pa=${pa}&pn=${pn}&tn=${tn}&am=${am}&cu=INR`;
  }
  const upi = getActiveUpiConfig();
  const pa = encodeURIComponent(upi.upiId);
  const pn = encodeURIComponent(upi.merchantName);
  const tn = encodeURIComponent(`${upi.notes} - ${orderId}`);
  const am = (amountOrConfig as number).toFixed(2);
  return `upi://pay?pa=${pa}&pn=${pn}&tn=${tn}&am=${am}&cu=INR`;
}

export function getStudentSubscriptions(): StudentSubscriptionRecord[] {
  try {
    const raw = safeGetItem(STUDENT_SUBS_KEY, "[]");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudentSubscriptions(records: StudentSubscriptionRecord[]): void {
  safeSetItem(STUDENT_SUBS_KEY, JSON.stringify(records));
}

export function activateSubscription(plan: SubscriptionPlan, utr: string = ""): SubscriptionState {
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + plan.durationMonths);

  const state: SubscriptionState = {
    isSubscribed: true,
    activePlan: plan,
    expiryDate: expiry.toISOString(),
  };

  saveSubscriptionState(state);
  return state;
}

export function recordStudentUtrPayment(params: {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  grade?: string;
  board?: string;
  subject?: string;
  mediumOfLearning?: string;
  planId: string;
  amountINR?: number;
  utrNumber: string;
  status?: "pending_verification" | "active";
}): StudentSubscriptionRecord {
  const plans = getActiveSubscriptionPlans();
  const plan = plans.find((p) => p.id === params.planId) || plans[0];
  const now = new Date();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (plan?.durationMonths || 1));

  const record: StudentSubscriptionRecord = {
    id: `req_${Date.now()}`,
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    grade: params.grade,
    board: params.board,
    subject: params.subject,
    mediumOfLearning: params.mediumOfLearning,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    amountINR: params.amountINR || plan.price,
    status: params.status || "pending_verification",
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    utrNumber: params.utrNumber,
    isPro: true,
    updatedAt: Date.now(),
  };

  const current = getStudentSubscriptions();
  const updated = [record, ...current.filter((r) => r.studentId !== params.studentId)];
  saveStudentSubscriptions(updated);

  return record;
}

export async function checkStudentApprovalStatus(params: {
  studentId?: string;
  studentEmail?: string;
  studentName?: string;
}): Promise<{ isApproved: boolean; record?: StudentSubscriptionRecord }> {
  // Check local store first
  const subs = getStudentSubscriptions();
  const matched = subs.find(
    (s) =>
      (params.studentId && s.studentId === params.studentId) ||
      (params.studentEmail && s.studentEmail === params.studentEmail)
  );

  if (matched && matched.status === "active") {
    matched.isPro = true;
    const state: SubscriptionState = {
      isSubscribed: true,
      subscriptionRecord: matched,
      expiryDate: matched.expiryDate,
    };
    saveSubscriptionState(state);
    return { isApproved: true, record: matched };
  }

  // Check Firestore
  try {
    if (params.studentId) {
      const docRef = doc(db, "student_subscriptions", params.studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as StudentSubscriptionRecord;
        if (data.status === "active") {
          data.isPro = true;
          saveSubscriptionState({
            isSubscribed: true,
            subscriptionRecord: data,
            expiryDate: data.expiryDate,
          });
          return { isApproved: true, record: data };
        }
      }
    }
  } catch (e) {
    console.warn("[SubscriptionStore] Firestore check approval status error:", e);
  }

  return { isApproved: false };
}

export async function provisionStudentDirectlyByAdmin(params: {
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  grade: string;
  board: string;
  subject: string;
  mediumOfLearning: string;
  planId: string;
  adminEmail: string;
  notes?: string;
}): Promise<{ subscriptionRecord: StudentSubscriptionRecord }> {
  const plans = getActiveSubscriptionPlans();
  const plan = plans.find((p) => p.id === params.planId) || plans[0];
  const now = new Date();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (plan?.durationMonths || 1));

  const studentId = `admin_std_${Date.now()}`;
  const record: StudentSubscriptionRecord = {
    id: `sub_${Date.now()}`,
    studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    grade: params.grade,
    board: params.board,
    subject: params.subject,
    mediumOfLearning: params.mediumOfLearning,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    status: "active",
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    approvedBy: params.adminEmail,
    notes: params.notes,
    isPro: true,
    updatedAt: Date.now(),
  };

  const current = getStudentSubscriptions();
  saveStudentSubscriptions([record, ...current]);
  await saveStudentSubscriptionToCloud(record);

  return { subscriptionRecord: record };
}

export function approveStudentSubscription(params: {
  studentId: string;
  planId: string;
  adminEmail: string;
  notes?: string;
  studentName?: string;
  studentEmail?: string;
}): StudentSubscriptionRecord | null {
  const plans = getActiveSubscriptionPlans();
  const plan = plans.find((p) => p.id === params.planId) || plans[0];
  const now = new Date();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (plan?.durationMonths || 1));

  const record: StudentSubscriptionRecord = {
    id: `sub_${Date.now()}`,
    studentId: params.studentId,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    status: "active",
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    expiresAt: expiry.toISOString(),
    approvedBy: params.adminEmail,
    notes: params.notes,
    isPro: true,
    updatedAt: Date.now(),
  };

  const current = getStudentSubscriptions();
  const updated = [record, ...current.filter((r) => r.studentId !== params.studentId)];
  saveStudentSubscriptions(updated);

  return record;
}

export function revokeStudentSubscription(
  param: string | { studentId: string; reason?: string },
  maybeReason?: string
): StudentSubscriptionRecord | null {
  const studentId = typeof param === "object" ? param.studentId : param;
  const reason = typeof param === "object" ? param.reason : maybeReason;
  const current = getStudentSubscriptions();
  const target = current.find((r) => r.studentId === studentId);
  if (!target) return null;
  target.status = "revoked";
  target.isPro = false;
  if (reason) target.notes = reason;
  target.updatedAt = Date.now();
  saveStudentSubscriptions([...current]);
  return target;
}

export function extendStudentSubscription(
  param: string | { studentId: string; extraMonths?: number; days?: number },
  extraDaysOrMonths?: number
): StudentSubscriptionRecord | null {
  const studentId = typeof param === "object" ? param.studentId : param;
  let addedDays = 30;
  if (typeof param === "object") {
    if (param.extraMonths) addedDays = param.extraMonths * 30;
    else if (param.days) addedDays = param.days;
  } else if (typeof extraDaysOrMonths === "number") {
    addedDays = extraDaysOrMonths > 12 ? extraDaysOrMonths : extraDaysOrMonths * 30;
  }

  const current = getStudentSubscriptions();
  const target = current.find((r) => r.studentId === studentId);
  if (!target) return null;
  const currExp = new Date(target.expiryDate).getTime() > Date.now() ? new Date(target.expiryDate) : new Date();
  currExp.setDate(currExp.getDate() + addedDays);
  target.expiryDate = currExp.toISOString();
  target.expiresAt = target.expiryDate;
  target.status = "active";
  target.isPro = true;
  target.updatedAt = Date.now();
  saveStudentSubscriptions([...current]);
  return target;
}

export function matchProvisionedStudent(
  query: string | { uid?: string; email?: string; phone?: string }
): any {
  const subs = getStudentSubscriptions();
  if (typeof query === "string") {
    const found = subs.find(
      (s) =>
        (s.studentId === query || s.studentEmail === query) &&
        s.status === "active" &&
        new Date(s.expiryDate).getTime() > Date.now()
    );
    return Boolean(found);
  }

  const cleanEmail = query.email?.toLowerCase();
  const cleanPhone = query.phone?.replace(/\D/g, "");
  const found = subs.find(
    (s) =>
      ((query.uid && s.studentId === query.uid) ||
        (cleanEmail && s.studentEmail?.toLowerCase() === cleanEmail) ||
        (cleanPhone && s.studentId?.includes(cleanPhone))) &&
      s.status === "active" &&
      new Date(s.expiryDate).getTime() > Date.now()
  );

  if (found) {
    found.isPro = true;
    return {
      isMatched: true,
      profileData: {
        name: found.studentName || "Student",
        grade: found.grade || "Class 10",
        board: found.board || "CBSE Board",
        subject: found.subject || "Science",
        mediumOfLearning: found.mediumOfLearning || "Hinglish",
      },
      subscription: found,
    };
  }

  return null;
}

export function getSubscriptionExpiryStatus(expiryDateStr?: string): {
  isExpired: boolean;
  daysRemaining: number;
  formattedText: string;
  isExpiringSoon?: boolean;
} {
  if (!expiryDateStr) {
    return { isExpired: true, daysRemaining: 0, formattedText: "No Expiry Set", isExpiringSoon: false };
  }
  const diffMs = new Date(expiryDateStr).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    isExpired: days <= 0,
    daysRemaining: Math.max(0, days),
    formattedText: days > 0 ? `${days} days left` : "Expired",
    isExpiringSoon: days > 0 && days <= 7,
  };
}

export const getSubscriptionExpiryDetails = getSubscriptionExpiryStatus;

export function exportSubscriptionsToCSV(records: StudentSubscriptionRecord[]): string {
  const header = "Student ID,Student Name,Plan Name,Price,Status,Start Date,Expiry Date,Approved By,Notes\n";
  const rows = records
    .map(
      (r) =>
        `"${r.studentId}","${r.studentName || ""}","${r.planName}",${r.price},"${r.status}","${r.startDate}","${r.expiryDate}","${r.approvedBy || ""}","${r.notes || ""}"`
    )
    .join("\n");
  return header + rows;
}

export async function syncSubscriptionSettingsFromCloud(): Promise<{
  plans: SubscriptionPlan[];
  upiConfig: UpiConfig;
} | null> {
  try {
    const docRef = doc(db, "system_config", "subscriptions");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.plans) saveCustomSubscriptionPlans(data.plans);
      if (data.upi) saveCustomUpiConfig(data.upi);
      return {
        plans: data.plans || getActiveSubscriptionPlans(),
        upiConfig: data.upi || getActiveUpiConfig(),
      };
    }
  } catch (err) {
    console.warn("[SubscriptionStore] Cloud sync failed:", err);
  }
  return {
    plans: getActiveSubscriptionPlans(),
    upiConfig: getActiveUpiConfig(),
  };
}

export async function saveSubscriptionSettingsToCloud(
  plans?: SubscriptionPlan[],
  upiConfig?: UpiConfig
): Promise<boolean> {
  try {
    if (plans) saveCustomSubscriptionPlans(plans);
    if (upiConfig) saveCustomUpiConfig(upiConfig);
    const docRef = doc(db, "system_config", "subscriptions");
    await setDoc(
      docRef,
      {
        plans: plans || getActiveSubscriptionPlans(),
        upi: upiConfig || getActiveUpiConfig(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("[SubscriptionStore] Cloud save failed:", err);
    return false;
  }
}

export async function syncStudentSubscriptionsFromCloud(): Promise<StudentSubscriptionRecord[] | null> {
  return getStudentSubscriptions();
}

export async function saveStudentSubscriptionToCloud(record: StudentSubscriptionRecord): Promise<boolean> {
  try {
    const docRef = doc(db, "student_subscriptions", record.id || record.studentId);
    await setDoc(docRef, { ...record, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.warn("[SubscriptionStore] Save student sub to cloud failed:", err);
    return false;
  }
}
