"use client";

import { useEffect, useState } from "react";

import {
  editarModeloCandidato,
  eliminarModeloCandidato,
  guardarModeloCandidato,
  marcarCandidatoEvaluando,
  obtenerModelosCandidatos,
  type EstadoLicencia,
  type ModeloCandidato,
  type SitioModelo,
} from "@/lib/fair-candidates";

type Props = {
  feriaId?: string;
  onAgregarProductoAFeria?: (
    producto: {
      id: string;
      codigo: string;
      nombre: string;
    },
    cantidad: number
  ) => void;
};

export default function FairCandidates({
  feriaId,
  onAgregarProductoAFeria,
}: Props) {
  const [candidatos, setCandidatos] =
    useState<ModeloCandidato[]>([]);

  const [nombre, setNombre] = useState("");
  const [sitio, setSitio] =
    useState<SitioModelo>("Printables");
  const [url, setUrl] = useState("");
  const [precio, setPrecio] = useState("");
  const [licencia, setLicencia] =
    useState<EstadoLicencia>("sin_revisar");
  const [notas, setNotas] = useState("");

  const [
    cantidadPorCandidato,
    setCantidadPorCandidato,
  ] = useState<Record<string, string>>({});

  useEffect(() => {
    const cargar = () => {
      setCandidatos(
        obtenerModelosCandidatos(feriaId)
      );
    };

    cargar();

    window.addEventListener(
      "ryuka-fair-candidates-updated",
      cargar
    );

    window.addEventListener(
      "ryuka-cloud-loaded",
      cargar
    );

    return () => {
      window.removeEventListener(
        "ryuka-fair-candidates-updated",
        cargar
      );

      window.removeEventListener(
        "ryuka-cloud-loaded",
        cargar
      );
    };
  }, [feriaId]);

  function agregar() {
    if (!nombre.trim()) {
      alert("Ingresá el nombre del modelo.");
      return;
    }

    if (!url.trim()) {
      alert("Pegá el enlace del modelo.");
      return;
    }

    guardarModeloCandidato({
      feriaId,
      nombre: nombre.trim(),
      sitio,
      url: url.trim(),
      precioArchivo: Number(precio) || 0,
      licencia,
      notas: notas.trim(),
    });

    setNombre("");
    setSitio("Printables");
    setUrl("");
    setPrecio("");
    setLicencia("sin_revisar");
    setNotas("");

    setCandidatos(
      obtenerModelosCandidatos(feriaId)
    );
  }

  function cambiarLicencia(
    candidato: ModeloCandidato,
    nuevaLicencia: EstadoLicencia
  ) {
    editarModeloCandidato(
      candidato.id,
      {
        licencia: nuevaLicencia,
      }
    );

    setCandidatos(
      obtenerModelosCandidatos(feriaId)
    );
  }

  function eliminar(id: string) {
    eliminarModeloCandidato(id);

    setCandidatos(
      obtenerModelosCandidatos(feriaId)
    );
  }

  function crearProducto(
    candidato: ModeloCandidato
  ) {
    if (candidato.licencia === "no_comercial") {
      alert(
        "Este modelo está marcado como NO comercial. No lo vamos a convertir en un producto para venta."
      );
      return;
    }

    if (candidato.licencia === "sin_revisar") {
      const continuar = window.confirm(
        "La licencia todavía figura como 'Revisar'. ¿Querés crear igualmente la ficha del producto? Antes de venderlo, confirmá que la licencia permita uso comercial."
      );

      if (!continuar) return;
    }

    marcarCandidatoEvaluando(candidato.id);

    const params = new URLSearchParams({
      nuevo: "1",
      candidatoId: candidato.id,
      feriaId: candidato.feriaId || "",
      nombre: candidato.nombre,
      categoria: "Feria",
      descripcion: [
        `Modelo candidato de ${candidato.sitio}.`,
        candidato.url,
        candidato.notas
          ? `Notas: ${candidato.notas}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
      origen: candidato.sitio,
      modeloUrl: candidato.url,
    });

    window.location.href =
      `/productos?${params.toString()}`;
  }

  function agregarAFeria(
    candidato: ModeloCandidato
  ) {
    if (
      candidato.estado !== "convertido" ||
      !candidato.productoId ||
      !candidato.productoCodigo
    ) {
      return;
    }

    const cantidad = Math.floor(
      Number(
        cantidadPorCandidato[candidato.id] ||
          0
      )
    );

    if (cantidad <= 0) {
      alert(
        "Ingresá cuántas unidades querés llevar a la feria."
      );
      return;
    }

    onAgregarProductoAFeria?.(
      {
        id: candidato.productoId,
        codigo: candidato.productoCodigo,
        nombre:
          candidato.productoNombre ||
          candidato.nombre,
      },
      cantidad
    );

    setCantidadPorCandidato((actual) => ({
      ...actual,
      [candidato.id]: "",
    }));
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Modelos candidatos
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Guardar ideas encontradas
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Pegá los modelos que te gusten de Printables,
          MakerWorld o Cults3D y dejalos asociados a esta feria.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#303030] bg-[#111] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              label="Nombre del modelo"
              value={nombre}
              onChange={setNombre}
              placeholder="Ej. Running Keychain"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">
                Sitio
              </label>

              <select
                value={sitio}
                onChange={(evento) =>
                  setSitio(
                    evento.target
                      .value as SitioModelo
                  )
                }
                className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
              >
                <option value="Printables">
                  Printables
                </option>
                <option value="MakerWorld">
                  MakerWorld
                </option>
                <option value="Cults3D">
                  Cults3D
                </option>
                <option value="Otro">
                  Otro
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Campo
                label="Enlace"
                value={url}
                onChange={setUrl}
                placeholder="https://..."
              />
            </div>

            <Campo
              label="Precio del archivo"
              value={precio}
              onChange={setPrecio}
              type="number"
              placeholder="0"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400">
                Licencia
              </label>

              <select
                value={licencia}
                onChange={(evento) =>
                  setLicencia(
                    evento.target
                      .value as EstadoLicencia
                  )
                }
                className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
              >
                <option value="sin_revisar">
                  Revisar
                </option>
                <option value="comercial">
                  Comercial permitida
                </option>
                <option value="no_comercial">
                  No comercial
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">
                  Notas
                </label>

                <textarea
                  value={notas}
                  onChange={(evento) =>
                    setNotas(
                      evento.target.value
                    )
                  }
                  rows={3}
                  placeholder="Por qué puede servir, qué cambiarías, etc."
                  className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={agregar}
            className="mt-4 w-full rounded-xl bg-[#810404] px-5 py-3 font-semibold transition hover:bg-[#a00808]"
          >
            + Guardar candidato
          </button>
        </div>

        <div>
          {candidatos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#353535] p-6 text-center text-sm text-zinc-500">
              Todavía no guardaste ningún modelo candidato.
            </div>
          ) : (
            <div className="space-y-3">
              {candidatos.map(
                (candidato) => (
                  <article
                    key={candidato.id}
                    className="rounded-xl border border-[#303030] bg-[#111] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-red-300">
                            {candidato.sitio}
                          </p>

                          <span className={claseEstado(candidato.estado)}>
                            {textoEstado(candidato.estado)}
                          </span>
                        </div>

                        <h3 className="mt-1 truncate font-semibold">
                          {candidato.nombre}
                        </h3>

                        {candidato.precioArchivo > 0 && (
                          <p className="mt-1 text-sm text-zinc-400">
                            Archivo:{" "}
                            {moneda(
                              candidato.precioArchivo
                            )}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          eliminar(candidato.id)
                        }
                        className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/30"
                      >
                        Quitar
                      </button>
                    </div>

                    {candidato.estado === "convertido" &&
                      candidato.productoCodigo && (
                        <div className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3 text-sm">
                          <p className="font-semibold text-emerald-300">
                            Producto creado ✓
                          </p>

                          <p className="mt-1 text-zinc-300">
                            {candidato.productoCodigo}
                            {candidato.productoNombre
                              ? ` · ${candidato.productoNombre}`
                              : ""}
                          </p>

                          {onAgregarProductoAFeria && (
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                              <input
                                type="number"
                                min="1"
                                value={
                                  cantidadPorCandidato[
                                    candidato.id
                                  ] || ""
                                }
                                onChange={(evento) =>
                                  setCantidadPorCandidato(
                                    (actual) => ({
                                      ...actual,
                                      [candidato.id]:
                                        evento.target
                                          .value,
                                    })
                                  )
                                }
                                placeholder="Cantidad"
                                className="min-w-0 flex-1 rounded-lg border border-emerald-900/60 bg-[#111] px-3 py-2 text-sm outline-none focus:border-emerald-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  agregarAFeria(
                                    candidato
                                  )
                                }
                                className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950/50"
                              >
                                + Agregar a esta feria
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    {candidato.notas && (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {candidato.notas}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={candidato.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:border-[#810404]"
                      >
                        Ver modelo ↗
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          crearProducto(candidato)
                        }
                        disabled={
                          candidato.licencia ===
                            "no_comercial" ||
                          candidato.estado ===
                            "convertido"
                        }
                        className="rounded-lg border border-[#810404] bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.02] disabled:text-zinc-600"
                      >
                        {candidato.licencia ===
                        "no_comercial"
                          ? "No apto para venta"
                          : candidato.estado ===
                              "convertido"
                            ? "Producto creado ✓"
                            : candidato.estado ===
                                "evaluando"
                              ? "Continuar creando producto"
                              : "Crear producto en Ryuka"}
                      </button>

                      <select
                        value={candidato.licencia}
                        onChange={(evento) =>
                          cambiarLicencia(
                            candidato,
                            evento.target
                              .value as EstadoLicencia
                          )
                        }
                        className={claseLicencia(
                          candidato.licencia
                        )}
                      >
                        <option value="sin_revisar">
                          🟡 Revisar licencia
                        </option>

                        <option value="comercial">
                          🟢 Comercial permitida
                        </option>

                        <option value="no_comercial">
                          🔴 No comercial
                        </option>
                      </select>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs leading-5 text-amber-200/90">
        La licencia queda marcada manualmente porque cada autor
        puede establecer condiciones distintas. Revisá siempre
        la página original antes de vender piezas impresas.
      </div>
    </section>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-zinc-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        placeholder={placeholder}
        className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
      />
    </div>
  );
}

function claseLicencia(
  licencia: EstadoLicencia
) {
  const base =
    "rounded-lg border px-3 py-2 text-xs font-semibold outline-none";

  if (licencia === "comercial") {
    return `${base} border-emerald-900 bg-emerald-950/30 text-emerald-300`;
  }

  if (licencia === "no_comercial") {
    return `${base} border-red-900 bg-red-950/30 text-red-300`;
  }

  return `${base} border-amber-900 bg-amber-950/30 text-amber-300`;
}

function textoEstado(
  estado: ModeloCandidato["estado"]
) {
  if (estado === "convertido") {
    return "🟢 Producto creado";
  }

  if (estado === "evaluando") {
    return "🟡 Evaluando";
  }

  return "💡 Idea pendiente";
}

function claseEstado(
  estado: ModeloCandidato["estado"]
) {
  const base =
    "rounded-full border px-2 py-1 text-[11px] font-semibold";

  if (estado === "convertido") {
    return `${base} border-emerald-900 bg-emerald-950/30 text-emerald-300`;
  }

  if (estado === "evaluando") {
    return `${base} border-amber-900 bg-amber-950/30 text-amber-300`;
  }

  return `${base} border-white/10 bg-white/[0.03] text-zinc-400`;
}

function moneda(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}
