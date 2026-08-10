"use client";

import ProductCard from "./ProductCard";
import type { ProductoGuardado } from "@/lib/product-service";

type Props = {
  productos: ProductoGuardado[];
  cargando: boolean;
  eliminandoId: string | null;
  onEditar: (producto: ProductoGuardado) => void;
  onEliminar: (producto: ProductoGuardado) => void;
};

export default function ProductGrid({
  productos,
  cargando,
  eliminandoId,
  onEditar,
  onEliminar,
}: Props) {
  if (productos.length === 0 && !cargando) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[#343434] bg-[#171717] p-10 text-center">
        <p className="font-semibold text-gray-300">
          No encontramos productos.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Probá con otra búsqueda o creá un producto nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          eliminando={eliminandoId === producto.id}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
