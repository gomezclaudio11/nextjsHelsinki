import Link from "next/link";
import { Activity, ShieldCheck, Database, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 px-4 py-2 rounded-full border border-teal-500/20 text-sm font-medium">
          <Activity size={18} />
          Proyecto Práctico Next.js App Router
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          HospiMetrics <span className="text-teal-400">Next.js</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Sistema integral de monitoreo, registro y cruce de variables hospitalarias desarrollado para aprender Next.js, Prisma, Tailwind CSS y Recharts.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-base"
          >
            Ir al Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <div className="bg-teal-500/10 text-teal-400 p-3 rounded-lg w-fit mb-4 border border-teal-500/20">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">Autenticación Segura</h3>
            <p className="text-slate-400 text-sm">Control de acceso de usuarios y médicos con contraseñas cifradas con bcrypt.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg w-fit mb-4 border border-blue-500/20">
              <Database size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">Prisma ORM & SQLite</h3>
            <p className="text-slate-400 text-sm">Almacenamiento relacional rápido y escalable con migraciones automáticas.</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl">
            <div className="bg-amber-500/10 text-amber-400 p-3 rounded-lg w-fit mb-4 border border-amber-500/20">
              <BarChart3 size={24} />
            </div>
            <h3 className="font-bold text-white mb-2">Gráficos y Cruce de Datos</h3>
            <p className="text-slate-400 text-sm">Visualización estadística con Recharts cruzando ocupación, espera e infecciones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
