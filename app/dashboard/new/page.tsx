"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity, ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

const recordSchema = z.object({
  serviceArea: z.string().min(1, "Seleccione un área de servicio"),
  bedOccupancy: z.coerce.number().min(0, "Mínimo 0").max(100, "Máximo 100%"),
  admissions: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  discharges: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  avgWaitTimeMinutes: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  infectionRate: z.coerce.number().min(0, "Mínimo 0").max(100, "Máximo 100%"),
});

type RecordInput = z.input<typeof recordSchema>;
type RecordOutput = z.output<typeof recordSchema>;

export default function NewRecordPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("hospital_user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordInput>({
    resolver: zodResolver(recordSchema) as any,
    defaultValues: {
      serviceArea: "Urgencias",
      bedOccupancy: 80,
      admissions: 10,
      discharges: 10,
      avgWaitTimeMinutes: 30,
      infectionRate: 1.0,
    },
  });

  const onSubmit = async (data: RecordInput) => {
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al guardar registro");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </Link>
          <div className="flex items-center gap-2 text-teal-400">
            <Activity size={24} />
            <span className="font-bold">HospiMetrics</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold mb-2">Nuevo Registro de Variables Hospitalarias</h1>
          <p className="text-slate-400 text-sm mb-6">Ingrese las métricas actuales del servicio para el análisis estadístico y cruce de variables.</p>

          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Área / Servicio Hospitalario</label>
              <select
                {...register("serviceArea")}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
              >
                <option value="Urgencias">Urgencias</option>
                <option value="UTI">UTI (Unidad de Terapia Intensiva)</option>
                <option value="Pediatría">Pediatría</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Maternidad">Maternidad</option>
              </select>
              {errors.serviceArea && <p className="text-rose-400 text-xs mt-1">{errors.serviceArea.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ocupación de Camas (%)</label>
                <input
                  type="number"
                  step="1"
                  {...register("bedOccupancy")}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                />
                {errors.bedOccupancy && <p className="text-rose-400 text-xs mt-1">{errors.bedOccupancy.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tiempo Promedio de Espera (min)</label>
                <input
                  type="number"
                  step="0.5"
                  {...register("avgWaitTimeMinutes")}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                />
                {errors.avgWaitTimeMinutes && <p className="text-rose-400 text-xs mt-1">{errors.avgWaitTimeMinutes.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nuevos Ingresos</label>
                <input
                  type="number"
                  {...register("admissions")}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                />
                {errors.admissions && <p className="text-rose-400 text-xs mt-1">{errors.admissions.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Altas Médicas (Egresos)</label>
                <input
                  type="number"
                  {...register("discharges")}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                />
                {errors.discharges && <p className="text-rose-400 text-xs mt-1">{errors.discharges.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tasa de Infección Intrahospitalaria (%)</label>
              <input
                type="number"
                step="0.1"
                {...register("infectionRate")}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
              />
              {errors.infectionRate && <p className="text-rose-400 text-xs mt-1">{errors.infectionRate.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? "Guardando..." : "Guardar Registro Hospitalario"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
