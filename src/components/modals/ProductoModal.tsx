"use client";

import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { createProducto, updateProducto, getProveedores } from "@/lib/api";
import type { Producto, Proveedor } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto?: Producto | null;
}

const UNIDADES = ["unidad", "ml", "g", "kg", "L", "par", "pack"];

export function ProductoModal({ open, onClose, onSuccess, producto }: Props) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"insumo" | "venta">("insumo");
  const [precioVenta, setPrecioVenta] = useState("");
  const [costoCompra, setCostoCompra] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unidad, setUnidad] = useState("unidad");
  const [proveedorId, setProveedorId] = useState("");

  const esEdicion = !!producto;

  useEffect(() => {
    if (!token) return;
    getProveedores(token).then(setProveedores).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (open) {
      if (producto) {
        setNombre(producto.nombre);
        setDescripcion(producto.descripcion ?? "");
        setTipo(producto.tipo);
        setPrecioVenta(producto.precioVenta?.toString() ?? "");
        setCostoCompra(producto.costoCompra.toString());
        setStockActual(producto.stockActual.toString());
        setStockMinimo(producto.stockMinimo.toString());
        setUnidad(producto.unidad);
        setProveedorId(producto.proveedorId ?? "");
      } else {
        setNombre("");
        setDescripcion("");
        setTipo("insumo");
        setPrecioVenta("");
        setCostoCompra("0");
        setStockActual("0");
        setStockMinimo("0");
        setUnidad("unidad");
        setProveedorId("");
      }
      setError(null);
    }
  }, [open, producto]);

  async function handleSubmit() {
    if (!token) return;
    if (!nombre.trim()) { setError("El nombre es requerido"); return; }
    if (tipo === "venta" && (!precioVenta || Number(precioVenta) <= 0)) {
      setError("Ingresá el precio de venta"); return;
    }

    try {
      setSaving(true);
      setError(null);
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        tipo,
        precioVenta: tipo === "venta" ? Number(precioVenta) : undefined,
        costoCompra: Number(costoCompra) || 0,
        stockActual: Number(stockActual) || 0,
        stockMinimo: Number(stockMinimo) || 0,
        unidad,
        proveedorId: proveedorId || undefined,
        activo: true,
      };

      if (esEdicion) {
        await updateProducto(producto!.id, data, token);
      } else {
        await createProducto(data, token);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Package className="w-4 h-4 text-primary" />
            {esEdicion ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cera moldeadora" className="h-9 text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={tipo} onValueChange={(v) => setTipo((v ?? "insumo") as "insumo" | "venta")}>
                <SelectTrigger className="h-9 text-xs border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insumo" className="text-xs">Insumo (uso interno)</SelectItem>
                  <SelectItem value="venta" className="text-xs">Venta directa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Unidad</label>
              <Select value={unidad} onValueChange={(v) => setUnidad(v ?? "unidad")}>
                <SelectTrigger className="h-9 text-xs border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipo === "venta" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Precio de venta *</label>
                <Input type="number" min={0} value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="0" className="h-9 text-xs" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Costo de compra</label>
              <Input type="number" min={0} value={costoCompra} onChange={(e) => setCostoCompra(e.target.value)} placeholder="0" className="h-9 text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Stock actual</label>
              <Input type="number" min={0} value={stockActual} onChange={(e) => setStockActual(e.target.value)} placeholder="0" className="h-9 text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Stock mínimo</label>
              <Input type="number" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} placeholder="0" className="h-9 text-xs" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Proveedor</label>
              <Select value={proveedorId} onValueChange={(v) => setProveedorId(v ?? "")}>
                <SelectTrigger className="h-9 text-xs border-border/50">
                  <SelectValue placeholder="Sin proveedor asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs text-muted-foreground">Sin proveedor</SelectItem>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Descripción</label>
              <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción opcional..." className="h-9 text-xs" />
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
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : esEdicion ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
