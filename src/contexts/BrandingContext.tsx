'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Branding {
  logoUrl: string | null;
  primaryHex: string;
  negocioNombre: string;
}

const DEFAULT_BRANDING: Branding = {
  logoUrl: null,
  primaryHex: '#7C3AED',
  negocioNombre: 'Mi Barbería',
};

const STORAGE_KEY = 'veylo_branding';

interface BrandingContextType {
  branding: Branding;
  updateLogo: (url: string | null) => void;
  updateColor: (hex: string) => void;
  updateNombre: (nombre: string) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hsl(h: number, s: number, l: number, a?: number): string {
  return a !== undefined
    ? `hsl(${h} ${s}% ${l}% / ${a}%)`
    : `hsl(${h} ${s}% ${l}%)`;
}

function applyBrandColor(hex: string) {
  if (typeof window === 'undefined') return;
  const { h, s, l } = hexToHsl(hex);
  const root = document.documentElement;

  root.style.setProperty('--primary', hsl(h, s, l));
  root.style.setProperty('--ring', hsl(h, s, l));
  root.style.setProperty('--sidebar-primary', hsl(h, s, l));
  root.style.setProperty('--sidebar-ring', hsl(h, s, l));
  root.style.setProperty('--accent-foreground', hsl(h, s, l));
  root.style.setProperty('--chart-1', hsl(h, s, l));
  root.style.setProperty('--veylo-primary', hsl(h, s, l));
  root.style.setProperty('--veylo-primary-light', hsl(h, s, Math.min(l + 14, 88)));
  root.style.setProperty('--veylo-primary-dark', hsl(h, s, Math.max(l - 14, 18)));
  root.style.setProperty('--veylo-glow', hsl(h, s, l, 30));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Branding = JSON.parse(stored);
        setBranding(parsed);
        applyBrandColor(parsed.primaryHex);
      } else {
        applyBrandColor(DEFAULT_BRANDING.primaryHex);
      }
    } catch {
      applyBrandColor(DEFAULT_BRANDING.primaryHex);
    }
  }, []);

  const persist = useCallback((next: Branding) => {
    setBranding(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateLogo = useCallback((url: string | null) => {
    setBranding(prev => {
      const next = { ...prev, logoUrl: url };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateColor = useCallback((hex: string) => {
    applyBrandColor(hex);
    setBranding(prev => {
      const next = { ...prev, primaryHex: hex };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateNombre = useCallback((nombre: string) => {
    setBranding(prev => {
      const next = { ...prev, negocioNombre: nombre };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [persist]);

  return (
    <BrandingContext.Provider value={{ branding, updateLogo, updateColor, updateNombre }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding debe usarse dentro de BrandingProvider');
  return ctx;
}
