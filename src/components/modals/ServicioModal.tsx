"use client";

import { useState, useEffect } from "react";
import { Scissors, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createServicio, updateServicio } from "@/lib/api";
import type { Servicio } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servicio?: Servicio | null;
}

const COLORES = [
  "#6C3EE8", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#0891B2", "#374151",
];

const CATEGORIAS = ["Corte", "Barba", "Color", "Tratamiento", "Combo", "Otro"];

export function ServicioModal({ open, onClose, onSuccess, servicio }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracionMin, setDuracionMin] = useState("30");
  const [colorAgenda, setColorAgenda] = useState("#6C3EE8");
  const [categoria, setCategoria] = useState("Corte");

  const esEdicion = !!servicio;

  useEffect(() => {
    if (open) {
      if (servicio) {
        setNombre(servicio.nombre);
        setDescripcion(servicio.descripcion ?? "");
        setPrecio(servicio.precio.toString());
        setDuracionMin(servicio.duracionMin.toString());
        setColorAgenda(servicio.colorAgenda);
        setCategoria(servicio.categoria ?? "Corte");
      } else {
        setNombre("");
        setDescripcion("");
        setPrecio("");
        setDuracionMin("30");
        setColorAgenda("#6C3EE8");
        setCategoria("Corte");
      }
      setError(null);
    }
  }, [open, servicio]);

  async function handleSubmit() {
    if (!token) return;
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (!precio || Number(precio) <= 0) { setError("Ingresá el precio"); return; }
    if (!duracionMin || Number(duracionMin) <= 0) { setError("Ingresá la duración"); return; }

    try {
      setSaving(true);
      setError(null);
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        precio: Number(precio),
        duracionMin: Number(duracionMin),
        colorAgenda,
        categoria,
        activo: true,
      };
      if (esEdicion) {
        await updateServicio(servicio!.id, data, token);
      } else {
        await createServicio(data, token);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar servicio");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Scissors className="w-4 h-4 text-primary" />
            {esEdicion ? "Editar servicio" : "Nuevo servicio"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Corte + Barba" className="h-9 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Precio *</label>
              <Input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duración (min) *</label>
              <Input type="number" min={5} step={5} value={duracionMin} onChange={(e) => setDuracionMin(e.target.value)} placeholder="30" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoria(c)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${categoria === c ? "bg-primary/15 border-primary/40 text-primary" : "border-border/40 text-muted-foreground hover:border-border"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Color en agenda</label>
            <div className="flex gap-2 flex-wrap">
              {COLORES.map((c) => (
                <button
                  key={c}
                  onClick={() => setColorAgenda(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${colorAgenda === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción opcional..." className="h-9 text-xs" />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs veylo-gradient text-white border-0 font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : esEdicion ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
