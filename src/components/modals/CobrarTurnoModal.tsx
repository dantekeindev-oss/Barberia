"use client";

import { useState } from "react";
import { X, Scissors, Package, CreditCard, Smartphone, DollarSign, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CobrarTurnoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const productos = [
  { id: 1, nombre: "Cera moldeadora", precio: 2800, stock: 11 },
  { id: 2, nombre: "Pomada texturizante", precio: 3200, stock: 7 },
  { id: 3, nombre: "Aceite para barba", precio: 3500, stock: 5 },
];

const serviciosTurno = [
  { id: 1, nombre: "Corte + Barba", precio: 3500 },
];

export function CobrarTurnoModal({ open, onOpenChange, onSuccess }: CobrarTurnoModalProps) {
  const [productosAgregados, setProductosAgregados] = useState<Array<{ id: number; nombre: string; precio: number; cantidad: number }>>([]);
  const [medioPago, setMedioPago] = useState<"efectivo" | "tarjeta" | "qr" | "transferencia">("efectivo");
  const [montoPagado, setMontoPagado] = useState("");
  const [cupon, setCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<{ tipo: "porcentaje" | "monto"; valor: number; codigo: string } | null>(null);

  const subtotalServicios = serviciosTurno.reduce((acc, s) => acc + s.precio, 0);
  const subtotalProductos = productosAgregados.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const subtotal = subtotalServicios + subtotalProductos;

  const descuento = cuponAplicado
    ? cuponAplicado.tipo === "porcentaje"
      ? (subtotal * cuponAplicado.valor) / 100
      : cuponAplicado.valor
    : 0;
  const total = subtotal - descuento;

  function agregarProducto(id: number, nombre: string, precio: number) {
    const existente = productosAgregados.find((p) => p.id === id);
    if (existente) {
      setProductosAgregados((prev) =>
        prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p))
      );
    } else {
      setProductosAgregados((prev) => [...prev, { id, nombre, precio, cantidad: 1 }]);
    }
  }

  function quitarProducto(id: number) {
    setProductosAgregados((prev) => prev.filter((p) => p.id !== id));
  }

  function aplicarCupon() {
    if (cupon.toUpperCase() === "PRIMA10") {
      setCuponAplicado({ tipo: "porcentaje", valor: 10, codigo: cupon.toUpperCase() });
    } else if (cupon.toUpperCase() === "FRE500") {
      setCuponAplicado({ tipo: "monto", valor: 500, codigo: cupon.toUpperCase() });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({
      servicios: serviciosTurno,
      productos: productosAgregados,
      subtotal,
      descuento,
      total,
      medioPago,
    });
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            Cobrar turno
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Cliente */}
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-foreground">Carlos Ramírez</p>
                <p className="text-xs text-muted-foreground">Javier · Corte + Barba</p>
              </div>
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">En curso</Badge>
            </div>

            {/* Servicios */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Servicios</Label>
              <div className="space-y-1.5">
                {serviciosTurno.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-foreground">{s.nombre}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">${s.precio.toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Agregar productos</Label>
              <div className="grid grid-cols-3 gap-2">
                {productos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarProducto(p.id, p.nombre, p.precio)}
                    className="p-2.5 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    <Package className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium text-foreground truncate">{p.nombre}</p>
                    <p className="text-[10px] text-emerald-400">${p.precio.toLocaleString("es-AR")}</p>
                    <p className="text-[9px] text-muted-foreground">Stock: {p.stock}</p>
                  </button>
                ))}
              </div>

              {productosAgregados.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {productosAgregados.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{p.nombre}</span>
                        <span className="text-[10px] text-muted-foreground">x{p.cantidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          ${(p.precio * p.cantidad).toLocaleString("es-AR")}
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarProducto(p.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="opacity-30" />

            {/* Cupón */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Cupón de descuento</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: PRIMA10, FRE500"
                  className="h-9 text-xs"
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs border-border/50"
                  onClick={aplicarCupon}
                  disabled={!cupon}
                >
                  Aplicar
                </Button>
              </div>
              {cuponAplicado && (
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400">
                    Cupón {cuponAplicado.codigo} aplicado
                  </span>
                  <button
                    type="button"
                    onClick={() => setCuponAplicado(null)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Medio de pago */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Medio de pago</Label>
              <Tabs value={medioPago} onValueChange={(v) => typeof v === "string" && setMedioPago(v as any)}>
                <TabsList className="grid grid-cols-4 h-9">
                  <TabsTrigger value="efectivo" className="text-[10px] gap-1">
                    <DollarSign className="w-3 h-3" />
                    Efectivo
                  </TabsTrigger>
                  <TabsTrigger value="tarjeta" className="text-[10px] gap-1">
                    <CreditCard className="w-3 h-3" />
                    Tarjeta
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="text-[10px] gap-1">
                    <Smartphone className="w-3 h-3" />
                    QR
                  </TabsTrigger>
                  <TabsTrigger value="transferencia" className="text-[10px] gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    Transf.
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {medioPago === "tarjeta" && (
                <div className="grid grid-cols-2 gap-2">
                  <Select defaultValue="debito">
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Nro. tarjeta"
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {medioPago === "efectivo" && (
                <Input
                  type="number"
                  placeholder="Monto recibido"
                  className="h-9 text-xs"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                />
              )}

              {medioPago === "qr" && (
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Escanear código QR</p>
                  <p className="text-[10px] text-muted-foreground mt-1">o mostrar al cliente</p>
                </div>
              )}

              {medioPago === "transferencia" && (
                <div className="space-y-2">
                  <Input
                    placeholder="CBU / CVU"
                    className="h-9 text-xs"
                  />
                  <Input
                    placeholder="Referencia (últimos 4 dígitos)"
                    className="h-9 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border/30 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal servicios</span>
                <span className="text-foreground">${subtotalServicios.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Productos</span>
                <span className="text-foreground">${subtotalProductos.toLocaleString("es-AR")}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-red-400">-${descuento.toLocaleString("es-AR")}</span>
                </div>
              )}
              <Separator className="opacity-30" />
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 border-border/50"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 veylo-gradient text-white border-0 hover:opacity-90 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Cobrar ${total.toLocaleString("es-AR")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
