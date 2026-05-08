"use client";

import { useState, useEffect } from "react";
import { Unlock, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { abrirCaja } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AbrirCajaModal({ open, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const [monto, setMonto] = useState("5000");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMonto("5000");
      setError(null);
    }
  }, [open]);

  async function handleAbrir() {
    if (!token) return;
    const montoNum = Number(monto);
    if (!monto || montoNum < 0) { setError("Ingresá un monto inicial válido"); return; }

    try {
      setSaving(true);
      await abrirCaja({ montoInicial: montoNum }, token);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al abrir la caja");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xs bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Unlock className="w-4 h-4 text-emerald-400" />
            Abrir caja
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-muted-foreground">
            Ingresá el dinero en efectivo disponible al inicio del día.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Monto inicial ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="h-10 pl-8 text-sm font-semibold"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-semibold"
              onClick={handleAbrir}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Unlock className="w-3.5 h-3.5 mr-1.5" />Abrir caja</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
