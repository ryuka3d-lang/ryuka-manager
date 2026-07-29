type Props = {
  cliente: string;
  producto: string;
  cantidad: number;

  tiempoTotalMinutos: number;
  diasProduccion: number;
  horasImpresionDia: number;

  kilosFilamento: number;
  trabajoManualMinutos: number;

  costoTotal: number;

  precioMayoristaUnitario: number;
  precioMayoristaTotal: number;

  precioMinoristaUnitario: number;
  precioMinoristaTotal: number;
};

export default function BudgetPreviewCard({
  cliente,
  producto,
  cantidad,

  tiempoTotalMinutos,
  diasProduccion,
  horasImpresionDia,

  kilosFilamento,
  trabajoManualMinutos,

  costoTotal,

  precioMayoristaUnitario,
  precioMayoristaTotal,

  precioMinoristaUnitario,
  precioMinoristaTotal,
}: Props) {
  const horasImpresion = Math.floor(
    tiempoTotalMinutos / 60
  );

  const minutosImpresion =
    tiempoTotalMinutos % 60;

  const horasTrabajo = Math.floor(
    trabajoManualMinutos / 60
  );

  const minutosTrabajo =
    trabajoManualMinutos % 60;

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div>
        <p className="text-sm font-semibold text-red-300">
          VISTA PREVIA
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          Resumen del presupuesto
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Este resumen será la base para el PDF y el mensaje de
          WhatsApp.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#303030] bg-[#151515] p-6">
          <h3 className="text-lg font-bold">
            Pedido
          </h3>

          <div className="mt-5 space-y-3">
            <FilaResumen
              titulo="Cliente"
              valor={cliente || "Sin completar"}
            />

            <FilaResumen
              titulo="Producto"
              valor={producto || "Sin seleccionar"}
            />

            <FilaResumen
              titulo="Cantidad"
              valor={
                cantidad > 0
                  ? `${cantidad} unidades`
                  : "Sin completar"
              }
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#303030] bg-[#151515] p-6">
          <h3 className="text-lg font-bold">
            Producción
          </h3>

          <div className="mt-5 space-y-3">
            <FilaResumen
              titulo="Tiempo de impresión"
              valor={`${horasImpresion} h ${minutosImpresion} min`}
            />

            <FilaResumen
              titulo="Producción diaria"
              valor={`${horasImpresionDia} h/día`}
            />

            <FilaResumen
              titulo="Plazo estimado"
              valor={`${diasProduccion.toFixed(1)} días`}
            />

            <FilaResumen
              titulo="Filamento"
              valor={`${kilosFilamento.toFixed(2)} kg`}
            />

            <FilaResumen
              titulo="Trabajo manual"
              valor={`${horasTrabajo} h ${minutosTrabajo} min`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[#303030] bg-[#151515] p-6">
        <h3 className="text-lg font-bold">
          Valores calculados
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <ResumenPrecio
            titulo="Costo real"
            valor={formatearDinero(costoTotal)}
          />

          <ResumenPrecio
            titulo="Mayorista"
            valor={formatearDinero(
              precioMayoristaTotal
            )}
            detalle={`${formatearDinero(
              precioMayoristaUnitario
            )} por unidad`}
          />

          <ResumenPrecio
            titulo="Minorista"
            valor={formatearDinero(
              precioMinoristaTotal
            )}
            detalle={`${formatearDinero(
              precioMinoristaUnitario
            )} por unidad`}
          />
        </div>
      </div>
    </section>
  );
}

type FilaResumenProps = {
  titulo: string;
  valor: string;
};

function FilaResumen({
  titulo,
  valor,
}: FilaResumenProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#303030] pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-400">
        {titulo}
      </span>

      <span className="text-right font-semibold">
        {valor}
      </span>
    </div>
  );
}

type ResumenPrecioProps = {
  titulo: string;
  valor: string;
  detalle?: string;
};

function ResumenPrecio({
  titulo,
  valor,
  detalle,
}: ResumenPrecioProps) {
  return (
    <div className="rounded-xl border border-[#353535] bg-[#1b1b1b] p-5">
      <p className="text-sm text-gray-400">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {valor}
      </p>

      {detalle && (
        <p className="mt-2 text-sm text-gray-500">
          {detalle}
        </p>
      )}
    </div>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}