"use client";

import { useState } from "react";

import Input from "../Input";
import TimeInput from "../TimeInput";
import type { Accesorio } from "../../types/producto";
import type { DatosPresupuestoRapido } from "../../hooks/useBudget";

type Props = {
  datos: DatosPresupuestoRapido;
  accesoriosDisponibles: Accesorio[];
  preciosSugeridos: {
    mayoristaUnitario: number;
    minoristaUnitario: number;
  };
  onDatosChange: (
    cambios: Partial<DatosPresupuestoRapido>
  ) => void;
  onAccesorioChange: (
    id: string,
    cambios: Partial<Accesorio>
  ) => void;
  onAgregarAccesorio: (id: string) => void;
  onAgregar: () => void;
};

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}

export default function QuickQuoteSection({
  datos,
  accesoriosDisponibles,
  preciosSugeridos,
  onDatosChange,
  onAccesorioChange,
  onAgregarAccesorio,
  onAgregar,
}: Props) {
  const [accesorioSeleccionadoId, setAccesorioSeleccionadoId] =
    useState("");

  const accesoriosNoAgregados = accesoriosDisponibles.filter(
    (opcion) =>
      !datos.accesorios.some((accesorio) => accesorio.id === opcion.id)
  );

  const mayoristaMostrar =
    Number(datos.precioMayoristaUnitario || 0) ||
    preciosSugeridos.mayoristaUnitario;

  const minoristaMostrar =
    Number(datos.precioMinoristaUnitario || 0) ||
    preciosSugeridos.minoristaUnitario;

  return (
    <section className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Sin producto previo
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Presupuesto rápido
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Calculá sin cargar un producto. Los precios se calculan automáticamente con los márgenes de configuración.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Nombre del ítem"
          type="text"
          value={datos.nombre}
          onChange={(valor) =>
            onDatosChange({ nombre: valor })
          }
          placeholder="Ej.: Llavero personalizado"
        />

        <Input
          label="Cantidad total solicitada"
          type="number"
          value={datos.cantidad}
          onChange={(valor) =>
            onDatosChange({ cantidad: valor })
          }
        />

        <Input
          label="Cantidad por cama"
          type="number"
          value={datos.cantidadPorCama}
          onChange={(valor) =>
            onDatosChange({ cantidadPorCama: valor })
          }
          placeholder="Ej.: 4"
        />

        <Input
          label="Peso por cama (gramos)"
          type="number"
          value={datos.pesoPorCama}
          onChange={(valor) =>
            onDatosChange({ pesoPorCama: valor })
          }
          placeholder="Ej.: 80"
        />

        <TimeInput
          label="Tiempo de impresión por cama"
          horas={datos.horasPorCama}
          minutos={datos.minutosPorCama}
          onHorasChange={(valor) =>
            onDatosChange({ horasPorCama: valor })
          }
          onMinutosChange={(valor) =>
            onDatosChange({ minutosPorCama: valor })
          }
        />

        <TimeInput
          label="Trabajo manual extra (total)"
          horas={datos.horasManual}
          minutos={datos.minutosManual}
          onHorasChange={(valor) =>
            onDatosChange({ horasManual: valor })
          }
          onMinutosChange={(valor) =>
            onDatosChange({ minutosManual: valor })
          }
        />
      </div>

      <div className="mt-6 rounded-xl border border-[#3a3a3a] bg-[#151515] p-4">
        <p className="text-sm font-semibold text-gray-300">
          Precios calculados automáticamente
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-[#2b2b2b] bg-[#101010] p-3">
            <p className="text-xs text-gray-500">
              Mayorista sugerido
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-300">
              {formatearDinero(preciosSugeridos.mayoristaUnitario)}
            </p>

            <Input
              label="Ajustar manualmente (opcional)"
              type="number"
              value={datos.precioMayoristaUnitario}
              onChange={(valor) =>
                onDatosChange({
                  precioMayoristaUnitario: valor,
                })
              }
              placeholder={`Usar ${formatearDinero(preciosSugeridos.mayoristaUnitario)}`}
            />
          </div>

          <div className="rounded-lg border border-[#2b2b2b] bg-[#101010] p-3">
            <p className="text-xs text-gray-500">
              Minorista sugerido
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-300">
              {formatearDinero(preciosSugeridos.minoristaUnitario)}
            </p>

            <Input
              label="Ajustar manualmente (opcional)"
              type="number"
              value={datos.precioMinoristaUnitario}
              onChange={(valor) =>
                onDatosChange({
                  precioMinoristaUnitario: valor,
                })
              }
              placeholder={`Usar ${formatearDinero(preciosSugeridos.minoristaUnitario)}`}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Si dejás los campos vacíos, se usan los precios sugeridos calculados con los márgenes de configuración.
        </p>
      </div>

      {accesoriosDisponibles.length > 0 && (
        <div className="mt-5">
          <label className="text-sm font-semibold text-gray-300">
            Accesorios (opcional)
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
            <select
              value={accesorioSeleccionadoId}
              onChange={(evento) =>
                setAccesorioSeleccionadoId(evento.target.value)
              }
              className="flex-1 rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
            >
              <option value="">Elegí un accesorio...</option>
              {accesoriosNoAgregados.map((opcion) => (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                if (accesorioSeleccionadoId) {
                  onAgregarAccesorio(accesorioSeleccionadoId);
                  setAccesorioSeleccionadoId("");
                }
              }}
              disabled={!accesorioSeleccionadoId}
              className="rounded-xl bg-[#810404] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a00808] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Agregar
            </button>
          </div>

          {datos.accesorios.length > 0 && (
            <div className="mt-4 space-y-3">
              {datos.accesorios.map((accesorio) => (
                <div
                  key={accesorio.id}
                  className="grid grid-cols-[1fr_180px_120px] items-center gap-4 rounded-xl border border-[#2b2b2b] bg-[#151515] p-4"
                >
                  <span className="font-medium">{accesorio.nombre}</span>

                  <select
                    value={accesorio.modo}
                    onChange={(evento) =>
                      onAccesorioChange(accesorio.id, {
                        modo: evento.target.value as any,
                      })
                    }
                    className="rounded-xl border border-[#2b2b2b] bg-[#101010] px-3 py-2 outline-none focus:border-[#810404]"
                  >
                    <option value="porUnidad">Por unidad</option>
                    <option value="porPedido">Por pedido</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={accesorio.cantidad}
                    onChange={(evento) =>
                      onAccesorioChange(accesorio.id, {
                        cantidad: evento.target.value,
                      })
                    }
                    className="rounded-xl border border-[#2b2b2b] bg-[#101010] px-3 py-2 outline-none focus:border-[#810404]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onAgregar}
        className="mt-6 w-full rounded-xl bg-[#810404] px-6 py-3 font-semibold text-white transition hover:bg-[#a00808]"
      >
        Agregar al presupuesto
      </button>
    </section>
  );
}