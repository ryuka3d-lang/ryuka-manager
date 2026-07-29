import type { Accesorio } from "../app/types/producto";

export type PresupuestoData = {
  cantidadSolicitada: number;
  cantidadPorCama: number;
  pesoPorCama: number;

  horasPorCama: number;
  minutosPorCama: number;

  horasTrabajoPersonal: number;
  minutosTrabajoPersonal: number;

  colores: number;
  accesorios: Accesorio[];
};

export type ConfiguracionCostos = {
  precioKgFilamento: number;

  costoElectricidadHora: number;
  amortizacionHora: number;

  horasProductivas: number;
  horasImpresionDia: number;

  sueldoMensual: number;
  monotributo: number;

  costoArgolla: number;
  costoSticker: number;
  costoCaja: number;
  costoBolsa: number;

  margenMayorista: number;
  margenMinorista: number;
};

export type DetalleAccesorio = {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  costoTotal: number;
};

function obtenerPrecioAccesorio(
  id: string,
  config: ConfiguracionCostos
) {
  const precios: Record<string, number> = {
    argolla: config.costoArgolla,
    sticker: config.costoSticker,
    caja: config.costoCaja,
    bolsa: config.costoBolsa,
  };

  return precios[id] ?? 0;
}

function aplicarGanancia(
  costo: number,
  porcentaje: number
) {
  return costo * (1 + Math.max(0, porcentaje) / 100);
}

export function calcularPresupuesto(
  data: PresupuestoData,
  config: ConfiguracionCostos
) {
  const cantidadSolicitada = Math.max(
    0,
    data.cantidadSolicitada
  );

  const cantidadPorCama = Math.max(
    1,
    data.cantidadPorCama
  );

  const camas =
    cantidadSolicitada > 0
      ? Math.ceil(
          cantidadSolicitada / cantidadPorCama
        )
      : 0;

  /*
   * PRODUCCIÓN
   */

  const pesoPorCama = Math.max(
    0,
    data.pesoPorCama
  );

  const pesoTotal =
    camas * pesoPorCama;

  const kilosFilamento =
    pesoTotal / 1000;

  const rollosNecesarios =
    pesoTotal > 0
      ? Math.ceil(pesoTotal / 1000)
      : 0;

  const minutosImpresionPorCama =
    Math.max(0, data.horasPorCama) * 60 +
    Math.max(0, data.minutosPorCama);

  const tiempoTotalMinutos =
    camas * minutosImpresionPorCama;

  const tiempoTotalHoras =
    tiempoTotalMinutos / 60;

  const horasImpresionDia = Math.max(
    1,
    config.horasImpresionDia
  );

  const diasProduccion =
    tiempoTotalHoras / horasImpresionDia;

  /*
   * COSTOS DE IMPRESIÓN
   */

  const costoFilamento =
    kilosFilamento *
    Math.max(0, config.precioKgFilamento);

  const costoElectricidad =
    tiempoTotalHoras *
    Math.max(0, config.costoElectricidadHora);

  const costoAmortizacion =
    tiempoTotalHoras *
    Math.max(0, config.amortizacionHora);

  /*
   * HORAS PRODUCTIVAS Y COSTOS MENSUALES
   */

  const horasProductivas = Math.max(
    1,
    config.horasProductivas
  );

  /*
   * Valor hora destinado al sueldo.
   *
   * Ejemplo:
   * $1.000.000 ÷ 160 horas = $6.250 por hora.
   */

  const valorHoraPersonal =
    Math.max(0, config.sueldoMensual) /
    horasProductivas;

  /*
   * Trabajo manual del pedido.
   *
   * Ejemplo:
   * 1 hora y 30 minutos = 1,5 horas.
   */

  const minutosTrabajoPersonal =
    Math.max(0, data.horasTrabajoPersonal) * 60 +
    Math.max(0, data.minutosTrabajoPersonal);

  const horasTrabajoPersonal =
    minutosTrabajoPersonal / 60;

  const costoManoObra =
    horasTrabajoPersonal *
    valorHoraPersonal;

  /*
   * Monotributo proporcional.
   *
   * El pedido NO paga el monotributo completo.
   *
   * Primero calculamos cuánto representa por hora
   * productiva y luego lo aplicamos al tiempo total
   * de impresión.
   */

  const costoMonotributoHora =
    Math.max(0, config.monotributo) /
    horasProductivas;

  const monotributoProporcional =
    tiempoTotalHoras *
    costoMonotributoHora;

  /*
   * ACCESORIOS
   */

  const detalleAccesorios: DetalleAccesorio[] =
    data.accesorios
      .filter((accesorio) => accesorio.activo)
      .map((accesorio) => {
        const cantidadConfigurada = Math.max(
          0,
          Number(accesorio.cantidad) || 0
        );

        const cantidad =
          accesorio.modo === "porUnidad"
            ? cantidadConfigurada *
              cantidadSolicitada
            : cantidadConfigurada;

        const precioUnitario =
          obtenerPrecioAccesorio(
            accesorio.id,
            config
          );

        return {
          id: accesorio.id,
          nombre: accesorio.nombre,
          cantidad,
          precioUnitario,
          costoTotal:
            cantidad * precioUnitario,
        };
      });

  const costoAccesorios =
    detalleAccesorios.reduce(
      (total, accesorio) =>
        total + accesorio.costoTotal,
      0
    );

  /*
   * COSTO REAL DEL PEDIDO
   */

  const costoTotal =
    costoFilamento +
    costoElectricidad +
    costoAmortizacion +
    costoManoObra +
    monotributoProporcional +
    costoAccesorios;

  const costoPorUnidad =
    cantidadSolicitada > 0
      ? costoTotal / cantidadSolicitada
      : 0;

  /*
   * PRECIOS DE VENTA
   */

  const precioMayorista =
    aplicarGanancia(
      costoTotal,
      config.margenMayorista
    );

  const precioMinorista =
    aplicarGanancia(
      costoTotal,
      config.margenMinorista
    );

  const mayoristaPorUnidad =
    cantidadSolicitada > 0
      ? precioMayorista /
        cantidadSolicitada
      : 0;

  const minoristaPorUnidad =
    cantidadSolicitada > 0
      ? precioMinorista /
        cantidadSolicitada
      : 0;

  /*
   * GANANCIAS
   */

  const gananciaMayorista =
    precioMayorista - costoTotal;

  const gananciaMinorista =
    precioMinorista - costoTotal;

  /*
   * Margen real sobre la venta:
   *
   * ganancia ÷ precio de venta × 100
   */

  const margenVentaMayorista =
    precioMayorista > 0
      ? (
          gananciaMayorista /
          precioMayorista
        ) * 100
      : 0;

  const margenVentaMinorista =
    precioMinorista > 0
      ? (
          gananciaMinorista /
          precioMinorista
        ) * 100
      : 0;

  return {
    camas,

    pesoTotal,
    kilosFilamento,
    rollosNecesarios,

    minutosImpresionPorCama,
    tiempoTotalMinutos,
    tiempoTotalHoras,
    diasProduccion,

    costoFilamento,
    costoElectricidad,
    costoAmortizacion,

    valorHoraPersonal,
    minutosTrabajoPersonal,
    horasTrabajoPersonal,
    costoManoObra,

    costoMonotributoHora,
    monotributoProporcional,

    detalleAccesorios,
    costoAccesorios,

    costoTotal,
    costoPorUnidad,

    precioMayorista,
    mayoristaPorUnidad,
    gananciaMayorista,
    margenVentaMayorista,

    precioMinorista,
    minoristaPorUnidad,
    gananciaMinorista,
    margenVentaMinorista,
  };
}