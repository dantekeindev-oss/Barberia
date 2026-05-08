"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, CalendarDays, Package, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { getProductosBajoStock, getProximosTurnos } from "@/lib/api";

interface Notificacion {
  id: string;
  tipo: "stock" | "turno" | "sistema";
  titulo: string;
  descripcion: string;
  leida: boolean;
}

export function NotificacionesPanel() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getProductosBajoStock(token).catch(() => []),
      getProximosTurnos(token, 5).catch(() => []),
    ]).then(([bajoStock, proximosTurnos]) => {
      const nuevas: Notificacion[] = [];

      bajoStock.forEach((p) => {
        nuevas.push({
          id: `stock-${p.id}`,
          tipo: "stock",
          titulo: "Stock bajo",
          descripcion: `${p.nombre}: ${p.stockActual} ${p.unidad} (mín. ${p.stockMinimo})`,
          leida: false,
        });
      });

      proximosTurnos.slice(0, 3).forEach((t) => {
        const hora = new Date(t.fechaInicio).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        nuevas.push({
          id: `turno-${t.id}`,
          tipo: "turno",
          titulo: "Próximo turno",
          descripcion: `${t.cliente?.nombre} · ${hora} · ${t.empleado?.nombre}`,
          leida: false,
        });
      });

      setNotifs(nuevas);
    });
  }, [token]);

  function marcarLeida(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  function marcarTodasLeidas() {
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  const sinLeer = notifs.filter((n) => !n.leida).length;

  const iconoPorTipo = {
    stock: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    turno: <CalendarDays className="w-3.5 h-3.5 text-blue-400" />,
    sistema: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors" />
        }
      >
        <Bell className="w-4 h-4" />
        {sinLeer > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white">
            {sinLeer > 9 ? "9+" : sinLeer}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-border/50 bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">Notificaciones</span>
            {sinLeer > 0 && (
              <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                {sinLeer} nuevas
              </span>
            )}
          </div>
          {sinLeer > 0 && (
            <button
              onClick={marcarTodasLeidas}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Package className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/20 transition-colors ${n.leida ? "opacity-50" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                  {iconoPorTipo[n.tipo]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{n.titulo}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{n.descripcion}</p>
                </div>
                {!n.leida && (
                  <button
                    onClick={() => marcarLeida(n.id)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {notifs.length > 0 && (
          <div className="px-4 py-3">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs border-border/50">
              Ver todo
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
