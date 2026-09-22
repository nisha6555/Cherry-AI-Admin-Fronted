/**
 * Cherry AI - Dedicated Admin Frontend SPA
 * Single-Page Application optimized for Vercel deployment.
 * Connects directly to external backend API (VITE_API_URL).
 */

import React, { useState, useEffect, useCallback } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminBackendApiModal } from "./components/AdminBackendApiModal";
import { AdminStudentPortalModal } from "./components/AdminStudentPortalModal";
import { getBackendApiUrl, checkBackendHealth, BackendHealthStatus } from "./config/api";
import { getAllAdminEmails, ADMIN_EMAILS } from "./utils/adminConfig";
import {
  Server,
  CheckCircle2,
  AlertCircle,
  Radio,
  X,
  ShieldCheck,
  LogIn,
  ExternalLink,
} from "lucide-react";

interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export default function App() {
  // Current admin user state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("cherry_admin_session_user");
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      uid: "admin_master_001",
      email: "onlinework0876@gmail.com",
      displayName: "Master Admin",
    };
  });

  // Modals & overlay states
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [studentPreset, setStudentPreset] = useState<any>(null);

  // Backend API URL and Health State
  const [currentApiUrl, setCurrentApiUrl] = useState(() => getBackendApiUrl());
  const [apiHealth, setApiHealth] = useState<BackendHealthStatus | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check backend health periodically and on URL change
  const refreshApiHealth = useCallback(async () => {
    const url = getBackendApiUrl();
    setCurrentApiUrl(url);
    if (!url) {
      setApiHealth(null);
      return;
    }
    const status = await checkBackendHealth(3500);
    setApiHealth(status);
  }, []);

  useEffect(() => {
    refreshApiHealth();

    const handleUrlChange = () => {
      refreshApiHealth();
    };

    window.addEventListener("cherry_backend_api_url_changed", handleUrlChange);
    return () => {
      window.removeEventListener("cherry_backend_api_url_changed", handleUrlChange);
    };
  }, [refreshApiHealth]);

  // Sign out / Switch admin handler
  const handleSignOut = () => {
    setIsLoginModalOpen(true);
  };

  // Student view switch handler
  const handleSwitchToStudentView = (preset?: any) => {
    setStudentPreset(preset || null);
    setIsStudentModalOpen(true);
  };

  return (
    <div id="cherry-admin-spa-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-rose-500/30 selection:text-white">
      {/* Top Persistent Vercel SPA API Status Bar */}
      <div
        id="cherry-admin-api-statusbar"
        className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs z-30 backdrop-blur-md sticky top-0"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Cherry AI</span>
            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
              Admin SPA
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          {/* Backend Connection Indicator */}
          <button
            onClick={() => setIsApiModalOpen(true)}
            id="backend-api-status-btn"
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
              apiHealth?.connected
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60"
                : currentApiUrl
                ? "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/60"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/80"
            }`}
            title="Click to configure external backend API URL"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiHealth?.connected
                    ? "bg-emerald-400"
                    : currentApiUrl
                    ? "bg-amber-400"
                    : "bg-slate-500"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiHealth?.connected
                    ? "bg-emerald-500"
                    : currentApiUrl
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
            </span>
            <span className="hidden md:inline">Backend API:</span>
            <span className="font-mono text-[10px] max-w-[140px] truncate sm:max-w-[200px]">
              {currentApiUrl ? currentApiUrl : "Local & Cloud Storage"}
            </span>
            {apiHealth?.latencyMs !== undefined && (
              <span className="text-[10px] text-emerald-400 hidden lg:inline">
                ({apiHealth.latencyMs}ms)
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApiModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/90 rounded-lg text-[11px] font-medium transition border border-slate-700/70"
          >
            <Server className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Configure</span> API URL
          </button>

          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/90 rounded-lg text-[11px] font-medium transition border border-slate-700/70"
            title="External Student Portal reference"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Student Portal</span>
          </button>
        </div>
      </div>

      {/* Main Admin Dashboard View */}
      <main id="admin-dashboard-container" className="flex-1 flex flex-col w-full">
        <AdminDashboard
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onSwitchToStudentView={handleSwitchToStudentView}
          onToast={addToast}
        />
      </main>

      {/* Backend API Configuration Modal */}
      <AdminBackendApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onToast={addToast}
      />

      {/* Student Portal Notice Modal */}
      <AdminStudentPortalModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        preset={studentPreset}
        onToast={addToast}
      />

      {/* Switch Admin Account Modal */}
      {isLoginModalOpen && (
        <AdminSwitchAccountModal
          isOpen={isLoginModalOpen}
          currentEmail={currentUser?.email}
          onClose={() => setIsLoginModalOpen(false)}
          onSelect={(email) => {
            const updated = {
              uid: `admin_${Math.abs(email.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`,
              email,
              displayName: email.split("@")[0].toUpperCase() + " (Admin)",
            };
            setCurrentUser(updated);
            try {
              localStorage.setItem("cherry_admin_session_user", JSON.stringify(updated));
            } catch {
              // Ignore
            }
            setIsLoginModalOpen(false);
            addToast(`Switched active admin session to ${email}`, "success");
          }}
        />
      )}

      {/* Toast Notification Overlay */}
      <div
        id="toast-notification-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-xl text-xs backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-100"
                : toast.type === "warning"
                ? "bg-amber-950/90 border-amber-500/40 text-amber-100"
                : "bg-slate-900/90 border-slate-700/60 text-slate-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === "error" || toast.type === "warning" ? (
              <AlertCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  toast.type === "error" ? "text-rose-400" : "text-amber-400"
                }`}
              />
            ) : (
              <Radio className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-relaxed font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick Switch Admin Modal
 */
function AdminSwitchAccountModal({
  isOpen,
  currentEmail,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  currentEmail?: string;
  onClose: () => void;
  onSelect: (email: string) => void;
}) {
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");

  useEffect(() => {
    setAuthorizedEmails(getAllAdminEmails());
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Switch Admin Account</h2>
              <p className="text-xs text-slate-400">Select authorized admin session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Configured Super Admins
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {authorizedEmails.map((email) => {
                const isCurrent = email.toLowerCase() === (currentEmail || "").toLowerCase();
                return (
                  <button
                    key={email}
                    onClick={() => onSelect(email)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs text-left transition ${
                      isCurrent
                        ? "bg-rose-950/30 border-rose-500/40 text-rose-200 font-semibold"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{email}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Or Enter Authorized Admin Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="admin@cherry-ai.com"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                disabled={!customEmail.trim()}
                onClick={() => {
                  if (customEmail.trim()) {
                    onSelect(customEmail.trim());
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition"
              >
                Switch
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
