"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, CreditCard, Smartphone, ArrowUpRight, ArrowDownLeft, Plus,
  Lock, Unlock, Receipt, Wallet, TrendingUp, Loader2, RefreshCw, Package,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CobrarTurnoModal } from "@/components/modals/CobrarTurnoModal";
import { NuevoMovimientoModal } from "@/components/modals/NuevoMovimientoModal";
import { CerrarCajaModal } from "@/components/modals/CerrarCajaModal";
import { AbrirCajaModal } from "@/components/modals/AbrirCajaModal";
import { useAuth } from "@/contexts/AuthContext";
import { getCajaActual } from "@/lib/api";
import type { Venta, MovimientoCaja } from "@/lib/api";

type CajaData = Awaited<ReturnType<typeof getCajaActual>>;

const medioIcono: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  efectivo: { icon: DollarSign, label: "Efectivo", color: "text-emerald-400" },
  tarjeta_debito: { icon: CreditCard, label: "Débito", color: "text-blue-400" },
  tarjeta_credito: { icon: CreditCard, label: "Crédito", color: "text-indigo-400" },
  tarjeta: { icon: CreditCard, label: "Tarjeta", color: "text-blue-400" },
  qr: { icon: Smartphone, label: "QR/MP", color: "text-violet-400" },
  transferencia: { icon: ArrowUpRight, label: "Transferencia", color: "text-amber-400" },
};

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function CajaPage() {
  const { token } = useAuth();
  const [caja, setCaja] = useState<CajaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("movimientos");

  const [cobrarOpen, setCobrarOpen] = useState(false);
  const [movimientoOpen, setMovimientoOpen] = useState(false);
  const [movimientoTipo, setMovimientoTipo] = useState<"ingreso" | "egreso">("ingreso");
  const [cerrarOpen, setCerrarOpen] = useState(false);
  const [abrirOpen, setAbrirOpen] = useState(false);

  const fetchCaja = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getCajaActual(token);
      setCaja(data);
    } catch {
      setCaja(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCaja(); }, [fetchCaja]);

  const resumen = (caja?.resumen as { totalVentas: number; totalIngresos: number; totalEgresos: number; saldoActual: number }) ?? null;
  const ventas: Venta[] = (caja?.ventas ?? []) as Venta[];
  const movimientos: MovimientoCaja[] = (caja?.movimientos ?? []) as MovimientoCaja[];
  const cajaAbierta = caja?.estado === "abierta";

  const ingresosMov = movimientos.filter((m) => m.tipo === "ingreso").reduce((a, m) => a + m.monto, 0);
  const egresosMov = movimientos.filter((m) => m.tipo === "egreso").reduce((a, m) => a + m.monto, 0);
  const totalVentas = resumen?.totalVentas ?? ventas.reduce((a, v) => a + v.total, 0);
  const saldo = resumen?.saldoActual ?? (caja?.montoInicial ?? 0) + totalVentas + ingresosMov - egresosMov;

  // Desglose por medio de pago (from ventas)
  const porMedio = Object.entries(
    ventas.reduce((acc, v) => {
      v.pagos?.forEach((p) => {
        const m = p.medioPago ?? "efectivo";
        acc[m] = (acc[m] ?? 0) + p.monto;
      });
      return acc;
    }, {} as Record<string, number>)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className={`px-3 py-1.5 text-xs font-semibold ${cajaAbierta ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${cajaAbierta ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {cajaAbierta ? "Caja abierta" : "Caja cerrada"}
          </Badge>
          {cajaAbierta && caja?.abiertaAt && (
            <span className="text-xs text-muted-foreground">
              Apertura: ${(caja.montoInicial).toLocaleString("es-AR")} · {fmtHora(caja.abiertaAt)} hs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={fetchCaja} title="Actualizar">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/50"
            onClick={() => { setMovimientoTipo("ingreso"); setMovimientoOpen(true); }}
            disabled={!cajaAbierta}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Movimiento
          </Button>
          {cajaAbierta ? (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
              onClick={() => setCerrarOpen(true)}
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Cerrar caja
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
              onClick={() => setAbrirOpen(true)}
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              Abrir caja
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Saldo actual", value: `$${saldo.toLocaleString("es-AR")}`, icon: Wallet, color: "text-foreground", bg: "bg-muted/50" },
          { label: "Ventas del día", value: `$${totalVentas.toLocaleString("es-AR")}`, icon: ArrowUpRight, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Egresos", value: `$${egresosMov.toLocaleString("es-AR")}`, icon: ArrowDownLeft, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Resultado neto", value: `$${(totalVentas + ingresosMov - egresosMov).toLocaleString("es-AR")}`, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map((k) => (
          <Card key={k.label} className="border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main panel */}
        <Card className="xl:col-span-2 border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Actividad del día</CardTitle>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="h-7">
                  <TabsTrigger value="ventas" className="text-[11px] px-2.5">Ventas ({ventas.length})</TabsTrigger>
                  <TabsTrigger value="movimientos" className="text-[11px] px-2.5">Movimientos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {tab === "ventas" && (
              ventas.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Sin ventas registradas hoy</p>
              ) : (
                ventas.map((v, i) => {
                  const medioKey = v.pagos?.[0]?.medioPago ?? "efectivo";
                  const medio = medioIcono[medioKey] ?? medioIcono.efectivo;
                  const hora = fmtHora(v.createdAt);
                  const desc = v.items?.[0]?.descripcion ?? "Venta";
                  const MIcon = medio.icon;
                  return (
                    <div key={v.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${v.tipo === "servicio" ? "bg-primary/10" : v.tipo === "producto" ? "bg-amber-500/10" : "bg-violet-500/10"}`}>
                          {v.tipo === "servicio" ? <Scissors className="w-3.5 h-3.5 text-primary" /> : <Package className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {v.items?.map((i) => i.descripcion).join(" + ") || desc}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{hora}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <MIcon className={`w-3 h-3 ${medio.color}`} />
                            <span className={`text-[10px] ${medio.color}`}>{medio.label}</span>
                            {v.descuento > 0 && (
                              <Badge className="text-[9px] px-1 py-0 bg-emerald-500/10 text-emerald-400 border-0">
                                -{v.descuento.toLocaleString("es-AR")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-400 shrink-0">+${v.total.toLocaleString("es-AR")}</span>
                      </div>
                      {i < ventas.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  );
                })
              )
            )}

            {tab === "movimientos" && (
              movimientos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {cajaAbierta ? "Sin movimientos manuales hoy" : "Abrí la caja para registrar movimientos"}
                </p>
              ) : (
                movimientos.map((mov, i) => {
                  const medioKey = mov.medioPago ?? "efectivo";
                  const medio = medioIcono[medioKey] ?? medioIcono.efectivo;
                  const MIcon = medio.icon;
                  return (
                    <div key={mov.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${mov.tipo === "ingreso" ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                          {mov.tipo === "ingreso" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{mov.concepto}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{fmtHora(mov.createdAt)}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <MIcon className={`w-3 h-3 ${medio.color}`} />
                            <span className={`text-[10px] ${medio.color}`}>{medio.label}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${mov.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"}`}>
                          {mov.tipo === "ingreso" ? "+" : "-"}${mov.monto.toLocaleString("es-AR")}
                        </span>
                      </div>
                      {i < movimientos.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  );
                })
              )
            )}
          </CardContent>
        </Card>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Por medio de pago */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold">Por medio de pago</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {porMedio.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">Sin ventas registradas</p>
              ) : (
                porMedio.map(([medio, montoRaw], i) => {
                  const m = medioIcono[medio] ?? medioIcono.efectivo;
                  const monto = montoRaw as number;
                  const pct = totalVentas > 0 ? Math.round((monto / totalVentas) * 100) : 0;
                  const MIcon = m.icon;
                  return (
                    <div key={medio}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <MIcon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className="text-xs font-medium text-foreground flex-1">{m.label}</span>
                        <span className="text-xs font-bold text-foreground">${monto.toLocaleString("es-AR")}</span>
                        <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full veylo-gradient transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      {i < porMedio.length - 1 && <Separator className="mt-3 opacity-30" />}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                onClick={() => setCobrarOpen(true)}
                disabled={!cajaAbierta}
              >
                <Receipt className="w-3.5 h-3.5 text-primary" />
                Cobrar turno / Venta
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                onClick={() => { setMovimientoTipo("egreso"); setMovimientoOpen(true); }}
                disabled={!cajaAbierta}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                Registrar gasto
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                onClick={() => { setMovimientoTipo("ingreso"); setMovimientoOpen(true); }}
                disabled={!cajaAbierta}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Ingreso manual
              </Button>
              <Separator className="opacity-30" />
              {!cajaAbierta && (
                <Button
                  size="sm"
                  className="w-full text-xs h-9 veylo-gradient text-white border-0 hover:opacity-90 font-semibold justify-start gap-2"
                  onClick={() => setAbrirOpen(true)}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Abrir caja del día
                </Button>
              )}
              {cajaAbierta && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                  onClick={() => setCerrarOpen(true)}
                >
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  Cerrar y arquear caja
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CobrarTurnoModal
        open={cobrarOpen}
        onOpenChange={setCobrarOpen}
        onSuccess={fetchCaja}
      />
      <NuevoMovimientoModal
        open={movimientoOpen}
        onOpenChange={setMovimientoOpen}
        onSuccess={fetchCaja}
      />
      <AbrirCajaModal
        open={abrirOpen}
        onClose={() => setAbrirOpen(false)}
        onSuccess={() => { setAbrirOpen(false); fetchCaja(); }}
      />
      {caja && cajaAbierta && (
        <CerrarCajaModal
          open={cerrarOpen}
          onClose={() => setCerrarOpen(false)}
          onSuccess={() => { setCerrarOpen(false); fetchCaja(); }}
          cajaId={caja.id}
          saldoCalculado={saldo}
        />
      )}
    </div>
  );
}
