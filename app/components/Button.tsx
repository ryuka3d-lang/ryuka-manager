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
        bg-red-700
        hover:bg-red-600
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