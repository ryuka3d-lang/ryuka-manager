"use client";

import type {
  Accesorio,
  ModoAccesorio,
  Producto,
  SetProducto,
} from "../../types/producto";

type Props = {
  producto: Producto;
  setProducto: SetProducto;
};

export default function AccessoriesCard({
  producto,
  setProducto,
}: Props) {
  function actualizarAccesorio(
    indice: number,
    cambios: Partial<Accesorio>
  ) {
    setProducto((productoActual) => ({
      ...productoActual,
      accesorios: productoActual.accesorios.map(
        (accesorio, indiceActual) =>
          indiceActual === indice
            ? {
                ...accesorio,
                ...cambios,
              }
            : accesorio
      ),
    }));
  }

  return (
    <div className="rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          📦 Accesorios por defecto
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Elegí qué accesorios usa este producto y cómo se
          calcula su cantidad.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2b2b2b]">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[70px_1fr_180px_140px] gap-4 bg-[#151515] px-4 py-3 text-sm font-semibold text-gray-300">
            <span>Activo</span>
            <span>Accesorio</span>
            <span>Modo</span>
            <span>Cantidad</span>
          </div>

          {producto.accesorios.map((accesorio, indice) => (
            <div
              key={`${accesorio.id}-${indice}`}
              className="grid grid-cols-[70px_1fr_180px_140px] items-center gap-4 border-t border-[#2b2b2b] px-4 py-4"
            >
              <input
                type="checkbox"
                checked={accesorio.activo}
                onChange={(evento) =>
                  actualizarAccesorio(indice, {
                    activo: evento.target.checked,
                  })
                }
                className="h-5 w-5 accent-[#810404]"
              />

              <span
                className={
                  accesorio.activo
                    ? "font-medium text-white"
                    : "text-gray-500"
                }
              >
                {accesorio.nombre}
              </span>

              <select
                value={accesorio.modo}
                disabled={!accesorio.activo}
                onChange={(evento) =>
                  actualizarAccesorio(indice, {
                    modo: evento.target.value as ModoAccesorio,
                  })
                }
                className="
                  rounded-xl
                  border
                  border-[#2b2b2b]
                  bg-[#151515]
                  px-3
                  py-2
                  outline-none
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  focus:border-[#810404]
                "
              >
                <option value="porUnidad">
                  Por unidad
                </option>

                <option value="porPedido">
                  Por pedido
                </option>
              </select>

              <input
                type="number"
                min="0"
                step="1"
                value={accesorio.cantidad}
                disabled={!accesorio.activo}
                onChange={(evento) =>
                  actualizarAccesorio(indice, {
                    cantidad: evento.target.value,
                  })
                }
                className="
                  rounded-xl
                  border
                  border-[#2b2b2b]
                  bg-[#151515]
                  px-3
                  py-2
                  outline-none
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  focus:border-[#810404]
                "
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#2b2b2b] bg-[#151515] p-4 text-sm text-gray-400">
        <p>
          <strong className="text-white">
            Por unidad:
          </strong>{" "}
          la cantidad se multiplica por las unidades del pedido.
        </p>

        <p className="mt-2">
          <strong className="text-white">
            Por pedido:
          </strong>{" "}
          se utiliza una cantidad fija, por ejemplo una caja y
          dos bolsas.
        </p>
      </div>
    </div>
  );
}