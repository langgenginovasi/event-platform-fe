"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Login gagal! Silakan cek kembali email & password Anda.");
    } else {
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left Panel — Brand */}
      <div
        className="w-full md:w-1/2 relative flex flex-col justify-center items-center p-8 lg:p-16 overflow-hidden min-h-[260px] md:min-h-screen"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        {/* Decorative circles */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-900/40 -top-16 -right-16 mix-blend-screen" />
        <div className="absolute w-[250px] h-[250px] rounded-full bg-sky-800/30 -bottom-12 -left-12 mix-blend-screen" />
        <div className="absolute w-[180px] h-[180px] rounded-full bg-blue-700/20 top-1/4 left-10 blur-sm" />

        <div className="relative z-10 flex flex-col items-center text-center w-full">
          {/* Logo placeholder */}
          <div
            className="mb-6 p-5 bg-white rounded-full shadow-xl"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#001A41"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-wider text-white uppercase">
            Event Platform
          </h1>
          <p className="text-sm font-medium text-sky-200 tracking-widest uppercase mt-2 max-w-sm">
            Enterprise Management System
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16 xl:p-24">
        <div className="w-full max-w-md flex flex-col space-y-8">
          {/* Header */}
          <div>
            <h2
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--brand-primary)" }}
            >
              Masuk
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Silakan masukkan akun Anda untuk mengakses sistem dashboard.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full flex flex-col space-y-6">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border-b-2 border-gray-200 text-gray-900 text-sm py-2.5 focus:outline-none transition-colors placeholder-gray-300"
                style={{ "--tw-border-opacity": "1" } as React.CSSProperties}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand-light)")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                placeholder="name@company.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border-b-2 border-gray-200 text-gray-900 text-sm py-2.5 pr-10 focus:outline-none transition-colors placeholder-gray-300"
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand-light)")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2.5 text-gray-400 transition-colors"
                  style={{ hover: { color: "var(--brand-primary)" } } as React.CSSProperties}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold rounded-md text-sm py-3 px-5 text-center shadow-md transition-all active:scale-[0.99] flex items-center justify-center min-h-[44px] disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading ? "#9ca3af" : "var(--brand-primary)",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "var(--brand-light)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "var(--brand-primary)";
                }}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
