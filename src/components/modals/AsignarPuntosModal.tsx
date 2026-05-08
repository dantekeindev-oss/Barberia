"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { agregarPuntosPorVisita } from "@/lib/api";
import type { Cliente } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente: Cliente | null;
}

export function AsignarPuntosModal({ open, onClose, onSuccess, cliente }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monto, setMonto] = useState("");

  const puntosEstimados = monto ? Math.floor(Number(monto) / 100) : 0;

  async function handleSubmit() {
    if (!token || !cliente) return;
    if (!monto || Number(monto) <= 0) { setError("Ingresá un monto"); return; }

    try {
      setSaving(true);
      setError(null);
      await agregarPuntosPorVisita(cliente.id, Number(monto), token);
      setMonto("");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al asignar puntos");
    } finally {
      setSaving(false);
    }
  }

  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Star className="w-4 h-4 text-amber-400" />
            Asignar puntos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
            <p className="text-sm font-semibold">{cliente.nombre}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Puntos actuales: <span className="font-bold text-foreground">{cliente.puntosAcumulados ?? 0}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Monto de la compra ($)</label>
            <Input
              type="number"
              min={0}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 3500"
              className="h-9 text-xs"
            />
          </div>

          {puntosEstimados > 0 && (
            <div className="flex justify-between text-xs px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400">
              <span>Puntos a acreditar</span>
              <span className="font-bold">+{puntosEstimados} pts</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs bg-amber-600 hover:bg-amber-500 text-white border-0 font-semibold" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Star className="w-3.5 h-3.5 mr-1.5" />Asignar puntos</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
