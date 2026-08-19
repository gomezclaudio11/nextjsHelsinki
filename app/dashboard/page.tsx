"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Plus, LogOut, FileText, ArrowRight, Database, Sparkles, Layers } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("hospital_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("hospital_user");
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <Activity className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/10 p-2 rounded-lg text-teal-400 border border-teal-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">HospiMetrics Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Panel Dinámico • Rol: {user.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/templates/new"
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2"
          >
            <Plus size={18} />
            Crear Nueva Planilla
          </Link>
          <button
            onClick={handleLogout}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-900/40 via-slate-800 to-slate-800 border border-teal-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Bienvenido, {user.name}</h2>
            <p className="text-slate-400 text-sm mt-1">
              Aquí puedes gestionar tus planillas de variables personalizadas, rellenar datos en blanco y generar gráficos estadísticos.
            </p>
          </div>
          <div className="text-xs bg-teal-500/10 text-teal-300 px-3 py-1.5 rounded-full border border-teal-500/30 flex items-center gap-1.5">
            <Sparkles size={14} />
            Sistema Dinámico Sin Datos Hardcodeados
          </div>
        </div>

        {/* Templates Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-teal-400" />
              Tus Planillas de Métricas ({templates.length})
            </h3>
          </div>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <Link
                  key={tpl.id}
                  href={`/dashboard/templates/${tpl.id}`}
                  className="bg-slate-800 border border-slate-700 hover:border-teal-500/50 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-teal-500/10 text-teal-400 text-xs px-2.5 py-1 rounded-md font-medium border border-teal-500/20">
                        {tpl.variables?.length || 0} variables
                      </span>
                      <span className="text-slate-400 text-xs">
                        {tpl.records?.length || 0} registros
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors mb-1">
                      {tpl.title}
                    </h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                      {tpl.description || "Sin descripción"}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {tpl.variables?.slice(0, 3).map((v: any) => (
                        <span key={v.id} className="bg-slate-900 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-700">
                          {v.name}
                        </span>
                      ))}
                      {tpl.variables?.length > 3 && (
                        <span className="text-slate-500 text-[11px] px-1 py-0.5">
                          +{tpl.variables.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700 text-xs font-medium text-teal-400">
                    <span>Abrir planilla y gráficos</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center space-y-4">
              <div className="bg-teal-500/10 text-teal-400 p-4 rounded-full w-fit mx-auto border border-teal-500/20">
                <FileText size={32} />
              </div>
              <h4 className="text-lg font-bold text-white">No tienes planillas creadas</h4>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Crea tu primera planilla definiendo los nombres de las variables que necesitas medir. El formulario y los gráficos se adaptarán automáticamente.
              </p>
              <Link
                href="/dashboard/templates/new"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-teal-600/20 text-sm"
              >
                <Plus size={18} />
                Crear Mi Primera Planilla
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
