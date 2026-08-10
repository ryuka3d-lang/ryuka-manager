"use client";

import type { PresupuestoItemGuardado } from "@/lib/budget-service";

type Props = {
  cliente: string;
  items: PresupuestoItemGuardado[];
  totales: {
    costoTotal: number;
    mayoristaTotal: number;
    mayoristaGanancia: number;
    minoristaTotal: number;
    minoristaGanancia: number;
    tiempoTotalMinutos: number;
    trabajoManualMinutos: number;
    kilosFilamento: number;
    diasProduccion: number;
  };
  onEliminarItem: (indice: number) => void;
  onGuardar: () => void;
};

function dinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function tiempo(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return `${horas} h ${resto} min`;
}

export default function MultiProductBudgetSummary({
  cliente,
  items,
  totales,
  onEliminarItem,
  onGuardar,
}: Props) {
  return (
    <section className="rounded-2xl border border-[#2b2b2b] bg-[#171717] p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Presupuesto completo
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Productos agregados
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {cliente
            ? `Cliente: ${cliente}`
            : "Elegí un cliente para guardar el presupuesto."}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#353535] bg-[#111] p-6 text-center">
          <p className="font-semibold text-gray-300">
            Todavía no agregaste productos.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Configurá el primer producto y tocá “Agregar
            producto”.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item, indice) => (
            <article
              key={`${item.productId}-${indice}`}
              className="rounded-xl border border-[#303030] bg-[#111] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-red-300">
                    {item.productCode}
                  </p>

                  <h3 className="mt-1 font-bold">
                    {item.productName}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {item.quantity} unidades
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onEliminarItem(indice)
                  }
                  className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/30"
                >
                  Quitar
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Dato
                  titulo="Costo"
                  valor={dinero(item.totalCost)}
                />

                <Dato
                  titulo="Mayorista"
                  valor={dinero(
                    item.wholesaleTotal
                  )}
                />

                <Dato
                  titulo="Minorista"
                  valor={dinero(item.retailTotal)}
                />

                <Dato
                  titulo="Impresión"
                  valor={tiempo(
                    item.totalPrintMinutes
                  )}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Total
          titulo="Costo total"
          valor={dinero(totales.costoTotal)}
        />

        <Total
          titulo="Mayorista total"
          valor={dinero(
            totales.mayoristaTotal
          )}
        />

        <Total
          titulo="Minorista total"
          valor={dinero(
            totales.minoristaTotal
          )}
        />

        <Total
          titulo="Tiempo de impresión"
          valor={tiempo(
            totales.tiempoTotalMinutos
          )}
        />

        <Total
          titulo="Filamento"
          valor={`${totales.kilosFilamento.toFixed(
            2
          )} kg`}
        />

        <Total
          titulo="Producción estimada"
          valor={`${totales.diasProduccion.toFixed(
            1
          )} días`}
        />
      </div>

      <button
        type="button"
        onClick={onGuardar}
        disabled={
          items.length === 0 || !cliente.trim()
        }
        className="mt-6 w-full rounded-xl bg-[#810404] px-6 py-3 font-semibold transition hover:bg-[#a00808] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Guardar presupuesto completo
      </button>
    </section>
  );
}

function Dato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-3">
      <p className="text-xs text-gray-500">
        {titulo}
      </p>

      <strong className="mt-1 block">
        {valor}
      </strong>
    </div>
  );
}

function Total({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl border border-[#303030] bg-[#111] p-4">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>

      <strong className="mt-1 block text-lg">
        {valor}
      </strong>
    </div>
  );
}
