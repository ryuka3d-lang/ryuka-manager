"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, UserPlus, X } from "lucide-react";
import type { ClienteGuardado } from "@/lib/client-service";

type Props = {
  clientes: ClienteGuardado[];
  clienteId?: string;
  value: string;
  onChange: (nombre: string, clienteId?: string) => void;
};

function nombreCompleto(cliente: ClienteGuardado) {
  return `${cliente.nombre} ${cliente.apellido}`.trim() || cliente.empresa;
}

function textoBusqueda(cliente: ClienteGuardado) {
  return [nombreCompleto(cliente), cliente.empresa, cliente.telefono, cliente.email]
    .join(" ")
    .toLocaleLowerCase("es-AR");
}

export default function CustomerCombobox({ clientes, clienteId, value, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState(value);

  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-AR");
    const activos = clientes.filter((cliente) => cliente.estado === "activo");
    if (!termino) return activos.slice(0, 6);
    return activos.filter((cliente) => textoBusqueda(cliente).includes(termino)).slice(0, 8);
  }, [busqueda, clientes]);

  function elegir(cliente: ClienteGuardado) {
    const nombre = nombreCompleto(cliente);
    setBusqueda(nombre);
    onChange(nombre, cliente.id);
    setAbierto(false);
  }

  function limpiar() {
    setBusqueda("");
    onChange("", undefined);
    setAbierto(true);
  }

  return (
    <div className="relative">
      <label className="mb-2 block text-sm text-gray-400">Cliente</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          value={busqueda}
          placeholder="Buscá por nombre, empresa o teléfono"
          onFocus={() => setAbierto(true)}
          onChange={(event) => {
            const siguiente = event.target.value;
            setBusqueda(siguiente);
            onChange(siguiente, undefined);
            setAbierto(true);
          }}
          className="w-full rounded-xl border border-[#2b2b2b] bg-[#151515] py-3 pl-10 pr-20 outline-none transition focus:border-[#810404]"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {busqueda && (
            <button type="button" onClick={limpiar} className="rounded-md p-1 text-gray-500 hover:bg-white/5 hover:text-white" aria-label="Limpiar cliente">
              <X className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={() => setAbierto((actual) => !actual)} className="rounded-md p-1 text-gray-500 hover:bg-white/5 hover:text-white" aria-label="Mostrar clientes">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-[#333] bg-[#181818] p-2 shadow-2xl">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {busqueda ? "Coincidencias" : "Clientes recientes"}
          </p>
          {resultados.map((cliente) => {
            const nombre = nombreCompleto(cliente);
            const seleccionado = cliente.id === clienteId;
            return (
              <button key={cliente.id} type="button" onClick={() => elegir(cliente)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-white/5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{nombre}</p>
                  <p className="truncate text-xs text-gray-500">{cliente.empresa || cliente.telefono || cliente.email || cliente.id}</p>
                </div>
                {seleccionado && <Check className="h-4 w-4 text-red-400" />}
              </button>
            );
          })}
          {resultados.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-400">
              No encontramos ese cliente. Podés escribir el nombre y guardar el presupuesto igualmente.
            </div>
          )}
          <a href="/clientes" className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-[#3a3a3a] px-3 py-3 text-sm text-gray-300 hover:border-[#810404] hover:text-white">
            <UserPlus className="h-4 w-4" /> Administrar clientes
          </a>
        </div>
      )}
    </div>
  );
}
