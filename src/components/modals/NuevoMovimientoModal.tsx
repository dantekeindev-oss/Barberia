"use client";

import { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface NuevoMovimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NuevoMovimientoModal({ open, onOpenChange, onSuccess }: NuevoMovimientoModalProps) {
  const [tipo, setTipo] = useState<"ingreso" | "egreso">("ingreso");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [medioPago, setMedioPago] = useState<"efectivo" | "tarjeta" | "qr" | "transferencia">("efectivo");
  const [referencia, setReferencia] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({
      tipo,
      concepto,
      monto: parseFloat(monto),
      medioPago: tipo === "egreso" ? null : medioPago,
      referencia,
    });
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg flex items-center gap-2">
            {tipo === "ingreso" ? (
              <>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                Nuevo ingreso
              </>
            ) : (
              <>
                <ArrowDownLeft className="w-5 h-5 text-red-400" />
                Nuevo egreso
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Tipo de movimiento</Label>
              <Tabs value={tipo} onValueChange={(v) => typeof v === "string" && setTipo(v as "ingreso" | "egreso")}>
                <TabsList className="w-full h-9">
                  <TabsTrigger value="ingreso" className="flex-1 text-xs gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    Ingreso
                  </TabsTrigger>
                  <TabsTrigger value="egreso" className="flex-1 text-xs gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
                    Egreso
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Concepto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Concepto *</Label>
              <Input
                placeholder={tipo === "ingreso" ? "Ej: Pago de cuota, venta de producto..." : "Ej: Proveedor, servicio de limpieza..."}
                className="h-9 text-xs"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
              />
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monto *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9 h-9 text-xs"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  step="0.01"
                />
              </div>
            </div>

            {/* Medio de pago (solo ingresos) */}
            {tipo === "ingreso" && (
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
                  <Select defaultValue="debito">
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debito">Débito</SelectItem>
                      <SelectItem value="credito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {medioPago === "transferencia" && (
                  <Input
                    placeholder="Últimos 4 dígitos de la referencia"
                    className="h-8 text-xs"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Resumen */}
            {monto && (
              <div className={`p-4 rounded-xl border ${tipo === "ingreso" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {tipo === "ingreso" ? "Total a registrar" : "Total a descontar"}
                  </span>
                  <span className={`text-xl font-bold ${tipo === "ingreso" ? "text-emerald-400" : "text-red-400"}`}>
                    {tipo === "ingreso" ? "+" : "-"}${parseFloat(monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
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
              className={`flex-1 h-10 font-semibold ${
                tipo === "ingreso"
                  ? "veylo-gradient text-white border-0 hover:opacity-90"
                  : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {tipo === "ingreso" ? "Registrar ingreso" : "Registrar egreso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
