type Props = {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function Input({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-[var(--muted)]">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="
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
  );
}