type Props = {
  titulo: string;
  valor: string;
};

export default function ResultCard({ titulo, valor }: Props) {
  return (
    <div className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-2xl p-5">
      <p className="text-gray-400 text-sm">
        {titulo}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {valor}
      </h2>
    </div>
  );
}