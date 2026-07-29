import type { BobinaFilamento } from "../../../lib/stock-service";

type Props = {
  bobina: BobinaFilamento;
  onEntrada: () => void;
  onSalida: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onHistorial: () => void;
};

export default function FilamentCard({
  bobina,
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
  const costoPorGramo =
    bobina.pesoInicialGramos > 0
      ? bobina.precioCompra / bobina.pesoInicialGramos
      : 0;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-300">
            {bobina.id}
          </p>
          <h3 className="mt-2 text-xl font-bold">
            {bobina.material} {bobina.color}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {bobina.marca || "Sin marca"}
          </p>
        </div>

        {stockBajo && (
          <span className="rounded-full border border-amber-900/50 bg-amber-950/30 px-3 py-1 text-xs text-amber-300">
            Stock bajo
          </span>
        )}
      </div>

      <p className="mt-6 text-3xl font-bold">
        {bobina.pesoActualGramos.toLocaleString("es-AR", {
          maximumFractionDigits: 1,
        })}{" "}
        <span className="text-base font-normal text-zinc-500">g</span>
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[#810404]"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <div className="mt-4 space-y-1 text-xs text-zinc-500">
        <p>Peso inicial: {bobina.pesoInicialGramos} g</p>
        <p>
          Costo por gramo:{" "}
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
        className="mt-5 w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold transition hover:border-[#810404]"
      >
        Ver historial
      </button>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEntrada}
          className="rounded-xl bg-emerald-950/30 px-3 py-2 text-sm font-semibold text-emerald-300"
        >
          + Entrada
        </button>
        <button
          type="button"
          onClick={onSalida}
          className="rounded-xl bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300"
        >
          − Salida
        </button>
        <button
          type="button"
          onClick={onEditar}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onEliminar}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-500"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
