"use client";

import GeneralInfoCard from "./product/GeneralInfoCard";
import RecipeCard from "./product/RecipeCard";
import MaterialsCard from "./product/MaterialsCard";
import AccessoriesCard from "./product/AccessoriesCard";
import type { Producto, SetProducto } from "../types/producto";

type Props = { producto: Producto; setProducto: SetProducto };

function SeccionPlegable({ titulo, resumen, children, abierta = false }: { titulo: string; resumen: string; children: React.ReactNode; abierta?: boolean }) {
  return (
    <details open={abierta} className="group overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.02]">
        <div><h2 className="font-semibold text-white">{titulo}</h2><p className="mt-1 text-sm text-gray-500">{resumen}</p></div>
        <span className="text-xl text-gray-500 transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-[#292929] p-1">{children}</div>
    </details>
  );
}

export default function ProductForm({ producto, setProducto }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <SeccionPlegable titulo="Información básica" resumen="Nombre, categoría y descripción" abierta>
        <GeneralInfoCard producto={producto} setProducto={setProducto} />
      </SeccionPlegable>
      <SeccionPlegable titulo="Producción" resumen="Cama, peso, colores y tiempos" abierta>
        <RecipeCard producto={producto} setProducto={setProducto} />
      </SeccionPlegable>
      <SeccionPlegable titulo="Materiales" resumen={`${producto.materiales.length} materiales configurados`}>
        <MaterialsCard producto={producto} setProducto={setProducto} />
      </SeccionPlegable>
      <SeccionPlegable titulo="Accesorios" resumen={`${producto.accesorios.filter((a) => a.activo).length} accesorios activos`}>
        <AccessoriesCard producto={producto} setProducto={setProducto} />
      </SeccionPlegable>
    </div>
  );
}
