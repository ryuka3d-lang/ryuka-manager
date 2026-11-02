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
    <article className="group rounded-3xl border border-[var(--border)] bg-[#191919] p-6 transition hover:-translate-y-1 hover:border-[var(--accent)]/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">
            {pregunta}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)]">
            {valor}
          </h2>
        </div>

        {icono && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent)]/20 text-xl">
            {icono}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {respuesta}
      </p>

      {progresoSeguro !== undefined && (
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{
                width: `${progresoSeguro}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-[var(--muted)]">
            {progresoSeguro.toFixed(0)}% del objetivo
          </p>
        </div>
      )}

      {etiqueta && (
        <span className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--overlay)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
          {etiqueta}
        </span>
      )}
    </article>
  );
}