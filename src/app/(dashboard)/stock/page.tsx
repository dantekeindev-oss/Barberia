"use client";

import { useState, useEffect, useCallback } from "react";
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
  Wrench,
  FlaskConical,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getProductos, getMovimientosStock, getInsumosServicio } from "@/lib/api";
import type { Producto, InsumoServicio } from "@/lib/api";
import { MovimientoStockModal } from "@/components/modals/MovimientoStockModal";
import { ProductoModal } from "@/components/modals/ProductoModal";
import { ProveedorModal } from "@/components/modals/ProveedorModal";

export default function StockPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [insumosServicio, setInsumosServicio] = useState<InsumoServicio[]>([]);

  const [tab, setTab] = useState("productos");
  const [tipo, setTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Movimiento stock modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"entrada" | "salida">("entrada");
  const [productoModal, setProductoModal] = useState<Producto | null>(null);

  // Producto modal
  const [productoModalOpen, setProductoModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);

  // Proveedor modal
  const [proveedorModalOpen, setProveedorModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token || !user?.negocio?.id) return;
    try {
      setLoading(true);
      const [productosData, movimientosData, insumosData] = await Promise.all([
        getProductos(token),
        getMovimientosStock(token),
        getInsumosServicio(token),
      ]);
      setProductos(productosData);
      setMovimientos(movimientosData as any[]);
      setInsumosServicio(insumosData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos de stock");
    } finally {
      setLoading(false);
    }
  }, [token, user?.negocio?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openModal(tipo: "entrada" | "salida", producto?: Producto) {
    setModalTipo(tipo);
    setProductoModal(producto ?? null);
    setModalOpen(true);
  }

  const bajoStock = productos.filter((p) => p.stockActual <= (p.stockMinimo || 0));
  const soloInsumos = productos.filter((p) => p.tipo === "insumo");
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
    return <div className="text-center text-destructive py-12">{error}</div>;
  }

  return (
    <>
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
                <p className="text-[11px] text-muted-foreground">Total ítems</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bajoStock.length > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                <AlertTriangle className={`w-4 h-4 ${bajoStock.length > 0 ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${bajoStock.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>{bajoStock.length}</p>
                <p className="text-[11px] text-muted-foreground">Alertas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-violet-400">{soloInsumos.length}</p>
                <p className="text-[11px] text-muted-foreground">Insumos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">${(totalValor / 1000).toFixed(1)}k</p>
                <p className="text-[11px] text-muted-foreground">Valor inventario</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta bajo stock */}
        {bajoStock.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-400">Stock bajo en {bajoStock.length} ítems</p>
                <p className="text-xs text-amber-400/70 mt-0.5">{bajoStock.map((p) => p.nombre).join(" · ")}</p>
              </div>
              <Button size="sm" className="text-xs h-8 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 shrink-0" disabled title="Próximamente">
                <Truck className="w-3.5 h-3.5 mr-1.5" />
                Generar pedido
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs + Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-9">
              <TabsTrigger value="productos" className="text-xs px-4">Productos</TabsTrigger>
              <TabsTrigger value="insumos" className="text-xs px-4">Insumos</TabsTrigger>
              <TabsTrigger value="movimientos" className="text-xs px-4">Movimientos</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "productos" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 h-9 text-xs bg-muted/50 border-border/50 w-48"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <Tabs value={tipo} onValueChange={setTipo}>
                <TabsList className="h-9">
                  <TabsTrigger value="todos" className="text-xs px-3">Todos</TabsTrigger>
                  <TabsTrigger value="insumo" className="text-xs px-3">Insumos</TabsTrigger>
                  <TabsTrigger value="venta" className="text-xs px-3">Venta</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button size="sm" variant="outline" className="h-9 text-xs border-border/50" onClick={() => setProveedorModalOpen(true)}>
                <Truck className="w-3.5 h-3.5 mr-1.5" />
                Proveedor
              </Button>
              <Button size="sm" className="h-9 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold" onClick={() => { setProductoEditar(null); setProductoModalOpen(true); }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Producto
              </Button>
            </div>
          )}

          {tab === "movimientos" && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-9 text-xs border-border/50" onClick={() => openModal("entrada")}>
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Registrar entrada
              </Button>
              <Button size="sm" variant="outline" className="h-9 text-xs border-border/50" onClick={() => openModal("salida")}>
                <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                Registrar salida
              </Button>
            </div>
          )}
        </div>

        {/* ── Tab: Productos ── */}
        {tab === "productos" && (
          <Card className="border-border/50 bg-card overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border/50 bg-card sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Producto</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Tipo</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Stock</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Mínimo</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Costo</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">P. venta</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden xl:table-cell">Proveedor</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No se encontraron productos</td></tr>
                  ) : (
                    filtrados.map((p) => {
                      const alerta = p.stockActual <= (p.stockMinimo || 0);
                      return (
                        <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${alerta ? "bg-amber-400" : "bg-emerald-400"}`} />
                              <span className="font-medium text-foreground">{p.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge variant="outline" className={`text-[10px] px-2 ${p.tipo === "venta" ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "bg-violet-500/15 text-violet-400 border-violet-500/30"}`}>
                              {p.tipo === "venta" ? "Venta" : "Insumo"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${alerta ? "text-amber-400" : "text-foreground"}`}>{p.stockActual}</span>
                            {alerta && <AlertTriangle className="w-3 h-3 text-amber-400 inline ml-1" />}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{p.stockMinimo || 0}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">${(p.costoCompra ?? 0).toLocaleString("es-AR")}</td>
                          <td className="px-4 py-3 text-right hidden lg:table-cell">
                            {p.precioVenta ? (
                              <span className="font-medium text-foreground">${p.precioVenta.toLocaleString("es-AR")}</span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">{p.proveedor?.nombre ?? "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => openModal("entrada", p)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                              >
                                + Entrada
                              </button>
                              <button
                                onClick={() => openModal("salida", p)}
                                className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                              >
                                − Salida
                              </button>
                              <button
                                onClick={() => { setProductoEditar(p); setProductoModalOpen(true); }}
                                className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-1 rounded bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <Edit className="w-3 h-3" />
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

        {/* ── Tab: Insumos ── */}
        {tab === "insumos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {soloInsumos.length} insumos · {soloInsumos.filter(i => i.stockActual <= (i.stockMinimo ?? 0)).length} con stock bajo
              </p>
              <Button size="sm" className="h-8 veylo-gradient text-white border-0 hover:opacity-90 text-xs font-semibold" onClick={() => openModal("entrada")}>
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
                Registrar entrada
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {soloInsumos.map((insumo) => {
                const alerta = insumo.stockActual <= (insumo.stockMinimo ?? 0);
                const ratio = insumo.stockMinimo
                  ? Math.min(insumo.stockActual / (insumo.stockMinimo * 2), 1)
                  : 1;
                const barColor = alerta
                  ? "bg-red-500"
                  : ratio < 0.6
                  ? "bg-amber-400"
                  : "bg-emerald-500";

                const serviciosLinked = insumosServicio.filter(
                  (is) => is.productoId === insumo.id && is.servicio,
                );

                return (
                  <Card
                    key={insumo.id}
                    className={`border bg-card transition-colors ${alerta ? "border-amber-500/30" : "border-border/50"}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alerta ? "bg-amber-500/10" : "bg-violet-500/10"}`}>
                          <FlaskConical className={`w-4 h-4 ${alerta ? "text-amber-400" : "text-violet-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">{insumo.nombre}</p>
                          {insumo.proveedor && (
                            <p className="text-[10px] text-muted-foreground truncate">{insumo.proveedor.nombre}</p>
                          )}
                        </div>
                        {alerta && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] shrink-0">
                            Bajo stock
                          </Badge>
                        )}
                      </div>

                      {/* Stock bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Stock actual</span>
                          <span className={`font-bold ${alerta ? "text-amber-400" : "text-foreground"}`}>
                            {insumo.stockActual} / {insumo.stockMinimo ?? 0} {insumo.unidad}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${Math.max(ratio * 100, 4)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Mínimo: {insumo.stockMinimo ?? 0} {insumo.unidad}
                        </p>
                      </div>

                      {/* Servicios que lo usan */}
                      {serviciosLinked.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Usado en</p>
                          <div className="flex flex-wrap gap-1.5">
                            {serviciosLinked.map((is) => (
                              <div
                                key={is.id}
                                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-muted/20"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: is.servicio?.colorAgenda }}
                                />
                                <span className="text-foreground/80">{is.servicio?.nombre}</span>
                                <span className="text-muted-foreground">·{is.cantidadPorServicio} {is.unidad}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-1.5 pt-1">
                        <button
                          onClick={() => openModal("entrada", insumo)}
                          className="flex-1 text-[11px] font-medium text-emerald-400 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <ArrowUpCircle className="w-3 h-3" />
                          Entrada
                        </button>
                        <button
                          onClick={() => openModal("salida", insumo)}
                          className="flex-1 text-[11px] font-medium text-red-400 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <ArrowDownCircle className="w-3 h-3" />
                          Uso
                        </button>
                        <button className="text-[11px] font-medium text-muted-foreground py-1.5 px-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Movimientos ── */}
        {tab === "movimientos" && (
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 px-5 pt-4">
              <CardTitle className="text-sm font-semibold">Historial de movimientos</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-1">
              {movimientos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay movimientos registrados</p>
              ) : (
                [...movimientos].reverse().map((m, i) => (
                  <div key={m.id}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.tipo === "entrada" ? "bg-emerald-500/15" : m.tipo === "ajuste" ? "bg-blue-500/15" : "bg-red-500/15"}`}>
                        {m.tipo === "entrada" ? (
                          <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : m.tipo === "ajuste" ? (
                          <Package className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <ArrowDownCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {m.producto?.nombre ?? "Producto desconocido"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.motivo} · {new Date(m.fecha ?? m.createdAt).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${m.tipo === "entrada" ? "text-emerald-400" : m.tipo === "ajuste" ? "text-blue-400" : "text-red-400"}`}>
                        {m.tipo === "entrada" ? "+" : m.tipo === "ajuste" ? "=" : "−"}
                        {m.cantidad}{" "}
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {m.producto?.unidad ?? "u."}
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

      <MovimientoStockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
        tipo={modalTipo}
        productos={productos}
        productoPreseleccionado={productoModal}
      />

      <ProductoModal
        open={productoModalOpen}
        onClose={() => setProductoModalOpen(false)}
        onSuccess={() => { setProductoModalOpen(false); fetchData(); }}
        producto={productoEditar}
      />

      <ProveedorModal
        open={proveedorModalOpen}
        onClose={() => setProveedorModalOpen(false)}
        onSuccess={() => { setProveedorModalOpen(false); fetchData(); }}
      />
    </>
  );
}
