"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CloudStatus from "./cloud/CloudStatus";

const grupos = [
  {
    titulo: "Inicio",
    enlaces: [
      {
        href: "/",
        icono: "⌂",
        etiqueta: "Dashboard",
      },
    ],
  },
  {
    titulo: "Ventas",
    enlaces: [
      {
        href: "/presupuestos",
        icono: "▤",
        etiqueta: "Presupuestos",
      },
      {
        href: "/pedidos",
        icono: "▣",
        etiqueta: "Pedidos",
      },
      {
        href: "/clientes",
        icono: "◎",
        etiqueta: "Clientes",
      },
    ],
  },
  {
    titulo: "Producción",
    enlaces: [
      {
        href: "/productos",
        icono: "◇",
        etiqueta: "Productos",
      },
      {
        href: "/produccion",
        icono: "▦",
        etiqueta: "Producción",
      },
      {
        href: "/stock",
        icono: "◉",
        etiqueta: "Stock",
      },
      {
        href: "/compras",
        icono: "⊕",
        etiqueta: "Compras",
      },
    ],
  },
  {
    titulo: "Negocio",
    enlaces: [
      {
        href: "/finanzas",
        icono: "$",
        etiqueta: "Caja y finanzas",
      },
      {
        href: "/taller",
        icono: "☁",
        etiqueta: "Taller y nube",
      },
      {
        href: "/configuracion",
        icono: "⚙",
        etiqueta: "Configuración",
      },
    ],
  },
];

function enlaceActivo(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#810404] text-white lg:flex lg:flex-col">
      <header className="border-b border-white/10 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-200">
          Ryuka
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Manager
        </h1>

        <p className="mt-2 text-xs leading-5 text-red-100/75">
          Diseñado para quienes imprimen ideas.
        </p>
      </header>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <section key={grupo.titulo}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200/75">
                {grupo.titulo}
              </p>

              <div className="space-y-1">
                {grupo.enlaces.map((enlace) => {
                  const activo = enlaceActivo(pathname, enlace.href);

                  return (
                    <Link
                      key={enlace.href}
                      href={enlace.href}
                      aria-current={activo ? "page" : undefined}
                      className={[
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        activo
                          ? "bg-white text-[#810404] shadow-sm"
                          : "text-white/85 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm",
                          activo
                            ? "bg-[#810404]/10"
                            : "bg-black/10 text-red-100",
                        ].join(" ")}
                      >
                        {enlace.icono}
                      </span>

                      <span>{enlace.etiqueta}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <footer className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/15 bg-black/10 p-4">
          <CloudStatus />

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
            Ryuka Manager
          </p>

          <p className="mt-1 text-xs leading-5 text-red-100/75">
            Presupuestos, producción y crecimiento en un solo lugar.
          </p>
        </div>
      </footer>
    </aside>
  );
}