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
        ? "¿Cuántos gramos querés agregar?"
        : "¿Cuántos gramos querés descontar?"
    );

    if (valor === null) return;

    const cantidad = Number(valor);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      alert("Ingresá una cantidad válida.");
      return;
    }

    try {
      await registrarMovimientoFilamento(
        bobina.uuid,
        tipo,
        cantidad,
        tipo === "entrada" ? "Entrada manual" : "Salida manual"
      );
      await recargar();
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo registrar.");
    }
  }

  async function eliminar(bobina: BobinaFilamento) {
    if (!confirm(`¿Querés eliminar ${bobina.material} ${bobina.color}?`)) {
      return;
    }

    await eliminarBobina(bobina.uuid);
    await recargar();
  }

  return (
    <main className="flex min-h-screen bg-[#101010] text-white">
      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
                Inventario
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Bobinas de filamento
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
                Stock guardado directamente en Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setBobinaSeleccionada(null);
                setModalAbierto(true);
              }}
              className="rounded-xl bg-[#810404] px-6 py-3 font-semibold hover:bg-[#a00808]"
            >
              + Nueva bobina
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
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
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Bobinas actuales</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {cargando ? "Cargando..." : `${bobinasFiltradas.length} resultados`}
              </p>
            </div>

            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar material, color, marca o código..."
              className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-[#810404] md:max-w-md"
            />
          </div>

          {!cargando && bobinasFiltradas.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
              Todavía no hay bobinas registradas en la nube.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bobinasFiltradas.map((bobina) => (
                <FilamentCard
                  key={bobina.uuid}
                  bobina={bobina}
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
}: {
  titulo: string;
  valor: string;
  detalle: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#181818] p-5">
      <p className="text-sm text-zinc-500">{titulo}</p>
      <p className="mt-3 text-2xl font-bold">{valor}</p>
      <p className="mt-1 text-xs text-zinc-600">{detalle}</p>
    </article>
  );
}
