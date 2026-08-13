"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  obtenerBobinas,
  type BobinaFilamento,
} from "@/lib/stock-service";

import {
  iniciarProduccionConBobinas,
  obtenerRequerimientosFilamentoNube,
  type AsignacionBobinaNube,
  type OrdenProduccionNube,
} from "@/lib/cloud-production-service";

type Props = {
  pedido: OrdenProduccionNube;
  onClose: () => void;
  onStarted: (
    pedido: OrdenProduccionNube
  ) => void;
};

function normalizar(
  valor: string
) {
  return valor
    .trim()
    .toLocaleLowerCase(
      "es-AR"
    )
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

export default function FilamentSelectionModalCloud({
  pedido,
  onClose,
  onStarted,
}: Props) {
  const [bobinas, setBobinas] =
    useState<
      BobinaFilamento[]
    >([]);

  const [cargandoBobinas, setCargandoBobinas] =
    useState(true);

  const [errorBobinas, setErrorBobinas] =
    useState("");

  useEffect(() => {
    let activo = true;

    void obtenerBobinas()
      .then((data) => {
        if (activo) {
          setBobinas(data);
        }
      })
      .catch((error) => {
        console.error(error);

        if (activo) {
          setErrorBobinas(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las bobinas."
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoBobinas(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const requerimientos =
    useMemo(
      () =>
        obtenerRequerimientosFilamentoNube(
          pedido
        ),
      [pedido]
    );

  const [
    selecciones,
    setSelecciones,
  ] = useState<
    Record<string, string>
  >({});

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  function obtenerCompatibles(
    material: string,
    color: string
  ): BobinaFilamento[] {
    return bobinas
      .filter((bobina) => {
        const mismoMaterial =
          normalizar(
            bobina.material
          ) ===
          normalizar(material);

        const mismoColor =
          color ===
            "Sin especificar" ||
          normalizar(
            bobina.color
          ) ===
            normalizar(color);

        return (
          mismoMaterial &&
          mismoColor
        );
      })
      .sort(
        (a, b) =>
          a.pesoActualGramos -
          b.pesoActualGramos
      );
  }

  async function iniciar() {
    const faltantes =
      requerimientos.filter(
        (requerimiento) =>
          !selecciones[
            requerimiento.key
          ]
      );

    if (
      faltantes.length > 0
    ) {
      alert(
        "Elegí una bobina para cada filamento."
      );
      return;
    }

    const asignaciones:
      AsignacionBobinaNube[] =
        requerimientos.map(
          (
            requerimiento
          ) => ({
            requirementKey:
              requerimiento.key,

            // Ahora usamos el UUID real de filament_spools.
            spoolId:
              selecciones[
                requerimiento.key
              ],
          })
        );

    setGuardando(true);

    try {
      const actualizado =
        await iniciarProduccionConBobinas(
          pedido,
          asignaciones
        );

      onStarted(
        actualizado
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la impresión."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#181818] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              Iniciar impresión
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Elegí las bobinas
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {pedido.code}
              {pedido.orderCode
                ? ` · ${pedido.orderCode}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              guardando
            }
            className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {cargandoBobinas && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-400">
            Cargando bobinas de Stock...
          </div>
        )}

        {errorBobinas && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/20 p-4 text-sm text-red-200">
            {errorBobinas}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {requerimientos.map(
            (
              requerimiento
            ) => {
              const compatibles =
                obtenerCompatibles(
                  requerimiento.material,
                  requerimiento.color
                );

              return (
                <section
                  key={
                    requerimiento.key
                  }
                  className="rounded-2xl border border-white/10 bg-[#111111] p-5"
                >
                  <p className="text-xs text-zinc-500">
                    {
                      requerimiento.productName
                    }
                  </p>

                  <h3 className="mt-1 font-bold">
                    {
                      requerimiento.material
                    }{" "}
                    {
                      requerimiento.color
                    }
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Necesitás{" "}
                    {requerimiento.grams.toLocaleString(
                      "es-AR",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    g
                  </p>

                  <select
                    value={
                      selecciones[
                        requerimiento.key
                      ] ?? ""
                    }
                    disabled={
                      guardando ||
                      cargandoBobinas
                    }
                    onChange={(
                      evento
                    ) =>
                      setSelecciones(
                        (
                          actual
                        ) => ({
                          ...actual,

                          [requerimiento.key]:
                            evento
                              .target
                              .value,
                        })
                      )
                    }
                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 py-3 outline-none focus:border-[#810404] disabled:opacity-50"
                  >
                    <option value="">
                      Seleccionar bobina...
                    </option>

                    {compatibles.map(
                      (bobina) => {
                        const suficiente =
                          bobina.pesoActualGramos >=
                          requerimiento.grams;

                        return (
                          <option
                            key={
                              bobina.uuid
                            }

                            // El usuario sigue viendo BOB-xxxx,
                            // pero guardamos el UUID real.
                            value={
                              bobina.uuid
                            }

                            disabled={
                              !suficiente
                            }
                          >
                            {
                              bobina.id
                            }{" "}
                            ·{" "}
                            {bobina.marca ||
                              "Sin marca"}{" "}
                            ·{" "}
                            {
                              bobina.pesoActualGramos
                            }{" "}
                            g{" "}
                            {suficiente
                              ? "disponibles"
                              : "— insuficiente"}
                          </option>
                        );
                      }
                    )}
                  </select>

                  {!cargandoBobinas &&
                    compatibles.length ===
                      0 && (
                      <p className="mt-3 text-sm text-amber-300">
                        No hay una
                        bobina compatible
                        en Stock.
                      </p>
                    )}
                </section>
              );
            }
          )}
        </div>

        {requerimientos.length ===
          0 && (
          <div className="mt-6 rounded-xl border border-amber-900 bg-amber-950/20 p-4 text-sm text-amber-200">
            Esta producción no tiene
            requerimientos de filamento
            calculables.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={
              guardando
            }
            className="rounded-xl border border-white/10 px-5 py-3 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() =>
              void iniciar()
            }
            disabled={
              guardando ||
              cargandoBobinas ||
              Boolean(
                errorBobinas
              ) ||
              requerimientos.length ===
                0
            }
            className="rounded-xl bg-[#810404] px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando
              ? "Iniciando..."
              : "Descontar e iniciar"}
          </button>
        </div>
      </div>
    </div>
  );
}
