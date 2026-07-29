import { createClient } from "./supabase/client";

export async function obtenerWorkspaceId(): Promise<string> {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("No hay una sesión iniciada.");

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) throw new Error(error?.message || "No se encontró el taller del usuario.");
  return data.workspace_id as string;
}
