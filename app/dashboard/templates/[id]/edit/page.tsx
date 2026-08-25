"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Activity, ArrowLeft, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

interface VariableItem {
  id?: string;
  name: string;
  type: "number" | "text" | "date";
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [newVarType, setNewVarType] = useState<"number" | "text" | "date">("number");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("hospital_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    if (id) {
      fetch(`/api/templates/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data || data.error) throw new Error(data.error || "Planilla no encontrada");
          setTitle(data.title);
          setDescription(data.description || "");
          setVariables(data.variables);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, router]);

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName.trim()) return;
    if (variables.some((v) => v.name.toLowerCase() === newVarName.trim().toLowerCase())) {
      setError("La variable ya existe en esta planilla");
      return;
    }
    setVariables([...variables, { name: newVarName.trim(), type: newVarType }]);
    setNewVarName("");
    setNewVarType("number");
    setError("");
  };

  const handleRemoveVariable = (index: number) => {
    if (variables.length <= 1) {
      setError("La planilla debe tener al menos una variable");
      return;
    }
    setVariables(variables.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título de la planilla es obligatorio");
      return;
    }
    if (variables.length === 0) {
      setError("Agrega al menos una variable");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          variables,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar la planilla");

      router.push(`/dashboard/templates/${id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <Activity className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/dashboard/templates/${id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Volver a la Planilla
          </Link>
          <div className="flex items-center gap-2 text-teal-400">
            <Activity size={24} />
            <span className="font-bold">HospiMetrics</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold mb-2">Editar Planilla de Métricas</h1>
          <p className="text-slate-400 text-sm mb-6">
            Modifica el título, descripción o añade/quita variables según necesites.
          </p>

          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Título de la Planilla</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Descripción (Opcional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>

            <div className="border-t border-slate-700 pt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Variables de la Planilla (Columnas)</label>
              <p className="text-slate-400 text-xs mb-4">
                Puedes añadir nuevas variables o eliminar existentes.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="Nombre de nueva variable"
                  className="flex-1 bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                />
                <select
                  value={newVarType}
                  onChange={(e) => setNewVarType(e.target.value as "number" | "text" | "date")}
                  className="bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                >
                  <option value="number">Numérica</option>
                  <option value="text">Texto / Observación</option>
                  <option value="date">Fecha (Día, Mes, Año)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  Añadir
                </button>
              </div>

              <div className="space-y-2">
                {variables.map((v, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-750 px-4 py-2.5 rounded-lg flex items-center justify-between text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-xs font-bold border border-teal-500/20">
                        {index + 1}
                      </span>
                      <span>{v.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${v.type === 'number' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : v.type === 'date' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                        {v.type === 'number' ? 'Numérica' : v.type === 'date' ? 'Fecha' : 'Texto'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(index)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Eliminar variable"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? "Guardando Cambios..." : "Guardar Cambios de la Planilla"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
