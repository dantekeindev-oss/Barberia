"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Star,
  ChevronRight,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NuevoClienteModal } from "@/components/modals/NuevoClienteModal";
import { useAuth } from "@/contexts/AuthContext";
import { getClientes } from "@/lib/api";
import type { Cliente } from "@/lib/api";

const segmentoConfig: Record<string, { label: string; badge: string; icon: any }> = {
  frecuente: {
    label: "Frecuente",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    icon: Star,
  },
  nuevo: {
    label: "Nuevo",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: UserPlus,
  },
  inactivo: {
    label: "Inactivo",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    icon: UserMinus,
  },
};

function getSegmento(cliente: Cliente): string {
  if (!cliente.ultimaVisita) return "nuevo";

  const diasDesdeUltimaVisita = Math.floor(
    (Date.now() - new Date(cliente.ultimaVisita).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasDesdeUltimaVisita > 90) return "inactivo";
  if (cliente.totalVisitas >= 5) return "frecuente";
  return "nuevo";
}

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ClientesPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [segmento, setSegmento] = useState("todos");
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const [modalNuevoClienteOpen, setModalNuevoClienteOpen] = useState(false);

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchClientes = async () => {
      try {
        setLoading(true);
        const data = await getClientes(token, { negocioId: user.negocio.id });
        setClientes(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar clientes");
        console.error("Error loading clientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [token, user?.negocio?.id]);

  const clientesConSegmento = clientes.map((c) => ({
    ...c,
    segmento: getSegmento(c),
  }));

  const filtrados = clientesConSegmento.filter((c) => {
    const matchBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono && c.telefono.includes(busqueda)) ||
      (c.email && c.email.toLowerCase().includes(busqueda.toLowerCase()));
    const matchSegmento = segmento === "todos" || c.segmento === segmento;
    return matchBusqueda && matchSegmento;
  });

  const frecuentes = clientesConSegmento.filter((c) => c.segmento === "frecuente").length;
  const nuevos = clientesConSegmento.filter((c) => c.segmento === "nuevo").length;
  const inactivos = clientesConSegmento.filter((c) => c.segmento === "inactivo").length;

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
    <div className="space-y-4 flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Users className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{clientes.length}</p>
              <p className="text-[11px] text-muted-foreground">Total clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-violet-400">{frecuentes}</p>
              <p className="text-[11px] text-muted-foreground">Frecuentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">{nuevos}</p>
              <p className="text-[11px] text-muted-foreground">Nuevos (30d)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <UserMinus className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-orange-400">{inactivos}</p>
              <p className="text-[11px] text-muted-foreground">Inactivos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
        {/* Lista */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Controles */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
                className="pl-9 h-9 text-xs bg-muted/50 border-border/50"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Tabs value={segmento} onValueChange={setSegmento}>
              <TabsList className="h-9">
                <TabsTrigger value="todos" className="text-xs px-3">Todos</TabsTrigger>
                <TabsTrigger value="frecuente" className="text-xs px-3">Frecuentes</TabsTrigger>
                <TabsTrigger value="nuevo" className="text-xs px-3">Nuevos</TabsTrigger>
                <TabsTrigger value="inactivo" className="text-xs px-3">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              className="h-9 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold ml-auto"
              onClick={() => setModalNuevoClienteOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo cliente
            </Button>
          </div>

          {/* Tabla */}
          <Card className="border-border/50 bg-card flex-1 overflow-hidden">
            <div className="overflow-auto h-full">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Contacto</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Segmento</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Visitas</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Ticket prom.</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell">Última visita</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron clientes
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((cliente) => {
                      const seg = segmentoConfig[cliente.segmento] || segmentoConfig.nuevo;
                      const activo = seleccionado?.id === cliente.id;
                      return (
                        <tr
                          key={cliente.id}
                          onClick={() => setSeleccionado(activo ? null : cliente)}
                          className={`cursor-pointer transition-colors border-b border-border/30 hover:bg-muted/30 ${activo ? "bg-primary/5" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-7 h-7 shrink-0">
                                <AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary">
                                  {getInitials(cliente.nombre)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-foreground">{cliente.nombre}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-foreground/80">{cliente.telefono || "—"}</p>
                            {cliente.email && (
                              <p className="text-muted-foreground text-[10px] truncate max-w-36">
                                {cliente.email}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <Badge variant="outline" className={`text-[10px] px-2 ${seg.badge}`}>
                              {seg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-foreground/80 hidden lg:table-cell">
                            {cliente.totalVisitas || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground/80 hidden lg:table-cell">
                            {cliente.ticketPromedio
                              ? `$${cliente.ticketPromedio.toLocaleString("es-AR")}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                            {cliente.ultimaVisita
                              ? new Date(cliente.ultimaVisita).toLocaleDateString("es-AR")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${activo ? "rotate-90" : ""}`} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Ficha del cliente */}
        {seleccionado && (
          <div className="xl:w-80 shrink-0">
            <Card className="border-border/50 bg-card sticky top-0">
              <CardHeader className="pb-3 px-5 pt-5">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-sm font-bold bg-primary/15 text-primary">
                      {getInitials(seleccionado.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold">
                      {seleccionado.nombre}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 mt-1 ${segmentoConfig[getSegmento(seleccionado)]?.badge || segmentoConfig.nuevo.badge}`}
                    >
                      {segmentoConfig[getSegmento(seleccionado)]?.label || "Nuevo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {/* Contacto */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {seleccionado.telefono || "Sin teléfono"}
                  </div>
                  {seleccionado.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {seleccionado.email}
                    </div>
                  )}
                </div>

                <Separator className="opacity-30" />

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-foreground">{seleccionado.totalVisitas || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Visitas</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-foreground">
                      {seleccionado.ticketPromedio
                        ? `$${(seleccionado.ticketPromedio / 1000).toFixed(1)}k`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Ticket</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 text-center">
                    <p className="text-sm font-bold text-foreground">{seleccionado.puntos || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Puntos</p>
                  </div>
                </div>

                <Separator className="opacity-30" />

                {/* Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última visita</span>
                    <span className="text-foreground font-medium">
                      {seleccionado.ultimaVisita
                        ? new Date(seleccionado.ultimaVisita).toLocaleDateString("es-AR")
                        : "—"}
                    </span>
                  </div>
                  {seleccionado.fechaAlta && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cliente desde</span>
                      <span className="text-foreground font-medium">
                        {new Date(seleccionado.fechaAlta).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  )}
                  {seleccionado.notas && (
                    <>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-muted-foreground">Notas</span>
                        <span className="text-foreground">{seleccionado.notas}</span>
                      </div>
                    </>
                  )}
                </div>

                <Separator className="opacity-30" />

                {/* Acciones */}
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full text-xs h-8 border-border/50">
                    Ver historial completo
                  </Button>
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 veylo-gradient text-white border-0 hover:opacity-90"
                    onClick={() => {
                      // TODO: Open nuevo turno modal with this client pre-selected
                      console.log("Agendar turno para cliente:", seleccionado.id);
                    }}
                  >
                    Agendar turno
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <NuevoClienteModal
        open={modalNuevoClienteOpen}
        onOpenChange={setModalNuevoClienteOpen}
        onClienteCreado={() => {
          if (token && user?.negocio?.id) {
            getClientes(token, { negocioId: user.negocio.id }).then(setClientes);
          }
        }}
      />
    </div>
  );
}
