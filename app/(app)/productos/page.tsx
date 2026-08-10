"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/app/components/PageHeader";
import Button from "@/app/components/Button";
import ProductForm from "@/app/components/ProductForm";
import ProductToolbar from "@/app/components/product/ProductToolbar";
import ProductGrid from "@/app/components/product/ProductGrid";

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
      <ProductToolbar
        mostrarFormulario={mostrarFormulario}
        productoEditando={productoEditando}
        cantidadProductos={productos.length}
        cargando={cargando}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onNuevoProducto={comenzarNuevoProducto}
        onCerrarFormulario={cerrarFormulario}
      />

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
        <ProductGrid
          productos={productosFiltrados}
          cargando={cargando}
          eliminandoId={eliminandoId}
          onEditar={comenzarEdicion}
          onEliminar={(productoGuardado) =>
            void eliminar(productoGuardado)
          }
        />
      )}
    </main>
  );
}
