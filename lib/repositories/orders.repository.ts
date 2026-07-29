import { createClient } from "@/lib/supabase/client";
import type {
  Order,
  OrderItem,
  OrderStatus,
  SaleType,
} from "@/lib/domain/order";

type OrderItemRow = {
  id: string;
  order_id: string;
  position: number;

  product_id: string | null;
  product_code_snapshot: string;
  product_name_snapshot: string;

  quantity: number;

  unit_price: number | string;
  total_price: number | string;

  unit_cost: number | string;
  total_cost: number | string;

  total_print_minutes: number;
  manual_minutes: number;

  total_weight_grams: number | string;
  filament_kilos: number | string;

  accessories: unknown;
};

type OrderRow = {
  id: string;
  workspace_id: string;
  code: string;

  budget_id: string | null;
  customer_id: string | null;
  customer_name_snapshot: string;

  status: OrderStatus;
  sale_type: SaleType;

  total_amount: number | string;

  delivery_date: string | null;
  delivered_at: string | null;

  notes: string;

  created_at: string;
  updated_at: string;

  order_items?: OrderItemRow[];
};

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    position: row.position,

    productId: row.product_id,
    productCode: row.product_code_snapshot,
    productName: row.product_name_snapshot,

    quantity: row.quantity,

    unitPrice: toNumber(row.unit_price),
    totalPrice: toNumber(row.total_price),

    unitCost: toNumber(row.unit_cost),
    totalCost: toNumber(row.total_cost),

    totalPrintMinutes: row.total_print_minutes,
    manualMinutes: row.manual_minutes,
    totalWeightGrams: toNumber(row.total_weight_grams),
    filamentKilos: toNumber(row.filament_kilos),

    accessories: Array.isArray(row.accessories) ? row.accessories : [],
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    code: row.code,

    budgetId: row.budget_id,
    customerId: row.customer_id,
    customerName: row.customer_name_snapshot,

    status: row.status,
    saleType: row.sale_type,

    totalAmount: toNumber(row.total_amount),

    deliveryDate: row.delivery_date,
    deliveredAt: row.delivered_at,

    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    items: [...(row.order_items ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(mapOrderItem),
  };
}

export async function listOrders(
  workspaceId: string
): Promise<Order[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener los pedidos: ${error.message}`);
  }

  return ((data ?? []) as OrderRow[]).map(mapOrder);
}

export async function findOrderById(
  orderId: string
): Promise<Order | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el pedido: ${error.message}`);
  }

  return data ? mapOrder(data as OrderRow) : null;
}

export async function findOrderByCode(
  workspaceId: string,
  orderCode: string
): Promise<Order | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("workspace_id", workspaceId)
    .eq("code", orderCode)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo obtener el pedido: ${error.message}`);
  }

  return data ? mapOrder(data as OrderRow) : null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const supabase = createClient();

  const changes: {
    status: OrderStatus;
    updated_at: string;
    delivered_at?: string | null;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "delivered") {
  changes.delivered_at = new Date().toISOString();
} else {
  changes.delivered_at = null;
}

  const { error } = await supabase
    .from("orders")
    .update(changes)
    .eq("id", orderId);

  if (error) {
    throw new Error(
      `No se pudo actualizar el estado del pedido: ${error.message}`
    );
  }

  const updatedOrder = await findOrderById(orderId);

  if (!updatedOrder) {
    throw new Error("El pedido actualizado no pudo encontrarse.");
  }

  return updatedOrder;
}

export async function updateOrderCommercialData(
  orderId: string,
  changes: {
    saleType?: SaleType;
    totalAmount?: number;
    deliveryDate?: string | null;
    notes?: string;
  }
): Promise<Order> {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (changes.saleType !== undefined) {
  payload.sale_type = changes.saleType;
}

  if (changes.totalAmount !== undefined) {
    payload.total_amount = Math.max(0, Number(changes.totalAmount) || 0);
  }

  if (changes.deliveryDate !== undefined) {
    payload.delivery_date = changes.deliveryDate;
  }

  if (changes.notes !== undefined) {
    payload.notes = changes.notes.trim();
  }

  const { error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", orderId);

  if (error) {
    throw new Error(`No se pudo actualizar el pedido: ${error.message}`);
  }

  const updatedOrder = await findOrderById(orderId);

  if (!updatedOrder) {
    throw new Error("El pedido actualizado no pudo encontrarse.");
  }

  return updatedOrder;
}