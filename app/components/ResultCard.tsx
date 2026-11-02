type Props = {
  titulo: string;
  valor: string;
};

export default function ResultCard({ titulo, valor }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <p className="text-[var(--muted)] text-sm">
        {titulo}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {valor}
      </h2>
    </div>
  );
}