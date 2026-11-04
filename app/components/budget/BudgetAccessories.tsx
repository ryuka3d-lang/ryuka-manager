"use client";

import { useState } from "react";

import type {
  Accesorio,
  ModoAccesorio,
} from "../../types/producto";

import {
  obtenerCatalogoAccesorios,
  obtenerConfiguracion,
} from "../../../lib/settings-service";

type Props = {
  visible: boolean;
  accesorios: Accesorio[];
  onActualizarAccesorio: (
    id: string,
    cambios: Partial<Accesorio>
  ) => void;
  onAgregarAccesorio: (id: string) => void;
};

export default function BudgetAccessoriesSection({
  visible,
  accesorios,
  onActualizarAccesorio,
  onAgregarAccesorio,
}: Props) {
  const [catalogo] = useState(() =>
    obtenerCatalogoAccesorios(obtenerConfiguracion())
  );

  const [accesorioSeleccionadoId, setAccesorioSeleccionadoId] =
    useState("");

  const accesoriosDisponibles = catalogo.filter(
    (opcion) =>
      !accesorios.some((accesorio) => accesorio.id === opcion.id)
  );

  if (!visible) {
    return null;
  }

  return (
    <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-xl font-bold">
        Accesorios de este presupuesto
      </h2>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Los cambios realizados acá no modifican el producto original.
      </p>

      {accesorios.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Este producto no tiene accesorios configurados.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[80px_1fr_190px_150px] gap-4 bg-[var(--field)] px-4 py-3 text-sm font-semibold text-[var(--muted)]">
              <span>Incluir</span>
              <span>Accesorio</span>
              <span>Modo</span>
              <span>Cantidad</span>
            </div>

            {accesorios.map((accesorio) => (
              <div
                key={accesorio.id}
                className="grid grid-cols-[80px_1fr_190px_150px] items-center gap-4 border-t border-[var(--border)] px-4 py-4"
              >
                <input
                  type="checkbox"
                  checked={accesorio.activo}
                  onChange={(evento) =>
                    onActualizarAccesorio(accesorio.id, {
                      activo: evento.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-[var(--accent)]"
                />

                <span
                  className={
                    accesorio.activo
                      ? "font-medium text-[var(--text)]"
                      : "text-[var(--muted)]"
                  }
                >
                  {accesorio.nombre}
                </span>

                <select
                  value={accesorio.modo}
                  disabled={!accesorio.activo}
                  onChange={(evento) =>
                    onActualizarAccesorio(accesorio.id, {
                      modo: evento.target.value as ModoAccesorio,
                    })
                  }
                  className="
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--field)]
                    px-3
                    py-2
                    outline-none
                    disabled:opacity-40
                    focus:border-[var(--accent)]
                  "
                >
                  <option value="porUnidad">Por unidad</option>
                  <option value="porPedido">Por pedido</option>
                </select>

                <input
                  type="number"
                  min="0"
                  value={accesorio.cantidad}
                  disabled={!accesorio.activo}
                  onChange={(evento) =>
                    onActualizarAccesorio(accesorio.id, {
                      cantidad: evento.target.value,
                    })
                  }
                  className="
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--field)]
                    px-3
                    py-2
                    outline-none
                    disabled:opacity-40
                    focus:border-[var(--accent)]
                  "
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {accesoriosDisponibles.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--field)] p-4 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-sm font-semibold text-[var(--muted)]">
              Agregar accesorio al presupuesto
            </span>

            <select
              value={accesorioSeleccionadoId}
              onChange={(evento) =>
                setAccesorioSeleccionadoId(evento.target.value)
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--bg)]
                px-3
                py-2
                outline-none
                focus:border-[var(--accent)]
              "
            >
              <option value="" disabled>
                Elegí un accesorio...
              </option>

              {accesoriosDisponibles.map((opcion) => (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              if (accesorioSeleccionadoId) {
                onAgregarAccesorio(accesorioSeleccionadoId);
                setAccesorioSeleccionadoId("");
              }
            }}
            disabled={!accesorioSeleccionadoId}
            className="rounded-xl bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Agregar
          </button>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--field)] p-4 text-sm text-[var(--muted)]">
        <p>
          <strong className="text-[var(--text)]">Por unidad:</strong>{" "}
          la cantidad se multiplica por las unidades del pedido.
        </p>

        <p className="mt-2">
          <strong className="text-[var(--text)]">Por pedido:</strong>{" "}
          se utiliza una cantidad fija, por ejemplo una caja y dos bolsas.
        </p>

        <p className="mt-2">
          <strong className="text-[var(--text)]">Tip:</strong>{" "}
          los accesorios personalizados se crean en Configuración → Accesorios personalizados.
        </p>
      </div>
    </section>
  );
}