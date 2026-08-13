"use client";

import { useEffect, useMemo, useState } from "react";
import FilamentCard from "@/app/components/stock/FilamentCard";
import FilamentModal from "@/app/components/stock/FilamentModal";
import FilamentHistoryModal from "@/app/components/stock/FilamentHistoryModal";
import {
  eliminarBobina,
  obtenerBobinas,
  registrarMovimientoFilamento,
  type BobinaFilamento,
} from "@/lib/stock-service";

export default function StockPage() {
  const [bobinas, setBobinas] = useState<BobinaFilamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [bobinaSeleccionada, setBobinaSeleccionada] =
    useState<BobinaFilamento | null>(null);
  const [bobinaHistorial, setBobinaHistorial] =
    useState<BobinaFilamento | null>(null);

  useEffect(() => {
    void recargar();
  }, []);

  const bobinasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return bobinas;

    return bobinas.filter((bobina) =>
      `${bobina.material} ${bobina.color} ${bobina.marca} ${bobina.id}`
        .toLowerCase()
        .includes(texto)
    );
  }, [bobinas, busqueda]);

  const gramosDisponibles = bobinas.reduce(
    (total, bobina) => total + bobina.pesoActualGramos,
    0
  );

  const bobinasBajas = bobinas.filter(
    (bobina) => bobina.pesoActualGramos <= bobina.stockMinimoGramos
  ).length;

  async function recargar() {
    try {
      setBobinas(await obtenerBobinas());
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "No se pudo cargar Stock.");
    } finally {
      setCargando(false);
    }
  }

  async function ajustar(
    bobina: BobinaFilamento,
    tipo: "entrada" | "salida"
  ) {
    const valor = window.prompt(
      tipo === "entrada"
        ? `¿Cuántos gramos querés agregar a ${bobina.id}?`
        : `¿Cuántos gramos querés descontar de ${bobina.id}?`
    );

    if (valor === null) return;

    const cantidad = Number(valor);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      alert("Ingresá una cantidad válida.");
      return;
    }

    const clave = `${tipo}-${bobina.uuid}`;
    setProcesando(clave);

    try {
      await registrarMovimientoFilamento(
        bobina.uuid,
        tipo,
        cantidad,
        tipo === "entrada" ? "Entrada manual" : "Salida manual"
      );
      await recargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo registrar el movimiento.");
    } finally {
      setProcesando(null);
    }
  }

  async function eliminar(bobina: BobinaFilamento) {
    if (!confirm(`¿Querés eliminar ${bobina.material} ${bobina.color} (${bobina.id})?`)) {
      return;
    }

    setProcesando(`eliminar-${bobina.uuid}`);
    try {
      await eliminarBobina(bobina.uuid);
      await recargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo eliminar la bobina.");
    } finally {
      setProcesando(null);
    }
  }

  function abrirNueva() {
    setBobinaSeleccionada(null);
    setModalAbierto(true);
  }

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      <section className="min-w-0 p-4 pb-24 sm:p-6 lg:p-10 lg:pb-10">
        <header className="rounded-[1.5rem] border border-white/10 bg-[#181818] p-5 sm:rounded-[2rem] sm:p-7 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300 sm:text-sm">
                Inventario
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:mt-3 sm:text-4xl">
                Bobinas de filamento
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:mt-4 sm:text-base sm:leading-7">
                Controlá el peso disponible y revisá los movimientos de cada bobina.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirNueva}
              className="w-full rounded-xl bg-[#810404] px-5 py-3.5 font-semibold transition hover:bg-[#a00808] active:scale-[0.99] lg:w-auto lg:px-6"
            >
              + Nueva bobina
            </button>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          <Resumen titulo="Bobinas" valor={String(bobinas.length)} detalle="registradas" />
          <Resumen
            titulo="Filamento disponible"
            valor={`${(gramosDisponibles / 1000).toFixed(2)} kg`}
            detalle="entre todas las bobinas"
          />
          <Resumen
            titulo="Stock bajo"
            valor={String(bobinasBajas)}
            detalle="bobinas en mínimo"
            alerta={bobinasBajas > 0}
          />
        </section>

        <section className="mt-4 rounded-[1.5rem] border border-white/10 bg-[#181818] p-4 sm:mt-8 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">Bobinas actuales</h2>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {cargando ? "Cargando..." : `${bobinasFiltradas.length} resultado${bobinasFiltradas.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar material, color, marca o código..."
              className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#810404] md:max-w-md"
            />
          </div>

          {cargando ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#111111]" />
              ))}
            </div>
          ) : bobinasFiltradas.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500 sm:p-10">
              {busqueda.trim()
                ? "No encontramos bobinas que coincidan con la búsqueda."
                : "Todavía no hay bobinas registradas en la nube."}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bobinasFiltradas.map((bobina) => (
                <FilamentCard
                  key={bobina.uuid}
                  bobina={bobina}
                  procesando={procesando}
                  onEntrada={() => void ajustar(bobina, "entrada")}
                  onSalida={() => void ajustar(bobina, "salida")}
                  onEditar={() => {
                    setBobinaSeleccionada(bobina);
                    setModalAbierto(true);
                  }}
                  onEliminar={() => void eliminar(bobina)}
                  onHistorial={() => setBobinaHistorial(bobina)}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {modalAbierto && (
        <FilamentModal
          bobina={bobinaSeleccionada}
          onClose={() => setModalAbierto(false)}
          onSaved={async () => {
            setModalAbierto(false);
            await recargar();
          }}
        />
      )}

      {bobinaHistorial && (
        <FilamentHistoryModal
          bobina={bobinaHistorial}
          onClose={() => setBobinaHistorial(null)}
        />
      )}
    </main>
  );
}

function Resumen({
  titulo,
  valor,
  detalle,
  alerta = false,
}: {
  titulo: string;
  valor: string;
  detalle: string;
  alerta?: boolean;
}) {
  return (
    <article className={`rounded-2xl border bg-[#181818] p-4 sm:p-5 ${alerta ? "border-amber-900/60" : "border-white/10"}`}>
      <p className="text-xs text-zinc-500 sm:text-sm">{titulo}</p>
      <p className={`mt-2 text-2xl font-bold sm:mt-3 sm:text-2xl ${alerta ? "text-amber-300" : "text-white"}`}>
        {valor}
      </p>
      <p className="mt-1 text-xs text-zinc-600">{detalle}</p>
    </article>
  );
}
