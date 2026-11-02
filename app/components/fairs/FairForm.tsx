"use client";

import { useMemo, useState } from "react";

import type { FeriaGuardada, ProductoFeria } from "@/lib/fair-service";
import type { ProductoGuardado } from "@/lib/product-service";
import FairProductAssistant from "./FairProductAssistant";
import FairCandidates from "./FairCandidates";

type Props = {
  productos: ProductoGuardado[];
  feriaInicial: FeriaGuardada | null;
  onGuardar: (
    feria: Omit<
      FeriaGuardada,
      "id" | "creadoEn" | "actualizadoEn"
    >
  ) => void;
  onCancelar: () => void;
};

const TIPOS = [
  "Anime / Geek",
  "Escuela",
  "Atletismo / Running",
  "Fitness",
  "Emprendedores",
  "Música",
  "Navidad",
  "Otro",
];

export default function FairForm({
  productos,
  feriaInicial,
  onGuardar,
  onCancelar,
}: Props) {
  const [nombre, setNombre] = useState(
    feriaInicial?.nombre || ""
  );

  const [tipo, setTipo] = useState(
    feriaInicial?.tipo || ""
  );

  const [fecha, setFecha] = useState(
    feriaInicial?.fecha || ""
  );

  const [lugar, setLugar] = useState(
    feriaInicial?.lugar || ""
  );

  const [
    publicoEstimado,
    setPublicoEstimado,
  ] = useState(
    String(feriaInicial?.publicoEstimado || "")
  );

  const [
    presupuestoObjetivo,
    setPresupuestoObjetivo,
  ] = useState(
    String(
      feriaInicial?.presupuestoObjetivo || ""
    )
  );

  const [notas, setNotas] = useState(
    feriaInicial?.notas || ""
  );

  const [estado, setEstado] = useState<
    FeriaGuardada["estado"]
  >(feriaInicial?.estado || "planificada");

  const [productosFeria, setProductosFeria] =
    useState<ProductoFeria[]>(
      feriaInicial?.productos || []
    );

  const [productoId, setProductoId] =
    useState("");

  const [cantidad, setCantidad] =
    useState("");

  const productoSeleccionado = useMemo(
    () =>
      productos.find(
        (producto) =>
          producto.id === productoId
      ),
    [productoId, productos]
  );

  function agregarProducto() {
    if (!productoSeleccionado) {
      alert("Seleccioná un producto.");
      return;
    }

    const cantidadNumero = Number(cantidad);

    if (
      !Number.isFinite(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      alert("Ingresá una cantidad válida.");
      return;
    }

    setProductosFeria((actuales) => {
      const indice = actuales.findIndex(
        (item) =>
          item.productId ===
          productoSeleccionado.id
      );

      if (indice >= 0) {
        return actuales.map((item, index) =>
          index === indice
            ? {
                ...item,
                cantidadObjetivo:
                  item.cantidadObjetivo +
                  cantidadNumero,
              }
            : item
        );
      }

      return [
        ...actuales,
        {
          productId: productoSeleccionado.id,
          codigo: productoSeleccionado.codigo,
          nombre: productoSeleccionado.nombre,
          cantidadObjetivo: cantidadNumero,
          cantidadPreparada: 0,
        },
      ];
    });

    setProductoId("");
    setCantidad("");
  }

  function quitarProducto(indice: number) {
    setProductosFeria((actuales) =>
      actuales.filter(
        (_, index) => index !== indice
      )
    );
  }

  function agregarProductoConvertido(
    producto: {
      id: string;
      codigo: string;
      nombre: string;
    },
    cantidadObjetivo: number
  ) {
    setProductosFeria((actuales) => {
      const existente = actuales.findIndex(
        (item) =>
          item.productId === producto.id
      );

      if (existente >= 0) {
        const sumar = window.confirm(
          `${producto.codigo} · ${producto.nombre} ya está en esta feria. ¿Querés sumar ${cantidadObjetivo} unidades al objetivo actual?`
        );

        if (!sumar) {
          return actuales;
        }

        return actuales.map((item, index) =>
          index === existente
            ? {
                ...item,
                cantidadObjetivo:
                  item.cantidadObjetivo +
                  cantidadObjetivo,
              }
            : item
        );
      }

      return [
        ...actuales,
        {
          productId: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          cantidadObjetivo,
          cantidadPreparada: 0,
        },
      ];
    });

    alert(
      `${producto.codigo} agregado al plan de esta feria.`
    );
  }

  function guardar() {
    if (!nombre.trim()) {
      alert("Ingresá el nombre de la feria.");
      return;
    }

    if (!tipo.trim()) {
      alert("Seleccioná el tipo de feria.");
      return;
    }

    onGuardar({
      nombre: nombre.trim(),
      tipo,
      fecha,
      lugar: lugar.trim(),
      publicoEstimado:
        Number(publicoEstimado) || 0,
      presupuestoObjetivo:
        Number(presupuestoObjetivo) || 0,
      notas: notas.trim(),
      estado,
      productos: productosFeria,
    });
  }

  return (
    <div className="mt-6">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Datos del evento
        </p>

        <h2 className="mt-1 text-xl font-bold">
          {feriaInicial
            ? "Editar feria"
            : "Nueva feria"}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Campo
            label="Nombre"
            value={nombre}
            onChange={setNombre}
            placeholder="Ej. Expo Running"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm text-[var(--muted)]">
              Tipo de feria
            </label>

            <select
              value={tipo}
              onChange={(evento) =>
                setTipo(evento.target.value)
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="">
                Seleccioná un tipo
              </option>

              {TIPOS.map((tipoFeria) => (
                <option
                  key={tipoFeria}
                  value={tipoFeria}
                >
                  {tipoFeria}
                </option>
              ))}
            </select>
          </div>

          <Campo
            label="Fecha"
            value={fecha}
            onChange={setFecha}
            type="date"
          />

          <Campo
            label="Lugar"
            value={lugar}
            onChange={setLugar}
            placeholder="Ciudad / salón / club"
          />

          <Campo
            label="Público estimado"
            value={publicoEstimado}
            onChange={setPublicoEstimado}
            type="number"
            placeholder="0"
          />

          <Campo
            label="Presupuesto objetivo"
            value={presupuestoObjetivo}
            onChange={setPresupuestoObjetivo}
            type="number"
            placeholder="$"
          />

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-[var(--muted)]">
              Estado
            </label>

            <select
              value={estado}
              onChange={(evento) =>
                setEstado(
                  evento.target
                    .value as FeriaGuardada["estado"]
                )
              }
              className="rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              <option value="planificada">
                Planificada
              </option>
              <option value="en_preparacion">
                En preparación
              </option>
              <option value="finalizada">
                Finalizada
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm text-[var(--muted)]">
              Notas
            </label>

            <textarea
              value={notas}
              onChange={(evento) =>
                setNotas(evento.target.value)
              }
              rows={4}
              placeholder="Objetivo, público, ideas, costos del stand..."
              className="rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={guardar}
            className="rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold hover:bg-[var(--accent-hover)]"
          >
            Guardar feria
          </button>

          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-[var(--border)] px-6 py-3 font-semibold"
          >
            Cancelar
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Producción para stock
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Productos a llevar
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          Definí el objetivo de unidades por producto.
        </p>

        <div className="mt-5 space-y-3">
          <select
            value={productoId}
            onChange={(evento) =>
              setProductoId(evento.target.value)
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="">
              Seleccioná un producto
            </option>

            {productos.map((producto) => (
              <option
                key={producto.id}
                value={producto.id}
              >
                {producto.codigo} · {producto.nombre}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(evento) =>
                setCantidad(evento.target.value)
              }
              placeholder="Cantidad"
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
            />

            <button
              type="button"
              onClick={agregarProducto}
              className="rounded-xl border border-[var(--accent)] px-4 py-3 font-semibold text-red-200 hover:bg-red-950/30"
            >
              Agregar
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {productosFeria.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#353535] p-5 text-center text-sm text-[var(--muted)]">
              Todavía no agregaste productos.
            </div>
          ) : (
            productosFeria.map(
              (producto, indice) => (
                <div
                  key={`${producto.productId}-${indice}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[#111] p-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--accent-text)]">
                      {producto.codigo}
                    </p>

                    <p className="mt-1 truncate font-semibold">
                      {producto.nombre}
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Objetivo: {producto.cantidadObjetivo} · Faltan: {Math.max(0, producto.cantidadObjetivo - producto.cantidadPreparada)}
                    </p>

                    <label className="mt-3 block text-xs text-[var(--muted)]">
                      Ya preparados
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={producto.cantidadObjetivo}
                      value={producto.cantidadPreparada}
                      onChange={(evento) => {
                        const preparada = Math.min(
                          producto.cantidadObjetivo,
                          Math.max(0, Number(evento.target.value) || 0)
                        );
                        setProductosFeria((actuales) =>
                          actuales.map((item, index) =>
                            index === indice
                              ? { ...item, cantidadPreparada: preparada }
                              : item
                          )
                        );
                      }}
                      className="mt-1 w-28 rounded-lg border border-[#353535] bg-[var(--field)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      quitarProducto(indice)
                    }
                    className="rounded-lg border border-red-900 px-3 py-2 text-xs font-semibold text-[var(--accent-text)] hover:bg-red-950/30"
                  >
                    Quitar
                  </button>
                </div>
              )
            )
          )}
        </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Próxima evolución
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Acá vamos a sumar las recomendaciones automáticas
            según el tipo de feria y las búsquedas en las páginas
            de modelos 3D que usan habitualmente.
          </p>
        </div>
      </section>
      </div>

      <FairProductAssistant
        tipo={tipo}
        publicoEstimado={Number(publicoEstimado) || 0}
        productos={productos}
      />

      <FairCandidates
        feriaId={feriaInicial?.id}
        onAgregarProductoAFeria={
          agregarProductoConvertido
        }
      />
    </div>
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
      <label className="text-sm text-[var(--muted)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        placeholder={placeholder}
        className="rounded-xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
