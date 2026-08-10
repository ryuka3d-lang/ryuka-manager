"use client";
import Link from "next/link";
import { useState } from "react";

const enlaces = [
  ["/", "📊 Dashboard"], ["/presupuestos", "📄 Presupuestos"], ["/productos", "📦 Productos"], ["/pedidos", "📋 Pedidos"], ["/produccion", "🖨 Producción"], ["/stock", "🧵 Stock"], ["/compras", "🛒 Compras"], ["/ferias", "🎪 Ferias"], ["/clientes", "👥 Clientes"], ["/finanzas", "💰 Caja"], ["/taller", "☁ Taller y nube"], ["/configuracion", "⚙ Configuración"]
];
export default function MobileNav() {
  const [abierto, setAbierto] = useState(false);
  return <><header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#810404] px-4 py-3 text-white lg:hidden"><div><strong className="text-xl">RYUKA</strong><p className="text-[10px] text-red-200">Manager</p></div><button onClick={() => setAbierto(true)} className="rounded-xl border border-white/20 px-4 py-2">☰ Menú</button></header>{abierto && <div className="fixed inset-0 z-50 bg-black/80 p-4 lg:hidden" onClick={() => setAbierto(false)}><nav className="ml-auto h-full w-[85%] max-w-sm overflow-y-auto rounded-3xl bg-[#810404] p-5" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><strong className="text-2xl">RYUKA</strong><button onClick={() => setAbierto(false)} className="rounded-lg border border-white/20 px-3 py-2">✕</button></div><div className="mt-6 flex flex-col gap-2">{enlaces.map(([href, label]) => <Link key={href} href={href} onClick={() => setAbierto(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-white/10">{label}</Link>)}</div></nav></div>}</>;
}
