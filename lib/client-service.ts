import { createClient } from "./supabase/client";
import { obtenerWorkspaceId } from "./workspace-service";
import { obtenerPresupuestos, type PresupuestoGuardado } from "./budget-service";

const STORAGE_KEY = "ryuka-clientes";
const MIGRATION_KEY = "ryuka-customers-relational-migrated-v1";

export type EstadoCliente = "activo" | "inactivo";

export type ClienteGuardado = {
  id: string;
  nombre: string;
  apellido: string;
  empresa: string;
  cuit: string;
  telefono: string;
  email: string;
  instagram: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  notas: string;
  estado: EstadoCliente;
  creadoEn: string;
  actualizadoEn: string;
};

export type NuevoCliente = Omit<ClienteGuardado, "id" | "creadoEn" | "actualizadoEn">;
export type ResumenCliente = ClienteGuardado & {
  cantidadPresupuestos: number;
  totalMayoristaPresupuestado: number;
  totalMinoristaPresupuestado: number;
  ultimaActividad: string | null;
  productos: string[];
};

type CustomerRow = {
  code: string; first_name: string; last_name: string; company: string; tax_id: string;
  phone: string; email: string; instagram: string; address: string; city: string;
  province: string; notes: string; status: EstadoCliente; created_at: string; updated_at: string;
};

function normalizarTexto(valor: string) {
  return valor.trim().toLocaleLowerCase("es-AR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarCliente(cliente: Partial<ClienteGuardado>): ClienteGuardado {
  const ahora = new Date().toISOString();
  return {
    id: cliente.id || "CLI-0000", nombre: cliente.nombre || "", apellido: cliente.apellido || "",
    empresa: cliente.empresa || "", cuit: cliente.cuit || "", telefono: cliente.telefono || "",
    email: cliente.email || "", instagram: cliente.instagram || "", direccion: cliente.direccion || "",
    ciudad: cliente.ciudad || "", provincia: cliente.provincia || "", notas: cliente.notas || "",
    estado: cliente.estado === "inactivo" ? "inactivo" : "activo",
    creadoEn: cliente.creadoEn || ahora, actualizadoEn: cliente.actualizadoEn || ahora,
  };
}

function leerCache(): ClienteGuardado[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizarCliente) : [];
  } catch { return []; }
}

function guardarCache(clientes: ClienteGuardado[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  window.dispatchEvent(new CustomEvent("ryuka-customers-updated"));
}

export function obtenerClientes() { return leerCache(); }
export function obtenerClientePorId(id: string) { return leerCache().find((c) => c.id === id); }

function convertirFila(row: CustomerRow): ClienteGuardado {
  return normalizarCliente({
    id: row.code, nombre: row.first_name, apellido: row.last_name, empresa: row.company,
    cuit: row.tax_id, telefono: row.phone, email: row.email, instagram: row.instagram,
    direccion: row.address, ciudad: row.city, provincia: row.province, notas: row.notes,
    estado: row.status, creadoEn: row.created_at, actualizadoEn: row.updated_at,
  });
}

async function leerClientesNube(workspaceId: string) {
  const { data, error } = await createClient().from("customers")
    .select("code,first_name,last_name,company,tax_id,phone,email,instagram,address,city,province,notes,status,created_at,updated_at")
    .eq("workspace_id", workspaceId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data || []) as CustomerRow[]).map(convertirFila);
}

async function upsertCliente(workspaceId: string, cliente: Partial<NuevoCliente>, code?: string) {
  const supabase = createClient();
  let codigo = code;
  if (!codigo) {
    const { data, error } = await supabase.rpc("next_customer_code", { p_workspace_id: workspaceId });
    if (error || !data) throw new Error(error?.message || "No se pudo generar el código del cliente.");
    codigo = data as string;
  }
  const normalizado = normalizarCliente({ ...cliente, id: codigo });
  const { error } = await supabase.from("customers").upsert({
    workspace_id: workspaceId, code: codigo, first_name: normalizado.nombre.trim(),
    last_name: normalizado.apellido.trim(), company: normalizado.empresa.trim(), tax_id: normalizado.cuit.trim(),
    phone: normalizado.telefono.trim(), email: normalizado.email.trim(), instagram: normalizado.instagram.trim(),
    address: normalizado.direccion.trim(), city: normalizado.ciudad.trim(), province: normalizado.provincia.trim(),
    notes: normalizado.notas.trim(), status: normalizado.estado, updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id,code" });
  if (error) throw new Error(error.message);
  const todos = await leerClientesNube(workspaceId); guardarCache(todos);
  return todos.find((c) => c.id === codigo)!;
}

async function migrarLocales(workspaceId: string) {
  if (typeof window === "undefined" || localStorage.getItem(MIGRATION_KEY) === "1") return;
  const locales = leerCache();
  const remotos = await leerClientesNube(workspaceId);
  const codigos = new Set(remotos.map((c) => c.id));
  for (const local of locales) if (!codigos.has(local.id)) await upsertCliente(workspaceId, local, local.id);
  localStorage.setItem(MIGRATION_KEY, "1");
}

export async function cargarClientesDesdeNube() {
  const workspaceId = await obtenerWorkspaceId(); await migrarLocales(workspaceId);
  const clientes = await leerClientesNube(workspaceId); guardarCache(clientes); return clientes;
}

export async function guardarCliente(cliente: Partial<NuevoCliente>) {
  return upsertCliente(await obtenerWorkspaceId(), cliente);
}

export async function actualizarCliente(id: string, cambios: Partial<NuevoCliente>) {
  const actual = obtenerClientePorId(id); if (!actual) return null;
  return upsertCliente(await obtenerWorkspaceId(), { ...actual, ...cambios }, id);
}

export async function eliminarCliente(id: string) {
  const workspaceId = await obtenerWorkspaceId(); const supabase = createClient();
  const { data: customer, error: findError } = await supabase.from("customers").select("id")
    .eq("workspace_id", workspaceId).eq("code", id).maybeSingle();
  if (findError) throw new Error(findError.message); if (!customer) return false;
  const { count } = await supabase.from("budgets").select("id", { count: "exact", head: true }).eq("customer_id", customer.id);
  if ((count || 0) > 0) return false;
  const { error } = await supabase.from("customers").delete().eq("id", customer.id);
  if (error) throw new Error(error.message);
  guardarCache(leerCache().filter((c) => c.id !== id)); return true;
}

export function obtenerResumenesClientes(): ResumenCliente[] {
  const presupuestos = obtenerPresupuestos();
  return leerCache().map((cliente) => {
    const propios = presupuestos.filter((p) => p.clienteId === cliente.id || normalizarTexto(p.cliente) === normalizarTexto(`${cliente.nombre} ${cliente.apellido}`.trim()));
    return {
      ...cliente, cantidadPresupuestos: propios.length,
      totalMayoristaPresupuestado: propios.reduce((t,p)=>t+p.precioMayoristaTotal,0),
      totalMinoristaPresupuestado: propios.reduce((t,p)=>t+p.precioMinoristaTotal,0),
      ultimaActividad: propios.length ? propios.map(p=>p.actualizadoEn).sort().at(-1)! : null,
      productos: Array.from(new Set(propios.map(p=>p.productoNombre))),
    };
  }).sort((a,b)=>new Date(b.ultimaActividad || b.actualizadoEn).getTime()-new Date(a.ultimaActividad || a.actualizadoEn).getTime());
}

export function obtenerPresupuestosDeCliente(nombreOId: string): PresupuestoGuardado[] {
  const clave = normalizarTexto(nombreOId);
  return obtenerPresupuestos().filter((p)=>p.clienteId===nombreOId || normalizarTexto(p.cliente)===clave)
    .sort((a,b)=>new Date(b.creadoEn).getTime()-new Date(a.creadoEn).getTime());
}

export async function suscribirseAClientes(onChange: (clientes: ClienteGuardado[]) => void) {
  const workspaceId = await obtenerWorkspaceId(); const supabase = createClient();
  const channel = supabase.channel(`customers-${workspaceId}`).on("postgres_changes", { event: "*", schema: "public", table: "customers", filter: `workspace_id=eq.${workspaceId}` }, async () => {
    const clientes = await leerClientesNube(workspaceId); guardarCache(clientes); onChange(clientes);
  }).subscribe();
  return () => { void supabase.removeChannel(channel); };
}
