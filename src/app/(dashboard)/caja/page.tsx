"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Lock,
  Unlock,
  Receipt,
  Wallet,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CobrarTurnoModal } from "@/components/modals/CobrarTurnoModal";
import { NuevoMovimientoModal } from "@/components/modals/NuevoMovimientoModal";
import { useAuth } from "@/contexts/AuthContext";
import { getVentas, getCajas, getMovimientosCaja } from "@/lib/api";

const medioIcono: Record<string, { icon: any; label: string; color: string }> = {
  efectivo: { icon: DollarSign, label: "Efectivo", color: "text-emerald-400" },
  tarjeta: { icon: CreditCard, label: "Tarjeta", color: "text-blue-400" },
  qr: { icon: Smartphone, label: "QR", color: "text-violet-400" },
  transferencia: { icon: ArrowUpRight, label: "Transferencia", color: "text-amber-400" },
};

export default function CajaPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState("movimientos");
  const [modalCobrarOpen, setModalCobrarOpen] = useState(false);
  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  const [_modalMovimientoTipo, setModalMovimientoTipo] = useState<"ingreso" | "egreso">("ingreso");

  const [_ventas, setVentas] = useState<any[]>([]);
  const [cajas, setCajas] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [ventasData, cajasData] = await Promise.all([
          getVentas(token).catch(() => []),
          getCajas(token).catch(() => []),
        ]);

        // Filter for today's sales and open caja
        const today = new Date().toISOString().split('T')[0];
        const ventasHoy = ventasData.filter((v) =>
          v.createdAt?.startsWith(today)
        );
        const cajaAbierta = cajasData.find((c) => c.estado === "abierta");

        setVentas(ventasHoy);
        setCajas(cajasData);

        // Fetch movements for open caja
        if (cajaAbierta) {
          try {
            const movsData = await getMovimientosCaja(token);
            setMovimientos(movsData.filter((m) => m.cajaId === cajaAbierta.id));
          } catch (e) {
            console.error("Error loading movimientos:", e);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de caja");
        console.error("Error loading caja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id]);

  const cajaAbierta = cajas.find((c) => c.estado === "abierta");

  // Calculate metrics
  const ingresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((a, b) => a + (b.monto || 0), 0);
  const egresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((a, b) => a + (b.monto || 0), 0);
  const montoInicial = cajaAbierta?.montoInicial || 0;
  const saldo = ingresos - egresos + montoInicial;

  const porMedio = Object.entries(
    movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => {
        const medio = m.medioPago || "efectivo";
        acc[medio] = (acc[medio] || 0) + (m.monto || 0);
        return acc;
      }, {} as Record<string, number>)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            className={`px-3 py-1.5 text-xs font-semibold ${
              cajaAbierta
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${
                cajaAbierta ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {cajaAbierta ? "Caja abierta" : "Caja cerrada"}
          </Badge>
          {cajaAbierta && (
            <span className="text-xs text-muted-foreground">
              Apertura: ${montoInicial.toLocaleString("es-AR")} ·{" "}
              {cajaAbierta.fechaApertura
                ? new Date(cajaAbierta.fechaApertura).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}{" "}
              hs
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-border/50"
            onClick={() => {
              setModalMovimientoTipo("ingreso");
              setModalMovimientoOpen(true);
            }}
            disabled={!cajaAbierta}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Movimiento
          </Button>
          {cajaAbierta ? (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Cerrar caja
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            >
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              Abrir caja
            </Button>
          )}
        </div>
      </div>

      {/* KPIs caja */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                ${saldo.toLocaleString("es-AR")}
              </p>
              <p className="text-[11px] text-muted-foreground">Saldo actual</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">
                ${ingresos.toLocaleString("es-AR")}
              </p>
              <p className="text-[11px] text-muted-foreground">Ingresos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-400">
                ${egresos.toLocaleString("es-AR")}
              </p>
              <p className="text-[11px] text-muted-foreground">Egresos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-violet-400">
                ${(ingresos - egresos).toLocaleString("es-AR")}
              </p>
              <p className="text-[11px] text-muted-foreground">Resultado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Movimientos */}
        <Card className="xl:col-span-2 border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Movimientos del día</CardTitle>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="h-7">
                  <TabsTrigger value="movimientos" className="text-[11px] px-2.5">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="ingresos" className="text-[11px] px-2.5">
                    Ingresos
                  </TabsTrigger>
                  <TabsTrigger value="egresos" className="text-[11px] px-2.5">
                    Egresos
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {movimientos
              .filter((m) => {
                if (tab === "ingresos") return m.tipo === "ingreso";
                if (tab === "egresos") return m.tipo === "egreso";
                return true;
              })
              .length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {cajaAbierta
                  ? "No hay movimientos registrados hoy"
                  : "Abre la caja para registrar movimientos"}
              </p>
            ) : (
              movimientos
                .filter((m) => {
                  if (tab === "ingresos") return m.tipo === "ingreso";
                  if (tab === "egresos") return m.tipo === "egreso";
                  return true;
                })
                .map((mov, i, arr) => {
                  const medioKey = mov.medioPago || "efectivo";
                  const medio = medioIcono[medioKey] || medioIcono.efectivo;
                  const hora = mov.createdAt
                    ? new Date(mov.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--";

                  return (
                    <div key={mov.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        {/* Tipo */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            mov.tipo === "ingreso"
                              ? "bg-emerald-500/15"
                              : "bg-red-500/15"
                          }`}
                        >
                          {mov.tipo === "ingreso" ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {mov.descripcion || mov.concepto || "Sin descripción"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{hora}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <medio.icon className={`w-3 h-3 ${medio.color}`} />
                            <span className={`text-[10px] ${medio.color}`}>{medio.label}</span>
                          </div>
                        </div>

                        {/* Monto */}
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            mov.tipo === "ingreso" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {mov.tipo === "ingreso" ? "+" : "-"}$
                          {(mov.monto || 0).toLocaleString("es-AR")}
                        </span>
                      </div>
                      {i < arr.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Desglose por medio de pago */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold">Por medio de pago</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {porMedio.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Sin ingresos registrados
                </p>
              ) : (
                porMedio.map(([medio, monto], i) => {
                  const m = medioIcono[medio] || medioIcono.efectivo;
                  const montoNum = monto as number;
                  const pct = Math.round((montoNum / ingresos) * 100);
                  return (
                    <div key={medio}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                        <span className="text-xs font-medium text-foreground flex-1">
                          {m.label}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          ${montoNum.toLocaleString("es-AR")}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full veylo-gradient transition-all"
                          style={{ width: `${pct}%` }}
                        />
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
                onClick={() => setModalCobrarOpen(true)}
                disabled={!cajaAbierta}
              >
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                Cobrar turno
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                onClick={() => {
                  setModalMovimientoTipo("egreso");
                  setModalMovimientoOpen(true);
                }}
                disabled={!cajaAbierta}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                Registrar gasto
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                onClick={() => {
                  setModalMovimientoTipo("ingreso");
                  setModalMovimientoOpen(true);
                }}
                disabled={!cajaAbierta}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Ingreso manual
              </Button>
              <Separator className="opacity-30" />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-border/50 justify-start gap-2"
                disabled={!cajaAbierta}
              >
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                Exportar resumen del día
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CobrarTurnoModal
        open={modalCobrarOpen}
        onOpenChange={setModalCobrarOpen}
      />
      <NuevoMovimientoModal
        open={modalMovimientoOpen}
        onOpenChange={setModalMovimientoOpen}
      />
    </div>
  );
}
