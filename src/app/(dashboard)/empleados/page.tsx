"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Phone,
  Mail,
  CalendarDays,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Scissors,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getEmpleados } from "@/lib/api";
import type { Empleado } from "@/lib/api";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const colores = [
  "bg-violet-500/20 text-violet-400",
  "bg-blue-500/20 text-blue-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
];

function getColor(index: number): string {
  return colores[index % colores.length];
}

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDiaSemana(dateStr: string): string {
  const date = new Date(dateStr);
  return diasSemana[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

export default function EmpleadosPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const [tab, setTab] = useState("resumen");
  const [seleccionado, setSeleccionado] = useState<Empleado | null>(null);

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchEmpleados = async () => {
      try {
        setLoading(true);
        const data = await getEmpleados(token, { negocioId: user.negocio.id });
        setEmpleados(data);
        if (data.length > 0) {
          setSeleccionado(data[0]);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar empleados");
        console.error("Error loading empleados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, [token, user?.negocio?.id]);

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

  const totalIngresos = empleados.reduce((a, b) => a + (b.ingresosTotales || 0), 0);
  const totalTurnos = empleados.reduce((a, b) => a + (b.totalTurnos || 0), 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{empleados.length}</p>
              <p className="text-[11px] text-muted-foreground">Barberos activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{totalTurnos}</p>
              <p className="text-[11px] text-muted-foreground">Turnos este mes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">
                ${(totalIngresos / 1000).toFixed(0)}k
              </p>
              <p className="text-[11px] text-muted-foreground">Ingresos generados</p>
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
                ${((totalIngresos * 0.35) / 1000).toFixed(0)}k
              </p>
              <p className="text-[11px] text-muted-foreground">Est. comisiones</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Lista */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold">Equipo</p>
            <Button size="sm" className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo barbero
            </Button>
          </div>

          {empleados.map((emp, i) => {
            const color = getColor(i);
            return (
              <Card
                key={emp.id}
                onClick={() => setSeleccionado(emp)}
                className={`border-border/50 bg-card cursor-pointer transition-all hover:border-border ${
                  seleccionado?.id === emp.id ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`text-sm font-bold ${color}`}>
                        {getInitials(emp.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{emp.nombre}</p>
                        {i === 0 && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{emp.rol || "Barbero"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        ${((emp.ingresosTotales || 0) / 1000).toFixed(0)}k
                      </p>
                      <p className="text-[10px] text-muted-foreground">{emp.totalTurnos || 0} turnos</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Asistencia</span>
                        <span className="text-foreground">{emp.activo ? "100%" : "0%"}</span>
                      </div>
                      <div className="w-full bg-muted/40 rounded-full h-1">
                        <div
                          className="h-1 rounded-full veylo-gradient"
                          style={{ width: emp.activo ? "100%" : "0%" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detalle */}
        <div className="xl:col-span-2 space-y-4">
          {seleccionado ? (
            <>
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className={`text-lg font-bold ${getColor(empleados.indexOf(seleccionado))}`}>
                        {getInitials(seleccionado.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold">{seleccionado.nombre}</h2>
                        <Badge
                          className={`${
                            seleccionado.activo
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          } text-[10px]`}
                        >
                          {seleccionado.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{seleccionado.rol || "Barbero"}</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {seleccionado.telefono && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {seleccionado.telefono}
                          </div>
                        )}
                        {seleccionado.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {seleccionado.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8 border-border/50 shrink-0">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="h-9">
                  <TabsTrigger value="resumen" className="text-xs px-4">
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="horarios" className="text-xs px-4">
                    Horarios
                  </TabsTrigger>
                  <TabsTrigger value="servicios" className="text-xs px-4">
                    Servicios
                  </TabsTrigger>
                  <TabsTrigger value="comisiones" className="text-xs px-4">
                    Comisiones
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {tab === "resumen" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-xl font-bold text-blue-400">
                        {seleccionado.totalTurnos || 0}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Turnos / mes</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-xl font-bold text-emerald-400">
                        ${((seleccionado.ingresosTotales || 0) / 1000).toFixed(1)}k
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Ingresos</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-xl font-bold text-violet-400">
                        ${seleccionado.ticketPromedio?.toLocaleString("es-AR") || "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Ticket prom.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card">
                    <CardContent className="p-4 text-center">
                      <p className="text-xl font-bold text-amber-400">
                        ${(((seleccionado.ingresosTotales || 0) * (seleccionado.comision || 0.35)) / 1000).toFixed(1)}
                        k
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Comisión</p>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2 sm:col-span-4 border-border/50 bg-card">
                    <CardHeader className="pb-2 px-5 pt-4">
                      <CardTitle className="text-sm font-semibold">Ranking del mes</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-3">
                      {[...empleados]
                        .sort((a, b) => (b.ingresosTotales || 0) - (a.ingresosTotales || 0))
                        .map((e, i, arr) => {
                          const maxIngresos = empleados[0]?.ingresosTotales || 1;
                          const pct = Math.round(((e.ingresosTotales || 0) / maxIngresos) * 100);
                          return (
                            <div key={e.id}>
                              <div className="flex items-center gap-3 mb-1.5">
                                <span
                                  className={`text-xs font-bold w-5 ${i === 0 ? "text-amber-400" : "text-muted-foreground"}`}
                                >
                                  #{i + 1}
                                </span>
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback
                                    className={`text-[9px] font-bold ${getColor(arr.indexOf(e))}`}
                                  >
                                    {getInitials(e.nombre)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium flex-1">{e.nombre}</span>
                                <span className="text-xs font-bold">
                                  ${(e.ingresosTotales || 0).toLocaleString("es-AR")}
                                </span>
                                <span className="text-[10px] text-muted-foreground w-8 text-right">
                                  {e.totalTurnos || 0}t
                                </span>
                              </div>
                              <div className="w-full bg-muted/40 rounded-full h-1.5 ml-8">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    i === 0 ? "veylo-gradient" : "bg-muted-foreground/30"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              {i < arr.length - 1 && <Separator className="mt-3 opacity-30" />}
                            </div>
                          );
                        })}
                    </CardContent>
                  </Card>
                </div>
              )}

              {tab === "horarios" && (
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-2 px-5 pt-4">
                    <CardTitle className="text-sm font-semibold">Horarios de trabajo</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-2">
                    {diasSemana.map((dia) => {
                      const horario = seleccionado.horarios?.find(
                        (h: any) => getDiaSemana(h.dia) === dia
                      );
                      return (
                        <div key={dia} className="flex items-center gap-3 py-1.5">
                          <span className="text-xs font-medium w-24 shrink-0">{dia}</span>
                          {horario ? (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 rounded-md px-3 py-1">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs font-medium">
                                {horario.horaInicio} – {horario.horaFin}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground/50">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="text-xs">Libre</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {tab === "servicios" && (
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-2 px-5 pt-4">
                    <CardTitle className="text-sm font-semibold">Servicios habilitados</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {seleccionado.servicios && seleccionado.servicios.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {seleccionado.servicios.map((s: any) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {s.nombre}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin servicios asignados</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {tab === "comisiones" && (
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-2 px-5 pt-4">
                    <CardTitle className="text-sm font-semibold">Comisiones</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <p className="text-base font-bold">{((seleccionado.comision || 0.35) * 100).toFixed(0)}%</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Porcentaje</p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <p className="text-base font-bold">
                          ${(seleccionado.ingresosTotales || 0).toLocaleString("es-AR")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Base cálculo</p>
                      </div>
                      <div className="bg-muted/40 rounded-xl p-3 text-center">
                        <p className="text-base font-bold text-emerald-400">
                          ${((seleccionado.ingresosTotales || 0) * (seleccionado.comision || 0.35)).toLocaleString("es-AR")}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">A cobrar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-border/50 bg-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Selecciona un empleado para ver sus detalles</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
