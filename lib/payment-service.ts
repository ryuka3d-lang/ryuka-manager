const PAGOS_KEY = "ryuka-pagos-pedidos";

export type TipoPagoPedido = "seña" | "pago_final" | "otro";

export type PagoPedido = {
  id: string;
  pedidoId: string;
  fecha: string;
  tipo: TipoPagoPedido;
  monto: number;
  medioPago: string;
  notas: string;
  creadoEn: string;
};

export type NuevoPagoPedido = Omit<PagoPedido, "id" | "creadoEn">;

function disponible() {
  return typeof window !== "undefined";
}

function guardarLista(pagos: PagoPedido[]) {
  if (!disponible()) return;
  localStorage.setItem(PAGOS_KEY, JSON.stringify(pagos));
}

function normalizarPago(pago: Partial<PagoPedido>): PagoPedido {
  const ahora = new Date().toISOString();
  return {
    id: pago.id || "PAG-0000",
    pedidoId: pago.pedidoId || "",
    fecha: pago.fecha || ahora.slice(0, 10),
    tipo:
      pago.tipo === "pago_final" || pago.tipo === "otro"
        ? pago.tipo
        : "seña",
    monto: Math.abs(Number(pago.monto) || 0),
    medioPago: pago.medioPago?.trim() || "Sin especificar",
    notas: pago.notas?.trim() || "",
    creadoEn: pago.creadoEn || ahora,
  };
}

function generarId(pagos: PagoPedido[]) {
  const numeros = pagos.map((pago) => {
    const numero = Number(pago.id.replace("PAG-", ""));
    return Number.isNaN(numero) ? 0 : numero;
  });

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  return `PAG-${String(siguiente).padStart(4, "0")}`;
}

export function obtenerPagosPedidos(): PagoPedido[] {
  if (!disponible()) return [];
  const datos = localStorage.getItem(PAGOS_KEY);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    if (!Array.isArray(parseados)) return [];
    const normalizados = parseados.map(normalizarPago);
    guardarLista(normalizados);
    return normalizados;
  } catch {
    console.error("No se pudieron leer los pagos de pedidos.");
    return [];
  }
}

export function obtenerPagosDePedido(pedidoId: string): PagoPedido[] {
  return obtenerPagosPedidos()
    .filter((pago) => pago.pedidoId === pedidoId)
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T12:00:00`).getTime();
      const fechaB = new Date(`${b.fecha}T12:00:00`).getTime();
      if (fechaA !== fechaB) return fechaB - fechaA;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
}

export function obtenerTotalPagadoPedido(pedidoId: string) {
  return obtenerPagosDePedido(pedidoId).reduce(
    (total, pago) => total + pago.monto,
    0
  );
}

export function registrarPagoPedido(datos: NuevoPagoPedido): PagoPedido | null {
  const monto = Math.abs(Number(datos.monto) || 0);
  if (!datos.pedidoId || !datos.fecha || monto <= 0) return null;

  const pagos = obtenerPagosPedidos();
  const pago: PagoPedido = {
    ...datos,
    id: generarId(pagos),
    monto,
    medioPago: datos.medioPago.trim() || "Sin especificar",
    notas: datos.notas.trim(),
    creadoEn: new Date().toISOString(),
  };

  guardarLista([pago, ...pagos]);
  return pago;
}

export function eliminarPagoPedido(id: string): boolean {
  const pagos = obtenerPagosPedidos();
  const actualizados = pagos.filter((pago) => pago.id !== id);
  if (actualizados.length === pagos.length) return false;
  guardarLista(actualizados);
  return true;
}

export function eliminarPagosDePedido(pedidoId: string) {
  const pagos = obtenerPagosPedidos();
  const actualizados = pagos.filter((pago) => pago.pedidoId !== pedidoId);
  guardarLista(actualizados);
}
