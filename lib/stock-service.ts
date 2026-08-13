"use client";

import { createClient } from "@/lib/supabase/client";
import { obtenerWorkspaceId } from "@/lib/workspace-service";

export type BobinaFilamento = {
  id: string;
  uuid: string;
  material: string;
  color: string;
  marca: string;
  pesoInicialGramos: number;
  pesoActualGramos: number;
  stockMinimoGramos: number;
  precioCompra: number;
  fechaCompra: string;
  creadoEn: string;
  actualizadoEn: string;
};

export type NuevaBobinaFilamento = Omit<
  BobinaFilamento,
  "id" | "uuid" | "creadoEn" | "actualizadoEn"
>;

export type TipoMovimientoFilamento = "entrada" | "salida" | "ajuste";

export type MovimientoFilamento = {
  id: string;
  bobinaId: string;
  bobinaUuid: string;
  tipo: TipoMovimientoFilamento;
  cantidadGramos: number;
  motivo: string;
  pedidoId: string | null;
  productoNombre: string | null;
  creadoEn: string;
};

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapBobina(row: any): BobinaFilamento {
  return {
    id: row.code,
    uuid: row.id,
    material: (row.material || "PLA").trim().toUpperCase(),
    color: (row.color || "").trim(),
    marca: (row.brand || "").trim(),
    pesoInicialGramos: num(row.initial_weight_grams),
    pesoActualGramos: num(row.current_weight_grams),
    stockMinimoGramos: num(row.minimum_weight_grams),
    precioCompra: num(row.purchase_price),
    fechaCompra: row.purchase_date || "",
    creadoEn: row.created_at,
    actualizadoEn: row.updated_at,
  };
}

export async function obtenerBobinas(): Promise<BobinaFilamento[]> {
  const workspaceId = await obtenerWorkspaceId();
  const { data, error } = await createClient()
    .from("filament_spools")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(mapBobina);
}

export async function obtenerBobinaPorId(id: string) {
  const bobinas = await obtenerBobinas();
  return bobinas.find((b) => b.id === id || b.uuid === id) || null;
}

export async function obtenerMovimientosDeBobina(
  bobinaId: string
): Promise<MovimientoFilamento[]> {
  const bobina = await obtenerBobinaPorId(bobinaId);
  if (!bobina) return [];

  const workspaceId = await obtenerWorkspaceId();

  const { data, error } = await createClient()
    .from("filament_movements")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("spool_id", bobina.uuid)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    bobinaId: bobina.id,
    bobinaUuid: bobina.uuid,
    tipo: row.movement_type,
    cantidadGramos: num(row.quantity_grams),
    motivo: row.reason || "",
    pedidoId: row.production_code,
    productoNombre: row.product_name,
    creadoEn: row.created_at,
  }));
}

export async function guardarBobina(
  datos: NuevaBobinaFilamento
): Promise<BobinaFilamento> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const { data: code, error: codeError } = await supabase.rpc(
    "next_filament_spool_code",
    { p_workspace_id: workspaceId }
  );

  if (codeError || !code) {
    throw new Error(codeError?.message || "No se pudo generar el código.");
  }

  const { data, error } = await supabase
    .from("filament_spools")
    .insert({
      workspace_id: workspaceId,
      code,
      material: datos.material.trim().toUpperCase(),
      color: datos.color.trim(),
      brand: datos.marca.trim(),
      initial_weight_grams: datos.pesoInicialGramos,
      current_weight_grams: datos.pesoActualGramos,
      minimum_weight_grams: datos.stockMinimoGramos,
      purchase_price: datos.precioCompra,
      purchase_date: datos.fechaCompra || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "No se pudo guardar la bobina.");
  }

  const bobina = mapBobina(data);

  if (bobina.pesoActualGramos > 0) {
    await supabase.from("filament_movements").insert({
      workspace_id: workspaceId,
      spool_id: bobina.uuid,
      movement_type: "entrada",
      quantity_grams: bobina.pesoActualGramos,
      reason: "Carga inicial de bobina",
    });
  }

  return bobina;
}

export async function editarBobina(
  id: string,
  cambios: Partial<NuevaBobinaFilamento>
): Promise<BobinaFilamento> {
  const bobina = await obtenerBobinaPorId(id);
  if (!bobina) throw new Error("No se encontró la bobina.");

  const { data, error } = await createClient()
    .from("filament_spools")
    .update({
      material: cambios.material?.trim().toUpperCase() ?? bobina.material,
      color: cambios.color?.trim() ?? bobina.color,
      brand: cambios.marca?.trim() ?? bobina.marca,
      initial_weight_grams:
        cambios.pesoInicialGramos ?? bobina.pesoInicialGramos,
      current_weight_grams:
        cambios.pesoActualGramos ?? bobina.pesoActualGramos,
      minimum_weight_grams:
        cambios.stockMinimoGramos ?? bobina.stockMinimoGramos,
      purchase_price:
        cambios.precioCompra ?? bobina.precioCompra,
      purchase_date:
        (cambios.fechaCompra ?? bobina.fechaCompra) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bobina.uuid)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message || "No se pudo editar.");
  return mapBobina(data);
}

export async function eliminarBobina(id: string) {
  const bobina = await obtenerBobinaPorId(id);
  if (!bobina) return false;

  const { error } = await createClient()
    .from("filament_spools")
    .delete()
    .eq("id", bobina.uuid);

  if (error) throw new Error(error.message);
  return true;
}

export async function registrarMovimientoFilamento(
  bobinaId: string,
  tipo: TipoMovimientoFilamento,
  cantidadGramos: number,
  motivo: string,
  pedidoId: string | null = null,
  productoNombre: string | null = null
) {
  const bobina = await obtenerBobinaPorId(bobinaId);
  if (!bobina) throw new Error("No se encontró la bobina.");

  const { error } = await createClient().rpc(
    "register_filament_movement",
    {
      p_spool_id: bobina.uuid,
      p_movement_type: tipo,
      p_quantity_grams: cantidadGramos,
      p_reason: motivo,
      p_production_code: pedidoId,
      p_product_name: productoNombre,
    }
  );

  if (error) throw new Error(error.message);

  const movimientos = await obtenerMovimientosDeBobina(bobina.uuid);
  return movimientos[0] || null;
}

// ============================================================
// COMPATIBILIDAD TEMPORAL CON PRODUCCIÓN LEGACY
// ============================================================

export function crearDescripcionBobina(bobina: BobinaFilamento) {
  return [bobina.id, bobina.material, bobina.color, bobina.marca]
    .filter(Boolean)
    .join(" · ");
}

export async function pedidoYaConsumioFilamento(
  pedidoId: string
): Promise<boolean> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("filament_movements")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("movement_type", "salida")
    .eq("production_code", pedidoId)
    .limit(1);

  if (error) {
    console.error(
      "Error verificando consumo de filamento:",
      error
    );
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function reponerFilamentoDePedido(
  pedidoId: string
): Promise<boolean> {
  const workspaceId = await obtenerWorkspaceId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("filament_movements")
    .select(`
      id,
      spool_id,
      quantity_grams,
      product_name
    `)
    .eq("workspace_id", workspaceId)
    .eq("movement_type", "salida")
    .eq("production_code", pedidoId);

  if (error) {
    console.error(
      "Error buscando consumos para reponer:",
      error
    );
    return false;
  }

  if (!data || data.length === 0) {
    return false;
  }

  const codigoReposicion = `REPOSICION:${pedidoId}`;

  const { data: reposicionesExistentes, error: errorReposiciones } =
    await supabase
      .from("filament_movements")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("production_code", codigoReposicion)
      .limit(1);

  if (errorReposiciones) {
    console.error(
      "Error verificando reposición:",
      errorReposiciones
    );
    return false;
  }

  if ((reposicionesExistentes?.length ?? 0) > 0) {
    return false;
  }

  for (const salida of data) {
    const { error: rpcError } = await supabase.rpc(
      "register_filament_movement",
      {
        p_spool_id: salida.spool_id,
        p_movement_type: "entrada",
        p_quantity_grams: Number(salida.quantity_grams),
        p_reason: `Reposición por eliminación de ${pedidoId}`,
        p_production_code: codigoReposicion,
        p_product_name: salida.product_name,
      }
    );

    if (rpcError) {
      console.error(
        "Error reponiendo filamento:",
        rpcError
      );
      return false;
    }
  }

  return true;
}