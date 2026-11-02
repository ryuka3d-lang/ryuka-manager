type Props = {
  texto: string;
  onClick?: () => void;
};

export default function Button({
  texto,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
        bg-[var(--accent)]
        hover:bg-[var(--accent-hover)]
        transition
        rounded-xl
        px-6
        py-3
        font-semibold
      "
    >
      {texto}
    </button>
  );
}