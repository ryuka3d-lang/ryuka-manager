"use client";

import Input from "../Input";

import type {
  Producto,
  SetProducto,
} from "../../types/producto";

type Props = {
  producto: Producto;
  setProducto: SetProducto;
};

export default function GeneralInfoCard({
  producto,
  setProducto,
}: Props) {
  return (
    <div className="rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <h2 className="mb-6 text-xl font-bold">
        📦 Información general
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Ej: Llavero personalizado"
          value={producto.nombre}
          onChange={(valor) =>
            setProducto((productoActual) => ({
              ...productoActual,
              nombre: valor,
            }))
          }
        />

        <Input
          label="Categoría"
          placeholder="Ej: Llavero"
          value={producto.categoria}
          onChange={(valor) =>
            setProducto((productoActual) => ({
              ...productoActual,
              categoria: valor,
            }))
          }
        />

        <div className="md:col-span-2">
          <Input
            label="Descripción"
            placeholder="Descripción breve del producto"
            value={producto.descripcion}
            onChange={(valor) =>
              setProducto((productoActual) => ({
                ...productoActual,
                descripcion: valor,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}