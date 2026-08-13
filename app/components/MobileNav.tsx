"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const enlaces = [
  ["/", "📊", "Inicio"],
  ["/pedidos", "📋", "Pedidos"],
  ["/produccion", "🖨", "Producción"],
  ["/finanzas", "💰", "Caja"],
] as const;

const menuCompleto = [
  ["/", "📊", "Inicio"],
  ["/presupuestos", "📄", "Presupuestos"],
  ["/productos", "📦", "Productos"],
  ["/stock", "🧵", "Stock"],
  ["/compras", "🛒", "Compras"],
  ["/produccion", "🖨", "Producción"],
  ["/pedidos", "📋", "Pedidos"],
  ["/finanzas", "💰", "Caja"],
  ["/ferias", "🎪", "Ferias"],
  ["/clientes", "👥", "Clientes"],
  ["/taller", "☁", "Taller y nube"],
  ["/configuracion", "⚙", "Configuración"],
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#810404] px-4 py-3 text-white shadow-lg lg:hidden">
        <Link href="/" className="leading-none" aria-label="Ir al inicio de Ryuka Manager">
          <strong className="text-lg tracking-wide">RYUKA</strong>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-red-200">
            Manager
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={abierto}
          className="min-h-11 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold"
        >
          ☰ Menú
        </button>
      </header>

      <nav
        aria-label="Navegación principal móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#151515]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {enlaces.map(([href, icono, label]) => {
            const activo =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-semibold transition active:scale-95 ${
                  activo
                    ? "bg-[#810404] text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {icono}
                </span>
                <span className="mt-1 truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-3 backdrop-blur-sm lg:hidden"
          onClick={() => setAbierto(false)}
          role="presentation"
        >
          <nav
            className="ml-auto flex h-full w-[88%] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#181818] shadow-2xl"
            onClick={(evento) => evento.stopPropagation()}
            aria-label="Menú completo"
          >
            <div className="flex items-center justify-between bg-[#810404] px-5 py-5">
              <div>
                <strong className="text-2xl">RYUKA</strong>
                <p className="text-[10px] uppercase tracking-[0.18em] text-red-200">
                  Manager
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar menú"
                className="min-h-11 min-w-11 rounded-xl border border-white/20 px-3 py-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 overscroll-contain">
              <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                Secciones
              </p>

              <div className="grid gap-1.5">
                {menuCompleto.map(([href, icono, label]) => {
                  const activo =
                    href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setAbierto(false)}
                      aria-current={activo ? "page" : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition active:scale-[0.99] ${
                        activo
                          ? "bg-white/10 text-white"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span className="w-6 text-center text-lg" aria-hidden="true">
                        {icono}
                      </span>
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
