"use client";

import type { FeriaGuardada } from "@/lib/fair-service";
import { calcularPlanProduccionFeria } from "@/lib/fair-service";
import type { ProductoGuardado } from "@/lib/product-service";

export default function FairProductionPlan({ feria, productos, horasImpresionDia }: { feria: FeriaGuardada; productos: ProductoGuardado[]; horasImpresionDia: number }) {
  const plan = calcularPlanProduccionFeria(feria, productos, horasImpresionDia);
  const horas = Math.floor(plan.minutosImpresion / 60);
  const minutos = Math.round(plan.minutosImpresion % 60);

  return (
    <section className="mt-5 rounded-2xl border border-[#2b2b2b] bg-[#111] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Plan de producción</p>
          <h3 className="mt-1 text-lg font-bold">Preparación para la feria</h3>
        </div>
        {plan.llegaATiempo !== null && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.llegaATiempo ? "bg-emerald-950/70 text-emerald-300" : "bg-red-950/70 text-red-300"}`}>
            {plan.llegaATiempo ? "🟢 Llegás a tiempo" : "🔴 Capacidad insuficiente"}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Dato titulo="Faltan producir" valor={`${plan.unidadesPendientes} u.`} />
        <Dato titulo="Camas" valor={String(plan.camasNecesarias)} />
        <Dato titulo="Impresión" valor={`${horas} h ${minutos} min`} />
        <Dato titulo="Filamento" valor={plan.gramosFilamento >= 1000 ? `${(plan.gramosFilamento / 1000).toFixed(2)} kg` : `${Math.round(plan.gramosFilamento)} g`} />
      </div>

      {plan.diasHastaFeria !== null && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <p><strong>{plan.diasHastaFeria} días</strong> hasta la feria · <strong>{Math.round(plan.horasDisponibles || 0)} h</strong> de capacidad configurada.</p>
          {plan.horasMargen !== null && (
            <p className={`mt-2 font-semibold ${plan.horasMargen >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              {plan.horasMargen >= 0 ? `Te sobran aprox. ${Math.floor(plan.horasMargen)} h de capacidad.` : `Te faltan aprox. ${Math.ceil(Math.abs(plan.horasMargen))} h de capacidad.`}
            </p>
          )}
        </div>
      )}

      {plan.productosSinReceta.length > 0 && (
        <p className="mt-4 rounded-xl border border-amber-900/50 bg-amber-950/20 p-3 text-sm text-amber-200">
          ⚠️ No pude calcular completamente: revisá la cantidad por cama de {plan.productosSinReceta.join(", ")}.
        </p>
      )}
    </section>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#171717] p-3"><p className="text-xs text-zinc-500">{titulo}</p><strong className="mt-1 block">{valor}</strong></div>;
}
