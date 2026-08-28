"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, Plus, Trash2, Edit3, BarChart3, AlertCircle, Save, CheckSquare, Square, Filter, Calculator, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<{ [variableId: string]: string }>({});
  const [selectedChartVars, setSelectedChartVars] = useState<string[]>([]);
  const [selectedTableVars, setSelectedTableVars] = useState<string[]>([]);
  const [selectedStatVars, setSelectedStatVars] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newObservation, setNewObservation] = useState("");
  const [conclusionsText, setConclusionsText] = useState("");
  const [savingConclusions, setSavingConclusions] = useState(false);
  const [addingObservation, setAddingObservation] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("hospital_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    if (id) {
      fetchTemplate();
    }
  }, [id, router]);

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar la planilla");
      setTemplate(data);
      setConclusionsText(data.conclusions || "");

      const initial: { [key: string]: string } = {};
      data.variables.forEach((v: any) => {
        initial[v.id] = "";
      });
      setFormValues(initial);

      const numericIds = data.variables
        .filter((v: any) => v.type === "number")
        .map((v: any) => v.id);
      const allIds = data.variables.map((v: any) => v.id);

      setSelectedChartVars(prev => prev.length === 0 ? numericIds : prev.filter(id => allIds.includes(id)));
      setSelectedTableVars(prev => prev.length === 0 ? allIds : prev.filter(id => allIds.includes(id)));
      setSelectedStatVars(prev => prev.length === 0 ? allIds : prev.filter(id => allIds.includes(id)));

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (variableId: string, value: string) => {
    setFormValues({ ...formValues, [variableId]: value });
  };

  const toggleChartVariable = (variableId: string) => {
    if (selectedChartVars.includes(variableId)) {
      setSelectedChartVars(selectedChartVars.filter((vId) => vId !== variableId));
    } else {
      setSelectedChartVars([...selectedChartVars, variableId]);
    }
  };

  const toggleTableVariable = (variableId: string) => {
    if (selectedTableVars.includes(variableId)) {
      if (selectedTableVars.length <= 1) {
        alert("La tabla debe mostrar al menos una variable.");
        return;
      }
      setSelectedTableVars(selectedTableVars.filter((vId) => vId !== variableId));
    } else {
      setSelectedTableVars([...selectedTableVars, variableId]);
    }
  };

  const hideStatVariable = (variableId: string) => {
    setSelectedStatVars(selectedStatVars.filter((vId) => vId !== variableId));
  };

  const restoreStatVariables = () => {
    if (template && template.variables) {
      setSelectedStatVars(template.variables.map((v: any) => v.id));
    }
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !template) return;

    for (const v of template.variables) {
      if (formValues[v.id] === undefined || formValues[v.id] === "") {
        setError(`Por favor completa el valor para "${v.name}"`);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const valuesPayload = template.variables.map((v: any) => ({
        variableId: v.id,
        value: formValues[v.id],
      }));

      const res = await fetch("/api/records/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          userId: user.id,
          values: valuesPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el registro");

      setSuccessMsg("¡Registro guardado con éxito!");
      const resetForm: { [key: string]: string } = {};
      template.variables.forEach((v: any) => {
        resetForm[v.id] = "";
      });
      setFormValues(resetForm);

      fetchTemplate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const res = await fetch(`/api/records/custom/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el registro");
      fetchTemplate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!confirm("¿Estás seguro de eliminar esta planilla y todos sus registros?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isOwnerOrAdmin = user && template && (template.userId === user.id || user.role === 'admin');

  const handleRequestAccess = async () => {
    try {
      const res = await fetch(`/api/templates/${id}/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al solicitar acceso");
      fetchTemplate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/templates/${id}/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status, ownerUserId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar solicitud");
      fetchTemplate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObservation.trim() || !user) return;
    setAddingObservation(true);
    try {
      const res = await fetch(`/api/templates/${id}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: newObservation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la observación");
      setNewObservation("");
      fetchTemplate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingObservation(false);
    }
  };

  const handleDeleteObservation = async (obsId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta observación?")) return;
    try {
      const res = await fetch(`/api/templates/${id}/observations/${obsId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar la observación");
      fetchTemplate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveConclusions = async () => {
    if (!user) return;
    setSavingConclusions(true);
    try {
      const res = await fetch(`/api/templates/${id}/conclusions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, conclusions: conclusionsText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar las conclusiones");
      setTemplate(data);
      alert("¡Conclusiones guardadas con éxito!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConclusions(false);
    }
  };

  const handleDeleteConclusions = async () => {
    if (!confirm("¿Estás seguro de eliminar las conclusiones finales?")) return;
    if (!user) return;
    setSavingConclusions(true);
    try {
      const res = await fetch(`/api/templates/${id}/conclusions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, conclusions: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar las conclusiones");
      setTemplate(data);
      setConclusionsText("");
      alert("¡Conclusiones eliminadas con éxito!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConclusions(false);
    }
  };
  const userAccessRequest = template?.accessRequests?.find((req: any) => req.userId === user?.id);
  const isAuthorized = isOwnerOrAdmin || (userAccessRequest && userAccessRequest.status === 'approved');
  const isPending = userAccessRequest && userAccessRequest.status === 'pending';

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400">
        <Activity className="animate-spin" size={40} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-10 text-center">
        <h2 className="text-xl font-bold mb-4">Planilla no encontrada</h2>
        <Link href="/dashboard" className="text-teal-400 hover:underline">Volver al Dashboard</Link>
      </div>
    );
  }

  const formatCellValue = (variable: any, valMap: any) => {
    const val = valMap[variable.id];
    if (val === undefined || val === null || val === "") return "-";
    if (variable.type === "date") {
      try {
        const [y, m, d] = String(val).split("-");
        if (y && m && d) return `${d}/${m}/${y}`;
      } catch {}
      return val;
    }
    return val;
  };

  const numericVariables = template.variables.filter((v: any) => v.type === "number");
  const activeNumericVariables = numericVariables.filter((v: any) => selectedChartVars.includes(v.id));
  const activeTableVariables = template.variables.filter((v: any) => selectedTableVars.includes(v.id));

  // Calculate statistics for each variable
  const variableStats = template.variables.map((v: any) => {
    const values = template.records.flatMap((r: any) => r.values.filter((val: any) => val.variableId === v.id));

    if (v.type === "number") {
      const validNums = values.map((val: any) => val.numberValue).filter((n: any) => n !== null && n !== undefined);
      const avg = validNums.length > 0 ? (validNums.reduce((a: number, b: number) => a + b, 0) / validNums.length).toFixed(1) : "N/A";
      return { ...v, statType: "number", average: avg, totalCount: validNums.length };
    } else if (v.type === "date") {
      const validDates = values.map((val: any) => val.textValue).filter((t: any) => t && t.trim() !== "");
      const freq: { [key: string]: number } = {};
      validDates.forEach((t: string) => {
        freq[t] = (freq[t] || 0) + 1;
      });
      let mostFrequent = "N/A";
      let maxCount = 0;
      Object.entries(freq).forEach(([dateStr, count]) => {
        if (count > maxCount) {
          maxCount = count;
          try {
            const [y, m, d] = dateStr.split("-");
            mostFrequent = y && m && d ? `${d}/${m}/${y}` : dateStr;
          } catch {
            mostFrequent = dateStr;
          }
        }
      });
      const totalCount = validDates.length;
      const percentage = totalCount > 0 ? ((maxCount / totalCount) * 100).toFixed(1) + "%" : "0.0%";
      return { ...v, statType: "date", totalCount, mostFrequent, percentage };
    } else {
      const validTexts = values.map((val: any) => val.textValue).filter((t: any) => t && t.trim() !== "");
      const freq: { [key: string]: number } = {};
      validTexts.forEach((t: string) => {
        freq[t] = (freq[t] || 0) + 1;
      });
      let mostFrequent = "N/A";
      let maxCount = 0;
      Object.entries(freq).forEach(([text, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = text;
        }
      });
      const totalCount = validTexts.length;
      const percentage = totalCount > 0 ? ((maxCount / totalCount) * 100).toFixed(1) + "%" : "0.0%";
      return { ...v, statType: "text", totalCount, mostFrequent, percentage };
    }
  });

  const activeVariableStats = variableStats.filter((stat: any) => selectedStatVars.includes(stat.id));

  const chartData = template.records.map((record: any, index: number) => {
    const entry: any = {
      index: `#${template.records.length - index}`,
      fecha: new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    record.values.forEach((val: any) => {
      if (val.variable.type === "number" && selectedChartVars.includes(val.variableId) && val.numberValue !== null) {
        entry[val.variable.name] = val.numberValue;
      }
    });
    return entry;
  }).reverse();

  const colors = ["#14b8a6", "#f59e0b", "#3b82f6", "#f43f5e", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 p-2 rounded-lg transition-all"
            title="Volver al Dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-none">{template.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{template.description || "Planilla de métricas personalizadas"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwnerOrAdmin && (
            <>
              <Link
                href={`/dashboard/templates/${id}/edit`}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5"
                title="Editar planilla"
              >
                <Edit3 size={16} />
                <span className="hidden sm:inline">Editar Planilla</span>
              </Link>
              <button
                onClick={handleDeleteTemplate}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5"
                title="Eliminar planilla"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        {isOwnerOrAdmin && template.accessRequests?.filter((r: any) => r.status === 'pending').length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertCircle size={18} />
              Solicitudes de Acceso Pendientes ({template.accessRequests.filter((r: any) => r.status === 'pending').length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {template.accessRequests.filter((r: any) => r.status === 'pending').map((req: any) => (
                <div key={req.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-bold text-white text-sm">{req.user?.name || "Usuario"}</span>
                    <p className="text-slate-400 text-xs">{req.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleApproveRequest(req.id, "approved")}
                      className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-1.5 rounded-lg text-xs font-medium transition-all"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveRequest(req.id, "rejected")}
                      className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 py-1.5 rounded-lg text-xs font-medium transition-all"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Blank Data Entry Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl lg:col-span-1 h-fit">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Plus size={18} className="text-teal-400" />
              Nuevo Registro en Blanco
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Rellene los valores numéricos y de texto para esta planilla.
            </p>

            {error && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <Activity size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {!isAuthorized ? (
              <div className="py-4">
                {isPending ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle size={16} />
                      <span>Acceso Pendiente</span>
                    </div>
                    <p>Tu solicitud de autorización ha sido enviada al creador de la planilla. Podrás cargar registros una vez que sea aprobada.</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-xl text-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-teal-400">
                      <Activity size={16} />
                      <span>Autorización Requerida</span>
                    </div>
                    <p>Para cargar datos en esta planilla compartida, necesitas solicitar autorización al creador.</p>
                    <button
                      type="button"
                      onClick={handleRequestAccess}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-md shadow-teal-600/20 text-xs flex items-center justify-center gap-1.5"
                    >
                      Solicitar Autorización al Creador
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitRecord} className="space-y-4">
                {template.variables.map((variable: any) => (
                  <div key={variable.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300">{variable.name}</label>
                      <span className="text-[10px] text-slate-500">
                        {variable.type === 'number' ? 'Numérico' : variable.type === 'date' ? 'Fecha' : 'Texto'}
                      </span>
                    </div>
                    {variable.type === 'number' ? (
                      <input
                        type="number"
                        step="any"
                        value={formValues[variable.id] !== undefined ? formValues[variable.id] : ""}
                        onChange={(e) => handleInputChange(variable.id, e.target.value)}
                        placeholder="Ingrese valor numérico..."
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                      />
                    ) : variable.type === 'date' ? (
                      <input
                        type="date"
                        value={formValues[variable.id] !== undefined ? formValues[variable.id] : ""}
                        onChange={(e) => handleInputChange(variable.id, e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formValues[variable.id] !== undefined ? formValues[variable.id] : ""}
                        onChange={(e) => handleInputChange(variable.id, e.target.value)}
                        placeholder="Ingrese texto u observación..."
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg focus:outline-none focus:border-teal-500 text-sm"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
                >
                  <Save size={16} />
                  {submitting ? "Guardando..." : "Guardar Registro"}
                </button>
              </form>
            )}
          </div>

          {/* Right: Charts Section with Variable Selector */}
          <div className="lg:col-span-2 space-y-8">
            {numericVariables.length > 0 ? (
              <>
                {/* Variable Selector for Charts */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-xl">
                  <h4 className="text-sm font-bold text-white mb-3">Seleccionar Variables para los Gráficos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {numericVariables.map((v: any) => {
                      const isSelected = selectedChartVars.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleChartVariable(v.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                            isSelected
                              ? "bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-sm"
                              : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          {isSelected ? <CheckSquare size={14} className="text-teal-400" /> : <Square size={14} className="text-slate-500" />}
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-teal-400" />
                    Gráfico de Líneas (Evolución Temporal)
                  </h3>
                  <div className="h-72 w-full">
                    {chartData.length > 0 && activeNumericVariables.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "0.5rem", color: "#fff" }}
                          />
                          <Legend />
                          {activeNumericVariables.map((v: any, idx: number) => (
                            <Line
                              key={v.id}
                              type="monotone"
                              dataKey={v.name}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              name={v.name}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        {activeNumericVariables.length === 0
                          ? "Selecciona al menos una variable numérica para mostrar el gráfico"
                          : "Añade registros para visualizar los gráficos estadísticos"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-teal-400" />
                    Gráfico de Barras Comparativo
                  </h3>
                  <div className="h-72 w-full">
                    {chartData.length > 0 && activeNumericVariables.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "0.5rem", color: "#fff" }}
                          />
                          <Legend />
                          {activeNumericVariables.map((v: any, idx: number) => (
                            <Bar
                              key={v.id}
                              dataKey={v.name}
                              fill={colors[idx % colors.length]}
                              name={v.name}
                              radius={[4, 4, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        {activeNumericVariables.length === 0
                          ? "Selecciona al menos una variable numérica para mostrar el gráfico"
                          : "Añade registros para visualizar los gráficos estadísticos"}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center text-slate-400">
                Esta planilla solo contiene variables de texto. Los gráficos estadísticos requieren al menos una variable numérica.
              </div>
            )}
          </div>
        </div>

        {/* Records Table with Column Filter */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Filter size={18} className="text-teal-400" />
              Historial de Registros y Filtrado de Columnas
            </h3>
            {/* Table Column Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-2">Mostrar columnas:</span>
              {template.variables.map((v: any) => {
                const isChecked = selectedTableVars.includes(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleTableVariable(v.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all border ${
                      isChecked
                        ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                        : "bg-slate-900 text-slate-500 border-slate-700"
                    }`}
                  >
                    {isChecked ? <CheckSquare size={12} className="text-teal-400" /> : <Square size={12} className="text-slate-600" />}
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Registrado por</th>
                  {activeTableVariables.map((v: any) => (
                    <th key={v.id} className="px-4 py-3">
                      {v.name} <span className="text-[10px] text-slate-500 lowercase">({v.type})</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {template.records.length > 0 ? (
                  template.records.map((record: any) => {
                    const valMap: { [key: string]: any } = {};
                    record.values.forEach((val: any) => {
                      valMap[val.variableId] = val.variable.type === "number" ? val.numberValue : val.textValue;
                    });
                    return (
                      <tr key={record.id} className="hover:bg-slate-750">
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{record.user?.name || "N/A"}</td>
                        {activeTableVariables.map((v: any) => (
                          <td key={v.id} className="px-4 py-3">
                            {formatCellValue(v, valMap)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3 + activeTableVariables.length} className="text-center py-6 text-slate-500">
                      No hay registros en esta planilla todavía. Utiliza el formulario lateral para agregar el primer registro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Statistics Summary Section below the table */}
          {template.records.length > 0 && (
            <div className="border-t border-slate-700 pt-6 mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator size={16} className="text-teal-400" />
                  Resumen Estadístico (Promedios y Frecuencias)
                </h4>
                {activeVariableStats.length < variableStats.length && (
                  <button
                    type="button"
                    onClick={restoreStatVariables}
                    className="text-xs text-teal-400 hover:text-teal-300 underline transition-colors"
                  >
                    Restaurar tarjetas ocultas
                  </button>
                )}
              </div>
              {activeVariableStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeVariableStats.map((stat: any) => (
                    <div key={stat.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400 font-medium truncate pr-6" title={stat.name}>{stat.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">
                            {stat.type === 'number' ? 'Numérico' : stat.type === 'date' ? 'Fecha' : 'Texto'}
                          </span>
                          <button
                            type="button"
                            onClick={() => hideStatVariable(stat.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 rounded"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {stat.statType === 'number' ? (
                        <div>
                          <div className="text-xl font-bold text-teal-400">{stat.average}</div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Promedio general ({stat.totalCount} registros)</p>
                        </div>
                      ) : stat.statType === 'date' ? (
                        <div>
                          <div className="text-sm font-bold text-emerald-400 truncate" title={stat.mostFrequent}>
                            {stat.mostFrequent}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Fecha más frecuente ({stat.percentage} del total, {stat.totalCount} reg.)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-bold text-purple-400 truncate" title={stat.mostFrequent}>
                            {stat.mostFrequent}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Más frecuente ({stat.percentage} del total, {stat.totalCount} reg.)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  Todas las tarjetas del resumen estadístico han sido eliminadas.{" "}
                  <button onClick={restoreStatVariables} className="text-teal-400 underline hover:text-teal-300">
                    Restaurar tarjetas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Observations & Conclusions Sections below Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-700 pt-6 mt-6">
            {/* Left: Observations */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-teal-400" />
                Observaciones
              </h4>
              <p className="text-xs text-slate-400">
                Añade notas u observaciones sobre las mediciones. Quedará registrado el autor y la fecha.
              </p>

              {isAuthorized ? (
                <form onSubmit={handleAddObservation} className="space-y-3">
                  <textarea
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    placeholder="Escribe una observación..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={addingObservation || !newObservation.trim()}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    {addingObservation ? "Guardando..." : "Agregar Observación"}
                  </button>
                </form>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded-lg">
                  Se requiere autorización del creador para añadir observaciones.
                </div>
              )}

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {template.observations && template.observations.length > 0 ? (
                  template.observations.map((obs: any) => {
                    const canDeleteObs = user && (obs.userId === user.id || isOwnerOrAdmin);
                    return (
                      <div key={obs.id} className="bg-slate-800 border border-slate-700/60 p-3 rounded-lg text-xs space-y-1 relative group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-slate-200 flex-1">{obs.content}</p>
                          {canDeleteObs && (
                            <button
                              type="button"
                              onClick={() => handleDeleteObservation(obs.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Eliminar observación"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-700/40">
                          <span className="font-semibold text-teal-400">{obs.user?.name || "Usuario"}</span>
                          <span>{new Date(obs.createdAt).toLocaleDateString()} {new Date(obs.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No hay observaciones registradas todavía.</p>
                )}
              </div>
            </div>

            {/* Right: Conclusions */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator size={16} className="text-teal-400" />
                Conclusiones Finales
              </h4>
              <p className="text-xs text-slate-400">
                Escribe las conclusiones analíticas derivadas del cruce de variables y las métricas obtenidas.
              </p>

              <div className="space-y-3">
                {isAuthorized ? (
                  <>
                    <textarea
                      value={conclusionsText}
                      onChange={(e) => setConclusionsText(e.target.value)}
                      placeholder="Escribe las conclusiones sobre los datos analizados..."
                      rows={4}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-teal-500 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveConclusions}
                        disabled={savingConclusions}
                        className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save size={14} />
                        {savingConclusions ? "Guardando..." : "Guardar Conclusiones"}
                      </button>
                      {template.conclusions && (
                        <button
                          type="button"
                          onClick={handleDeleteConclusions}
                          disabled={savingConclusions}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
                          title="Borrar conclusiones"
                        >
                          <Trash2 size={14} />
                          <span>Borrar</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded-lg">
                    Se requiere autorización del creador para editar las conclusiones.
                  </div>
                )}

                {template.conclusions && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Conclusión Actual Guardada:</span>
                    <div className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-lg text-xs text-slate-200 whitespace-pre-wrap">
                      {template.conclusions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
