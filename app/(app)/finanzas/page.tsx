"use client";

import { useEffect, useMemo, useState } from "react";
import {
  editarMovimientoCaja,
  eliminarMovimientoCaja,
  obtenerMovimientosCaja,
  obtenerResumenCaja,
  registrarMovimientoCaja,
  type MovimientoCaja,
  type TipoMovimientoCaja,
} from "@/lib/finance-service";

const categoriasIngreso = [
  "Venta",
  "Seña",
  "Cobro pendiente",
  "Aporte de socios",
  "Otro ingreso",
];

const categoriasEgreso = [
  "Filamento",
  "Insumos",
  "Envíos",
  "Servicios",
  "Monotributo",
  "Mantenimiento",
  "Herramientas",
  "Retiro de sueldo",
  "Otro egreso",
];

const mediosPago = [
  "Transferencia",
  "Efectivo",
  "Mercado Pago",
  "Tarjeta",
  "Otro",
];

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export default function FinanzasPage() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState<MovimientoCaja | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | TipoMovimientoCaja>("todos");
  const [mesFiltro, setMesFiltro] = useState(() => hoy().slice(0, 7));
  const [busqueda, setBusqueda] = useState("");

  function recargar() {
    setMovimientos(obtenerMovimientosCaja());
  }

  useEffect(() => {
    recargar();
  }, []);

  const resumen = useMemo(() => obtenerResumenCaja(movimientos), [movimientos]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return movimientos.filter((movimiento) => {
      const coincideTipo = tipoFiltro === "todos" || movimiento.tipo === tipoFiltro;
      const coincideMes = !mesFiltro || movimiento.fecha.startsWith(mesFiltro);
      const coincideTexto =
        !texto ||
        movimiento.concepto.toLowerCase().includes(texto) ||
        movimiento.categoria.toLowerCase().includes(texto) ||
        movimiento.referencia.toLowerCase().includes(texto) ||
        movimiento.medioPago.toLowerCase().includes(texto);

      return coincideTipo && coincideMes && coincideTexto;
    });
  }, [movimientos, tipoFiltro, mesFiltro, busqueda]);

  const resumenFiltrado = useMemo(() => obtenerResumenCaja(filtrados), [filtrados]);

  function abrirNuevo(tipo: TipoMovimientoCaja) {
    setMovimientoEditando({
      id: "",
      tipo,
      origen: "manual",
      fecha: hoy(),
      concepto: "",
      categoria: tipo === "ingreso" ? "Venta" : "Servicios",
      monto: 0,
      medioPago: "Transferencia",
      referencia: "",
      notas: "",
      creadoEn: "",
      editable: true,
    });
    setModalAbierto(true);
  }

  return (
    <main className="flex min-h-screen bg-[#101010] text-white">

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 lg:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
                Control del dinero
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Caja y finanzas</h1>
              <p className="mt-4 max-w-2xl text-zinc-300">
                Registrá cobros, señas, gastos y retiros. Las compras aparecen automáticamente como egresos.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => abrirNuevo("egreso")}
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                − Registrar egreso
              </button>
              <button
                type="button"
                onClick={() => abrirNuevo("ingreso")}
                className="rounded-xl bg-[#810404] px-5 py-3 font-semibold hover:bg-[#a00808]"
              >
                + Registrar ingreso
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Resumen titulo="Saldo total" valor={moneda(resumen.saldo)} destacado />
          <Resumen titulo="Ingresos del mes" valor={moneda(resumen.ingresosMes)} />
          <Resumen titulo="Egresos del mes" valor={moneda(resumen.egresosMes)} />
          <Resumen titulo="Resultado del mes" valor={moneda(resumen.resultadoMes)} />
        </section>

        {resumen.saldo < 0 && (
          <div className="mt-5 rounded-2xl border border-amber-800/60 bg-amber-950/20 px-5 py-4 text-sm text-amber-200">
            ⚠️ La caja está en negativo. Revisá los cobros pendientes o los egresos cargados.
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">Movimientos</h2>
              <p className="mt-1 text-sm text-zinc-400">
                En el período filtrado: {moneda(resumenFiltrado.ingresos)} ingresados y {moneda(resumenFiltrado.egresos)} gastados.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="month"
                value={mesFiltro}
                onChange={(evento) => setMesFiltro(evento.target.value)}
                className="rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm"
              />
              <select
                value={tipoFiltro}
                onChange={(evento) => setTipoFiltro(evento.target.value as "todos" | TipoMovimientoCaja)}
                className="rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>
              <input
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar..."
                className="rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm"
              />
            </div>
          </div>

          {filtrados.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
              No hay movimientos para estos filtros.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filtrados.map((movimiento) => (
                <article
                  key={movimiento.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#121212] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          movimiento.tipo === "ingreso"
                            ? "bg-emerald-950 text-emerald-300"
                            : "bg-red-950 text-red-300"
                        }`}
                      >
                        {movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                        {movimiento.categoria}
                      </span>
                      {movimiento.origen === "compra" && (
                        <span className="rounded-full bg-blue-950 px-2.5 py-1 text-xs text-blue-300">
                          Automático desde Compras
                        </span>
                      )}
                      {movimiento.origen === "cobro" && (
                        <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-xs text-emerald-300">
                          Automático desde Pedidos
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 truncate font-bold">{movimiento.concepto}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {fecha(movimiento.fecha)} · {movimiento.medioPago}
                      {movimiento.referencia ? ` · ${movimiento.referencia}` : ""}
                    </p>
                    {movimiento.notas && (
                      <p className="mt-2 text-xs text-zinc-500">{movimiento.notas}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
                    <strong
                      className={`text-lg ${
                        movimiento.tipo === "ingreso" ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {movimiento.tipo === "ingreso" ? "+" : "−"} {moneda(movimiento.monto)}
                    </strong>

                    {movimiento.editable && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMovimientoEditando(movimiento);
                            setModalAbierto(true);
                          }}
                          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("¿Eliminar este movimiento de caja?")) {
                              eliminarMovimientoCaja(movimiento.id);
                              recargar();
                            }
                          }}
                          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:text-white"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {modalAbierto && movimientoEditando && (
        <MovimientoModal
          movimiento={movimientoEditando}
          onClose={() => {
            setModalAbierto(false);
            setMovimientoEditando(null);
          }}
          onSaved={() => {
            setModalAbierto(false);
            setMovimientoEditando(null);
            recargar();
          }}
        />
      )}
    </main>
  );
}

function MovimientoModal({
  movimiento,
  onClose,
  onSaved,
}: {
  movimiento: MovimientoCaja;
  onClose: () => void;
  onSaved: () => void;
}) {
  const esEdicion = Boolean(movimiento.id);
  const [tipo, setTipo] = useState<TipoMovimientoCaja>(movimiento.tipo);
  const [fechaMovimiento, setFechaMovimiento] = useState(movimiento.fecha || hoy());
  const [concepto, setConcepto] = useState(movimiento.concepto);
  const [categoria, setCategoria] = useState(movimiento.categoria);
  const [monto, setMonto] = useState(movimiento.monto ? String(movimiento.monto) : "");
  const [medioPago, setMedioPago] = useState(movimiento.medioPago || "Transferencia");
  const [referencia, setReferencia] = useState(movimiento.referencia);
  const [notas, setNotas] = useState(movimiento.notas);

  const categorias = tipo === "ingreso" ? categoriasIngreso : categoriasEgreso;

  function cambiarTipo(nuevoTipo: TipoMovimientoCaja) {
    setTipo(nuevoTipo);
    setCategoria(nuevoTipo === "ingreso" ? "Venta" : "Servicios");
  }

  function guardar() {
    const datos = {
      tipo,
      fecha: fechaMovimiento,
      concepto,
      categoria,
      monto: Number(monto),
      medioPago,
      referencia,
      notas,
    };

    const resultado = esEdicion
      ? editarMovimientoCaja(movimiento.id, datos)
      : registrarMovimientoCaja(datos);

    if (!resultado) {
      alert("Ingresá un concepto, una fecha y un monto mayor a cero.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#181818] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              {esEdicion ? "Editar movimiento" : "Nuevo movimiento"}
            </p>
            <h2 className="mt-2 text-2xl font-bold">Caja</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2">
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#101010] p-1">
          <button
            type="button"
            onClick={() => cambiarTipo("ingreso")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipo === "ingreso" ? "bg-emerald-800" : "text-zinc-400"
            }`}
          >
            + Ingreso
          </button>
          <button
            type="button"
            onClick={() => cambiarTipo("egreso")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipo === "egreso" ? "bg-[#810404]" : "text-zinc-400"
            }`}
          >
            − Egreso
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Campo titulo="Fecha" tipo="date" valor={fechaMovimiento} onChange={setFechaMovimiento} />
          <Campo titulo="Monto *" tipo="number" valor={monto} onChange={setMonto} />

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-zinc-300">Concepto *</span>
            <input
              value={concepto}
              onChange={(evento) => setConcepto(evento.target.value)}
              placeholder={tipo === "ingreso" ? "Ej.: Seña pedido de llaveros" : "Ej.: Pago de electricidad"}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-zinc-300">Categoría</span>
            <select
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            >
              {categorias.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-zinc-300">Medio de pago</span>
            <select
              value={medioPago}
              onChange={(evento) => setMedioPago(evento.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            >
              {mediosPago.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>
          </label>

          <Campo
            titulo="Referencia (pedido, cliente, comprobante)"
            valor={referencia}
            onChange={setReferencia}
          />

          <label>
            <span className="text-sm font-semibold text-zinc-300">Notas</span>
            <textarea
              value={notas}
              onChange={(evento) => setNotas(evento.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3">
            Cancelar
          </button>
          <button type="button" onClick={guardar} className="rounded-xl bg-[#810404] px-6 py-3 font-semibold">
            Guardar movimiento
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  titulo,
  valor,
  tipo = "text",
  onChange,
}: {
  titulo: string;
  valor: string;
  tipo?: "text" | "number" | "date";
  onChange: (valor: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-zinc-300">{titulo}</span>
      <input
        type={tipo}
        value={valor}
        min={tipo === "number" ? "0" : undefined}
        step={tipo === "number" ? "0.01" : undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
      />
    </label>
  );
}

function Resumen({
  titulo,
  valor,
  destacado = false,
}: {
  titulo: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${
        destacado ? "border-red-900 bg-[#201313]" : "border-white/10 bg-[#181818]"
      }`}
    >
      <p className="text-sm text-zinc-400">{titulo}</p>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
    </article>
  );
}

function moneda(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function fecha(valor: string) {
  if (!valor) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR").format(new Date(`${valor}T12:00:00`));
}
