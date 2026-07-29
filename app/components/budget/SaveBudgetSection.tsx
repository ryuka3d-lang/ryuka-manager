"use client";

type Props = {
  onGuardar: () => void;
};

export default function SaveBudgetSection({
  onGuardar,
}: Props) {
  return (
    <section className="mt-8 rounded-xl border border-[#2b2b2b] bg-[#1b1b1b] p-6">
      <h2 className="text-xl font-bold">
        Guardar presupuesto
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Guardá este cálculo para consultarlo,
        duplicarlo o generar el PDF más adelante.
      </p>

      <button
        type="button"
        onClick={onGuardar}
        className="
          mt-6
          rounded-xl
          bg-red-700
          px-6
          py-3
          font-semibold
          transition
          hover:bg-red-600
        "
      >
        Guardar presupuesto
      </button>
    </section>
  );
}