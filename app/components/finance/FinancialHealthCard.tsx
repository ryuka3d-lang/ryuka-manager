"use client";

import type {
  CentroFinanciero,
  EstadoObjetivoFinanciero,
} from "@/lib/finance-service";

type Props = {
  centro: CentroFinanciero;
  reinversionPorcentaje: number;
};

export default function FinancialHealthCard({
  centro,
  reinversionPorcentaje,
}: Props) {
  const puedeRetirar =
    centro.disponibleParaRetirar > 0;

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#181818]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(129,4,4,0.35),_transparent_45%),#181818] p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
          Salud financiera
        </p>

        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-zinc-400">
              Disponible para retirar
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {moneda(
                centro.disponibleParaRetirar
              )}
            </p>

            <p
              className={`mt-3 text-sm font-semibold ${
                puedeRetirar
                  ? "text-emerald-300"
                  : "text-amber-300"
              }`}
            >
              {puedeRetirar ? "🟢" : "🟡"}{" "}
              {centro.mensajePrincipal}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[340px]">
            <MiniDato
              titulo="Caja real"
              valor={moneda(centro.saldoCaja)}
            />
            <MiniDato
              titulo="Ingresó este mes"
              valor={moneda(centro.ingresosMes)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4 lg:p-8">
        <Objetivo
          titulo="Fondo salarial"
          icono="👥"
          estado={centro.sueldo}
          subtitulo="Meta mensual conjunta"
        />

        <Objetivo
          titulo="Monotributo"
          icono="🧾"
          estado={centro.monotributo}
          subtitulo="Obligación mensual"
        />

        <Objetivo
          titulo="Electricidad"
          icono="⚡"
          estado={centro.electricidad}
          subtitulo={
            centro.electricidad.objetivo > 0
              ? "Monto a reponer"
              : "Sin monto pendiente cargado"
          }
        />

        <Objetivo
          titulo="Reinversión"
          icono="🔄"
          estado={centro.reinversion}
          subtitulo={`${reinversionPorcentaje}% de los cobros del mes`}
        />
      </div>
    </section>
  );
}

function Objetivo({
  titulo,
  icono,
  estado,
  subtitulo,
}: {
  titulo: string;
  icono: string;
  estado: EstadoObjetivoFinanciero;
  subtitulo: string;
}) {
  const completo = estado.completo;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#111] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {icono} {titulo}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {subtitulo}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
            completo
              ? "bg-emerald-950/70 text-emerald-300"
              : "bg-amber-950/70 text-amber-300"
          }`}
        >
          {completo ? "Cubierto" : "Pendiente"}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <strong>
            {moneda(estado.cubierto)}
          </strong>

          <span className="text-xs text-zinc-500">
            de {moneda(estado.objetivo)}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${
              completo
                ? "bg-emerald-500"
                : "bg-[#810404]"
            }`}
            style={{
              width: `${Math.max(
                0,
                Math.min(100, estado.porcentaje)
              )}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-zinc-400">
          {completo
            ? "✅ Cubierto"
            : `Faltan ${moneda(
                estado.faltante
              )}`}
        </p>
      </div>
    </article>
  );
}

function MiniDato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs text-zinc-500">
        {titulo}
      </p>

      <strong className="mt-1 block">
        {valor}
      </strong>
    </div>
  );
}

function moneda(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}
