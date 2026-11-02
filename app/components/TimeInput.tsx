type Props = {
  label: string;
  horas: string;
  minutos: string;
  onHorasChange: (value: string) => void;
  onMinutosChange: (value: string) => void;
};

export default function TimeInput({
  label,
  horas,
  minutos,
  onHorasChange,
  onMinutosChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">

      <label className="text-sm text-[var(--muted)]">
        {label}
      </label>

      <div className="flex gap-3">

        <input
          type="number"
          placeholder="Horas"
          value={horas}
          onChange={(e) => onHorasChange(e.target.value)}
          className="
            w-full
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-xl
            px-4
            py-3
            outline-none
            focus:border-red-600
          "
        />

        <input
          type="number"
          placeholder="Min"
          value={minutos}
          onChange={(e) => onMinutosChange(e.target.value)}
          className="
            w-full
            bg-[var(--card)]
            border
            border-[var(--border)]
            rounded-xl
            px-4
            py-3
            outline-none
            focus:border-red-600
          "
        />

      </div>

    </div>
  );
}