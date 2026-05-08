"use client";

import { useState, useEffect } from "react";
import { Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createProveedor, updateProveedor } from "@/lib/api";
import type { Proveedor } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proveedor?: Proveedor | null;
}

export function ProveedorModal({ open, onClose, onSuccess, proveedor }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");

  const esEdicion = !!proveedor;

  useEffect(() => {
    if (open) {
      if (proveedor) {
        setNombre(proveedor.nombre);
        setContacto(proveedor.contacto ?? "");
        setTelefono(proveedor.telefono ?? "");
        setEmail(proveedor.email ?? "");
        setNotas(proveedor.notas ?? "");
      } else {
        setNombre("");
        setContacto("");
        setTelefono("");
        setEmail("");
        setNotas("");
      }
      setError(null);
    }
  }, [open, proveedor]);

  async function handleSubmit() {
    if (!token) return;
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }

    try {
      setSaving(true);
      setError(null);
      const data = {
        nombre: nombre.trim(),
        contacto: contacto.trim() || undefined,
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
        notas: notas.trim() || undefined,
      };

      if (esEdicion) {
        await updateProveedor(proveedor!.id, data, token);
      } else {
        await createProveedor(data, token);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar proveedor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="w-4 h-4 text-primary" />
            {esEdicion ? "Editar proveedor" : "Nuevo proveedor"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del proveedor" className="h-9 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contacto</label>
              <Input value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del contacto" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="11-1234-5678" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="proveedor@ejemplo.com" className="h-9 text-xs" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notas</label>
            <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales..." className="h-9 text-xs" />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs border-border/50" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 h-9 text-xs veylo-gradient text-white border-0 font-semibold hover:opacity-90" onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : esEdicion ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
