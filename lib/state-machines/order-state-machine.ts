import type { OrderStatus } from "../domain/order";

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["in_production", "cancelled"],
  in_production: ["ready", "cancelled"],
  ready: ["delivered", "in_production", "cancelled"],
  delivered: [],
  cancelled: [],
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  in_production: "En producción",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  if (currentStatus === nextStatus) return true;

  return ORDER_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertOrderTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): void {
  if (canTransitionOrder(currentStatus, nextStatus)) return;

  throw new Error(
    `No se puede cambiar el pedido de "${getOrderStatusLabel(
      currentStatus
    )}" a "${getOrderStatusLabel(nextStatus)}".`
  );
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function getAllowedOrderTransitions(
  status: OrderStatus
): OrderStatus[] {
  return [...ORDER_TRANSITIONS[status]];
}

export function isOrderClosed(status: OrderStatus): boolean {
  return status === "delivered" || status === "cancelled";
}