"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCloudSync } from "@/app/components/cloud/CloudSyncProvider";

export default function TallerPage() {
  const [codigo, setCodigo] = useState("");
  const [miCodigo, setMiCodigo] = useState("");
  const [nombre, setNombre] = useState("Mi taller Ryuka");
  const [mensaje, setMensaje] = useState("");
  const { estado, sincronizar } = useCloudSync();

  async function cargar() {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: member } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.user.id).limit(1).maybeSingle();
    if (!member) return;
    const { data: workspace } = await supabase.from("workspaces").select("name, invite_code").eq("id", member.workspace_id).single();
    if (workspace) { setNombre(workspace.name); setMiCodigo(workspace.invite_code); }
  }
  useEffect(() => { cargar(); }, []);

  async function unir() {
    setMensaje("");
    const supabase = createClient();
    const { error } = await supabase.rpc("join_workspace_by_code", { p_code: codigo.trim().toUpperCase() });
    if (error) return setMensaje(error.message);
    localStorage.removeItem("ryuka-cloud-inicializado");
    setMensaje("Te uniste al taller. Recargando datos compartidos...");
    setTimeout(() => window.location.reload(), 900);
  }

  async function cerrarSesion() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return <main className="min-h-screen bg-[#101010] text-white"><section className="min-w-0 flex-1 p-5 lg:p-10"><header className="rounded-[2rem] border border-white/10 bg-[#181818] p-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">Multidispositivo</p><h1 className="mt-2 text-3xl font-bold">Taller y nube</h1><p className="mt-3 text-zinc-300">Compartí los mismos datos entre celulares y computadoras.</p></header><div className="mt-7 grid gap-5 lg:grid-cols-2"><section className="rounded-3xl border border-white/10 bg-[#181818] p-6"><h2 className="text-xl font-bold">Tu taller</h2><p className="mt-2 text-zinc-400">{nombre}</p><p className="mt-5 text-sm text-zinc-400">Código para invitar a tu novia o a otro dispositivo con otra cuenta:</p><div className="mt-2 rounded-xl bg-black/30 p-4 text-center text-2xl font-black tracking-[0.25em]">{miCodigo || "..."}</div><p className="mt-4 text-sm">Estado: <strong>{estado}</strong></p><button onClick={() => sincronizar()} className="mt-4 rounded-xl bg-[#810404] px-5 py-3 font-semibold">Sincronizar ahora</button></section><section className="rounded-3xl border border-white/10 bg-[#181818] p-6"><h2 className="text-xl font-bold">Unirme a otro taller</h2><p className="mt-2 text-sm text-zinc-400">La segunda persona crea su cuenta y escribe acá el código del taller principal.</p><input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Ej: RYUKA7K2" className="mt-5 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 uppercase"/><button onClick={unir} className="mt-3 w-full rounded-xl bg-[#810404] px-5 py-3 font-semibold">Unirme al taller</button>{mensaje && <p className="mt-4 rounded-xl bg-black/30 p-3 text-sm">{mensaje}</p>}</section></div><button onClick={cerrarSesion} className="mt-7 rounded-xl border border-red-900 px-5 py-3 text-red-300">Cerrar sesión</button></section></main>;
}
