import type { ReactNode } from "react";

type Props = {
  pregunta: string;
  valor: string;
  respuesta: string;
  icono?: ReactNode;
  etiqueta?: string;
  progreso?: number;
};

export default function StatCard({
  pregunta,
  valor,
  respuesta,
  icono,
  etiqueta,
  progreso,
}: Props) {
  const progresoSeguro =
    progreso === undefined
      ? undefined
      : Math.min(100, Math.max(0, progreso));

  return (
    <article className="group rounded-3xl border border-white/10 bg-[#191919] p-6 transition hover:-translate-y-1 hover:border-[#810404]/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {pregunta}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {valor}
          </h2>
        </div>

        {icono && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#810404]/20 text-xl">
            {icono}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-300">
        {respuesta}
      </p>

      {progresoSeguro !== undefined && (
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#810404] transition-all"
              style={{
                width: `${progresoSeguro}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            {progresoSeguro.toFixed(0)}% del objetivo
          </p>
        </div>
      )}

      {etiqueta && (
        <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
          {etiqueta}
        </span>
      )}
    </article>
  );
}