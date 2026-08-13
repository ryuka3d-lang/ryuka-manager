"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listOrders,
  updateOrderCommercialData,
} from "@/lib/repositories/orders.repository";

import type {
  Order,
  SaleType,
} from "@/lib/domain/order";

import { obtenerWorkspaceId } from "@/lib/workspace-service";
import {
  eliminarPagoPedido,
  obtenerPagosPedidos,
  obtenerTotalPagadoPedido,
  registrarPagoPedido,
  type PagoPedido,
  type TipoPagoPedido,
} from "@/lib/payment-service";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const [pagos, setPagos] = useState<PagoPedido[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendiente" | "parcial" | "pagado">("todos");
  const [pedidoPago, setPedidoPago] =
  useState<Order | null>(null);

const [pedidoEditar, setPedidoEditar] =
  useState<Order | null>(null);

  async function recargar() {
  if (recargando) return;
  setRecargando(true);
  try {
    const workspace = await obtenerWorkspaceId();

    console.log("Workspace usado en Pedidos:", workspace);

    const pedidosCargados = await listOrders(workspace);

    console.log(
      "Pedidos recibidos desde Supabase:",
      pedidosCargados
    );

    setPedidos(pedidosCargados);
    setPagos(obtenerPagosPedidos());
  } catch (error) {
    console.error("Error cargando pedidos:", error);

    alert(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los pedidos."
    );
  } finally {
    setCargando(false);
    setRecargando(false);
  }
}

useEffect(() => {
  void recargar();
}, []);

  const resumen = useMemo(() => {
    const total = pedidos.reduce(
  (suma, pedido) => suma + pedido.totalAmount,
  0
);
    const cobrado = pagos.reduce((suma, pago) => suma + pago.monto, 0);
    return { total, cobrado, pendiente: Math.max(0, total - cobrado) };
  }, [pedidos, pagos]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return [...pedidos]
      .reverse()
      .filter((pedido) => {
        const pagado = pagos
          .filter((pago) => pago.pedidoId === pedido.id)
          .reduce((suma, pago) => suma + pago.monto, 0);
        const estado = obtenerEstadoCobro(
  pedido.totalAmount,
  pagado
);
        const coincideFiltro = filtro === "todos" || filtro === estado;
        const coincideTexto =
          !texto ||
          `${pedido.code} ${pedido.customerName} ${pedido.items
  .map((item) => item.productName)
  .join(" ")}`
            .toLowerCase()
            .includes(texto);
        return coincideFiltro && coincideTexto;
      });
  }, [pedidos, pagos, busqueda, filtro]);

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="min-w-0 p-4 sm:p-6 lg:p-10">
        <header className="rounded-[1.5rem] border border-white/10 bg-[#181818] p-5 sm:rounded-[2rem] sm:p-7 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
            Ventas y cobranzas
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Pedidos</h1>
          <p className="mt-4 text-zinc-300">
            Registrá señas y pagos finales. Cada cobro aparece automáticamente en Caja.
          </p>
        </header>

        <section className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-3">
          <Resumen titulo="Total vendido" valor={moneda(resumen.total)} />
          <Resumen titulo="Total cobrado" valor={moneda(resumen.cobrado)} />
          <Resumen titulo="Pendiente de cobro" valor={moneda(resumen.pendiente)} destacado />
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-[#181818] p-4 sm:mt-8 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">Listado de pedidos</h2>
              <p className="mt-1 text-sm text-zinc-400">{pedidos.length} pedidos registrados.</p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
              <select
                value={filtro}
                onChange={(evento) => setFiltro(evento.target.value as typeof filtro)}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm"
              >
                <option value="todos">Todos los cobros</option>
                <option value="pendiente">Sin cobrar</option>
                <option value="parcial">Cobro parcial</option>
                <option value="pagado">Pagados</option>
              </select>
              <input
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar pedido o cliente..."
                className="min-h-12 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm"
              />
            </div>
          </div>

          {cargando ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#121212] p-8 text-center text-zinc-400">
              Cargando pedidos...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400 sm:p-10">
              No hay pedidos para mostrar. Crealos desde Presupuestos.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {filtrados.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  pagos={pagos.filter((pago) => pago.pedidoId === pedido.id)}
                  onPago={() => setPedidoPago(pedido)}
                  onEditar={() => setPedidoEditar(pedido)}
                  onEliminarPago={(id) => {
                    if (confirm("¿Eliminar este cobro? También dejará de aparecer en Caja.")) {
                      eliminarPagoPedido(id);
                      recargar();
                    }
                  }}
                />
              ))}
            </div>
          )}

          {recargando && !cargando && (
            <p className="mt-3 text-center text-xs text-zinc-600">Actualizando pedidos...</p>
          )}
        </section>
      </section>

      {pedidoPago && (
        <PagoModal
          pedido={pedidoPago}
          onClose={() => setPedidoPago(null)}
          onSaved={() => {
            setPedidoPago(null);
            recargar();
          }}
        />
      )}

      {pedidoEditar && (
        <EditarTotalModal
          pedido={pedidoEditar}
          onClose={() => setPedidoEditar(null)}
          onSaved={() => {
            setPedidoEditar(null);
            recargar();
          }}
        />
      )}
    </main>
  );
}

function PedidoCard({
  pedido,
  pagos,
  onPago,
  onEditar,
  onEliminarPago,
}: {
  pedido: Order;
  pagos: PagoPedido[];
  onPago: () => void;
  onEditar: () => void;
  onEliminarPago: (id: string) => void;
}) {
  const pagado = pagos.reduce((suma, pago) => suma + pago.monto, 0);
  const pendiente = Math.max(
  0,
  pedido.totalAmount - pagado
);

const estado = obtenerEstadoCobro(
  pedido.totalAmount,
  pagado
);

const cantidadTotal = pedido.items.reduce(
  (suma, item) => suma + item.quantity,
  0
);

const productos =
  pedido.items.length > 0
    ? pedido.items
        .map((item) => item.productName)
        .join(", ")
    : "Pedido sin productos";

  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-red-300">
  {pedido.code}
</p>

<h3 className="mt-2 truncate text-xl font-bold">
  {productos}
</h3>

<p className="mt-1 text-sm text-zinc-400">
  {pedido.customerName || "Cliente sin nombre"}
</p>
        </div>
        <EstadoCobro estado={estado} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 rounded-2xl bg-white/[0.03] p-3 text-sm sm:grid-cols-3 sm:gap-3 sm:p-4">
        <Dato
  titulo="Total"
  valor={moneda(pedido.totalAmount)}
/>
        <Dato titulo="Cobrado" valor={moneda(pagado)} />
        <Dato titulo="Falta" valor={moneda(pendiente)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full bg-white/5 px-2.5 py-1">
  {cantidadTotal} u.
</span>

<span className="rounded-full bg-white/5 px-2.5 py-1">
  {etiquetaVenta(pedido.saleType)}
</span>

<span className="rounded-full bg-white/5 px-2.5 py-1">
  Estado: {etiquetaEstadoPedido(pedido.status)}
</span>
      </div>

      {pagos.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Historial de cobros</p>
          <div className="mt-3 space-y-2">
            {pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
                <div>
                  <strong>{moneda(pago.monto)}</strong>
                  <p className="text-xs text-zinc-500">{fecha(pago.fecha)} · {pago.medioPago} · {etiquetaPago(pago.tipo)}</p>
                </div>
                <button type="button" onClick={() => onEliminarPago(pago.id)} className="text-xs text-zinc-500 hover:text-red-300">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onEditar} className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5">
          Editar total
        </button>
        <button
          type="button"
          onClick={onPago}
          disabled={pendiente <= 0}
          className="rounded-xl bg-[#810404] px-4 py-3 text-sm font-semibold hover:bg-[#a00808] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pendiente > 0 ? "+ Registrar cobro" : "Pedido pagado ✓"}
        </button>
      </div>
    </article>
  );
}

function PagoModal({
  pedido,
  onClose,
  onSaved,
}: {
  pedido: Order;
  onClose: () => void;
  onSaved: () => void;
}) {
  const yaPagado = obtenerTotalPagadoPedido(pedido.id);
  const pendiente = Math.max(
  0,
  pedido.totalAmount - yaPagado
);
  const [tipo, setTipo] = useState<TipoPagoPedido>(yaPagado === 0 ? "seña" : "pago_final");
  const [monto, setMonto] = useState(String(pendiente));
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [medioPago, setMedioPago] = useState("Transferencia");
  const [notas, setNotas] = useState("");

  function guardar() {
    const valor = Number(monto);
    if (valor <= 0 || valor > pendiente) {
      alert(`El monto debe ser mayor a cero y no superar ${moneda(pendiente)}.`);
      return;
    }
    const resultado = registrarPagoPedido({
      pedidoId: pedido.id,
      fecha: fechaPago,
      tipo,
      monto: valor,
      medioPago,
      notas,
    });
    if (!resultado) {
      alert("Revisá los datos del cobro.");
      return;
    }
    onSaved();
  }

  return (
    <Modal
  titulo="Registrar cobro"
  subtitulo={`${pedido.code} · ${
    pedido.customerName || "Cliente sin nombre"
  }`}
  onClose={onClose}
>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo titulo="Fecha" tipo="date" valor={fechaPago} onChange={setFechaPago} />
        <Campo titulo="Monto" tipo="number" valor={monto} onChange={setMonto} />
        <label>
          <span className="text-sm font-semibold text-zinc-300">Tipo de cobro</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoPagoPedido)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3">
            <option value="seña">Seña</option>
            <option value="pago_final">Pago final</option>
            <option value="otro">Otro cobro</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-semibold text-zinc-300">Medio de pago</span>
          <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3">
            <option>Transferencia</option><option>Efectivo</option><option>Mercado Pago</option><option>Tarjeta</option><option>Otro</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-semibold text-zinc-300">Notas</span>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3" />
        </label>
      </div>
      <div className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm">
        Pendiente antes del cobro: <strong>{moneda(pendiente)}</strong>
      </div>
      <Acciones onClose={onClose} onSave={guardar} texto="Guardar cobro" />
    </Modal>
  );
}

function EditarTotalModal({
  pedido,
  onClose,
  onSaved,
}: {
  pedido: Order;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tipo, setTipo] =
    useState<SaleType>(pedido.saleType);

  const [total, setTotal] =
    useState(String(pedido.totalAmount));
  const pagado = obtenerTotalPagadoPedido(pedido.id);

  async function guardar() {
  const valor = Number(total);

  if (!Number.isFinite(valor) || valor < 0) {
    alert("Ingresá un total válido.");
    return;
  }

  if (valor < pagado) {
    alert(
      `El total no puede ser menor a lo ya cobrado: ${moneda(
        pagado
      )}.`
    );
    return;
  }

  try {
    await updateOrderCommercialData(pedido.id, {
      saleType: tipo,
      totalAmount: valor,
    });

    onSaved();
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el pedido."
    );
  }
}

  return (
    <Modal titulo="Editar total del pedido" subtitulo={`${pedido.code} · ${
  pedido.items[0]?.productName ?? "Pedido"
}`} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-semibold text-zinc-300">Tipo de venta</span>
          <select
  value={tipo}
  onChange={(e) =>
    setTipo(e.target.value as SaleType)
  }
  className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
>
  <option value="wholesale">Mayorista</option>
  <option value="retail">Minorista</option>
  <option value="custom">Personalizado</option>
</select>
        </label>
        <Campo titulo="Total acordado" tipo="number" valor={total} onChange={setTotal} />
      </div>
      <p className="mt-4 text-sm text-zinc-400">Ya cobrado: {moneda(pagado)}</p>
      <Acciones onClose={onClose} onSave={guardar} texto="Guardar cambios" />
    </Modal>
  );
}

function Modal({ titulo, subtitulo, onClose, children }: { titulo: string; subtitulo: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[1.5rem] border border-white/10 bg-[#181818] p-5 sm:my-6 sm:max-w-2xl sm:rounded-[2rem] sm:p-6 rounded-[2rem] border border-white/10 bg-[#181818] p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">{subtitulo}</p><h2 className="mt-2 text-2xl font-bold">{titulo}</h2></div><button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2">✕</button></div><div className="mt-6">{children}</div></div></div>;
}
function Acciones({ onClose, onSave, texto }: { onClose: () => void; onSave: () => void; texto: string }) { return <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3">Cancelar</button><button type="button" onClick={onSave} className="rounded-xl bg-[#810404] px-6 py-3 font-semibold">{texto}</button></div>; }
function Campo({ titulo, valor, tipo, onChange }: { titulo: string; valor: string; tipo: "date" | "number"; onChange: (valor: string) => void }) { return <label><span className="text-sm font-semibold text-zinc-300">{titulo}</span><input type={tipo} min={tipo === "number" ? 0 : undefined} value={valor} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3" /></label>; }
function Resumen({ titulo, valor, destacado = false }: { titulo: string; valor: string; destacado?: boolean }) { return <article className={`rounded-2xl border p-5 ${destacado ? "border-red-900 bg-red-950/20" : "border-white/10 bg-[#181818]"}`}><p className="text-sm text-zinc-400">{titulo}</p><strong className="mt-2 block text-2xl">{valor}</strong></article>; }
function Dato({ titulo, valor }: { titulo: string; valor: string }) { return <div><p className="text-xs text-zinc-500">{titulo}</p><strong className="mt-1 block">{valor}</strong></div>; }
function EstadoCobro({ estado }: { estado: "pendiente" | "parcial" | "pagado" }) { const clases = estado === "pagado" ? "bg-emerald-950 text-emerald-300" : estado === "parcial" ? "bg-amber-950 text-amber-300" : "bg-red-950 text-red-300"; return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${clases}`}>{estado === "pagado" ? "Pagado" : estado === "parcial" ? "Pago parcial" : "Sin cobrar"}</span>; }
function obtenerEstadoCobro(total: number, pagado: number) { if (total > 0 && pagado >= total) return "pagado" as const; if (pagado > 0) return "parcial" as const; return "pendiente" as const; }
function etiquetaVenta(tipo: SaleType) {
  return tipo === "retail"
    ? "Minorista"
    : tipo === "custom"
      ? "Precio personalizado"
      : "Mayorista";
}
function etiquetaEstadoPedido(
  estado: Order["status"]
) {
  if (estado === "in_production") {
    return "En producción";
  }

  if (estado === "ready") {
    return "Listo";
  }

  if (estado === "delivered") {
    return "Entregado";
  }

  if (estado === "cancelled") {
    return "Cancelado";
  }

  return "Pendiente";
}
function etiquetaPago(tipo: TipoPagoPedido) { return tipo === "pago_final" ? "Pago final" : tipo === "otro" ? "Otro" : "Seña"; }
function moneda(valor: number) { return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor || 0); }
function fecha(valor: string) { return new Intl.DateTimeFormat("es-AR").format(new Date(`${valor}T12:00:00`)); }
