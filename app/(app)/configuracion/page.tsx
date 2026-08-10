"use client";

import {
  useEffect,
  useState,
} from "react";


import {
  DEFAULT_RYUKA_CONFIG,
  guardarConfiguracion,
  obtenerConfiguracion,
  restaurarConfiguracion,
  type RyukaConfig,
} from "@/lib/settings-service";

type CampoConfiguracion = {
  clave: keyof RyukaConfig;
  titulo: string;
  descripcion: string;
  prefijo?: string;
  sufijo?: string;
  minimo?: number;
  maximo?: number;
  paso?: number;
};

const camposCostos: CampoConfiguracion[] = [
  {
    clave: "precioKgFilamento",
    titulo: "Precio del kilo de filamento",
    descripcion:
      "Valor de compra de 1 kg del filamento utilizado habitualmente.",
    prefijo: "$",
    minimo: 0,
    paso: 100,
  },
  {
    clave: "costoElectricidadHora",
    titulo: "Electricidad por hora",
    descripcion:
      "Costo eléctrico estimado por cada hora de impresión.",
    prefijo: "$",
    minimo: 0,
    paso: 1,
  },
  {
    clave: "amortizacionHora",
    titulo: "Amortización por hora",
    descripcion:
      "Monto reservado por cada hora para desgaste, mantenimiento y reposición.",
    prefijo: "$",
    minimo: 0,
    paso: 1,
  },
];

const camposOperacion: CampoConfiguracion[] = [
  {
    clave: "horasProductivas",
    titulo: "Horas productivas mensuales",
    descripcion:
      "Cantidad de horas mensuales usadas para distribuir sueldo y costos fijos.",
    sufijo: "h",
    minimo: 1,
    paso: 1,
  },
  {
    clave: "horasImpresionDia",
    titulo: "Horas de impresión por día",
    descripcion:
      "Capacidad diaria habitual utilizada para calcular los días de producción.",
    sufijo: "h",
    minimo: 1,
    maximo: 24,
    paso: 1,
  },
];

const camposEstructura: CampoConfiguracion[] = [
  {
    clave: "sueldoMensual",
    titulo: "Sueldos mensuales",
    descripcion:
      "Monto mensual total que el negocio debe cubrir para sus integrantes.",
    prefijo: "$",
    minimo: 0,
    paso: 1000,
  },
  {
    clave: "monotributo",
    titulo: "Monotributo mensual",
    descripcion:
      "Monto mensual que Ryuka debe reservar para el monotributo.",
    prefijo: "$",
    minimo: 0,
    paso: 100,
  },
  {
    clave: "reinversionPorcentaje",
    titulo: "Reserva para reinversión",
    descripcion:
      "Porcentaje de los cobros del mes que se protege para filamento, herramientas y crecimiento.",
    sufijo: "%",
    minimo: 0,
    maximo: 100,
    paso: 1,
  },
  {
    clave: "electricidadAReponer",
    titulo: "Electricidad a reponer",
    descripcion:
      "Monto real que querés devolver por el consumo del taller. Si todavía no lo sabés, dejalo en $0.",
    prefijo: "$",
    minimo: 0,
    paso: 100,
  },
];

const camposAccesorios: CampoConfiguracion[] = [
  {
    clave: "costoArgolla",
    titulo: "Argolla",
    descripcion:
      "Costo predeterminado por unidad.",
    prefijo: "$",
    minimo: 0,
    paso: 0.01,
  },
  {
    clave: "costoSticker",
    titulo: "Sticker",
    descripcion:
      "Costo predeterminado por unidad.",
    prefijo: "$",
    minimo: 0,
    paso: 0.01,
  },
  {
    clave: "costoCaja",
    titulo: "Caja",
    descripcion:
      "Costo predeterminado por unidad.",
    prefijo: "$",
    minimo: 0,
    paso: 0.01,
  },
  {
    clave: "costoBolsa",
    titulo: "Bolsa",
    descripcion:
      "Costo predeterminado por unidad.",
    prefijo: "$",
    minimo: 0,
    paso: 0.01,
  },
];

const camposMargenes: CampoConfiguracion[] = [
  {
    clave: "margenMayorista",
    titulo: "Margen mayorista",
    descripcion:
      "Porcentaje sugerido de ganancia para ventas mayoristas.",
    sufijo: "%",
    minimo: 0,
    paso: 1,
  },
  {
    clave: "margenMinorista",
    titulo: "Margen minorista",
    descripcion:
      "Porcentaje sugerido de ganancia para ventas minoristas.",
    sufijo: "%",
    minimo: 0,
    paso: 1,
  },
];

export default function ConfiguracionPage() {
  const [config, setConfig] =
    useState<RyukaConfig>(
      DEFAULT_RYUKA_CONFIG
    );

  const [guardado, setGuardado] =
    useState(false);

  useEffect(() => {
    setConfig(obtenerConfiguracion());
  }, []);

  function actualizarCampo(
    clave: keyof RyukaConfig,
    valor: string
  ) {
    setGuardado(false);

    setConfig((configActual) => ({
      ...configActual,
      [clave]: Number(valor) || 0,
    }));
  }

  function manejarGuardar() {
    const configuracionGuardada =
      guardarConfiguracion(config);

    setConfig(configuracionGuardada);
    setGuardado(true);

    window.setTimeout(() => {
      setGuardado(false);
    }, 2500);
  }

  function manejarRestaurar() {
    const confirmar = window.confirm(
      "¿Querés restaurar todos los valores predeterminados?"
    );

    if (!confirmar) {
      return;
    }

    const configuracionRestaurada =
      restaurarConfiguracion();

    setConfig(configuracionRestaurada);
    setGuardado(false);
  }

  return (
    <main className="min-h-screen bg-[#101010] text-white">
      

      <section className="min-w-0 flex-1 p-6 lg:p-10">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(129,4,4,0.32),_transparent_42%),#181818] p-7 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">
            Configuración general
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Los valores que usa Ryuka
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
            Actualizá costos, capacidad productiva y márgenes desde un solo lugar.
            Los próximos presupuestos usarán automáticamente estos valores.
          </p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-zinc-200">
              Importante
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Cambiar la configuración no modifica los presupuestos que ya fueron
              guardados. Solo afecta los cálculos nuevos.
            </p>
          </div>
        </header>

        <div className="mt-8 space-y-6">
          <SeccionConfiguracion
            titulo="Material y máquina"
            descripcion="Costos directamente relacionados con la impresión."
            campos={camposCostos}
            config={config}
            onChange={actualizarCampo}
          />

          <SeccionConfiguracion
            titulo="Capacidad de producción"
            descripcion="Parámetros usados para estimar tiempos y distribuir costos."
            campos={camposOperacion}
            config={config}
            onChange={actualizarCampo}
          />

          <SeccionConfiguracion
            titulo="Estructura mensual"
            descripcion="Costos fijos que el emprendimiento necesita cubrir."
            campos={camposEstructura}
            config={config}
            onChange={actualizarCampo}
          />

          <SeccionConfiguracion
            titulo="Accesorios predeterminados"
            descripcion="Valores sugeridos al agregar accesorios a los productos."
            campos={camposAccesorios}
            config={config}
            onChange={actualizarCampo}
          />

          <SeccionConfiguracion
            titulo="Márgenes sugeridos"
            descripcion="Porcentajes iniciales usados en el simulador de venta."
            campos={camposMargenes}
            config={config}
            onChange={actualizarCampo}
          />
        </div>

        <div className="sticky bottom-4 mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#181818]/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              {guardado
                ? "Configuración guardada ✓"
                : "Guardá los cambios para aplicarlos"}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Los valores se guardan en Ryuka y se sincronizan con la nube.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={manejarRestaurar}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
            >
              Restaurar valores
            </button>

            <button
              type="button"
              onClick={manejarGuardar}
              className="rounded-xl bg-[#810404] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a00808]"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

type SeccionConfiguracionProps = {
  titulo: string;
  descripcion: string;
  campos: CampoConfiguracion[];
  config: RyukaConfig;
  onChange: (
    clave: keyof RyukaConfig,
    valor: string
  ) => void;
};

function SeccionConfiguracion({
  titulo,
  descripcion,
  campos,
  config,
  onChange,
}: SeccionConfiguracionProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#181818] p-6">
      <div>
        <h2 className="text-xl font-bold">
          {titulo}
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {descripcion}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campos.map((campo) => (
          <CampoNumero
            key={campo.clave}
            campo={campo}
            valor={config[campo.clave]}
            onChange={(valor) =>
              onChange(campo.clave, valor)
            }
          />
        ))}
      </div>
    </section>
  );
}

type CampoNumeroProps = {
  campo: CampoConfiguracion;
  valor: number;
  onChange: (valor: string) => void;
};

function CampoNumero({
  campo,
  valor,
  onChange,
}: CampoNumeroProps) {
  return (
    <label className="rounded-2xl border border-white/10 bg-[#121212] p-4">
      <span className="block font-semibold">
        {campo.titulo}
      </span>

      <span className="mt-1 block min-h-10 text-xs leading-5 text-zinc-500">
        {campo.descripcion}
      </span>

      <div className="mt-4 flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] focus-within:border-[#810404]">
        {campo.prefijo && (
          <span className="border-r border-white/10 px-3 text-sm text-zinc-500">
            {campo.prefijo}
          </span>
        )}

        <input
          type="number"
          value={valor}
          min={campo.minimo}
          max={campo.maximo}
          step={campo.paso ?? 1}
          onChange={(evento) =>
            onChange(evento.target.value)
          }
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-white outline-none"
        />

        {campo.sufijo && (
          <span className="border-l border-white/10 px-3 text-sm text-zinc-500">
            {campo.sufijo}
          </span>
        )}
      </div>
    </label>
  );
}