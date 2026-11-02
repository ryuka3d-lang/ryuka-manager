import type { ProductoGuardado } from "../../../lib/product-service";

type Props = {
  producto: ProductoGuardado;
};

export default function SelectedRecipeCard({
  producto,
}: Props) {
  const accesoriosActivos = producto.accesorios.filter(
    (accesorio) => accesorio.activo
  );

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-semibold text-[var(--accent-text)]">
            {producto.codigo}
          </p>

          <h2 className="mt-1 text-xl font-bold">
            Receta seleccionada: {producto.nombre}
          </h2>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Los datos provienen de la ficha del producto y no se
            modifican desde este presupuesto.
          </p>
        </div>

        <span className="w-fit rounded-full border border-[#383838] bg-[var(--field)] px-3 py-1 text-sm text-[var(--muted)]">
          {producto.categoria || "Sin categoría"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DatoReceta
          titulo="Cantidad por cama"
          valor={`${producto.cantidadPorCama || "0"} unidades`}
        />

        <DatoReceta
          titulo="Peso por cama"
          valor={`${producto.pesoPorCama || "0"} g`}
        />

        <DatoReceta
          titulo="Tiempo por cama"
          valor={`${producto.horas || "0"} h ${
            producto.minutos || "0"
          } min`}
        />

        <DatoReceta
          titulo="Cantidad de colores"
          valor={producto.colores || "0"}
        />
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="text-sm font-semibold text-[var(--muted)]">
          Accesorios definidos en el producto
        </p>

        {accesoriosActivos.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Esta receta no tiene accesorios activos.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {accesoriosActivos.map((accesorio) => (
              <span
                key={accesorio.id}
                className="rounded-full border border-[#383838] bg-[var(--field)] px-3 py-1 text-sm text-[var(--muted)]"
              >
                ✓ {accesorio.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type DatoRecetaProps = {
  titulo: string;
  valor: string;
};

function DatoReceta({
  titulo,
  valor,
}: DatoRecetaProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--field)] p-4">
      <p className="text-sm text-[var(--muted)]">
        {titulo}
      </p>

      <p className="mt-2 text-lg font-bold">
        {valor}
      </p>
    </div>
  );
}