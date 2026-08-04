"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";

import PageHeader from "@/app/components/PageHeader";
import Button from "@/app/components/Button";
import ProductForm from "@/app/components/ProductForm";

import type { Producto } from "@/app/types/producto";

import {
  cargarProductosDesdeNube,
  editarProducto,
  eliminarProducto,
  guardarProducto,
  obtenerProductos,
  suscribirseAProductos,
  type ProductoGuardado,
} from "@/lib/product-service";

function crearProductoInicial(): Producto {
  return {
    nombre: "",
    categoria: "",
    descripcion: "",

    cantidadPorCama: "",
    pesoPorCama: "",
    colores: "",

    horas: "",
    minutos: "",

    horasTrabajoManualPorCama: "",
    minutosTrabajoManualPorCama: "",

    materiales: [],

    accesorios: [
      {
        id: "argolla",
        nombre: "Argolla",
        activo: false,
        modo: "porUnidad",
        cantidad: "1",
      },
      {
        id: "sticker",
        nombre: "Sticker",
        activo: false,
        modo: "porUnidad",
        cantidad: "1",
      },
      {
        id: "caja",
        nombre: "Caja",
        activo: false,
        modo: "porPedido",
        cantidad: "1",
      },
      {
        id: "bolsa",
        nombre: "Bolsa",
        activo: false,
        modo: "porPedido",
        cantidad: "1",
      },
    ],
  };
}

function copiarProductoParaEditar(
  productoGuardado: ProductoGuardado
): Producto {
  return {
    nombre: productoGuardado.nombre,
    categoria: productoGuardado.categoria,
    descripcion: productoGuardado.descripcion,

    cantidadPorCama: productoGuardado.cantidadPorCama,
    pesoPorCama: productoGuardado.pesoPorCama,
    colores: productoGuardado.colores,

    horas: productoGuardado.horas,
    minutos: productoGuardado.minutos,

    horasTrabajoManualPorCama:
      productoGuardado.horasTrabajoManualPorCama,
    minutosTrabajoManualPorCama:
      productoGuardado.minutosTrabajoManualPorCama,

    materiales: productoGuardado.materiales.map((material) => ({
      ...material,
    })),

    accesorios: productoGuardado.accesorios.map((accesorio) => ({
      ...accesorio,
    })),
  };
}

export default function ProductosPage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [producto, setProducto] = useState<Producto>(
    crearProductoInicial()
  );

  const [productoEditando, setProductoEditando] =
    useState<ProductoGuardado | null>(null);

  const [productos, setProductos] = useState<ProductoGuardado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = useMemo(() => {
    const termino = busqueda
      .trim()
      .toLocaleLowerCase("es-AR");

    if (!termino) {
      return productos;
    }

    return productos.filter((item) =>
      [item.nombre, item.codigo, item.categoria]
        .join(" ")
        .toLocaleLowerCase("es-AR")
        .includes(termino)
    );
  }, [busqueda, productos]);

  useEffect(() => {
    let cancelarSuscripcion: (() => void) | undefined;
    let activo = true;

    setProductos(obtenerProductos());

    void cargarProductosDesdeNube()
      .then((productosNube) => {
        if (activo) {
          setProductos(productosNube);
          setErrorCarga("");
        }
      })
      .catch((error) => {
        console.error(error);

        if (activo) {
          setErrorCarga(
            "No se pudieron cargar los productos desde la nube."
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    void suscribirseAProductos((actualizados) => {
      if (activo) {
        setProductos(actualizados);
      }
    })
      .then((cancelar) => {
        if (!activo) {
          cancelar();
          return;
        }

        cancelarSuscripcion = cancelar;
      })
      .catch((error) => {
        if (activo) {
          console.error(error);
        }
      });

    return () => {
      activo = false;
      cancelarSuscripcion?.();
    };
  }, []);

  function cerrarFormulario() {
    setProducto(crearProductoInicial());
    setProductoEditando(null);
    setMostrarFormulario(false);
  }

  function comenzarNuevoProducto() {
    setProducto(crearProductoInicial());
    setProductoEditando(null);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function comenzarEdicion(productoGuardado: ProductoGuardado) {
    setProducto(copiarProductoParaEditar(productoGuardado));
    setProductoEditando(productoGuardado);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function recargarProductos() {
    const actualizados = await cargarProductosDesdeNube();
    setProductos(actualizados);
  }

  async function guardar() {
    if (!producto.nombre.trim()) {
      alert("Ingresá el nombre del producto.");
      return;
    }

    if (!producto.cantidadPorCama) {
      alert("Ingresá la cantidad por cama.");
      return;
    }

    if (guardando) {
      return;
    }

    setGuardando(true);

    try {
      if (productoEditando) {
        const actualizado = await editarProducto(
          productoEditando.id,
          producto
        );

        if (!actualizado) {
          throw new Error(
            "No se encontró el producto que querías editar."
          );
        }

        await recargarProductos();
        cerrarFormulario();

        alert(
          `Producto ${actualizado.codigo} actualizado correctamente.`
        );

        return;
      }

      const guardado = await guardarProducto(producto);

      await recargarProductos();
      cerrarFormulario();

      alert(
        `Producto ${guardado.codigo} guardado correctamente en la nube.`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(productoGuardado: ProductoGuardado) {
    if (eliminandoId) {
      return;
    }

    const confirmar = window.confirm(
      `¿Querés eliminar ${productoGuardado.codigo} · ${productoGuardado.nombre}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    setEliminandoId(productoGuardado.id);

    try {
      const eliminado = await eliminarProducto(productoGuardado.id);

      if (!eliminado) {
        throw new Error(
          "No se encontró el producto que querías eliminar."
        );
      }

      setProductos((actuales) =>
        actuales.filter(
          (item) => item.id !== productoGuardado.id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el producto."
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <main className="p-5 text-white md:p-8 lg:p-10">
      <PageHeader
        titulo={
          productoEditando
            ? `Editar ${productoEditando.codigo}`
            : "Productos"
        }
        subtitulo={
          productoEditando
            ? "Modificá la ficha y la receta del producto."
            : "Administrá tus fichas y recetas de producción."
        }
      />

      {errorCarga && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
          {errorCarga}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-4 md:flex md:items-center md:justify-between md:gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {mostrarFormulario
              ? productoEditando
                ? "Editando producto"
                : "Nuevo producto"
              : "Mis productos"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {cargando
              ? "Sincronizando productos..."
              : `${productos.length} productos guardados`}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0">
          {!mostrarFormulario && (
            <div className="relative min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar producto..."
                className="w-full rounded-xl border border-[#2b2b2b] bg-[#111] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#810404]"
              />
            </div>
          )}

          <Button
            texto={mostrarFormulario ? "Cerrar" : "+ Nuevo producto"}
            onClick={
              mostrarFormulario
                ? cerrarFormulario
                : comenzarNuevoProducto
            }
          />
        </div>
      </div>

      {mostrarFormulario && (
        <>
          <ProductForm
            producto={producto}
            setProducto={setProducto}
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={guardando}
              className="rounded-xl bg-[#810404] px-6 py-3 font-semibold transition hover:bg-[#a00808] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : productoEditando
                  ? "Actualizar producto"
                  : "Guardar producto"}
            </button>

            <button
              type="button"
              onClick={cerrarFormulario}
              disabled={guardando}
              className="rounded-xl border border-[#3a3a3a] px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </>
      )}

      {!mostrarFormulario && (
        <>
          {productosFiltrados.length === 0 && !cargando ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#343434] bg-[#171717] p-10 text-center">
              <p className="font-semibold text-gray-300">
                No encontramos productos.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Probá con otra búsqueda o creá un producto nuevo.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {productosFiltrados.map((productoGuardado) => (
                <article
                  key={productoGuardado.id}
                  className="flex flex-col rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5 transition hover:-translate-y-0.5 hover:border-[#444]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-300">
                        {productoGuardado.codigo}
                      </p>

                      <h3 className="mt-2 truncate text-xl font-bold">
                        {productoGuardado.nombre}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        {productoGuardado.categoria ||
                          "Sin categoría"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm">
                    <p>
                      Cantidad por cama:{" "}
                      <strong>
                        {productoGuardado.cantidadPorCama}
                      </strong>
                    </p>

                    <p>
                      Peso por cama:{" "}
                      <strong>
                        {productoGuardado.pesoPorCama || "0"} g
                      </strong>
                    </p>

                    <p>
                      Tiempo por cama:{" "}
                      <strong>
                        {productoGuardado.horas || "0"} h{" "}
                        {productoGuardado.minutos || "0"} min
                      </strong>
                    </p>

                    <p>
                      Filamentos detallados:{" "}
                      <strong>
                        {productoGuardado.materiales.length}
                      </strong>
                    </p>
                  </div>

                  {productoGuardado.materiales.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {productoGuardado.materiales.map(
                        (material) => (
                          <span
                            key={material.id}
                            className="rounded-full border border-[#353535] bg-[#151515] px-3 py-1 text-xs text-gray-300"
                          >
                            {material.material} {material.color}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex gap-3 border-t border-[#303030] pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        comenzarEdicion(productoGuardado)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#3a3a3a] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.04]"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void eliminar(productoGuardado)
                      }
                      disabled={
                        eliminandoId === productoGuardado.id
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-900 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {eliminandoId === productoGuardado.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}