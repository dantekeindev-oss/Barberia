"use client";

import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { createMovimientoStock } from "@/lib/api";
import type { Producto } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: "entrada" | "salida";
  productos: Producto[];
  productoPreseleccionado?: Producto | null;
}

const MOTIVOS_ENTRADA = [
  "Compra a proveedor",
  "Reposición de stock",
  "Devolución de proveedor",
  "Ajuste de inventario",
  "Otro",
];

const MOTIVOS_SALIDA = [
  "Uso en servicio",
  "Venta directa",
  "Muestra / regalo",
  "Producto vencido o dañado",
  "Ajuste de inventario",
  "Otro",
];

export function MovimientoStockModal({
  open,
  onClose,
  onSuccess,
  tipo,
  productos,
  productoPreseleccionado,
}: Props) {
  const { token } = useAuth();

  const [productoId, setProductoId] = useState(productoPreseleccionado?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [motivoCustom, setMotivoCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esEntrada = tipo === "entrada";
  const motivosList = esEntrada ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA;
  const productoActual = productos.find((p) => p.id === productoId);

  function resetForm() {
    setProductoId(productoPreseleccionado?.id ?? "");
    setCantidad("");
    setMotivo("");
    setMotivoCustom("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!token) return;
    if (!productoId) { setError("Seleccioná un producto"); return; }
    const cant = Number(cantidad);
    if (!cant || cant <= 0) { setError("Ingresá una cantidad válida"); return; }
    if (!motivo) { setError("Seleccioná un motivo"); return; }
    if (motivo === "Otro" && !motivoCustom.trim()) { setError("Describí el motivo"); return; }

    if (!esEntrada && productoActual && cant > productoActual.stockActual) {
      setError(`No hay suficiente stock. Disponible: ${productoActual.stockActual} ${productoActual.unidad}`);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createMovimientoStock(
        { productoId, tipo, cantidad: cant, motivo: motivo === "Otro" ? motivoCustom : motivo },
        token,
      );
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar movimiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            {esEntrada ? (
              <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownCircle className="w-4 h-4 text-red-400" />
            )}
            Registrar {esEntrada ? "entrada" : "salida"} de stock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Producto */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Producto</label>
            <Select value={productoId} onValueChange={(v) => setProductoId(v ?? "")}>
              <SelectTrigger className="h-9 text-xs border-border/50">
                <SelectValue placeholder="Seleccionar producto..." />
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span>{p.nombre}</span>
                      <Badge
                        variant="outline"
                        className={`ml-auto text-[9px] px-1.5 ${
                          p.tipo === "insumo"
                            ? "bg-muted/50 text-muted-foreground border-border"
                            : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {p.tipo === "insumo" ? "Insumo" : "Venta"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock actual si hay producto seleccionado */}
          {productoActual && (
            <div
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs border ${
                !esEntrada && productoActual.stockActual <= (productoActual.stockMinimo ?? 0)
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                  : "bg-muted/20 border-border/30 text-muted-foreground"
              }`}
            >
              <span>Stock actual</span>
              <span className="font-semibold">
                {productoActual.stockActual} {productoActual.unidad}
              </span>
            </div>
          )}

          {/* Cantidad */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Cantidad {productoActual ? `(${productoActual.unidad})` : ""}
            </label>
            <Input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 5"
              className="h-9 text-xs"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Motivo</label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v ?? "")}>
              <SelectTrigger className="h-9 text-xs border-border/50">
                <SelectValue placeholder="Seleccionar motivo..." />
              </SelectTrigger>
              <SelectContent>
                {motivosList.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {motivo === "Otro" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Describí el motivo</label>
              <Input
                value={motivoCustom}
                onChange={(e) => setMotivoCustom(e.target.value)}
                placeholder="Ingresá el motivo..."
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Resumen */}
          {productoActual && cantidad && Number(cantidad) > 0 && (
            <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Resumen</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Stock actual</span>
                <span className="font-medium">{productoActual.stockActual} {productoActual.unidad}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{esEntrada ? "Ingreso" : "Egreso"}</span>
                <span className={`font-semibold ${esEntrada ? "text-emerald-400" : "text-red-400"}`}>
                  {esEntrada ? "+" : "-"}{Number(cantidad)} {productoActual.unidad}
                </span>
              </div>
              <div className="border-t border-border/30 pt-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Stock resultante</span>
                <span className="font-bold text-foreground">
                  {esEntrada
                    ? productoActual.stockActual + Number(cantidad)
                    : productoActual.stockActual - Number(cantidad)}{" "}
                  {productoActual.unidad}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs border-border/50"
              onClick={handleClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className={`flex-1 h-9 text-xs text-white border-0 font-semibold ${
                esEntrada
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : esEntrada ? (
                <>
                  <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Registrar entrada
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5" />
                  Registrar salida
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
