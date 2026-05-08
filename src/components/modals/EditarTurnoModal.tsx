"use client";

import { useState } from "react";
import { CalendarDays, Loader2, XCircle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { updateTurnoEstado } from "@/lib/api";
import type { Turno } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  turno: Turno | null;
}

const estadoConfig: Record<string, { label: string; badge: string }> = {
  pendiente: { label: "Pendiente", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  confirmado: { label: "Confirmado", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  en_curso: { label: "En curso", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  finalizado: { label: "Finalizado", badge: "bg-muted/30 text-muted-foreground border-border" },
  cancelado: { label: "Cancelado", badge: "bg-red-500/15 text-red-400 border-red-500/30" },
  ausente: { label: "Ausente", badge: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

export function EditarTurnoModal({ open, onClose, onSuccess, turno }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!turno) return null;

  const fecha = new Date(turno.fechaInicio);
  const fechaStr = fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const horaStr = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const cfg = estadoConfig[turno.estado] ?? estadoConfig.pendiente;

  async function cambiarEstado(nuevoEstado: Turno["estado"]) {
    if (!token) return;
    try {
      setSaving(true);
      setError(null);
      await updateTurnoEstado(turno!.id, nuevoEstado, token);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar el turno");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="w-4 h-4 text-primary" />
            Gestionar turno
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info del turno */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{turno.cliente?.nombre}</p>
              <Badge variant="outline" className={`text-[10px] ${cfg.badge}`}>{cfg.label}</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="capitalize">{fechaStr} · {horaStr}</p>
              <p>{turno.empleado?.nombre}</p>
              <p>{turno.servicios?.[0]?.servicio?.nombre}</p>
            </div>
          </div>

          {/* Cambios de estado */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Cambiar estado</p>

            {turno.estado !== "confirmado" && turno.estado !== "cancelado" && turno.estado !== "ausente" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-start gap-2"
                onClick={() => cambiarEstado("confirmado")}
                disabled={saving}
              >
                Marcar como confirmado
              </Button>
            )}

            {turno.estado !== "en_curso" && turno.estado !== "cancelado" && turno.estado !== "ausente" && turno.estado !== "finalizado" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 justify-start gap-2"
                onClick={() => cambiarEstado("en_curso")}
                disabled={saving}
              >
                Marcar en curso
              </Button>
            )}

            {turno.estado !== "cancelado" && turno.estado !== "ausente" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 justify-start gap-2"
                onClick={() => cambiarEstado("cancelado")}
                disabled={saving}
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancelar turno
              </Button>
            )}

            {turno.estado !== "ausente" && turno.estado !== "cancelado" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10 justify-start gap-2"
                onClick={() => cambiarEstado("ausente")}
                disabled={saving}
              >
                <UserX className="w-3.5 h-3.5" />
                Marcar como no-show
              </Button>
            )}
          </div>

          {saving && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button variant="outline" size="sm" className="w-full h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
