"use client";

import {
  totalUnidadesFeria,
  type FeriaGuardada,
} from "@/lib/fair-service";
import type { ProductoGuardado } from "@/lib/product-service";
import FairProductionPlan from "./FairProductionPlan";

type Props = {
  feria: FeriaGuardada;
  productos: ProductoGuardado[];
  horasImpresionDia: number;
  onEditar: (feria: FeriaGuardada) => void;
  onEliminar: (feria: FeriaGuardada) => void;
};

export default function FairCard({
  feria,
  productos,
  horasImpresionDia,
  onEditar,
  onEliminar,
}: Props) {
  const unidades = totalUnidadesFeria(feria);

  return (
    <article className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={badge(feria.estado)}>
            {textoEstado(feria.estado)}
          </span>

          <h2 className="mt-3 text-xl font-bold">
            {feria.nombre}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {feria.tipo}
            {feria.lugar ? ` · ${feria.lugar}` : ""}
          </p>
        </div>

        <p className="text-sm font-semibold text-red-300">
          {feria.fecha
            ? new Intl.DateTimeFormat("es-AR").format(
                new Date(
                  `${feria.fecha}T12:00:00`
                )
              )
            : "Sin fecha"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato
          titulo="Público"
          valor={
            feria.publicoEstimado
              ? feria.publicoEstimado.toLocaleString(
                  "es-AR"
                )
              : "—"
          }
        />

        <Dato
          titulo="Productos"
          valor={String(feria.productos.length)}
        />

        <Dato
          titulo="Unidades"
          valor={String(unidades)}
        />

        <Dato
          titulo="Objetivo"
          valor={
            feria.presupuestoObjetivo
              ? moneda(feria.presupuestoObjetivo)
              : "—"
          }
        />
      </div>

      {feria.productos.length > 0 && (
        <div className="mt-5 space-y-2">
          {feria.productos
            .slice(0, 4)
            .map((producto, indice) => (
              <div
                key={`${producto.productId}-${indice}`}
                className="flex items-center justify-between gap-4 rounded-lg bg-white/[0.03] px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {producto.nombre}
                </span>

                <strong>
                  × {producto.cantidadObjetivo}
                </strong>
              </div>
            ))}

          {feria.productos.length > 4 && (
            <p className="text-xs text-zinc-500">
              + {feria.productos.length - 4} productos más
            </p>
          )}
        </div>
      )}

      <FairProductionPlan
        feria={feria}
        productos={productos}
        horasImpresionDia={horasImpresionDia}
      />

      <div className="mt-5 flex gap-3 border-t border-[#303030] pt-5">
        <button
          type="button"
          onClick={() => onEditar(feria)}
          className="flex-1 rounded-xl border border-[#3a3a3a] px-4 py-3 text-sm font-semibold hover:bg-white/[0.04]"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => onEliminar(feria)}
          className="rounded-xl border border-red-900 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/30"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

function Dato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-3">
      <p className="text-xs text-zinc-500">
        {titulo}
      </p>

      <strong className="mt-1 block">
        {valor}
      </strong>
    </div>
  );
}

function textoEstado(
  estado: FeriaGuardada["estado"]
) {
  if (estado === "finalizada") return "Finalizada";
  if (estado === "en_preparacion")
    return "En preparación";
  return "Planificada";
}

function badge(
  estado: FeriaGuardada["estado"]
) {
  const base =
    "inline-flex rounded-full px-3 py-1 text-xs font-semibold";

  if (estado === "finalizada") {
    return `${base} bg-zinc-800 text-zinc-300`;
  }

  if (estado === "en_preparacion") {
    return `${base} bg-amber-950/60 text-amber-300`;
  }

  return `${base} bg-red-950/60 text-red-300`;
}

function moneda(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}
