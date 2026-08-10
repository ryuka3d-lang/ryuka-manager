import type { Accesorio } from "../app/types/producto";
import { createClient } from "./supabase/client";
import { obtenerWorkspaceId } from "./workspace-service";

const STORAGE_KEY = "ryuka-presupuestos";
const MIGRATION_KEY = "ryuka-budgets-relational-migrated-v1";

export type TipoVenta = "mayorista" | "minorista";
export type EstadoPresupuesto =
  | "borrador"
  | "enviado"
  | "aceptado"
  | "rechazado"
  | "vencido";

export type PresupuestoItemGuardado = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;

  hoursPerDay: number;
  productionDays: number;
  totalPrintMinutes: number;
  manualMinutes: number;

  totalWeightGrams: number;
  filamentKilos: number;

  accessories: Accesorio[];

  unitCost: number;
  totalCost: number;

  wholesaleUnitPrice: number;
  wholesaleTotal: number;
  wholesaleProfit: number;

  retailUnitPrice: number;
  retailTotal: number;
  retailProfit: number;
};

export type PresupuestoGuardado = {
  id: string;
  creadoEn: string;
  actualizadoEn: string;

  clienteId?: string;
  cliente: string;

  items: PresupuestoItemGuardado[];

  // Compatibilidad con componentes y presupuestos anteriores.
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;

  estado: EstadoPresupuesto;
  validoHasta: string | null;
  notas: string;

  horasImpresionDia: number;
  diasProduccion: number;
  tiempoTotalMinutos: number;
  trabajoManualMinutos: number;
  pesoTotalGramos: number;
  kilosFilamento: number;

  accesorios: Accesorio[];

  costoTotal: number;
  costoPorUnidad: number;

  precioMayoristaUnitario: number;
  precioMayoristaTotal: number;
  gananciaMayorista: number;

  precioMinoristaUnitario: number;
  precioMinoristaTotal: number;
  gananciaMinorista: number;
};

export type NuevoPresupuesto =
  Omit<
    PresupuestoGuardado,
    | "id"
    | "creadoEn"
    | "actualizadoEn"
    | "estado"
    | "validoHasta"
    | "notas"
  > &
  Partial<
    Pick<
      PresupuestoGuardado,
      "estado" | "validoHasta" | "notas"
    >
  >;

type BudgetRow = {
  code: string;
  customer_id: string | null;
  customer_name_snapshot: string;
  status: EstadoPresupuesto;
  valid_until: string | null;
  notes: string;
  total_cost: number | string;
  created_at: string;
  updated_at: string;
  budget_items?: BudgetItemRow[];
};

type BudgetItemRow = {
  position: number;
  product_id: string | null;
  product_code_snapshot: string;
  product_name_snapshot: string;
  quantity: number;
  hours_per_day: number;
  production_days: number | string;
  total_print_minutes: number;
  manual_minutes: number;
  total_weight_grams: number | string;
  filament_kilos: number | string;
  accessories: Accesorio[] | null;
  unit_cost: number | string;
  total_cost: number | string;
  wholesale_unit_price: number | string;
  wholesale_total: number | string;
  wholesale_profit: number | string;
  retail_unit_price: number | string;
  retail_total: number | string;
  retail_profit: number | string;
};

function crearItemLegado(
  p: Partial<PresupuestoGuardado>
): PresupuestoItemGuardado | null {
  const tieneProducto =
    Boolean(p.productoId) ||
    Boolean(p.productoCodigo) ||
    Boolean(p.productoNombre) ||
    Number(p.cantidad) > 0;

  if (!tieneProducto) return null;

  return {
    productId: p.productoId || "",
    productCode: p.productoCodigo || "",
    productName: p.productoNombre || "",
    quantity: Number(p.cantidad) || 0,

    hoursPerDay: Number(p.horasImpresionDia) || 0,
    productionDays: Number(p.diasProduccion) || 0,
    totalPrintMinutes: Number(p.tiempoTotalMinutos) || 0,
    manualMinutes: Number(p.trabajoManualMinutos) || 0,

    totalWeightGrams: Number(p.pesoTotalGramos) || 0,
    filamentKilos: Number(p.kilosFilamento) || 0,

    accessories: Array.isArray(p.accesorios)
      ? p.accesorios
      : [],

    unitCost: Number(p.costoPorUnidad) || 0,
    totalCost: Number(p.costoTotal) || 0,

    wholesaleUnitPrice:
      Number(p.precioMayoristaUnitario) || 0,
    wholesaleTotal: Number(p.precioMayoristaTotal) || 0,
    wholesaleProfit: Number(p.gananciaMayorista) || 0,

    retailUnitPrice:
      Number(p.precioMinoristaUnitario) || 0,
    retailTotal: Number(p.precioMinoristaTotal) || 0,
    retailProfit: Number(p.gananciaMinorista) || 0,
  };
}

function normalizar(
  p: Partial<PresupuestoGuardado>
): PresupuestoGuardado {
  const ahora = new Date().toISOString();
  const itemLegado = crearItemLegado(p);

  const items =
    Array.isArray(p.items) && p.items.length > 0
      ? p.items
      : itemLegado
        ? [itemLegado]
        : [];

  const primerItem = items[0];

  const costoTotalItems = items.reduce(
    (total, item) => total + Number(item.totalCost || 0),
    0
  );

  const mayoristaTotalItems = items.reduce(
    (total, item) =>
      total + Number(item.wholesaleTotal || 0),
    0
  );

  const minoristaTotalItems = items.reduce(
    (total, item) =>
      total + Number(item.retailTotal || 0),
    0
  );

  return {
    id: p.id || "PRE-0000",
    creadoEn: p.creadoEn || ahora,
    actualizadoEn: p.actualizadoEn || ahora,

    clienteId: p.clienteId,
    cliente: p.cliente || "",

    items,

    productoId:
      p.productoId || primerItem?.productId || "",
    productoCodigo:
      p.productoCodigo || primerItem?.productCode || "",
    productoNombre:
      p.productoNombre || primerItem?.productName || "",
    cantidad:
      Number(p.cantidad) || primerItem?.quantity || 0,

    estado: p.estado || "borrador",
    validoHasta: p.validoHasta || null,
    notas: p.notas || "",

    horasImpresionDia:
      Number(p.horasImpresionDia) ||
      primerItem?.hoursPerDay ||
      0,

    diasProduccion:
      Number(p.diasProduccion) ||
      Math.max(
        0,
        ...items.map((item) => item.productionDays)
      ),

    tiempoTotalMinutos:
      Number(p.tiempoTotalMinutos) ||
      items.reduce(
        (total, item) => total + item.totalPrintMinutes,
        0
      ),

    trabajoManualMinutos:
      Number(p.trabajoManualMinutos) ||
      items.reduce(
        (total, item) => total + item.manualMinutes,
        0
      ),

    pesoTotalGramos:
      Number(p.pesoTotalGramos) ||
      items.reduce(
        (total, item) => total + item.totalWeightGrams,
        0
      ),

    kilosFilamento:
      Number(p.kilosFilamento) ||
      items.reduce(
        (total, item) => total + item.filamentKilos,
        0
      ),

    accesorios:
      Array.isArray(p.accesorios)
        ? p.accesorios
        : primerItem?.accessories || [],

    costoTotal:
      Number(p.costoTotal) || costoTotalItems,

    costoPorUnidad:
      Number(p.costoPorUnidad) ||
      primerItem?.unitCost ||
      0,

    precioMayoristaUnitario:
      Number(p.precioMayoristaUnitario) ||
      primerItem?.wholesaleUnitPrice ||
      0,

    precioMayoristaTotal:
      Number(p.precioMayoristaTotal) ||
      mayoristaTotalItems,

    gananciaMayorista:
      Number(p.gananciaMayorista) ||
      items.reduce(
        (total, item) => total + item.wholesaleProfit,
        0
      ),

    precioMinoristaUnitario:
      Number(p.precioMinoristaUnitario) ||
      primerItem?.retailUnitPrice ||
      0,

    precioMinoristaTotal:
      Number(p.precioMinoristaTotal) ||
      minoristaTotalItems,

    gananciaMinorista:
      Number(p.gananciaMinorista) ||
      items.reduce(
        (total, item) => total + item.retailProfit,
        0
      ),
  };
}

function leerCache(): PresupuestoGuardado[] {
  if (typeof window === "undefined") return [];

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

function guardarCache(lista: PresupuestoGuardado[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(lista)
  );

  window.dispatchEvent(
    new CustomEvent("ryuka-budgets-updated")
  );
}

export function obtenerPresupuestos() {
  return leerCache();
}

function convertirFila(
  row: BudgetRow
): PresupuestoGuardado {
  const filasOrdenadas = [...(row.budget_items ?? [])].sort(
    (a, b) => a.position - b.position
  );

  const items: PresupuestoItemGuardado[] =
    filasOrdenadas.map((item) => ({
      productId: item.product_id || "",
      productCode: item.product_code_snapshot || "",
      productName: item.product_name_snapshot || "",
      quantity: Number(item.quantity) || 0,

      hoursPerDay: Number(item.hours_per_day) || 0,
      productionDays:
        Number(item.production_days) || 0,
      totalPrintMinutes:
        Number(item.total_print_minutes) || 0,
      manualMinutes:
        Number(item.manual_minutes) || 0,

      totalWeightGrams:
        Number(item.total_weight_grams) || 0,
      filamentKilos:
        Number(item.filament_kilos) || 0,

      accessories: Array.isArray(item.accessories)
        ? item.accessories
        : [],

      unitCost: Number(item.unit_cost) || 0,
      totalCost: Number(item.total_cost) || 0,

      wholesaleUnitPrice:
        Number(item.wholesale_unit_price) || 0,
      wholesaleTotal:
        Number(item.wholesale_total) || 0,
      wholesaleProfit:
        Number(item.wholesale_profit) || 0,

      retailUnitPrice:
        Number(item.retail_unit_price) || 0,
      retailTotal:
        Number(item.retail_total) || 0,
      retailProfit:
        Number(item.retail_profit) || 0,
    }));

  return normalizar({
    id: row.code,
    clienteId: row.customer_id || undefined,
    cliente: row.customer_name_snapshot,
    estado: row.status,
    validoHasta: row.valid_until,
    notas: row.notes,
    items,
    costoTotal: items.reduce(
      (total, item) => total + item.totalCost,
      0
    ),
    precioMayoristaTotal: items.reduce(
      (total, item) => total + item.wholesaleTotal,
      0
    ),
    gananciaMayorista: items.reduce(
      (total, item) => total + item.wholesaleProfit,
      0
    ),
    precioMinoristaTotal: items.reduce(
      (total, item) => total + item.retailTotal,
      0
    ),
    gananciaMinorista: items.reduce(
      (total, item) => total + item.retailProfit,
      0
    ),
    creadoEn: row.created_at,
    actualizadoEn: row.updated_at,
  });
}

async function leerNube(workspaceId: string) {
  const { data, error } = await createClient()
    .from("budgets")
    .select(`
      code,
      customer_id,
      customer_name_snapshot,
      status,
      valid_until,
      notes,
      total_cost,
      created_at,
      updated_at,
      budget_items(
        position,
        product_id,
        product_code_snapshot,
        product_name_snapshot,
        quantity,
        hours_per_day,
        production_days,
        total_print_minutes,
        manual_minutes,
        total_weight_grams,
        filament_kilos,
        accessories,
        unit_cost,
        total_cost,
        wholesale_unit_price,
        wholesale_total,
        wholesale_profit,
        retail_unit_price,
        retail_total,
        retail_profit
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data || []) as BudgetRow[]).map(convertirFila);
}

async function resolverCustomerId(
  workspaceId: string,
  nombre: string,
  clienteId?: string
) {
  const supabase = createClient();

  if (clienteId) {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("code", clienteId)
      .maybeSingle();

    if (data) return data.id as string;
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("id,code")
    .eq("workspace_id", workspaceId)
    .ilike("first_name", nombre.trim())
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: code, error: codeError } =
    await supabase.rpc("next_customer_code", {
      p_workspace_id: workspaceId,
    });

  if (codeError || !code) {
    throw new Error(
      codeError?.message ||
        "No se pudo crear el cliente del presupuesto."
    );
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      workspace_id: workspaceId,
      code,
      first_name: nombre.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "No se pudo crear el cliente."
    );
  }

  return data.id as string;
}

async function resolverProductId(
  workspaceId: string,
  productId: string,
  productCode: string
) {
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

  const code =
    productCode ||
    (productId.startsWith("RYK-") ? productId : "");

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

async function upsertPresupuesto(
  workspaceId: string,
  presupuesto: NuevoPresupuesto | PresupuestoGuardado,
  code?: string
) {
  const supabase = createClient();
  let codigo = code;

  if (!codigo) {
    const { data, error } = await supabase.rpc(
      "next_budget_code",
      {
        p_workspace_id: workspaceId,
      }
    );

    if (error || !data) {
      throw new Error(
        error?.message ||
          "No se pudo generar el código del presupuesto."
      );
    }

    codigo = data as string;
  }

  const customerUuid = await resolverCustomerId(
    workspaceId,
    presupuesto.cliente,
    presupuesto.clienteId
  );

  const items =
    presupuesto.items.length > 0
      ? presupuesto.items
      : [crearItemLegado(presupuesto)].filter(
          Boolean
        ) as PresupuestoItemGuardado[];

  if (items.length === 0) {
    throw new Error(
      "El presupuesto necesita al menos un producto."
    );
  }

  const costoTotal = items.reduce(
    (total, item) => total + item.totalCost,
    0
  );

  const precioMayoristaTotal = items.reduce(
    (total, item) => total + item.wholesaleTotal,
    0
  );

  const precioMinoristaTotal = items.reduce(
    (total, item) => total + item.retailTotal,
    0
  );

  const { data: parent, error: parentError } =
    await supabase
      .from("budgets")
      .upsert(
        {
          workspace_id: workspaceId,
          code: codigo,
          customer_id: customerUuid,
          customer_name_snapshot:
            presupuesto.cliente.trim(),
          status: presupuesto.estado || "borrador",
          valid_until: presupuesto.validoHasta || null,
          notes: presupuesto.notas || "",
          total_cost: costoTotal,
          wholesale_total: precioMayoristaTotal,
          retail_total: precioMinoristaTotal,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "workspace_id,code",
        }
      )
      .select("id")
      .single();

  if (parentError || !parent) {
    throw new Error(
      parentError?.message ||
        "No se pudo guardar el presupuesto."
    );
  }

  const { error: deleteError } = await supabase
    .from("budget_items")
    .delete()
    .eq("budget_id", parent.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const filas = await Promise.all(
    items.map(async (item, position) => ({
      budget_id: parent.id,
      position,
      product_id: await resolverProductId(
        workspaceId,
        item.productId,
        item.productCode
      ),
      product_code_snapshot:
        item.productCode || item.productId,
      product_name_snapshot: item.productName,
      quantity: item.quantity,
      hours_per_day: item.hoursPerDay,
      production_days: item.productionDays,
      total_print_minutes: item.totalPrintMinutes,
      manual_minutes: item.manualMinutes,
      total_weight_grams: item.totalWeightGrams,
      filament_kilos: item.filamentKilos,
      accessories: item.accessories,
      unit_cost: item.unitCost,
      total_cost: item.totalCost,
      wholesale_unit_price: item.wholesaleUnitPrice,
      wholesale_total: item.wholesaleTotal,
      wholesale_profit: item.wholesaleProfit,
      retail_unit_price: item.retailUnitPrice,
      retail_total: item.retailTotal,
      retail_profit: item.retailProfit,
    }))
  );

  const { error: itemError } = await supabase
    .from("budget_items")
    .insert(filas);

  if (itemError) throw new Error(itemError.message);

  const todos = await leerNube(workspaceId);
  guardarCache(todos);

  const guardado = todos.find(
    (presupuestoActual) =>
      presupuestoActual.id === codigo
  );

  if (!guardado) {
    throw new Error(
      "El presupuesto se guardó, pero no pudo volver a cargarse."
    );
  }

  return guardado;
}

async function migrarLocales(workspaceId: string) {
  if (
    typeof window === "undefined" ||
    localStorage.getItem(MIGRATION_KEY) === "1"
  ) {
    return;
  }

  const locales = leerCache();
  const remotos = await leerNube(workspaceId);
  const codes = new Set(remotos.map((p) => p.id));

  for (const local of locales) {
    if (!codes.has(local.id)) {
      await upsertPresupuesto(
        workspaceId,
        local,
        local.id.replace(/^PRES-/, "PRE-")
      );
    }
  }

  localStorage.setItem(MIGRATION_KEY, "1");
}

export async function cargarPresupuestosDesdeNube() {
  const workspaceId = await obtenerWorkspaceId();

  await migrarLocales(workspaceId);

  const todos = await leerNube(workspaceId);
  guardarCache(todos);

  return todos;
}

export async function guardarPresupuesto(
  p: NuevoPresupuesto
) {
  return upsertPresupuesto(
    await obtenerWorkspaceId(),
    p
  );
}

export async function actualizarEstadoPresupuesto(
  id: string,
  estado: EstadoPresupuesto
) {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const { error } = await supabase
    .from("budgets")
    .update({
      status: estado,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("code", id);

  if (error) throw new Error(error.message);

  const todos = await leerNube(workspaceId);
  guardarCache(todos);

  return todos.find((p) => p.id === id) || null;
}

export async function eliminarPresupuesto(id: string) {
  const workspaceId = await obtenerWorkspaceId();

  const { error, count } = await createClient()
    .from("budgets")
    .delete({ count: "exact" })
    .eq("workspace_id", workspaceId)
    .eq("code", id);

  if (error) throw new Error(error.message);
  if (!count) return false;

  guardarCache(
    leerCache().filter((p) => p.id !== id)
  );

  return true;
}

export async function suscribirseAPresupuestos(
  onChange: (p: PresupuestoGuardado[]) => void
) {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const channel = supabase
    .channel(`budgets-${workspaceId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "budgets",
        filter: `workspace_id=eq.${workspaceId}`,
      },
      async () => {
        const presupuestos =
          await leerNube(workspaceId);

        guardarCache(presupuestos);
        onChange(presupuestos);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export type SaleType =
  | "wholesale"
  | "retail"
  | "custom";

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
  const resolvedWorkspaceId =
    workspaceId ?? (await obtenerWorkspaceId());

  const supabase = createClient();

  const normalizedCustomTotal =
    saleType === "custom"
      ? Math.max(0, Number(customTotal) || 0)
      : null;

  if (
    saleType === "custom" &&
    customTotal === null
  ) {
    throw new Error(
      "Ingresá el total personalizado del pedido."
    );
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
    console.error(
      "Error al convertir el presupuesto:",
      error
    );

    throw new Error(
      `No se pudo convertir el presupuesto: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "La conversión no devolvió ningún resultado."
    );
  }

  const result =
    data as Partial<ConvertBudgetToOrderResult>;

  if (!result.orderCode) {
    throw new Error(
      "La conversión terminó, pero no devolvió el código del pedido."
    );
  }

  const presupuestos = await leerNube(
    resolvedWorkspaceId
  );

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
