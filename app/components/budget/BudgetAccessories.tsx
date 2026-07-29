"use client";

import type {
  Accesorio,
  ModoAccesorio,
} from "../../types/producto";

type Props = {
  visible: boolean;
  accesorios: Accesorio[];

  onActualizarAccesorio: (
    id: string,
    cambios: Partial<Accesorio>
  ) => void;
};

export default function BudgetAccessoriesSection({
  visible,
  accesorios,
  onActualizarAccesorio,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <h2 className="text-xl font-bold">
        Accesorios de este presupuesto
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Los cambios realizados acá no modifican
        el producto original.
      </p>

      {accesorios.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400">
          Este producto no tiene accesorios
          configurados.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#303030]">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[80px_1fr_190px_150px] gap-4 bg-[#151515] px-4 py-3 text-sm font-semibold text-gray-300">
              <span>Incluir</span>
              <span>Accesorio</span>
              <span>Modo</span>
              <span>Cantidad</span>
            </div>

            {accesorios.map((accesorio) => (
              <div
                key={accesorio.id}
                className="grid grid-cols-[80px_1fr_190px_150px] items-center gap-4 border-t border-[#303030] px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={accesorio.activo}
                  onChange={(evento) =>
                    onActualizarAccesorio(
                      accesorio.id,
                      {
                        activo:
                          evento.target.checked,
                      }
                    )
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
                    onActualizarAccesorio(
                      accesorio.id,
                      {
                        modo:
                          evento.target
                            .value as ModoAccesorio,
                      }
                    )
                  }
                  className="
                    rounded-xl
                    border
                    border-[#303030]
                    bg-[#151515]
                    px-3
                    py-2
                    outline-none
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
                  value={accesorio.cantidad}
                  disabled={!accesorio.activo}
                  onChange={(evento) =>
                    onActualizarAccesorio(
                      accesorio.id,
                      {
                        cantidad:
                          evento.target.value,
                      }
                    )
                  }
                  className="
                    rounded-xl
                    border
                    border-[#303030]
                    bg-[#151515]
                    px-3
                    py-2
                    outline-none
                    disabled:opacity-40
                    focus:border-[#810404]
                  "
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}