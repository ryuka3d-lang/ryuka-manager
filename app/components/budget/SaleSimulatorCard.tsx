"use client";

import { useEffect, useState } from "react";

export type PrecioFinalVenta = {
  mayoristaUnitario: number;
  mayoristaTotal: number;
  mayoristaGanancia: number;

  minoristaUnitario: number;
  minoristaTotal: number;
  minoristaGanancia: number;
};

type Props = {
  cantidad: number;
  costoTotal: number;

  precioMayoristaCalculado: number;
  mayoristaPorUnidadCalculado: number;
  porcentajeMayorista: number;

  precioMinoristaCalculado: number;
  minoristaPorUnidadCalculado: number;
  porcentajeMinorista: number;

  onPreciosChange: (
    precios: PrecioFinalVenta
  ) => void;
};

export default function SaleSimulatorCard({
  cantidad,
  costoTotal,

  precioMayoristaCalculado,
  mayoristaPorUnidadCalculado,
  porcentajeMayorista,

  precioMinoristaCalculado,
  minoristaPorUnidadCalculado,
  porcentajeMinorista,

  onPreciosChange,
}: Props) {
  const [precioMayoristaFinal, setPrecioMayoristaFinal] =
    useState("");

  const [precioMinoristaFinal, setPrecioMinoristaFinal] =
    useState("");

  useEffect(() => {
    setPrecioMayoristaFinal(
      mayoristaPorUnidadCalculado > 0
        ? String(
            redondearPrecio(
              mayoristaPorUnidadCalculado
            )
          )
        : ""
    );
  }, [mayoristaPorUnidadCalculado]);

  useEffect(() => {
    setPrecioMinoristaFinal(
      minoristaPorUnidadCalculado > 0
        ? String(
            redondearPrecio(
              minoristaPorUnidadCalculado
            )
          )
        : ""
    );
  }, [minoristaPorUnidadCalculado]);

  const mayoristaFinalUnitario =
    Number(precioMayoristaFinal) || 0;

  const minoristaFinalUnitario =
    Number(precioMinoristaFinal) || 0;

  const mayoristaFinalTotal =
    mayoristaFinalUnitario * cantidad;

  const minoristaFinalTotal =
    minoristaFinalUnitario * cantidad;

  const gananciaMayoristaFinal =
    mayoristaFinalTotal - costoTotal;

  const gananciaMinoristaFinal =
    minoristaFinalTotal - costoTotal;

  useEffect(() => {
    onPreciosChange({
      mayoristaUnitario:
        mayoristaFinalUnitario,

      mayoristaTotal:
        mayoristaFinalTotal,

      mayoristaGanancia:
        gananciaMayoristaFinal,

      minoristaUnitario:
        minoristaFinalUnitario,

      minoristaTotal:
        minoristaFinalTotal,

      minoristaGanancia:
        gananciaMinoristaFinal,
    });
  }, [
    mayoristaFinalUnitario,
    mayoristaFinalTotal,
    gananciaMayoristaFinal,
    minoristaFinalUnitario,
    minoristaFinalTotal,
    gananciaMinoristaFinal,
    onPreciosChange,
  ]);

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div>
        <h2 className="text-xl font-bold">
          Precio de venta
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Ajustá el precio por unidad y Ryuka calculará el
          total final y la ganancia real del pedido.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SimuladorVenta
          titulo="Mayorista"
          cantidad={cantidad}
          costoTotal={costoTotal}
          porcentajeAplicado={porcentajeMayorista}
          precioCalculadoTotal={
            precioMayoristaCalculado
          }
          precioCalculadoUnitario={
            mayoristaPorUnidadCalculado
          }
          precioFinalUnitario={
            precioMayoristaFinal
          }
          onPrecioFinalChange={
            setPrecioMayoristaFinal
          }
          precioFinalTotal={
            mayoristaFinalTotal
          }
          gananciaFinal={
            gananciaMayoristaFinal
          }
        />

        <SimuladorVenta
          titulo="Minorista"
          cantidad={cantidad}
          costoTotal={costoTotal}
          porcentajeAplicado={porcentajeMinorista}
          precioCalculadoTotal={
            precioMinoristaCalculado
          }
          precioCalculadoUnitario={
            minoristaPorUnidadCalculado
          }
          precioFinalUnitario={
            precioMinoristaFinal
          }
          onPrecioFinalChange={
            setPrecioMinoristaFinal
          }
          precioFinalTotal={
            minoristaFinalTotal
          }
          gananciaFinal={
            gananciaMinoristaFinal
          }
        />
      </div>
    </section>
  );
}

type SimuladorVentaProps = {
  titulo: string;
  cantidad: number;
  costoTotal: number;
  porcentajeAplicado: number;

  precioCalculadoTotal: number;
  precioCalculadoUnitario: number;

  precioFinalUnitario: string;
  onPrecioFinalChange: (
    valor: string
  ) => void;

  precioFinalTotal: number;
  gananciaFinal: number;
};

function SimuladorVenta({
  titulo,
  cantidad,
  costoTotal,
  porcentajeAplicado,

  precioCalculadoTotal,
  precioCalculadoUnitario,

  precioFinalUnitario,
  onPrecioFinalChange,

  precioFinalTotal,
  gananciaFinal,
}: SimuladorVentaProps) {
  const precioRedondeado =
    redondearPrecio(
      precioCalculadoUnitario
    );

  return (
    <article className="rounded-xl border border-[#303030] bg-[#151515] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">
            Tipo de venta
          </p>

          <h3 className="mt-1 text-2xl font-bold">
            {titulo}
          </h3>
        </div>

        <span className="rounded-full border border-[#3a3a3a] bg-[#1b1b1b] px-3 py-1 text-sm text-gray-300">
          +{porcentajeAplicado}%
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-[#303030] bg-[#1b1b1b] p-5">
        <p className="text-sm font-semibold">
          Precio calculado por Ryuka
        </p>

        <div className="mt-4 space-y-3">
          <FilaVenta
            titulo="Precio por unidad"
            valor={formatearDinero(
              precioCalculadoUnitario
            )}
          />

          <FilaVenta
            titulo="Precio total calculado"
            valor={formatearDinero(
              precioCalculadoTotal
            )}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm text-gray-400">
          Precio final por unidad
        </label>

        <input
          type="number"
          min="0"
          step="1"
          value={precioFinalUnitario}
          onChange={(evento) =>
            onPrecioFinalChange(
              evento.target.value
            )
          }
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-red-900
            bg-[#1b1b1b]
            px-4
            py-4
            text-2xl
            font-bold
            outline-none
            focus:border-red-600
          "
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onPrecioFinalChange(
                String(
                  redondearPrecio(
                    precioCalculadoUnitario,
                    10
                  )
                )
              )
            }
            className="rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm transition hover:border-red-700"
          >
            Redondeo cercano
          </button>

          <button
            type="button"
            onClick={() =>
              onPrecioFinalChange(
                String(precioRedondeado)
              )
            }
            className="rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm transition hover:border-red-700"
          >
            Usar sugerido
          </button>

          <button
            type="button"
            onClick={() =>
              onPrecioFinalChange(
                precioCalculadoUnitario.toFixed(
                  2
                )
              )
            }
            className="rounded-lg border border-[#3a3a3a] px-3 py-2 text-sm transition hover:border-red-700"
          >
            Usar calculado
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-red-900 bg-red-950/20 p-5">
        <p className="text-sm text-gray-400">
          Total final del pedido
        </p>

        <p className="mt-2 text-3xl font-bold">
          {formatearDinero(
            precioFinalTotal
          )}
        </p>

        <p className="mt-2 text-sm text-gray-400">
          {cantidad} unidades ×{" "}
          {formatearDinero(
            Number(precioFinalUnitario) || 0
          )}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <FilaVenta
          titulo="Costo del pedido"
          valor={formatearDinero(costoTotal)}
        />

        <FilaVenta
          titulo="Ganancia final"
          valor={formatearDinero(
            gananciaFinal
          )}
          destacado
          negativo={gananciaFinal < 0}
        />
      </div>

      {cantidad <= 0 && (
        <p className="mt-5 rounded-xl border border-yellow-900 bg-yellow-950/20 p-4 text-sm text-yellow-200">
          Ingresá una cantidad solicitada para calcular el
          total final.
        </p>
      )}

      {gananciaFinal < 0 &&
        cantidad > 0 && (
          <p className="mt-5 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
            Atención: con este precio estarías vendiendo por
            debajo del costo.
          </p>
        )}
    </article>
  );
}

type FilaVentaProps = {
  titulo: string;
  valor: string;
  destacado?: boolean;
  negativo?: boolean;
};

function FilaVenta({
  titulo,
  valor,
  destacado = false,
  negativo = false,
}: FilaVentaProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#303030] pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-400">
        {titulo}
      </span>

      <span
        className={
          negativo
            ? "font-bold text-red-400"
            : destacado
              ? "text-lg font-bold text-green-400"
              : "font-semibold"
        }
      >
        {valor}
      </span>
    </div>
  );
}

function redondearPrecio(
  valor: number,
  multiploPersonalizado?: number
) {
  if (valor <= 0) {
    return 0;
  }

  if (multiploPersonalizado) {
    return (
      Math.ceil(
        valor / multiploPersonalizado
      ) * multiploPersonalizado
    );
  }

  if (valor < 100) {
    return Math.ceil(valor / 10) * 10;
  }

  if (valor < 1000) {
    return Math.ceil(valor / 50) * 50;
  }

  return Math.ceil(valor / 100) * 100;
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}