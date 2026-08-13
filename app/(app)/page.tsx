"use client";

import Link from "next/link";
import StatCard from "@/app/components/StatCard";
import useDashboard from "@/app/hooks/useDashboard";

const accionesRapidas = [
  {
    titulo: "Nuevo presupuesto",
    descripcion:
      "Calculá precio, tiempos y ganancia.",
    href: "/presupuestos",
    icono: "＋",
  },
  {
    titulo: "Nuevo producto",
    descripcion:
      "Guardá una configuración reutilizable.",
    href: "/productos",
    icono: "📦",
  },
  {
    titulo: "Ver producción",
    descripcion:
      "Próximamente: pedidos y tiempos.",
    href: "#produccion",
    icono: "🏭",
  },
];

const prioridades = [
  {
    titulo: "Revisar próximos pedidos",
    detalle:
      "Confirmá tiempos y materiales antes de aceptar nuevas entregas.",
    estado: "Hoy",
  },
  {
    titulo: "Controlar filamento negro",
    detalle:
      "El módulo de stock va a avisar cuánto queda y qué comprar.",
    estado: "Próximamente",
  },
  {
    titulo: "Definir objetivo mensual",
    detalle:
      "Vamos a conectar sueldo, reinversión y ganancia real.",
    estado: "Siguiente etapa",
  },
];

const formatearDinero = (
  valor: number
) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);

export default function Home() {
  const { cargando, metricas } =
    useDashboard();

  const {
    cantidadPresupuestos,
    valorPotencialMayorista,
    gananciaPotencialMayorista,
    presupuestoMasGrande,
  } = metricas;

  const respuestaPresupuestos =
    cantidadPresupuestos === 0
      ? "Todavía no hay presupuestos guardados."
      : cantidadPresupuestos === 1
        ? "Tenés un presupuesto guardado para revisar."
        : `Tenés ${cantidadPresupuestos} presupuestos guardados para revisar.`;

  const respuestaPresupuestoMasGrande =
    presupuestoMasGrande
      ? `${presupuestoMasGrande.cliente || "Cliente sin nombre"} · ${presupuestoMasGrande.productoNombre}`
      : "Todavía no hay un presupuesto para comparar.";

  return (
    <main className="flex min-h-screen bg-[#101010] text-white">

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(129,4,4,0.32),_transparent_42%),#181818] p-7 lg:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-[#810404]/60 bg-[#810404]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
              Ryuka Manager
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Buenos días, Juan y Mili 👋
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 lg:text-lg">
              Acá van a encontrar lo importante
              del emprendimiento: qué necesita
              atención, cuánto están generando y
              cuál debería ser el próximo paso.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/presupuestos"
                className="rounded-2xl bg-[#810404] px-5 py-3 text-sm font-semibold transition hover:bg-[#a00808]"
              >
                Crear presupuesto
              </Link>

              <Link
                href="/productos"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Ver productos
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c66]">
              Estado de Ryuka
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Las preguntas que importan
            </h2>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              pregunta="¿Cuántos presupuestos tenemos?"
              valor={
                cargando
                  ? "..."
                  : String(
                      cantidadPresupuestos
                    )
              }
              respuesta={
                cargando
                  ? "Leyendo datos guardados..."
                  : respuestaPresupuestos
              }
              icono="🧾"
              etiqueta="Dato real"
            />

            <StatCard
              pregunta="¿Cuánto podríamos facturar?"
              valor={
                cargando
                  ? "..."
                  : formatearDinero(
                      valorPotencialMayorista
                    )
              }
              respuesta="Suma del valor mayorista de todos los presupuestos guardados."
              icono="💰"
              etiqueta="Potencial mayorista"
            />

            <StatCard
              pregunta="¿Cuánto podríamos ganar?"
              valor={
                cargando
                  ? "..."
                  : formatearDinero(
                      gananciaPotencialMayorista
                    )
              }
              respuesta="Ganancia mayorista potencial, todavía no confirmada como venta."
              icono="📈"
              etiqueta="Ganancia potencial"
            />

            <StatCard
              pregunta="¿Cuál es el presupuesto más grande?"
              valor={
                cargando
                  ? "..."
                  : presupuestoMasGrande
                    ? formatearDinero(
                        presupuestoMasGrande
                          .precioMayoristaTotal
                      )
                    : "$0"
              }
              respuesta={
                cargando
                  ? "Comparando presupuestos..."
                  : respuestaPresupuestoMasGrande
              }
              icono="🏆"
              etiqueta="Dato real"
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[#181818] p-6 lg:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c66]">
                  Prioridades
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  ¿Qué conviene hacer ahora?
                </h2>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                Vista inicial
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {prioridades.map(
                (prioridad, indice) => (
                  <article
                    key={prioridad.titulo}
                    className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#810404]/20 text-sm font-bold text-red-100">
                      {indice + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">
                          {
                            prioridad.titulo
                          }
                        </h3>

                        <span className="text-xs font-medium text-zinc-500">
                          {
                            prioridad.estado
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        {
                          prioridad.detalle
                        }
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#181818] p-6 lg:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c66]">
              Acciones rápidas
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              ¿Qué querés hacer?
            </h2>

            <div className="mt-6 space-y-3">
              {accionesRapidas.map(
                (accion) => (
                  <Link
                    key={accion.titulo}
                    href={accion.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-[#810404]/70 hover:bg-[#810404]/10"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/5 text-xl">
                      {accion.icono}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {accion.titulo}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {
                          accion.descripcion
                        }
                      </p>
                    </div>

                    <span className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-[#810404]/35 bg-[#810404]/10 p-6 text-center lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
            Primer dato real conectado
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-lg font-medium leading-8 text-zinc-100">
            El dashboard ya lee los presupuestos
            guardados en Ryuka Manager y convierte
            esos datos en respuestas útiles.
          </p>
        </section>
      </section>
    </main>
  );
}
