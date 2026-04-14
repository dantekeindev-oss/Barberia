"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Scissors, Search, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getClientes, getEmpleados, getServicios, createTurno, createCliente } from "@/lib/api";
import type { Cliente, Empleado, Servicio } from "@/lib/api";

interface NuevoTurnoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onTurnoCreado?: () => void;
  defaultClienteNombre?: string;
  defaultClienteTelefono?: string;
}

export function NuevoTurnoModal({ open, onOpenChange, onSuccess, onTurnoCreado, defaultClienteNombre = "", defaultClienteTelefono = "" }: NuevoTurnoModalProps) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Servicio[]>([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [modoCrearCliente, setModoCrearCliente] = useState(false);

  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("");
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState("");

  useEffect(() => {
    if (open && token && user?.negocio?.id) {
      loadData();
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFecha(today);
    } else {
      // Reset form when closing
      setClienteSeleccionado(null);
      setEmpleadoSeleccionado(null);
      setServiciosSeleccionados([]);
      setFecha("");
      setHora("");
      setNotas("");
      setBusquedaCliente("");
      setModoCrearCliente(false);
      setNuevoClienteNombre("");
      setNuevoClienteTelefono("");
      setError(null);
    }
  }, [open, token, user?.negocio?.id]);

  useEffect(() => {
    if (defaultClienteNombre && defaultClienteTelefono && open) {
      const clienteExistente = clientes.find(
        (c) => c.telefono === defaultClienteTelefono
      );
      if (clienteExistente) {
        setClienteSeleccionado(clienteExistente);
      } else {
        setBusquedaCliente(defaultClienteNombre);
        setNuevoClienteNombre(defaultClienteNombre);
        setNuevoClienteTelefono(defaultClienteTelefono);
      }
    }
  }, [defaultClienteNombre, defaultClienteTelefono, clientes, open]);

  const loadData = async () => {
    if (!token || !user?.negocio?.id) return;

    try {
      setLoading(true);
      const [clientesData, empleadosData, serviciosData] = await Promise.all([
        getClientes(token),
        getEmpleados(token),
        getServicios(token),
      ]);
      setClientes(clientesData);
      setEmpleados(empleadosData);
      setServicios(serviciosData);
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
      console.error("Error loading modal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const duracionTotal = serviciosSeleccionados.reduce((acc, s) => acc + s.duracionMin, 0);
  const precioTotal = serviciosSeleccionados.reduce((acc, s) => acc + s.precio, 0);

  function toggleServicio(servicio: Servicio) {
    setServiciosSeleccionados((prev) =>
      prev.find((s) => s.id === servicio.id)
        ? prev.filter((s) => s.id !== servicio.id)
        : [...prev, servicio]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user?.negocio?.id) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create client if in create mode
      let clienteId = clienteSeleccionado?.id;
      if (modoCrearCliente && nuevoClienteNombre && nuevoClienteTelefono) {
        const nuevoCliente = await createCliente({
          nombre: nuevoClienteNombre,
          telefono: nuevoClienteTelefono,
        }, token);
        clienteId = nuevoCliente.id;
      }

      if (!clienteId || !empleadoSeleccionado?.id || serviciosSeleccionados.length === 0) {
        setError("Por favor completa todos los campos requeridos");
        return;
      }

      // Create turno
      const fechaInicio = new Date(`${fecha}T${hora}`);
      const durTotalMs = serviciosSeleccionados.reduce((acc, s) => acc + s.duracionMin, 0);
      const fechaFin = new Date(fechaInicio.getTime() + durTotalMs * 60 * 1000);
      await createTurno({
        clienteId,
        empleadoId: empleadoSeleccionado.id,
        servicioIds: serviciosSeleccionados.map(s => s.id),
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        estado: "pendiente",
        notas: notas || undefined,
      }, token);

      // Create additional services as separate turnos or handle differently
      // For now, we'll just create one turno with the primary service

      onOpenChange(false);
      onSuccess?.();
      onTurnoCreado?.();
    } catch (err: any) {
      setError(err.message || "Error al crear el turno");
      console.error("Error creating turno:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCrearCliente() {
    if (!token || !user?.negocio?.id || !nuevoClienteNombre || !nuevoClienteTelefono) return;

    try {
      setSubmitting(true);
      const nuevoCliente = await createCliente({
        nombre: nuevoClienteNombre,
        telefono: nuevoClienteTelefono,
      }, token);
      setClienteSeleccionado(nuevoCliente);
      setModoCrearCliente(false);
      setBusquedaCliente("");
    } catch (err: any) {
      setError(err.message || "Error al crear el cliente");
    } finally {
      setSubmitting(false);
    }
  }

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono?.includes(busquedaCliente)
  );

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg">Nuevo turno</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="space-y-5">
              {/* Cliente */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cliente</Label>
                {modoCrearCliente ? (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <Input
                      placeholder="Nombre completo"
                      className="h-9 text-xs"
                      value={nuevoClienteNombre}
                      onChange={(e) => setNuevoClienteNombre(e.target.value)}
                    />
                    <Input
                      placeholder="Teléfono"
                      className="h-9 text-xs"
                      value={nuevoClienteTelefono}
                      onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex-1 border-border/50"
                        onClick={() => setModoCrearCliente(false)}
                      >
                        ← Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 text-xs flex-1 veylo-gradient text-white border-0 hover:opacity-90"
                        onClick={handleCrearCliente}
                        disabled={!nuevoClienteNombre || !nuevoClienteTelefono}
                      >
                        Crear cliente
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o teléfono..."
                        className="pl-9 h-9 text-xs"
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                      />
                    </div>

                    {busquedaCliente && clientesFiltrados.length > 0 && (
                      <div className="border border-border/50 rounded-lg overflow-hidden">
                        {clientesFiltrados.map((c) => {
                          const initials = c.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setClienteSeleccionado(c);
                                setBusquedaCliente("");
                              }}
                              className="w-full flex items-center gap-2 p-2.5 hover:bg-muted/30 transition-colors text-left"
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[9px] font-bold bg-primary/15 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-foreground">{c.nombre}</p>
                                <p className="text-[10px] text-muted-foreground">{c.telefono || "Sin teléfono"}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {busquedaCliente && clientesFiltrados.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground mb-2">No se encontró el cliente</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-border/50"
                          onClick={() => setModoCrearCliente(true)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Crear nuevo cliente
                        </Button>
                      </div>
                    )}

                    {clienteSeleccionado && !busquedaCliente && (
                      <div className="flex items-center justify-between p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[9px] font-bold bg-primary/20 text-primary">
                              {clienteSeleccionado.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{clienteSeleccionado.nombre}</p>
                            <p className="text-[10px] text-muted-foreground">{clienteSeleccionado.telefono || "Sin teléfono"}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setClienteSeleccionado(null)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Barbero */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Barbero</Label>
                <div className="grid grid-cols-3 gap-2">
                  {empleados.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEmpleadoSeleccionado(e)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        empleadoSeleccionado?.id === e.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 bg-primary/15 text-primary flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">{e.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Servicios</Label>
                <div className="space-y-1.5">
                  {servicios.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleServicio(s)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left hover:border-border/50 hover:bg-muted/20"
                    >
                      <Checkbox
                        checked={serviciosSeleccionados.some((sel) => sel.id === s.id)}
                        readOnly
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{s.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {s.duracionMin} min
                          </span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-emerald-400">${s.precio.toLocaleString("es-AR")}</span>
                        </div>
                      </div>
                      {serviciosSeleccionados.some((sel) => sel.id === s.id) && (
                        <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
                          Seleccionado
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fecha</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9 h-9 text-xs"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      className="pl-9 h-9 text-xs"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notas (opcional)</Label>
                <textarea
                  className="w-full min-h-[80px] p-3 text-xs rounded-lg border border-border/50 bg-muted/30 focus:border-primary focus-visible:ring-primary/30 resize-none"
                  placeholder="Agrega notas especiales para este turno..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>

              {/* Resumen */}
              {serviciosSeleccionados.length > 0 && (
                <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Resumen</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Servicios:</span>
                      <span className="text-foreground text-right flex-1 ml-4">
                        {serviciosSeleccionados.map((s) => s.nombre).join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Duración:</span>
                      <span className="text-foreground">{duracionTotal} minutos</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Estimado:</span>
                      <span className="text-emerald-400 font-semibold">
                        ${precioTotal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 border-border/50"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 veylo-gradient text-white border-0 hover:opacity-90 font-semibold"
              disabled={
                submitting ||
                !clienteSeleccionado ||
                !empleadoSeleccionado ||
                serviciosSeleccionados.length === 0 ||
                !fecha ||
                !hora
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Agendar turno
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
