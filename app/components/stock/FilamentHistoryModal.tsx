"use client";

import { useEffect, useState } from "react";
import {
  obtenerMovimientosDeBobina,
  type BobinaFilamento,
  type MovimientoFilamento,
} from "@/lib/stock-service";

type Props = {
  bobina: BobinaFilamento;
  onClose: () => void;
};

export default function FilamentHistoryModal({ bobina, onClose }: Props) {
  const [movimientos, setMovimientos] = useState<MovimientoFilamento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    void obtenerMovimientosDeBobina(bobina.uuid)
      .then(setMovimientos)
      .finally(() => setCargando(false));
  }, [bobina.uuid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--text)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-text)]">Historial de bobina</p>
            <h2 className="mt-2 text-2xl font-bold">{bobina.material} {bobina.color}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{bobina.id}{bobina.marca ? ` · ${bobina.marca}` : ""}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-2">✕</button>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[#111111] p-5">
          <p className="text-sm text-[var(--muted)]">Filamento disponible</p>
          <p className="mt-2 text-3xl font-bold">
            {bobina.pesoActualGramos.toLocaleString("es-AR", { maximumFractionDigits: 1 })} g
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {cargando ? (
            <div className="rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted)]">Cargando...</div>
          ) : movimientos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted)]">
              Esta bobina todavía no tiene movimientos.
            </div>
          ) : (
            movimientos.map((movimiento) => {
              const positivo =
                movimiento.tipo === "entrada" ||
                (movimiento.tipo === "ajuste" && movimiento.cantidadGramos >= 0);

              return (
                <article key={movimiento.id} className="rounded-2xl border border-[var(--border)] bg-[#111111] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{movimiento.motivo}</p>
                      {movimiento.productoNombre && (
                        <p className="mt-1 text-sm text-[var(--muted)]">{movimiento.productoNombre}</p>
                      )}
                      <p className="mt-2 text-xs text-zinc-600">
                        {movimiento.pedidoId ? `${movimiento.pedidoId} · ` : ""}
                        {new Date(movimiento.creadoEn).toLocaleString("es-AR")}
                      </p>
                    </div>
                    <p className={positivo ? "font-bold text-emerald-300" : "font-bold text-[var(--accent-text)]"}>
                      {positivo ? "+" : "−"}
                      {Math.abs(movimiento.cantidadGramos).toLocaleString("es-AR", { maximumFractionDigits: 1 })} g
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
