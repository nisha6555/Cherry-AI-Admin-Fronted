import { db } from "../lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { SystemNotice } from "../types";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/safeStorage";

const NOTICE_STORAGE_KEY = "cherry_active_system_notice";

export function publishSystemNotice(notice: Partial<SystemNotice>): Promise<void> {
  const fullNotice: SystemNotice = {
    id: notice.id || `notice_${Date.now()}`,
    title: notice.title || "Announcement",
    message: notice.message || "",
    priority: notice.priority || "info",
    active: true,
    linkText: notice.linkText,
    linkUrl: notice.linkUrl,
    createdAt: Date.now(),
  };

  safeSetItem(NOTICE_STORAGE_KEY, JSON.stringify(fullNotice));

  try {
    const docRef = doc(db, "system_notices", "active_broadcast");
    return setDoc(docRef, { ...fullNotice, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("[NoticeService] Firestore publish notice failed:", err);
    return Promise.resolve();
  }
}

export function unpublishSystemNotice(): Promise<void> {
  safeRemoveItem(NOTICE_STORAGE_KEY);
  try {
    const docRef = doc(db, "system_notices", "active_broadcast");
    return setDoc(docRef, { active: false, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("[NoticeService] Firestore unpublish notice failed:", err);
    return Promise.resolve();
  }
}

export function subscribeToActiveNotice(callback: (notice: SystemNotice | null) => void): () => void {
  // First load from local storage
  try {
    const localRaw = safeGetItem(NOTICE_STORAGE_KEY, "");
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (parsed.active) callback(parsed);
    }
  } catch {}

  try {
    const docRef = doc(db, "system_notices", "active_broadcast");
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SystemNotice;
          if (data.active) {
            safeSetItem(NOTICE_STORAGE_KEY, JSON.stringify(data));
            callback(data);
            return;
          }
        }
        callback(null);
      },
      (err) => {
        console.warn("[NoticeService] Snapshot listener error:", err);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}
