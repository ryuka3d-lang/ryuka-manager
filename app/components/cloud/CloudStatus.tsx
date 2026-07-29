"use client";
import { useCloudSync } from "./CloudSyncProvider";

export default function CloudStatus() {
  const { estado, sincronizar } = useCloudSync();
  const texto: Record<string, string> = { iniciando: "Conectando...", sincronizando: "Sincronizando...", sincronizado: "Guardado en la nube", error: "Error de sincronización", "sin-taller": "Falta configurar taller" };
  return <button type="button" onClick={() => sincronizar()} className="mt-3 w-full rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-left text-xs text-red-100/90">☁ {texto[estado] || estado}</button>;
}
