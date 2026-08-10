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
