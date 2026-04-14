"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  AlertTriangle,
  Package,
  PackageCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Truck,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getProductos, getMovimientosStock } from "@/lib/api";
import type { Producto } from "@/lib/api";

export default function StockPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);

  const [tab, setTab] = useState("productos");
  const [tipo, setTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!token || !user?.negocio?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [productosData, movimientosData] = await Promise.all([
          getProductos(token),
          getMovimientosStock(token),
        ]);
        setProductos(productosData);
        setMovimientos(movimientosData);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de stock");
        console.error("Error loading stock:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.negocio?.id]);

  const bajoStock = productos.filter((p) => p.stockActual <= (p.stockMinimo || 0));
  const totalValor = productos.reduce((a, b) => a + b.stockActual * b.costoCompra, 0);

  const filtrados = productos.filter((p) => {
    const matchTipo = tipo === "todos" || p.tipo === tipo;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-12">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Package className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{productos.length}</p>
              <p className="text-[11px] text-muted-foreground">Total productos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                bajoStock.length > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${bajoStock.length > 0 ? "text-amber-400" : "text-emerald-400"}`}
              />
            </div>
            <div>
              <p className={`text-lg font-bold ${bajoStock.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {bajoStock.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Alertas de stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <PackageCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">
                {productos.filter((p) => p.tipo === "venta").length}
              </p>
              <p className="text-[11px] text-muted-foreground">Productos en venta</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-violet-400">
                ${(totalValor / 1000).toFixed(1)}k
              </p>
              <p className="text-[11px] text-muted-foreground">Valor de inventario</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {bajoStock.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">Stock bajo en {bajoStock.length} productos</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                {bajoStock.map((p) => p.nombre).join(" · ")}
              </p>
            </div>
            <Button
              size="sm"
              className="text-xs h-8 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shrink-0"
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Generar pedido
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="productos" className="text-xs px-4">
              Productos
            </TabsTrigger>
            <TabsTrigger value="movimientos" className="text-xs px-4">
              Movimientos
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "productos" && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                className="pl-9 h-9 text-xs bg-muted/50 border-border/50 w-52"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Tabs value={tipo} onValueChange={setTipo}>
              <TabsList className="h-9">
                <TabsTrigger value="todos" className="text-xs px-3">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="insumo" className="text-xs px-3">
                  Insumos
                </TabsTrigger>
                <TabsTrigger value="venta" className="text-xs px-3">
                  Venta
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              className="h-9 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Producto
            </Button>
          </div>
        )}
        {tab === "movimientos" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs border-border/50"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Registrar entrada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs border-border/50"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5 text-red-400" />
              Registrar salida
            </Button>
          </div>
        )}
      </div>

      {tab === "productos" && (
        <Card className="border-border/50 bg-card overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border/50 bg-card sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Producto
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">
                    Tipo
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                    Stock
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">
                    Mínimo
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                    Costo
                  </th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">
                    Precio venta
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell">
                    Proveedor
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => {
                    const alerta = p.stockActual <= (p.stockMinimo || 0);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                alerta ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                            />
                            <span className="font-medium text-foreground">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 ${
                              p.tipo === "venta"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-muted/50 text-muted-foreground border-border"
                            }`}
                          >
                            {p.tipo === "venta" ? "Venta" : "Insumo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${alerta ? "text-amber-400" : "text-foreground"}`}>
                            {p.stockActual}
                          </span>
                          {alerta && <AlertTriangle className="w-3 h-3 text-amber-400 inline ml-1" />}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                          {p.stockMinimo || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                          ${(p.costoCompra ?? 0).toLocaleString("es-AR")}
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell">
                          {p.precioVenta ? (
                            <span className="font-medium text-foreground">
                              ${p.precioVenta.toLocaleString("es-AR")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">
                          {p.proveedor?.nombre ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20">
                              + Entrada
                            </button>
                            <button className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20">
                              - Salida
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "movimientos" && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-3 px-5 pt-4">
            <CardTitle className="text-sm font-semibold">Últimos movimientos</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-1">
            {movimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay movimientos registrados
              </p>
            ) : (
              movimientos.map((m, i) => (
                <div key={m.id}>
                  <div className="flex items-center gap-3 py-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        m.tipo === "entrada" ? "bg-emerald-500/15" : "bg-red-500/15"
                      }`}
                    >
                      {m.tipo === "entrada" ? (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {m.producto?.nombre || "Producto"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.motivo} · {new Date(m.fecha).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ${
                        m.tipo === "entrada" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {m.tipo === "entrada" ? "+" : "-"}
                      {m.cantidad}{" "}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {m.producto?.unidad || "unid."}
                      </span>
                    </span>
                  </div>
                  {i < movimientos.length - 1 && <Separator className="opacity-30" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
