"use client";

import { useState, useEffect } from "react";
import { Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createCupon, updateCupon } from "@/lib/api";
import type { Cupon } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cupon?: Cupon | null;
}

export function CuponModal({ open, onClose, onSuccess, cupon }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState<"porcentaje" | "monto_fijo">("porcentaje");
  const [valor, setValor] = useState("");
  const [maxUsos, setMaxUsos] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  const esEdicion = !!cupon;

  useEffect(() => {
    if (open) {
      if (cupon) {
        setCodigo(cupon.codigo);
        setTipoDescuento(cupon.tipoDescuento);
        setValor(cupon.valor.toString());
        setMaxUsos(cupon.usosMax?.toString() ?? "");
        setVencimiento(cupon.fechaHasta ? cupon.fechaHasta.split("T")[0] : "");
      } else {
        setCodigo("");
        setTipoDescuento("porcentaje");
        setValor("");
        setMaxUsos("");
        setVencimiento("");
      }
      setError(null);
    }
  }, [open, cupon]);

  function generarCodigo() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
    setCodigo(result);
  }

  async function handleSubmit() {
    if (!token) return;
    if (!codigo.trim()) { setError("El código es requerido"); return; }
    if (!valor || Number(valor) <= 0) { setError("Ingresá un valor"); return; }

    try {
      setSaving(true);
      setError(null);
      const data = {
        codigo: codigo.trim().toUpperCase(),
        tipoDescuento,
        valor: Number(valor),
        usosMax: maxUsos ? Number(maxUsos) : undefined,
        fechaHasta: vencimiento ? new Date(vencimiento).toISOString() : undefined,
        activo: true,
      };
      if (esEdicion) {
        await updateCupon(cupon!.id, data, token);
      } else {
        await createCupon(data, token);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar cupón");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Ticket className="w-4 h-4 text-violet-400" />
            {esEdicion ? "Editar cupón" : "Nuevo cupón"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Código *</label>
            <div className="flex gap-2">
              <Input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: DESC20"
                className="h-9 text-xs font-mono uppercase flex-1"
              />
              <Button variant="outline" size="sm" className="h-9 text-xs border-border/50 shrink-0" onClick={generarCodigo}>
                Generar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={tipoDescuento} onValueChange={(v) => setTipoDescuento((v ?? "porcentaje") as "porcentaje" | "monto_fijo")}>
                <SelectTrigger className="h-9 text-xs border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentaje" className="text-xs">Porcentaje (%)</SelectItem>
                  <SelectItem value="monto_fijo" className="text-xs">Monto fijo ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Valor *</label>
              <Input type="number" min={0} value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipoDescuento === "porcentaje" ? "20" : "500"} className="h-9 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Máx. usos</label>
              <Input type="number" min={0} value={maxUsos} onChange={(e) => setMaxUsos(e.target.value)} placeholder="Sin límite" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Vencimiento</label>
              <Input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} className="h-9 text-xs" />
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
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : esEdicion ? "Guardar" : "Crear cupón"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
