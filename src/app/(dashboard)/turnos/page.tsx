"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Filter,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NuevoTurnoModal } from "@/components/modals/NuevoTurnoModal";
import { useAuth } from "@/contexts/AuthContext";
import { getTurnos, getEmpleados, getServicios } from "@/lib/api";
import type { Turno, Empleado, Servicio } from "@/lib/api";

const estadoConfig: Record<string, { label: string; cell: string; badge: string }> = {
  confirmado: {
    label: "Confirmado",
    cell: "bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-300",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  pendiente: {
    label: "Pendiente",
    cell: "bg-amber-500/15 border-l-2 border-amber-500 text-amber-300",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  en_curso: {
    label: "En curso",
    cell: "bg-blue-500/20 border-l-2 border-blue-400 text-blue-200",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  completado: {
    label: "Completado",
    cell: "bg-muted/30 border-l-2 border-border text-muted-foreground",
    badge: "bg-muted/30 text-muted-foreground border-border",
  },
  cancelado: {
    label: "Cancelado",
    cell: "bg-red-500/10 border-l-2 border-red-500/50 text-red-400/70",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  ausente: {
    label: "Ausente",
    cell: "bg-rose-500/10 border-l-2 border-rose-500/50 text-rose-400/70",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
};

const horas = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
  "18:30", "19:00", "19:30", "20:00",
];

export default function TurnosPage() {
  const { user, token } = useAuth();
  const [vista, setVista] = useState<"dia" | "semana">("dia");
  const [barberoFiltro, setBarberoFiltro] = useState("todos");
  const [modalNuevoTurnoOpen, setModalNuevoTurnoOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [turnosData, empleadosData, serviciosData] = await Promise.all([
          getTurnos(token, {
            fechaInicio: fecha.toISOString().split('T')[0],
          }),
          getEmpleados(token),
          getServicios(token),
        ]);
        setTurnos(turnosData);
        setEmpleados(empleadosData);
        setServicios(serviciosData);
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos");
        console.error("Error loading turnos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id, fecha]);

  const fechaStr = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const barberosOptions = [
    { id: "todos", nombre: "Todos" },
    ...empleados.map(e => ({ id: e.id, nombre: e.nombre })),
  ];

  const barberosFiltrados = empleados;

  function getTurno(hora: string, empleadoId: string) {
    const turnoHora = turnos.find(t => {
      const turnoFecha = new Date(t.fechaInicio);
      const horaTurno = turnoFecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return horaTurno === hora && t.empleadoId === empleadoId;
    });
    return turnoHora;
  }

  function getStats() {
    return {
      total: turnos.length,
      confirmados: turnos.filter(t => t.estado === "confirmado" || t.estado === "en_curso").length,
      pendientes: turnos.filter(t => t.estado === "pendiente").length,
      cancelados: turnos.filter(t => t.estado === "cancelado" || t.estado === "ausente").length,
    };
  }

  const stats = getStats();
  const cols =
    barberoFiltro === "todos"
      ? barberosFiltrados
      : barberosFiltrados.filter((b) => b.id === barberoFiltro);

  if (loading) {
    return (
      <div className="space-y-4 h-full flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando agenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setFecha(d => new Date(d.setDate(d.getDate() - 1)))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-semibold capitalize min-w-44 text-center">
              {fechaStr}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setFecha(d => new Date(d.setDate(d.getDate() + 1)))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 border-border/50"
            onClick={() => setFecha(new Date())}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Hoy
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro barbero */}
          <Select value={barberoFiltro} onValueChange={(v) => { if (v != null) setBarberoFiltro(v); }}>
            <SelectTrigger className="w-36 h-8 text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {barberosOptions.map((b) => (
                <SelectItem key={b.id} value={b.id} className="text-xs">
                  {b.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Vista */}
          <Tabs value={vista} onValueChange={(v) => setVista(v as "dia" | "semana")}>
            <TabsList className="h-8">
              <TabsTrigger value="dia" className="text-xs px-3">Día</TabsTrigger>
              <TabsTrigger value="semana" className="text-xs px-3">Semana</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            onClick={() => setModalNuevoTurnoOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nuevo turno
          </Button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">{stats.total}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Confirmados</span>
            <span className="text-lg font-bold text-emerald-400">{stats.confirmados}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Pendientes</span>
            <span className="text-lg font-bold text-amber-400">{stats.pendientes}</span>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Cancelados</span>
            <span className="text-lg font-bold text-red-400">{stats.cancelados}</span>
          </CardContent>
        </Card>
      </div>

      {/* Agenda */}
      <Card className="flex-1 border-border/50 bg-card overflow-hidden">
        <div className="overflow-auto h-full">
          <table className="w-full text-xs border-collapse min-w-[500px]">
            {/* Header barberos */}
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                <th className="w-16 border-b border-r border-border/50 p-2 text-left text-muted-foreground font-medium">
                  Hora
                </th>
                {cols.map((b) => (
                  <th
                    key={b.id}
                    className="border-b border-r border-border/50 p-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[9px] font-bold bg-primary/15 text-primary">
                          {b.nombre.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground">{b.nombre}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Filas de horas */}
            <tbody>
              {horas.map((hora) => (
                <tr key={hora} className="group">
                  <td className="border-b border-r border-border/30 p-2 text-muted-foreground font-mono w-16 align-top pt-2.5">
                    {hora}
                  </td>
                  {cols.map((empleado) => {
                    const turno = getTurno(hora, empleado.id);

                    return (
                      <td
                        key={empleado.id}
                        className="border-b border-r border-border/30 p-1 align-top h-12 relative group/cell"
                      >
                        {turno ? (
                          <div
                            className={`h-full rounded-md px-2 py-1.5 cursor-pointer hover:opacity-80 transition-opacity ${estadoConfig[turno.estado]?.cell || estadoConfig.pendiente.cell}`}
                          >
                            <p className="font-semibold text-[11px] leading-tight truncate">
                              {turno.cliente?.nombre || "Cliente"}
                            </p>
                            <p className="text-[10px] opacity-75 truncate">
                              {turno.servicios?.[0]?.servicio?.nombre || "Servicio"}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => setModalNuevoTurnoOpen(true)}
                            className="w-full h-full rounded-md opacity-0 group-hover/cell:opacity-100 border border-dashed border-border/50 transition-opacity flex items-center justify-center text-muted-foreground/50 hover:border-primary/50 hover:text-primary/50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Leyenda */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(estadoConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <Badge variant="outline" className={`text-[10px] px-2 py-0 ${val.badge}`}>
              {val.label}
            </Badge>
          </div>
        ))}
      </div>

      <NuevoTurnoModal
        open={modalNuevoTurnoOpen}
        onOpenChange={setModalNuevoTurnoOpen}
        onTurnoCreado={() => {
          // Refresh turnos
          if (token && user?.negocio?.id) {
            getTurnos(token, {
              fechaInicio: fecha.toISOString().split('T')[0],
            }).then(setTurnos);
          }
        }}
      />
    </div>
  );
}
