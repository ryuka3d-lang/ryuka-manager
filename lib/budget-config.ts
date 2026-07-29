import {
  DEFAULT_RYUKA_CONFIG,
  obtenerConfiguracion,
  type RyukaConfig,
} from "./settings-service";

export type BudgetConfig = RyukaConfig;

export const DEFAULT_BUDGET_CONFIG =
  DEFAULT_RYUKA_CONFIG;

export function obtenerConfiguracionPresupuesto():
  BudgetConfig {
  return obtenerConfiguracion();
}