import type { Producto } from "../app/types/producto";
import { createClient } from "./supabase/client";

const STORAGE_KEY = "ryuka-productos";
const MIGRATION_KEY = "ryuka-products-relational-migrated-v1";

export type ProductoGuardado = Producto & {
  /** UUID interno de Supabase. */
  id: string;
  /** Código visible para el usuario, por ejemplo RYK-0001. */
  codigo: string;
  creadoEn: string;
  actualizadoEn: string;
};

type ProductRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  quantity_per_bed: number;
  weight_per_bed: number | string;
  colors: number;
  print_hours: number;
  print_minutes: number;
  manual_hours: number;
  manual_minutes: number;
  created_at: string;
  updated_at: string;
  product_materials?: MaterialRow[];
  product_accessories?: AccessoryRow[];
};

type MaterialRow = {
  id: string;
  position: number;
  material: string;
  color: string;
  grams_per_bed: number | string;
};

type AccessoryRow = {
  id: string;
  accessory_key: string;
  position: number;
  name: string;
  active: boolean;
  mode: "porUnidad" | "porPedido";
  quantity: number | string;
};

function normalizarProducto(producto: Partial<ProductoGuardado>): ProductoGuardado {
  const ahora = new Date().toISOString();

  return {
    id: producto.id && !producto.id.startsWith("RYK-") ? producto.id : "",
    codigo: producto.codigo || (producto.id?.startsWith("RYK-") ? producto.id : "RYK-0000"),
    nombre: producto.nombre || "",
    categoria: producto.categoria || "",
    descripcion: producto.descripcion || "",
    cantidadPorCama: producto.cantidadPorCama || "",
    pesoPorCama: producto.pesoPorCama || "",
    colores: producto.colores || "",
    horas: producto.horas || "",
    minutos: producto.minutos || "",
    horasTrabajoManualPorCama: producto.horasTrabajoManualPorCama || "",
    minutosTrabajoManualPorCama: producto.minutosTrabajoManualPorCama || "",
    materiales: Array.isArray(producto.materiales)
      ? producto.materiales.map((material, indice) => ({
          id: material.id || `material-${indice}`,
          material: material.material || "PLA",
          color: material.color || "",
          gramosPorCama: material.gramosPorCama || "0",
        }))
      : [],
    accesorios: Array.isArray(producto.accesorios)
      ? producto.accesorios.map((accesorio) => ({
          id: accesorio.id || "",
          nombre: accesorio.nombre || "",
          activo: Boolean(accesorio.activo),
          modo: accesorio.modo === "porPedido" ? "porPedido" : "porUnidad",
          cantidad: accesorio.cantidad || "0",
        }))
      : [],
    creadoEn: producto.creadoEn || ahora,
    actualizadoEn: producto.actualizadoEn || ahora,
  };
}

function leerCache(): ProductoGuardado[] {
  if (typeof window === "undefined") return [];

  const guardado = localStorage.getItem(STORAGE_KEY);
  if (!guardado) return [];

  try {
    const datos = JSON.parse(guardado);
    return Array.isArray(datos) ? datos.map(normalizarProducto) : [];
  } catch {
    return [];
  }
}

function guardarCache(productos: ProductoGuardado[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
  window.dispatchEvent(new CustomEvent("ryuka-products-updated"));
}

export function obtenerProductos(): ProductoGuardado[] {
  return leerCache();
}

async function obtenerWorkspaceId(): Promise<string> {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("No hay una sesión iniciada.");
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    throw new Error("No se encontró el taller del usuario.");
  }

  return membership.workspace_id;
}

function convertirFila(row: ProductRow): ProductoGuardado {
  const materiales = [...(row.product_materials ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const accesorios = [...(row.product_accessories ?? [])].sort(
    (a, b) => a.position - b.position
  );

  return normalizarProducto({
    id: row.id,
    codigo: row.code,
    nombre: row.name,
    categoria: row.category,
    descripcion: row.description,
    cantidadPorCama: String(row.quantity_per_bed),
    pesoPorCama: String(row.weight_per_bed),
    colores: String(row.colors),
    horas: String(row.print_hours),
    minutos: String(row.print_minutes),
    horasTrabajoManualPorCama: String(row.manual_hours),
    minutosTrabajoManualPorCama: String(row.manual_minutes),
    materiales: materiales.map((material) => ({
      id: material.id,
      material: material.material,
      color: material.color,
      gramosPorCama: String(material.grams_per_bed),
    })),
    accesorios: accesorios.map((accesorio) => ({
      id: accesorio.accessory_key,
      nombre: accesorio.name,
      activo: accesorio.active,
      modo: accesorio.mode,
      cantidad: String(accesorio.quantity),
    })),
    creadoEn: row.created_at,
    actualizadoEn: row.updated_at,
  });
}

async function leerProductosNube(workspaceId: string): Promise<ProductoGuardado[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, code, name, category, description,
      quantity_per_bed, weight_per_bed, colors,
      print_hours, print_minutes, manual_hours, manual_minutes,
      created_at, updated_at,
      product_materials(id, position, material, color, grams_per_bed),
      product_accessories(id, accessory_key, position, name, active, mode, quantity)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(convertirFila);
}

async function upsertProducto(
  workspaceId: string,
  producto: Producto,
  code?: string
): Promise<ProductoGuardado> {
  const supabase = createClient();
  let codigo = code;

  if (!codigo) {
    const { data, error } = await supabase.rpc("next_product_code", {
      p_workspace_id: workspaceId,
    });
    if (error || !data) throw new Error(error?.message || "No se pudo generar el código.");
    codigo = data as string;
  }

  const ahora = new Date().toISOString();
  const { data: parent, error: parentError } = await supabase
    .from("products")
    .upsert(
      {
        workspace_id: workspaceId,
        code: codigo,
        name: producto.nombre.trim(),
        category: producto.categoria.trim(),
        description: producto.descripcion.trim(),
        quantity_per_bed: Math.max(1, Number(producto.cantidadPorCama) || 1),
        weight_per_bed: Math.max(0, Number(producto.pesoPorCama) || 0),
        colors: Math.max(0, Math.trunc(Number(producto.colores) || 0)),
        print_hours: Math.max(0, Math.trunc(Number(producto.horas) || 0)),
        print_minutes: Math.min(59, Math.max(0, Math.trunc(Number(producto.minutos) || 0))),
        manual_hours: Math.max(0, Math.trunc(Number(producto.horasTrabajoManualPorCama) || 0)),
        manual_minutes: Math.min(59, Math.max(0, Math.trunc(Number(producto.minutosTrabajoManualPorCama) || 0))),
        updated_at: ahora,
      },
      { onConflict: "workspace_id,code" }
    )
    .select("id")
    .single();

  if (parentError || !parent) throw new Error(parentError?.message || "No se pudo guardar el producto.");

  const productId = parent.id as string;
  const [{ error: materialsDeleteError }, { error: accessoriesDeleteError }] = await Promise.all([
    supabase.from("product_materials").delete().eq("product_id", productId),
    supabase.from("product_accessories").delete().eq("product_id", productId),
  ]);

  if (materialsDeleteError) throw new Error(materialsDeleteError.message);
  if (accessoriesDeleteError) throw new Error(accessoriesDeleteError.message);

  if (producto.materiales.length > 0) {
    const { error } = await supabase.from("product_materials").insert(
      producto.materiales.map((material, position) => ({
        product_id: productId,
        position,
        material: material.material.trim() || "PLA",
        color: material.color.trim(),
        grams_per_bed: Math.max(0, Number(material.gramosPorCama) || 0),
      }))
    );
    if (error) throw new Error(error.message);
  }

  if (producto.accesorios.length > 0) {
    const { error } = await supabase.from("product_accessories").insert(
      producto.accesorios.map((accesorio, position) => ({
        product_id: productId,
        accessory_key: accesorio.id || `accesorio-${position}`,
        position,
        name: accesorio.nombre.trim(),
        active: accesorio.activo,
        mode: accesorio.modo,
        quantity: Math.max(0, Number(accesorio.cantidad) || 0),
      }))
    );
    if (error) throw new Error(error.message);
  }

  const todos = await leerProductosNube(workspaceId);
  guardarCache(todos);
  const guardado = todos.find((actual) => actual.codigo === codigo);
  if (!guardado) throw new Error("El producto se guardó pero no se pudo volver a cargar.");
  return guardado;
}

async function migrarProductosLocales(workspaceId: string) {
  if (typeof window === "undefined" || localStorage.getItem(MIGRATION_KEY) === "1") return;

  const locales = leerCache();
  if (locales.length === 0) {
    localStorage.setItem(MIGRATION_KEY, "1");
    return;
  }

  const remotos = await leerProductosNube(workspaceId);
  const codigosRemotos = new Set(remotos.map((producto) => producto.codigo));

  for (const producto of locales) {
    const codigoLocal = producto.codigo || (producto.id.startsWith("RYK-") ? producto.id : undefined);
    if (!codigoLocal || !codigosRemotos.has(codigoLocal)) {
      await upsertProducto(workspaceId, producto, codigoLocal);
    }
  }

  localStorage.setItem(MIGRATION_KEY, "1");
}

export async function cargarProductosDesdeNube(): Promise<ProductoGuardado[]> {
  const workspaceId = await obtenerWorkspaceId();
  await migrarProductosLocales(workspaceId);
  const productos = await leerProductosNube(workspaceId);
  guardarCache(productos);
  return productos;
}

export async function guardarProducto(producto: Producto): Promise<ProductoGuardado> {
  return upsertProducto(await obtenerWorkspaceId(), producto);
}

export async function editarProducto(
  id: string,
  cambios: Producto
): Promise<ProductoGuardado | null> {
  const existentes = await cargarProductosDesdeNube();
  const existente = existentes.find((producto) => producto.id === id);
  if (!existente) return null;
  return upsertProducto(await obtenerWorkspaceId(), cambios, existente.codigo);
}

export async function eliminarProducto(id: string): Promise<boolean> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();
  const { data: producto, error: findError } = await supabase
    .from("products")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!producto) return false;

  const { error } = await supabase.from("products").delete().eq("id", producto.id);
  if (error) throw new Error(error.message);

  guardarCache(leerCache().filter((actual) => actual.id !== id));
  return true;
}

export async function suscribirseAProductos(
  onChange: (productos: ProductoGuardado[]) => void
): Promise<() => void> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const recargar = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        onChange(await cargarProductosDesdeNube());
      } catch (error) {
        console.error("No se pudieron actualizar los productos:", error);
      }
    }, 250);
  };

  const channel = supabase
    .channel(`ryuka-products-${workspaceId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products", filter: `workspace_id=eq.${workspaceId}` },
      recargar
    )
    .subscribe();

  return () => {
    if (timer) clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
