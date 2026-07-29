"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  actualizarCliente,
  cargarClientesDesdeNube,
  eliminarCliente,
  guardarCliente,
  obtenerPresupuestosDeCliente,
  obtenerResumenesClientes,
  type ResumenCliente,
} from "@/lib/client-service";

import type {
  PresupuestoGuardado,
} from "@/lib/budget-service";

type FormularioCliente = {
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
};

const FORMULARIO_INICIAL:
  FormularioCliente = {
  nombre: "",
  telefono: "",
  email: "",
  notas: "",
};

const formateadorDinero =
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const formateadorFecha =
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function ClientesPage() {
  const [clientes, setClientes] =
    useState<ResumenCliente[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [
    formularioVisible,
    setFormularioVisible,
  ] = useState(false);

  const [
    clienteEditandoId,
    setClienteEditandoId,
  ] = useState<string | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioCliente>(
      FORMULARIO_INICIAL
    );

  const [
    clienteSeleccionado,
    setClienteSeleccionado,
  ] = useState<ResumenCliente | null>(
    null
  );

  const [
    historialSeleccionado,
    setHistorialSeleccionado,
  ] = useState<PresupuestoGuardado[]>(
    []
  );

  useEffect(() => {
    recargarClientes();
  }, []);

  const clientesFiltrados = useMemo(
    () => {
      const texto = busqueda
        .trim()
        .toLocaleLowerCase("es-AR");

      if (!texto) {
        return clientes;
      }

      return clientes.filter(
        (cliente) =>
          cliente.nombre
            .toLocaleLowerCase("es-AR")
            .includes(texto) ||
          cliente.email
            .toLocaleLowerCase("es-AR")
            .includes(texto) ||
          cliente.telefono.includes(texto)
      );
    },
    [clientes, busqueda]
  );

  const totalPresupuestos = clientes.reduce(
    (total, cliente) =>
      total + cliente.cantidadPresupuestos,
    0
  );

  const totalMayorista = clientes.reduce(
    (total, cliente) =>
      total +
      cliente.totalMayoristaPresupuestado,
    0
  );

  const clientesConActividad =
    clientes.filter(
      (cliente) =>
        cliente.cantidadPresupuestos > 0
    ).length;

  function recargarClientes() {
    setClientes(obtenerResumenesClientes());
    void cargarClientesDesdeNube()
      .then(() => setClientes(obtenerResumenesClientes()))
      .catch((error) => console.error("No se pudieron cargar los clientes desde Supabase:", error));
  }

  function actualizarFormulario(
    cambios: Partial<FormularioCliente>
  ) {
    setFormulario(
      (formularioActual) => ({
        ...formularioActual,
        ...cambios,
      })
    );
  }

  function abrirNuevoCliente() {
    setClienteEditandoId(null);
    setFormulario(FORMULARIO_INICIAL);
    setFormularioVisible(true);
  }

  function abrirEdicion(
    cliente: ResumenCliente
  ) {
    setClienteEditandoId(cliente.id);

    setFormulario({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      notas: cliente.notas,
    });

    setFormularioVisible(true);
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
    setClienteEditandoId(null);
    setFormulario(FORMULARIO_INICIAL);
  }

  async function manejarGuardarCliente() {
    if (!formulario.nombre.trim()) {
      alert(
        "Ingresá el nombre del cliente."
      );

      return;
    }

    if (clienteEditandoId) {
      await actualizarCliente(
        clienteEditandoId,
        formulario
      );
    } else {
      await guardarCliente(formulario);
    }

    recargarClientes();
    cerrarFormulario();
  }

  async function manejarEliminarCliente(
    cliente: ResumenCliente
  ) {
    const confirmar = window.confirm(
      `¿Querés eliminar a ${cliente.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    const eliminado =
      await eliminarCliente(cliente.id);

    if (!eliminado) {
      alert(
        "Este cliente tiene presupuestos asociados y no se puede eliminar. Podés editar sus datos."
      );

      return;
    }

    recargarClientes();
  }

  function abrirHistorial(
    cliente: ResumenCliente
  ) {
    setClienteSeleccionado(cliente);

    setHistorialSeleccionado(
      obtenerPresupuestosDeCliente(
        cliente.nombre
      )
    );
  }

  function cerrarHistorial() {
    setClienteSeleccionado(null);
    setHistorialSeleccionado([]);
  }

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(129,4,4,0.34),_transparent_44%),#181818] p-7 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
                Base comercial
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Clientes
              </h1>

              <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
                Cada cliente nuevo detectado en los presupuestos aparece automáticamente acá.
                También podés completar sus datos y consultar su historial.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirNuevoCliente}
              className="rounded-xl bg-[#810404] px-6 py-3 font-semibold transition hover:bg-[#a00808]"
            >
              + Nuevo cliente
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TarjetaResumen
            titulo="Clientes"
            valor={String(clientes.length)}
            detalle="registrados"
          />

          <TarjetaResumen
            titulo="Con actividad"
            valor={String(
              clientesConActividad
            )}
            detalle="con presupuestos"
          />

          <TarjetaResumen
            titulo="Presupuestos"
            valor={String(totalPresupuestos)}
            detalle="históricos"
          />

          <TarjetaResumen
            titulo="Valor mayorista"
            valor={formateadorDinero.format(
              totalMayorista
            )}
            detalle="total presupuestado"
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-5 lg:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Directorio de clientes
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {clientesFiltrados.length} resultado
                {clientesFiltrados.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <input
              type="search"
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value
                )
              }
              placeholder="Buscar por nombre, teléfono o email..."
              className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#810404] md:max-w-md"
            />
          </div>

          {clientesFiltrados.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-lg font-semibold">
                No encontramos clientes
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Creá uno nuevo o guardá un presupuesto con el nombre del cliente.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {clientesFiltrados.map(
                (cliente) => (
                  <TarjetaCliente
                    key={cliente.id}
                    cliente={cliente}
                    onEditar={() =>
                      abrirEdicion(cliente)
                    }
                    onEliminar={() =>
                      manejarEliminarCliente(
                        cliente
                      )
                    }
                    onHistorial={() =>
                      abrirHistorial(cliente)
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </section>

      {formularioVisible && (
        <Modal>
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
                  {clienteEditandoId
                    ? "Editar cliente"
                    : "Nuevo cliente"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Datos de contacto
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-lg border border-white/10 px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <CampoTexto
                titulo="Nombre"
                valor={formulario.nombre}
                placeholder="Ej: Concesionaria ABC"
                onChange={(valor) =>
                  actualizarFormulario({
                    nombre: valor,
                  })
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <CampoTexto
                  titulo="Teléfono"
                  valor={
                    formulario.telefono
                  }
                  placeholder="Ej: 11 1234-5678"
                  onChange={(valor) =>
                    actualizarFormulario({
                      telefono: valor,
                    })
                  }
                />

                <CampoTexto
                  titulo="Email"
                  tipo="email"
                  valor={formulario.email}
                  placeholder="cliente@email.com"
                  onChange={(valor) =>
                    actualizarFormulario({
                      email: valor,
                    })
                  }
                />
              </div>

              <label>
                <span className="text-sm font-semibold text-zinc-300">
                  Notas
                </span>

                <textarea
                  value={formulario.notas}
                  onChange={(evento) =>
                    actualizarFormulario({
                      notas:
                        evento.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Preferencias, forma de pago, detalles importantes..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#810404]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  manejarGuardarCliente
                }
                className="rounded-xl bg-[#810404] px-6 py-3 text-sm font-semibold transition hover:bg-[#a00808]"
              >
                Guardar cliente
              </button>
            </div>
          </div>
        </Modal>
      )}

      {clienteSeleccionado && (
        <Modal>
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
                  Historial del cliente
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {clienteSeleccionado.nombre}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarHistorial}
                className="rounded-lg border border-white/10 px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <DatoHistorial
                titulo="Presupuestos"
                valor={String(
                  clienteSeleccionado
                    .cantidadPresupuestos
                )}
              />

              <DatoHistorial
                titulo="Mayorista"
                valor={formateadorDinero.format(
                  clienteSeleccionado
                    .totalMayoristaPresupuestado
                )}
              />

              <DatoHistorial
                titulo="Minorista"
                valor={formateadorDinero.format(
                  clienteSeleccionado
                    .totalMinoristaPresupuestado
                )}
              />
            </div>

            <div className="mt-6 space-y-3">
              {historialSeleccionado.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                  Este cliente todavía no tiene presupuestos.
                </div>
              ) : (
                historialSeleccionado.map(
                  (presupuesto) => (
                    <article
                      key={presupuesto.id}
                      className="rounded-2xl border border-white/10 bg-[#111111] p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
                            {presupuesto.id}
                          </p>

                          <h3 className="mt-2 text-lg font-bold">
                            {
                              presupuesto.productoNombre
                            }
                          </h3>

                          <p className="mt-1 text-sm text-zinc-500">
                            {presupuesto.cantidad} unidades ·{" "}
                            {formateadorFecha.format(
                              new Date(
                                presupuesto.creadoEn
                              )
                            )}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-sm text-zinc-500">
                            Total mayorista
                          </p>

                          <p className="mt-1 text-lg font-bold">
                            {formateadorDinero.format(
                              presupuesto
                                .precioMayoristaTotal
                            )}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

type TarjetaResumenProps = {
  titulo: string;
  valor: string;
  detalle: string;
};

function TarjetaResumen({
  titulo,
  valor,
  detalle,
}: TarjetaResumenProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#181818] p-5">
      <p className="text-sm text-zinc-500">
        {titulo}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {valor}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {detalle}
      </p>
    </article>
  );
}

type TarjetaClienteProps = {
  cliente: ResumenCliente;
  onEditar: () => void;
  onEliminar: () => void;
  onHistorial: () => void;
};

function TarjetaCliente({
  cliente,
  onEditar,
  onEliminar,
  onHistorial,
}: TarjetaClienteProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
            {cliente.id}
          </p>

          <h3 className="mt-2 truncate text-xl font-bold">
            {cliente.nombre}
          </h3>

          <div className="mt-3 space-y-1 text-sm text-zinc-500">
            <p>
              {cliente.telefono ||
                "Sin teléfono"}
            </p>

            <p className="truncate">
              {cliente.email || "Sin email"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEditar}
            title="Editar cliente"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
          >
            ✏️
          </button>

          <button
            type="button"
            onClick={onEliminar}
            title="Eliminar cliente"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:border-red-900 hover:bg-red-950/30"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.03] p-3">
          <p className="text-xs text-zinc-600">
            Presupuestos
          </p>

          <p className="mt-1 font-bold">
            {cliente.cantidadPresupuestos}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3">
          <p className="text-xs text-zinc-600">
            Mayorista
          </p>

          <p className="mt-1 truncate font-bold">
            {formateadorDinero.format(
              cliente
                .totalMayoristaPresupuestado
            )}
          </p>
        </div>
      </div>

      {cliente.productos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-zinc-600">
            Productos
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {cliente.productos
              .slice(0, 3)
              .map((producto) => (
                <span
                  key={producto}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400"
                >
                  {producto}
                </span>
              ))}

            {cliente.productos.length > 3 && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                +
                {cliente.productos.length -
                  3}
              </span>
            )}
          </div>
        </div>
      )}

      {cliente.notas && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
          {cliente.notas}
        </p>
      )}

      <button
        type="button"
        onClick={onHistorial}
        className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:border-[#810404] hover:bg-[#810404]/10"
      >
        Ver historial
      </button>
    </article>
  );
}

type CampoTextoProps = {
  titulo: string;
  valor: string;
  placeholder: string;
  tipo?: "text" | "email";
  onChange: (valor: string) => void;
};

function CampoTexto({
  titulo,
  valor,
  placeholder,
  tipo = "text",
  onChange,
}: CampoTextoProps) {
  return (
    <label>
      <span className="text-sm font-semibold text-zinc-300">
        {titulo}
      </span>

      <input
        type={tipo}
        value={valor}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#810404]"
      />
    </label>
  );
}

type ModalProps = {
  children: React.ReactNode;
};

function Modal({ children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

type DatoHistorialProps = {
  titulo: string;
  valor: string;
};

function DatoHistorial({
  titulo,
  valor,
}: DatoHistorialProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4">
      <p className="text-xs text-zinc-600">
        {titulo}
      </p>

      <p className="mt-2 font-bold">
        {valor}
      </p>
    </div>
  );
}