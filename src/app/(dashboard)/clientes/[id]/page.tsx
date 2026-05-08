"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  CalendarDays,
  Scissors,
  DollarSign,
  Star,
  Edit,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  User,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NuevoTurnoModal } from "@/components/modals/NuevoTurnoModal";
import { useAuth } from "@/contexts/AuthContext";
import { getCliente } from "@/lib/api";
import type { Cliente } from "@/lib/api";

interface TurnoCliente {
  id: string;
  fechaInicio: string;
  estado: string;
  empleado: { nombre: string; apellido?: string };
  servicios: Array<{
    servicio: { nombre: string };
    precioAplicado: number;
    duracionAplicada: number;
  }>;
}

interface MovimientoPuntos {
  id: string;
  tipo: "acumulacion" | "canje";
  puntos: number;
  descripcion: string;
  createdAt: string;
}

const estadoConfig: Record<string, { label: string; className: string }> = {
  confirmado: { label: "Confirmado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  en_curso: { label: "En curso", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  finalizado: { label: "Finalizado", className: "bg-muted/30 text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  ausente: { label: "Ausente", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

const segmentoConfig: Record<string, { label: string; className: string }> = {
  frecuente: { label: "Frecuente", className: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  nuevo: { label: "Nuevo", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  inactivo: { label: "Inactivo", className: "bg-muted/30 text-muted-foreground border-border" },
};

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function ClienteFichaPage() {
  const params = useParams();
  const { token } = useAuth();
  const [tab, setTab] = useState("historial");
  const [modalNuevoTurnoOpen, setModalNuevoTurnoOpen] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [turnos, setTurnos] = useState<TurnoCliente[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoPuntos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    setLoading(true);
    getCliente(params.id as string, token)
      .then((data) => {
        setCliente(data);
        setTurnos((data.turnos as TurnoCliente[]).sort(
          (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()
        ));
        setMovimientos(
          (data.movimientosPuntos as MovimientoPuntos[]).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, params.id]);

  const turnosFinalizados = turnos.filter((t) => t.estado === "finalizado");
  const totalGastado = turnosFinalizados.reduce((acc, t) => acc + (t.servicios[0]?.precioAplicado ?? 0), 0);
  const ticketPromedio = turnosFinalizados.length > 0 ? Math.round(totalGastado / turnosFinalizados.length) : 0;
  const ultimoServicio = turnosFinalizados[0]?.servicios[0]?.servicio.nombre ?? "—";
  const initials = cliente
    ? `${cliente.nombre[0]}${cliente.apellido?.[0] ?? ""}`.toUpperCase()
    : "?";

  const proximos = turnos.filter((t) => {
    const future = new Date(t.fechaInicio) >= new Date();
    return future && ["pendiente", "confirmado"].includes(t.estado);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-sm text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/clientes"}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => window.location.href = "/clientes"}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold">Ficha de cliente</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs border-border/50">
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
        </div>
      </div>

      {/* Info principal */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {cliente.nombre} {cliente.apellido ?? ""}
                </h2>
                <Badge className={segmentoConfig[cliente.segmento]?.className ?? ""}>
                  {segmentoConfig[cliente.segmento]?.label ?? cliente.segmento}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {cliente.telefono}
                </div>
                {cliente.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {cliente.email}
                  </div>
                )}
                {cliente.fechaNacimiento && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {fmtFecha(cliente.fechaNacimiento)}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {cliente.puntosAcumulados} puntos
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Registrado:</span>
                  <span className="ml-1 text-foreground">{fmtFecha(cliente.createdAt)}</span>
                </div>
                {turnosFinalizados[0] && (
                  <div>
                    <span className="text-muted-foreground">Última visita:</span>
                    <span className="ml-1 text-foreground">{fmtFecha(turnosFinalizados[0].fechaInicio)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(cliente.preferencias || cliente.observaciones) && (
            <>
              <Separator className="my-4 opacity-30" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cliente.preferencias && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                      <Scissors className="w-3.5 h-3.5" />
                      Preferencias de corte
                    </div>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">{cliente.preferencias}</p>
                  </div>
                )}
                {cliente.observaciones && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                      <User className="w-3.5 h-3.5" />
                      Observaciones internas
                    </div>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">{cliente.observaciones}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Visitas totales", value: cliente._count?.turnos ?? turnosFinalizados.length, icon: CalendarIcon, color: "text-foreground", bg: "bg-muted/50" },
          { label: "Último servicio", value: ultimoServicio, icon: Scissors, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Ticket promedio", value: `$${ticketPromedio.toLocaleString("es-AR")}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total gastado", value: `$${totalGastado.toLocaleString("es-AR")}`, icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
        ].map((k) => (
          <Card key={k.label} className="border-border/50 bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center mb-2`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos turnos */}
      {proximos.length > 0 && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-semibold">Próximos turnos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {proximos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.estado === "confirmado" ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
                  {p.estado === "confirmado" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {fmtFecha(p.fechaInicio)} · {fmtHora(p.fechaInicio)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.empleado.nombre} · {p.servicios.map((s) => s.servicio.nombre).join(" + ")}
                  </p>
                </div>
                <Badge className={estadoConfig[p.estado]?.className ?? ""}>
                  {estadoConfig[p.estado]?.label ?? p.estado}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9">
          <TabsTrigger value="historial" className="text-xs px-4">Historial</TabsTrigger>
          <TabsTrigger value="puntos" className="text-xs px-4">Puntos</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "historial" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-semibold">Historial de visitas</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {turnos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin turnos registrados</p>
            ) : (
              <div className="space-y-1">
                {turnos.map((h, i) => {
                  const estado = estadoConfig[h.estado] ?? { label: h.estado, className: "bg-muted/30 text-muted-foreground border-border" };
                  const servicio = h.servicios[0];
                  return (
                    <div key={h.id}>
                      <div className="flex items-center gap-4 py-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{fmtFecha(h.fechaInicio)}</p>
                            <span className="text-xs text-muted-foreground">{fmtHora(h.fechaInicio)}</span>
                          </div>
                          <p className="text-xs text-foreground">{servicio?.servicio.nombre ?? "—"}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span>{h.empleado.nombre}</span>
                            {servicio && (
                              <>
                                <span>·</span>
                                <span>{servicio.duracionAplicada} min</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {servicio && (
                            <p className="text-sm font-bold text-foreground">${servicio.precioAplicado.toLocaleString("es-AR")}</p>
                          )}
                          <Badge className={estado.className}>{estado.label}</Badge>
                        </div>
                      </div>
                      {i < turnos.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "puntos" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Historial de puntos</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Star className="w-3.5 h-3.5" />
                <span className="font-bold">{cliente.puntosAcumulados} pts</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {movimientos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin movimientos de puntos</p>
            ) : (
              <div className="space-y-1">
                {movimientos.map((m, i) => (
                  <div key={m.id}>
                    <div className="flex items-center gap-4 py-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${m.tipo === "acumulacion" ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span className="text-xs text-muted-foreground w-20 shrink-0">{fmtFecha(m.createdAt)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{m.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${m.tipo === "acumulacion" ? "text-emerald-400" : "text-red-400"}`}>
                          {m.tipo === "acumulacion" ? "+" : ""}{m.puntos} pts
                        </p>
                      </div>
                    </div>
                    {i < movimientos.length - 1 && <Separator className="opacity-30" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full veylo-gradient text-white border-0 hover:opacity-90 shadow-lg shadow-primary/25"
        size="icon"
        onClick={() => setModalNuevoTurnoOpen(true)}
      >
        <CalendarIcon className="w-6 h-6" />
      </Button>

      <NuevoTurnoModal
        open={modalNuevoTurnoOpen}
        onOpenChange={setModalNuevoTurnoOpen}
        defaultClienteNombre={cliente ? `${cliente.nombre} ${cliente.apellido ?? ""}`.trim() : ""}
        defaultClienteTelefono={cliente?.telefono ?? ""}
      />
    </div>
  );
}
