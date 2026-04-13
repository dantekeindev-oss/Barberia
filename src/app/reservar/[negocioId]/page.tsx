"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, Scissors, User, Calendar, ChevronRight, ChevronLeft, Loader2, MapPin, Phone } from "lucide-react";
import { publicApi } from "@/lib/publicApi";
import type { NegocioPublico, ServicioPublico, EmpleadoPublico, TurnoPublico } from "@/lib/publicApi";

// ── helpers ──────────────────────────────────────────────────────────────────

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function initiales(nombre: string, apellido?: string) {
  return `${nombre[0]}${apellido ? apellido[0] : ""}`.toUpperCase();
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildDateOptions(horarios: EmpleadoPublico["horarios"]) {
  const today = new Date();
  const diasConHorario = new Set(horarios.map((h) => h.diaSemana));
  const options: { value: string; label: string; disabled: boolean }[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const jsDow = d.getDay();
    const diaSemana = jsDow === 0 ? 6 : jsDow - 1;
    const value = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
    options.push({ value, label, disabled: !diasConHorario.has(diaSemana) });
  }
  return options;
}

// ── steps ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "Servicio",
  2: "Barbero",
  3: "Fecha y hora",
  4: "Tus datos",
  5: "Confirmado",
};

// ── component ─────────────────────────────────────────────────────────────────

export default function ReservarPage() {
  const { negocioId } = useParams<{ negocioId: string }>();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [negocio, setNegocio] = useState<NegocioPublico | null>(null);
  const [servicios, setServicios] = useState<ServicioPublico[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoPublico[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // selections
  const [selectedServicios, setSelectedServicios] = useState<ServicioPublico[]>([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoPublico | null>(null);
  const [selectedFecha, setSelectedFecha] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // client form
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");

  const [turnoCreado, setTurnoCreado] = useState<TurnoPublico | null>(null);

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        const [info, svcs] = await Promise.all([
          publicApi.getInfo(negocioId),
          publicApi.getServicios(negocioId),
        ]);
        setNegocio(info);
        setServicios(svcs);
      } catch {
        setError("No se pudo cargar la información de la barbería.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [negocioId]);

  // Load employees when services are selected
  useEffect(() => {
    if (selectedServicios.length === 0) { setEmpleados([]); return; }
    publicApi
      .getEmpleados(negocioId, selectedServicios[0].id)
      .then(setEmpleados)
      .catch(() => setEmpleados([]));
  }, [negocioId, selectedServicios]);

  // Load slots when employee + date are set
  const loadSlots = useCallback(async () => {
    if (!selectedEmpleado || !selectedFecha || selectedServicios.length === 0) return;
    const duracion = selectedServicios.reduce((a, s) => a + s.duracionMin, 0);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot("");
    try {
      const data = await publicApi.getSlots(negocioId, selectedEmpleado.id, selectedFecha, duracion);
      setSlots(data);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [negocioId, selectedEmpleado, selectedFecha, selectedServicios]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  // ── actions ────────────────────────────────────────────────────────────────

  function toggleServicio(s: ServicioPublico) {
    setSelectedServicios((prev) =>
      prev.find((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s]
    );
    setSelectedEmpleado(null);
    setSelectedFecha("");
    setSelectedSlot("");
  }

  async function confirmar() {
    if (!selectedEmpleado || !selectedFecha || !selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const [h, m] = selectedSlot.split(":").map(Number);
      const fechaInicio = new Date(selectedFecha + "T00:00:00");
      fechaInicio.setHours(h, m, 0, 0);

      const turno = await publicApi.crearTurno(negocioId, {
        nombre,
        apellido: apellido || undefined,
        telefono,
        empleadoId: selectedEmpleado.id,
        servicioIds: selectedServicios.map((s) => s.id),
        fechaInicio: fechaInicio.toISOString(),
      });
      setTurnoCreado(turno);
      setStep(5);
    } catch (e: any) {
      setError(e.message || "No se pudo confirmar el turno. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalDuracion = selectedServicios.reduce((a, s) => a + s.duracionMin, 0);
  const totalPrecio = selectedServicios.reduce((a, s) => a + s.precio, 0);
  const dateOptions = selectedEmpleado ? buildDateOptions(selectedEmpleado.horarios) : [];

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !negocio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {negocio?.logoUrl ? (
            <img src={negocio.logoUrl} alt="logo" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full veylo-gradient flex items-center justify-center text-white font-bold text-sm">
              {negocio?.nombre?.[0] ?? "B"}
            </div>
          )}
          <div>
            <h1 className="font-semibold text-foreground text-sm leading-tight">{negocio?.nombre}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {negocio?.direccion && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{negocio.direccion}
                </span>
              )}
              {negocio?.telefono && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />{negocio.telefono}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step indicator */}
        {step < 5 && (
          <div className="flex items-center gap-1 mb-6">
            {([1, 2, 3, 4] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                    s < step
                      ? "veylo-gradient text-white"
                      : s === step
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {s < step ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs hidden sm:block ${s === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {STEP_LABELS[s]}
                </span>
                {s < 4 && <div className={`h-px flex-1 mx-1 ${s < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: Servicios ─────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">¿Qué servicio querés?</h2>
            <p className="text-xs text-muted-foreground mb-4">Podés elegir más de uno</p>

            <div className="space-y-2">
              {servicios.map((s) => {
                const selected = !!selectedServicios.find((x) => x.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleServicio(s)}
                    className={`w-full text-left rounded-lg border p-3.5 transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: s.colorAgenda || "#6366f1" }}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.nombre}</p>
                          {s.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5">{s.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-foreground">${s.precio.toLocaleString("es-AR")}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-end gap-0.5">
                          <Clock className="w-3 h-3" />{s.duracionMin} min
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedServicios.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>{selectedServicios.length} servicio(s) · {totalDuracion} min</span>
                <span className="font-semibold text-foreground">${totalPrecio.toLocaleString("es-AR")}</span>
              </div>
            )}

            <button
              disabled={selectedServicios.length === 0}
              onClick={() => setStep(2)}
              className="mt-4 w-full veylo-gradient text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Empleado ──────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">¿Con qué barbero?</h2>
            <p className="text-xs text-muted-foreground mb-4">Elegí quién te va a atender</p>

            {empleados.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {empleados.map((emp) => {
                  const selected = selectedEmpleado?.id === emp.id;
                  return (
                    <button
                      key={emp.id}
                      onClick={() => { setSelectedEmpleado(emp); setSelectedFecha(""); setSelectedSlot(""); }}
                      className={`w-full text-left rounded-lg border p-3.5 flex items-center gap-3 transition-all ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full veylo-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {initiales(emp.nombre, emp.apellido)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp.nombre} {emp.apellido ?? ""}
                        </p>
                        {emp.especialidades && (
                          <p className="text-xs text-muted-foreground">{emp.especialidades}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {emp.horarios.map((h) => (
                            <span key={h.diaSemana} className="text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                              {DIAS[h.diaSemana]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border text-sm font-medium py-2.5 rounded-lg text-muted-foreground hover:bg-muted/40 flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                disabled={!selectedEmpleado}
                onClick={() => setStep(3)}
                className="flex-1 veylo-gradient text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Fecha y hora ──────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">¿Cuándo?</h2>
            <p className="text-xs text-muted-foreground mb-4">Elegí el día y el horario</p>

            {/* Date selector */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Fecha</p>
              <div className="grid grid-cols-4 gap-1.5">
                {dateOptions.slice(0, 28).map((opt) => (
                  <button
                    key={opt.value}
                    disabled={opt.disabled}
                    onClick={() => setSelectedFecha(opt.value)}
                    className={`text-xs py-2 px-1 rounded-lg border text-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                      selectedFecha === opt.value
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            {selectedFecha && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Horario disponible</p>
                {loadingSlots ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No hay horarios disponibles para este día
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`text-xs py-2 rounded-lg border text-center transition-all ${
                          selectedSlot === slot
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-border text-sm font-medium py-2.5 rounded-lg text-muted-foreground hover:bg-muted/40 flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                disabled={!selectedFecha || !selectedSlot}
                onClick={() => setStep(4)}
                className="flex-1 veylo-gradient text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Datos del cliente ─────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">Tus datos</h2>
            <p className="text-xs text-muted-foreground mb-4">Para confirmar el turno necesitamos tu info</p>

            {/* Summary */}
            <div className="mb-5 p-3 rounded-lg border border-border bg-card space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedServicios.map((s) => s.nombre).join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedEmpleado?.nombre} {selectedEmpleado?.apellido ?? ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {selectedFecha
                    ? new Date(selectedFecha + "T00:00:00").toLocaleDateString("es-AR", {
                        weekday: "long", day: "numeric", month: "long",
                      })
                    : ""}
                  {" · "}
                  {selectedSlot}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{totalDuracion} min · ${totalPrecio.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Apellido</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Opcional"
                    className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 1165432100"
                  className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Con tu teléfono te identificamos para futuras reservas
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-border text-sm font-medium py-2.5 rounded-lg text-muted-foreground hover:bg-muted/40 flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
              <button
                disabled={!nombre.trim() || !telefono.trim() || submitting}
                onClick={confirmar}
                className="flex-1 veylo-gradient text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando...</>
                ) : (
                  <>Confirmar turno <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Confirmación ──────────────────────────────── */}
        {step === 5 && turnoCreado && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full veylo-gradient flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">¡Turno confirmado!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Te esperamos, {turnoCreado.cliente.nombre}
            </p>

            <div className="text-left rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Scissors className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Servicio(s)</p>
                  <p className="text-sm font-medium text-foreground">
                    {turnoCreado.servicios.map((s) => s.servicio.nombre).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Barbero</p>
                  <p className="text-sm font-medium text-foreground">
                    {turnoCreado.empleado.nombre} {turnoCreado.empleado.apellido ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha y hora</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {formatFecha(turnoCreado.fechaInicio)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatHora(turnoCreado.fechaInicio)} — {formatHora(turnoCreado.fechaFin)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Total estimado</p>
                  <p className="text-sm font-medium text-foreground">
                    ${turnoCreado.servicios.reduce((a, s) => a + s.precioAplicado, 0).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              ¿Necesitás cancelar?{" "}
              {negocio?.telefono && (
                <a
                  href={`https://wa.me/${negocio.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </p>

            <button
              onClick={() => {
                setStep(1);
                setSelectedServicios([]);
                setSelectedEmpleado(null);
                setSelectedFecha("");
                setSelectedSlot("");
                setNombre("");
                setApellido("");
                setTelefono("");
                setTurnoCreado(null);
              }}
              className="mt-5 w-full border border-border text-sm font-medium py-2.5 rounded-lg text-muted-foreground hover:bg-muted/40"
            >
              Hacer otra reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
