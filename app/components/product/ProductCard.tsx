"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { ProductoGuardado } from "@/lib/product-service";

type Props = {
  producto: ProductoGuardado;
  eliminando: boolean;
  onEditar: (producto: ProductoGuardado) => void;
  onEliminar: (producto: ProductoGuardado) => void;
};

export default function ProductCard({
  producto,
  eliminando,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5 transition hover:-translate-y-0.5 hover:border-[#444]">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-red-300">
          {producto.codigo}
        </p>

        <h3 className="mt-2 truncate text-xl font-bold">
          {producto.nombre}
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          {producto.categoria || "Sin categoría"}
        </p>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <p>
          Cantidad por cama:{" "}
          <strong>{producto.cantidadPorCama}</strong>
        </p>

        <p>
          Peso por cama:{" "}
          <strong>{producto.pesoPorCama || "0"} g</strong>
        </p>

        <p>
          Tiempo por cama:{" "}
          <strong>
            {producto.horas || "0"} h{" "}
            {producto.minutos || "0"} min
          </strong>
        </p>

        <p>
          Filamentos detallados:{" "}
          <strong>{producto.materiales.length}</strong>
        </p>
      </div>

      {producto.materiales.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {producto.materiales.map((material, indice) => (
            <span
              key={`${material.id}-${indice}`}
              className="rounded-full border border-[#353535] bg-[#151515] px-3 py-1 text-xs text-gray-300"
            >
              {material.material} {material.color}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-3 border-t border-[#303030] pt-5">
        <button
          type="button"
          onClick={() => onEditar(producto)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3a3a3a] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.04]"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>

        <button
          type="button"
          onClick={() => onEliminar(producto)}
          disabled={eliminando}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-900 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {eliminando ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </article>
  );
}
