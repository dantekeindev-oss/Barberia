"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Crown,
  Gift,
  Ticket,
  Mail,
  MessageSquare,
  Users,
  Award,
  Plus,
  TrendingUp,
  CheckCircle2,
  Send,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getClientes, getMembresias, getCupones } from "@/lib/api";
import type { Cliente, Membresia, Cupon } from "@/lib/api";

const nivelConfig: Record<string, { color: string; bg: string; puntos: number }> = {
  Regular: { color: "text-muted-foreground", bg: "bg-muted/30", puntos: 200 },
  Vip: { color: "text-violet-400", bg: "bg-violet-500/10", puntos: 500 },
  Gold: { color: "text-amber-400", bg: "bg-amber-500/10", puntos: 1000 },
  Platinum: { color: "text-emerald-400", bg: "bg-emerald-500/10", puntos: Infinity },
};

function getNivel(puntos: number): string {
  if (puntos >= 1000) return "Platinum";
  if (puntos >= 500) return "Gold";
  if (puntos >= 200) return "Vip";
  return "Regular";
}

function getProximoNivel(puntos: number): { nombre: string; faltan: number } {
  const nivel = getNivel(puntos);
  if (nivel === "Platinum") return { nombre: "Máximo", faltan: 0 };

  const niveles = ["Regular", "Vip", "Gold", "Platinum"];
  const idx = niveles.indexOf(nivel);
  const siguiente = niveles[idx + 1];
  const faltan = nivelConfig[siguiente].puntos - puntos;

  return { nombre: siguiente, faltan };
}

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function FidelizacionPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [cupones, setCupones] = useState<Cupon[]>([]);

  const [tab, setTab] = useState("puntos");

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientesData, membresiasData, cuponesData] = await Promise.all([
          getClientes(token),
          getMembresias(token),
          getCupones(token),
        ]);
        setClientes(clientesData);
        setMembresias(membresiasData);
        setCupones(cuponesData);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de fidelización");
        console.error("Error loading fidelizacion:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id]);

  const totalPuntos = clientes.reduce((a, b) => a + (b.puntosAcumulados || 0), 0);
  const cuponesActivos = cupones.filter((c) => c.activo);
  const usosCupones = cuponesActivos.reduce((a, b) => a + (b.usosActuales || 0), 0);

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
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">{totalPuntos.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Puntos activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Crown className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-violet-400">
                {clientes.filter((c) => (c as any).membresiaId).length}
              </p>
              <p className="text-[11px] text-muted-foreground">Clientes con membresía</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">{usosCupones}</p>
              <p className="text-[11px] text-muted-foreground">Cupones canjeados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">0</p>
              <p className="text-[11px] text-muted-foreground">Campañas activas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9">
          <TabsTrigger value="puntos" className="text-xs px-4">
            Puntos
          </TabsTrigger>
          <TabsTrigger value="membresias" className="text-xs px-4">
            Membresías
          </TabsTrigger>
          <TabsTrigger value="cupones" className="text-xs px-4">
            Cupones
          </TabsTrigger>
          <TabsTrigger value="campañas" className="text-xs px-4">
            Campañas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "puntos" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Puntos por cliente</p>
              <Button
                size="sm"
                className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Ajustar puntos
              </Button>
            </div>
            <Card className="border-border/50 bg-card overflow-hidden">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border/50 bg-card sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                        Cliente
                      </th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">
                        Nivel
                      </th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                        Puntos
                      </th>
                      <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                        Próximo nivel
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay clientes registrados
                        </td>
                      </tr>
                    ) : (
                      clientes
                        .sort((a, b) => (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0))
                        .slice(0, 10)
                        .map((c) => {
                          const puntos = c.puntosAcumulados || 0;
                          const nivel = getNivel(puntos);
                          const config = nivelConfig[nivel];
                          const proximo = getProximoNivel(puntos);
                          return (
                            <tr
                              key={c.id}
                              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-[9px] font-bold bg-primary/15 text-primary">
                                      {getInitials(c.nombre)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground">{c.nombre}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-2 ${config.bg} ${config.color} border-transparent`}
                                >
                                  {nivel}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-amber-400">
                                {puntos} pts
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                                {proximo.faltan > 0 ? `+${proximo.faltan} pts` : "Máximo"}
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-[10px] text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded bg-primary/10 hover:bg-primary/20">
                                  Canjear
                                </button>
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

          <div className="space-y-4">
            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3 px-5 pt-4">
                <CardTitle className="text-sm font-semibold">Resumen de puntos</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Puntos otorgados</p>
                    <p className="text-base font-bold text-emerald-400">{totalPuntos.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Puntos canjeados</p>
                    <p className="text-base font-bold text-amber-400">
                      {Math.round(totalPuntos * 0.3).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Pendientes</p>
                    <p className="text-base font-bold text-violet-400">
                      {Math.round(totalPuntos * 0.7).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-3 px-5 pt-4">
                <CardTitle className="text-sm font-semibold">Reglas de puntos</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2">
                {[
                  { puntos: 10, motivo: "Por cada visita" },
                  { puntos: 25, motivo: "Por corte + barba" },
                  { puntos: 50, motivo: "Por referir un amigo" },
                  { puntos: 100, motivo: "Canje por $500 off" },
                ].map((r) => (
                  <div key={r.motivo} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400">+{r.puntos} pts</span>
                    <span className="text-muted-foreground">· {r.motivo}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "membresias" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {membresias.length === 0 ? (
            <Card className="col-span-full border-border/50 bg-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No hay membresías configuradas</p>
              </CardContent>
            </Card>
          ) : (
            membresias.map((m, i) => (
              <Card
                key={m.id}
                className={`border-border/50 bg-card relative overflow-hidden ${
                  i === 1 ? "border-amber-500/50" : ""
                }`}
              >
                {i === 1 && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader className="pb-3 px-5 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown
                      className={`w-4 h-4 ${
                        i === 2
                          ? "text-emerald-400"
                          : i === 1
                          ? "text-amber-400"
                          : "text-violet-400"
                      }`}
                    />
                    <CardTitle className="text-base font-semibold">{m.nombre}</CardTitle>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${m.precioMensual.toLocaleString("es-AR")}
                    <span className="text-xs font-normal text-muted-foreground">/mes</span>
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground">{m.descripcion || "Sin descripción"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {clientes.filter((c) => (c as any).membresiaId === m.id).length} clientes
                      activos
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 mt-3"
                    variant={i === 1 ? "default" : "outline"}
                  >
                    Gestionar
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "cupones" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-4 flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Cupones activos</CardTitle>
            <Button
              size="sm"
              className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo cupón
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {cupones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay cupones configurados
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cupones.map((c) => (
                  <div
                    key={c.id}
                    className={`border ${
                      c.activo ? "border-border/50" : "border-border/20 opacity-60"
                    } rounded-xl p-4 space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket
                          className={`w-4 h-4 ${c.activo ? "text-violet-400" : "text-muted-foreground"}`}
                        />
                        <span
                          className={`font-mono font-bold ${c.activo ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {c.codigo}
                        </span>
                      </div>
                      {c.activo && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Activo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {c.tipoDescuento === "porcentaje"
                          ? `${c.valor}%`
                          : `$${c.valor}`} de descuento
                      </span>
                      <span className="text-muted-foreground">{c.usosActuales || 0} usos</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "campañas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-4 flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Campañas</CardTitle>
              <Button
                size="sm"
                className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Nueva campaña
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay campañas activas
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-4">
              <CardTitle className="text-sm font-semibold">Campañas rápidas</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {[
                {
                  icon: <Gift className="w-3.5 h-3.5 text-pink-400" />,
                  label: "Cumpleaños del mes",
                  desc: "Enviar a clientes que cumplen años",
                },
                {
                  icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
                  label: "Recuperar inactivos",
                  desc: "Clientes sin visita en 60 días",
                },
                {
                  icon: <Users className="w-3.5 h-3.5 text-violet-400" />,
                  label: "Nuevos clientes",
                  desc: "Bienvenida tras primera visita",
                },
                {
                  icon: <Star className="w-3.5 h-3.5 text-amber-400" />,
                  label: "Niveles alcanzados",
                  desc: "Clientes que subieron de nivel",
                },
              ].map((c) => (
                <button
                  key={c.label}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/20 hover:border-border transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
