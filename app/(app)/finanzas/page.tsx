"use client";

import { useEffect, useMemo, useState } from "react";
import {
  editarMovimientoCaja,
  eliminarMovimientoCaja,
  eliminarTodosMovimientosManualesCaja,
  obtenerCentroFinanciero,
  obtenerMovimientosCaja,
  obtenerResumenCaja,
  registrarMovimientoCaja,
  type MovimientoCaja,
  type TipoMovimientoCaja,
} from "@/lib/finance-service";
import { 
  obtenerConfiguracion, 
  DEFAULT_RYUKA_CONFIG 
} from "@/lib/settings-service";
import FinancialHealthCard from "@/app/components/finance/FinancialHealthCard";

const CORTE_KEY = "ryuka-fecha-inicio-caja";

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
  "Electricidad",
  "Reinversión",
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

function etiquetaMes(clave: string) {
  if (!clave) return "Sin mes";

  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${clave}-01T12:00:00`));
}

export default function FinanzasPage() {
  // 1. Bandera para asegurar que servidor y cliente rendericen igual al inicio
  const [isMounted, setIsMounted] = useState(false);
  
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState<MovimientoCaja | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | TipoMovimientoCaja>("todos");
  const [mesFiltro, setMesFiltro] = useState(() => hoy().slice(0, 7));
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicioCaja, setFechaInicioCaja] = useState("");
  
  const filtrosActivos = Boolean(busqueda.trim()) || tipoFiltro !== "todos" || mesFiltro !== hoy().slice(0, 7);

  // 2. Cargar datos reales solo después de que el componente se monta en el cliente
  useEffect(() => {
    setIsMounted(true);
    setMovimientos(obtenerMovimientosCaja());
    setFechaInicioCaja(localStorage.getItem(CORTE_KEY) || "");
  }, []);

  const movimientosVisibles = useMemo(
    () =>
      fechaInicioCaja
        ? movimientos.filter((movimiento) => movimiento.fecha >= fechaInicioCaja)
        : movimientos,
    [movimientos, fechaInicioCaja]
  );

  const cantidadManuales = useMemo(
    () => movimientosVisibles.filter((movimiento) => movimiento.origen === "manual").length,
    [movimientosVisibles]
  );

  function limpiarFiltros() {
    setTipoFiltro("todos");
    setMesFiltro(hoy().slice(0, 7));
    setBusqueda("");
  }

  function iniciarCajaDesdeCero() {
    if (
      !confirm(
        "La caja ignorará todos los movimientos anteriores a hoy y arrancará desde cero. Tu historial de pedidos y compras NO se borra. ¿Continuar?"
      )
    ) {
      return;
    }

    const fechaCorte = hoy();
    localStorage.setItem(CORTE_KEY, fechaCorte);
    setFechaInicioCaja(fechaCorte);
    setMesFiltro(fechaCorte.slice(0, 7));
  }

  function quitarCorte() {
    localStorage.removeItem(CORTE_KEY);
    setFechaInicioCaja("");
  }

  // 3. Usar DEFAULT_RYUKA_CONFIG en el primer render para que coincida con el servidor
  const config = useMemo(() => {
    return isMounted ? obtenerConfiguracion() : DEFAULT_RYUKA_CONFIG;
  }, [isMounted]);

  const resumen = useMemo(() => obtenerResumenCaja(movimientosVisibles), [movimientosVisibles]);

  const centroFinanciero = useMemo(
    () =>
      obtenerCentroFinanciero(movimientosVisibles, {
        sueldoMensual: config.sueldoMensual,
        monotributo: config.monotributo,
        reinversionPorcentaje: config.reinversionPorcentaje,
        electricidadAReponer: config.electricidadAReponer,
      }),
    [movimientosVisibles, config]
  );

  const resumenMes = useMemo(() => {
    const delMes = movimientosVisibles.filter((movimiento) =>
      movimiento.fecha.startsWith(mesFiltro)
    );

    return obtenerResumenCaja(delMes);
  }, [movimientosVisibles, mesFiltro]);

  const ultimosDoceMeses = useMemo(() => {
    const ahora = new Date();

    const meses = Array.from({ length: 12 }, (_, indice) => {
      const fecha = new Date(
        ahora.getFullYear(),
        ahora.getMonth() - indice,
        1
      );

      return {
        clave: `${fecha.getFullYear()}-${String(
          fecha.getMonth() + 1
        ).padStart(2, "0")}`,
        ingresos: 0,
        egresos: 0,
      };
    });

    for (const movimiento of movimientosVisibles) {
      const clave = movimiento.fecha.slice(0, 7);
      const mes = meses.find((elemento) => elemento.clave === clave);

      if (!mes) continue;

      if (movimiento.tipo === "ingreso") {
        mes.ingresos += movimiento.monto;
      } else {
        mes.egresos += movimiento.monto;
      }
    }

    return meses;
  }, [movimientosVisibles]);

  const maximoMensual = Math.max(
    1,
    ...ultimosDoceMeses.flatMap((mes) => [mes.ingresos, mes.egresos])
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return movimientosVisibles.filter((movimiento) => {
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
  }, [movimientosVisibles, tipoFiltro, mesFiltro, busqueda]);

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
    <main className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">

      <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7 lg:rounded-[2rem] lg:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
                Control del dinero
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Caja y finanzas</h1>
              <p className="mt-4 max-w-2xl text-[var(--muted)]">
                Registrá cobros, señas, gastos y retiros. Las compras aparecen automáticamente como egresos.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button
                type="button"
                onClick={() => abrirNuevo("egreso")}
                className="min-h-12 rounded-xl border border-[var(--border)] px-3 py-3 text-sm font-semibold hover:bg-[var(--overlay)] sm:px-5"
              >
                − Egreso
              </button>
              <button
                type="button"
                onClick={() => abrirNuevo("ingreso")}
                className="min-h-12 rounded-xl bg-[var(--accent)] px-3 py-3 text-sm font-semibold hover:bg-[var(--accent-hover)] sm:px-5"
              >
                + Ingreso
              </button>
            </div>
          </div>
        </header>

        {/* Solo renderizamos esto cuando isMounted es true para evitar mismatch */}
        {isMounted && (
          <FinancialHealthCard
            centro={centroFinanciero}
            reinversionPorcentaje={config.reinversionPorcentaje}
          />
        )}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Resumen titulo="Saldo total" valor={moneda(resumen.saldo)} destacado />
          <Resumen titulo={`Ingresos de ${etiquetaMes(mesFiltro)}`} valor={moneda(resumenMes.ingresos)} />
          <Resumen titulo={`Egresos de ${etiquetaMes(mesFiltro)}`} valor={moneda(resumenMes.egresos)} />
          <Resumen
            titulo="Resultado del mes"
            valor={moneda(resumenMes.ingresos - resumenMes.egresos)}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 lg:rounded-[2rem]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">Resumen mensual</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Ingresos vs egresos de los últimos 12 meses. Tocá un mes para filtrar la lista de movimientos.
              </p>
            </div>

            {isMounted && (
              fechaInicioCaja ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-800 bg-emerald-950/20 px-4 py-3">
                  <span className="text-xs font-semibold text-emerald-300">
                    🌱 Caja iniciada el {fecha(fechaInicioCaja)}
                  </span>

                  <button
                    type="button"
                    onClick={quitarCorte}
                    className="text-xs font-semibold text-emerald-200 underline decoration-emerald-700 underline-offset-4 hover:text-white"
                  >
                    Ver historia completa
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={iniciarCajaDesdeCero}
                  className="min-h-11 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--overlay)]"
                >
                  🌱 Iniciar caja desde cero
                </button>
              )
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {ultimosDoceMeses.map((mes) => {
              const resultado = mes.ingresos - mes.egresos;
              const activo = mes.clave === mesFiltro;

              return (
                <button
                  key={mes.clave}
                  type="button"
                  onClick={() => setMesFiltro(mes.clave)}
                  className={`w-full rounded-2xl border p-3 text-left transition sm:p-4 ${
                    activo
                      ? "border-[var(--accent)] bg-[var(--overlay)]"
                      : "border-[var(--border)] bg-[var(--field)] hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold capitalize">
                      {etiquetaMes(mes.clave)}
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        resultado >= 0 ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {resultado >= 0 ? "+" : "−"} {moneda(Math.abs(resultado))}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                        <span>Ingresos</span>
                        <span className="font-semibold text-emerald-300">
                          {moneda(mes.ingresos)}
                        </span>
                      </div>

                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--overlay)]">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${(mes.ingresos / maximoMensual) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                        <span>Egresos</span>
                        <span className="font-semibold text-red-300">
                          {moneda(mes.egresos)}
                        </span>
                      </div>

                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--overlay)]">
                        <div
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${(mes.egresos / maximoMensual) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {resumen.saldo < 0 && (
          <div className="mt-5 rounded-2xl border border-amber-800/60 bg-amber-950/20 px-5 py-4 text-sm text-amber-200">
            ⚠️ La caja está en negativo. Revisá los cobros pendientes o los egresos cargados.
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 lg:rounded-[2rem]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold">Movimientos</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                En el período filtrado: {moneda(resumenFiltrado.ingresos)} ingresados y {moneda(resumenFiltrado.egresos)} gastados.
              </p>
            </div>

            <div className="w-full xl:max-w-3xl">
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  type="month"
                  value={mesFiltro}
                  onChange={(evento) => setMesFiltro(evento.target.value)}
                  className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
                  aria-label="Filtrar por mes"
                />
                <select
                  value={tipoFiltro}
                  onChange={(evento) => setTipoFiltro(evento.target.value as "todos" | TipoMovimientoCaja)}
                  className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
                  aria-label="Filtrar por tipo"
                >
                  <option value="todos">Todos</option>
                  <option value="ingreso">Ingresos</option>
                  <option value="egreso">Egresos</option>
                </select>
                <input
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder="Buscar concepto, categoría..."
                  className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm"
                  aria-label="Buscar movimientos"
                />
              </div>

              {filtrosActivos && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="mt-2 text-xs font-semibold text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--text)]"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>

          {cantidadManuales > 0 && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-900/40 bg-amber-950/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  {cantidadManuales} movimiento{cantidadManuales === 1 ? "" : "s"} manual{cantidadManuales === 1 ? "" : "es"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Podés limpiar los movimientos de prueba sin afectar compras ni cobros automáticos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!confirm("¿Eliminar TODOS los movimientos manuales de Caja? Esta acción no afecta compras ni cobros automáticos.")) return;
                  eliminarTodosMovimientosManualesCaja();
                  setMovimientos(obtenerMovimientosCaja());
                }}
                className="w-full rounded-xl border border-amber-800/50 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-950/30 sm:w-auto"
              >
                Limpiar movimientos manuales
              </button>
            </div>
          )}

          {filtrados.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted)]">
              No hay movimientos para estos filtros.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filtrados.map((movimiento) => (
                <article
                  key={movimiento.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--field)] p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
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
                      <span className="rounded-full bg-[var(--overlay)] px-2.5 py-1 text-xs text-[var(--muted)]">
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
                      {movimiento.origen === "manual" && (
                        <span className="rounded-full bg-amber-950/60 px-2.5 py-1 text-xs text-amber-300">
                          Manual
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 truncate font-bold">{movimiento.concepto}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {fecha(movimiento.fecha)} · {movimiento.medioPago}
                      {movimiento.referencia ? ` · ${movimiento.referencia}` : ""}
                    </p>
                    {movimiento.notas && (
                      <p className="mt-2 text-xs text-[var(--muted)]">{movimiento.notas}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:justify-end">
                    <strong
                      className={`text-lg ${
                        movimiento.tipo === "ingreso" ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {movimiento.tipo === "ingreso" ? "+" : "−"} {moneda(movimiento.monto)}
                    </strong>

                    {movimiento.editable && (
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          type="button"
                          onClick={() => {
                            setMovimientoEditando(movimiento);
                            setModalAbierto(true);
                          }}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--overlay)]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("¿Eliminar este movimiento de caja?")) {
                              eliminarMovimientoCaja(movimiento.id);
                              setMovimientos(obtenerMovimientosCaja());
                            }
                          }}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)]"
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
            setMovimientos(obtenerMovimientosCaja());
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
      <div className="my-4 w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:my-6 sm:rounded-[2rem] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-text)]">
              {esEdicion ? "Editar movimiento" : "Nuevo movimiento"}
            </p>
            <h2 className="mt-2 text-2xl font-bold">Caja</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-2">
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[var(--bg)] p-1">
          <button
            type="button"
            onClick={() => cambiarTipo("ingreso")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipo === "ingreso" ? "bg-emerald-800" : "text-[var(--muted)]"
            }`}
          >
            + Ingreso
          </button>
          <button
            type="button"
            onClick={() => cambiarTipo("egreso")}
            className={`rounded-lg px-4 py-3 font-semibold ${
              tipo === "egreso" ? "bg-[var(--accent)]" : "text-[var(--muted)]"
            }`}
          >
            − Egreso
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Campo titulo="Fecha" tipo="date" valor={fechaMovimiento} onChange={setFechaMovimiento} />
          <Campo titulo="Monto *" tipo="number" valor={monto} onChange={setMonto} />

          <label className="sm:col-span-2">
            <span className="text-sm font-semibold text-[var(--muted)]">Concepto *</span>
            <input
              value={concepto}
              onChange={(evento) => setConcepto(evento.target.value)}
              placeholder={tipo === "ingreso" ? "Ej.: Seña pedido de llaveros" : "Ej.: Pago de electricidad"}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            />
          </label>

          <label>
            <span className="text-sm font-semibold text-[var(--muted)]">Categoría</span>
            <select
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            >
              {categorias.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-semibold text-[var(--muted)]">Medio de pago</span>
            <select
              value={medioPago}
              onChange={(evento) => setMedioPago(evento.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
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
            <span className="text-sm font-semibold text-[var(--muted)]">Notas</span>
            <textarea
              value={notas}
              onChange={(evento) => setNotas(evento.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--border)] px-5 py-3">
            Cancelar
          </button>
          <button type="button" onClick={guardar} className="rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold">
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
      <span className="text-sm font-semibold text-[var(--muted)]">{titulo}</span>
      <input
        type={tipo}
        value={valor}
        min={tipo === "number" ? "0" : undefined}
        step={tipo === "number" ? "0.01" : undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
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
        destacado ? "border-red-900 bg-[var(--card-accent)]" : "border-[var(--border)] bg-[var(--card)]"
      }`}
    >
      <p className="text-sm text-[var(--muted)]">{titulo}</p>
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