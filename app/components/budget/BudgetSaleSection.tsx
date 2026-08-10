"use client";

import SaleSimulatorCard, {
  type PrecioFinalVenta,
} from "./SaleSimulatorCard";

import BudgetPreviewCard from "./BudgetPreviewCard";
import CopyBudgetButtons from "./CopyBudgetButtons";

type Props = {
  cliente: string;
  producto: string;
  cantidad: number;

  resultado: {
    costoTotal: number;
    precioMayorista: number;
    mayoristaPorUnidad: number;
    precioMinorista: number;
    minoristaPorUnidad: number;
    tiempoTotalMinutos: number;
    diasProduccion: number;
    kilosFilamento: number;
  };

  porcentajeMayorista: number;
  porcentajeMinorista: number;

  horasImpresionDia: number;
  trabajoManualMinutos: number;

  preciosFinales: PrecioFinalVenta;

  onPreciosChange: (
    precios: PrecioFinalVenta
  ) => void;

  onAgregarProducto: () => void;
};

export default function BudgetSaleSection({
  cliente,
  producto,
  cantidad,
  resultado,
  porcentajeMayorista,
  porcentajeMinorista,
  horasImpresionDia,
  trabajoManualMinutos,
  preciosFinales,
  onPreciosChange,
  onAgregarProducto,
}: Props) {
  return (
    <>
      <SaleSimulatorCard
        cantidad={cantidad}
        costoTotal={resultado.costoTotal}
        precioMayoristaCalculado={
          resultado.precioMayorista
        }
        mayoristaPorUnidadCalculado={
          resultado.mayoristaPorUnidad
        }
        porcentajeMayorista={
          porcentajeMayorista
        }
        precioMinoristaCalculado={
          resultado.precioMinorista
        }
        minoristaPorUnidadCalculado={
          resultado.minoristaPorUnidad
        }
        porcentajeMinorista={
          porcentajeMinorista
        }
        onPreciosChange={onPreciosChange}
      />

      <BudgetPreviewCard
        cliente={cliente}
        producto={producto}
        cantidad={cantidad}
        tiempoTotalMinutos={
          resultado.tiempoTotalMinutos
        }
        diasProduccion={
          resultado.diasProduccion
        }
        horasImpresionDia={
          horasImpresionDia
        }
        kilosFilamento={
          resultado.kilosFilamento
        }
        trabajoManualMinutos={
          trabajoManualMinutos
        }
        costoTotal={resultado.costoTotal}
        precioMayoristaUnitario={
          preciosFinales.mayoristaUnitario
        }
        precioMayoristaTotal={
          preciosFinales.mayoristaTotal
        }
        precioMinoristaUnitario={
          preciosFinales.minoristaUnitario
        }
        precioMinoristaTotal={
          preciosFinales.minoristaTotal
        }
      />

      <CopyBudgetButtons
        cliente={cliente}
        producto={producto}
        cantidad={cantidad}
        diasProduccion={
          resultado.diasProduccion
        }
        horasImpresionDia={
          horasImpresionDia
        }
        precioMayoristaUnitario={
          preciosFinales.mayoristaUnitario
        }
        precioMayoristaTotal={
          preciosFinales.mayoristaTotal
        }
        precioMinoristaUnitario={
          preciosFinales.minoristaUnitario
        }
        precioMinoristaTotal={
          preciosFinales.minoristaTotal
        }
      />

      <section className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5">
        <h2 className="text-lg font-bold">
          Agregar al presupuesto
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Este producto se sumará a la lista. Después podés
          elegir otro producto y repetir el proceso.
        </p>

        <button
          type="button"
          onClick={onAgregarProducto}
          className="mt-5 w-full rounded-xl bg-[#810404] px-6 py-3 font-semibold transition hover:bg-[#a00808]"
        >
          + Agregar producto
        </button>
      </section>
    </>
  );
}
