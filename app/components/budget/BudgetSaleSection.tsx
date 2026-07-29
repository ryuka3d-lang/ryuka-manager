"use client";

import SaleSimulatorCard, {
  type PrecioFinalVenta,
} from "./SaleSimulatorCard";
import BudgetPreviewCard from "./BudgetPreviewCard";
import CopyBudgetButtons from "./CopyBudgetButtons";
import SaveBudgetSection from "./SaveBudgetSection";

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

  onGuardar: () => void;
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
  onGuardar,
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
        onPreciosChange={
          onPreciosChange
        }
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
        costoTotal={
          resultado.costoTotal
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

      <SaveBudgetSection
        onGuardar={onGuardar}
      />
    </>
  );
}