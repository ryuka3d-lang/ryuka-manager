"use client";

import { useState } from "react";
import {
  editarBobina,
  guardarBobina,
  type BobinaFilamento,
  type NuevaBobinaFilamento,
} from "../../../lib/stock-service";

type Props = {
  bobina: BobinaFilamento | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function FilamentModal({ bobina, onClose, onSaved }: Props) {
  const [material, setMaterial] = useState(bobina?.material ?? "PLA");
  const [color, setColor] = useState(bobina?.color ?? "");
  const [marca, setMarca] = useState(bobina?.marca ?? "");
  const [pesoInicial, setPesoInicial] = useState(
    String(bobina?.pesoInicialGramos ?? 1000)
  );
  const [pesoActual, setPesoActual] = useState(
    String(bobina?.pesoActualGramos ?? 1000)
  );
  const [stockMinimo, setStockMinimo] = useState(
    String(bobina?.stockMinimoGramos ?? 150)
  );
  const [precioCompra, setPrecioCompra] = useState(
    String(bobina?.precioCompra ?? 0)
  );
  const [fechaCompra, setFechaCompra] = useState(
    bobina?.fechaCompra ?? new Date().toISOString().slice(0, 10)
  );

  function guardar() {
    if (!color.trim()) {
      alert("Ingresá el color de la bobina.");
      return;
    }

    const datos: NuevaBobinaFilamento = {
      material,
      color,
      marca,
      pesoInicialGramos: Number(pesoInicial) || 0,
      pesoActualGramos: Number(pesoActual) || 0,
      stockMinimoGramos: Number(stockMinimo) || 0,
      precioCompra: Number(precioCompra) || 0,
      fechaCompra,
    };

    if (datos.pesoInicialGramos <= 0 || datos.pesoActualGramos < 0) {
      alert("Revisá los pesos ingresados.");
      return;
    }

    if (datos.pesoActualGramos > datos.pesoInicialGramos) {
      alert("El peso actual no puede superar el peso inicial.");
      return;
    }

    if (bobina) {
      editarBobina(bobina.id, datos);
    } else {
      guardarBobina(datos);
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#181818] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">
              {bobina ? "Editar bobina" : "Nueva bobina"}
            </p>
            <h2 className="mt-2 text-2xl font-bold">Datos del filamento</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-3 py-2"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-zinc-300">Material</span>
            <select
              value={material}
              onChange={(evento) => setMaterial(evento.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
            >
              <option value="PLA">PLA</option>
              <option value="PETG">PETG</option>
              <option value="TPU">TPU</option>
              <option value="ABS">ABS</option>
              <option value="ASA">ASA</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <Campo titulo="Color" valor={color} onChange={setColor} />
          <Campo titulo="Marca" valor={marca} onChange={setMarca} />
          <Campo
            titulo="Precio de compra"
            tipo="number"
            valor={precioCompra}
            onChange={setPrecioCompra}
          />
          <Campo
            titulo="Peso inicial (g)"
            tipo="number"
            valor={pesoInicial}
            onChange={setPesoInicial}
          />
          <Campo
            titulo="Peso actual (g)"
            tipo="number"
            valor={pesoActual}
            onChange={setPesoActual}
          />
          <Campo
            titulo="Avisar debajo de (g)"
            tipo="number"
            valor={stockMinimo}
            onChange={setStockMinimo}
          />
          <Campo
            titulo="Fecha de compra"
            tipo="date"
            valor={fechaCompra}
            onChange={setFechaCompra}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            className="rounded-xl bg-[#810404] px-6 py-3 font-semibold"
          >
            Guardar bobina
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  titulo,
  valor,
  tipo = "text",
  onChange,
}: {
  titulo: string;
  valor: string;
  tipo?: "text" | "number" | "date";
  onChange: (valor: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-semibold text-zinc-300">{titulo}</span>
      <input
        type={tipo}
        value={valor}
        min={tipo === "number" ? "0" : undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"
      />
    </label>
  );
}
