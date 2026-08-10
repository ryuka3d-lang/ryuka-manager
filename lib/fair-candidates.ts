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

export type ModeloCandidato = {
  id: string;
  feriaId?: string;
  nombre: string;
  sitio: SitioModelo;
  url: string;
  precioArchivo: number;
  licencia: EstadoLicencia;
  notas: string;
  creadoEn: string;
};

function normalizar(
  candidato: Partial<ModeloCandidato>
): ModeloCandidato {
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
      localStorage.getItem(STORAGE_KEY) || "[]";

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
  if (typeof window === "undefined") return;

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

export function guardarModeloCandidato(
  candidato: Omit<
    ModeloCandidato,
    "id" | "creadoEn"
  >
) {
  const nuevo = normalizar(candidato);

  const todos = [...leerTodos(), nuevo];
  guardarTodos(todos);

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
