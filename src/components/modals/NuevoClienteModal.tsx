"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Mail, Calendar, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface NuevoClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onClienteCreado?: () => void;
  defaultNombre?: string;
  defaultTelefono?: string;
}

export function NuevoClienteModal({ open, onOpenChange, onSuccess, onClienteCreado, defaultNombre = "", defaultTelefono = "" }: NuevoClienteModalProps) {
  const { user, token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (open) {
      setNombre(defaultNombre);
      setTelefono(defaultTelefono);
      setEmail("");
      setFechaNacimiento("");
      setNotas("");
      setError(null);
    }
  }, [open, defaultNombre, defaultTelefono]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user?.negocio?.id) return;

    try {
      setSubmitting(true);
      setError(null);

      const { createCliente } = await import("@/lib/api");
      await createCliente({
        nombre,
        telefono,
        email: email || undefined,
        fechaNacimiento: fechaNacimiento || undefined,
        observaciones: notas || undefined,
      }, token);

      onOpenChange(false);
      onSuccess?.();
      onClienteCreado?.();

      // Reset form
      setNombre("");
      setTelefono("");
      setEmail("");
      setFechaNacimiento("");
      setNotas("");
    } catch (err: any) {
      setError(err.message || "Error al crear el cliente");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Nuevo cliente
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nombre completo *</Label>
              <Input
                placeholder="Juan Pérez"
                className="h-9 text-xs"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="11-1234-5678"
                  className="pl-9 h-9 text-xs"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="juan.perez@email.com"
                  className="pl-9 h-9 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Fecha de nacimiento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9 h-9 text-xs"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Útil para campañas de cumpleaños
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Notas</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  className="w-full min-h-[60px] pl-9 pr-3 pt-2.5 text-xs rounded-lg border border-border/50 bg-muted/30 focus:border-primary focus-visible:ring-primary/30 resize-none"
                  placeholder="Preferencias, observaciones..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 border-border/50"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 veylo-gradient text-white border-0 hover:opacity-90 font-semibold"
              disabled={submitting || !nombre || !telefono}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
