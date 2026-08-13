"use client";

import { createClient } from "@/lib/supabase/client";
import { obtenerWorkspaceId } from "@/lib/workspace-service";
import { obtenerProductos } from "@/lib/product-service";
import {
  crearDescripcionBobina,
  obtenerBobinas,
  registrarMovimientoFilamento,
  type BobinaFilamento,
} from "@/lib/stock-service";

export type EstadoProduccionNube =
  | "pending"
  | "printing"
  | "packing"
  | "ready"
  | "delivered";

export type ConsumoProduccionNube = {
  id: string;
  spoolId: string | null;
  spoolCode: string;
  spoolDescription: string;
  material: string;
  color: string;
  grams: number;
  costPerGram: number;
  totalCost: number;
};

export type ItemProduccionNube = {
  id: string;
  orderItemId: string;
  productId: string | null;
  productCode: string;
  productName: string;
  quantity: number;
  totalPrintMinutes: number;
  totalWeightGrams: number;
};

export type OrdenProduccionNube = {
  id: string;
  workspaceId: string;
  code: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  status: EstadoProduccionNube;
  plannedPrintMinutes: number;
  plannedWeightGrams: number;
  startedAt: string | null;
  finishedAt: string | null;
  notes: string;
  items: ItemProduccionNube[];
  consumptions: ConsumoProduccionNube[];
};

export type RequerimientoFilamentoNube = {
  key: string;
  productId: string | null;
  productName: string;
  material: string;
  color: string;
  grams: number;
};

export type AsignacionBobinaNube = {
  requirementKey: string;
  spoolId: string;
};

type ProductionOrderRow = {
  id: string;
  workspace_id: string;
  code: string;
  order_id: string;
  status: string;
  planned_print_minutes: number | string;
  planned_weight_grams: number | string;
  started_at: string | null;
  finished_at: string | null;
  notes: string | null;
};

type ProductionOrderItemRow = {
  id: string;
  production_order_id: string;
  order_item_id: string;
  quantity: number;
};

type OrderRow = {
  id: string;
  code: string;
  customer_name_snapshot: string;
};

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_code_snapshot: string;
  product_name_snapshot: string;
  quantity: number;
  total_print_minutes: number;
  total_weight_grams: number | string;
};

type ConsumptionRow = {
  id: string;
  production_order_id: string;
  spool_id: string | null;
  spool_code_snapshot: string;
  spool_description_snapshot: string;
  material: string;
  color: string;
  grams: number | string;
  cost_per_gram: number | string;
  total_cost: number | string;
};

type ValidatedRequirement = {
  requirement: RequerimientoFilamentoNube;
  spool: BobinaFilamento;
};

function num(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapStatus(status: string): EstadoProduccionNube {
  if (status === "printing") return "printing";
  if (status === "packing") return "packing";
  if (status === "ready") return "ready";

  if (
    status === "completed" ||
    status === "delivered"
  ) {
    return "delivered";
  }

  return "pending";
}

export async function listarOrdenesProduccionNube(): Promise<
  OrdenProduccionNube[]
> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const { data: productionRows, error: productionError } =
    await supabase
      .from("production_orders")
      .select(`
        id,
        workspace_id,
        code,
        order_id,
        status,
        planned_print_minutes,
        planned_weight_grams,
        started_at,
        finished_at,
        notes
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

  if (productionError) {
    throw new Error(productionError.message);
  }

  const productions =
    (productionRows ?? []) as ProductionOrderRow[];

  if (productions.length === 0) return [];

  const productionIds = productions.map((row) => row.id);
  const orderIds = [...new Set(productions.map((row) => row.order_id))];

  const [
    { data: productionItemRows, error: productionItemsError },
    { data: orderRows, error: ordersError },
    { data: consumptionRows, error: consumptionsError },
  ] = await Promise.all([
    supabase
      .from("production_order_items")
      .select("id, production_order_id, order_item_id, quantity")
      .in("production_order_id", productionIds),
    supabase
      .from("orders")
      .select("id, code, customer_name_snapshot")
      .in("id", orderIds),
    supabase
      .from("production_consumptions")
      .select(`
        id,
        production_order_id,
        spool_id,
        spool_code_snapshot,
        spool_description_snapshot,
        material,
        color,
        grams,
        cost_per_gram,
        total_cost
      `)
      .in("production_order_id", productionIds),
  ]);

  if (productionItemsError) throw new Error(productionItemsError.message);
  if (ordersError) throw new Error(ordersError.message);
  if (consumptionsError) throw new Error(consumptionsError.message);

  const productionItems =
    (productionItemRows ?? []) as ProductionOrderItemRow[];

  const orderItemIds = [
    ...new Set(productionItems.map((row) => row.order_item_id)),
  ];

  let orderItems: OrderItemRow[] = [];

  if (orderItemIds.length > 0) {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        id,
        product_id,
        product_code_snapshot,
        product_name_snapshot,
        quantity,
        total_print_minutes,
        total_weight_grams
      `)
      .in("id", orderItemIds);

    if (error) throw new Error(error.message);

    orderItems = (data ?? []) as OrderItemRow[];
  }

  const ordersById = new Map(
    ((orderRows ?? []) as OrderRow[]).map((row) => [row.id, row])
  );

  const orderItemsById = new Map(
    orderItems.map((row) => [row.id, row])
  );

  const consumptions =
    (consumptionRows ?? []) as ConsumptionRow[];

  return productions.map((production) => {
    const order = ordersById.get(production.order_id);

    const items = productionItems
      .filter((item) => item.production_order_id === production.id)
      .map((productionItem) => {
        const item = orderItemsById.get(productionItem.order_item_id);

        const originalQuantity = Math.max(
          1,
          Number(item?.quantity) || productionItem.quantity || 1
        );

        const productionQuantity = Math.max(
          0,
          Number(productionItem.quantity) || 0
        );

        const ratio =
          originalQuantity > 0
            ? productionQuantity / originalQuantity
            : 1;

        return {
          id: productionItem.id,
          orderItemId: productionItem.order_item_id,
          productId: item?.product_id ?? null,
          productCode: item?.product_code_snapshot ?? "",
          productName: item?.product_name_snapshot ?? "Producto",
          quantity: productionQuantity,
          totalPrintMinutes: num(item?.total_print_minutes) * ratio,
          totalWeightGrams: num(item?.total_weight_grams) * ratio,
        } satisfies ItemProduccionNube;
      });

    const productionConsumptions = consumptions
      .filter((row) => row.production_order_id === production.id)
      .map(
        (row): ConsumoProduccionNube => ({
          id: row.id,
          spoolId: row.spool_id,
          spoolCode: row.spool_code_snapshot,
          spoolDescription: row.spool_description_snapshot,
          material: row.material,
          color: row.color,
          grams: num(row.grams),
          costPerGram: num(row.cost_per_gram),
          totalCost: num(row.total_cost),
        })
      );

    return {
      id: production.id,
      workspaceId: production.workspace_id,
      code: production.code,
      orderId: production.order_id,
      orderCode: order?.code ?? "",
      customerName: order?.customer_name_snapshot || "Cliente sin nombre",
      status: mapStatus(production.status),
      plannedPrintMinutes: num(production.planned_print_minutes),
      plannedWeightGrams: num(production.planned_weight_grams),
      startedAt: production.started_at,
      finishedAt: production.finished_at,
      notes: production.notes || "",
      items,
      consumptions: productionConsumptions,
    };
  });
}

export function obtenerRequerimientosFilamentoNube(
  production: OrdenProduccionNube
): RequerimientoFilamentoNube[] {
  const productos = obtenerProductos();
  const requirements: RequerimientoFilamentoNube[] = [];

  for (const item of production.items) {
    const product = productos.find(
      (candidate) =>
        candidate.id === item.productId ||
        candidate.codigo === item.productCode
    );

    if (
      !product ||
      !Array.isArray(product.materiales) ||
      product.materiales.length === 0
    ) {
      requirements.push({
        key: `${item.id}:general`,
        productId: item.productId,
        productName: item.productName,
        material: "PLA",
        color: "Sin especificar",
        grams: item.totalWeightGrams,
      });

      continue;
    }

    const cantidadPorCama = Math.max(
      1,
      Number(product.cantidadPorCama) || 1
    );

    const camas = Math.ceil(item.quantity / cantidadPorCama);

    for (const material of product.materiales) {
      const grams =
        (Number(material.gramosPorCama) || 0) * camas;

      if (grams <= 0) continue;

      requirements.push({
        key: `${item.id}:${material.id}`,
        productId: item.productId,
        productName: item.productName,
        material: material.material.trim().toUpperCase() || "PLA",
        color: material.color.trim() || "Sin especificar",
        grams,
      });
    }
  }

  return requirements;
}

function calcularCostoBobina(spool: BobinaFilamento) {
  return spool.pesoInicialGramos > 0
    ? spool.precioCompra / spool.pesoInicialGramos
    : 0;
}

function validarAsignaciones(
  requirements: RequerimientoFilamentoNube[],
  assignments: AsignacionBobinaNube[]
): ValidatedRequirement[] {
  const spools = obtenerBobinas();

  return requirements.map((requirement) => {
    const assignment = assignments.find(
      (item) => item.requirementKey === requirement.key
    );

    const spool = spools.find(
      (item) => item.id === assignment?.spoolId
    );

    if (!spool) {
      throw new Error(
        `No se encontró la bobina para ${requirement.material} ${requirement.color}.`
      );
    }

    if (spool.pesoActualGramos < requirement.grams) {
      throw new Error(
        `${spool.id} no tiene filamento suficiente.`
      );
    }

    return { requirement, spool };
  });
}

function revertirDescuentosLocales(
  descontados: Array<{
    spoolId: string;
    grams: number;
    productName: string;
    productionCode: string;
  }>
) {
  const rollbackId = `ROLLBACK:${Date.now()}`;

  for (const item of [...descontados].reverse()) {
    registrarMovimientoFilamento(
      item.spoolId,
      "entrada",
      item.grams,
      `Reversión automática por error al iniciar ${item.productionCode}`,
      rollbackId,
      item.productName
    );
  }
}

export async function iniciarProduccionConBobinas(
  production: OrdenProduccionNube,
  assignments: AsignacionBobinaNube[]
): Promise<OrdenProduccionNube> {
  if (production.status !== "pending") {
    throw new Error("La orden de producción ya fue iniciada.");
  }

  if (production.consumptions.length > 0) {
    throw new Error("Esta orden ya tiene consumos registrados.");
  }

  const requirements =
    obtenerRequerimientosFilamentoNube(production);

  if (requirements.length === 0) {
    throw new Error(
      "No se pudieron calcular los requerimientos de filamento."
    );
  }

  const validated =
    validarAsignaciones(requirements, assignments);

  const descontados: Array<{
    spoolId: string;
    grams: number;
    productName: string;
    productionCode: string;
  }> = [];

  try {
    for (const { requirement, spool } of validated) {
      const movement = registrarMovimientoFilamento(
        spool.id,
        "salida",
        requirement.grams,
        `Consumo de ${production.code} · ${requirement.productName}`,
        production.code,
        requirement.productName
      );

      if (!movement) {
        throw new Error(
          `No se pudo descontar filamento de ${spool.id}.`
        );
      }

      descontados.push({
        spoolId: spool.id,
        grams: requirement.grams,
        productName: requirement.productName,
        productionCode: production.code,
      });
    }

    const consumptions = validated.map(
      ({ requirement, spool }) => {
        const costPerGram = calcularCostoBobina(spool);

        return {
          spoolCode: spool.id,
          spoolDescription: crearDescripcionBobina(spool),
          material: requirement.material,
          color: requirement.color,
          grams: requirement.grams,
          costPerGram,
          totalCost: costPerGram * requirement.grams,
        };
      }
    );

    const supabase = createClient();

    const { error } = await supabase.rpc(
      "start_production_with_consumptions",
      {
        p_production_order_id: production.id,
        p_consumptions: consumptions,
      }
    );

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    if (descontados.length > 0) {
      revertirDescuentosLocales(descontados);
    }

    throw error;
  }

  const refreshed = await listarOrdenesProduccionNube();

  const updated = refreshed.find(
    (item) => item.id === production.id
  );

  if (!updated) {
    throw new Error(
      "La producción se inició, pero no pudo volver a cargarse."
    );
  }

  return updated;
}

export async function avanzarEstadoProduccionNube(
  production: OrdenProduccionNube
): Promise<OrdenProduccionNube> {
  const next: EstadoProduccionNube | null =
    production.status === "printing"
      ? "packing"
      : production.status === "packing"
        ? "ready"
        : production.status === "ready"
          ? "delivered"
          : null;

  if (!next) {
    throw new Error(
      "Esta orden no puede avanzar desde su estado actual."
    );
  }

  const supabase = createClient();

  const { error } = await supabase.rpc(
    "advance_production_order",
    {
      p_production_order_id: production.id,
      p_next_status: next,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const refreshed = await listarOrdenesProduccionNube();

  const updated = refreshed.find(
    (item) => item.id === production.id
  );

  if (!updated) {
    throw new Error(
      "La orden se actualizó, pero no pudo volver a cargarse."
    );
  }

  return updated;
}

export function obtenerCostoRealProduccion(
  production: OrdenProduccionNube
) {
  return production.consumptions.reduce(
    (total, consumption) =>
      total + consumption.totalCost,
    0
  );
}
