"use client";

import type { ComponentProps } from "react";

import AccessoriesCostCard from "./AccessoriesCostCard";
import ResultCard from "../ResultCard";

type DetalleAccesorios =
  ComponentProps<
    typeof AccessoriesCostCard
  >["accesorios"];

type Props = {
  resultado: {
    costoFilamento: number;
    costoElectricidad: number;
    costoAmortizacion: number;
    costoManoObra: number;
    monotributoProporcional: number;
    costoAccesorios: number;
    costoTotal: number;
    costoPorUnidad: number;
    detalleAccesorios: DetalleAccesorios;
  };

  minutosManualPorCama: number;
  camasCalculadas: number;
  minutosTrabajoManualBase: number;
  minutosTrabajoExtra: number;
  minutosTrabajoPersonalTotal: number;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}

export default function BudgetCostsSection({
  resultado,
  minutosManualPorCama,
  camasCalculadas,
  minutosTrabajoManualBase,
  minutosTrabajoExtra,
  minutosTrabajoPersonalTotal,
}: Props) {
  return (
    <>
      <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
        <h2 className="text-xl font-bold">
          Costos
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-3 text-sm">
            <FilaCosto
              nombre="Filamento"
              valor={resultado.costoFilamento}
            />

            <FilaCosto
              nombre="Electricidad"
              valor={resultado.costoElectricidad}
            />

            <FilaCosto
              nombre="Amortización"
              valor={resultado.costoAmortizacion}
            />

            <div className="rounded-xl border border-[#303030] bg-[#151515] p-4 text-sm">
              <p className="font-semibold text-white">
                Detalle del trabajo manual
              </p>

              <div className="mt-3 space-y-2 text-gray-400">
                <p>
                  Base por cama:{" "}
                  <span className="text-white">
                    {Math.floor(
                      minutosManualPorCama / 60
                    )}{" "}
                    h {minutosManualPorCama % 60} min
                  </span>
                </p>

                <p>
                  Camas necesarias:{" "}
                  <span className="text-white">
                    {camasCalculadas}
                  </span>
                </p>

                <p>
                  Trabajo manual base:{" "}
                  <span className="text-white">
                    {Math.floor(
                      minutosTrabajoManualBase / 60
                    )}{" "}
                    h {minutosTrabajoManualBase % 60} min
                  </span>
                </p>

                <p>
                  Trabajo extra:{" "}
                  <span className="text-white">
                    {Math.floor(
                      minutosTrabajoExtra / 60
                    )}{" "}
                    h {minutosTrabajoExtra % 60} min
                  </span>
                </p>

                <p className="border-t border-[#303030] pt-2 font-semibold text-white">
                  Trabajo total:{" "}
                  {Math.floor(
                    minutosTrabajoPersonalTotal / 60
                  )}{" "}
                  h {minutosTrabajoPersonalTotal % 60} min
                </p>
              </div>
            </div>

            <FilaCosto
              nombre="Mano de obra"
              valor={resultado.costoManoObra}
            />

            <FilaCosto
              nombre="Monotributo proporcional"
              valor={
                resultado.monotributoProporcional
              }
            />

            <FilaCosto
              nombre="Accesorios"
              valor={resultado.costoAccesorios}
            />

            <div className="border-t border-[#353535] pt-4">
              <FilaCosto
                nombre="Costo total"
                valor={resultado.costoTotal}
                destacado
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ResultCard
              titulo="Costo total"
              valor={formatearDinero(
                resultado.costoTotal
              )}
            />

            <ResultCard
              titulo="Costo por unidad"
              valor={formatearDinero(
                resultado.costoPorUnidad
              )}
            />
          </div>
        </div>
      </section>

      <div className="mt-8">
        <AccessoriesCostCard
          accesorios={
            resultado.detalleAccesorios
          }
          costoTotal={
            resultado.costoAccesorios
          }
        />
      </div>
    </>
  );
}

type FilaCostoProps = {
  nombre: string;
  valor: number;
  destacado?: boolean;
};

function FilaCosto({
  nombre,
  valor,
  destacado = false,
}: FilaCostoProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          destacado
            ? "font-bold text-white"
            : "text-gray-400"
        }
      >
        {nombre}
      </span>

      <span
        className={
          destacado
            ? "text-lg font-bold"
            : "font-semibold"
        }
      >
        {formatearDinero(valor)}
      </span>
    </div>
  );
}