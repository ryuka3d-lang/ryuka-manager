type Props = {
  titulo: string;
  subtitulo: string;
};

export default function PageHeader({
  titulo,
  subtitulo,
}: Props) {
  return (
    <div className="mb-8">

      <h1 className="text-4xl font-bold">
        {titulo}
      </h1>

      <p className="text-gray-400 mt-2">
        {subtitulo}
      </p>

    </div>
  );
}