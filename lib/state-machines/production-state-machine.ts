import type { ProductionStatus } from "../domain/production";

const PRODUCTION_TRANSITIONS: Record<
  ProductionStatus,
  ProductionStatus[]
> = {
  pending: ["printing", "cancelled"],
  printing: ["packing", "pending", "cancelled"],
  packing: ["ready", "printing", "cancelled"],
  ready: ["completed", "printing", "cancelled"],
  completed: [],
  cancelled: [],
};

const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  pending: "Pendiente",
  printing: "Imprimiendo",
  packing: "Empaquetando",
  ready: "Lista",
  completed: "Finalizada",
  cancelled: "Cancelada",
};

export function canTransitionProduction(
  currentStatus: ProductionStatus,
  nextStatus: ProductionStatus
): boolean {
  if (currentStatus === nextStatus) return true;

  return PRODUCTION_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertProductionTransition(
  currentStatus: ProductionStatus,
  nextStatus: ProductionStatus
): void {
  if (canTransitionProduction(currentStatus, nextStatus)) return;

  throw new Error(
    `No se puede cambiar la producción de "${getProductionStatusLabel(
      currentStatus
    )}" a "${getProductionStatusLabel(nextStatus)}".`
  );
}

export function getProductionStatusLabel(
  status: ProductionStatus
): string {
  return PRODUCTION_STATUS_LABELS[status];
}

export function getAllowedProductionTransitions(
  status: ProductionStatus
): ProductionStatus[] {
  return [...PRODUCTION_TRANSITIONS[status]];
}

export function isProductionClosed(
  status: ProductionStatus
): boolean {
  return status === "completed" || status === "cancelled";
}