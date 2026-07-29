"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "@/app/components/PageHeader";
import Button from "@/app/components/Button";
import { Search } from "lucide-react";
import ProductForm from "@/app/components/ProductForm";

import type {
  Producto,
} from "@/app/types/producto";

import {
  cargarProductosDesdeNube,
  guardarProducto,
  obtenerProductos,
  suscribirseAProductos,
  type ProductoGuardado,
} from "@/lib/product-service";

function crearProductoInicial():
  Producto {
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

export default function ProductosPage() {
  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [producto, setProducto] =
    useState<Producto>(
      crearProductoInicial()
    );

  const [productos, setProductos] =
    useState<ProductoGuardado[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [errorCarga, setErrorCarga] =
    useState("");

  const [busqueda, setBusqueda] = useState("");
  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-AR");
    if (!termino) return productos;
    return productos.filter((item) => [item.nombre, item.codigo, item.categoria].join(" ").toLocaleLowerCase("es-AR").includes(termino));
  }, [busqueda, productos]);

useEffect(() => {
  let cancelarSuscripcion: (() => void) | undefined;
  let activo = true;

  setProductos(obtenerProductos());

  void cargarProductosDesdeNube()
    .then((productosNube) => {
      if (activo) {
        setProductos(productosNube);
      }
    })
    .catch((error) => {
      console.error(error);

      if (activo) {
        setErrorCarga(
          "No se pudieron cargar los productos desde la nube. Revisá que hayas ejecutado el SQL de Productos en Supabase."
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
      // Si el componente ya se desmontó mientras esperábamos,
      // cancelamos la suscripción inmediatamente.
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
    setProducto(
      crearProductoInicial()
    );

    setMostrarFormulario(false);
  }

  async function guardar() {
    if (!producto.nombre.trim()) {
      alert(
        "Ingresá el nombre del producto."
      );

      return;
    }

    if (!producto.cantidadPorCama) {
      alert(
        "Ingresá la cantidad por cama."
      );

      return;
    }

    try {
      const guardado =
        await guardarProducto(producto);

      setProductos(obtenerProductos());
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
    }
  }

  return (
    <main className="p-5 text-white md:p-8 lg:p-10">
      <PageHeader
        titulo="Productos"
        subtitulo="Administrá tus fichas y recetas de producción."
      />

      {errorCarga && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-200">
          {errorCarga}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[#2b2b2b] bg-[#171717] p-4 md:flex md:items-center md:justify-between md:gap-4">
        <div>
          <h2 className="text-lg font-semibold">Mis productos</h2>
          <p className="mt-1 text-sm text-gray-500">{cargando ? "Sincronizando productos..." : `${productos.length} productos guardados`}</p>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0">
          {!mostrarFormulario && (
            <div className="relative min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..." className="w-full rounded-xl border border-[#2b2b2b] bg-[#111] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#810404]" />
            </div>
          )}
          <Button texto={mostrarFormulario ? "Cerrar" : "+ Nuevo producto"} onClick={() => mostrarFormulario ? cerrarFormulario() : setMostrarFormulario(true)} />
        </div>
      </div>

      {mostrarFormulario && (
        <>
          <ProductForm
            producto={producto}
            setProducto={setProducto}
          />

          <div className="mt-6 flex gap-4">
            <Button
              texto="Guardar producto"
              onClick={guardar}
            />

            <button
              type="button"
              onClick={cerrarFormulario}
              className="rounded-xl border border-[#3a3a3a] px-6 py-3 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </>
      )}

      {!mostrarFormulario && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productosFiltrados.map(
            (productoGuardado) => (
              <article
                key={productoGuardado.id}
                className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5 transition hover:-translate-y-0.5 hover:border-[#444]"
              >
                <p className="text-xs font-semibold text-red-300">
                  {productoGuardado.id}
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {productoGuardado.nombre}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {productoGuardado.categoria ||
                    "Sin categoría"}
                </p>

                <div className="mt-5 space-y-2 text-sm">
                  <p>
                    Cantidad por cama:{" "}
                    {
                      productoGuardado.cantidadPorCama
                    }
                  </p>

                  <p>
                    Peso por cama:{" "}
                    {productoGuardado.pesoPorCama ||
                      "0"}{" "}
                    g
                  </p>

                  <p>
                    Filamentos detallados:{" "}
                    {
                      productoGuardado
                        .materiales.length
                    }
                  </p>
                </div>

                {productoGuardado
                  .materiales.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {productoGuardado.materiales.map(
                      (material) => (
                        <span
                          key={material.id}
                          className="rounded-full border border-[#353535] bg-[#151515] px-3 py-1 text-xs text-gray-300"
                        >
                          {material.material}{" "}
                          {material.color}
                        </span>
                      )
                    )}
                  </div>
                )}
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}