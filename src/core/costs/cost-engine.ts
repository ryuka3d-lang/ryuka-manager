import { clampNonNegative, roundMoney } from "@/src/core/shared/money";

export interface ProductionCostInput {
  filamentGrams: number;
  filamentCostPerGram: number;
  printHours: number;
  machineCostPerHour: number;
  laborHours?: number;
  laborCostPerHour?: number;
  accessoriesCost?: number;
  packagingCost?: number;
  fixedAllocatedCost?: number;
  quantity: number;
}

export interface ProductionCostResult {
  materialCost: number;
  machineCost: number;
  laborCost: number;
  extrasCost: number;
  totalCost: number;
  unitCost: number;
}

export function calculateProductionCost(input: ProductionCostInput): ProductionCostResult {
  const quantity = Math.max(1, Math.trunc(clampNonNegative(input.quantity)));
  const materialCost = clampNonNegative(input.filamentGrams) * clampNonNegative(input.filamentCostPerGram);
  const machineCost = clampNonNegative(input.printHours) * clampNonNegative(input.machineCostPerHour);
  const laborCost = clampNonNegative(input.laborHours ?? 0) * clampNonNegative(input.laborCostPerHour ?? 0);
  const extrasCost = clampNonNegative(input.accessoriesCost ?? 0) + clampNonNegative(input.packagingCost ?? 0) + clampNonNegative(input.fixedAllocatedCost ?? 0);
  const totalCost = materialCost + machineCost + laborCost + extrasCost;

  return {
    materialCost: roundMoney(materialCost),
    machineCost: roundMoney(machineCost),
    laborCost: roundMoney(laborCost),
    extrasCost: roundMoney(extrasCost),
    totalCost: roundMoney(totalCost),
    unitCost: roundMoney(totalCost / quantity),
  };
}

export function calculateSalePrice(cost: number, marginPercent: number): number {
  const safeCost = clampNonNegative(cost);
  const margin = Math.min(99.99, Math.max(0, marginPercent)) / 100;
  return roundMoney(safeCost / (1 - margin));
}
