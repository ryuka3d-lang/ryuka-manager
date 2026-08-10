"use client";

const STORAGE_KEY = "ryuka-ferias";

export type EstadoFeria =
  | "planificada"
  | "en_preparacion"
  | "finalizada";

export type ProductoFeria = {
  productId: string;
  codigo: string;
  nombre: string;
  cantidadObjetivo: number;
  cantidadPreparada: number;
};

export type FeriaGuardada = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  lugar: string;
  publicoEstimado: number;
  presupuestoObjetivo: number;
  notas: string;
  estado: EstadoFeria;
  productos: ProductoFeria[];
  creadoEn: string;
  actualizadoEn: string;
};

function normalizarFeria(
  feria: Partial<FeriaGuardada>
): FeriaGuardada {
  const ahora = new Date().toISOString();

  return {
    id:
      feria.id ||
      `FER-${Date.now().toString(36).toUpperCase()}`,
    nombre: feria.nombre || "",
    tipo: feria.tipo || "",
    fecha: feria.fecha || "",
    lugar: feria.lugar || "",
    publicoEstimado:
      Number(feria.publicoEstimado) || 0,
    presupuestoObjetivo:
      Number(feria.presupuestoObjetivo) || 0,
    notas: feria.notas || "",
    estado:
      feria.estado === "finalizada"
        ? "finalizada"
        : feria.estado === "en_preparacion"
          ? "en_preparacion"
          : "planificada",
    productos: Array.isArray(feria.productos)
      ? feria.productos.map((producto) => ({
          productId: producto.productId || "",
          codigo: producto.codigo || "",
          nombre: producto.nombre || "",
          cantidadObjetivo:
            Number(producto.cantidadObjetivo) || 0,
          cantidadPreparada:
            Math.max(0, Number(producto.cantidadPreparada) || 0),
        }))
      : [],
    creadoEn: feria.creadoEn || ahora,
    actualizadoEn: feria.actualizadoEn || ahora,
  };
}

function leerFerias(): FeriaGuardada[] {
  if (typeof window === "undefined") return [];

  try {
    const valor = localStorage.getItem(STORAGE_KEY);
    const datos = valor ? JSON.parse(valor) : [];

    return Array.isArray(datos)
      ? datos.map(normalizarFeria)
      : [];
  } catch {
    return [];
  }
}

function guardarFerias(
  ferias: FeriaGuardada[]
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ferias)
  );

  window.dispatchEvent(
    new CustomEvent("ryuka-fairs-updated")
  );
}

export function obtenerFerias() {
  return leerFerias();
}

export function guardarFeria(
  feria: Omit<
    FeriaGuardada,
    "id" | "creadoEn" | "actualizadoEn"
  >
) {
  const ahora = new Date().toISOString();

  const nueva = normalizarFeria({
    ...feria,
    id: `FER-${Date.now()
      .toString(36)
      .toUpperCase()}`,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });

  const ferias = [...leerFerias(), nueva];
  guardarFerias(ferias);

  return nueva;
}

export function editarFeria(
  id: string,
  cambios: Partial<FeriaGuardada>
) {
  let encontrada: FeriaGuardada | null = null;

  const ferias = leerFerias().map((feria) => {
    if (feria.id !== id) return feria;

    encontrada = normalizarFeria({
      ...feria,
      ...cambios,
      id: feria.id,
      creadoEn: feria.creadoEn,
      actualizadoEn: new Date().toISOString(),
    });

    return encontrada;
  });

  guardarFerias(ferias);
  return encontrada;
}

export function eliminarFeria(id: string) {
  const ferias = leerFerias();
  const nuevas = ferias.filter(
    (feria) => feria.id !== id
  );

  if (nuevas.length === ferias.length) {
    return false;
  }

  guardarFerias(nuevas);
  return true;
}

export function totalUnidadesFeria(
  feria: FeriaGuardada
) {
  return feria.productos.reduce(
    (total, producto) =>
      total + producto.cantidadObjetivo,
    0
  );
}


export type PlanProduccionFeria = {
  unidadesObjetivo: number;
  unidadesPreparadas: number;
  unidadesPendientes: number;
  camasNecesarias: number;
  gramosFilamento: number;
  minutosImpresion: number;
  diasHastaFeria: number | null;
  horasDisponibles: number | null;
  llegaATiempo: boolean | null;
  horasMargen: number | null;
  productosSinReceta: string[];
};

export function calcularPlanProduccionFeria(
  feria: FeriaGuardada,
  productosCatalogo: Array<{
    id: string;
    cantidadPorCama: string;
    pesoPorCama: string;
    horas: string;
    minutos: string;
  }>,
  horasImpresionDia: number,
  fechaReferencia = new Date()
): PlanProduccionFeria {
  let unidadesObjetivo = 0;
  let unidadesPreparadas = 0;
  let unidadesPendientes = 0;
  let camasNecesarias = 0;
  let gramosFilamento = 0;
  let minutosImpresion = 0;
  const productosSinReceta: string[] = [];

  for (const item of feria.productos) {
    const objetivo = Math.max(0, Number(item.cantidadObjetivo) || 0);
    const preparada = Math.min(objetivo, Math.max(0, Number(item.cantidadPreparada) || 0));
    const pendiente = Math.max(0, objetivo - preparada);

    unidadesObjetivo += objetivo;
    unidadesPreparadas += preparada;
    unidadesPendientes += pendiente;

    if (pendiente <= 0) continue;

    const receta = productosCatalogo.find((producto) => producto.id === item.productId);
    const porCama = Number(receta?.cantidadPorCama) || 0;

    if (!receta || porCama <= 0) {
      productosSinReceta.push(item.nombre);
      continue;
    }

    const camas = Math.ceil(pendiente / porCama);
    const minutosCama = (Number(receta.horas) || 0) * 60 + (Number(receta.minutos) || 0);
    const gramosCama = Number(receta.pesoPorCama) || 0;

    camasNecesarias += camas;
    minutosImpresion += camas * minutosCama;
    gramosFilamento += camas * gramosCama;
  }

  let diasHastaFeria: number | null = null;
  let horasDisponibles: number | null = null;
  let llegaATiempo: boolean | null = null;
  let horasMargen: number | null = null;

  if (feria.fecha) {
    const hoy = new Date(fechaReferencia);
    hoy.setHours(0, 0, 0, 0);
    const fechaFeria = new Date(`${feria.fecha}T00:00:00`);
    const diferencia = fechaFeria.getTime() - hoy.getTime();
    diasHastaFeria = Math.max(0, Math.ceil(diferencia / 86400000));
    horasDisponibles = diasHastaFeria * Math.max(0, horasImpresionDia);
    const horasNecesarias = minutosImpresion / 60;
    horasMargen = horasDisponibles - horasNecesarias;
    llegaATiempo = productosSinReceta.length === 0 && horasMargen >= 0;
  }

  return {
    unidadesObjetivo,
    unidadesPreparadas,
    unidadesPendientes,
    camasNecesarias,
    gramosFilamento,
    minutosImpresion,
    diasHastaFeria,
    horasDisponibles,
    llegaATiempo,
    horasMargen,
    productosSinReceta,
  };
}
