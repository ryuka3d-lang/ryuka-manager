export type OrderStatus =
  | "pending"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";

export type SaleType = "wholesale" | "retail" | "custom";

export type OrderItem = {
  id: string;
  orderId: string;
  position: number;

  productId: string | null;
  productCode: string;
  productName: string;

  quantity: number;

  unitPrice: number;
  totalPrice: number;

  unitCost: number;
  totalCost: number;

  totalPrintMinutes: number;
  manualMinutes: number;
  totalWeightGrams: number;
  filamentKilos: number;

  accessories: unknown[];
};

export type Order = {
  id: string;
  workspaceId: string;
  code: string;

  budgetId: string | null;
  customerId: string | null;
  customerName: string;

  status: OrderStatus;
  saleType: SaleType;

  totalAmount: number;

  deliveryDate: string | null;
  deliveredAt: string | null;

  notes: string;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
};

export type CreateOrderFromBudgetInput = {
  workspaceId: string;
  budgetCode: string;
  saleType: SaleType;
  customTotal?: number;
};

export type ConvertBudgetResult = {
  created: boolean;
  budgetCode: string;

  orderId?: string;
  orderCode: string;

  productionOrderId?: string;
  productionCode: string | null;
};