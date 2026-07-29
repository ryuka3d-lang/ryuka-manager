export type ProductionStatus =
  | "pending"
  | "printing"
  | "packing"
  | "ready"
  | "completed"
  | "cancelled";

export type PrinterStatus = "active" | "maintenance" | "inactive";

export type Printer = {
  id: string;
  workspaceId: string;

  code: string;
  name: string;
  brand: string;
  model: string;

  status: PrinterStatus;
  notes: string;

  createdAt: string;
  updatedAt: string;
};

export type ProductionOrderItem = {
  id: string;
  productionOrderId: string;
  orderItemId: string;

  quantity: number;

  productCode: string;
  productName: string;
};

export type ProductionConsumption = {
  id: string;
  productionOrderId: string;

  spoolId: string | null;
  spoolCode: string;
  spoolDescription: string;

  material: string;
  color: string;

  grams: number;
  costPerGram: number;
  totalCost: number;

  createdAt: string;
};

export type ProductionOrder = {
  id: string;
  workspaceId: string;

  code: string;
  orderId: string;
  orderCode: string;

  printerId: string | null;
  printer: Printer | null;

  status: ProductionStatus;

  plannedPrintMinutes: number;
  plannedWeightGrams: number;

  startedAt: string | null;
  finishedAt: string | null;

  notes: string;

  createdAt: string;
  updatedAt: string;

  items: ProductionOrderItem[];
  consumptions: ProductionConsumption[];
};