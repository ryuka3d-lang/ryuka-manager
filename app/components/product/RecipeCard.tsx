"use client";

import Input from "../Input";
import TimeInput from "../TimeInput";

import type {
  Producto,
  SetProducto,
} from "../../types/producto";

type Props = {
  producto: Producto;
  setProducto: SetProducto;
};

export default function RecipeCard({
  producto,
  setProducto,
}: Props) {
  const cantidadPorCama =
    Number(producto.cantidadPorCama) || 0;

  const pesoPorCama =
    Number(producto.pesoPorCama) || 0;

  const horas =
    Number(producto.horas) || 0;

  const minutos =
    Number(producto.minutos) || 0;

  const horasTrabajoManual =
    Number(
      producto.horasTrabajoManualPorCama
    ) || 0;

  const minutosTrabajoManual =
    Number(
      producto.minutosTrabajoManualPorCama
    ) || 0;

  const tiempoTotalMinutos =
    horas * 60 + minutos;

  const trabajoManualMinutos =
    horasTrabajoManual * 60 +
    minutosTrabajoManual;

  const pesoPorPieza =
    cantidadPorCama > 0
      ? pesoPorCama / cantidadPorCama
      : 0;

  const minutosPorPieza =
    cantidadPorCama > 0
      ? tiempoTotalMinutos /
        cantidadPorCama
      : 0;

  const horasFormateadas =
    Math.floor(
      tiempoTotalMinutos / 60
    );

  const minutosFormateados =
    tiempoTotalMinutos % 60;

  const horasManualFormateadas =
    Math.floor(
      trabajoManualMinutos / 60
    );

  const minutosManualFormateados =
    trabajoManualMinutos % 60;

  return (
    <div className="rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <h2 className="mb-6 text-xl font-bold">
        🖨 Receta de impresión
      </h2>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Cantidad por cama"
            type="number"
            value={producto.cantidadPorCama}
            onChange={(valor) =>
              setProducto(
                (productoActual) => ({
                  ...productoActual,
                  cantidadPorCama: valor,
                })
              )
            }
          />

          <Input
            label="Peso por cama (g)"
            type="number"
            value={producto.pesoPorCama}
            onChange={(valor) =>
              setProducto(
                (productoActual) => ({
                  ...productoActual,
                  pesoPorCama: valor,
                })
              )
            }
          />

          <Input
            label="Cantidad de colores"
            type="number"
            value={producto.colores}
            onChange={(valor) =>
              setProducto(
                (productoActual) => ({
                  ...productoActual,
                  colores: valor,
                })
              )
            }
          />

          <TimeInput
            label="Tiempo de impresión por cama"
            horas={producto.horas}
            minutos={producto.minutos}
            onHorasChange={(valor) =>
              setProducto(
                (productoActual) => ({
                  ...productoActual,
                  horas: valor,
                })
              )
            }
            onMinutosChange={(valor) =>
              setProducto(
                (productoActual) => ({
                  ...productoActual,
                  minutos: valor,
                })
              )
            }
          />

          <div className="md:col-span-2">
            <TimeInput
              label="Trabajo manual por cama"
              horas={
                producto.horasTrabajoManualPorCama
              }
              minutos={
                producto.minutosTrabajoManualPorCama
              }
              onHorasChange={(valor) =>
                setProducto(
                  (productoActual) => ({
                    ...productoActual,
                    horasTrabajoManualPorCama:
                      valor,
                  })
                )
              }
              onMinutosChange={(valor) =>
                setProducto(
                  (productoActual) => ({
                    ...productoActual,
                    minutosTrabajoManualPorCama:
                      valor,
                  })
                )
              }
            />

            <p className="mt-2 text-xs text-gray-500">
              Ejemplo: tiempo para retirar piezas,
              colocar argollas o preparar cada
              tanda.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-6">
          <h3 className="mb-5 text-lg font-semibold">
            📊 Resumen de la receta
          </h3>

          <div className="flex flex-col gap-4">
            <ResumenFila
              titulo="Piezas por cama"
              valor={
                cantidadPorCama > 0
                  ? `${cantidadPorCama} unidades`
                  : "Sin completar"
              }
            />

            <ResumenFila
              titulo="Peso por cama"
              valor={
                pesoPorCama > 0
                  ? `${pesoPorCama.toFixed(
                      2
                    )} g`
                  : "Sin completar"
              }
            />

            <ResumenFila
              titulo="Peso estimado por pieza"
              valor={
                pesoPorPieza > 0
                  ? `${pesoPorPieza.toFixed(
                      2
                    )} g`
                  : "Sin calcular"
              }
            />

            <ResumenFila
              titulo="Tiempo de impresión por cama"
              valor={
                tiempoTotalMinutos > 0
                  ? `${horasFormateadas} h ${minutosFormateados} min`
                  : "Sin completar"
              }
            />

            <ResumenFila
              titulo="Tiempo estimado por pieza"
              valor={
                minutosPorPieza > 0
                  ? `${minutosPorPieza.toFixed(
                      2
                    )} min`
                  : "Sin calcular"
              }
            />

            <ResumenFila
              titulo="Trabajo manual por cama"
              valor={
                trabajoManualMinutos > 0
                  ? `${horasManualFormateadas} h ${minutosManualFormateados} min`
                  : "Sin completar"
              }
            />

            <ResumenFila
              titulo="Cantidad de colores"
              valor={
                Number(producto.colores) > 0
                  ? producto.colores
                  : "Sin completar"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type ResumenFilaProps = {
  titulo: string;
  valor: string;
};

function ResumenFila({
  titulo,
  valor,
}: ResumenFilaProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#2b2b2b] pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-400">
        {titulo}
      </span>

      <span className="text-right font-semibold">
        {valor}
      </span>
    </div>
  );
}