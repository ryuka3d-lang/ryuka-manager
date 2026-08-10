import { obtenerCompras } from "./purchase-service";
import { obtenerPagosPedidos } from "./payment-service";
import { obtenerPedidosProduccion } from "./production-service";

const MOVIMIENTOS_KEY = "ryuka-movimientos-caja";

export type TipoMovimientoCaja = "ingreso" | "egreso";

export type OrigenMovimientoCaja = "manual" | "compra" | "cobro";

export type MovimientoCaja = {
  id: string;
  tipo: TipoMovimientoCaja;
  origen: OrigenMovimientoCaja;
  fecha: string;
  concepto: string;
  categoria: string;
  monto: number;
  medioPago: string;
  referencia: string;
  notas: string;
  creadoEn: string;
  editable: boolean;
};

export type NuevoMovimientoCaja = Omit<
  MovimientoCaja,
  "id" | "origen" | "creadoEn" | "editable"
>;

export type ResumenCaja = {
  ingresos: number;
  egresos: number;
  saldo: number;
  ingresosMes: number;
  egresosMes: number;
  resultadoMes: number;
};

function disponible() {
  return typeof window !== "undefined";
}

function guardarLista(movimientos: MovimientoCaja[]) {
  if (!disponible()) return;
  localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos));
}

function normalizarMovimiento(
  movimiento: Partial<MovimientoCaja>
): MovimientoCaja {
  const ahora = new Date().toISOString();

  return {
    id: movimiento.id || "MOV-0000",
    tipo: movimiento.tipo === "egreso" ? "egreso" : "ingreso",
    origen:
      movimiento.origen === "compra" || movimiento.origen === "cobro"
        ? movimiento.origen
        : "manual",
    fecha: movimiento.fecha || ahora.slice(0, 10),
    concepto: movimiento.concepto?.trim() || "Movimiento sin concepto",
    categoria: movimiento.categoria?.trim() || "Otros",
    monto: Math.abs(Number(movimiento.monto) || 0),
    medioPago: movimiento.medioPago?.trim() || "Sin especificar",
    referencia: movimiento.referencia?.trim() || "",
    notas: movimiento.notas?.trim() || "",
    creadoEn: movimiento.creadoEn || ahora,
    editable: movimiento.origen === "manual",
  };
}

function generarId(existentes: MovimientoCaja[]) {
  const numeros = existentes.map((movimiento) => {
    const numero = Number(movimiento.id.replace("CAJ-", ""));
    return Number.isNaN(numero) ? 0 : numero;
  });

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  return `CAJ-${String(siguiente).padStart(4, "0")}`;
}

export function obtenerMovimientosManuales(): MovimientoCaja[] {
  if (!disponible()) return [];

  const datos = localStorage.getItem(MOVIMIENTOS_KEY);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    if (!Array.isArray(parseados)) return [];

    const normalizados = parseados.map(normalizarMovimiento);
    guardarLista(normalizados);
    return normalizados;
  } catch {
    console.error("No se pudieron leer los movimientos de caja.");
    return [];
  }
}

function obtenerMovimientosCompras(): MovimientoCaja[] {
  return obtenerCompras().map((compra) => ({
    id: `COMPRA-${compra.id}`,
    tipo: "egreso",
    origen: "compra",
    fecha: compra.fecha,
    concepto: compra.descripcion,
    categoria: compra.tipo === "filamento" ? "Filamento" : "Insumos",
    monto: Math.abs(Number(compra.precioTotal) || 0),
    medioPago: compra.medioPago || "Sin especificar",
    referencia: compra.id,
    notas: compra.proveedor
      ? `Proveedor: ${compra.proveedor}${compra.notas ? ` · ${compra.notas}` : ""}`
      : compra.notas,
    creadoEn: compra.creadoEn,
    editable: false,
  }));
}


function obtenerMovimientosCobros(): MovimientoCaja[] {
  const pedidos = obtenerPedidosProduccion();

  return obtenerPagosPedidos().map((pago) => {
    const pedido = pedidos.find((actual) => actual.id === pago.pedidoId);
    const etiquetaTipo =
      pago.tipo === "pago_final"
        ? "Pago final"
        : pago.tipo === "otro"
          ? "Cobro"
          : "Seña";

    return {
      id: `COBRO-${pago.id}`,
      tipo: "ingreso",
      origen: "cobro",
      fecha: pago.fecha,
      concepto: `${etiquetaTipo} · ${pedido?.productoNombre || pago.pedidoId}`,
      categoria: pago.tipo === "seña" ? "Seña" : "Venta",
      monto: pago.monto,
      medioPago: pago.medioPago,
      referencia: pago.pedidoId,
      notas: `${pedido?.cliente ? `Cliente: ${pedido.cliente}` : ""}${
        pago.notas ? `${pedido?.cliente ? " · " : ""}${pago.notas}` : ""
      }`,
      creadoEn: pago.creadoEn,
      editable: false,
    };
  });
}

export function obtenerMovimientosCaja(): MovimientoCaja[] {
  return [
    ...obtenerMovimientosManuales(),
    ...obtenerMovimientosCompras(),
    ...obtenerMovimientosCobros(),
  ].sort(
    (a, b) => {
      const fechaA = new Date(`${a.fecha}T12:00:00`).getTime();
      const fechaB = new Date(`${b.fecha}T12:00:00`).getTime();
      if (fechaA !== fechaB) return fechaB - fechaA;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    }
  );
}

export function registrarMovimientoCaja(
  datos: NuevoMovimientoCaja
): MovimientoCaja | null {
  const monto = Math.abs(Number(datos.monto) || 0);
  if (!datos.concepto.trim() || monto <= 0 || !datos.fecha) return null;

  const movimientos = obtenerMovimientosManuales();
  const ahora = new Date().toISOString();

  const movimiento: MovimientoCaja = {
    ...datos,
    id: generarId(movimientos),
    monto,
    concepto: datos.concepto.trim(),
    categoria: datos.categoria.trim() || "Otros",
    medioPago: datos.medioPago.trim() || "Sin especificar",
    referencia: datos.referencia.trim(),
    notas: datos.notas.trim(),
    origen: "manual",
    creadoEn: ahora,
    editable: true,
  };

  guardarLista([movimiento, ...movimientos]);
  return movimiento;
}

export function editarMovimientoCaja(
  id: string,
  cambios: Partial<NuevoMovimientoCaja>
): MovimientoCaja | null {
  const movimientos = obtenerMovimientosManuales();
  let actualizado: MovimientoCaja | null = null;

  const lista = movimientos.map((movimiento) => {
    if (movimiento.id !== id) return movimiento;

    const monto =
      cambios.monto !== undefined
        ? Math.abs(Number(cambios.monto) || 0)
        : movimiento.monto;

    if (monto <= 0) return movimiento;

    actualizado = normalizarMovimiento({
      ...movimiento,
      ...cambios,
      monto,
      origen: "manual",
      editable: true,
    });

    return actualizado;
  });

  if (!actualizado) return null;
  guardarLista(lista);
  return actualizado;
}

export function eliminarMovimientoCaja(id: string): boolean {
  const movimientos = obtenerMovimientosManuales();
  const lista = movimientos.filter((movimiento) => movimiento.id !== id);

  if (lista.length === movimientos.length) return false;
  guardarLista(lista);
  return true;
}

export function obtenerResumenCaja(
  movimientos = obtenerMovimientosCaja(),
  fechaReferencia = new Date()
): ResumenCaja {
  const mes = fechaReferencia.getMonth();
  const anio = fechaReferencia.getFullYear();

  let ingresos = 0;
  let egresos = 0;
  let ingresosMes = 0;
  let egresosMes = 0;

  for (const movimiento of movimientos) {
    const monto = Math.abs(Number(movimiento.monto) || 0);
    const fecha = new Date(`${movimiento.fecha}T12:00:00`);
    const esMes = fecha.getMonth() === mes && fecha.getFullYear() === anio;

    if (movimiento.tipo === "ingreso") {
      ingresos += monto;
      if (esMes) ingresosMes += monto;
    } else {
      egresos += monto;
      if (esMes) egresosMes += monto;
    }
  }

  return {
    ingresos,
    egresos,
    saldo: ingresos - egresos,
    ingresosMes,
    egresosMes,
    resultadoMes: ingresosMes - egresosMes,
  };
}


export type EstadoObjetivoFinanciero = {
  objetivo: number;
  cubierto: number;
  faltante: number;
  porcentaje: number;
  completo: boolean;
};

export type CentroFinanciero = {
  saldoCaja: number;
  ingresosMes: number;
  egresosMes: number;
  disponibleParaRetirar: number;
  totalAReservar: number;
  mensajePrincipal: string;

  sueldo: EstadoObjetivoFinanciero;
  monotributo: EstadoObjetivoFinanciero;
  electricidad: EstadoObjetivoFinanciero;
  reinversion: EstadoObjetivoFinanciero;

  sueldoPagadoMes: number;
  monotributoPagadoMes: number;
  electricidadPagadaMes: number;
  reinversionUsadaMes: number;
};

function sumarEgresosCategoriaMes(
  movimientos: MovimientoCaja[],
  categorias: string[],
  fechaReferencia: Date
) {
  const mes = fechaReferencia.getMonth();
  const anio = fechaReferencia.getFullYear();
  const categoriasNormalizadas = categorias.map((categoria) =>
    categoria.trim().toLocaleLowerCase("es-AR")
  );

  return movimientos.reduce((total, movimiento) => {
    if (movimiento.tipo !== "egreso") return total;

    const fecha = new Date(`${movimiento.fecha}T12:00:00`);
    const esMes =
      fecha.getMonth() === mes &&
      fecha.getFullYear() === anio;

    const coincideCategoria =
      categoriasNormalizadas.includes(
        movimiento.categoria
          .trim()
          .toLocaleLowerCase("es-AR")
      );

    return esMes && coincideCategoria
      ? total + Math.abs(Number(movimiento.monto) || 0)
      : total;
  }, 0);
}

function crearEstadoObjetivo(
  objetivo: number,
  yaCubierto: number,
  disponibleParaReservar: number
): {
  estado: EstadoObjetivoFinanciero;
  restanteDisponible: number;
} {
  const objetivoSeguro = Math.max(0, objetivo);
  const cubiertoPreviamente = Math.min(
    objetivoSeguro,
    Math.max(0, yaCubierto)
  );
  const pendiente = Math.max(
    0,
    objetivoSeguro - cubiertoPreviamente
  );
  const reservadoAhora = Math.min(
    pendiente,
    Math.max(0, disponibleParaReservar)
  );
  const cubierto = cubiertoPreviamente + reservadoAhora;
  const faltante = Math.max(0, objetivoSeguro - cubierto);

  return {
    estado: {
      objetivo: objetivoSeguro,
      cubierto,
      faltante,
      porcentaje:
        objetivoSeguro <= 0
          ? 100
          : Math.min(
              100,
              (cubierto / objetivoSeguro) * 100
            ),
      completo: faltante <= 0.01,
    },
    restanteDisponible: Math.max(
      0,
      disponibleParaReservar - reservadoAhora
    ),
  };
}

export function obtenerCentroFinanciero(
  movimientos = obtenerMovimientosCaja(),
  configuracion?: {
    sueldoMensual: number;
    monotributo: number;
    reinversionPorcentaje: number;
    electricidadAReponer: number;
  },
  fechaReferencia = new Date()
): CentroFinanciero {
  const config =
    configuracion ??
    ({
      sueldoMensual: 500000,
      monotributo: 52000,
      reinversionPorcentaje: 15,
      electricidadAReponer: 0,
    } as const);

  const resumen = obtenerResumenCaja(
    movimientos,
    fechaReferencia
  );

  const sueldoPagadoMes = sumarEgresosCategoriaMes(
    movimientos,
    ["Retiro de sueldo"],
    fechaReferencia
  );

  const monotributoPagadoMes =
    sumarEgresosCategoriaMes(
      movimientos,
      ["Monotributo"],
      fechaReferencia
    );

  const electricidadPagadaMes =
    sumarEgresosCategoriaMes(
      movimientos,
      ["Electricidad"],
      fechaReferencia
    );

  const reinversionUsadaMes =
    sumarEgresosCategoriaMes(
      movimientos,
      ["Reinversión", "Reinversion"],
      fechaReferencia
    );

  const reinversionObjetivo = Math.max(
    0,
    resumen.ingresosMes *
      (Math.max(
        0,
        Math.min(100, config.reinversionPorcentaje)
      ) /
        100)
  );

  let disponible = Math.max(0, resumen.saldo);

  // Priorizamos obligaciones que no conviene postergar.
  const monotributo = crearEstadoObjetivo(
    config.monotributo,
    monotributoPagadoMes,
    disponible
  );
  disponible = monotributo.restanteDisponible;

  const electricidad = crearEstadoObjetivo(
    config.electricidadAReponer,
    electricidadPagadaMes,
    disponible
  );
  disponible = electricidad.restanteDisponible;

  const sueldo = crearEstadoObjetivo(
    config.sueldoMensual,
    sueldoPagadoMes,
    disponible
  );
  disponible = sueldo.restanteDisponible;

  const reinversion = crearEstadoObjetivo(
    reinversionObjetivo,
    reinversionUsadaMes,
    disponible
  );
  disponible = reinversion.restanteDisponible;

  const totalAReservar =
    monotributo.estado.faltante +
    electricidad.estado.faltante +
    sueldo.estado.faltante +
    reinversion.estado.faltante;

  const todosCubiertos =
    sueldo.estado.completo &&
    monotributo.estado.completo &&
    electricidad.estado.completo &&
    reinversion.estado.completo;

  let mensajePrincipal =
    "Todavía no conviene retirar dinero.";

  if (todosCubiertos && disponible > 0) {
    mensajePrincipal =
      "Ya podés retirar este monto sin tocar las reservas del mes.";
  } else if (!monotributo.estado.completo) {
    mensajePrincipal = `Faltan ${Math.ceil(
      monotributo.estado.faltante
    ).toLocaleString("es-AR")} para cubrir el monotributo.`;
  } else if (!electricidad.estado.completo) {
    mensajePrincipal = `Faltan ${Math.ceil(
      electricidad.estado.faltante
    ).toLocaleString("es-AR")} para reponer la electricidad.`;
  } else if (!sueldo.estado.completo) {
    mensajePrincipal = `Faltan ${Math.ceil(
      sueldo.estado.faltante
    ).toLocaleString("es-AR")} para completar el fondo salarial.`;
  } else if (!reinversion.estado.completo) {
    mensajePrincipal = `Faltan ${Math.ceil(
      reinversion.estado.faltante
    ).toLocaleString("es-AR")} para completar la reinversión.`;
  } else if (todosCubiertos && disponible <= 0) {
    mensajePrincipal =
      "Todo está cubierto, pero todavía no queda excedente para retirar.";
  }

  return {
    saldoCaja: resumen.saldo,
    ingresosMes: resumen.ingresosMes,
    egresosMes: resumen.egresosMes,
    disponibleParaRetirar: todosCubiertos
      ? disponible
      : 0,
    totalAReservar,
    mensajePrincipal,

    sueldo: sueldo.estado,
    monotributo: monotributo.estado,
    electricidad: electricidad.estado,
    reinversion: reinversion.estado,

    sueldoPagadoMes,
    monotributoPagadoMes,
    electricidadPagadaMes,
    reinversionUsadaMes,
  };
}
