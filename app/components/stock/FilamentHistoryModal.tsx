"use client";

import {
  obtenerMovimientosDeBobina,
  type BobinaFilamento,
} from "../../../lib/stock-service";

type Props = {
  bobina: BobinaFilamento;
  onClose: () => void;
};

export default function FilamentHistoryModal({ bobina, onClose }: Props) {
  const movimientos = obtenerMovimientosDeBobina(bobina.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#181818] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              Historial de bobina
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {bobina.material} {bobina.color}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {bobina.id}
              {bobina.marca ? ` · ${bobina.marca}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-2"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-5">
          <p className="text-sm text-zinc-500">Filamento disponible</p>
          <p className="mt-2 text-3xl font-bold">
            {bobina.pesoActualGramos.toLocaleString("es-AR", {
              maximumFractionDigits: 1,
            })}{" "}
            g
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {movimientos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
              Esta bobina todavía no tiene movimientos.
            </div>
          ) : (
            movimientos.map((movimiento) => {
              const entrada = movimiento.tipo === "entrada";

              return (
                <article
                  key={movimiento.id}
                  className="rounded-2xl border border-white/10 bg-[#111111] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{movimiento.motivo}</p>
                      {movimiento.productoNombre && (
                        <p className="mt-1 text-sm text-zinc-400">
                          {movimiento.productoNombre}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-600">
                        {movimiento.pedidoId &&
                        !movimiento.pedidoId.startsWith("REPOSICION:")
                          ? `${movimiento.pedidoId} · `
                          : ""}
                        {new Date(movimiento.creadoEn).toLocaleString("es-AR")}
                      </p>
                    </div>

                    <p
                      className={
                        entrada
                          ? "font-bold text-emerald-300"
                          : "font-bold text-red-300"
                      }
                    >
                      {entrada ? "+" : "−"}
                      {Math.abs(movimiento.cantidadGramos).toLocaleString(
                        "es-AR",
                        { maximumFractionDigits: 1 }
                      )}{" "}
                      g
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
