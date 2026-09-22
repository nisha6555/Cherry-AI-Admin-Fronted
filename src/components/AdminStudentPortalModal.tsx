import React, { useState } from "react";
import { GraduationCap, ExternalLink, X, ShieldAlert, ArrowRight, Copy, Check } from "lucide-react";

interface AdminStudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset?: {
    grade?: string;
    subject?: string;
    board?: string;
    mediumOfLearning?: string;
    name?: string;
  };
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

export const AdminStudentPortalModal: React.FC<AdminStudentPortalModalProps> = ({
  isOpen,
  onClose,
  preset,
  onToast,
}) => {
  const [studentAppUrl, setStudentAppUrl] = useState(() => {
    return localStorage.getItem("cherry_student_portal_url") || "https://cherry-ai-student.vercel.app";
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleLaunch = () => {
    localStorage.setItem("cherry_student_portal_url", studentAppUrl);
    window.open(studentAppUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(studentAppUrl);
    setCopied(true);
    onToast("Student Portal URL copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="admin-student-portal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Student Portal Notice</h2>
              <p className="text-xs text-slate-400">Admin Frontend Isolation</p>
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
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Student Components Decoupled</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              As per project architecture, all student-facing modules (Live Classroom, Quiz arena, Whiteboard canvas, and Books library) have been removed from this Admin SPA codebase to keep it lean and focused solely on management.
            </p>
          </div>

          {preset && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Requested Preset</span>
              <p className="text-slate-300 font-medium">
                {preset.name || "Student"} • Grade {preset.grade || "11"} • {preset.subject || "Physics"} ({preset.board || "CBSE"})
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Student App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={studentAppUrl}
                onChange={(e) => setStudentAppUrl(e.target.value)}
                placeholder="https://cherry-student.vercel.app"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={handleLaunch}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md"
            >
              <span>Open Student Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
