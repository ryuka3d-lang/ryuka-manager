import {
  guardarBobina,
  type BobinaFilamento,
} from "./stock-service";

const COMPRAS_KEY = "ryuka-compras";
const INSUMOS_KEY = "ryuka-stock-insumos";

export type TipoItemCompra = "filamento" | "insumo";

export type Compra = {
  id: string;
  proveedor: string;
  fecha: string;
  tipo: TipoItemCompra;
  descripcion: string;
  cantidad: number;
  precioTotal: number;
  medioPago: string;
  notas: string;
  bobinasCreadas: string[];
  creadoEn: string;
};

export type NuevaCompraFilamento = {
  proveedor: string;
  fecha: string;
  cantidad: number;
  precioTotal: number;
  medioPago: string;
  notas: string;
  material: string;
  color: string;
  marca: string;
  pesoPorBobinaGramos: number;
  stockMinimoGramos: number;
};

export type NuevaCompraInsumo = {
  proveedor: string;
  fecha: string;
  cantidad: number;
  precioTotal: number;
  medioPago: string;
  notas: string;
  nombre: string;
  unidad: string;
  stockMinimo: number;
};

export type InsumoStock = {
  id: string;
  nombre: string;
  unidad: string;
  cantidadActual: number;
  stockMinimo: number;
  costoUnitarioPromedio: number;
  actualizadoEn: string;
};

function disponible() {
  return typeof window !== "undefined";
}

function leerLista<T>(key: string): T[] {
  if (!disponible()) return [];
  const datos = localStorage.getItem(key);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    return Array.isArray(parseados) ? parseados : [];
  } catch {
    return [];
  }
}

function guardarLista<T>(key: string, lista: T[]) {
  if (!disponible()) return;
  localStorage.setItem(key, JSON.stringify(lista));
}

function generarId(prefijo: string, existentes: Array<{ id: string }>) {
  const numeros = existentes.map((item) => {
    const numero = Number(item.id.replace(`${prefijo}-`, ""));
    return Number.isNaN(numero) ? 0 : numero;
  });

  const siguiente = numeros.length ? Math.max(...numeros) + 1 : 1;
  return `${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

export function obtenerCompras(): Compra[] {
  return leerLista<Compra>(COMPRAS_KEY).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

export function obtenerInsumosStock(): InsumoStock[] {
  return leerLista<InsumoStock>(INSUMOS_KEY).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );
}

export function registrarCompraFilamento(
  datos: NuevaCompraFilamento
): Compra | null {
  const cantidad = Math.max(1, Math.floor(Number(datos.cantidad) || 0));
  const peso = Number(datos.pesoPorBobinaGramos) || 0;
  const precioTotal = Number(datos.precioTotal) || 0;

  if (!datos.color.trim() || peso <= 0 || precioTotal < 0) return null;

  const compras = obtenerCompras();
  const bobinas: BobinaFilamento[] = [];
  const precioUnitario = cantidad > 0 ? precioTotal / cantidad : 0;

  for (let indice = 0; indice < cantidad; indice += 1) {
    bobinas.push(
      guardarBobina({
        material: datos.material,
        color: datos.color,
        marca: datos.marca,
        pesoInicialGramos: peso,
        pesoActualGramos: peso,
        stockMinimoGramos: Number(datos.stockMinimoGramos) || 0,
        precioCompra: precioUnitario,
        fechaCompra: datos.fecha,
      })
    );
  }

  const compra: Compra = {
    id: generarId("COM", compras),
    proveedor: datos.proveedor.trim(),
    fecha: datos.fecha,
    tipo: "filamento",
    descripcion: `${datos.material.trim().toUpperCase()} ${datos.color.trim()}${
      datos.marca.trim() ? ` · ${datos.marca.trim()}` : ""
    }`,
    cantidad,
    precioTotal,
    medioPago: datos.medioPago.trim(),
    notas: datos.notas.trim(),
    bobinasCreadas: bobinas.map((bobina) => bobina.id),
    creadoEn: new Date().toISOString(),
  };

  guardarLista(COMPRAS_KEY, [compra, ...compras]);
  return compra;
}

export function registrarCompraInsumo(
  datos: NuevaCompraInsumo
): Compra | null {
  const cantidad = Number(datos.cantidad) || 0;
  const precioTotal = Number(datos.precioTotal) || 0;
  const nombre = datos.nombre.trim();

  if (!nombre || cantidad <= 0 || precioTotal < 0) return null;

  const compras = obtenerCompras();
  const insumos = obtenerInsumosStock();
  const existente = insumos.find(
    (insumo) => insumo.nombre.toLowerCase() === nombre.toLowerCase()
  );

  const costoNuevo = precioTotal / cantidad;
  const ahora = new Date().toISOString();

  let listaActualizada: InsumoStock[];
  if (existente) {
    const valorAnterior =
      existente.cantidadActual * existente.costoUnitarioPromedio;
    const cantidadNueva = existente.cantidadActual + cantidad;
    const costoPromedio =
      cantidadNueva > 0 ? (valorAnterior + precioTotal) / cantidadNueva : 0;

    listaActualizada = insumos.map((insumo) =>
      insumo.id === existente.id
        ? {
            ...insumo,
            unidad: datos.unidad.trim() || insumo.unidad,
            cantidadActual: cantidadNueva,
            stockMinimo: Number(datos.stockMinimo) || 0,
            costoUnitarioPromedio: costoPromedio,
            actualizadoEn: ahora,
          }
        : insumo
    );
  } else {
    listaActualizada = [
      ...insumos,
      {
        id: generarId("INS", insumos),
        nombre,
        unidad: datos.unidad.trim() || "unidad",
        cantidadActual: cantidad,
        stockMinimo: Number(datos.stockMinimo) || 0,
        costoUnitarioPromedio: costoNuevo,
        actualizadoEn: ahora,
      },
    ];
  }

  guardarLista(INSUMOS_KEY, listaActualizada);

  const compra: Compra = {
    id: generarId("COM", compras),
    proveedor: datos.proveedor.trim(),
    fecha: datos.fecha,
    tipo: "insumo",
    descripcion: nombre,
    cantidad,
    precioTotal,
    medioPago: datos.medioPago.trim(),
    notas: datos.notas.trim(),
    bobinasCreadas: [],
    creadoEn: ahora,
  };

  guardarLista(COMPRAS_KEY, [compra, ...compras]);
  return compra;
}

export function eliminarCompra(id: string): boolean {
  const compras = obtenerCompras();
  const compra = compras.find((actual) => actual.id === id);
  if (!compra) return false;

  // Las compras de filamento no se revierten automáticamente para evitar
  // borrar bobinas que ya pudieron haber sido utilizadas en producción.
  guardarLista(
    COMPRAS_KEY,
    compras.filter((actual) => actual.id !== id)
  );
  return true;
}
