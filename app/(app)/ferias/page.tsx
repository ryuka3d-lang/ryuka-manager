"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/app/components/PageHeader";
import FairForm from "@/app/components/fairs/FairForm";
import FairCard from "@/app/components/fairs/FairCard";

import {
  editarFeria,
  eliminarFeria,
  guardarFeria,
  obtenerFerias,
  type FeriaGuardada,
} from "@/lib/fair-service";

import {
  cargarProductosDesdeNube,
  obtenerProductos,
  type ProductoGuardado,
} from "@/lib/product-service";

export default function FeriasPage() {
  const [ferias, setFerias] =
    useState<FeriaGuardada[]>([]);

  const [productos, setProductos] =
    useState<ProductoGuardado[]>([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [feriaEditando, setFeriaEditando] =
    useState<FeriaGuardada | null>(null);

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setFerias(obtenerFerias());
    setProductos(obtenerProductos());

    void cargarProductosDesdeNube()
      .then(setProductos)
      .catch((error) => {
        console.error(
          "No se pudieron cargar los productos:",
          error
        );
      });

    const actualizar = () => {
      setFerias(obtenerFerias());
    };

    window.addEventListener(
      "ryuka-fairs-updated",
      actualizar
    );

    window.addEventListener(
      "ryuka-cloud-loaded",
      actualizar
    );

    return () => {
      window.removeEventListener(
        "ryuka-fairs-updated",
        actualizar
      );

      window.removeEventListener(
        "ryuka-cloud-loaded",
        actualizar
      );
    };
  }, []);

  const feriasFiltradas = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLocaleLowerCase("es-AR");

    if (!texto) return ferias;

    return ferias.filter((feria) =>
      [
        feria.nombre,
        feria.tipo,
        feria.lugar,
        feria.estado,
      ]
        .join(" ")
        .toLocaleLowerCase("es-AR")
        .includes(texto)
    );
  }, [busqueda, ferias]);

  function abrirNueva() {
    setFeriaEditando(null);
    setMostrarFormulario(true);
  }

  function abrirEdicion(feria: FeriaGuardada) {
    setFeriaEditando(feria);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setFeriaEditando(null);
    setMostrarFormulario(false);
  }

  function guardar(
    datos: Omit<
      FeriaGuardada,
      "id" | "creadoEn" | "actualizadoEn"
    >
  ) {
    if (feriaEditando) {
      editarFeria(feriaEditando.id, datos);
    } else {
      guardarFeria(datos);
    }

    setFerias(obtenerFerias());
    cerrarFormulario();
  }

  function eliminar(feria: FeriaGuardada) {
    const confirmar = window.confirm(
      `¿Querés eliminar la feria "${feria.nombre}"?`
    );

    if (!confirmar) return;

    eliminarFeria(feria.id);
    setFerias(obtenerFerias());
  }

  return (
    <main className="p-5 text-white md:p-8 lg:p-10">
      <PageHeader
        titulo="Ferias"
        subtitulo="Planificá qué llevar, cuánto producir y qué aprender de cada evento."
      />

      <section className="mt-6 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              Planificación
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Próximas ferias
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {ferias.length} ferias guardadas
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!mostrarFormulario && (
              <input
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar feria..."
                className="rounded-xl border border-[#2b2b2b] bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#810404]"
              />
            )}

            <button
              type="button"
              onClick={
                mostrarFormulario
                  ? cerrarFormulario
                  : abrirNueva
              }
              className="rounded-xl bg-[#810404] px-5 py-3 text-sm font-semibold transition hover:bg-[#a00808]"
            >
              {mostrarFormulario
                ? "Cerrar"
                : "+ Nueva feria"}
            </button>
          </div>
        </div>
      </section>

      {mostrarFormulario ? (
        <FairForm
          productos={productos}
          feriaInicial={feriaEditando}
          onGuardar={guardar}
          onCancelar={cerrarFormulario}
        />
      ) : feriasFiltradas.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#343434] bg-[#171717] p-10 text-center">
          <p className="font-semibold text-zinc-300">
            Todavía no hay ferias cargadas.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Creá la primera para empezar a planificar la
            producción para stock.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {[...feriasFiltradas]
            .sort((a, b) =>
              (a.fecha || "9999").localeCompare(
                b.fecha || "9999"
              )
            )
            .map((feria) => (
              <FairCard
                key={feria.id}
                feria={feria}
                onEditar={abrirEdicion}
                onEliminar={eliminar}
              />
            ))}
        </div>
      )}
    </main>
  );
}
