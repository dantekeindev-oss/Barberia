"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/turnos": "Agenda de Turnos",
  "/clientes": "Clientes",
  "/empleados": "Empleados",
  "/caja": "Caja y Ventas",
  "/stock": "Stock e Inventario",
  "/fidelizacion": "Fidelización",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = pageTitles[pathname] ?? "Veylo";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex flex-col">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full z-50 flex flex-col">
            <Sidebar collapsed={false} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          pageTitle={pageTitle}
          onMenuToggle={() => setMobileOpen((v) => !v)}
        />

        {/* Botón colapsar sidebar (desktop) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 w-5 h-10 items-center justify-center rounded-r-md bg-sidebar-border hover:bg-primary/20 transition-colors text-muted-foreground hover:text-primary"
          style={{ left: collapsed ? "64px" : "240px" }}
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`transition-transform ${collapsed ? "" : "rotate-180"}`}
          >
            <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
