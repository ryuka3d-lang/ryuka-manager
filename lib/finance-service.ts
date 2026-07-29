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
