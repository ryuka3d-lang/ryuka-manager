import type { DetalleAccesorio } from "../../../lib/cost-engine";

type Props = {
  accesorios: DetalleAccesorio[];
  costoTotal: number;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}

export default function AccessoriesCostCard({
  accesorios,
  costoTotal,
}: Props) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div>
        <h2 className="text-xl font-bold">
          📦 Accesorios del pedido
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Detalle de cantidades y costos incluidos.
        </p>
      </div>

      {accesorios.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--field)] p-5">
          <p className="text-sm text-[var(--muted)]">
            Este producto no tiene accesorios activos.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
          <div className="grid grid-cols-[1fr_110px_140px_140px] gap-4 bg-[var(--field)] px-4 py-3 text-sm font-semibold text-[var(--muted)]">
            <span>Accesorio</span>
            <span className="text-right">Cantidad</span>
            <span className="text-right">Precio unitario</span>
            <span className="text-right">Subtotal</span>
          </div>

          {accesorios.map((accesorio) => (
            <div
              key={accesorio.id}
              className="grid grid-cols-[1fr_110px_140px_140px] items-center gap-4 border-t border-[var(--border)] px-4 py-4"
            >
              <span className="font-medium">
                {accesorio.nombre}
              </span>

              <span className="text-right text-[var(--muted)]">
                {accesorio.cantidad}
              </span>

              <span className="text-right text-[var(--muted)]">
                {formatearDinero(accesorio.precioUnitario)}
              </span>

              <span className="text-right font-semibold">
                {formatearDinero(accesorio.costoTotal)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--field)] px-4 py-4">
            <span className="font-bold">
              Total accesorios
            </span>

            <span className="text-lg font-bold">
              {formatearDinero(costoTotal)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}