"use client";

import { Search, Menu, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificacionesPanel } from "@/components/layout/NotificacionesPanel";

interface TopbarProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export function Topbar({ onMenuToggle, pageTitle }: TopbarProps) {
  const { user, logout } = useAuth();

  const initials = user?.nombre
    ? user.nombre.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center gap-4 px-4 lg:px-6 shrink-0 sticky top-0 z-20">
      <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </Button>

      {pageTitle && (
        <h1 className="text-base font-semibold text-foreground hidden sm:block">{pageTitle}</h1>
      )}

      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, turno..."
            className="pl-9 h-9 bg-muted/50 border-border/50 text-sm focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NotificacionesPanel />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors" />
            }
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-none">{user?.nombre || "Admin"}</p>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                {user?.rol === "ADMIN" ? "Administrador" : user?.rol === "BARBERO" ? "Barbero" : "Recepcionista"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="text-sm" onClick={() => window.location.href = "/configuracion"}>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-destructive focus:text-destructive" onClick={logout}>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
