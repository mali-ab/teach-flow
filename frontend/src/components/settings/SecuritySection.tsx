import { useState } from "react";
import { motion } from "framer-motion";
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  LogOut,
  Trash2,
} from "lucide-react";
import InputField from "./InputField";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!newPassword) {
      setError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccess(false), 4000);
  };

  const renderPasswordToggle = (
    show: boolean,
    toggle: () => void
  ) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600 transition"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" as const }}
      className="bg-white border border-t-0 border-slate-100 rounded-b-2xl overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-6">
        {/* Change Password */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-slate-600" />
            <h4 className="font-semibold text-slate-900">Change Password</h4>
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Password changed successfully
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <InputField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                type={showCurrentPw ? "text" : "password"}
                placeholder="Enter current password"
                icon={Lock}
              />
              {renderPasswordToggle(showCurrentPw, () =>
                setShowCurrentPw(!showCurrentPw)
              )}
            </div>
            <div className="relative">
              <InputField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                type={showNewPw ? "text" : "password"}
                placeholder="At least 6 characters"
                icon={Lock}
              />
              {renderPasswordToggle(showNewPw, () =>
                setShowNewPw(!showNewPw)
              )}
            </div>
            <div className="relative">
              <InputField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                type={showConfirmPw ? "text" : "password"}
                placeholder="Re-enter new password"
                icon={Lock}
              />
              {renderPasswordToggle(showConfirmPw, () =>
                setShowConfirmPw(!showConfirmPw)
              )}
            </div>

            {/* Password strength */}
            {newPassword && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        newPassword.length >= level * 2
                          ? newPassword.length >= 8
                            ? "bg-emerald-500"
                            : newPassword.length >= 6
                            ? "bg-amber-500"
                            : "bg-rose-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  {newPassword.length < 6
                    ? "Weak — too short"
                    : newPassword.length < 8
                    ? "Fair — add more characters"
                    : "Strong password"}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Danger Zone */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h4 className="font-semibold text-slate-900">Danger Zone</h4>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:bg-rose-50 transition group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">
                    Sign Out
                  </p>
                  <p className="text-xs text-slate-400">
                    Sign out of your account on this device
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-600 group-hover:underline">
                Logout
              </span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-xl hover:bg-rose-50 transition group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-800">
                    Delete Account
                  </p>
                  <p className="text-xs text-slate-400">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-600 group-hover:underline">
                Delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

