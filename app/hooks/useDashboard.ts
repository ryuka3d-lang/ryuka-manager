"use client";

import { useEffect, useMemo, useState } from "react";

import {
  obtenerPresupuestos,
  type PresupuestoGuardado,
} from "../../lib/budget-service";

export type DashboardMetricas = {
  cantidadPresupuestos: number;
  valorPotencialMayorista: number;
  gananciaPotencialMayorista: number;
  presupuestoMasGrande: PresupuestoGuardado | null;
};

const METRICAS_INICIALES: DashboardMetricas = {
  cantidadPresupuestos: 0,
  valorPotencialMayorista: 0,
  gananciaPotencialMayorista: 0,
  presupuestoMasGrande: null,
};

export default function useDashboard() {
  const [presupuestos, setPresupuestos] = useState<
    PresupuestoGuardado[]
  >([]);

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setPresupuestos(obtenerPresupuestos());
    setCargando(false);
  }, []);

  const metricas = useMemo<DashboardMetricas>(() => {
    if (presupuestos.length === 0) {
      return METRICAS_INICIALES;
    }

    const valorPotencialMayorista =
      presupuestos.reduce(
        (total, presupuesto) =>
          total +
          presupuesto.precioMayoristaTotal,
        0
      );

    const gananciaPotencialMayorista =
      presupuestos.reduce(
        (total, presupuesto) =>
          total +
          presupuesto.gananciaMayorista,
        0
      );

    const presupuestoMasGrande =
      presupuestos.reduce(
        (mayor, presupuesto) =>
          presupuesto.precioMayoristaTotal >
          mayor.precioMayoristaTotal
            ? presupuesto
            : mayor
      );

    return {
      cantidadPresupuestos:
        presupuestos.length,

      valorPotencialMayorista,
      gananciaPotencialMayorista,
      presupuestoMasGrande,
    };
  }, [presupuestos]);

  return {
    cargando,
    presupuestos,
    metricas,
  };
}