"use client";

import { useEffect, useState } from "react";
import type { PresupuestoGuardado } from "../../../lib/budget-service";
import { convertBudgetToOrder } from "../../../lib/workflows/budget-to-order.workflow";
import type { SaleType } from "../../../lib/domain/order";
import { obtenerWorkspaceId } from "../../../lib/workspace-service";

type Props = {
  presupuestos: PresupuestoGuardado[];
  onEliminar: (id: string) => void;
};

export default function SavedBudgetsCard({
  presupuestos,
  onEliminar,
}: Props) {
  const [workspaceId, setWorkspaceId] = useState("");
  const [presupuestosConvertidos, setPresupuestosConvertidos] = useState<
    string[]
  >([]);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] =
    useState<PresupuestoGuardado | null>(null);

  useEffect(() => {
    async function cargarWorkspace() {
      try {
        const workspace = await obtenerWorkspaceId();
        setWorkspaceId(workspace);
      } catch (error) {
        console.error("No se pudo obtener el workspace:", error);
      }
    }

    void cargarWorkspace();
  }, []);

  useEffect(() => {
    setPresupuestosConvertidos(
      presupuestos
        .filter((presupuesto) => presupuesto.estado === "aceptado")
        .map((presupuesto) => presupuesto.id)
    );
  }, [presupuestos]);

  async function crearPedido(
    presupuesto: PresupuestoGuardado,
    tipoVenta: SaleType,
    totalPersonalizado?: number
  ): Promise<void> {
    if (!workspaceId) {
      alert("No se pudo identificar el espacio de trabajo.");
      return;
    }

    try {
      await convertBudgetToOrder({
        workspaceId,
        budgetCode: presupuesto.id,
        saleType: tipoVenta,
        customTotal:
          tipoVenta === "custom" ? totalPersonalizado : undefined,
      });

      setPresupuestosConvertidos((actuales) =>
        actuales.includes(presupuesto.id)
          ? actuales
          : [...actuales, presupuesto.id]
      );

      setPresupuestoSeleccionado(null);
    } catch (error) {
      console.error("Error al crear el pedido:", error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo convertir el presupuesto."
      );
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div>
        <h2 className="text-xl font-bold">Presupuestos guardados</h2>
        <p className="mt-2 text-sm text-gray-400">
          Convertí un presupuesto en pedido y elegí el precio acordado con el
          cliente.
        </p>
      </div>

      {presupuestos.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[#303030] bg-[#151515] p-6">
          <p className="text-center text-sm text-gray-400">
            Todavía no guardaste ningún presupuesto.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {[...presupuestos].reverse().map((presupuesto) => {
            const yaConvertido = presupuestosConvertidos.includes(
              presupuesto.id
            );

            return (
              <article
                key={presupuesto.id}
                className="rounded-xl border border-[#303030] bg-[#151515] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-red-300">
                      {presupuesto.id}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">
                      {presupuesto.productoNombre}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Cliente: {presupuesto.cliente}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEliminar(presupuesto.id)}
                    className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/30"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  <FilaDato
                    titulo="Cantidad"
                    valor={`${presupuesto.cantidad} unidades`}
                  />
                  <FilaDato
                    titulo="Mayorista"
                    valor={formatearDinero(
                      presupuesto.precioMayoristaTotal
                    )}
                  />
                  <FilaDato
                    titulo="Minorista"
                    valor={formatearDinero(
                      presupuesto.precioMinoristaTotal
                    )}
                  />
                  <FilaDato
                    titulo="Fecha"
                    valor={formatearFecha(presupuesto.creadoEn)}
                  />
                </div>

                <div className="mt-5 border-t border-[#303030] pt-5">
                  <button
                    type="button"
                    disabled={yaConvertido}
                    onClick={() =>
                      setPresupuestoSeleccionado(presupuesto)
                    }
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      yaConvertido
                        ? "cursor-not-allowed border border-emerald-900 bg-emerald-950/20 text-emerald-300"
                        : "bg-[#810404] text-white hover:bg-[#a00808]"
                    }`}
                  >
                    {yaConvertido
                      ? "Pedido creado ✓"
                      : "Convertir en pedido"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {presupuestoSeleccionado && (
        <CrearPedidoModal
          presupuesto={presupuestoSeleccionado}
          onClose={() => setPresupuestoSeleccionado(null)}
          onConfirm={crearPedido}
        />
      )}
    </section>
  );
}

function CrearPedidoModal({
  presupuesto,
  onClose,
  onConfirm,
}: {
  presupuesto: PresupuestoGuardado;
  onClose: () => void;
  onConfirm: (
    presupuesto: PresupuestoGuardado,
    tipo: SaleType,
    totalPersonalizado?: number
  ) => Promise<void>;
}) {
  const [tipo, setTipo] = useState<SaleType>("wholesale");
  const [personalizado, setPersonalizado] = useState("");
  const [guardando, setGuardando] = useState(false);

  const total =
    tipo === "retail"
      ? presupuesto.precioMinoristaTotal
      : tipo === "custom"
        ? Number(personalizado) || 0
        : presupuesto.precioMayoristaTotal;

  async function confirmar() {
    if (guardando || total <= 0) return;

    setGuardando(true);

    try {
      await onConfirm(presupuesto, tipo, total);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#181818] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              Nuevo pedido
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Elegí el precio acordado
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg border border-white/10 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <OpcionPrecio
            activa={tipo === "wholesale"}
            titulo="Precio mayorista"
            valor={formatearDinero(
              presupuesto.precioMayoristaTotal
            )}
            onClick={() => setTipo("wholesale")}
            disabled={guardando}
          />

          <OpcionPrecio
            activa={tipo === "retail"}
            titulo="Precio minorista"
            valor={formatearDinero(
              presupuesto.precioMinoristaTotal
            )}
            onClick={() => setTipo("retail")}
            disabled={guardando}
          />

          <div
            className={`w-full rounded-2xl border p-4 ${
              tipo === "custom"
                ? "border-red-700 bg-red-950/20"
                : "border-white/10 bg-[#121212]"
            }`}
          >
            <button
              type="button"
              onClick={() => setTipo("custom")}
              disabled={guardando}
              className="w-full text-left font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Precio personalizado
            </button>

            <input
              type="number"
              min="0"
              value={personalizado}
              disabled={guardando}
              onChange={(evento) => {
                setPersonalizado(evento.target.value);
                setTipo("custom");
              }}
              placeholder="$"
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/[0.04] p-4">
          <p className="text-sm text-zinc-400">Total del pedido</p>
          <strong className="mt-1 block text-2xl">
            {formatearDinero(total)}
          </strong>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-white/10 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={guardando || total <= 0}
            onClick={() => void confirmar()}
            className="rounded-xl bg-[#810404] px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OpcionPrecio({
  activa,
  titulo,
  valor,
  onClick,
  disabled = false,
}: {
  activa: boolean;
  titulo: string;
  valor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
        activa
          ? "border-red-700 bg-red-950/20"
          : "border-white/10 bg-[#121212]"
      }`}
    >
      <span className="font-semibold">{titulo}</span>
      <strong>{valor}</strong>
    </button>
  );
}

function FilaDato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400">{titulo}</span>
      <strong className="text-right">{valor}</strong>
    </div>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR").format(new Date(fecha));
}