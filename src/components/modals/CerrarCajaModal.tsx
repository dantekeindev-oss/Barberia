"use client";

import { useState } from "react";
import { Lock, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { cerrarCaja } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cajaId: string;
  saldoCalculado: number;
}

export function CerrarCajaModal({ open, onClose, onSuccess, cajaId, saldoCalculado }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [montoContado, setMontoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const diferencia = montoContado ? Number(montoContado) - saldoCalculado : null;

  async function handleSubmit() {
    if (!token) return;
    if (!montoContado) { setError("Ingresá el monto contado"); return; }

    try {
      setSaving(true);
      setError(null);
      await cerrarCaja(cajaId, {
        montoContadoCierre: Number(montoContado),
        observacionesCierre: observaciones || undefined,
      }, token);
      setMontoContado("");
      setObservaciones("");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cerrar caja");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="w-4 h-4 text-primary" />
            Cerrar caja
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Saldo calculado</span>
              <span className="font-bold text-foreground">${saldoCalculado.toLocaleString("es-AR")}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              <DollarSign className="w-3 h-3 inline mr-1" />
              Monto contado en caja *
            </label>
            <Input
              type="number"
              min={0}
              value={montoContado}
              onChange={(e) => setMontoContado(e.target.value)}
              placeholder="Ingresá el efectivo contado"
              className="h-9 text-xs"
            />
          </div>

          {diferencia !== null && (
            <div className={`flex justify-between text-xs px-3 py-2 rounded-lg ${diferencia === 0 ? "bg-emerald-500/10 text-emerald-400" : diferencia > 0 ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
              <span>Diferencia</span>
              <span className="font-bold">{diferencia > 0 ? "+" : ""}{diferencia.toLocaleString("es-AR")}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Observaciones</label>
            <Input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas opcionales..."
              className="h-9 text-xs"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs bg-red-600 hover:bg-red-500 text-white border-0 font-semibold" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Lock className="w-3.5 h-3.5 mr-1.5" />Cerrar caja</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
