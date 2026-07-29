"use client";

import { useMemo, useState } from "react";
import {
  obtenerBobinas,
  type BobinaFilamento,
} from "../../../lib/stock-service";
import {
  iniciarImpresionConBobinas,
  obtenerRequerimientosFilamento,
  type AsignacionBobina,
  type PedidoProduccion,
} from "../../../lib/production-service";

type Props = {
  pedido: PedidoProduccion;
  onClose: () => void;
  onStarted: (pedido: PedidoProduccion) => void;
};

function normalizar(valor: string) {
  return valor
    .trim()
    .toLocaleLowerCase("es-AR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function FilamentSelectionModal({
  pedido,
  onClose,
  onStarted,
}: Props) {
  const bobinas = useMemo(() => obtenerBobinas(), []);
  const requerimientos = useMemo(
    () => obtenerRequerimientosFilamento(pedido),
    [pedido]
  );

  const [selecciones, setSelecciones] = useState<Record<string, string>>({});

  function obtenerCompatibles(
    material: string,
    color: string
  ): BobinaFilamento[] {
    return bobinas
      .filter((bobina) => {
        const mismoMaterial =
          normalizar(bobina.material) === normalizar(material);
        const mismoColor =
          color === "Sin especificar" ||
          normalizar(bobina.color) === normalizar(color);

        return mismoMaterial && mismoColor;
      })
      .sort((a, b) => a.pesoActualGramos - b.pesoActualGramos);
  }

  function iniciar() {
    const faltantes = requerimientos.filter(
      (requerimiento) => !selecciones[requerimiento.clave]
    );

    if (faltantes.length > 0) {
      alert("Elegí una bobina para cada filamento.");
      return;
    }

    const asignaciones: AsignacionBobina[] = requerimientos.map(
      (requerimiento) => ({
        claveRequerimiento: requerimiento.clave,
        bobinaId: selecciones[requerimiento.clave],
      })
    );

    const actualizado = iniciarImpresionConBobinas(pedido.id, asignaciones);

    if (!actualizado) {
      alert(
        "No se pudo iniciar la impresión. Revisá que las bobinas tengan suficiente filamento."
      );
      return;
    }

    onStarted(actualizado);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#181818] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              Iniciar impresión
            </p>
            <h2 className="mt-2 text-2xl font-bold">Elegí las bobinas</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {pedido.productoNombre} · {pedido.id}
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

        <div className="mt-6 space-y-4">
          {requerimientos.map((requerimiento) => {
            const compatibles = obtenerCompatibles(
              requerimiento.material,
              requerimiento.color
            );

            return (
              <section
                key={requerimiento.clave}
                className="rounded-2xl border border-white/10 bg-[#111111] p-5"
              >
                <h3 className="font-bold">
                  {requerimiento.material} {requerimiento.color}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Necesitás{" "}
                  {requerimiento.gramos.toLocaleString("es-AR", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  g
                </p>

                <select
                  value={selecciones[requerimiento.clave] ?? ""}
                  onChange={(evento) =>
                    setSelecciones((actual) => ({
                      ...actual,
                      [requerimiento.clave]: evento.target.value,
                    }))
                  }
                  className="mt-4 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3 outline-none focus:border-[#810404]"
                >
                  <option value="">Seleccionar bobina...</option>

                  {compatibles.map((bobina) => {
                    const suficiente =
                      bobina.pesoActualGramos >= requerimiento.gramos;

                    return (
                      <option
                        key={bobina.id}
                        value={bobina.id}
                        disabled={!suficiente}
                      >
                        {bobina.id} · {bobina.marca || "Sin marca"} ·{" "}
                        {bobina.pesoActualGramos} g{" "}
                        {suficiente ? "disponibles" : "— insuficiente"}
                      </option>
                    );
                  })}
                </select>

                {compatibles.length === 0 && (
                  <p className="mt-3 text-sm text-amber-300">
                    No hay una bobina compatible. Cargala primero en Stock.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={iniciar}
            className="rounded-xl bg-[#810404] px-6 py-3 font-semibold"
          >
            Descontar e iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
