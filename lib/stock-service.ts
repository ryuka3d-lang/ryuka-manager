const BOBINAS_KEY = "ryuka-bobinas-filamento";
const MOVIMIENTOS_KEY = "ryuka-movimientos-filamento";

export type BobinaFilamento = {
  id: string;
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
  "id" | "creadoEn" | "actualizadoEn"
>;

export type TipoMovimientoFilamento = "entrada" | "salida" | "ajuste";

export type MovimientoFilamento = {
  id: string;
  bobinaId: string;
  bobinaDescripcion: string;
  tipo: TipoMovimientoFilamento;
  cantidadGramos: number;
  motivo: string;
  pedidoId: string | null;
  productoNombre: string | null;
  creadoEn: string;
};

function puedeUsarLocalStorage() {
  return typeof window !== "undefined";
}

function generarId(prefijo: string, existentes: Array<{ id: string }>) {
  const numeros = existentes.map((item) => {
    const numero = Number(item.id.replace(`${prefijo}-`, ""));
    return Number.isNaN(numero) ? 0 : numero;
  });

  const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
  return `${prefijo}-${String(siguiente).padStart(4, "0")}`;
}

function guardarBobinas(bobinas: BobinaFilamento[]) {
  if (!puedeUsarLocalStorage()) return;
  localStorage.setItem(BOBINAS_KEY, JSON.stringify(bobinas));
}

function guardarMovimientos(movimientos: MovimientoFilamento[]) {
  if (!puedeUsarLocalStorage()) return;
  localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos));
}

function normalizarBobina(bobina: Partial<BobinaFilamento>): BobinaFilamento {
  const ahora = new Date().toISOString();

  return {
    id: bobina.id || "BOB-0000",
    material: (bobina.material || "PLA").trim().toUpperCase(),
    color: (bobina.color || "").trim(),
    marca: (bobina.marca || "").trim(),
    pesoInicialGramos: Number(bobina.pesoInicialGramos) || 0,
    pesoActualGramos: Number(bobina.pesoActualGramos) || 0,
    stockMinimoGramos: Number(bobina.stockMinimoGramos) || 0,
    precioCompra: Number(bobina.precioCompra) || 0,
    fechaCompra: bobina.fechaCompra || "",
    creadoEn: bobina.creadoEn || ahora,
    actualizadoEn: bobina.actualizadoEn || ahora,
  };
}

function normalizarMovimiento(
  movimiento: Partial<MovimientoFilamento>
): MovimientoFilamento {
  return {
    id: movimiento.id || "MOV-0000",
    bobinaId: movimiento.bobinaId || "",
    bobinaDescripcion: movimiento.bobinaDescripcion || "",
    tipo:
      movimiento.tipo === "entrada" || movimiento.tipo === "ajuste"
        ? movimiento.tipo
        : "salida",
    cantidadGramos: Number(movimiento.cantidadGramos) || 0,
    motivo: movimiento.motivo || "",
    pedidoId: movimiento.pedidoId || null,
    productoNombre: movimiento.productoNombre || null,
    creadoEn: movimiento.creadoEn || new Date().toISOString(),
  };
}

export function obtenerBobinas(): BobinaFilamento[] {
  if (!puedeUsarLocalStorage()) return [];
  const datos = localStorage.getItem(BOBINAS_KEY);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    if (!Array.isArray(parseados)) return [];

    const normalizadas = parseados.map(normalizarBobina);
    guardarBobinas(normalizadas);
    return normalizadas;
  } catch {
    console.error("No se pudieron leer las bobinas.");
    return [];
  }
}

export function obtenerBobinaPorId(id: string): BobinaFilamento | null {
  return obtenerBobinas().find((bobina) => bobina.id === id) || null;
}

export function obtenerMovimientosFilamento(): MovimientoFilamento[] {
  if (!puedeUsarLocalStorage()) return [];
  const datos = localStorage.getItem(MOVIMIENTOS_KEY);
  if (!datos) return [];

  try {
    const parseados = JSON.parse(datos);
    if (!Array.isArray(parseados)) return [];

    const normalizados = parseados.map(normalizarMovimiento);
    guardarMovimientos(normalizados);
    return normalizados;
  } catch {
    console.error("No se pudieron leer los movimientos de filamento.");
    return [];
  }
}

export function obtenerMovimientosDeBobina(
  bobinaId: string
): MovimientoFilamento[] {
  return obtenerMovimientosFilamento()
    .filter((movimiento) => movimiento.bobinaId === bobinaId)
    .sort(
      (a, b) =>
        new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
    );
}

export function guardarBobina(
  datos: NuevaBobinaFilamento
): BobinaFilamento {
  const bobinas = obtenerBobinas();
  const movimientos = obtenerMovimientosFilamento();
  const ahora = new Date().toISOString();

  const nueva = normalizarBobina({
    ...datos,
    id: generarId("BOB", bobinas),
    creadoEn: ahora,
    actualizadoEn: ahora,
  });

  guardarBobinas([...bobinas, nueva]);

  const movimientoInicial: MovimientoFilamento = {
    id: generarId("MOV", movimientos),
    bobinaId: nueva.id,
    bobinaDescripcion: crearDescripcionBobina(nueva),
    tipo: "entrada",
    cantidadGramos: nueva.pesoActualGramos,
    motivo: "Carga inicial de bobina",
    pedidoId: null,
    productoNombre: null,
    creadoEn: ahora,
  };

  guardarMovimientos([movimientoInicial, ...movimientos]);
  return nueva;
}

export function editarBobina(
  id: string,
  cambios: Partial<NuevaBobinaFilamento>
): BobinaFilamento | null {
  const bobinas = obtenerBobinas();
  const existente = bobinas.find((bobina) => bobina.id === id);
  if (!existente) return null;

  const actualizada = normalizarBobina({
    ...existente,
    ...cambios,
    id: existente.id,
    creadoEn: existente.creadoEn,
    actualizadoEn: new Date().toISOString(),
  });

  guardarBobinas(
    bobinas.map((bobina) => (bobina.id === id ? actualizada : bobina))
  );

  return actualizada;
}

export function eliminarBobina(id: string): boolean {
  const bobinas = obtenerBobinas();
  const actualizadas = bobinas.filter((bobina) => bobina.id !== id);
  if (actualizadas.length === bobinas.length) return false;

  guardarBobinas(actualizadas);
  return true;
}

export function registrarMovimientoFilamento(
  bobinaId: string,
  tipo: TipoMovimientoFilamento,
  cantidadGramos: number,
  motivo: string,
  pedidoId: string | null = null,
  productoNombre: string | null = null
): MovimientoFilamento | null {
  const bobinas = obtenerBobinas();
  const bobina = bobinas.find((actual) => actual.id === bobinaId);
  if (!bobina) return null;

  const cantidad = Math.abs(Number(cantidadGramos)) || 0;
  if (cantidad <= 0) return null;

  const variacion =
    tipo === "entrada"
      ? cantidad
      : tipo === "salida"
        ? -cantidad
        : Number(cantidadGramos);

  const nuevoPeso = bobina.pesoActualGramos + variacion;
  if (nuevoPeso < 0) return null;

  const actualizada: BobinaFilamento = {
    ...bobina,
    pesoActualGramos: nuevoPeso,
    actualizadoEn: new Date().toISOString(),
  };

  guardarBobinas(
    bobinas.map((actual) =>
      actual.id === bobinaId ? actualizada : actual
    )
  );

  const movimientos = obtenerMovimientosFilamento();
  const movimiento: MovimientoFilamento = {
    id: generarId("MOV", movimientos),
    bobinaId: bobina.id,
    bobinaDescripcion: crearDescripcionBobina(bobina),
    tipo,
    cantidadGramos: tipo === "ajuste" ? Number(cantidadGramos) : cantidad,
    motivo: motivo.trim(),
    pedidoId,
    productoNombre,
    creadoEn: new Date().toISOString(),
  };

  guardarMovimientos([movimiento, ...movimientos]);
  return movimiento;
}

export function pedidoYaConsumioFilamento(pedidoId: string) {
  return obtenerMovimientosFilamento().some(
    (movimiento) =>
      movimiento.tipo === "salida" && movimiento.pedidoId === pedidoId
  );
}

export function reponerFilamentoDePedido(pedidoId: string): boolean {
  const movimientos = obtenerMovimientosFilamento();
  const salidas = movimientos.filter(
    (movimiento) =>
      movimiento.tipo === "salida" && movimiento.pedidoId === pedidoId
  );

  if (salidas.length === 0) return false;

  const identificadorReposicion = `REPOSICION:${pedidoId}`;
  const yaRepuesto = movimientos.some(
    (movimiento) => movimiento.pedidoId === identificadorReposicion
  );

  if (yaRepuesto) return false;

  for (const salida of salidas) {
    registrarMovimientoFilamento(
      salida.bobinaId,
      "entrada",
      salida.cantidadGramos,
      `Reposición por eliminación de ${pedidoId}`,
      identificadorReposicion,
      salida.productoNombre
    );
  }

  return true;
}

export function crearDescripcionBobina(bobina: BobinaFilamento) {
  return [bobina.id, bobina.material, bobina.color, bobina.marca]
    .filter(Boolean)
    .join(" · ");
}
