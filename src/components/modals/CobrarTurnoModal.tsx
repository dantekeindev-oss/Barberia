"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Scissors, Package, CreditCard, Smartphone, DollarSign, ArrowUpRight,
  CheckCircle2, X, Loader2, Receipt, RefreshCw, Banknote, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getTurnos, getProductos, validarCupon, createVenta, updateTurnoEstado, getCajaActual } from "@/lib/api";
import type { Turno, Producto } from "@/lib/api";

const NEGOCIO_CVU = process.env.NEXT_PUBLIC_NEGOCIO_CVU ?? "";

type Screen = "form" | "mp_qr" | "success";
type MedioPago = "efectivo" | "tarjeta_debito" | "tarjeta_credito" | "transferencia" | "mercadopago";

interface ExtraProducto {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CuponValidado {
  codigo: string;
  descuento: number;
  cuponId: string;
}

const MEDIO_LABEL: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  tarjeta_debito: "Débito",
  tarjeta_credito: "Crédito",
  transferencia: "Transferencia",
  mercadopago: "MercadoPago",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export function CobrarTurnoModal({ open, onOpenChange, onSuccess }: Props) {
  const { token } = useAuth();

  // Data
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cajaId, setCajaId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Form
  const [turnoId, setTurnoId] = useState<string>("");
  const [extras, setExtras] = useState<ExtraProducto[]>([]);
  const [cuponCodigo, setCuponCodigo] = useState("");
  const [cupon, setCupon] = useState<CuponValidado | null>(null);
  const [cuponLoading, setCuponLoading] = useState(false);
  const [cuponError, setCuponError] = useState<string | null>(null);
  const [medioPago, setMedioPago] = useState<MedioPago>("efectivo");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [refTransf, setRefTransf] = useState("");

  // Flow
  const [screen, setScreen] = useState<Screen>("form");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MP QR
  const [mpId, setMpId] = useState("");
  const [mpQrData, setMpQrData] = useState("");
  const [mpStatus, setMpStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Computed
  const turnoSel = turnos.find((t) => t.id === turnoId) ?? null;
  const serviciosItems = turnoSel?.servicios?.map((s) => ({
    referenciaId: s.servicio.id,
    descripcion: s.servicio.nombre,
    precio: s.precioAplicado,
    duracion: s.duracionAplicada,
  })) ?? [];
  const subtotalServ = serviciosItems.reduce((a, s) => a + s.precio, 0);
  const subtotalProd = extras.reduce((a, p) => a + p.precio * p.cantidad, 0);
  const subtotal = subtotalServ + subtotalProd;
  const descuento = cupon?.descuento ?? 0;
  const total = Math.max(0, subtotal - descuento);
  const vuelto = medioPago === "efectivo" && montoRecibido
    ? Math.max(0, Number(montoRecibido) - total)
    : 0;

  // Load data when modal opens
  useEffect(() => {
    if (!open || !token) return;
    setLoadingData(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    Promise.all([
      getTurnos(token, {
        fechaInicio: today.toISOString(),
        fechaFin: tomorrow.toISOString(),
      }).catch(() => [] as Turno[]),
      getProductos(token, { tipo: "venta" }).catch(() => [] as Producto[]),
      getCajaActual(token).catch(() => null),
    ]).then(([turnosData, prodData, cajaData]) => {
      setTurnos(
        turnosData.filter((t) =>
          ["pendiente", "confirmado", "en_curso"].includes(t.estado)
        )
      );
      setProductos(prodData.filter((p) => (p.stockActual ?? 0) > 0 && p.precioVenta));
      setCajaId(cajaData?.id ?? null);
    }).finally(() => setLoadingData(false));
  }, [open, token]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      stopPolling();
      setScreen("form");
      setTurnoId("");
      setExtras([]);
      setCuponCodigo("");
      setCupon(null);
      setCuponError(null);
      setMedioPago("efectivo");
      setMontoRecibido("");
      setRefTransf("");
      setError(null);
      setMpId("");
      setMpQrData("");
      setMpStatus("pending");
    }
  }, [open]);

  // Cleanup polling on unmount
  useEffect(() => () => stopPolling(), []);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  // ── Products ─────────────────────────────────────────────────────────────────

  function addExtra(p: Producto) {
    setExtras((prev) => {
      const existing = prev.find((e) => e.id === p.id);
      if (existing) return prev.map((e) => e.id === p.id ? { ...e, cantidad: e.cantidad + 1 } : e);
      return [...prev, { id: p.id, nombre: p.nombre, precio: p.precioVenta!, cantidad: 1 }];
    });
  }

  function removeExtra(id: string) {
    setExtras((prev) => prev.filter((e) => e.id !== id));
  }

  // ── Cupón ─────────────────────────────────────────────────────────────────────

  async function aplicarCupon() {
    if (!token || !cuponCodigo.trim()) return;
    setCuponLoading(true);
    setCuponError(null);
    try {
      const data = await validarCupon(cuponCodigo.trim(), subtotal, token);
      setCupon({ codigo: data.codigo, descuento: data.descuento, cuponId: data.cuponId });
    } catch (err: unknown) {
      setCuponError(err instanceof Error ? err.message : "Cupón inválido");
    } finally {
      setCuponLoading(false);
    }
  }

  // ── Save venta ────────────────────────────────────────────────────────────────

  const guardarVenta = useCallback(async (medioOverride?: string, mpRef?: string) => {
    if (!token || !cajaId) return;
    const medio = (medioOverride ?? medioPago) as string;
    const medioApiMap: Record<string, string> = {
      efectivo: "efectivo",
      tarjeta_debito: "tarjeta_debito",
      tarjeta_credito: "tarjeta_credito",
      transferencia: "transferencia",
      mercadopago: "qr",
    };

    const items = [
      ...serviciosItems.map((s) => ({
        tipo: "servicio" as const,
        referenciaId: s.referenciaId,
        descripcion: s.descripcion,
        cantidad: 1,
        precioUnitario: s.precio,
      })),
      ...extras.map((e) => ({
        tipo: "producto" as const,
        referenciaId: e.id,
        descripcion: e.nombre,
        cantidad: e.cantidad,
        precioUnitario: e.precio,
      })),
    ];

    if (items.length === 0) {
      setError("Agregá al menos un servicio o producto para cobrar");
      return;
    }

    const tipo = serviciosItems.length > 0 && extras.length > 0
      ? "mixta"
      : serviciosItems.length > 0 ? "servicio" : "producto";

    await createVenta(
      {
        cajaId,
        tipo,
        clienteId: turnoSel?.cliente?.id,
        turnoId: turnoSel?.id,
        subtotal,
        descuento,
        total,
        cuponIds: cupon ? [cupon.cuponId] : undefined,
        items,
        pagos: [{ medioPago: medioApiMap[medio] as never, monto: total, referenciaExterna: mpRef ?? (refTransf || undefined) }],
      },
      token
    );

    if (turnoSel) {
      await updateTurnoEstado(turnoSel.id, "finalizado", token).catch(() => {});
    }
  }, [token, cajaId, medioPago, serviciosItems, extras, subtotal, descuento, total, cupon, refTransf, turnoSel]);

  // ── Cobrar ────────────────────────────────────────────────────────────────────

  async function handleCobrar() {
    if (!token || !cajaId) { setError("No hay caja abierta"); return; }
    if (serviciosItems.length === 0 && extras.length === 0) {
      setError("Seleccioná un turno o agregá productos");
      return;
    }

    setError(null);

    if (medioPago === "mercadopago") {
      await initMP();
      return;
    }

    setSaving(true);
    try {
      await guardarVenta();
      setScreen("success");
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el cobro");
    } finally {
      setSaving(false);
    }
  }

  async function initMP() {
    setSaving(true);
    try {
      const descripcion = turnoSel
        ? `${serviciosItems.map((s) => s.descripcion).join(" + ")} — ${turnoSel.cliente?.nombre ?? "Cliente"}`
        : extras.map((e) => e.nombre).join(", ") || "Venta";

      const res = await fetch("/api/mp/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          description: descripcion,
          externalReference: `venta-${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error("Error al generar el QR");
      const data = await res.json();
      setMpId(data.id);
      setMpQrData(data.qr_data);
      setMpStatus("pending");
      setScreen("mp_qr");
      startPolling(data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo generar el QR de pago");
    } finally {
      setSaving(false);
    }
  }

  function startPolling(id: string) {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mp/status/${id}`);
        const data = await res.json();
        setMpStatus(data.status);
        if (data.status === "approved") {
          stopPolling();
          try {
            await guardarVenta("mercadopago", data.payment_id?.toString());
            setScreen("success");
            onSuccess?.();
          } catch (saveErr: unknown) {
            setError(saveErr instanceof Error ? saveErr.message : "Error al registrar el cobro. Contactar al administrador.");
            setScreen("form");
          }
        } else if (data.status === "rejected") {
          stopPolling();
          setError("El pago fue rechazado. Intentá con otro método.");
          setScreen("form");
        }
      } catch {
        // Transient network error; will retry on next polling tick
      }
    }, 3000);

    // Timeout after 10 minutes
    setTimeout(() => stopPolling(), 600000);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border/50 max-h-[92vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            {screen === "mp_qr" ? (
              <><Smartphone className="w-4 h-4 text-violet-400" />Pago con MercadoPago</>
            ) : screen === "success" ? (
              <><CheckCircle2 className="w-4 h-4 text-emerald-400" />Cobro registrado</>
            ) : (
              <><Receipt className="w-4 h-4 text-primary" />Cobrar turno</>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* ── MP QR Screen ───────────────────────────────────────────────────── */}
        {screen === "mp_qr" && (
          <div className="flex flex-col items-center gap-5 px-6 py-6 text-center">
            <div className="text-xs text-muted-foreground">Mostrá este código al cliente para que escanee con su app</div>

            <div className="relative">
              {/* QR Image */}
              <div className="w-56 h-56 rounded-2xl border-2 border-violet-500/40 overflow-hidden bg-white flex items-center justify-center">
                {mpQrData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(mpQrData)}&color=009ee3&bgcolor=ffffff&margin=10`}
                    alt="QR MercadoPago"
                    width={220}
                    height={220}
                  />
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                )}
              </div>
              {/* MP badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#009ee3] text-white text-[11px] font-bold shadow">
                MercadoPago
              </div>
            </div>

            <div className="mt-2">
              <p className="text-3xl font-bold text-foreground">${total.toLocaleString("es-AR")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {turnoSel?.cliente?.nombre ?? "Cliente"} · {serviciosItems.map((s) => s.descripcion).join(" + ")}
              </p>
            </div>

            {mpStatus === "pending" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Esperando confirmación de pago...
              </div>
            )}

            {mpStatus === "approved" && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                ¡Pago aprobado!
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full border-border/50 text-xs"
              onClick={() => {
                stopPolling();
                setScreen("form");
              }}
            >
              Cancelar y elegir otro método
            </Button>
          </div>
        )}

        {/* ── Success Screen ─────────────────────────────────────────────────── */}
        {screen === "success" && (
          <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">¡Cobro registrado!</p>
              <p className="text-xs text-muted-foreground mt-1">
                {turnoSel?.cliente?.nombre ?? "Venta"} · {MEDIO_LABEL[medioPago]}
              </p>
            </div>

            <div className="w-full p-4 rounded-xl border border-border/40 bg-muted/20 text-left space-y-2">
              {serviciosItems.map((s) => (
                <div key={s.referenciaId} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.descripcion}</span>
                  <span>${s.precio.toLocaleString("es-AR")}</span>
                </div>
              ))}
              {extras.map((e) => (
                <div key={e.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{e.nombre} ×{e.cantidad}</span>
                  <span>${(e.precio * e.cantidad).toLocaleString("es-AR")}</span>
                </div>
              ))}
              {descuento > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Descuento ({cupon?.codigo})</span>
                  <span>-${descuento.toLocaleString("es-AR")}</span>
                </div>
              )}
              <Separator className="opacity-30" />
              <div className="flex justify-between font-bold">
                <span className="text-sm">Total cobrado</span>
                <span className="text-sm text-emerald-400">${total.toLocaleString("es-AR")}</span>
              </div>
              {medioPago === "efectivo" && montoRecibido && Number(montoRecibido) > total && (
                <div className="flex justify-between text-xs text-amber-400">
                  <span>Vuelto</span>
                  <span>${vuelto.toLocaleString("es-AR")}</span>
                </div>
              )}
            </div>

            <Button
              className="w-full veylo-gradient text-white border-0 hover:opacity-90 text-sm font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* ── Form Screen ────────────────────────────────────────────────────── */}
        {screen === "form" && (
          <>
            <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">
              {/* Turno selector */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Turno a cobrar</p>
                {loadingData ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : turnos.length === 0 ? (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-xs text-muted-foreground text-center">
                    No hay turnos pendientes de cobro hoy
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {/* Sin turno option */}
                    <button
                      onClick={() => setTurnoId("")}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        turnoId === ""
                          ? "border-primary bg-primary/5"
                          : "border-border/40 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-muted-foreground italic">Venta libre (sin turno)</span>
                    </button>
                    {turnos.map((t) => {
                      const hora = new Date(t.fechaInicio).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
                      const servNombre = t.servicios?.[0]?.servicio.nombre ?? "—";
                      const precio = t.servicios?.reduce((a, s) => a + s.precioAplicado, 0) ?? 0;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTurnoId(t.id)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                            turnoId === t.id
                              ? "border-primary bg-primary/5"
                              : "border-border/40 hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-foreground">
                                {t.cliente?.nombre} {t.cliente?.apellido ?? ""}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {hora} · {t.empleado?.nombre} · {servNombre}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-xs font-bold text-foreground">${precio.toLocaleString("es-AR")}</span>
                              <Badge className={
                                t.estado === "en_curso"
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30 text-[9px]"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px]"
                              }>
                                {t.estado === "en_curso" ? "En curso" : t.estado === "confirmado" ? "Confirmado" : "Pendiente"}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Servicios del turno */}
              {serviciosItems.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Servicios</p>
                  <div className="space-y-1">
                    {serviciosItems.map((s) => (
                      <div key={s.referenciaId} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-foreground">{s.descripcion}</span>
                          <span className="text-[10px] text-muted-foreground">{s.duracion} min</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">${s.precio.toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Productos extra */}
              {productos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Agregar productos</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {productos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addExtra(p)}
                        className="p-2 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                      >
                        <Package className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-[10px] font-medium text-foreground truncate">{p.nombre}</p>
                        <p className="text-[10px] text-emerald-400">${(p.precioVenta ?? 0).toLocaleString("es-AR")}</p>
                        <p className="text-[9px] text-muted-foreground">Stock: {p.stockActual}</p>
                      </button>
                    ))}
                  </div>
                  {extras.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {extras.map((e) => (
                        <div key={e.id} className="flex items-center justify-between p-2 bg-primary/8 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{e.nombre}</span>
                            <span className="text-[10px] text-muted-foreground">×{e.cantidad}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">${(e.precio * e.cantidad).toLocaleString("es-AR")}</span>
                            <button onClick={() => removeExtra(e.id)} className="text-muted-foreground/60 hover:text-foreground">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Separator className="opacity-30" />

              {/* Cupón */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Cupón de descuento</p>
                {cupon ? (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400 flex-1">
                      {cupon.codigo} — −${cupon.descuento.toLocaleString("es-AR")}
                    </span>
                    <button onClick={() => { setCupon(null); setCuponCodigo(""); }}>
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: BIENVENIDO"
                      className="h-8 text-xs uppercase"
                      value={cuponCodigo}
                      onChange={(e) => { setCuponCodigo(e.target.value.toUpperCase()); setCuponError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && aplicarCupon()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-border/50 shrink-0"
                      onClick={aplicarCupon}
                      disabled={!cuponCodigo || cuponLoading}
                    >
                      {cuponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aplicar"}
                    </Button>
                  </div>
                )}
                {cuponError && <p className="text-[11px] text-destructive mt-1">{cuponError}</p>}
              </div>

              {/* Medio de pago */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Método de pago</p>
                <Tabs value={medioPago} onValueChange={(v) => v && setMedioPago(v as MedioPago)}>
                  <TabsList className="grid grid-cols-5 h-9 w-full">
                    <TabsTrigger value="efectivo" className="text-[10px] gap-0.5 px-1">
                      <Banknote className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Efect.</span>
                    </TabsTrigger>
                    <TabsTrigger value="tarjeta_debito" className="text-[10px] gap-0.5 px-1">
                      <CreditCard className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Débito</span>
                    </TabsTrigger>
                    <TabsTrigger value="tarjeta_credito" className="text-[10px] gap-0.5 px-1">
                      <CreditCard className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Crédit.</span>
                    </TabsTrigger>
                    <TabsTrigger value="transferencia" className="text-[10px] gap-0.5 px-1">
                      <ArrowUpRight className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Transf.</span>
                    </TabsTrigger>
                    <TabsTrigger value="mercadopago" className="text-[10px] gap-0.5 px-1">
                      <Smartphone className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">MP</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="mt-3">
                  {medioPago === "efectivo" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="Monto recibido"
                          className="h-9 pl-8 text-xs"
                          value={montoRecibido}
                          onChange={(e) => setMontoRecibido(e.target.value)}
                        />
                      </div>
                      {Number(montoRecibido) >= total && total > 0 && (
                        <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-amber-400">
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Vuelto a dar</span>
                          </div>
                          <span className="text-sm font-bold text-amber-400">
                            ${vuelto.toLocaleString("es-AR")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {(medioPago === "tarjeta_debito" || medioPago === "tarjeta_credito") && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
                      <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Deslizar o acercar tarjeta</p>
                        <p className="text-[11px] text-muted-foreground">
                          {medioPago === "tarjeta_debito" ? "Débito" : "Crédito"} · ${total.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  )}

                  {medioPago === "transferencia" && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Referencia de la transferencia (últimos 4 dígitos)"
                        className="h-9 text-xs"
                        value={refTransf}
                        onChange={(e) => setRefTransf(e.target.value)}
                      />
                      {NEGOCIO_CVU && (
                        <p className="text-[11px] text-muted-foreground">
                          CVU: <span className="font-mono text-foreground">{NEGOCIO_CVU}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {medioPago === "mercadopago" && (
                    <div className="flex items-center gap-3 p-3 bg-[#009ee3]/10 rounded-lg border border-[#009ee3]/30">
                      <Smartphone className="w-5 h-5 text-[#009ee3] shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Generar QR de cobro</p>
                        <p className="text-[11px] text-muted-foreground">
                          Se generará un código QR por ${total.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10 space-y-2">
                {subtotalServ > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Servicios</span><span>${subtotalServ.toLocaleString("es-AR")}</span>
                  </div>
                )}
                {subtotalProd > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Productos</span><span>${subtotalProd.toLocaleString("es-AR")}</span>
                  </div>
                )}
                {descuento > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Descuento</span><span>-${descuento.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/50 flex gap-2 shrink-0">
              <Button
                variant="outline"
                className="flex-1 h-10 border-border/50 text-xs"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-10 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
                onClick={handleCobrar}
                disabled={saving || total === 0}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : medioPago === "mercadopago" ? (
                  <><Smartphone className="w-4 h-4 mr-1.5" />Generar QR · ${total.toLocaleString("es-AR")}</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-1.5" />Cobrar ${total.toLocaleString("es-AR")}</>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
