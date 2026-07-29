"use client";

import { useState } from "react";

type Props = {
  cliente: string;
  producto: string;
  cantidad: number;

  diasProduccion: number;
  horasImpresionDia: number;

  precioMayoristaUnitario: number;
  precioMayoristaTotal: number;

  precioMinoristaUnitario: number;
  precioMinoristaTotal: number;
};

export default function CopyBudgetButtons({
  cliente,
  producto,
  cantidad,

  diasProduccion,
  horasImpresionDia,

  precioMayoristaUnitario,
  precioMayoristaTotal,

  precioMinoristaUnitario,
  precioMinoristaTotal,
}: Props) {
  const [mensajeCopiado, setMensajeCopiado] =
    useState("");

  async function copiarPresupuesto(
    tipo: "mayorista" | "minorista"
  ) {
    if (!cliente.trim()) {
      alert("Ingresá el nombre del cliente.");
      return;
    }

    if (!producto.trim()) {
      alert("Seleccioná un producto.");
      return;
    }

    if (cantidad <= 0) {
      alert("Ingresá la cantidad solicitada.");
      return;
    }

    const esMayorista =
      tipo === "mayorista";

    const precioUnitario = esMayorista
      ? precioMayoristaUnitario
      : precioMinoristaUnitario;

    const precioTotal = esMayorista
      ? precioMayoristaTotal
      : precioMinoristaTotal;

    if (
      precioUnitario <= 0 ||
      precioTotal <= 0
    ) {
      alert(
        "Definí el precio final antes de copiar el presupuesto."
      );

      return;
    }

    const plazoEstimado =
      diasProduccion > 0
        ? `${Math.ceil(
            diasProduccion
          )} días aproximadamente`
        : "A coordinar";

    const mensaje = `Hola ${cliente}! ¿Cómo estás?

Te paso el presupuesto solicitado:

Producto: ${producto}
Cantidad: ${cantidad} unidades
Precio por unidad: ${formatearDinero(
      precioUnitario
    )}
Total del pedido: ${formatearDinero(
      precioTotal
    )}

Plazo estimado de producción: ${plazoEstimado}
Producción calculada trabajando hasta ${horasImpresionDia} horas por día.

El presupuesto puede estar sujeto a modificaciones según cambios en el diseño, cantidades o terminaciones solicitadas.

¡Muchas gracias!`;

    try {
      await navigator.clipboard.writeText(
        mensaje
      );

      setMensajeCopiado(tipo);

      window.setTimeout(() => {
        setMensajeCopiado("");
      }, 2500);
    } catch {
      alert(
        "No se pudo copiar el mensaje. Revisá los permisos del navegador."
      );
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div>
        <h2 className="text-xl font-bold">
          Compartir presupuesto
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Copiá el presupuesto con el precio final que definiste
          y pegalo directamente en WhatsApp.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() =>
            copiarPresupuesto("mayorista")
          }
          className="
            rounded-xl
            bg-red-700
            px-6
            py-3
            font-semibold
            transition
            hover:bg-red-600
          "
        >
          {mensajeCopiado === "mayorista"
            ? "✓ Mayorista copiado"
            : "Copiar mayorista"}
        </button>

        <button
          type="button"
          onClick={() =>
            copiarPresupuesto("minorista")
          }
          className="
            rounded-xl
            border
            border-[#3a3a3a]
            bg-[#151515]
            px-6
            py-3
            font-semibold
            transition
            hover:border-red-700
          "
        >
          {mensajeCopiado === "minorista"
            ? "✓ Minorista copiado"
            : "Copiar minorista"}
        </button>
      </div>
    </section>
  );
}

function formatearDinero(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}