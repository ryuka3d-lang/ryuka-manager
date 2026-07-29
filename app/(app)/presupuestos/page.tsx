"use client";

import { useState } from "react";

import PageHeader from "@/app/components/PageHeader";
import SavedBudgetsCard from "@/app/components/budget/SavedBudgetsCard";
import BudgetOrderSection from "@/app/components/budget/BudgetOrderSection";
import BudgetAccessoriesSection from "@/app/components/budget/BudgetAccessories";
import BudgetProductionSection from "@/app/components/budget/BudgetProductionSection";
import BudgetCostsSection from "@/app/components/budget/BudgetCostsSection";
import BudgetSaleSection from "@/app/components/budget/BudgetSaleSection";
import useBudget from "@/app/hooks/useBudget";

export default function PresupuestosPage() {
  const [vista, setVista] = useState<"nuevo" | "guardados">("nuevo");
  const {
    clientes,
    productos,
    productoSeleccionadoId,
    productoSeleccionado,

    presupuesto,
    actualizarPresupuesto,
    seleccionarProducto,

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

    presupuestosGuardados,
    manejarGuardarPresupuesto,
    manejarEliminarPresupuesto,
  } = useBudget();

  return (
    <main className="p-5 text-white md:p-8 lg:p-10">
      <PageHeader
        titulo="Nuevo Presupuesto"
        subtitulo="Elegí un producto y calculá automáticamente el pedido."
      />

      <div className="mt-6 flex gap-2 rounded-xl border border-[#2b2b2b] bg-[#171717] p-1 md:w-fit">
        <button type="button" onClick={() => setVista("nuevo")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${vista === "nuevo" ? "bg-[#810404] text-white" : "text-gray-400 hover:text-white"}`}>Nuevo presupuesto</button>
        <button type="button" onClick={() => setVista("guardados")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${vista === "guardados" ? "bg-[#810404] text-white" : "text-gray-400 hover:text-white"}`}>Guardados ({presupuestosGuardados.length})</button>
      </div>

      {vista === "nuevo" ? (
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
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

      <details className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4"><summary className="cursor-pointer font-semibold">Accesorios del pedido</summary><div className="mt-4"><BudgetAccessoriesSection
        visible={Boolean(
          productoSeleccionadoId
        )}
        accesorios={accesoriosPresupuesto}
        onActualizarAccesorio={
          actualizarAccesorio
        }
      /></div></details>

      <details className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4"><summary className="cursor-pointer font-semibold">Producción y entrega</summary><div className="mt-4"><BudgetProductionSection
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
          pesoTotal: resultado.pesoTotal,
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
      /></div></details>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6">
      <details open className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-4"><summary className="cursor-pointer font-semibold">Desglose de costos</summary><div className="mt-4"><BudgetCostsSection
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
      /></div></details>

      <BudgetSaleSection
        cliente={presupuesto.cliente}
        producto={presupuesto.producto}
        cantidad={Number(
          presupuesto.cantidadSolicitada || 0
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
        onGuardar={
          manejarGuardarPresupuesto
        }
      />

      </div>
      </div>
      ) : (
        <div className="mt-6">
          <SavedBudgetsCard
            presupuestos={presupuestosGuardados}
            onEliminar={manejarEliminarPresupuesto}
          />
        </div>
      )}
    </main>
  );
}