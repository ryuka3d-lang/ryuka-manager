import type { PresupuestoGuardado } from "./budget-service";
import { obtenerProductos } from "./product-service";
import {
  crearDescripcionBobina,
  obtenerBobinas,
  pedidoYaConsumioFilamento,
  registrarMovimientoFilamento,
  reponerFilamentoDePedido,
} from "./stock-service";

const STORAGE_KEY = "ryuka-pedidos-produccion";
const STORAGE_EVENT = "ryuka-pedidos-produccion-update";

export type EstadoPedido =
  | "pendiente"
  | "imprimiendo"
  | "empaquetando"
  | "listo"
  | "entregado";

export type ConsumoFilamentoPedido = {
  material: string;
  color: string;
  gramos: number;
  bobinaId: string;
  bobinaDescripcion: string;
  costoPorGramo: number;
  costoTotal: number;
};

export type RequerimientoFilamento = {
  clave: string;
  material: string;
  color: string;
  gramos: number;
};

export type AsignacionBobina = {
  claveRequerimiento: string;
  bobinaId: string;
};

export type TipoVentaPedido = "mayorista" | "minorista" | "personalizado";

export type PedidoProduccion = {
  id: string;
  presupuestoId: string;
  creadoEn: string;
  actualizadoEn: string;
  fechaEntrega: string | null;
  cliente: string;
  productoId: string;
  productoNombre: string;
  tipoVenta: TipoVentaPedido;
  totalVenta: number;
  cantidad: number;
  tiempoTotalMinutos: number;
  diasProduccion: number;
  horasImpresionDia: number;
  pesoTotalGramos: number;
  kilosFilamento: number;
  consumosFilamento: ConsumoFilamentoPedido[];
  estado: EstadoPedido;
};

function normalizarPedido(
  pedido: Partial<PedidoProduccion>
): PedidoProduccion {
  const ahora = new Date().toISOString();

  return {
    id: pedido.id || "PED-0000",
    presupuestoId: pedido.presupuestoId || "",
    creadoEn: pedido.creadoEn || ahora,
    actualizadoEn: pedido.actualizadoEn || ahora,
    fechaEntrega: pedido.fechaEntrega || null,
    cliente: pedido.cliente || "",
    productoId: pedido.productoId || "",
    productoNombre: pedido.productoNombre || "",
    tipoVenta:
      pedido.tipoVenta === "minorista" || pedido.tipoVenta === "personalizado"
        ? pedido.tipoVenta
        : "mayorista",
    totalVenta: Number(pedido.totalVenta) || 0,
    cantidad: Number(pedido.cantidad) || 0,
    tiempoTotalMinutos: Number(pedido.tiempoTotalMinutos) || 0,
    diasProduccion: Number(pedido.diasProduccion) || 0,
    horasImpresionDia: Number(pedido.horasImpresionDia) || 0,
    pesoTotalGramos: Number(pedido.pesoTotalGramos) || 0,
    kilosFilamento: Number(pedido.kilosFilamento) || 0,
    consumosFilamento: Array.isArray(pedido.consumosFilamento)
      ? pedido.consumosFilamento.map((consumo) => ({
          material: consumo.material || "",
          color: consumo.color || "",
          gramos: Number(consumo.gramos) || 0,
          bobinaId: consumo.bobinaId || "",
          bobinaDescripcion:
            consumo.bobinaDescripcion || consumo.bobinaId || "",
          costoPorGramo: Number(consumo.costoPorGramo) || 0,
          costoTotal: Number(consumo.costoTotal) || 0,
        }))
      : [],
    estado: pedido.estado || "pendiente",
  };
}

function guardarLista(pedidos: PedidoProduccion[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function generarId(pedidos: PedidoProduccion[]) {
  const numeros = pedidos.map((pedido) => {
    const numero = Number(pedido.id.replace("PED-", ""));
    return Number.isNaN(numero) ? 0 : numero;
  });

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  return `PED-${String(siguiente).padStart(4, "0")}`;
}


export function suscribirseAPedidosProduccion(
  callback: () => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const manejarStorage = (evento: StorageEvent) => {
    if (evento.key === STORAGE_KEY) callback();
  };

  window.addEventListener(STORAGE_EVENT, callback);
  window.addEventListener("storage", manejarStorage);
  window.addEventListener("focus", callback);

  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    window.removeEventListener("storage", manejarStorage);
    window.removeEventListener("focus", callback);
  };
}

export function obtenerPedidosProduccion(): PedidoProduccion[] {
  if (typeof window === "undefined") return [];
  const datos = localStorage.getItem(STORAGE_KEY);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    if (!Array.isArray(parseados)) return [];

    const normalizados = parseados.map(normalizarPedido);
    guardarLista(normalizados);
    return normalizados;
  } catch {
    console.error("No se pudieron leer los pedidos de producción.");
    return [];
  }
}

export function convertirPresupuestoEnPedido(
  presupuesto: PresupuestoGuardado,
  tipoVenta: TipoVentaPedido = "mayorista",
  totalPersonalizado?: number
): PedidoProduccion {
  const pedidos = obtenerPedidosProduccion();
  const existente = pedidos.find(
    (pedido) => pedido.presupuestoId === presupuesto.id
  );

  if (existente) return existente;

  const ahora = new Date().toISOString();
  const nuevo: PedidoProduccion = {
    id: generarId(pedidos),
    presupuestoId: presupuesto.id,
    creadoEn: ahora,
    actualizadoEn: ahora,
    fechaEntrega: null,
    cliente: presupuesto.cliente,
    productoId: presupuesto.productoId,
    productoNombre: presupuesto.productoNombre,
    tipoVenta,
    totalVenta:
      tipoVenta === "minorista"
        ? presupuesto.precioMinoristaTotal
        : tipoVenta === "personalizado"
          ? Math.max(0, Number(totalPersonalizado) || 0)
          : presupuesto.precioMayoristaTotal,
    cantidad: presupuesto.cantidad,
    tiempoTotalMinutos: presupuesto.tiempoTotalMinutos,
    diasProduccion: presupuesto.diasProduccion,
    horasImpresionDia: presupuesto.horasImpresionDia,
    pesoTotalGramos: presupuesto.pesoTotalGramos,
    kilosFilamento: presupuesto.kilosFilamento,
    consumosFilamento: [],
    estado: "pendiente",
  };

  guardarLista([...pedidos, nuevo]);
  return nuevo;
}

export function obtenerRequerimientosFilamento(
  pedido: PedidoProduccion
): RequerimientoFilamento[] {
  const producto = obtenerProductos().find(
    (actual) => actual.id === pedido.productoId
  );

  if (!producto || !Array.isArray(producto.materiales) || producto.materiales.length === 0) {
    return [
      {
        clave: "general",
        material: "PLA",
        color: "Sin especificar",
        gramos: pedido.pesoTotalGramos,
      },
    ];
  }

  const cantidadPorCama = Math.max(1, Number(producto.cantidadPorCama) || 1);
  const camas = Math.ceil(pedido.cantidad / cantidadPorCama);

  return producto.materiales
    .map((material) => ({
      clave: material.id,
      material: material.material.trim().toUpperCase(),
      color: material.color.trim() || "Sin especificar",
      gramos: (Number(material.gramosPorCama) || 0) * camas,
    }))
    .filter((requerimiento) => requerimiento.gramos > 0);
}

export function iniciarImpresionConBobinas(
  pedidoId: string,
  asignaciones: AsignacionBobina[]
): PedidoProduccion | null {
  const pedidos = obtenerPedidosProduccion();
  const pedido = pedidos.find((actual) => actual.id === pedidoId);

  if (
    !pedido ||
    pedido.estado !== "pendiente" ||
    pedidoYaConsumioFilamento(pedido.id)
  ) {
    return null;
  }

  const requerimientos = obtenerRequerimientosFilamento(pedido);
  const bobinas = obtenerBobinas();

  const datosValidados = requerimientos.map((requerimiento) => {
    const asignacion = asignaciones.find(
      (actual) => actual.claveRequerimiento === requerimiento.clave
    );

    const bobina = bobinas.find(
      (actual) => actual.id === asignacion?.bobinaId
    );

    if (!asignacion || !bobina || bobina.pesoActualGramos < requerimiento.gramos) {
      return null;
    }

    return { requerimiento, bobina };
  });

  if (datosValidados.some((dato) => dato === null)) return null;

  const consumos: ConsumoFilamentoPedido[] = [];

  for (const dato of datosValidados) {
    if (!dato) return null;

    const { requerimiento, bobina } = dato;
    const movimiento = registrarMovimientoFilamento(
      bobina.id,
      "salida",
      requerimiento.gramos,
      `Consumo de ${pedido.productoNombre}`,
      pedido.id,
      pedido.productoNombre
    );

    if (!movimiento) {
      reponerFilamentoDePedido(pedido.id);
      return null;
    }

    const costoPorGramo =
      bobina.pesoInicialGramos > 0
        ? bobina.precioCompra / bobina.pesoInicialGramos
        : 0;

    consumos.push({
      material: requerimiento.material,
      color: requerimiento.color,
      gramos: requerimiento.gramos,
      bobinaId: bobina.id,
      bobinaDescripcion: crearDescripcionBobina(bobina),
      costoPorGramo,
      costoTotal: costoPorGramo * requerimiento.gramos,
    });
  }

  const actualizado: PedidoProduccion = {
    ...pedido,
    estado: "imprimiendo",
    consumosFilamento: consumos,
    actualizadoEn: new Date().toISOString(),
  };

  guardarLista(
    pedidos.map((actual) => (actual.id === pedido.id ? actualizado : actual))
  );

  return actualizado;
}

export function actualizarEstadoPedido(
  id: string,
  estado: EstadoPedido
): PedidoProduccion | null {
  const pedidos = obtenerPedidosProduccion();
  const pedido = pedidos.find((actual) => actual.id === id);
  if (!pedido) return null;

  if (pedido.estado === "pendiente" && estado === "imprimiendo") {
    return null;
  }

  const ahora = new Date().toISOString();
  const actualizado: PedidoProduccion = {
    ...pedido,
    estado,
    actualizadoEn: ahora,
    fechaEntrega: estado === "entregado" ? ahora : pedido.fechaEntrega,
  };

  guardarLista(
    pedidos.map((actual) => (actual.id === id ? actualizado : actual))
  );

  return actualizado;
}

export function actualizarDatosComercialesPedido(
  id: string,
  tipoVenta: TipoVentaPedido,
  totalVenta: number
): PedidoProduccion | null {
  const pedidos = obtenerPedidosProduccion();
  const pedido = pedidos.find((actual) => actual.id === id);
  if (!pedido || Number(totalVenta) < 0) return null;

  const actualizado: PedidoProduccion = {
    ...pedido,
    tipoVenta,
    totalVenta: Number(totalVenta) || 0,
    actualizadoEn: new Date().toISOString(),
  };

  guardarLista(
    pedidos.map((actual) => (actual.id === id ? actualizado : actual))
  );
  return actualizado;
}

export function eliminarPedidoProduccion(id: string): boolean {
  const pedidos = obtenerPedidosProduccion();
  if (!pedidos.some((pedido) => pedido.id === id)) return false;

  reponerFilamentoDePedido(id);
  guardarLista(pedidos.filter((pedido) => pedido.id !== id));
  return true;
}

export function obtenerCostoRealFilamentoPedido(pedido: PedidoProduccion) {
  return pedido.consumosFilamento.reduce(
    (total, consumo) => total + consumo.costoTotal,
    0
  );
}
