import { createClient } from "@/lib/supabase/client";
import type {
  CreateOrderFromBudgetInput,
  ConvertBudgetResult,
} from "@/lib/domain/order";

export async function convertBudgetToOrder(
  input: CreateOrderFromBudgetInput
): Promise<ConvertBudgetResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc(
    "convert_budget_to_order",
    {
      p_workspace_id: input.workspaceId,
      p_budget_code: input.budgetCode,
      p_sale_type: input.saleType,
      p_custom_total:
        input.saleType === "custom"
          ? input.customTotal ?? null
          : null,
    }
  );

  if (error) {
    console.error("Error RPC convert_budget_to_order:", error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Supabase no devolvió el pedido creado.");
  }

  return data as ConvertBudgetResult;
}