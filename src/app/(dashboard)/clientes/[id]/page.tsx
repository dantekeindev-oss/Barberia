"use client";

import { useState } from "react";
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
  XCircle,
  Calendar as CalendarIcon,
  User,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NuevoTurnoModal } from "@/components/modals/NuevoTurnoModal";

const clienteData = {
  nombre: "Carlos Ramírez",
  initials: "CR",
  telefono: "11-4523-1234",
  email: "carlos@gmail.com",
  fechaNacimiento: "12/05/1990",
  fechaRegistro: "15/02/2025",
  segmento: "frecuente",
  puntos: 340,
  visitas: 18,
  ticketPromedio: 3100,
  ultimaVisita: "03/04/2026",
  barberoHabitual: "Javier",
  preferencias: "Corte bajo con fade. Rata al costado izquierda. No le gusta hablar mucho durante el servicio.",
  observaciones: "Cliente VIP. Buen pagador. Prefiere citas matutinas.",
};

const historial = [
  {
    id: 1,
    fecha: "03/04/2026",
    hora: "10:30",
    barbero: "Javier",
    servicio: "Corte + Barba",
    duracion: "50 min",
    precio: 3500,
    estado: "finalizado",
  },
  {
    id: 2,
    fecha: "18/03/2026",
    hora: "11:00",
    barbero: "Javier",
    servicio: "Corte degradé",
    duracion: "30 min",
    precio: 2800,
    estado: "finalizado",
  },
  {
    id: 3,
    fecha: "05/03/2026",
    hora: "09:30",
    barbero: "Lucas",
    servicio: "Corte + Barba",
    duracion: "50 min",
    precio: 3500,
    estado: "finalizado",
  },
  {
    id: 4,
    fecha: "15/02/2026",
    hora: "10:00",
    barbero: "Javier",
    servicio: "Corte clásico",
    duracion: "25 min",
    precio: 2200,
    estado: "finalizado",
  },
  {
    id: 5,
    fecha: "28/01/2026",
    hora: "14:30",
    barbero: "Nicolás",
    servicio: "Arreglo de barba",
    duracion: "20 min",
    precio: 1500,
    estado: "ausente",
  },
];

const proximos = [
  { id: 1, fecha: "17/04/2026", hora: "10:30", barbero: "Javier", servicios: ["Corte + Barba"], estado: "confirmado" },
];

const estadoConfig: Record<string, { label: string; className: string }> = {
  confirmado: { label: "Confirmado", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pendiente: { label: "Pendiente", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  en_curso: { label: "En curso", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  finalizado: { label: "Finalizado", className: "bg-muted/30 text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  ausente: { label: "Ausente", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

export default function ClienteFichaPage() {
  const params = useParams();
  const [tab, setTab] = useState("historial");
  const [modalNuevoTurnoOpen, setModalNuevoTurnoOpen] = useState(false);

  const totalGastado = historial
    .filter((h) => h.estado === "finalizado")
    .reduce((acc, h) => acc + h.precio, 0);

  const ultimoServicio = historial.find((h) => h.estado === "finalizado");

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
                {clienteData.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{clienteData.nombre}</h2>
                <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30 text-[10px]">Frecuente</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {clienteData.telefono}
                </div>
                {clienteData.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {clienteData.email}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {clienteData.fechaNacimiento}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {clienteData.puntos} puntos
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Registrado:</span>
                  <span className="ml-1 text-foreground">{clienteData.fechaRegistro}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Última visita:</span>
                  <span className="ml-1 text-foreground">{clienteData.ultimaVisita}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Barbero habitual:</span>
                  <span className="ml-1 text-foreground">{clienteData.barberoHabitual}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4 opacity-30" />

          {/* Preferencias y observaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <Scissors className="w-3.5 h-3.5" />
                Preferencias de corte
              </div>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                {clienteData.preferencias}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <User className="w-3.5 h-3.5" />
                Observaciones internas
              </div>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
                {clienteData.observaciones}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Visitas totales", value: clienteData.visitas, icon: CalendarIcon, color: "text-foreground", bg: "bg-muted/50" },
          { label: "Último servicio", value: ultimoServicio?.servicio || "—", icon: Scissors, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Ticket promedio", value: `$${clienteData.ticketPromedio.toLocaleString("es-AR")}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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
                    {p.fecha} · {p.hora}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.barbero} · {p.servicios.join(" + ")}
                  </p>
                </div>
                <Badge className={estadoConfig[p.estado].className}>
                  {estadoConfig[p.estado].label}
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
            <div className="space-y-1">
              {historial.map((h, i) => {
                const estado = estadoConfig[h.estado];
                return (
                  <div key={h.id}>
                    <div className="flex items-center gap-4 py-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{h.fecha}</p>
                          <span className="text-xs text-muted-foreground">{h.hora}</span>
                        </div>
                        <p className="text-xs text-foreground">{h.servicio}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span>{h.barbero}</span>
                          <span>·</span>
                          <span>{h.duracion}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${h.precio.toLocaleString("es-AR")}</p>
                        <Badge className={estado.className}>{estado.label}</Badge>
                      </div>
                    </div>
                    {i < historial.length - 1 && <Separator className="opacity-30" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "puntos" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-semibold">Historial de puntos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {[
              { fecha: "03/04/2026", puntos: 25, tipo: "acumula", motivo: "Visita: Corte + Barba", saldo: 340 },
              { fecha: "18/03/2026", puntos: 25, tipo: "acumula", motivo: "Visita: Corte degradé", saldo: 315 },
              { fecha: "15/03/2026", puntos: -100, tipo: "canje", motivo: "Canje: $500 descuento", saldo: 290 },
              { fecha: "05/03/2026", puntos: 25, tipo: "acumula", motivo: "Visita: Corte + Barba", saldo: 390 },
            ].map((p, i, arr) => (
              <div key={i}>
                <div className="flex items-center gap-4 py-2">
                  <div className={`w-2 h-2 rounded-full ${p.tipo === "acumula" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{p.fecha}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{p.motivo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${p.tipo === "acumula" ? "text-emerald-400" : "text-red-400"}`}>
                      {p.tipo === "acumula" ? "+" : "-"}{p.puntos} pts
                    </p>
                    <p className="text-[10px] text-muted-foreground">Saldo: {p.saldo}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <Separator className="opacity-30" />}
              </div>
            ))}
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
        defaultClienteNombre={clienteData.nombre}
        defaultClienteTelefono={clienteData.telefono}
      />
    </div>
  );
}
