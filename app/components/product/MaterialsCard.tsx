"use client";

import type {
  MaterialProducto,
  Producto,
  SetProducto,
} from "../../types/producto";

type Props = {
  producto: Producto;
  setProducto: SetProducto;
};

function crearMaterial(): MaterialProducto {
  return {
    id: crypto.randomUUID(),
    material: "PLA",
    color: "",
    gramosPorCama: "",
  };
}

export default function MaterialsCard({
  producto,
  setProducto,
}: Props) {
  const pesoMateriales =
    producto.materiales.reduce(
      (total, material) =>
        total +
        (Number(material.gramosPorCama) || 0),
      0
    );

  function agregarMaterial() {
    setProducto((actual) => ({
      ...actual,
      materiales: [
        ...actual.materiales,
        crearMaterial(),
      ],
    }));
  }

  function actualizarMaterial(
    id: string,
    cambios: Partial<MaterialProducto>
  ) {
    setProducto((actual) => ({
      ...actual,
      materiales: actual.materiales.map(
        (material) =>
          material.id === id
            ? {
                ...material,
                ...cambios,
              }
            : material
      ),
    }));
  }

  function eliminarMaterial(id: string) {
    setProducto((actual) => ({
      ...actual,
      materiales: actual.materiales.filter(
        (material) => material.id !== id
      ),
    }));
  }

  return (
    <section className="rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">
            🧵 Filamentos del producto
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Indicá el material, color y los gramos utilizados por cama.
            Esto permite elegir las bobinas correctas cuando comienza la impresión.
          </p>
        </div>

        <button
          type="button"
          onClick={agregarMaterial}
          className="rounded-xl bg-[#810404] px-4 py-3 text-sm font-semibold transition hover:bg-[#a00808]"
        >
          + Agregar filamento
        </button>
      </div>

      {producto.materiales.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#353535] p-6 text-center text-sm text-gray-500">
          Todavía no agregaste filamentos a esta receta.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {producto.materiales.map(
            (material) => (
              <article
                key={material.id}
                className="grid gap-3 rounded-xl border border-[#303030] bg-[#151515] p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <label>
                  <span className="text-xs font-semibold text-gray-400">
                    Material
                  </span>

                  <select
                    value={material.material}
                    onChange={(evento) =>
                      actualizarMaterial(
                        material.id,
                        {
                          material:
                            evento.target.value,
                        }
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-[#353535] bg-[#101010] px-3 py-3 outline-none focus:border-[#810404]"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">
                      PETG
                    </option>
                    <option value="TPU">TPU</option>
                    <option value="ABS">ABS</option>
                    <option value="ASA">ASA</option>
                    <option value="Otro">
                      Otro
                    </option>
                  </select>
                </label>

                <label>
                  <span className="text-xs font-semibold text-gray-400">
                    Color
                  </span>

                  <input
                    value={material.color}
                    onChange={(evento) =>
                      actualizarMaterial(
                        material.id,
                        {
                          color:
                            evento.target.value,
                        }
                      )
                    }
                    placeholder="Ej: Blanco"
                    className="mt-2 w-full rounded-lg border border-[#353535] bg-[#101010] px-3 py-3 outline-none focus:border-[#810404]"
                  />
                </label>

                <label>
                  <span className="text-xs font-semibold text-gray-400">
                    Gramos por cama
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      material.gramosPorCama
                    }
                    onChange={(evento) =>
                      actualizarMaterial(
                        material.id,
                        {
                          gramosPorCama:
                            evento.target.value,
                        }
                      )
                    }
                    placeholder="0"
                    className="mt-2 w-full rounded-lg border border-[#353535] bg-[#101010] px-3 py-3 outline-none focus:border-[#810404]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    eliminarMaterial(
                      material.id
                    )
                  }
                  className="self-end rounded-lg border border-red-950 px-4 py-3 text-sm text-red-300 transition hover:bg-red-950/30"
                >
                  Eliminar
                </button>
              </article>
            )
          )}
        </div>
      )}

      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-400">
            Total detallado por cama
          </span>

          <strong>
            {pesoMateriales.toLocaleString(
              "es-AR",
              {
                maximumFractionDigits: 2,
              }
            )}{" "}
            g
          </strong>
        </div>

        {producto.pesoPorCama &&
          Math.abs(
            pesoMateriales -
              Number(producto.pesoPorCama)
          ) > 0.1 && (
            <p className="mt-3 text-xs leading-5 text-amber-300">
              El total detallado no coincide con el peso por cama de la receta
              ({producto.pesoPorCama} g). Revisá los valores antes de guardar.
            </p>
          )}
      </div>
    </section>
  );
}