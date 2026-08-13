import type { BobinaFilamento } from "@/lib/stock-service";

type Props = {
  bobina: BobinaFilamento;
  procesando: string | null;
  onEntrada: () => void;
  onSalida: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onHistorial: () => void;
};

export default function FilamentCard({
  bobina,
  procesando,
  onEntrada,
  onSalida,
  onEditar,
  onEliminar,
  onHistorial,
}: Props) {
  const porcentaje =
    bobina.pesoInicialGramos > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (bobina.pesoActualGramos / bobina.pesoInicialGramos) * 100
          )
        )
      : 0;

  const stockBajo = bobina.pesoActualGramos <= bobina.stockMinimoGramos;
  const claveEntrada = `entrada-${bobina.uuid}`;
  const claveSalida = `salida-${bobina.uuid}`;
  const claveEliminar = `eliminar-${bobina.uuid}`;
  const ocupado =
    procesando === claveEntrada ||
    procesando === claveSalida ||
    procesando === claveEliminar;

  const costoPorGramo =
    bobina.pesoInicialGramos > 0
      ? bobina.precioCompra / bobina.pesoInicialGramos
      : 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-4 transition hover:border-white/15 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
            {bobina.id}
          </p>
          <h3 className="mt-1.5 truncate text-lg font-bold sm:mt-2 sm:text-xl">
            {bobina.material} {bobina.color}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-500">
            {bobina.marca || "Sin marca"}
          </p>
        </div>

        {stockBajo && (
          <span className="shrink-0 rounded-full border border-amber-900/50 bg-amber-950/30 px-2.5 py-1 text-[11px] font-medium text-amber-300 sm:px-3 sm:text-xs">
            Stock bajo
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 sm:mt-6">
        <p className="text-3xl font-bold tracking-tight">
          {bobina.pesoActualGramos.toLocaleString("es-AR", {
            maximumFractionDigits: 1,
          })}
          <span className="ml-1 text-base font-normal text-zinc-500">g</span>
        </p>
        <span className="text-xs text-zinc-600">
          {porcentaje.toFixed(0)}% restante
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all ${stockBajo ? "bg-amber-500" : "bg-[#810404]"}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500">
        <p>Peso inicial</p>
        <p className="text-right">{bobina.pesoInicialGramos} g</p>
        <p>Costo por gramo</p>
        <p className="text-right">
          {costoPorGramo.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      <button
        type="button"
        onClick={onHistorial}
        disabled={ocupado}
        className="mt-5 w-full rounded-xl border border-white/10 px-3 py-3 text-sm font-semibold transition hover:border-[#810404] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ver historial
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEntrada}
          disabled={ocupado}
          className="min-h-11 rounded-xl bg-emerald-950/30 px-3 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-950/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando === claveEntrada ? "Guardando..." : "+ Entrada"}
        </button>
        <button
          type="button"
          onClick={onSalida}
          disabled={ocupado}
          className="min-h-11 rounded-xl bg-red-950/30 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando === claveSalida ? "Guardando..." : "− Salida"}
        </button>
        <button
          type="button"
          onClick={onEditar}
          disabled={ocupado}
          className="min-h-11 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onEliminar}
          disabled={ocupado}
          className="min-h-11 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-zinc-500 transition hover:border-red-900/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {procesando === claveEliminar ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </article>
  );
}
