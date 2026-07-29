import type { Accesorio } from "../app/types/producto";
import { createClient } from "./supabase/client";
import { obtenerWorkspaceId } from "./workspace-service";

const STORAGE_KEY = "ryuka-presupuestos";
const MIGRATION_KEY = "ryuka-budgets-relational-migrated-v1";

export type TipoVenta = "mayorista" | "minorista";
export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "rechazado" | "vencido";

export type PresupuestoGuardado = {
  id: string; creadoEn: string; actualizadoEn: string;
  clienteId?: string; cliente: string;
  productoId: string; productoCodigo: string; productoNombre: string; cantidad: number;
  estado: EstadoPresupuesto; validoHasta: string | null; notas: string;
  horasImpresionDia: number; diasProduccion: number; tiempoTotalMinutos: number;
  trabajoManualMinutos: number; pesoTotalGramos: number; kilosFilamento: number;
  accesorios: Accesorio[]; costoTotal: number; costoPorUnidad: number;
  precioMayoristaUnitario: number; precioMayoristaTotal: number; gananciaMayorista: number;
  precioMinoristaUnitario: number; precioMinoristaTotal: number; gananciaMinorista: number;
};

export type NuevoPresupuesto = Omit<PresupuestoGuardado, "id" | "creadoEn" | "actualizadoEn" | "estado" | "validoHasta" | "notas"> &
  Partial<Pick<PresupuestoGuardado, "estado" | "validoHasta" | "notas">>;

type BudgetRow = {
  code: string; customer_id: string | null; customer_name_snapshot: string; status: EstadoPresupuesto;
  valid_until: string | null; notes: string; total_cost: number | string; created_at: string; updated_at: string;
  budget_items?: BudgetItemRow[];
};
type BudgetItemRow = {
  product_id: string | null; product_code_snapshot: string; product_name_snapshot: string; quantity: number;
  hours_per_day: number; production_days: number | string; total_print_minutes: number;
  manual_minutes: number; total_weight_grams: number | string; filament_kilos: number | string;
  accessories: Accesorio[] | null; unit_cost: number | string; total_cost: number | string;
  wholesale_unit_price: number | string; wholesale_total: number | string; wholesale_profit: number | string;
  retail_unit_price: number | string; retail_total: number | string; retail_profit: number | string;
};

function normalizar(p: Partial<PresupuestoGuardado>): PresupuestoGuardado {
  const ahora = new Date().toISOString();
  return {
    id: p.id || "PRE-0000", creadoEn: p.creadoEn || ahora, actualizadoEn: p.actualizadoEn || ahora,
    clienteId: p.clienteId, cliente: p.cliente || "", productoId: p.productoId || "", productoCodigo: p.productoCodigo || "", productoNombre: p.productoNombre || "",
    cantidad: Number(p.cantidad)||0, estado: p.estado || "borrador", validoHasta: p.validoHasta || null, notas: p.notas || "",
    horasImpresionDia: Number(p.horasImpresionDia)||0, diasProduccion: Number(p.diasProduccion)||0,
    tiempoTotalMinutos: Number(p.tiempoTotalMinutos)||0, trabajoManualMinutos: Number(p.trabajoManualMinutos)||0,
    pesoTotalGramos: Number(p.pesoTotalGramos)||0, kilosFilamento: Number(p.kilosFilamento)||0,
    accesorios: Array.isArray(p.accesorios) ? p.accesorios : [], costoTotal: Number(p.costoTotal)||0,
    costoPorUnidad: Number(p.costoPorUnidad)||0, precioMayoristaUnitario: Number(p.precioMayoristaUnitario)||0,
    precioMayoristaTotal: Number(p.precioMayoristaTotal)||0, gananciaMayorista: Number(p.gananciaMayorista)||0,
    precioMinoristaUnitario: Number(p.precioMinoristaUnitario)||0, precioMinoristaTotal: Number(p.precioMinoristaTotal)||0,
    gananciaMinorista: Number(p.gananciaMinorista)||0,
  };
}

function leerCache(): PresupuestoGuardado[] {
  if (typeof window === "undefined") return [];
  try { const p = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(p)?p.map(normalizar):[]; } catch { return []; }
}
function guardarCache(lista: PresupuestoGuardado[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  window.dispatchEvent(new CustomEvent("ryuka-budgets-updated"));
}
export function obtenerPresupuestos() { return leerCache(); }

function convertirFila(row: BudgetRow): PresupuestoGuardado {
  const i = row.budget_items?.[0];
  return normalizar({
    id: row.code, clienteId: row.customer_id || undefined, cliente: row.customer_name_snapshot,
    estado: row.status, validoHasta: row.valid_until, notas: row.notes,
    productoId: i?.product_id || "", productoCodigo: i?.product_code_snapshot || "", productoNombre: i?.product_name_snapshot || "", cantidad: i?.quantity || 0,
    horasImpresionDia: i?.hours_per_day || 0, diasProduccion: Number(i?.production_days)||0,
    tiempoTotalMinutos: i?.total_print_minutes || 0, trabajoManualMinutos: i?.manual_minutes || 0,
    pesoTotalGramos: Number(i?.total_weight_grams)||0, kilosFilamento: Number(i?.filament_kilos)||0,
    accesorios: i?.accessories || [], costoTotal: Number(i?.total_cost ?? row.total_cost)||0,
    costoPorUnidad: Number(i?.unit_cost)||0, precioMayoristaUnitario: Number(i?.wholesale_unit_price)||0,
    precioMayoristaTotal: Number(i?.wholesale_total)||0, gananciaMayorista: Number(i?.wholesale_profit)||0,
    precioMinoristaUnitario: Number(i?.retail_unit_price)||0, precioMinoristaTotal: Number(i?.retail_total)||0,
    gananciaMinorista: Number(i?.retail_profit)||0, creadoEn: row.created_at, actualizadoEn: row.updated_at,
  });
}

async function leerNube(workspaceId: string) {
  const { data, error } = await createClient().from("budgets").select(`
    code,customer_id,customer_name_snapshot,status,valid_until,notes,total_cost,created_at,updated_at,
    budget_items(product_id,product_code_snapshot,product_name_snapshot,quantity,hours_per_day,production_days,total_print_minutes,manual_minutes,total_weight_grams,filament_kilos,accessories,unit_cost,total_cost,wholesale_unit_price,wholesale_total,wholesale_profit,retail_unit_price,retail_total,retail_profit)
  `).eq("workspace_id", workspaceId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data||[]) as BudgetRow[]).map(convertirFila);
}

async function resolverCustomerId(workspaceId: string, nombre: string, clienteId?: string) {
  const supabase = createClient();
  if (clienteId) {
    const { data } = await supabase.from("customers").select("id").eq("workspace_id", workspaceId).eq("code", clienteId).maybeSingle();
    if (data) return data.id as string;
  }
  const { data: existing } = await supabase.from("customers").select("id,code").eq("workspace_id", workspaceId).ilike("first_name", nombre.trim()).limit(1).maybeSingle();
  if (existing) return existing.id as string;
  const { data: code, error: codeError } = await supabase.rpc("next_customer_code", { p_workspace_id: workspaceId });
  if (codeError || !code) throw new Error(codeError?.message || "No se pudo crear el cliente del presupuesto.");
  const { data, error } = await supabase.from("customers").insert({ workspace_id: workspaceId, code, first_name: nombre.trim() }).select("id").single();
  if (error || !data) throw new Error(error?.message || "No se pudo crear el cliente.");
  return data.id as string;
}

async function resolverProductId(workspaceId: string, productId: string, productCode: string) {
  const supabase = createClient();

  if (productId && !productId.startsWith("RYK-")) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("id", productId)
      .maybeSingle();
    if (data) return data.id as string;
  }

  const code = productCode || (productId.startsWith("RYK-") ? productId : "");
  if (!code) return null;

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.id as string | undefined) || null;
}

async function upsertPresupuesto(workspaceId: string, presupuesto: NuevoPresupuesto | PresupuestoGuardado, code?: string) {
  const supabase = createClient(); let codigo = code;
  if (!codigo) {
    const { data, error } = await supabase.rpc("next_budget_code", { p_workspace_id: workspaceId });
    if (error || !data) throw new Error(error?.message || "No se pudo generar el código del presupuesto.");
    codigo = data as string;
  }
  const customerUuid = await resolverCustomerId(workspaceId, presupuesto.cliente, presupuesto.clienteId);
  const productUuid = await resolverProductId(workspaceId, presupuesto.productoId, presupuesto.productoCodigo);
  const { data: parent, error: parentError } = await supabase.from("budgets").upsert({
    workspace_id: workspaceId, code: codigo, customer_id: customerUuid, customer_name_snapshot: presupuesto.cliente.trim(),
    status: presupuesto.estado || "borrador", valid_until: presupuesto.validoHasta || null, notes: presupuesto.notas || "",
    total_cost: presupuesto.costoTotal, wholesale_total: presupuesto.precioMayoristaTotal,
    retail_total: presupuesto.precioMinoristaTotal, updated_at: new Date().toISOString(),
  }, { onConflict: "workspace_id,code" }).select("id").single();
  if (parentError || !parent) throw new Error(parentError?.message || "No se pudo guardar el presupuesto.");
  await supabase.from("budget_items").delete().eq("budget_id", parent.id);
  const { error: itemError } = await supabase.from("budget_items").insert({
    budget_id: parent.id, position: 0, product_id: productUuid, product_code_snapshot: presupuesto.productoCodigo || presupuesto.productoId,
    product_name_snapshot: presupuesto.productoNombre, quantity: presupuesto.cantidad,
    hours_per_day: presupuesto.horasImpresionDia, production_days: presupuesto.diasProduccion,
    total_print_minutes: presupuesto.tiempoTotalMinutos, manual_minutes: presupuesto.trabajoManualMinutos,
    total_weight_grams: presupuesto.pesoTotalGramos, filament_kilos: presupuesto.kilosFilamento,
    accessories: presupuesto.accesorios, unit_cost: presupuesto.costoPorUnidad, total_cost: presupuesto.costoTotal,
    wholesale_unit_price: presupuesto.precioMayoristaUnitario, wholesale_total: presupuesto.precioMayoristaTotal,
    wholesale_profit: presupuesto.gananciaMayorista, retail_unit_price: presupuesto.precioMinoristaUnitario,
    retail_total: presupuesto.precioMinoristaTotal, retail_profit: presupuesto.gananciaMinorista,
  });
  if (itemError) throw new Error(itemError.message);
  const todos = await leerNube(workspaceId); guardarCache(todos); return todos.find((p)=>p.id===codigo)!;
}

async function migrarLocales(workspaceId: string) {
  if (typeof window === "undefined" || localStorage.getItem(MIGRATION_KEY)==="1") return;
  const locales = leerCache(); const remotos = await leerNube(workspaceId); const codes = new Set(remotos.map(p=>p.id));
  for (const local of locales) if (!codes.has(local.id)) await upsertPresupuesto(workspaceId, local, local.id.replace(/^PRES-/, "PRE-"));
  localStorage.setItem(MIGRATION_KEY,"1");
}

export async function cargarPresupuestosDesdeNube() {
  const workspaceId = await obtenerWorkspaceId(); await migrarLocales(workspaceId);
  const todos = await leerNube(workspaceId); guardarCache(todos); return todos;
}
export async function guardarPresupuesto(p: NuevoPresupuesto) { return upsertPresupuesto(await obtenerWorkspaceId(), p); }
export async function actualizarEstadoPresupuesto(id: string, estado: EstadoPresupuesto) {
  const workspaceId = await obtenerWorkspaceId(); const supabase = createClient();
  const { error } = await supabase.from("budgets").update({ status: estado, updated_at: new Date().toISOString() }).eq("workspace_id", workspaceId).eq("code", id);
  if (error) throw new Error(error.message); const todos = await leerNube(workspaceId); guardarCache(todos); return todos.find(p=>p.id===id) || null;
}
export async function eliminarPresupuesto(id: string) {
  const workspaceId = await obtenerWorkspaceId(); const { error, count } = await createClient().from("budgets").delete({ count: "exact" }).eq("workspace_id",workspaceId).eq("code",id);
  if (error) throw new Error(error.message); if (!count) return false; guardarCache(leerCache().filter(p=>p.id!==id)); return true;
}
export async function suscribirseAPresupuestos(onChange:(p:PresupuestoGuardado[])=>void) {
  const workspaceId=await obtenerWorkspaceId(); const supabase=createClient();
  const channel=supabase.channel(`budgets-${workspaceId}`).on("postgres_changes",{event:"*",schema:"public",table:"budgets",filter:`workspace_id=eq.${workspaceId}`},async()=>{const p=await leerNube(workspaceId);guardarCache(p);onChange(p);}).subscribe();
  return ()=>{void supabase.removeChannel(channel);};
}

export type SaleType = "wholesale" | "retail" | "custom";

export type ConvertBudgetToOrderParams = {
  workspaceId?: string;
  budgetCode: string;
  saleType: SaleType;
  customTotal?: number | null;
};

export type ConvertBudgetToOrderResult = {
  created: boolean;
  budgetCode: string;
  orderId?: string;
  orderCode: string;
  productionOrderId?: string;
  productionCode: string | null;
};

export async function convertBudgetToOrder({
  workspaceId,
  budgetCode,
  saleType,
  customTotal = null,
}: ConvertBudgetToOrderParams): Promise<ConvertBudgetToOrderResult> {
  const resolvedWorkspaceId = workspaceId ?? (await obtenerWorkspaceId());
  const supabase = createClient();

  const normalizedCustomTotal =
    saleType === "custom"
      ? Math.max(0, Number(customTotal) || 0)
      : null;

  if (saleType === "custom" && customTotal === null) {
    throw new Error("Ingresá el total personalizado del pedido.");
  }

  const { data, error } = await supabase.rpc(
    "convert_budget_to_order",
    {
      p_workspace_id: resolvedWorkspaceId,
      p_budget_code: budgetCode,
      p_sale_type: saleType,
      p_custom_total: normalizedCustomTotal,
    }
  );

  if (error) {
    console.error("Error al convertir el presupuesto:", error);

    throw new Error(
      `No se pudo convertir el presupuesto: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "La conversión no devolvió ningún resultado."
    );
  }

  const result = data as Partial<ConvertBudgetToOrderResult>;

  if (!result.orderCode) {
    throw new Error(
      "La conversión terminó, pero no devolvió el código del pedido."
    );
  }

  const presupuestos = await leerNube(resolvedWorkspaceId);
  guardarCache(presupuestos);

  return {
    created: Boolean(result.created),
    budgetCode: result.budgetCode ?? budgetCode,
    orderId: result.orderId,
    orderCode: result.orderCode,
    productionOrderId: result.productionOrderId,
    productionCode: result.productionCode ?? null,
  };
}
