"use client";

import { Search } from "lucide-react";

import Button from "@/app/components/Button";
import type { ProductoGuardado } from "@/lib/product-service";

type Props = {
  mostrarFormulario: boolean;
  productoEditando: ProductoGuardado | null;
  cantidadProductos: number;
  cargando: boolean;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  onNuevoProducto: () => void;
  onCerrarFormulario: () => void;
};

export default function ProductToolbar({
  mostrarFormulario,
  productoEditando,
  cantidadProductos,
  cargando,
  busqueda,
  onBusquedaChange,
  onNuevoProducto,
  onCerrarFormulario,
}: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-4 md:flex md:items-center md:justify-between md:gap-4">
      <div>
        <h2 className="text-lg font-semibold">
          {mostrarFormulario
            ? productoEditando
              ? "Editando producto"
              : "Nuevo producto"
            : "Mis productos"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {cargando
            ? "Sincronizando productos..."
            : `${cantidadProductos} productos guardados`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0">
        {!mostrarFormulario && (
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            <input
              value={busqueda}
              onChange={(evento) =>
                onBusquedaChange(evento.target.value)
              }
              placeholder="Buscar producto..."
              className="w-full rounded-xl border border-[#2b2b2b] bg-[#111] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#810404]"
            />
          </div>
        )}

        <Button
          texto={mostrarFormulario ? "Cerrar" : "+ Nuevo producto"}
          onClick={
            mostrarFormulario
              ? onCerrarFormulario
              : onNuevoProducto
          }
        />
      </div>
    </div>
  );
}
