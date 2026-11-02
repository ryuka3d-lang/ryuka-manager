"use client";

import { useEffect, useState } from "react";

type Tema = "oscuro" | "claro";

function aplicarTema(tema: Tema) {
  document.documentElement.classList.toggle(
    "light",
    tema === "claro"
  );
}

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("oscuro");

  useEffect(() => {
    const guardado: Tema =
      localStorage.getItem("ryuka-tema") === "claro"
        ? "claro"
        : "oscuro";

    setTema(guardado);
    aplicarTema(guardado);
  }, []);

  function cambiar(nuevoTema: Tema) {
    setTema(nuevoTema);
    aplicarTema(nuevoTema);
    localStorage.setItem("ryuka-tema", nuevoTema);
  }

  return (
    <div className="flex w-fit gap-1 rounded-xl border border-[var(--border)] bg-[var(--field)] p-1">
      <button
        type="button"
        onClick={() => cambiar("oscuro")}
        className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
          tema === "oscuro"
            ? "bg-[var(--accent)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        🌙 Oscuro
      </button>

      <button
        type="button"
        onClick={() => cambiar("claro")}
        className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
          tema === "claro"
            ? "bg-[var(--accent)] text-[var(--text)]"
            : "text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        ☀️ Claro
      </button>
    </div>
  );
}