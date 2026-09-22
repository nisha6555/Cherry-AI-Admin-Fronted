/**
 * Safe wrapper around localStorage to prevent quota exceeded or security errors.
 */

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[SafeStorage] Failed to save key "${key}":`, e);
    // If quota exceeded, try to evict large cached objects
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("cache_") || k.startsWith("temp_"))) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export function safeGetItem(key: string, defaultValue: string = ""): string {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (e) {
    console.warn(`[SafeStorage] Failed to get key "${key}":`, e);
    return defaultValue;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[SafeStorage] Failed to remove key "${key}":`, e);
  }
}

export function safeSavePastSessions(sessionsOrUid: any, maybeSessions?: any[]): boolean {
  try {
    const sessions = Array.isArray(maybeSessions) ? maybeSessions : Array.isArray(sessionsOrUid) ? sessionsOrUid : [];
    const uid = typeof sessionsOrUid === "string" ? sessionsOrUid : "";
    // Keep max 20 recent sessions to protect storage budget
    const truncated = (sessions || []).slice(-20);
    if (uid) {
      safeSetItem(`cherry_past_sessions_${uid}`, JSON.stringify(truncated));
    }
    return safeSetItem("cherry_past_sessions", JSON.stringify(truncated));
  } catch (e) {
    console.warn("[SafeStorage] Failed to save past sessions:", e);
    return false;
  }
}

export function safeLoadPastSessions(): any[] {
  try {
    const raw = safeGetItem("cherry_past_sessions", "[]");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[SafeStorage] Failed to load past sessions:", e);
    return [];
  }
}
