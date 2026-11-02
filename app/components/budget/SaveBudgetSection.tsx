"use client";

type Props = {
  onGuardar: () => void;
};

export default function SaveBudgetSection({
  onGuardar,
}: Props) {
  return (
    <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-xl font-bold">
        Guardar presupuesto
      </h2>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Guardá este cálculo para consultarlo,
        duplicarlo o generar el PDF más adelante.
      </p>

      <button
        type="button"
        onClick={onGuardar}
        className="
          mt-6
          rounded-xl
          bg-[var(--accent)]
          px-6
          py-3
          font-semibold
          transition
          hover:bg-[var(--accent-hover)]
        "
      >
        Guardar presupuesto
      </button>
    </section>
  );
}