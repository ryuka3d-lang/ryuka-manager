"use client";

import { useEffect, useState } from "react";
import {
  obtenerPresupuestos,
} from "../../lib/budget-service";
import {
  obtenerMovimientosCaja,
  obtenerResumenCaja,
} from "../../lib/finance-service";
import { obtenerProductos } from "../../lib/product-service";

export type MetricasDashboard = {
  facturacionMes: number;
  gananciaNetaMes: number;
  pedidosCompletados: number;
  ticketPromedio: number;
  historial6Meses: { mes: string; ingresos: number; egresos: number }[];
  topProductos: { nombre: string; cantidad: number; total: number }[];
  prioridades: { titulo: string; detalle: string; estado: "urgente" | "atencion" | "info" }[];
  cargando: boolean;
};

const METRICAS_INICIALES: MetricasDashboard = {
  facturacionMes: 0,
  gananciaNetaMes: 0,
  pedidosCompletados: 0,
  ticketPromedio: 0,
  historial6Meses: [],
  topProductos: [],
  prioridades: [],
  cargando: true,
};

export default function useDashboard() {
  const [metricas, setMetricas] = useState<MetricasDashboard>(METRICAS_INICIALES);

  useEffect(() => {
    const calcular = () => {
      const movimientos = obtenerMovimientosCaja();
      const presupuestos = obtenerPresupuestos();
      const ahora = new Date();

      // 1. KPIs del mes actual
      const resumenMes = obtenerResumenCaja(movimientos, ahora);
      const cobrosMes = movimientos.filter(
        (m) =>
          m.tipo === "ingreso" &&
          m.origen === "cobro" &&
          new Date(`${m.fecha}T12:00:00`).getMonth() === ahora.getMonth() &&
          new Date(`${m.fecha}T12:00:00`).getFullYear() === ahora.getFullYear()
      );
      
      const facturacionMes = resumenMes.ingresosMes;
      const gananciaNetaMes = resumenMes.resultadoMes;
      const pedidosCompletados = cobrosMes.length;
      const ticketPromedio = pedidosCompletados > 0 ? facturacionMes / pedidosCompletados : 0;

      // 2. Historial 6 meses
      const historial6Meses = Array.from({ length: 6 }, (_, i) => {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const resumen = obtenerResumenCaja(movimientos, fecha);
        const nombreMes = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(fecha);
        return {
          mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
          ingresos: resumen.ingresosMes,
          egresos: resumen.egresosMes,
        };
      }).reverse();

      // 3. Top 5 productos (de presupuestos)
      const productoStats = new Map<string, { cantidad: number; total: number }>();
      presupuestos.forEach((p) => {
        p.items.forEach((item) => {
          const actual = productoStats.get(item.productName) || { cantidad: 0, total: 0 };
          actual.cantidad += item.quantity;
          actual.total += item.wholesaleTotal;
          productoStats.set(item.productName, actual);
        });
      });

      const topProductos = Array.from(productoStats.entries())
        .map(([nombre, stats]) => ({ nombre, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // 4. Prioridades dinámicas
      const prioridades = [];
      
      if (resumenMes.saldo < 0) {
        prioridades.push({
          titulo: "⚠️ Caja en negativo",
          detalle: `El saldo actual es de ${formatearDinero(resumenMes.saldo)}. Revisar cobros pendientes.`,
          estado: "urgente" as const,
        });
      }
      
      const presupuestosPendientes = presupuestos.filter((p) => p.estado === "borrador" || p.estado === "enviado").length;
      if (presupuestosPendientes > 0) {
        prioridades.push({
          titulo: "📋 Presupuestos sin cerrar",
          detalle: `Tenés ${presupuestosPendientes} presupuestos que aún no fueron aceptados o rechazados.`,
          estado: "atencion" as const,
        });
      }

      if (prioridades.length === 0) {
        prioridades.push({
          titulo: "✅ Todo en orden",
          detalle: "No hay alertas críticas. ¡Buen trabajo!",
          estado: "info" as const,
        });
      }

      setMetricas({
        facturacionMes,
        gananciaNetaMes,
        pedidosCompletados,
        ticketPromedio,
        historial6Meses,
        topProductos,
        prioridades,
        cargando: false,
      });
    };

    calcular();
  }, []);

  return metricas;
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}