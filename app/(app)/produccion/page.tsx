"use client";

import { useEffect, useMemo, useState } from "react";

import FilamentSelectionModalCloud from "@/app/components/production/FilamentSelectionModalCloud";
import {
  avanzarEstadoProduccionNube,
  listarOrdenesProduccionNube,
  obtenerCostoRealProduccion,
  type EstadoProduccionNube,
  type OrdenProduccionNube,
} from "@/lib/cloud-production-service";

const columnas: Array<{
  estado: EstadoProduccionNube;
  titulo: string;
  icono: string;
}> = [
  {
    estado: "pending",
    titulo: "Pendientes",
    icono: "🟡",
  },
  {
    estado: "printing",
    titulo: "Imprimiendo",
    icono: "🔵",
  },
  {
    estado: "packing",
    titulo: "Empaquetando",
    icono: "🟠",
  },
  {
    estado: "ready",
    titulo: "Listos",
    icono: "🟢",
  },
  {
    estado: "delivered",
    titulo: "Entregados",
    icono: "✅",
  },
];

export default function ProduccionPage() {
  const [pedidos, setPedidos] = useState<
    OrdenProduccionNube[]
  >([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] = useState("");

  const [
    pedidoParaIniciar,
    setPedidoParaIniciar,
  ] = useState<OrdenProduccionNube | null>(
    null
  );

  async function recargar() {
    try {
      setError("");

      const data =
        await listarOrdenesProduccionNube();

      setPedidos(data);
    } catch (cause) {
      console.error(cause);

      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo cargar Producción."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void recargar();

    const onFocus = () => {
      void recargar();
    };

    window.addEventListener("focus", onFocus);

    const intervalo = window.setInterval(
      () => void recargar(),
      15000
    );

    return () => {
      window.removeEventListener(
        "focus",
        onFocus
      );
      window.clearInterval(intervalo);
    };
  }, []);

  const pedidosPorEstado = useMemo(
    () =>
      columnas.reduce(
        (resultado, columna) => {
          resultado[columna.estado] =
            pedidos.filter(
              (pedido) =>
                pedido.status ===
                columna.estado
            );

          return resultado;
        },
        {
          pending: [],
          printing: [],
          packing: [],
          ready: [],
          delivered: [],
        } as Record<
          EstadoProduccionNube,
          OrdenProduccionNube[]
        >
      ),
    [pedidos]
  );

  async function avanzar(
    pedido: OrdenProduccionNube
  ) {
    if (pedido.status === "pending") {
      setPedidoParaIniciar(pedido);
      return;
    }

    try {
      const actualizado =
        await avanzarEstadoProduccionNube(
          pedido
        );

      reemplazarPedido(actualizado);
    } catch (cause) {
      console.error(cause);

      alert(
        cause instanceof Error
          ? cause.message
          : "No se pudo avanzar la producción."
      );
    }
  }

  function reemplazarPedido(
    actualizado: OrdenProduccionNube
  ) {
    setPedidos((actuales) =>
      actuales.map((pedido) =>
        pedido.id === actualizado.id
          ? actualizado
          : pedido
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
            Centro de operaciones
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Producción
          </h1>

          <p className="mt-4 text-zinc-300">
            Las órdenes vienen de Pedidos y se guardan en Supabase.
            Al iniciar elegís las bobinas y Ryuka registra el consumo real.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/20 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {cargando ? (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-10 text-center text-zinc-400">
            Cargando producción...
          </section>
        ) : pedidos.length === 0 ? (
          <section className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-[#181818] p-10 text-center">
            <h2 className="text-2xl font-bold">
              Todavía no hay órdenes de producción
            </h2>

            <p className="mt-2 text-zinc-400">
              Convertí un presupuesto en pedido para generar una.
            </p>
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
                    {columna.icono}{" "}
                    {columna.titulo}
                  </h2>

                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs">
                    {
                      pedidosPorEstado[
                        columna.estado
                      ].length
                    }
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {pedidosPorEstado[
                    columna.estado
                  ].map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      onAvanzar={() =>
                        void avanzar(pedido)
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </section>
        )}
      </section>

      {pedidoParaIniciar && (
        <FilamentSelectionModalCloud
          pedido={pedidoParaIniciar}
          onClose={() =>
            setPedidoParaIniciar(null)
          }
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
  pedido: OrdenProduccionNube;
  onAvanzar: () => void;
}) {
  const siguiente =
    obtenerSiguienteEstado(pedido.status);

  const costoReal =
    obtenerCostoRealProduccion(pedido);

  const cantidad = pedido.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (
    <article className="rounded-2xl border border-white/10 bg-[#121212] p-4">
      <p className="text-xs font-bold text-red-300">
        {pedido.code}
        {pedido.orderCode
          ? ` · ${pedido.orderCode}`
          : ""}
      </p>

      <h3 className="mt-2 font-bold">
        {pedido.items.length > 0
          ? pedido.items
              .map(
                (item) =>
                  `${item.productName} × ${item.quantity}`
              )
              .join(", ")
          : "Orden sin productos"}
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        {pedido.customerName}
      </p>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
        <Fila
          titulo="Cantidad"
          valor={`${cantidad} u.`}
        />

        <Fila
          titulo="Tiempo"
          valor={formatearTiempo(
            pedido.plannedPrintMinutes
          )}
        />

        <Fila
          titulo="Filamento"
          valor={`${pedido.plannedWeightGrams.toLocaleString(
            "es-AR",
            {
              maximumFractionDigits: 1,
            }
          )} g`}
        />
      </div>

      {pedido.consumptions.length > 0 && (
        <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Bobinas utilizadas
          </p>

          {pedido.consumptions.map(
            (consumo) => (
              <div
                key={consumo.id}
                className="border-b border-white/5 py-2 last:border-0"
              >
                <p className="text-xs font-semibold text-zinc-300">
                  {consumo.spoolCode} ·{" "}
                  {consumo.material}{" "}
                  {consumo.color}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {consumo.grams.toLocaleString(
                    "es-AR",
                    {
                      maximumFractionDigits: 1,
                    }
                  )}{" "}
                  g utilizados
                </p>
              </div>
            )
          )}

          {costoReal > 0 && (
            <p className="mt-3 border-t border-white/5 pt-3 text-xs text-zinc-400">
              Costo real:{" "}
              <strong className="text-zinc-200">
                {costoReal.toLocaleString(
                  "es-AR",
                  {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 2,
                  }
                )}
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
          {obtenerTextoBoton(pedido.status)}
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

function Fila({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-500">
        {titulo}
      </span>

      <strong className="text-zinc-300">
        {valor}
      </strong>
    </div>
  );
}

function obtenerSiguienteEstado(
  estado: EstadoProduccionNube
): EstadoProduccionNube | null {
  return {
    pending: "printing",
    printing: "packing",
    packing: "ready",
    ready: "delivered",
    delivered: null,
  }[estado] as EstadoProduccionNube | null;
}

function obtenerTextoBoton(
  estado: EstadoProduccionNube
) {
  return {
    pending: "▶ Elegir bobinas e iniciar",
    printing: "✓ Finalizar impresión",
    packing: "📦 Terminar empaquetado",
    ready: "✅ Marcar como entregado",
    delivered: "Entregado",
  }[estado];
}

function formatearTiempo(
  minutos: number
) {
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(
    minutos % 60
  );

  if (horas <= 0) {
    return `${resto} min`;
  }

  return `${horas} h ${resto} min`;
}
