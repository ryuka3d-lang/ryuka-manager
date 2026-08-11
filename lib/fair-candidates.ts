"use client";

const STORAGE_KEY = "ryuka-fair-candidates";

export type SitioModelo =
  | "Printables"
  | "MakerWorld"
  | "Cults3D"
  | "Otro";

export type EstadoLicencia =
  | "sin_revisar"
  | "comercial"
  | "no_comercial";

export type EstadoCandidato =
  | "idea"
  | "evaluando"
  | "convertido";

export type ModeloCandidato = {
  id: string;
  feriaId?: string;
  nombre: string;
  sitio: SitioModelo;
  url: string;
  precioArchivo: number;
  licencia: EstadoLicencia;
  notas: string;

  estado: EstadoCandidato;

  productoId?: string;
  productoCodigo?: string;
  productoNombre?: string;
  convertidoEn?: string;

  creadoEn: string;
};

function normalizar(
  candidato: Partial<ModeloCandidato>
): ModeloCandidato {
  const tieneProducto = Boolean(
    candidato.productoId ||
      candidato.productoCodigo
  );

  const estado: EstadoCandidato =
    candidato.estado === "convertido" ||
    tieneProducto
      ? "convertido"
      : candidato.estado === "evaluando"
        ? "evaluando"
        : "idea";

  return {
    id:
      candidato.id ||
      `MOD-${Date.now()
        .toString(36)
        .toUpperCase()}`,

    feriaId: candidato.feriaId,

    nombre: candidato.nombre || "",

    sitio:
      candidato.sitio === "MakerWorld" ||
      candidato.sitio === "Cults3D" ||
      candidato.sitio === "Otro"
        ? candidato.sitio
        : "Printables",

    url: candidato.url || "",

    precioArchivo:
      Number(candidato.precioArchivo) || 0,

    licencia:
      candidato.licencia === "comercial" ||
      candidato.licencia === "no_comercial"
        ? candidato.licencia
        : "sin_revisar",

    notas: candidato.notas || "",

    estado,

    productoId:
      candidato.productoId || undefined,

    productoCodigo:
      candidato.productoCodigo || undefined,

    productoNombre:
      candidato.productoNombre || undefined,

    convertidoEn:
      candidato.convertidoEn || undefined,

    creadoEn:
      candidato.creadoEn ||
      new Date().toISOString(),
  };
}

function leerTodos() {
  if (typeof window === "undefined") {
    return [] as ModeloCandidato[];
  }

  try {
    const contenido =
      localStorage.getItem(STORAGE_KEY) ||
      "[]";

    const datos = JSON.parse(contenido);

    return Array.isArray(datos)
      ? datos.map(normalizar)
      : [];
  } catch {
    return [];
  }
}

function guardarTodos(
  candidatos: ModeloCandidato[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(candidatos)
  );

  window.dispatchEvent(
    new CustomEvent(
      "ryuka-fair-candidates-updated"
    )
  );
}

export function obtenerModelosCandidatos(
  feriaId?: string
) {
  const todos = leerTodos();

  return feriaId
    ? todos.filter(
        (candidato) =>
          candidato.feriaId === feriaId
      )
    : todos;
}

export function obtenerModeloCandidato(
  id: string
) {
  return (
    leerTodos().find(
      (candidato) => candidato.id === id
    ) || null
  );
}

export function guardarModeloCandidato(
  candidato: Omit<
    ModeloCandidato,
    | "id"
    | "creadoEn"
    | "estado"
    | "productoId"
    | "productoCodigo"
    | "productoNombre"
    | "convertidoEn"
  >
) {
  const nuevo = normalizar({
    ...candidato,
    estado: "idea",
  });

  guardarTodos([...leerTodos(), nuevo]);

  return nuevo;
}

export function editarModeloCandidato(
  id: string,
  cambios: Partial<ModeloCandidato>
) {
  let actualizado: ModeloCandidato | null =
    null;

  const todos = leerTodos().map(
    (candidato) => {
      if (candidato.id !== id) {
        return candidato;
      }

      actualizado = normalizar({
        ...candidato,
        ...cambios,
        id: candidato.id,
        creadoEn: candidato.creadoEn,
      });

      return actualizado;
    }
  );

  guardarTodos(todos);

  return actualizado;
}

export function marcarCandidatoEvaluando(
  id: string
) {
  return editarModeloCandidato(id, {
    estado: "evaluando",
  });
}

export function marcarCandidatoComoIdea(
  id: string
) {
  return editarModeloCandidato(id, {
    estado: "idea",
    productoId: undefined,
    productoCodigo: undefined,
    productoNombre: undefined,
    convertidoEn: undefined,
  });
}

export function marcarCandidatoConvertido(
  id: string,
  producto: {
    id: string;
    codigo: string;
    nombre: string;
  }
) {
  return editarModeloCandidato(id, {
    estado: "convertido",
    productoId: producto.id,
    productoCodigo: producto.codigo,
    productoNombre: producto.nombre,
    convertidoEn: new Date().toISOString(),
  });
}

export function eliminarModeloCandidato(
  id: string
) {
  const todos = leerTodos();

  const nuevos = todos.filter(
    (candidato) => candidato.id !== id
  );

  if (nuevos.length === todos.length) {
    return false;
  }

  guardarTodos(nuevos);

  return true;
}
