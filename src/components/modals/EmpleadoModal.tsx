"use client";

import { useState, useEffect } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createEmpleado, updateEmpleado } from "@/lib/api";
import type { Empleado } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empleado?: Empleado | null;
}

const ESPECIALIDADES_OPCIONES = [
  "Corte clásico", "Corte degradé", "Barba", "Color", "Tratamientos", "Keratina", "Mechas",
];

export function EmpleadoModal({ open, onClose, onSuccess, empleado }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [comision, setComision] = useState("10");
  const [especialidades, setEspecialidades] = useState<string[]>([]);

  const esEdicion = !!empleado;

  useEffect(() => {
    if (open) {
      if (empleado) {
        setNombre(empleado.nombre);
        setApellido(empleado.apellido ?? "");
        setTelefono(empleado.telefono ?? "");
        setComision(empleado.comisionPorcentaje.toString());
        const esps = typeof empleado.especialidades === "string"
          ? empleado.especialidades.split(", ").filter(Boolean)
          : [];
        setEspecialidades(esps);
      } else {
        setNombre("");
        setApellido("");
        setTelefono("");
        setComision("10");
        setEspecialidades([]);
      }
      setError(null);
    }
  }, [open, empleado]);

  function toggleEspecialidad(esp: string) {
    setEspecialidades((prev) =>
      prev.includes(esp) ? prev.filter((e) => e !== esp) : [...prev, esp]
    );
  }

  async function handleSubmit() {
    if (!token) return;
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }

    try {
      setSaving(true);
      setError(null);
      const data = {
        nombre: nombre.trim(),
        apellido: apellido.trim() || undefined,
        telefono: telefono.trim() || undefined,
        comisionPorcentaje: Number(comision) || 0,
        especialidades,
        fechaIngreso: new Date().toISOString(),
        activo: true,
      };
      if (esEdicion) {
        await updateEmpleado(empleado!.id, data, token);
      } else {
        await createEmpleado(data, token);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <UserCheck className="w-4 h-4 text-primary" />
            {esEdicion ? "Editar empleado" : "Nuevo empleado"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Lucas" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Apellido</label>
              <Input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej: García" className="h-9 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="11-1234-5678" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Comisión (%)</label>
              <Input type="number" min={0} max={100} value={comision} onChange={(e) => setComision(e.target.value)} placeholder="10" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Especialidades</label>
            <div className="flex flex-wrap gap-1.5">
              {ESPECIALIDADES_OPCIONES.map((esp) => (
                <button
                  key={esp}
                  onClick={() => toggleEspecialidad(esp)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${especialidades.includes(esp) ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:border-border"}`}
                >
                  {esp}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs veylo-gradient text-white border-0 font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : esEdicion ? "Guardar cambios" : "Crear empleado"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
