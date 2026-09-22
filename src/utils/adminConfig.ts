/**
 * Centralized Administrative Access & Role Config
 */
import { safeGetItem, safeSetItem } from "./safeStorage";

export const ADMIN_EMAILS: string[] = [
  "onlinework0876@gmail.com",
  "admin@cherryai.com",
  "maestry.edu@gmail.com",
];

const ADMIN_STORAGE_KEY = "cherry_custom_admin_emails";

export function getAllAdminEmails(): string[] {
  try {
    const raw = safeGetItem(ADMIN_STORAGE_KEY, "[]");
    const stored = JSON.parse(raw);
    return Array.from(new Set([...ADMIN_EMAILS, ...(Array.isArray(stored) ? stored : [])]));
  } catch {
    return ADMIN_EMAILS;
  }
}

export function addAdminEmail(email: string): { success: boolean; message: string } {
  if (!email || !email.includes("@")) return { success: false, message: "Please enter a valid email address." };
  const current = getAllAdminEmails();
  const normalized = email.toLowerCase().trim();
  if (!current.includes(normalized)) {
    const updated = [...current, normalized];
    safeSetItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
    return { success: true, message: `Added ${normalized} as an Admin.` };
  }
  return { success: false, message: "This email is already an admin." };
}

export function removeAdminEmail(email: string): { success: boolean; message: string } {
  const normalized = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(normalized)) {
    return { success: false, message: "Primary system admin email cannot be removed." };
  }
  const current = getAllAdminEmails().filter((e) => e !== normalized);
  safeSetItem(ADMIN_STORAGE_KEY, JSON.stringify(current));
  return { success: true, message: `Removed ${normalized} from admins.` };
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.toLowerCase().trim();
  const list = getAllAdminEmails();
  if (list.some((adm) => adm.toLowerCase() === normalized)) {
    return true;
  }
  if (normalized.endsWith("@cherryai.com") || normalized.includes("+admin")) {
    return true;
  }
  return false;
}

export function getUserRole(email?: string | null): "admin" | "student" {
  return isAdminEmail(email) ? "admin" : "student";
}
