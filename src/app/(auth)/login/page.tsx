"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { Eye, EyeOff, Scissors, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo oscuro con gradiente */}
        <div className="absolute inset-0 bg-[oklch(0.09_0.020_285)]" />
        <div className="absolute inset-0 veylo-gradient opacity-10" />

        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.96 0.005 285) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Círculos decorativos */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.255 293), transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.62 0.255 293), transparent 70%)" }} />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/images/logo.png"
              alt="Veylo"
              width={160}
              height={52}
              priority
              className="object-contain brightness-0 invert opacity-90"
            />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
            Gestión profesional<br />
            <span className="text-[oklch(0.72_0.22_293)]">para tu barbería</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-sm">
            Turnos, clientes, caja, stock y reportes en una sola plataforma. Simple, rápido y pensado para el día a día.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              "Agenda de turnos en tiempo real",
              "Control de caja y ventas",
              "Gestión de clientes y fidelización",
              "Reportes y métricas del negocio",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.255_293)] shrink-0" />
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>

          {/* Badge */}
          <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-[oklch(0.62_0.255_293/30%)] bg-[oklch(0.62_0.255_293/8%)] px-4 py-2 w-fit">
            <Scissors className="w-3.5 h-3.5 text-[oklch(0.72_0.22_293)]" />
            <span className="text-xs text-[oklch(0.72_0.22_293)] font-medium">
              Diseñado para barberías reales
            </span>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/images/logo.png"
              alt="Veylo"
              width={130}
              height={42}
              priority
              className="object-contain brightness-0 invert opacity-90"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1.5">
              Bienvenido de vuelta
            </h1>
            <p className="text-muted-foreground text-sm">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          <Card className="border-border/50 bg-card shadow-xl shadow-black/20">
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@mibarberia.com"
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary focus-visible:ring-primary/30"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary focus-visible:ring-primary/30"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold h-10 veylo-gradient text-white border-0 hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Ingresando...
                    </span>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿Necesitás una cuenta?{" "}
            <Link href="/contacto" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Contactá al administrador
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Veylo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
