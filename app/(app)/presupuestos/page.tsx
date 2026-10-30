"use client";

import { useState } from "react";

import PageHeader from "@/app/components/PageHeader";
import SavedBudgetsCard from "@/app/components/budget/SavedBudgetsCard";
import BudgetOrderSection from "@/app/components/budget/BudgetOrderSection";
import BudgetAccessoriesSection from "@/app/components/budget/BudgetAccessories";
import BudgetProductionSection from "@/app/components/budget/BudgetProductionSection";
import BudgetCostsSection from "@/app/components/budget/BudgetCostsSection";
import BudgetSaleSection from "@/app/components/budget/BudgetSaleSection";
import MultiProductBudgetSummary from "@/app/components/budget/MultiProductBudgetSummary";
import QuickQuoteSection from "@/app/components/budget/QuickQuoteSection";
import useBudget from "@/app/hooks/useBudget";
import {
  obtenerCatalogoAccesorios,
  obtenerConfiguracion,
} from "@/lib/settings-service";

export default function PresupuestosPage() {
  const [vista, setVista] =
    useState<"nuevo" | "guardados">("nuevo");

  const [modoRapido, setModoRapido] =
    useState(false);

  const {
    clientes,
    productos,
    productoSeleccionadoId,
    productoSeleccionado,

    presupuesto,
    actualizarPresupuesto,
    seleccionarProducto,

    presupuestoRapido,
    actualizarPresupuestoRapido,
    actualizarAccesorioRapido,
    agregarItemRapido,
    preciosSugeridosRapido,

    accesoriosPresupuesto,
    actualizarAccesorio,

    horasImpresionDiaPedido,
    usarHorasPersonalizadas,
    horasDiariasCalculadas,
    setHorasImpresionDiaPedido,
    setUsarHorasPersonalizadas,
    seleccionarHorasRapidas,

    config,
    resultado,

    camasCalculadas,
    minutosManualPorCama,
    minutosTrabajoManualBase,
    minutosTrabajoExtra,
    minutosTrabajoPersonalTotal,

    preciosFinales,
    setPreciosFinales,

    itemsPresupuesto,
    totalesPresupuesto,
    agregarProductoAlPresupuesto,
    eliminarItemPresupuesto,

    presupuestosGuardados,
    manejarGuardarPresupuesto,
    manejarEliminarPresupuesto,
  } = useBudget();

  const catalogoAccesorios =
    obtenerCatalogoAccesorios(
      obtenerConfiguracion()
    );

  const accesoriosParaRapido =
    catalogoAccesorios.map((opcion) => ({
      id: opcion.id,
      nombre: opcion.nombre,
      activo: true,
      modo: "porUnidad" as const,
      cantidad: "1",
    }));

  function handleAgregarAccesorioRapido(
    id: string
  ) {
    const opcion = catalogoAccesorios.find(
      (elemento) => elemento.id === id
    );

    if (!opcion) {
      return;
    }

    actualizarPresupuestoRapido({
      accesorios: [
        ...presupuestoRapido.accesorios,
        {
          id: opcion.id,
          nombre: opcion.nombre,
          activo: true,
          modo: "porUnidad",
          cantidad: "1",
        },
      ],
    });
  }

  return (
    <main className="p-5 text-white md:p-8 lg:p-10">
      <PageHeader
        titulo="Nuevo Presupuesto"
        subtitulo="Agregá uno o varios productos y calculá el pedido completo."
      />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-2 rounded-xl border border-[#2b2b2b] bg-[#171717] p-1 md:w-fit">
          <button
            type="button"
            onClick={() => setVista("nuevo")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              vista === "nuevo"
                ? "bg-[#810404] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Nuevo presupuesto
          </button>

          <button
            type="button"
            onClick={() => setVista("guardados")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              vista === "guardados"
                ? "bg-[#810404] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Guardados ({presupuestosGuardados.length})
          </button>
        </div>

        {vista === "nuevo" && (
          <button
            type="button"
            onClick={() =>
              setModoRapido(!modoRapido)
            }
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              modoRapido
                ? "bg-red-700 text-white"
                : "border border-[#3a3a3a] bg-[#151515] text-gray-300 hover:border-red-700"
            }`}
          >
            {modoRapido
              ? "✓ Modo rápido activo"
              : "⚡ Presupuesto rápido"}
          </button>
        )}
      </div>

      {vista === "nuevo" ? (
        <div className="mt-6 space-y-6">
          <MultiProductBudgetSummary
            cliente={presupuesto.cliente}
            items={itemsPresupuesto}
            totales={totalesPresupuesto}
            onEliminarItem={
              eliminarItemPresupuesto
            }
            onGuardar={
              manejarGuardarPresupuesto
            }
          />

          {modoRapido && (
            <QuickQuoteSection
              datos={presupuestoRapido}
              accesoriosDisponibles={
                accesoriosParaRapido
              }
              preciosSugeridos={preciosSugeridosRapido}
              onDatosChange={
                actualizarPresupuestoRapido
              }
              onAccesorioChange={
                actualizarAccesorioRapido
              }
              onAgregarAccesorio={
                handleAgregarAccesorioRapido
              }
              onAgregar={agregarItemRapido}
            />
          )}

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
            <div className="space-y-4">
              <BudgetOrderSection
                clientes={clientes}
                productos={productos}
                productoSeleccionadoId={
                  productoSeleccionadoId
                }
                productoSeleccionado={
                  productoSeleccionado
                }
                presupuesto={presupuesto}
                onSeleccionarProducto={
                  seleccionarProducto
                }
                onPresupuestoChange={
                  actualizarPresupuesto
                }
              />

              <details className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4">
                <summary className="cursor-pointer font-semibold">
                  Accesorios de este producto
                </summary>

                <div className="mt-4">
                  <BudgetAccessoriesSection
                    visible={Boolean(
                      productoSeleccionadoId
                    )}
                    accesorios={
                      accesoriosPresupuesto
                    }
                    onActualizarAccesorio={
                      actualizarAccesorio
                    }
                  />
                </div>
              </details>

              <details className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4">
                <summary className="cursor-pointer font-semibold">
                  Producción de este producto
                </summary>

                <div className="mt-4">
                  <BudgetProductionSection
                    usarHorasPersonalizadas={
                      usarHorasPersonalizadas
                    }
                    horasImpresionDiaPedido={
                      horasImpresionDiaPedido
                    }
                    horasDiariasCalculadas={
                      horasDiariasCalculadas
                    }
                    resultado={{
                      camas: resultado.camas,
                      tiempoTotalHoras:
                        resultado.tiempoTotalHoras,
                      tiempoTotalMinutos:
                        resultado.tiempoTotalMinutos,
                      kilosFilamento:
                        resultado.kilosFilamento,
                      rollosNecesarios:
                        resultado.rollosNecesarios,
                      diasProduccion:
                        resultado.diasProduccion,
                      pesoTotal:
                        resultado.pesoTotal,
                    }}
                    onSeleccionarHorasRapidas={
                      seleccionarHorasRapidas
                    }
                    onCambiarModoPersonalizado={
                      setUsarHorasPersonalizadas
                    }
                    onCambiarHoras={
                      setHorasImpresionDiaPedido
                    }
                  />
                </div>
              </details>
            </div>

            <div className="space-y-4 xl:sticky xl:top-6">
              <details
                open
                className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4"
              >
                <summary className="cursor-pointer font-semibold">
                  Desglose de costos
                </summary>

                <div className="mt-4">
                  <BudgetCostsSection
                    resultado={{
                      costoFilamento:
                        resultado.costoFilamento,
                      costoElectricidad:
                        resultado.costoElectricidad,
                      costoAmortizacion:
                        resultado.costoAmortizacion,
                      costoManoObra:
                        resultado.costoManoObra,
                      monotributoProporcional:
                        resultado.monotributoProporcional,
                      costoAccesorios:
                        resultado.costoAccesorios,
                      costoTotal:
                        resultado.costoTotal,
                      costoPorUnidad:
                        resultado.costoPorUnidad,
                      detalleAccesorios:
                        resultado.detalleAccesorios,
                    }}
                    minutosManualPorCama={
                      minutosManualPorCama
                    }
                    camasCalculadas={
                      camasCalculadas
                    }
                    minutosTrabajoManualBase={
                      minutosTrabajoManualBase
                    }
                    minutosTrabajoExtra={
                      minutosTrabajoExtra
                    }
                    minutosTrabajoPersonalTotal={
                      minutosTrabajoPersonalTotal
                    }
                  />
                </div>
              </details>

              <BudgetSaleSection
                cliente={presupuesto.cliente}
                producto={presupuesto.producto}
                cantidad={Number(
                  presupuesto.cantidadSolicitada ||
                    0
                )}
                resultado={{
                  costoTotal:
                    resultado.costoTotal,
                  precioMayorista:
                    resultado.precioMayorista,
                  mayoristaPorUnidad:
                    resultado.mayoristaPorUnidad,
                  precioMinorista:
                    resultado.precioMinorista,
                  minoristaPorUnidad:
                    resultado.minoristaPorUnidad,
                  tiempoTotalMinutos:
                    resultado.tiempoTotalMinutos,
                  diasProduccion:
                    resultado.diasProduccion,
                  kilosFilamento:
                    resultado.kilosFilamento,
                }}
                porcentajeMayorista={
                  config.margenMayorista
                }
                porcentajeMinorista={
                  config.margenMinorista
                }
                horasImpresionDia={
                  horasDiariasCalculadas
                }
                trabajoManualMinutos={
                  minutosTrabajoPersonalTotal
                }
                preciosFinales={preciosFinales}
                onPreciosChange={
                  setPreciosFinales
                }
                onAgregarProducto={
                  agregarProductoAlPresupuesto
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <SavedBudgetsCard
            presupuestos={presupuestosGuardados}
            onEliminar={
              manejarEliminarPresupuesto
            }
          />
        </div>
      )}
    </main>
  );
}