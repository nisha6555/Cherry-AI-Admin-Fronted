import { safeGetItem, safeSetItem } from "./safeStorage";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface PlanReferralTier {
  id: string;
  name: string;
  label?: string;
  minMonths: number;
  durationMonths?: number;
  isMaxVip?: boolean;
  level1Percent: number;
  level2Percent: number;
  level3Percent: number;
  level4Percent: number;
  level5Percent: number;
  totalPercent?: number;
  badge: string;
  planName?: string;
  [key: string]: any;
}

export interface ReferralCommissionConfig {
  minimumWithdrawalINR: number;
  minWithdrawalLimit?: number;
  autoApproveBelowINR: number;
  allowSelfReferral: boolean;
  level1Reward?: number;
  level5Reward?: number;
  tiers: PlanReferralTier[];
  [key: string]: any;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  upiId: string;
  amount?: number;
  amountINR: number;
  status: "pending" | "approved" | "rejected" | "processing" | "successful";
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  utrNumber?: string;
  [key: string]: any;
}

export interface FraudFlag {
  id: string;
  type?: string;
  reason: string;
  severity: "low" | "medium" | "high";
  createdAt: number;
  [key: string]: any;
}

export interface StudentReferralSummary {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  referralCode: string;
  totalEarningsINR: number;
  currentBalanceINR: number;
  totalWithdrawnINR: number;
  referralsCount: number;
  status: "active" | "suspended" | "frozen" | "paused";
  fraudFlags?: FraudFlag[];
  joinedAt?: number;
  isFrozen?: boolean;
  totalTeamMembers?: number;
  walletBalance?: number;
  withdrawnAmount?: number;
  totalEarned?: number;
  [key: string]: any;
}

export interface ReferralAccountState {
  userId: string;
  userName?: string;
  referralCode: string;
  walletBalance: number;
  totalEarningsINR: number;
  currentBalanceINR: number;
  totalWithdrawnINR: number;
  directReferralsCount: number;
  level5NetworkCount: number;
  tierCounts: Record<number, number>;
  activities?: Array<{
    id: string;
    level: number;
    status: string;
    amount: number;
    [key: string]: any;
  }>;
  lastMissedEarning?: {
    isAcknowledged?: boolean;
    missedDiffINR?: number;
    [key: string]: any;
  };
  withdrawals: WithdrawalRecord[];
  referredUsers?: Array<{
    id: string;
    name: string;
    date: string;
    level: number;
    planPurchased: string;
    commissionEarnedINR: number;
  }>;
  [key: string]: any;
}

export interface ReferralLookupResult {
  valid: boolean;
  referrerName?: string;
  referrerUid?: string;
  discountPercent?: number;
  message?: string;
  referralCode?: string;
  referrerTierLabel?: string;
  level1Percent?: number;
  level1Reward?: number | string;
  [key: string]: any;
}

export const PLAN_REFERRAL_TIERS: PlanReferralTier[] = [
  {
    id: "free",
    name: "Standard Learner",
    label: "Standard Learner",
    minMonths: 0,
    durationMonths: 0,
    isMaxVip: false,
    level1Percent: 10,
    level2Percent: 5,
    level3Percent: 3,
    level4Percent: 2,
    level5Percent: 1,
    totalPercent: 21,
    badge: "Free",
    planName: "Standard Learner",
  },
  {
    id: "pro_3m",
    name: "3 Months Scholar",
    label: "3 Months Scholar",
    minMonths: 3,
    durationMonths: 3,
    isMaxVip: false,
    level1Percent: 15,
    level2Percent: 8,
    level3Percent: 4,
    level4Percent: 2,
    level5Percent: 1,
    totalPercent: 30,
    badge: "Pro 3M",
    planName: "3 Months Scholar",
  },
  {
    id: "pro_6m",
    name: "Pro Scholar",
    label: "Pro Scholar",
    minMonths: 6,
    durationMonths: 6,
    isMaxVip: false,
    level1Percent: 20,
    level2Percent: 10,
    level3Percent: 5,
    level4Percent: 3,
    level5Percent: 2,
    totalPercent: 40,
    badge: "Pro 6M",
    planName: "Pro Scholar",
  },
  {
    id: "vip_12m",
    name: "VIP Topper",
    label: "VIP Topper",
    minMonths: 12,
    durationMonths: 12,
    isMaxVip: true,
    level1Percent: 30,
    level2Percent: 15,
    level3Percent: 8,
    level4Percent: 5,
    level5Percent: 3,
    totalPercent: 61,
    badge: "VIP 12M",
    planName: "VIP Topper",
  },
];

export const DEFAULT_PLAN_REFERRAL_TIERS = PLAN_REFERRAL_TIERS;

export const REFERRAL_5_LEVEL_CONFIG = {
  levels: [
    { level: 1, label: "Direct Referral", defaultPercent: 20 },
    { level: 2, label: "Level 2 Network", defaultPercent: 10 },
    { level: 3, label: "Level 3 Network", defaultPercent: 5 },
    { level: 4, label: "Level 4 Network", defaultPercent: 3 },
    { level: 5, label: "Level 5 Network", defaultPercent: 2 },
  ],
};

export const DEFAULT_REFERRAL_COMMISSION_CONFIG: ReferralCommissionConfig = {
  minimumWithdrawalINR: 50,
  minWithdrawalLimit: 50,
  autoApproveBelowINR: 500,
  allowSelfReferral: false,
  level1Reward: 30,
  level5Reward: 5,
  tiers: PLAN_REFERRAL_TIERS,
};

const REFERRAL_STATE_KEY = "cherry_referral_state";
const REFERRAL_CONFIG_KEY = "cherry_referral_config";
const WITHDRAWALS_KEY = "cherry_all_withdrawals";
const SUMMARIES_KEY = "cherry_student_referral_summaries";

export function getReferralCommissionConfig(): ReferralCommissionConfig {
  try {
    const raw = safeGetItem(REFERRAL_CONFIG_KEY, "");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_REFERRAL_COMMISSION_CONFIG,
        ...parsed,
        minWithdrawalLimit: parsed.minWithdrawalLimit || parsed.minimumWithdrawalINR || 50,
        level1Reward: parsed.level1Reward ?? 30,
        level5Reward: parsed.level5Reward ?? 5,
      };
    }
  } catch {}
  return DEFAULT_REFERRAL_COMMISSION_CONFIG;
}

export function saveReferralCommissionConfig(config: ReferralCommissionConfig): void {
  safeSetItem(REFERRAL_CONFIG_KEY, JSON.stringify(config));
}

export function getPlanReferralTiers(config?: any): PlanReferralTier[] {
  if (config?.tiers && Array.isArray(config.tiers) && config.tiers.length > 0) {
    return config.tiers;
  }
  const currentConfig = getReferralCommissionConfig();
  return currentConfig.tiers || PLAN_REFERRAL_TIERS;
}

export function getDynamicTierConfig(arg1: any = 0, arg2?: any): any {
  if (typeof arg1 === "number") {
    const durationMonths = arg1;
    const tiers = getPlanReferralTiers();
    if (durationMonths >= 12) return tiers.find((t) => t.isMaxVip || (t.durationMonths || t.minMonths) >= 12) || tiers[tiers.length - 1];
    if (durationMonths >= 6) return tiers.find((t) => (t.durationMonths || t.minMonths) >= 6) || tiers[2] || tiers[1] || tiers[0];
    if (durationMonths >= 3) return tiers.find((t) => (t.durationMonths || t.minMonths) >= 3) || tiers[1] || tiers[0];
    return tiers[0];
  }
  // Called with (commissionConfig, referrerTier)
  return getPlanReferralTiers(arg1);
}

export function getReferrerActivePlanTier(durationOrId?: string | number, config?: any): PlanReferralTier {
  if (typeof durationOrId === "number") {
    return getDynamicTierConfig(durationOrId);
  }
  const tiers = getPlanReferralTiers(config);
  try {
    const rawSub = safeGetItem("cherry_active_subscription", "");
    if (rawSub) {
      const sub = JSON.parse(rawSub);
      const months = sub.durationMonths || (sub.planId?.includes("12m") ? 12 : sub.planId?.includes("6m") ? 6 : 0);
      if (months >= 12) return tiers.find(t => t.isMaxVip || (t.durationMonths || t.minMonths) >= 12) || tiers[tiers.length - 1];
      if (months >= 6) return tiers.find(t => (t.durationMonths || t.minMonths) >= 6) || tiers[2] || tiers[0];
      if (months >= 3) return tiers.find(t => (t.durationMonths || t.minMonths) >= 3) || tiers[1] || tiers[0];
    }
  } catch {}
  return tiers[0] || PLAN_REFERRAL_TIERS[0];
}

export function assignStudentSubscriptionTier(studentId: string, studentName: string, months: number): { success: boolean; tier: PlanReferralTier; message: string } {
  const tier = getDynamicTierConfig(months);
  return {
    success: true,
    tier,
    message: `Assigned ${studentName} to ${tier.name || tier.label || "Tier"} (${months} Months)`,
  };
}

export function calculateTieredReferralReward(
  arg1: any,
  arg2?: any,
  arg3?: any
): any {
  if (typeof arg1 === "object" && arg1 !== null) {
    const planPrice = arg1.planPriceINR || 149;
    const config = arg1.config || getReferralCommissionConfig();
    const tier: PlanReferralTier =
      arg1.tier ||
      getReferrerActivePlanTier(arg1.referrerIdOrName, config);

    const l1Pct = tier?.level1Percent || 20;
    const l2Pct = tier?.level2Percent || 10;
    const l3Pct = tier?.level3Percent || 5;
    const l4Pct = tier?.level4Percent || 3;
    const l5Pct = tier?.level5Percent || 2;

    const l1Reward = Math.max(1, Math.round(planPrice * (l1Pct / 100)));
    const l2Reward = Math.max(1, Math.round(planPrice * (l2Pct / 100)));
    const l3Reward = Math.max(1, Math.round(planPrice * (l3Pct / 100)));
    const l4Reward = Math.max(1, Math.round(planPrice * (l4Pct / 100)));
    const l5Reward = Math.max(1, Math.round(planPrice * (l5Pct / 100)));

    return {
      level1Reward: l1Reward,
      level1Percent: l1Pct,
      level2Reward: l2Reward,
      level2Percent: l2Pct,
      level3Reward: l3Reward,
      level3Percent: l3Pct,
      level4Reward: l4Reward,
      level4Percent: l4Pct,
      level5Reward: l5Reward,
      level5Percent: l5Pct,
      totalReward: l1Reward + l2Reward + l3Reward + l4Reward + l5Reward,
    };
  }

  const amountINR = Number(arg1) || 0;
  const level = Number(arg2) || 1;
  const tier: PlanReferralTier = arg3 || PLAN_REFERRAL_TIERS[0];
  let pct = tier.level1Percent;
  if (level === 2) pct = tier.level2Percent;
  else if (level === 3) pct = tier.level3Percent;
  else if (level === 4) pct = tier.level4Percent;
  else if (level === 5) pct = tier.level5Percent;

  return Math.round((amountINR * pct) / 100);
}

export function loadReferralState(nameOrId?: string, uid?: string): ReferralAccountState {
  const effectiveUid = uid || (nameOrId && nameOrId.startsWith("user_") ? nameOrId : "local_user");
  const key = `${REFERRAL_STATE_KEY}_${effectiveUid}`;
  try {
    const raw = safeGetItem(key, "") || safeGetItem(REFERRAL_STATE_KEY, "");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        const bal = parsed.walletBalance ?? parsed.currentBalanceINR ?? 0;
        return {
          userId: parsed.userId || effectiveUid,
          userName: parsed.userName || (typeof nameOrId === "string" && !nameOrId.startsWith("user_") ? nameOrId : "Student"),
          referralCode: parsed.referralCode || `CHERRY${effectiveUid.slice(-4).toUpperCase()}`,
          walletBalance: bal,
          currentBalanceINR: bal,
          totalEarningsINR: parsed.totalEarningsINR ?? 0,
          totalWithdrawnINR: parsed.totalWithdrawnINR ?? 0,
          directReferralsCount: parsed.directReferralsCount ?? 0,
          level5NetworkCount: parsed.level5NetworkCount ?? 0,
          tierCounts: parsed.tierCounts || { 1: parsed.directReferralsCount || 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          activities: parsed.activities || [],
          withdrawals: parsed.withdrawals || [],
          referredUsers: parsed.referredUsers || [],
          lastMissedEarning: parsed.lastMissedEarning,
        };
      }
    }
  } catch {}

  const initial: ReferralAccountState = {
    userId: effectiveUid,
    userName: typeof nameOrId === "string" && !nameOrId.startsWith("user_") ? nameOrId : "Student",
    referralCode: `CHERRY${effectiveUid.slice(-4).toUpperCase()}`,
    walletBalance: 0,
    currentBalanceINR: 0,
    totalEarningsINR: 0,
    totalWithdrawnINR: 0,
    directReferralsCount: 0,
    level5NetworkCount: 0,
    tierCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    activities: [],
    withdrawals: [],
    referredUsers: [],
  };
  saveReferralState(initial, effectiveUid);
  return initial;
}

export function saveReferralState(state: ReferralAccountState, uid?: string): void {
  const effectiveUid = uid || state.userId || "local_user";
  state.walletBalance = state.walletBalance ?? state.currentBalanceINR ?? 0;
  state.currentBalanceINR = state.currentBalanceINR ?? state.walletBalance ?? 0;
  safeSetItem(`${REFERRAL_STATE_KEY}_${effectiveUid}`, JSON.stringify(state));
  safeSetItem(REFERRAL_STATE_KEY, JSON.stringify(state));
}

export function requestWithdrawal(
  arg1: any,
  arg2?: any,
  arg3?: any,
  arg4?: any,
  arg5?: any
): { success: boolean; message: string; record?: WithdrawalRecord; updatedState?: ReferralAccountState } {
  let state: ReferralAccountState;
  let amountINR: number;
  let upiId: string;
  let userId: string;
  let userName: string;

  if (typeof arg1 === "object" && arg1 !== null) {
    state = { ...arg1 };
    amountINR = Number(arg2) || 0;
    upiId = String(arg3 || "");
    userId = String(arg4 || state.userId || "user_local");
    userName = String(arg5 || state.userName || "Student");
  } else {
    userId = String(arg1 || "user_local");
    userName = String(arg2 || "Student");
    upiId = String(arg3 || "");
    amountINR = Number(arg4) || 0;
    state = loadReferralState(userName, userId);
  }

  const config = getReferralCommissionConfig();
  const minLimit = config.minWithdrawalLimit || config.minimumWithdrawalINR || 50;

  if (amountINR < minLimit) {
    return {
      success: false,
      message: `Minimum withdrawal amount is ₹${minLimit}.`,
      updatedState: state,
    };
  }

  const currentBalance = state.walletBalance ?? state.currentBalanceINR ?? 0;
  if (amountINR > currentBalance) {
    return {
      success: false,
      message: "Insufficient wallet balance.",
      updatedState: state,
    };
  }

  const isAutoApprove = amountINR <= config.autoApproveBelowINR;
  const record: WithdrawalRecord = {
    id: `wdr_${Date.now()}`,
    userId,
    userName,
    upiId,
    amount: amountINR,
    amountINR,
    status: isAutoApprove ? "approved" : "pending",
    requestedAt: new Date().toISOString(),
    processedAt: isAutoApprove ? new Date().toISOString() : undefined,
    utrNumber: isAutoApprove ? `UTR${Date.now().toString().slice(-8)}` : undefined,
  };

  state.walletBalance = currentBalance - amountINR;
  state.currentBalanceINR = state.walletBalance;
  state.totalWithdrawnINR = (state.totalWithdrawnINR || 0) + amountINR;
  state.withdrawals = [record, ...(state.withdrawals || [])];
  saveReferralState(state, userId);

  const allWd = getAllWithdrawalRequests();
  safeSetItem(WITHDRAWALS_KEY, JSON.stringify([record, ...allWd]));

  return {
    success: true,
    message: "Withdrawal requested successfully!",
    record,
    updatedState: state,
  };
}

export function getAllWithdrawalRequests(_mergedStudents?: any): WithdrawalRecord[] {
  try {
    const raw = safeGetItem(WITHDRAWALS_KEY, "[]");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function approveWithdrawalRequest(id: string, notes?: string, _mergedStudents?: any): { success: boolean; message: string } {
  const all = getAllWithdrawalRequests();
  const target = all.find((w) => w.id === id);
  if (!target) {
    return { success: false, message: "Withdrawal request not found." };
  }
  const updated = all.map((w) =>
    w.id === id
      ? {
          ...w,
          status: "approved" as WithdrawalRecord["status"],
          processedAt: new Date().toISOString(),
          adminNotes: notes,
          utrNumber: notes && !notes.includes(" ") ? notes : w.utrNumber || `UTR${Date.now()}`,
        }
      : w
  );
  safeSetItem(WITHDRAWALS_KEY, JSON.stringify(updated));
  return { success: true, message: `Approved payout of ₹${target.amountINR} for ${target.userName || "Student"} ✅` };
}

export function rejectWithdrawalRequest(id: string, notes?: string, _mergedStudents?: any): { success: boolean; message: string } {
  const all = getAllWithdrawalRequests();
  const target = all.find((w) => w.id === id);
  if (!target) {
    return { success: false, message: "Withdrawal request not found." };
  }
  // refund balance
  const state = loadReferralState(target.userName, target.userId);
  state.currentBalanceINR = (state.currentBalanceINR || 0) + target.amountINR;
  state.walletBalance = state.currentBalanceINR;
  state.totalWithdrawnINR = Math.max(0, (state.totalWithdrawnINR || 0) - target.amountINR);
  saveReferralState(state, target.userId);

  const updated = all.map((w) =>
    w.id === id
      ? {
          ...w,
          status: "rejected" as WithdrawalRecord["status"],
          processedAt: new Date().toISOString(),
          adminNotes: notes,
        }
      : w
  );
  safeSetItem(WITHDRAWALS_KEY, JSON.stringify(updated));
  return { success: true, message: `Rejected payout request. ₹${target.amountINR} refunded to student wallet. 🔄` };
}

export function lookupReferralCode(
  code: string,
  _studentId?: string,
  _studentName?: string,
  _planOptions?: any
): ReferralLookupResult {
  const clean = (code || "").trim().toUpperCase();
  if (!clean || clean.length < 4) {
    return { valid: false, message: "Please enter a valid invite code." };
  }

  // Check locally
  const state = loadReferralState();
  if (state.referralCode === clean) {
    return {
      valid: true,
      referrerName: "Scholar Friend",
      referrerUid: state.userId,
      discountPercent: 10,
      message: "🎉 Referral code applied! You get a 10% instant discount.",
    };
  }

  // Accept general format CHERRY*
  if (clean.startsWith("CHERRY")) {
    return {
      valid: true,
      referrerName: "Peer Scholar",
      referrerUid: `ref_${clean}`,
      discountPercent: 10,
      message: "🎉 Valid invite code applied! 10% instant discount credited.",
    };
  }

  return { valid: false, message: "Invite code not found or expired." };
}

export async function distributeAndCreditReferralCommission(params: {
  referralCode?: string;
  referrerCode?: string;
  newStudentId?: string;
  newStudentName?: string;
  newStudentGrade?: string;
  newStudentEmail?: string;
  buyerUid?: string;
  buyerName?: string;
  amountINR?: number;
  planPriceINR?: number;
  planDurationMonths?: number;
  planId?: string;
  planName?: string;
  [key: string]: any;
}): Promise<{ success: boolean; message: string; isSelfReferral?: boolean }> {
  const code = (params.referralCode || params.referrerCode || "").trim().toUpperCase();
  const state = loadReferralState();
  const currentUserId = params.newStudentId || params.buyerUid;

  if (code === state.referralCode && currentUserId === state.userId) {
    return {
      success: false,
      message: "Self-referral is not permitted.",
      isSelfReferral: true,
    };
  }

  const amount = params.amountINR || params.planPriceINR || 49;
  const reward = Math.round(amount * 0.2); // 20%
  state.totalEarningsINR += reward;
  state.currentBalanceINR += reward;
  state.directReferralsCount += 1;
  state.referredUsers = [
    {
      id: currentUserId || `buyer_${Date.now()}`,
      name: params.newStudentName || params.buyerName || "Student",
      date: new Date().toISOString(),
      level: 1,
      planPurchased: params.planName || "Pro Plan",
      commissionEarnedINR: reward,
    },
    ...(state.referredUsers || []),
  ];
  saveReferralState(state);

  return {
    success: true,
    message: `🎉 Invite code applied! 20% reward (₹${reward}) credited.`,
  };
}

export function getAllStudentReferralSummaries(_mergedStudents?: any): StudentReferralSummary[] {
  try {
    const raw = safeGetItem(SUMMARIES_KEY, "");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const state = loadReferralState();
  return [
    {
      studentId: state.userId,
      studentName: "Active Scholar",
      referralCode: state.referralCode,
      totalEarningsINR: state.totalEarningsINR,
      currentBalanceINR: state.currentBalanceINR,
      walletBalance: state.currentBalanceINR,
      totalWithdrawnINR: state.totalWithdrawnINR,
      withdrawnAmount: state.totalWithdrawnINR,
      totalEarned: state.totalEarningsINR,
      referralsCount: state.directReferralsCount,
      totalTeamMembers: state.directReferralsCount + (state.level5NetworkCount || 0),
      status: "active",
      joinedAt: Date.now() - 86400000 * 7,
    },
  ];
}

export function getReferralSystemMetrics(referralSummaries?: any) {
  const summaries: StudentReferralSummary[] = Array.isArray(referralSummaries)
    ? referralSummaries
    : getAllStudentReferralSummaries();
  const withdrawals = getAllWithdrawalRequests();

  const totalEarnings = summaries.reduce((acc, s) => acc + (s.totalEarningsINR || s.totalEarned || 0), 0);
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "approved")
    .reduce((acc, w) => acc + w.amountINR, 0);
  const totalBalance = summaries.reduce((acc, s) => acc + (s.currentBalanceINR || s.walletBalance || 0), 0);
  const directMembers = summaries.reduce((acc, s) => acc + (s.referralsCount || 0), 0);
  const indirectMembers = summaries.reduce((acc, s) => acc + Math.max(0, (s.totalTeamMembers || 0) - (s.referralsCount || 0)), 0);
  const flagged = summaries.filter((s: any) => s.isFrozen || (s.fraudFlags && s.fraudFlags.length > 0)).length;

  return {
    totalReferrals: directMembers,
    totalReferrers: summaries.length,
    totalDirectMembers: directMembers,
    totalIndirectMembers: indirectMembers,
    totalNetworkMembers: directMembers + indirectMembers,
    totalCommissionsEarned: totalEarnings,
    totalActiveWalletBalance: totalBalance,
    totalCommissionsWithdrawn: totalWithdrawn,
    totalFlaggedAccounts: flagged,
    totalCommissionDistributedINR: totalEarnings,
    pendingPayoutsINR: withdrawals
      .filter((w) => w.status === "pending")
      .reduce((acc, w) => acc + w.amountINR, 0),
    completedPayoutsINR: totalWithdrawn,
  };
}

export function toggleStudentReferralStatus(studentId: string, newStatus?: string): void {
  const all = getAllStudentReferralSummaries();
  const updated = all.map((s) =>
    s.studentId === studentId
      ? {
          ...s,
          status: (newStatus || (s.status === "active" ? "suspended" : "active")) as StudentReferralSummary["status"],
        }
      : s
  );
  safeSetItem(SUMMARIES_KEY, JSON.stringify(updated));
}

export function toggleFreezeStudentReferralAccount(
  studentId: string,
  studentName?: string,
  nextFreezeState?: boolean,
  freezeReason?: string
): { success: boolean; message: string } {
  const all = getAllStudentReferralSummaries();
  const target = all.find((s) => s.studentId === studentId);
  const frozen = typeof nextFreezeState === "boolean" ? nextFreezeState : target?.status !== "frozen";
  const updated = all.map((s) =>
    s.studentId === studentId
      ? {
          ...s,
          status: (frozen ? "frozen" : "active") as StudentReferralSummary["status"],
          isFrozen: frozen,
          freezeReason: frozen ? freezeReason : undefined,
        }
      : s
  );
  safeSetItem(SUMMARIES_KEY, JSON.stringify(updated));
  const sName = studentName || target?.studentName || "Student";
  return {
    success: true,
    message: frozen
      ? `Frozen referral account for ${sName} 🔒`
      : `Unfrozen referral account for ${sName} 🔓`,
  };
}

export function addStudentFraudFlag(
  studentId: string,
  nameOrFlag: any,
  maybeFlag?: any
): { success: boolean; message: string } {
  const flagData = typeof maybeFlag === "object" ? maybeFlag : typeof nameOrFlag === "object" ? nameOrFlag : {};
  const sName = typeof nameOrFlag === "string" ? nameOrFlag : "Student";
  const all = getAllStudentReferralSummaries();
  const newFlag: FraudFlag = {
    id: `flag_${Date.now()}`,
    reason: flagData.reason || "Suspicious referral activity flagged by admin",
    severity: flagData.severity || "medium",
    type: flagData.type || "manual",
    createdAt: Date.now(),
    ...flagData,
  };
  const updated = all.map((s) =>
    s.studentId === studentId
      ? { ...s, fraudFlags: [...(s.fraudFlags || []), newFlag] }
      : s
  );
  safeSetItem(SUMMARIES_KEY, JSON.stringify(updated));
  return {
    success: true,
    message: `Fraud observation recorded for ${sName} ⚠️`,
  };
}

export function dismissStudentFraudFlag(
  studentId: string,
  nameOrFlagId: string,
  maybeFlagId?: string
): { success: boolean; message: string } {
  const flagId = maybeFlagId || nameOrFlagId;
  const sName = maybeFlagId ? nameOrFlagId : "Student";
  const all = getAllStudentReferralSummaries();
  const updated = all.map((s) =>
    s.studentId === studentId
      ? { ...s, fraudFlags: (s.fraudFlags || []).filter((f) => f.id !== flagId) }
      : s
  );
  safeSetItem(SUMMARIES_KEY, JSON.stringify(updated));
  return {
    success: true,
    message: `Fraud flag dismissed for ${sName} ✅`,
  };
}

export function adjustStudentWalletBalance(
  studentId: string,
  studentNameOrDelta: any,
  adjustmentTypeOrNotes?: any,
  amount?: any,
  _notes?: any
): { success: boolean; message: string } {
  let deltaINR = 0;
  let sName = "Student";
  if (typeof studentNameOrDelta === "number") {
    deltaINR = studentNameOrDelta;
  } else {
    sName = String(studentNameOrDelta || "Student");
    const isCredit = adjustmentTypeOrNotes === "credit" || adjustmentTypeOrNotes === "bonus" || adjustmentTypeOrNotes === "add";
    const numAmt = Number(amount) || 0;
    deltaINR = isCredit ? numAmt : -numAmt;
  }

  const state = loadReferralState(sName, studentId);
  state.currentBalanceINR = (state.currentBalanceINR || 0) + deltaINR;
  state.walletBalance = state.currentBalanceINR;
  if (deltaINR > 0) {
    state.totalEarningsINR = (state.totalEarningsINR || 0) + deltaINR;
  }
  saveReferralState(state, studentId);

  const all = getAllStudentReferralSummaries();
  const updated = all.map((s) =>
    s.studentId === studentId
      ? {
          ...s,
          currentBalanceINR: state.currentBalanceINR,
          walletBalance: state.currentBalanceINR,
          totalEarningsINR: state.totalEarningsINR,
        }
      : s
  );
  safeSetItem(SUMMARIES_KEY, JSON.stringify(updated));

  const sign = deltaINR >= 0 ? "+" : "-";
  return {
    success: true,
    message: `Wallet balance adjusted by ${sign}₹${Math.abs(deltaINR)} for ${sName} 💳`,
  };
}

export function validatePlanReferralTiers(tiers: PlanReferralTier[]): {
  isValid: boolean;
  sanitizedTiers: PlanReferralTier[];
  errors: string[];
} {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return {
      isValid: false,
      sanitizedTiers: PLAN_REFERRAL_TIERS,
      errors: ["At least one plan referral tier must be configured."],
    };
  }
  const sanitized = tiers.map((t, idx) => ({
    ...t,
    level1Percent: Math.max(0, Math.min(100, Number(t.level1Percent) || 0)),
    level2Percent: Math.max(0, Math.min(100, Number(t.level2Percent) || 0)),
    level3Percent: Math.max(0, Math.min(100, Number(t.level3Percent) || 0)),
    level4Percent: Math.max(0, Math.min(100, Number(t.level4Percent) || 0)),
    level5Percent: Math.max(0, Math.min(100, Number(t.level5Percent) || 0)),
    totalPercent:
      (Number(t.level1Percent) || 0) +
      (Number(t.level2Percent) || 0) +
      (Number(t.level3Percent) || 0) +
      (Number(t.level4Percent) || 0) +
      (Number(t.level5Percent) || 0),
    isMaxVip: t.isMaxVip ?? idx === tiers.length - 1,
  }));
  return {
    isValid: true,
    sanitizedTiers: sanitized,
    errors: [],
  };
}

export function createDefaultTierForPlan(planOrId: any, planNameOrIdx?: any): PlanReferralTier {
  const planId = typeof planOrId === "object" ? planOrId.id : String(planOrId);
  const planName = typeof planOrId === "object" ? planOrId.name : typeof planNameOrIdx === "string" ? planNameOrIdx : "Plan";
  const durationMonths = typeof planOrId === "object" ? planOrId.durationMonths || 1 : 1;
  const isVip = durationMonths >= 12;
  return {
    id: `tier_${planId}`,
    name: `${planName} Tier`,
    label: `${planName} Tier`,
    minMonths: durationMonths,
    durationMonths,
    level1Percent: isVip ? 30 : durationMonths >= 6 ? 25 : 20,
    level2Percent: isVip ? 15 : 10,
    level3Percent: isVip ? 8 : 5,
    level4Percent: isVip ? 5 : 3,
    level5Percent: isVip ? 3 : 2,
    totalPercent: isVip ? 61 : durationMonths >= 6 ? 45 : 40,
    badge: planName,
    isMaxVip: isVip,
  };
}

export async function syncCommissionConfigFromCloud(): Promise<{ config: ReferralCommissionConfig; success: boolean; message: string }> {
  try {
    const docRef = doc(db, "system_config", "referral_commissions");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudConfig = snap.data() as ReferralCommissionConfig;
      saveReferralCommissionConfig(cloudConfig);
      return { config: cloudConfig, success: true, message: "Referral commission config fetched from Cloud! ☁️" };
    }
  } catch (err) {
    console.warn("[ReferralStore] Cloud sync failed:", err);
  }
  return { config: getReferralCommissionConfig(), success: false, message: "Could not fetch from Cloud, using local settings." };
}

export async function saveCommissionConfigToCloud(config?: ReferralCommissionConfig): Promise<{ success: boolean }> {
  try {
    const toSave = config || getReferralCommissionConfig();
    saveReferralCommissionConfig(toSave);
    const docRef = doc(db, "system_config", "referral_commissions");
    await setDoc(docRef, { ...toSave, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("[ReferralStore] Cloud save failed:", err);
    return { success: false };
  }
}
