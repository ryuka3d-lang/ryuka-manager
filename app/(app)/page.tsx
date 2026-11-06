"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import useDashboard from "@/app/hooks/useDashboard";

const accionesRapidas = [
  {
    titulo: "Nuevo presupuesto",
    descripcion: "Calculá precio, tiempos y ganancia.",
    href: "/presupuestos",
    icono: "📄",
  },
  {
    titulo: "Nuevo producto",
    descripcion: "Guardá una configuración reutilizable.",
    href: "/productos",
    icono: "📦",
  },
  {
    titulo: "Ver Caja y Finanzas",
    descripcion: "Controlá ingresos, egresos y reservas.",
    href: "/finanzas",
    icono: "💰",
  },
];

const formatearDinero = (valor: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);

export default function Home() {
  const {
    cargando,
    facturacionMes,
    gananciaNetaMes,
    pedidosCompletados,
    ticketPromedio,
    historial6Meses,
    topProductos,
    prioridades,
  } = useDashboard();

  return (
    <main className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="min-w-0 flex-1 p-6 lg:p-10">
        {/* HEADER */}
        <header className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top_right,_rgba(129,4,4,0.32),_transparent_42%),#181818] p-7 lg:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-[var(--accent)]/60 bg-[var(--accent)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
              Ryuka Manager
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Buenos días, Juan y Mili 👋
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] lg:text-lg">
              Acá tenés el resumen real de tu emprendimiento: facturación, ganancias y lo que necesita atención hoy.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/presupuestos"
                className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--accent-hover)]"
              >
                Crear presupuesto
              </Link>
              <Link
                href="/finanzas"
                className="rounded-2xl border border-[var(--border)] bg-[var(--overlay)] px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Ver Caja
              </Link>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
              Resumen del mes
            </p>
            <h2 className="mt-2 text-2xl font-bold">Métricas clave</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              titulo="Facturación"
              valor={cargando ? "..." : formatearDinero(facturacionMes)}
              subtitulo="Ingresos totales este mes"
              icono="💰"
              color="text-emerald-300"
            />
            <KpiCard
              titulo="Ganancia Neta"
              valor={cargando ? "..." : formatearDinero(gananciaNetaMes)}
              subtitulo="Ingresos menos egresos"
              icono="📈"
              color="text-[var(--text)]"
            />
            <KpiCard
              titulo="Pedidos Cobrados"
              valor={cargando ? "..." : String(pedidosCompletados)}
              subtitulo="Transacciones este mes"
              icono="📦"
              color="text-blue-300"
            />
            <KpiCard
              titulo="Ticket Promedio"
              valor={cargando ? "..." : formatearDinero(ticketPromedio)}
              subtitulo="Valor promedio por cobro"
              icono="🎯"
              color="text-amber-300"
            />
          </div>
        </section>

        {/* GRÁFICOS Y PRIORIDADES */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Gráfico de Ingresos vs Egresos */}
          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                  Tendencia
                </p>
                <h2 className="mt-2 text-2xl font-bold">Ingresos vs Egresos</h2>
              </div>
            </div>

            <div className="mt-6 h-80 w-full">
              {cargando ? (
                <div className="flex h-full items-center justify-center text-[var(--muted)]">
                  Cargando datos...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historial6Meses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="mes" 
                      stroke="var(--muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="var(--muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--card)", 
                        borderColor: "var(--border)", 
                        borderRadius: "12px",
                        color: "var(--text)"
                      }}
                      formatter={(value: any) => [formatearDinero(Number(value)), ""]}
                    />
                    <Legend />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Prioridades y Top Productos */}
          <div className="space-y-6">
            {/* Prioridades Dinámicas */}
            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                Atención
              </p>
              <h2 className="mt-2 text-2xl font-bold">¿Qué conviene hacer ahora?</h2>

              <div className="mt-6 space-y-3">
                {cargando ? (
                  <p className="text-sm text-[var(--muted)]">Cargando...</p>
                ) : (
                  prioridades.map((prioridad, indice) => (
                    <article
                      key={prioridad.titulo}
                      className={`flex gap-4 rounded-2xl border p-4 ${
                        prioridad.estado === "urgente"
                          ? "border-red-900/50 bg-red-950/20"
                          : prioridad.estado === "atencion"
                          ? "border-amber-900/50 bg-amber-950/20"
                          : "border-emerald-900/50 bg-emerald-950/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{prioridad.titulo}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                          {prioridad.detalle}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* Top Productos */}
            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                Ranking
              </p>
              <h2 className="mt-2 text-2xl font-bold">Top Productos</h2>

              <div className="mt-6 space-y-3">
                {cargando ? (
                  <p className="text-sm text-[var(--muted)]">Cargando...</p>
                ) : topProductos.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Aún no hay datos de ventas.</p>
                ) : (
                  topProductos.map((prod, i) => (
                    <div
                      key={prod.nombre}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--field)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)]/20 text-sm font-bold text-[var(--accent-text)]">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{prod.nombre}</p>
                          <p className="text-xs text-[var(--muted)]">{prod.cantidad} unidades</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-300">
                        {formatearDinero(prod.total)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Acceso directo
          </p>
          <h2 className="mt-2 text-2xl font-bold">¿Qué querés hacer?</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {accionesRapidas.map((accion) => (
              <Link
                key={accion.titulo}
                href={accion.href}
                className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--field)] p-5 transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--overlay)] text-2xl">
                  {accion.icono}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{accion.titulo}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{accion.descripcion}</p>
                </div>
                <span className="mt-1 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--text)]">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function KpiCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color,
}: {
  titulo: string;
  valor: string;
  subtitulo: string;
  icono: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--accent)]/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--muted)]">{titulo}</p>
        <span className="text-2xl">{icono}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${color}`}>{valor}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtitulo}</p>
    </article>
  );
}