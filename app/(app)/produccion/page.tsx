"use client";

import { useEffect, useMemo, useState } from "react";
import FilamentSelectionModal from "@/app/components/production/FilamentSelectionModal";
import {
  actualizarEstadoPedido,
  obtenerCostoRealFilamentoPedido,
  obtenerPedidosProduccion,
  suscribirseAPedidosProduccion,
  type EstadoPedido,
  type PedidoProduccion,
} from "@/lib/production-service";

const columnas: Array<{
  estado: EstadoPedido;
  titulo: string;
  icono: string;
}> = [
  { estado: "pendiente", titulo: "Pendientes", icono: "🟡" },
  { estado: "imprimiendo", titulo: "Imprimiendo", icono: "🔵" },
  { estado: "empaquetando", titulo: "Empaquetando", icono: "🟠" },
  { estado: "listo", titulo: "Listos", icono: "🟢" },
  { estado: "entregado", titulo: "Entregados", icono: "✅" },
];

export default function ProduccionPage() {
  const [pedidos, setPedidos] = useState<PedidoProduccion[]>([]);
  const [pedidoParaIniciar, setPedidoParaIniciar] =
    useState<PedidoProduccion | null>(null);

  useEffect(() => {
    const recargar = () => setPedidos(obtenerPedidosProduccion());
    recargar();
    return suscribirseAPedidosProduccion(recargar);
  }, []);

  const pedidosPorEstado = useMemo(
    () =>
      columnas.reduce(
        (resultado, columna) => {
          resultado[columna.estado] = pedidos.filter(
            (pedido) => pedido.estado === columna.estado
          );
          return resultado;
        },
        {
          pendiente: [],
          imprimiendo: [],
          empaquetando: [],
          listo: [],
          entregado: [],
        } as Record<EstadoPedido, PedidoProduccion[]>
      ),
    [pedidos]
  );

  function avanzar(pedido: PedidoProduccion) {
    if (pedido.estado === "pendiente") {
      setPedidoParaIniciar(pedido);
      return;
    }

    const siguiente = obtenerSiguienteEstado(pedido.estado);
    if (!siguiente) return;

    const actualizado = actualizarEstadoPedido(pedido.id, siguiente);
    if (actualizado) reemplazarPedido(actualizado);
  }

  function reemplazarPedido(actualizado: PedidoProduccion) {
    setPedidos((actuales) =>
      actuales.map((pedido) =>
        pedido.id === actualizado.id ? actualizado : pedido
      )
    );
  }

  return (
    <main className="flex min-h-screen bg-[#101010] text-white">

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
            Centro de operaciones
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Producción</h1>
          <p className="mt-4 text-zinc-300">
            Al iniciar una impresión elegís las bobinas utilizadas y Ryuka descuenta el filamento.
          </p>
        </header>

        {pedidos.length === 0 ? (
          <section className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-[#181818] p-10 text-center">
            <h2 className="text-2xl font-bold">Todavía no hay pedidos</h2>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 xl:grid-cols-5">
            {columnas.map((columna) => (
              <section
                key={columna.estado}
                className="min-w-0 rounded-3xl border border-white/10 bg-[#181818] p-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="font-bold">
                    {columna.icono} {columna.titulo}
                  </h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs">
                    {pedidosPorEstado[columna.estado].length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {pedidosPorEstado[columna.estado].map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      onAvanzar={() => avanzar(pedido)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </section>
        )}
      </section>

      {pedidoParaIniciar && (
        <FilamentSelectionModal
          pedido={pedidoParaIniciar}
          onClose={() => setPedidoParaIniciar(null)}
          onStarted={(actualizado) => {
            reemplazarPedido(actualizado);
            setPedidoParaIniciar(null);
          }}
        />
      )}
    </main>
  );
}

function PedidoCard({
  pedido,
  onAvanzar,
}: {
  pedido: PedidoProduccion;
  onAvanzar: () => void;
}) {
  const siguiente = obtenerSiguienteEstado(pedido.estado);
  const costoReal = obtenerCostoRealFilamentoPedido(pedido);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-4">
      <p className="text-xs font-bold text-red-300">{pedido.id}</p>
      <h3 className="mt-2 font-bold">{pedido.productoNombre}</h3>
      <p className="mt-1 truncate text-sm text-zinc-400">{pedido.cliente}</p>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
        <Fila titulo="Cantidad" valor={`${pedido.cantidad} u.`} />
        <Fila
          titulo="Filamento"
          valor={`${pedido.pesoTotalGramos.toLocaleString("es-AR", {
            maximumFractionDigits: 1,
          })} g`}
        />
      </div>

      {pedido.consumosFilamento.length > 0 && (
        <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Bobinas utilizadas
          </p>

          {pedido.consumosFilamento.map((consumo, indice) => (
            <div
              key={`${consumo.bobinaId}-${indice}`}
              className="border-b border-white/5 py-2 last:border-0"
            >
              <p className="text-xs font-semibold text-zinc-300">
                {consumo.bobinaId} · {consumo.material} {consumo.color}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {consumo.gramos.toLocaleString("es-AR", {
                  maximumFractionDigits: 1,
                })}{" "}
                g utilizados
              </p>
            </div>
          ))}

          {costoReal > 0 && (
            <p className="mt-3 border-t border-white/5 pt-3 text-xs text-zinc-400">
              Costo real: {" "}
              <strong className="text-zinc-200">
                {costoReal.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>
          )}
        </div>
      )}

      {siguiente && (
        <button
          type="button"
          onClick={onAvanzar}
          className="mt-4 w-full rounded-xl bg-[#810404] px-4 py-3 text-sm font-semibold hover:bg-[#a00808]"
        >
          {obtenerTextoBoton(pedido.estado)}
        </button>
      )}

      {!siguiente && (
        <div className="mt-4 rounded-xl border border-emerald-900 bg-emerald-950/20 px-4 py-3 text-center text-sm font-semibold text-emerald-300">
          Pedido entregado ✓
        </div>
      )}
    </article>
  );
}

function Fila({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-zinc-500">{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function obtenerSiguienteEstado(estado: EstadoPedido): EstadoPedido | null {
  return {
    pendiente: "imprimiendo",
    imprimiendo: "empaquetando",
    empaquetando: "listo",
    listo: "entregado",
    entregado: null,
  }[estado] as EstadoPedido | null;
}

function obtenerTextoBoton(estado: EstadoPedido) {
  return {
    pendiente: "▶ Elegir bobinas e iniciar",
    imprimiendo: "✓ Finalizar impresión",
    empaquetando: "📦 Terminar empaquetado",
    listo: "✅ Marcar como entregado",
    entregado: "Entregado",
  }[estado];
}
