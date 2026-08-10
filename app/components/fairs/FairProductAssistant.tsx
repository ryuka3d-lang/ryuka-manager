"use client";

import { useMemo, useState } from "react";

import type { ProductoGuardado } from "@/lib/product-service";
import {
  obtenerIdeasFeria,
  recomendarCatalogo,
  urlBusqueda,
} from "@/lib/fair-recommendations";

type Props = {
  tipo: string;
  publicoEstimado: number;
  productos: ProductoGuardado[];
};

export default function FairProductAssistant({
  tipo,
  publicoEstimado,
  productos,
}: Props) {
  const ideas = useMemo(
    () => obtenerIdeasFeria(tipo),
    [tipo]
  );

  const catalogo = useMemo(
    () => recomendarCatalogo(tipo, productos),
    [tipo, productos]
  );

  const [ideaSeleccionada, setIdeaSeleccionada] =
    useState(0);

  const [busquedaPersonalizada, setBusquedaPersonalizada] =
    useState("");

  const idea =
    ideas[
      Math.min(
        ideaSeleccionada,
        Math.max(0, ideas.length - 1)
      )
    ];

  const terminoActual =
    busquedaPersonalizada.trim() ||
    idea?.busquedas[0] ||
    "";

  if (!tipo) {
    return (
      <section className="mt-6 rounded-2xl border border-dashed border-[#343434] bg-[#171717] p-6 text-center">
        <p className="font-semibold text-zinc-300">
          Elegí el tipo de feria para activar el asistente.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Ryuka va a cruzar el público del evento con tu catálogo
          y te va a preparar ideas para buscar nuevos modelos.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
            Asistente de productos
          </p>

          <h2 className="mt-1 text-xl font-bold">
            ¿Qué conviene llevar?
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {tipo}
            {publicoEstimado > 0
              ? ` · Público estimado: ${publicoEstimado.toLocaleString(
                  "es-AR"
                )}`
              : ""}
          </p>
        </div>

        <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
          Printables · MakerWorld · Cults3D
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="font-semibold">
            De tu catálogo
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Ryuka busca coincidencias con el tipo de feria y
            prioriza recetas relativamente rápidas o livianas.
          </p>

          <div className="mt-4 space-y-3">
            {catalogo.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#353535] p-4 text-sm text-zinc-500">
                Todavía no encontré coincidencias fuertes en tu catálogo.
                Podés usar las ideas de la derecha para buscar productos nuevos.
              </div>
            ) : (
              catalogo.map(({ producto, motivo }) => (
                <article
                  key={producto.id}
                  className="rounded-xl border border-[#303030] bg-[#111] p-4"
                >
                  <p className="text-xs font-semibold text-red-300">
                    {producto.codigo}
                  </p>

                  <p className="mt-1 font-semibold">
                    {producto.nombre}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {motivo}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="rounded-full border border-white/10 px-2 py-1">
                      {producto.cantidadPorCama || "?"} por cama
                    </span>

                    <span className="rounded-full border border-white/10 px-2 py-1">
                      {producto.pesoPorCama || "0"} g/cama
                    </span>

                    <span className="rounded-full border border-white/10 px-2 py-1">
                      {producto.horas || "0"} h {producto.minutos || "0"} min
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold">
            Ideas para sumar
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Elegí una idea y abrí la misma búsqueda directamente
            en las tres páginas que usan.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ideas.map((item, indice) => (
              <button
                key={item.titulo}
                type="button"
                onClick={() => {
                  setIdeaSeleccionada(indice);
                  setBusquedaPersonalizada("");
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  indice === ideaSeleccionada
                    ? "border-[#810404] bg-red-950/20"
                    : "border-[#303030] bg-[#111] hover:border-[#444]"
                }`}
              >
                <p className="font-semibold">
                  {item.titulo}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {item.descripcion}
                </p>
              </button>
            ))}
          </div>

          {idea && (
            <div className="mt-5 rounded-xl border border-white/10 bg-[#111] p-4">
              <p className="text-sm font-semibold">
                Búsqueda sugerida
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {idea.busquedas.map((busqueda) => (
                  <button
                    key={busqueda}
                    type="button"
                    onClick={() =>
                      setBusquedaPersonalizada(busqueda)
                    }
                    className={`rounded-full border px-3 py-2 text-xs transition ${
                      terminoActual === busqueda
                        ? "border-red-800 bg-red-950/30 text-red-200"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {busqueda}
                  </button>
                ))}
              </div>

              <input
                value={busquedaPersonalizada}
                onChange={(evento) =>
                  setBusquedaPersonalizada(
                    evento.target.value
                  )
                }
                placeholder="O escribí tu propia búsqueda..."
                className="mt-4 w-full rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 text-sm outline-none focus:border-[#810404]"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SearchLink
                  label="Printables"
                  href={urlBusqueda(
                    "printables",
                    terminoActual
                  )}
                  disabled={!terminoActual}
                />

                <SearchLink
                  label="MakerWorld"
                  href={urlBusqueda(
                    "makerworld",
                    terminoActual
                  )}
                  disabled={!terminoActual}
                />

                <SearchLink
                  label="Cults3D"
                  href={urlBusqueda(
                    "cults3d",
                    terminoActual
                  )}
                  disabled={!terminoActual}
                />
              </div>

              <div className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 text-xs leading-5 text-amber-200/90">
                ⚠️ Antes de vender una impresión, revisá la licencia
                comercial del modelo. Que un STL sea gratis o descargable
                no significa automáticamente que permita venta de piezas impresas.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SearchLink({
  label,
  href,
  disabled,
}: {
  label: string;
  href: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-center text-sm font-semibold text-zinc-600">
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl border border-[#3a3a3a] bg-[#181818] px-4 py-3 text-center text-sm font-semibold transition hover:border-[#810404] hover:bg-red-950/20"
    >
      Buscar en {label} ↗
    </a>
  );
}
