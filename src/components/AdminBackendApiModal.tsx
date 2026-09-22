import React, { useState, useEffect } from "react";
import {
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Save,
  RotateCcw,
  X,
  Radio,
  Zap,
  ShieldAlert,
} from "lucide-react";
import {
  getBackendApiUrl,
  getDefaultApiUrl,
  setCustomBackendApiUrl,
  checkBackendHealth,
  BackendHealthStatus,
} from "../config/api";

interface AdminBackendApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const AdminBackendApiModal: React.FC<AdminBackendApiModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const [apiUrlInput, setApiUrlInput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<BackendHealthStatus | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiUrlInput(getBackendApiUrl());
      handleTest(getBackendApiUrl());
    }
  }, [isOpen]);

  const handleTest = async (overrideUrl?: string) => {
    setIsTesting(true);
    try {
      const status = await checkBackendHealth(4000);
      setHealthStatus(status);
      if (status.connected) {
        onToast(`Backend is online! (${status.latencyMs}ms)`, "success");
      } else if (getBackendApiUrl()) {
        onToast(`Backend check: ${status.statusText}`, "warning");
      }
    } catch (e: any) {
      setHealthStatus({
        connected: false,
        statusText: e?.message || "Failed to reach endpoint",
        url: overrideUrl || getBackendApiUrl() || "None",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setCustomBackendApiUrl(apiUrlInput);
    onToast("Backend API URL updated successfully", "success");
    handleTest(apiUrlInput);
  };

  const handleResetToEnv = () => {
    const defaultUrl = getDefaultApiUrl();
    setCustomBackendApiUrl(null);
    setApiUrlInput(defaultUrl);
    onToast(
      defaultUrl
        ? `Reset to environment variable VITE_API_URL: ${defaultUrl}`
        : "Reset to environment default (empty)",
      "info"
    );
    handleTest(defaultUrl);
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-backend-api-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        id="admin-backend-api-modal-card"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">External Backend API URL</h2>
              <p className="text-xs text-slate-400">Configure connection for Vercel SPA Admin mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Status Overview Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              healthStatus?.connected
                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                : apiUrlInput
                ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                : "bg-slate-800/60 border-slate-700/60 text-slate-300"
            }`}
          >
            {healthStatus?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : apiUrlInput ? (
              <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">
                {healthStatus?.connected
                  ? "Connected to Backend Service"
                  : apiUrlInput
                  ? "Backend Connection Pending / Standalone Mode"
                  : "No Backend API URL Set"}
              </p>
              <p className="text-slate-400">
                {healthStatus?.statusText ||
                  "The Admin SPA manages plans, referral commissions, and payouts directly with persistent cloud storage."}
              </p>
              {healthStatus?.latencyMs !== undefined && (
                <p className="text-emerald-400 font-mono text-[11px]">
                  Response Latency: {healthStatus.latencyMs} ms
                </p>
              )}
            </div>
          </div>

          {/* Form input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              API Base Endpoint (<code className="text-rose-400 font-mono">VITE_API_URL</code>)
            </label>
            <div className="relative">
              <input
                type="url"
                value={apiUrlInput}
                onChange={(e) => setApiUrlInput(e.target.value)}
                placeholder="https://your-backend-api.vercel.app or http://localhost:8000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Set this in your Vercel Project Settings as{" "}
              <span className="font-mono text-slate-300">VITE_API_URL</span> or modify here for live testing.
            </p>
          </div>

          {/* Actions & Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleTest(apiUrlInput)}
              disabled={isTesting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
              {isTesting ? "Testing Connection..." : "Ping Backend"}
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm ml-auto"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>

            <button
              onClick={handleResetToEnv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
              title="Reset to build environment value"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Architecture note */}
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1.5">
            <p className="font-medium text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Vercel Admin Frontend Architecture
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              This repository is compiled purely as a high-performance Single Page Application (SPA).
              All student-facing components (Classroom, Quiz arena, Whiteboard, Books) and Node backend
              routes have been decoupled so this Admin dashboard runs standalone with zero server overhead.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
