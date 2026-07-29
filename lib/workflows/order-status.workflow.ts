import type { Order, OrderStatus } from "@/lib/domain/order";
import {
  findOrderById,
  updateOrderStatus,
} from "@/lib/repositories/orders.repository";
import { assertOrderTransition } from "@/lib/state-machines/order-state-machine";

export async function changeOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
): Promise<Order> {
  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("No se encontró el pedido.");
  }

  assertOrderTransition(order.status, nextStatus);

  return updateOrderStatus(order.id, nextStatus);
}

export async function startOrderProduction(
  orderId: string
): Promise<Order> {
  return changeOrderStatus(orderId, "in_production");
}

export async function markOrderAsReady(
  orderId: string
): Promise<Order> {
  return changeOrderStatus(orderId, "ready");
}

export async function deliverOrder(
  orderId: string
): Promise<Order> {
  return changeOrderStatus(orderId, "delivered");
}

export async function cancelOrder(
  orderId: string
): Promise<Order> {
  return changeOrderStatus(orderId, "cancelled");
}

export async function reopenOrderProduction(
  orderId: string
): Promise<Order> {
  return changeOrderStatus(orderId, "in_production");
}