"use client";

import { useState } from "react";

import type {
  Accesorio,
  ModoAccesorio,
  Producto,
  SetProducto,
} from "../../types/producto";

import {
  obtenerCatalogoAccesorios,
  obtenerConfiguracion,
} from "../../../lib/settings-service";

type Props = {
  producto: Producto;
  setProducto: SetProducto;
};

export default function AccessoriesCard({
  producto,
  setProducto,
}: Props) {
  const [catalogo] = useState(() =>
    obtenerCatalogoAccesorios(
      obtenerConfiguracion()
    )
  );

  const accesoriosDisponibles =
    catalogo.filter(
      (opcion) =>
        !producto.accesorios.some(
          (accesorio) =>
            accesorio.id === opcion.id
        )
    );

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

  function agregarAccesorio(id: string) {
    const opcion = catalogo.find(
      (elemento) => elemento.id === id
    );

    if (!opcion) {
      return;
    }

    setProducto((productoActual) => ({
      ...productoActual,
      accesorios: [
        ...productoActual.accesorios,
        {
          id: opcion.id,
          nombre: opcion.nombre,
          activo: true,
          modo: "porUnidad",
          cantidad: "1",
        },
      ],
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

      {accesoriosDisponibles.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#2b2b2b] bg-[#151515] p-4 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-sm font-semibold text-gray-300">
              Agregar accesorio al producto
            </span>

            <select
              id="selector-accesorio-disponible"
              defaultValue=""
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-[#2b2b2b]
                bg-[#101010]
                px-3
                py-2
                outline-none
                focus:border-[#810404]
              "
            >
              <option value="" disabled>
                Elegí un accesorio...
              </option>

              {accesoriosDisponibles.map(
                (opcion) => (
                  <option
                    key={opcion.id}
                    value={opcion.id}
                  >
                    {opcion.nombre}
                  </option>
                )
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              const selector =
                document.getElementById(
                  "selector-accesorio-disponible"
                ) as HTMLSelectElement | null;

              if (
                !selector ||
                !selector.value
              ) {
                return;
              }

              agregarAccesorio(selector.value);
              selector.value = "";
            }}
            className="rounded-xl bg-[#810404] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#a00808]"
          >
            + Agregar
          </button>
        </div>
      )}

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

        <p className="mt-2">
          <strong className="text-white">
            Tip:
          </strong>{" "}
          los accesorios personalizados se crean en
          Configuración → Accesorios personalizados.
        </p>
      </div>
    </div>
  );
}