"use client";

import Input from "../Input";
import ResultCard from "../ResultCard";

type Props = {
  usarHorasPersonalizadas: boolean;
  horasImpresionDiaPedido: string;
  horasDiariasCalculadas: number;

  resultado: {
    camas: number;
    tiempoTotalHoras: number;
    tiempoTotalMinutos: number;
    kilosFilamento: number;
    rollosNecesarios: number;
    diasProduccion: number;
    pesoTotal: number;
  };

  onSeleccionarHorasRapidas: (
    horas: number
  ) => void;

  onCambiarModoPersonalizado: (
    valor: boolean
  ) => void;

  onCambiarHoras: (
    valor: string
  ) => void;
};

export default function BudgetProductionSection({
  usarHorasPersonalizadas,
  horasImpresionDiaPedido,
  horasDiariasCalculadas,
  resultado,
  onSeleccionarHorasRapidas,
  onCambiarModoPersonalizado,
  onCambiarHoras,
}: Props) {
  const horasTotales = Math.floor(
    resultado.tiempoTotalMinutos / 60
  );

  const minutosRestantes =
    resultado.tiempoTotalMinutos % 60;

  const diasProduccion =
    resultado.diasProduccion > 0
      ? resultado.diasProduccion.toFixed(1)
      : "0";

  const avisoFilamento =
    resultado.pesoTotal <= 0
      ? null
      : resultado.pesoTotal <= 1000
      ? {
          tipo: "ok",
          titulo: "Entra en un solo rollo",
          texto: `Este pedido consume ${resultado.kilosFilamento.toFixed(
            2
          )} kg de filamento.`,
        }
      : {
          tipo: "alerta",
          titulo:
            "Necesitás más de un rollo",
          texto: `Este pedido consume ${resultado.kilosFilamento.toFixed(
            2
          )} kg. Tené preparados ${resultado.rollosNecesarios} rollos.`,
        };

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <h2 className="text-xl font-bold">
        Producción
      </h2>

      <div className="mt-6">
        <p className="text-sm text-gray-400">
          Horas de impresión por día
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {[8, 12, 18, 24].map((horas) => (
            <button
              key={horas}
              type="button"
              onClick={() =>
                onSeleccionarHorasRapidas(
                  horas
                )
              }
              className={
                !usarHorasPersonalizadas &&
                Number(
                  horasImpresionDiaPedido
                ) === horas
                  ? "rounded-xl bg-red-700 px-5 py-3 font-semibold"
                  : "rounded-xl border border-[#3a3a3a] bg-[#151515] px-5 py-3 font-semibold transition hover:border-red-700"
              }
            >
              {horas} h
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              onCambiarModoPersonalizado(
                true
              )
            }
            className={
              usarHorasPersonalizadas
                ? "rounded-xl bg-red-700 px-5 py-3 font-semibold"
                : "rounded-xl border border-[#3a3a3a] bg-[#151515] px-5 py-3 font-semibold transition hover:border-red-700"
            }
          >
            Personalizado
          </button>
        </div>

        {usarHorasPersonalizadas && (
          <div className="mt-5 max-w-sm">
            <Input
              label="Horas por día"
              type="number"
              value={
                horasImpresionDiaPedido
              }
              onChange={onCambiarHoras}
            />

            <p className="mt-2 text-xs text-gray-500">
              Ingresá un valor entre 1 y 24
              horas.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <ResultCard
          titulo="Camas necesarias"
          valor={String(resultado.camas)}
        />

        <ResultCard
          titulo="Tiempo total"
          valor={`${horasTotales} h ${minutosRestantes} min`}
        />

        <ResultCard
          titulo={`Días a ${horasDiariasCalculadas} h/día`}
          valor={`${diasProduccion} días`}
        />

        <ResultCard
          titulo="Filamento total"
          valor={`${resultado.kilosFilamento.toFixed(
            2
          )} kg`}
        />

        <ResultCard
          titulo="Rollos necesarios"
          valor={String(
            resultado.rollosNecesarios
          )}
        />
      </div>

      {avisoFilamento && (
        <div
          className={
            avisoFilamento.tipo === "ok"
              ? "mt-6 rounded-xl border border-green-800 bg-green-950/30 p-5"
              : "mt-6 rounded-xl border border-yellow-800 bg-yellow-950/30 p-5"
          }
        >
          <h3 className="font-bold">
            {avisoFilamento.tipo === "ok"
              ? "✔ "
              : "⚠ "}
            {avisoFilamento.titulo}
          </h3>

          <p className="mt-2 text-sm text-gray-300">
            {avisoFilamento.texto}
          </p>
        </div>
      )}
    </section>
  );
}