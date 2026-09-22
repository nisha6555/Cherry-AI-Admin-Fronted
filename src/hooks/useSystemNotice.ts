import { useState, useEffect } from "react";
import { subscribeToActiveNotice } from "../services/noticeService";
import { SystemNotice } from "../types";
import { safeGetItem, safeSetItem } from "../utils/safeStorage";

const DISMISSED_NOTICE_KEY = "cherry_dismissed_notice_id";

export function useSystemNotice() {
  const [activeNotice, setActiveNotice] = useState<(SystemNotice & { isActive?: boolean }) | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeToActiveNotice((notice) => {
      if (notice && notice.active) {
        const dismissedId = safeGetItem(DISMISSED_NOTICE_KEY, "");
        if (dismissedId === notice.id) {
          setIsDismissed(true);
        } else {
          setIsDismissed(false);
        }
        setActiveNotice({ ...notice, isActive: notice.active });
      } else {
        setActiveNotice(null);
      }
    });

    return () => unsub();
  }, []);

  const dismiss = () => {
    if (activeNotice?.id) {
      safeSetItem(DISMISSED_NOTICE_KEY, activeNotice.id);
    }
    setIsDismissed(true);
  };

  return {
    activeNotice,
    isDismissed,
    dismiss,
  };
}
