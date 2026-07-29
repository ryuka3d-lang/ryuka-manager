"use client";

import { useEffect, useMemo, useState } from "react";
import {
  eliminarCompra,
  obtenerCompras,
  obtenerInsumosStock,
  registrarCompraFilamento,
  registrarCompraInsumo,
  type Compra,
  type InsumoStock,
  type TipoItemCompra,
} from "@/lib/purchase-service";

const hoy = () => new Date().toISOString().slice(0, 10);

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [insumos, setInsumos] = useState<InsumoStock[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipo, setTipo] = useState<TipoItemCompra>("filamento");

  function recargar() {
    setCompras(obtenerCompras());
    setInsumos(obtenerInsumosStock());
  }

  useEffect(() => {
    recargar();
  }, []);

  const totalMes = useMemo(() => {
    const fecha = new Date();
    const mes = fecha.getMonth();
    const anio = fecha.getFullYear();

    return compras
      .filter((compra) => {
        const actual = new Date(`${compra.fecha}T12:00:00`);
        return actual.getMonth() === mes && actual.getFullYear() === anio;
      })
      .reduce((total, compra) => total + compra.precioTotal, 0);
  }, [compras]);

  const insumosBajos = insumos.filter(
    (insumo) => insumo.cantidadActual <= insumo.stockMinimo
  ).length;

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
                Abastecimiento
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Compras</h1>
              <p className="mt-4 max-w-2xl text-zinc-300">
                Registrá filamentos e insumos. Las compras de filamento crean las bobinas automáticamente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="rounded-xl bg-[#810404] px-6 py-3 font-semibold hover:bg-[#a00808]"
            >
              + Nueva compra
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Resumen titulo="Gastado este mes" valor={moneda(totalMes)} />
          <Resumen titulo="Compras registradas" valor={String(compras.length)} />
          <Resumen titulo="Insumos con stock bajo" valor={String(insumosBajos)} />
        </section>

        {insumos.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-6">
            <h2 className="text-xl font-bold">Stock de insumos</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {insumos.map((insumo) => {
                const bajo = insumo.cantidadActual <= insumo.stockMinimo;
                return (
                  <article key={insumo.id} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-red-300">{insumo.id}</p>
                        <h3 className="mt-1 font-bold">{insumo.nombre}</h3>
                      </div>
                      {bajo && <span className="h-fit rounded-full bg-amber-950 px-3 py-1 text-xs text-amber-300">Stock bajo</span>}
                    </div>
                    <p className="mt-4 text-2xl font-bold">
                      {numero(insumo.cantidadActual)} <span className="text-sm font-normal text-zinc-400">{insumo.unidad}</span>
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">Costo promedio: {moneda(insumo.costoUnitarioPromedio)} por {insumo.unidad}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818] p-6">
          <h2 className="text-xl font-bold">Historial de compras</h2>

          {compras.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-8 text-center text-zinc-400">
              Todavía no registraste compras.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {compras.map((compra) => (
                <article key={compra.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#121212] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-red-300">{compra.id}</span>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs">
                        {compra.tipo === "filamento" ? "🧵 Filamento" : "📦 Insumo"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold">{compra.descripcion}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {compra.proveedor || "Sin proveedor"} · {fecha(compra.fecha)} · {numero(compra.cantidad)} u.
                    </p>
                    {compra.bobinasCreadas.length > 0 && (
                      <p className="mt-2 text-xs text-zinc-500">Bobinas creadas: {compra.bobinasCreadas.join(", ")}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 md:text-right">
                    <strong className="text-lg">{moneda(compra.precioTotal)}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Eliminar este registro de compra? El stock creado no se modificará.")) {
                          eliminarCompra(compra.id);
                          recargar();
                        }
                      }}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 hover:text-white"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {mostrarFormulario && (
        <CompraModal
          tipo={tipo}
          setTipo={setTipo}
          onClose={() => setMostrarFormulario(false)}
          onSaved={() => {
            setMostrarFormulario(false);
            recargar();
          }}
        />
      )}
    </main>
  );
}

function CompraModal({
  tipo,
  setTipo,
  onClose,
  onSaved,
}: {
  tipo: TipoItemCompra;
  setTipo: (tipo: TipoItemCompra) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState(hoy());
  const [cantidad, setCantidad] = useState("1");
  const [precioTotal, setPrecioTotal] = useState("");
  const [medioPago, setMedioPago] = useState("Transferencia");
  const [notas, setNotas] = useState("");
  const [material, setMaterial] = useState("PLA");
  const [color, setColor] = useState("");
  const [marca, setMarca] = useState("");
  const [pesoBobina, setPesoBobina] = useState("1000");
  const [minimoFilamento, setMinimoFilamento] = useState("150");
  const [nombreInsumo, setNombreInsumo] = useState("");
  const [unidad, setUnidad] = useState("unidad");
  const [minimoInsumo, setMinimoInsumo] = useState("10");

  function guardar() {
    const comun = {
      proveedor,
      fecha: fechaCompra,
      cantidad: Number(cantidad),
      precioTotal: Number(precioTotal),
      medioPago,
      notas,
    };

    const resultado = tipo === "filamento"
      ? registrarCompraFilamento({
          ...comun,
          material,
          color,
          marca,
          pesoPorBobinaGramos: Number(pesoBobina),
          stockMinimoGramos: Number(minimoFilamento),
        })
      : registrarCompraInsumo({
          ...comun,
          nombre: nombreInsumo,
          unidad,
          stockMinimo: Number(minimoInsumo),
        });

    if (!resultado) {
      alert("Revisá los datos obligatorios y los valores ingresados.");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#181818] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">Nueva compra</p>
            <h2 className="mt-2 text-2xl font-bold">Registrar abastecimiento</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-3 py-2">✕</button>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#101010] p-1">
          <button type="button" onClick={() => setTipo("filamento")} className={`rounded-lg px-4 py-3 font-semibold ${tipo === "filamento" ? "bg-[#810404]" : "text-zinc-400"}`}>🧵 Filamento</button>
          <button type="button" onClick={() => setTipo("insumo")} className={`rounded-lg px-4 py-3 font-semibold ${tipo === "insumo" ? "bg-[#810404]" : "text-zinc-400"}`}>📦 Insumo</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Campo titulo="Proveedor" valor={proveedor} onChange={setProveedor} />
          <Campo titulo="Fecha" tipo="date" valor={fechaCompra} onChange={setFechaCompra} />

          {tipo === "filamento" ? (
            <>
              <label><span className="text-sm font-semibold text-zinc-300">Material</span><select value={material} onChange={(e) => setMaterial(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3"><option>PLA</option><option>PETG</option><option>TPU</option><option>ABS</option><option>ASA</option><option>OTRO</option></select></label>
              <Campo titulo="Color *" valor={color} onChange={setColor} />
              <Campo titulo="Marca" valor={marca} onChange={setMarca} />
              <Campo titulo="Cantidad de bobinas" tipo="number" valor={cantidad} onChange={setCantidad} />
              <Campo titulo="Peso por bobina (g)" tipo="number" valor={pesoBobina} onChange={setPesoBobina} />
              <Campo titulo="Avisar debajo de (g)" tipo="number" valor={minimoFilamento} onChange={setMinimoFilamento} />
            </>
          ) : (
            <>
              <Campo titulo="Nombre del insumo *" valor={nombreInsumo} onChange={setNombreInsumo} />
              <Campo titulo="Cantidad comprada" tipo="number" valor={cantidad} onChange={setCantidad} />
              <Campo titulo="Unidad (unidad, caja, metro...)" valor={unidad} onChange={setUnidad} />
              <Campo titulo="Avisar debajo de" tipo="number" valor={minimoInsumo} onChange={setMinimoInsumo} />
            </>
          )}

          <Campo titulo="Precio total" tipo="number" valor={precioTotal} onChange={setPrecioTotal} />
          <Campo titulo="Medio de pago" valor={medioPago} onChange={setMedioPago} />
        </div>

        <label className="mt-4 block"><span className="text-sm font-semibold text-zinc-300">Notas</span><textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3" /></label>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3">Cancelar</button>
          <button type="button" onClick={guardar} className="rounded-xl bg-[#810404] px-6 py-3 font-semibold">Guardar compra</button>
        </div>
      </div>
    </div>
  );
}

function Campo({ titulo, valor, tipo = "text", onChange }: { titulo: string; valor: string; tipo?: "text" | "number" | "date"; onChange: (valor: string) => void }) {
  return <label><span className="text-sm font-semibold text-zinc-300">{titulo}</span><input type={tipo} value={valor} min={tipo === "number" ? "0" : undefined} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3" /></label>;
}

function Resumen({ titulo, valor }: { titulo: string; valor: string }) {
  return <article className="rounded-2xl border border-white/10 bg-[#181818] p-5"><p className="text-sm text-zinc-400">{titulo}</p><p className="mt-2 text-2xl font-bold">{valor}</p></article>;
}

function moneda(valor: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(valor || 0);
}
function numero(valor: number) { return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(valor || 0); }
function fecha(valor: string) { return new Intl.DateTimeFormat("es-AR").format(new Date(`${valor}T12:00:00`)); }
