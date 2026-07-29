"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"ingresar" | "crear">("ingresar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setMensaje("");
    const supabase = createClient();

    if (modo === "crear") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } },
      });

      setCargando(false);
      if (error) return setMensaje(error.message);
      setMensaje("Cuenta creada. Revisá tu correo si Supabase solicita confirmación.");
      setModo("ingresar");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) return setMensaje("No pudimos ingresar. Revisá el correo y la contraseña.");

    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.replace(nextPath || "/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101010] p-5 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#181818] p-7 shadow-2xl sm:p-9">
        <div className="rounded-2xl bg-[#810404] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-200">Ryuka Manager</p>
          <h1 className="mt-2 text-3xl font-bold">Tu taller, en todos tus dispositivos.</h1>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-black/30 p-1">
          <button className={`rounded-lg px-3 py-2 text-sm font-semibold ${modo === "ingresar" ? "bg-white text-black" : "text-zinc-400"}`} onClick={() => setModo("ingresar")}>Ingresar</button>
          <button className={`rounded-lg px-3 py-2 text-sm font-semibold ${modo === "crear" ? "bg-white text-black" : "text-zinc-400"}`} onClick={() => setModo("crear")}>Crear cuenta</button>
        </div>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          {modo === "crear" && <Campo titulo="Nombre" type="text" value={nombre} onChange={setNombre} />}
          <Campo titulo="Correo electrónico" type="email" value={email} onChange={setEmail} />
          <Campo titulo="Contraseña" type="password" value={password} onChange={setPassword} />

          {mensaje && <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">{mensaje}</p>}

          <button disabled={cargando} className="w-full rounded-xl bg-[#810404] px-5 py-3 font-semibold hover:bg-[#a00808] disabled:opacity-50">
            {cargando ? "Procesando..." : modo === "ingresar" ? "Ingresar a Ryuka" : "Crear mi cuenta"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Campo({ titulo, type, value, onChange }: { titulo: string; type: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-semibold text-zinc-300">{titulo}</span><input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 outline-none focus:border-red-700" /></label>;
}
