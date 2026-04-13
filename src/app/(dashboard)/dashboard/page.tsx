"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboard } from "@/lib/api/negocio";
import type { DashboardData } from "@/lib/api/negocio";

const estadoConfig: Record<string, { label: string; className: string }> = {
  confirmado: { label: "Confirmado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  en_curso: { label: "En curso", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  completado: { label: "Completado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  cancelado: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  ausente: { label: "Ausente", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  trend,
  up,
}: {
  title: string;
  value: string;
  sub: string;
  icon: any;
  color: string;
  bg: string;
  trend?: string;
  up?: boolean;
}) {
  return (
    <Card className="border-border/50 bg-card hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {trend && (
            <span
              className={`text-xs font-medium flex items-center gap-0.5 ${
                up ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <ArrowUpRight className={`w-3.5 h-3.5 ${up ? "" : "rotate-90"}`} />
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{title}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboard(user.negocio.id, token);
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos");
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id]);

  const now = new Date();
  const fecha = now.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground capitalize">{fecha}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Cargando...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50 bg-card">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl bg-muted/50 mb-3 animate-pulse" />
                <div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted/50 rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground capitalize">{fecha}</h1>
            <p className="text-sm text-destructive mt-0.5">{error || "Error al cargar los datos"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { resumen, proximosTurnos, alertas } = dashboardData;

  const kpis = [
    {
      title: "Turnos hoy",
      value: resumen.turnosHoy.toString(),
      sub: `${proximosTurnos.length} próximos turnos`,
      icon: CalendarDays,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Facturado hoy",
      value: `$${resumen.facturadoHoy.toLocaleString()}`,
      sub: `Servicios activos: ${resumen.totalServicios}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Clientes totales",
      value: resumen.totalClientes.toString(),
      sub: "Base de clientes activa",
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Empleados",
      value: resumen.totalEmpleados.toString(),
      sub: "Equipo activo",
      icon: Scissors,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  const allAlertas = [
    ...alertas.productosBajoStock.map((p: any) => ({
      tipo: "stock",
      msg: `Stock bajo: ${p.nombre} (${p.stockActual} unidades)`,
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    })),
    ...alertas.clientesBajoPuntos.map((c: any) => ({
      tipo: "puntos",
      msg: `Puntos bajos: ${c.nombre} (${c.puntos} puntos)`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    })),
  ];

  if (allAlertas.length === 0) {
    allAlertas.push({
      tipo: "info",
      msg: "Sin alertas para hoy",
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground capitalize">{fecha}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Buenos días — aquí está el resumen del día
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
          {resumen.facturadoHoy > 0 ? "Caja abierta" : "Caja cerrada"}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Próximos turnos */}
        <Card className="xl:col-span-2 border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Próximos turnos</CardTitle>
              <a
                href="/turnos"
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Ver agenda <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {proximosTurnos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay turnos programados para hoy
              </p>
            ) : (
              proximosTurnos.slice(0, 5).map((turno: any, i: number) => {
                const estado = estadoConfig[turno.estado] || estadoConfig.pendiente;
                const initials = turno.cliente?.nombre
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "NN";
                const hora = new Date(turno.fechaHora).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={turno.id}>
                    <div className="flex items-center gap-3 py-2.5">
                      <span className="text-xs font-mono font-semibold text-muted-foreground w-10 shrink-0">
                        {hora}
                      </span>

                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {turno.cliente?.nombre || "Cliente"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {turno.servicio?.nombre || "Servicio"} · {turno.empleado?.nombre || "Empleado"}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 shrink-0 ${estado.className}`}
                      >
                        {estado.label}
                      </Badge>
                    </div>
                    {i < proximosTurnos.slice(0, 5).length - 1 && (
                      <Separator className="opacity-30" />
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Alertas */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold">Alertas del día</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {allAlertas.slice(0, 4).map((alerta, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 rounded-lg p-2.5 ${alerta.bg}`}
                >
                  <alerta.icon className={`w-4 h-4 mt-0.5 shrink-0 ${alerta.color}`} />
                  <p className={`text-xs font-medium leading-snug ${alerta.color}`}>
                    {alerta.msg}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resumen del negocio */}
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold">Resumen del negocio</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clientes</span>
                <span className="text-sm font-semibold">{resumen.totalClientes}</span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Empleados</span>
                <span className="text-sm font-semibold">{resumen.totalEmpleados}</span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Servicios</span>
                <span className="text-sm font-semibold">{resumen.totalServicios}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resumen semanal — barra simple */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Turnos esta semana
            </CardTitle>
            <a
              href="/reportes"
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              Ver reportes <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-end gap-2 h-20">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Hoy"].map((dia, i) => {
              const pct = i === 6 ? 70 : Math.floor(Math.random() * 60) + 30;
              return (
                <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end h-14">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        i === 6 ? "veylo-gradient" : "bg-muted/50"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      i === 6 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {dia}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
