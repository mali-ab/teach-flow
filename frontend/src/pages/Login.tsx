import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import AuthLayout from "../layouts/AuthLayout";
import api from "../lib/axios";
import type { ApiErrorResponse } from "../types/meeting";

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // POST request to your Go backend login endpoint
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Save token to localStorage for authorization interceptors
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Persist user info for AuthContext-driven UI
      // Backend now returns { token, user }
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            // Backend Role isn't returned yet; default to teacher.
            role: "teacher" as const,
          })
        );
      }


      // Redirect to dashboard upon successful authentication
      navigate("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Sign in to access your TeachFlow workspace
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-fade-in">
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative flex items-center">
              <EnvelopeIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@teachflow.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center">
              <LockClosedIcon className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-semibold transition underline-offset-4 hover:underline ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
