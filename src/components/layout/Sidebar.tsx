"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  Wallet,
  Package,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useBranding } from "@/contexts/BrandingContext";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/turnos", label: "Turnos", icon: CalendarDays },
      { href: "/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    section: "Gestión",
    items: [
      { href: "/empleados", label: "Empleados", icon: UserCheck },
      { href: "/caja", label: "Caja", icon: Wallet },
      { href: "/stock", label: "Stock", icon: Package },
    ],
  },
  {
    section: "Crecimiento",
    items: [
      { href: "/fidelizacion", label: "Fidelización", icon: Star },
      { href: "/reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { branding } = useBranding();
  const { logout } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const navLinkClass = (href: string, isCollapsed: boolean) =>
    cn(
      "flex items-center rounded-lg transition-all duration-150",
      isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5",
      isActive(href)
        ? "bg-primary/15 text-primary"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-sidebar-border px-4 shrink-0",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        {collapsed ? (
          branding.logoUrl ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-sidebar-accent flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg veylo-gradient flex items-center justify-center shrink-0">
              <Scissors className="w-4 h-4 text-white" />
            </div>
          )
        ) : branding.logoUrl ? (
          <>
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-sidebar-accent flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">
                {branding.negocioNombre}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">Sistema de gestión</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col min-w-0">
            <Image
              src="/images/logo.png"
              alt="Veylo"
              width={90}
              height={28}
              className="object-contain brightness-0 invert opacity-90"
            />
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
              {branding.negocioNombre}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden py-4 px-2 space-y-5">
        {navItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-2 mb-1.5">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);

                if (collapsed) {
                  return (
                    <li key={href}>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={href}
                              className={navLinkClass(href, true)}
                            />
                          }
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return (
                  <li key={href}>
                    <Link href={href} className={navLinkClass(href, false)}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!collapsed && <Separator className="mt-4 opacity-30" />}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border py-3 px-2 space-y-0.5 shrink-0">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/configuracion"
                  className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                />
              }
            >
              <Settings className="w-5 h-5 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Configuración
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
        )}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger onClick={logout} className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all text-destructive/70 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-5 h-5 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Cerrar sesión
            </TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-destructive/70 hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        )}
      </div>
    </aside>
  );
}
