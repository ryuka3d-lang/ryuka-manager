export type RyukaConfig = {
  precioKgFilamento: number;

  costoElectricidadHora: number;
  amortizacionHora: number;

  horasProductivas: number;
  horasImpresionDia: number;

  sueldoMensual: number;
  monotributo: number;
  reinversionPorcentaje: number;
  electricidadAReponer: number;

  costoArgolla: number;
  costoSticker: number;
  costoCaja: number;
  costoBolsa: number;

  margenMayorista: number;
  margenMinorista: number;
};

const STORAGE_KEY = "ryuka-config";
const FINANCE_MIGRATION_KEY = "ryuka-finance-config-v1";

export const DEFAULT_RYUKA_CONFIG: RyukaConfig = {
  precioKgFilamento: 0,

  costoElectricidadHora: 0,
  amortizacionHora: 0,

  horasProductivas: 140,
  horasImpresionDia: 12,

  sueldoMensual: 500000,
  monotributo: 52000,
  reinversionPorcentaje: 15,
  electricidadAReponer: 0,

  costoArgolla: 0,
  costoSticker: 0,
  costoCaja: 0,
  costoBolsa: 0,

  margenMayorista: 40,
  margenMinorista: 80,
};

function convertirNumero(
  valor: unknown,
  valorPredeterminado: number
) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : valorPredeterminado;
}

function normalizarConfiguracion(
  datos: Record<string, unknown>
): RyukaConfig {
  return {
    precioKgFilamento: convertirNumero(
      datos.precioKgFilamento,
      DEFAULT_RYUKA_CONFIG.precioKgFilamento
    ),

    costoElectricidadHora: convertirNumero(
      datos.costoElectricidadHora,
      DEFAULT_RYUKA_CONFIG.costoElectricidadHora
    ),

    amortizacionHora: convertirNumero(
      datos.amortizacionHora,
      DEFAULT_RYUKA_CONFIG.amortizacionHora
    ),

    horasProductivas: convertirNumero(
      datos.horasProductivas,
      DEFAULT_RYUKA_CONFIG.horasProductivas
    ),

    horasImpresionDia: convertirNumero(
      datos.horasImpresionDia,
      DEFAULT_RYUKA_CONFIG.horasImpresionDia
    ),

    sueldoMensual: convertirNumero(
      datos.sueldoMensual,
      DEFAULT_RYUKA_CONFIG.sueldoMensual
    ),

    monotributo: convertirNumero(
      datos.monotributo,
      DEFAULT_RYUKA_CONFIG.monotributo
    ),

    reinversionPorcentaje: Math.min(
      100,
      Math.max(
        0,
        convertirNumero(
          datos.reinversionPorcentaje,
          DEFAULT_RYUKA_CONFIG.reinversionPorcentaje
        )
      )
    ),

    electricidadAReponer: Math.max(
      0,
      convertirNumero(
        datos.electricidadAReponer,
        DEFAULT_RYUKA_CONFIG.electricidadAReponer
      )
    ),

    costoArgolla: convertirNumero(
      datos.costoArgolla,
      DEFAULT_RYUKA_CONFIG.costoArgolla
    ),

    costoSticker: convertirNumero(
      datos.costoSticker,
      DEFAULT_RYUKA_CONFIG.costoSticker
    ),

    costoCaja: convertirNumero(
      datos.costoCaja,
      DEFAULT_RYUKA_CONFIG.costoCaja
    ),

    costoBolsa: convertirNumero(
      datos.costoBolsa,
      DEFAULT_RYUKA_CONFIG.costoBolsa
    ),

    margenMayorista: convertirNumero(
      datos.margenMayorista,
      DEFAULT_RYUKA_CONFIG.margenMayorista
    ),

    margenMinorista: convertirNumero(
      datos.margenMinorista,
      DEFAULT_RYUKA_CONFIG.margenMinorista
    ),
  };
}

export function obtenerConfiguracion(): RyukaConfig {
  if (typeof window === "undefined") {
    return DEFAULT_RYUKA_CONFIG;
  }

  const datosGuardados =
    localStorage.getItem(STORAGE_KEY);

  if (!datosGuardados) {
    return DEFAULT_RYUKA_CONFIG;
  }

  try {
    const datosParseados = JSON.parse(
      datosGuardados
    ) as Record<string, unknown>;

    // Primera migración del Centro Financiero:
    // aplica una sola vez los valores definidos para Ryuka
    // sin tocar el resto de la configuración existente.
    if (
      localStorage.getItem(FINANCE_MIGRATION_KEY) !== "1"
    ) {
      datosParseados.sueldoMensual = 500000;
      datosParseados.monotributo = 52000;
      datosParseados.reinversionPorcentaje = 15;
      datosParseados.electricidadAReponer = 0;

      localStorage.setItem(
        FINANCE_MIGRATION_KEY,
        "1"
      );
    }

    const normalizada =
      normalizarConfiguracion(datosParseados);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizada)
    );

    return normalizada;
  } catch {
    console.error(
      "No se pudo cargar la configuración guardada."
    );

    return DEFAULT_RYUKA_CONFIG;
  }
}

export function guardarConfiguracion(
  configuracion: RyukaConfig
): RyukaConfig {
  const configuracionNormalizada =
    normalizarConfiguracion(
      configuracion as unknown as Record<
        string,
        unknown
      >
    );

  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        configuracionNormalizada
      )
    );

    window.dispatchEvent(
      new CustomEvent("ryuka-config-updated")
    );
  }

  return configuracionNormalizada;
}

export function restaurarConfiguracion():
  RyukaConfig {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent("ryuka-config-updated")
    );
  }

  return DEFAULT_RYUKA_CONFIG;
}