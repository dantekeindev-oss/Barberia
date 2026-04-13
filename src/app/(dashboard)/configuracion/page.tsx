"use client";

import { useState, useEffect } from "react";
import {
  Scissors,
  Clock,
  Building2,
  Users,
  Shield,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getServicios, getUsuarios, updateNegocio } from "@/lib/api";
import type { Servicio, Usuario } from "@/lib/api";

export default function ConfiguracionPage() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState("servicios");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [datosNegocio, setDatosNegocio] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [serviciosData, usuariosData] = await Promise.all([
          getServicios(token, { negocioId: user.negocio.id }),
          getUsuarios(token, { negocioId: user.negocio.id }),
        ]);
        setServicios(serviciosData);
        setUsuarios(usuariosData);

        // Set business data from user context
        if (user.negocio) {
          setDatosNegocio({
            nombre: user.negocio.nombre || "",
            telefono: user.negocio.telefono || "",
            email: user.negocio.email || "",
            direccion: user.negocio.direccion || "",
          });
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de configuración");
        console.error("Error loading configuracion:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id, user?.negocio]);

  async function handleGuardarNegocio() {
    if (!token || !user?.negocio?.id) return;

    try {
      setSaving(true);
      setError(null);

      await updateNegocio(user.negocio.id, datosNegocio, token);

      // Refresh user data to get updated business info
      await refreshUser();

      alert("Datos del negocio actualizados correctamente");
    } catch (err: any) {
      setError(err.message || "Error al guardar datos del negocio");
    } finally {
      setSaving(false);
    }
  }

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
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-9">
          <TabsTrigger value="servicios" className="text-xs px-4">
            Servicios
          </TabsTrigger>
          <TabsTrigger value="horarios" className="text-xs px-4">
            Horarios
          </TabsTrigger>
          <TabsTrigger value="negocio" className="text-xs px-4">
            Negocio
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xs px-4">
            Usuarios
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "servicios" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5 flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Servicios disponibles</CardTitle>
            <Button
              size="sm"
              className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo servicio
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {servicios.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay servicios configurados
              </p>
            ) : (
              servicios.map((s) => (
                <div
                  key={s.id}
                  className={`border ${s.activo ? "border-border/50" : "border-border/20 opacity-60"} rounded-xl p-4`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg shrink-0 bg-primary/15 text-primary flex items-center justify-center">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{s.nombre}</p>
                        {!s.activo && (
                          <Badge className="bg-muted/50 text-muted-foreground border-border text-[10px]">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.duracion} min
                        </span>
                        <span>${s.precio.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {tab === "horarios" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5">
            <CardTitle className="text-sm font-semibold">Horarios de atención</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(
              (dia, i) => (
                <div
                  key={dia}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border/30 bg-muted/20"
                >
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-foreground">{dia}</p>
                    {i === 6 && <p className="text-[10px] text-muted-foreground">Cerrado</p>}
                  </div>
                  {i !== 6 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Input
                        type="time"
                        defaultValue={i === 6 ? "" : "09:00"}
                        disabled={i === 6}
                        className="w-28 h-8 text-xs"
                      />
                      <span className="text-muted-foreground">–</span>
                      <Input
                        type="time"
                        defaultValue={i === 4 ? "20:00" : i === 6 ? "" : "18:00"}
                        disabled={i === 6}
                        className="w-28 h-8 text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No atiende</span>
                  )}
                  <div className="ml-auto">
                    <button
                      className={`text-[10px] px-3 py-1 rounded-full font-medium transition-colors ${
                        i !== 6
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {i !== 6 ? "Activo" : "Activar"}
                    </button>
                  </div>
                </div>
              )
            )}
          </CardContent>
          <CardContent className="px-5 pb-5 pt-0">
            <Button
              size="sm"
              className="h-9 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold w-full"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "negocio" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Datos del negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <Input
                  value={datosNegocio.nombre}
                  onChange={(e) => setDatosNegocio({ ...datosNegocio, nombre: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                <Input
                  value={datosNegocio.telefono}
                  onChange={(e) => setDatosNegocio({ ...datosNegocio, telefono: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  value={datosNegocio.email}
                  onChange={(e) => setDatosNegocio({ ...datosNegocio, email: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Dirección</label>
                <Input
                  value={datosNegocio.direccion}
                  onChange={(e) => setDatosNegocio({ ...datosNegocio, direccion: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <Button
                size="sm"
                className="h-9 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold w-full"
                onClick={handleGuardarNegocio}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Seguridad y accesos
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs font-semibold text-foreground mb-1">Autenticación de dos factores</p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Añade una capa adicional de seguridad a tu cuenta.
                </p>
                <Button size="sm" variant="outline" className="h-8 text-xs border-border/50 w-full">
                  Configurar 2FA
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-xs font-semibold text-foreground mb-1">Tiempo de sesión</p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Duración de las sesiones antes de requerir login nuevamente.
                </p>
                <Select defaultValue="7dias">
                  <SelectTrigger className="h-8 text-xs border-border/50 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hora">1 hora</SelectItem>
                    <SelectItem value="24horas">24 horas</SelectItem>
                    <SelectItem value="7dias">7 días</SelectItem>
                    <SelectItem value="30dias">30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "usuarios" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-5 flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios del sistema
            </CardTitle>
            <Button
              size="sm"
              className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo usuario
            </Button>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left pb-3 text-muted-foreground font-medium">Usuario</th>
                  <th className="text-left pb-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left pb-3 text-muted-foreground font-medium">Rol</th>
                  <th className="text-left pb-3 text-muted-foreground font-medium">Estado</th>
                  <th className="text-right pb-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="py-3 font-medium text-foreground">{u.nombre}</td>
                      <td className="py-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 ${
                            u.rol === "ADMIN"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : u.rol === "RECEPCIONISTA"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-violet-500/10 text-violet-400 border-violet-500/30"
                          }`}
                        >
                          {u.rol === "ADMIN"
                            ? "Administrador"
                            : u.rol === "RECEPCIONISTA"
                            ? "Recepcionista"
                            : "Barbero"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {u.activo ? (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-400">
                            <XCircle className="w-3 h-3" />
                            <span>Inactivo</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-[10px] text-primary hover:text-primary/80 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
