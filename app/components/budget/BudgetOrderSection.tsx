"use client";

import Input from "../Input";
import TimeInput from "../TimeInput";
import CustomerCombobox from "../customer/CustomerCombobox";
import SelectedRecipeCard from "./SelectedRecipeCard";

import type { ClienteGuardado } from "@/lib/client-service";
import type { ProductoGuardado } from "@/lib/product-service";

export type PresupuestoFormulario = {
  clienteId?: string;
  cliente: string;
  producto: string;
  cantidadSolicitada: string;
  horasTrabajoPersonal: string;
  minutosTrabajoPersonal: string;
  cantidadPorCama: string;
  pesoPorCama: string;
  colores: string;
  horasPorCama: string;
  minutosPorCama: string;
};

type Props = {
  clientes: ClienteGuardado[];
  productos: ProductoGuardado[];
  productoSeleccionadoId: string;
  productoSeleccionado?: ProductoGuardado;
  presupuesto: PresupuestoFormulario;
  onSeleccionarProducto: (id: string) => void;
  onPresupuestoChange: (
    cambios: Partial<PresupuestoFormulario>
  ) => void;
};

export default function BudgetOrderSection({
  clientes,
  productos,
  productoSeleccionadoId,
  productoSeleccionado,
  presupuesto,
  onSeleccionarProducto,
  onPresupuestoChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-[#2b2b2b] bg-[#1b1b1b] p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Producto a agregar
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Datos del presupuesto
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Elegí el cliente una sola vez. Después agregá todos
          los productos que necesite el presupuesto.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <CustomerCombobox
          clientes={clientes}
          clienteId={presupuesto.clienteId}
          value={presupuesto.cliente}
          onChange={(cliente, clienteId) =>
            onPresupuestoChange({
              cliente,
              clienteId,
            })
          }
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-400">
            Producto
          </label>

          <select
            value={productoSeleccionadoId}
            onChange={(evento) =>
              onSeleccionarProducto(
                evento.target.value
              )
            }
            className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-4 py-3 outline-none focus:border-[#810404]"
          >
            <option value="">
              Seleccioná un producto
            </option>

            {productos.map((producto) => (
              <option
                key={producto.id}
                value={producto.id}
              >
                {producto.codigo} · {producto.nombre}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Cantidad solicitada"
          type="number"
          value={presupuesto.cantidadSolicitada}
          onChange={(valor) =>
            onPresupuestoChange({
              cantidadSolicitada: valor,
            })
          }
        />

        <details className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-300">
            Agregar trabajo manual extra
          </summary>

          <div className="mt-4">
            <TimeInput
              label="Tiempo adicional de este producto"
              horas={
                presupuesto.horasTrabajoPersonal
              }
              minutos={
                presupuesto.minutosTrabajoPersonal
              }
              onHorasChange={(valor) =>
                onPresupuestoChange({
                  horasTrabajoPersonal: valor,
                })
              }
              onMinutosChange={(valor) =>
                onPresupuestoChange({
                  minutosTrabajoPersonal: valor,
                })
              }
            />
          </div>
        </details>
      </div>

      {productoSeleccionado && (
        <div className="mt-5">
          <SelectedRecipeCard
            producto={productoSeleccionado}
          />
        </div>
      )}
    </section>
  );
}
