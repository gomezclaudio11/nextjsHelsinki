"client";

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("doctor@hospital.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Save user to localStorage for quick client access
      localStorage.setItem("hospital_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-500/10 p-4 rounded-full text-teal-400 mb-3 border border-teal-500/20">
            <Activity size={36} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">HospiMetrics Next</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Monitoreo de Variables Hospitalarias</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-750 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                placeholder="doctor@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-750 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center text-sm disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Ingresar al Panel"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs">
          <Link href="/forgot-password" className="text-teal-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/register" className="text-teal-400 hover:underline font-medium">
            Crear nuevo usuario
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Credenciales por defecto: <span className="text-slate-400">doctor@hospital.com</span> / <span className="text-slate-400">123456</span>
        </div>
      </div>
    </div>
  );
}
