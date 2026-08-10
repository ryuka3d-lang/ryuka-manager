"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { calcularPresupuesto } from "../../lib/cost-engine";

import {
  cargarPresupuestosDesdeNube,
  eliminarPresupuesto,
  guardarPresupuesto,
  obtenerPresupuestos,
  type PresupuestoGuardado,
  type PresupuestoItemGuardado,
} from "../../lib/budget-service";

import {
  cargarProductosDesdeNube,
  obtenerProductos,
  type ProductoGuardado,
} from "../../lib/product-service";

import {
  DEFAULT_BUDGET_CONFIG,
  obtenerConfiguracionPresupuesto,
} from "../../lib/budget-config";

import {
  cargarClientesDesdeNube,
  obtenerClientes,
  type ClienteGuardado,
} from "../../lib/client-service";

import type { Accesorio } from "../types/producto";
import type { PrecioFinalVenta } from "../components/budget/SaleSimulatorCard";

export type DatosPresupuesto = {
  clienteId?: string;
  cliente: string;
  producto: string;
  cantidadSolicitada: string;

  horasTrabajoPersonal: string;
  minutosTrabajoPersonal: string;

  cantidadPorCama: string;
  pesoPorCama: string;
  colores: string;
  horasPorCama: string;
  minutosPorCama: string;
};

const PRESUPUESTO_INICIAL: DatosPresupuesto = {
  clienteId: undefined,
  cliente: "",
  producto: "",
  cantidadSolicitada: "",

  horasTrabajoPersonal: "",
  minutosTrabajoPersonal: "",

  cantidadPorCama: "",
  pesoPorCama: "",
  colores: "",
  horasPorCama: "",
  minutosPorCama: "",
};

const PRECIOS_INICIALES: PrecioFinalVenta = {
  mayoristaUnitario: 0,
  mayoristaTotal: 0,
  mayoristaGanancia: 0,

  minoristaUnitario: 0,
  minoristaTotal: 0,
  minoristaGanancia: 0,
};

export default function useBudget() {
  const [clientes, setClientes] =
    useState<ClienteGuardado[]>([]);

  const [productos, setProductos] =
    useState<ProductoGuardado[]>([]);

  const [
    productoSeleccionadoId,
    setProductoSeleccionadoId,
  ] = useState("");

  const [presupuesto, setPresupuesto] =
    useState<DatosPresupuesto>(
      PRESUPUESTO_INICIAL
    );

  const [
    accesoriosPresupuesto,
    setAccesoriosPresupuesto,
  ] = useState<Accesorio[]>([]);

  const [
    horasImpresionDiaPedido,
    setHorasImpresionDiaPedido,
  ] = useState("12");

  const [
    usarHorasPersonalizadas,
    setUsarHorasPersonalizadas,
  ] = useState(false);

  const [
    preciosFinales,
    setPreciosFinales,
  ] = useState<PrecioFinalVenta>(
    PRECIOS_INICIALES
  );

  const [
    itemsPresupuesto,
    setItemsPresupuesto,
  ] = useState<PresupuestoItemGuardado[]>([]);

  const [
    presupuestosGuardados,
    setPresupuestosGuardados,
  ] = useState<PresupuestoGuardado[]>([]);

  const [config, setConfig] = useState(
    DEFAULT_BUDGET_CONFIG
  );

  useEffect(() => {
    setClientes(obtenerClientes());

    void cargarClientesDesdeNube()
      .then(setClientes)
      .catch((error) => {
        console.error(
          "No se pudieron cargar los clientes desde Supabase:",
          error
        );
      });

    setProductos(obtenerProductos());

    void cargarProductosDesdeNube()
      .then(setProductos)
      .catch((error) => {
        console.error(
          "No se pudieron cargar los productos desde Supabase:",
          error
        );
      });

    setPresupuestosGuardados(
      obtenerPresupuestos()
    );

    void cargarPresupuestosDesdeNube()
      .then(setPresupuestosGuardados)
      .catch((error) => {
        console.error(
          "No se pudieron cargar los presupuestos desde Supabase:",
          error
        );
      });

    const configCargada =
      obtenerConfiguracionPresupuesto();

    setConfig(configCargada);

    setHorasImpresionDiaPedido(
      String(configCargada.horasImpresionDia)
    );

    setUsarHorasPersonalizadas(
      ![8, 12, 18, 24].includes(
        configCargada.horasImpresionDia
      )
    );
  }, []);

  const productoSeleccionado = useMemo(
    () =>
      productos.find(
        (producto) =>
          producto.id ===
          productoSeleccionadoId
      ),
    [productos, productoSeleccionadoId]
  );

  function actualizarPresupuesto(
    cambios: Partial<DatosPresupuesto>
  ) {
    setPresupuesto(
      (presupuestoActual) => ({
        ...presupuestoActual,
        ...cambios,
      })
    );
  }

  function limpiarProductoActual() {
    setProductoSeleccionadoId("");

    setPresupuesto((actual) => ({
      ...PRESUPUESTO_INICIAL,
      clienteId: actual.clienteId,
      cliente: actual.cliente,
    }));

    setAccesoriosPresupuesto([]);
    setPreciosFinales(PRECIOS_INICIALES);
  }

  function seleccionarProducto(id: string) {
    setProductoSeleccionadoId(id);

    const productoEncontrado =
      productos.find(
        (producto) => producto.id === id
      );

    if (!productoEncontrado) {
      setPresupuesto(
        (presupuestoActual) => ({
          ...presupuestoActual,
          producto: "",
          cantidadPorCama: "",
          pesoPorCama: "",
          colores: "",
          horasPorCama: "",
          minutosPorCama: "",
        })
      );

      setAccesoriosPresupuesto([]);
      setPreciosFinales(PRECIOS_INICIALES);
      return;
    }

    setPresupuesto(
      (presupuestoActual) => ({
        ...presupuestoActual,
        producto: productoEncontrado.nombre,
        cantidadPorCama:
          productoEncontrado.cantidadPorCama,
        pesoPorCama:
          productoEncontrado.pesoPorCama,
        colores: productoEncontrado.colores,
        horasPorCama:
          productoEncontrado.horas,
        minutosPorCama:
          productoEncontrado.minutos,
      })
    );

    setAccesoriosPresupuesto(
      productoEncontrado.accesorios.map(
        (accesorio) => ({
          ...accesorio,
        })
      )
    );

    setPreciosFinales(PRECIOS_INICIALES);
  }

  function actualizarAccesorio(
    id: string,
    cambios: Partial<Accesorio>
  ) {
    setAccesoriosPresupuesto(
      (accesoriosActuales) =>
        accesoriosActuales.map(
          (accesorio) =>
            accesorio.id === id
              ? {
                  ...accesorio,
                  ...cambios,
                }
              : accesorio
        )
    );
  }

  function seleccionarHorasRapidas(
    horas: number
  ) {
    setHorasImpresionDiaPedido(
      String(horas)
    );

    setUsarHorasPersonalizadas(false);
  }

  const horasDiariasCalculadas = Math.min(
    24,
    Math.max(
      1,
      Number(horasImpresionDiaPedido) || 1
    )
  );

  const cantidadSolicitadaNumero = Number(
    presupuesto.cantidadSolicitada || 0
  );

  const cantidadPorCamaNumero = Math.max(
    1,
    Number(
      presupuesto.cantidadPorCama || 1
    )
  );

  const camasCalculadas =
    cantidadSolicitadaNumero > 0
      ? Math.ceil(
          cantidadSolicitadaNumero /
            cantidadPorCamaNumero
        )
      : 0;

  const minutosManualPorCama =
    Number(
      productoSeleccionado
        ?.horasTrabajoManualPorCama || 0
    ) *
      60 +
    Number(
      productoSeleccionado
        ?.minutosTrabajoManualPorCama || 0
    );

  const minutosTrabajoManualBase =
    camasCalculadas *
    minutosManualPorCama;

  const minutosTrabajoExtra =
    Number(
      presupuesto.horasTrabajoPersonal || 0
    ) *
      60 +
    Number(
      presupuesto.minutosTrabajoPersonal ||
        0
    );

  const minutosTrabajoPersonalTotal =
    minutosTrabajoManualBase +
    minutosTrabajoExtra;

  const horasTrabajoPersonalParaCalculo =
    Math.floor(
      minutosTrabajoPersonalTotal / 60
    );

  const minutosTrabajoPersonalParaCalculo =
    minutosTrabajoPersonalTotal % 60;

  const resultado = calcularPresupuesto(
    {
      cantidadSolicitada:
        cantidadSolicitadaNumero,

      cantidadPorCama: Number(
        presupuesto.cantidadPorCama || 1
      ),

      pesoPorCama: Number(
        presupuesto.pesoPorCama || 0
      ),

      horasPorCama: Number(
        presupuesto.horasPorCama || 0
      ),

      minutosPorCama: Number(
        presupuesto.minutosPorCama || 0
      ),

      horasTrabajoPersonal:
        horasTrabajoPersonalParaCalculo,

      minutosTrabajoPersonal:
        minutosTrabajoPersonalParaCalculo,

      colores: Number(
        presupuesto.colores || 0
      ),

      accesorios: accesoriosPresupuesto,
    },
    {
      ...config,
      horasImpresionDia:
        horasDiariasCalculadas,
    }
  );

  const totalesPresupuesto = useMemo(
    () => ({
      costoTotal: itemsPresupuesto.reduce(
        (total, item) =>
          total + item.totalCost,
        0
      ),

      mayoristaTotal: itemsPresupuesto.reduce(
        (total, item) =>
          total + item.wholesaleTotal,
        0
      ),

      mayoristaGanancia:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.wholesaleProfit,
          0
        ),

      minoristaTotal: itemsPresupuesto.reduce(
        (total, item) =>
          total + item.retailTotal,
        0
      ),

      minoristaGanancia:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.retailProfit,
          0
        ),

      tiempoTotalMinutos:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.totalPrintMinutes,
          0
        ),

      trabajoManualMinutos:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.manualMinutes,
          0
        ),

      pesoTotalGramos:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.totalWeightGrams,
          0
        ),

      kilosFilamento:
        itemsPresupuesto.reduce(
          (total, item) =>
            total + item.filamentKilos,
          0
        ),

      diasProduccion: Math.max(
        0,
        ...itemsPresupuesto.map(
          (item) => item.productionDays
        )
      ),
    }),
    [itemsPresupuesto]
  );

  function agregarProductoAlPresupuesto() {
    if (!productoSeleccionado) {
      alert("Seleccioná un producto.");
      return;
    }

    if (cantidadSolicitadaNumero <= 0) {
      alert("Ingresá una cantidad válida.");
      return;
    }

    if (
      preciosFinales.mayoristaUnitario <= 0 ||
      preciosFinales.minoristaUnitario <= 0
    ) {
      alert(
        "Definí los precios finales antes de agregar el producto."
      );
      return;
    }

    const nuevoItem: PresupuestoItemGuardado = {
      productId: productoSeleccionado.id,
      productCode:
        productoSeleccionado.codigo,
      productName:
        productoSeleccionado.nombre,
      quantity: cantidadSolicitadaNumero,

      hoursPerDay: horasDiariasCalculadas,
      productionDays:
        resultado.diasProduccion,
      totalPrintMinutes:
        resultado.tiempoTotalMinutos,
      manualMinutes:
        minutosTrabajoPersonalTotal,

      totalWeightGrams: resultado.pesoTotal,
      filamentKilos:
        resultado.kilosFilamento,

      accessories:
        accesoriosPresupuesto.map(
          (accesorio) => ({
            ...accesorio,
          })
        ),

      unitCost: resultado.costoPorUnidad,
      totalCost: resultado.costoTotal,

      wholesaleUnitPrice:
        preciosFinales.mayoristaUnitario,
      wholesaleTotal:
        preciosFinales.mayoristaTotal,
      wholesaleProfit:
        preciosFinales.mayoristaGanancia,

      retailUnitPrice:
        preciosFinales.minoristaUnitario,
      retailTotal:
        preciosFinales.minoristaTotal,
      retailProfit:
        preciosFinales.minoristaGanancia,
    };

    setItemsPresupuesto(
      (itemsActuales) => [
        ...itemsActuales,
        nuevoItem,
      ]
    );

    limpiarProductoActual();
  }

  function eliminarItemPresupuesto(
    indice: number
  ) {
    setItemsPresupuesto(
      (itemsActuales) =>
        itemsActuales.filter(
          (_, indiceActual) =>
            indiceActual !== indice
        )
    );
  }

  async function manejarGuardarPresupuesto() {
    if (!presupuesto.cliente.trim()) {
      alert(
        "Ingresá el nombre del cliente."
      );
      return;
    }

    if (itemsPresupuesto.length === 0) {
      alert(
        "Agregá al menos un producto al presupuesto."
      );
      return;
    }

    const primerItem = itemsPresupuesto[0];

    const presupuestoGuardado =
      await guardarPresupuesto({
        clienteId: presupuesto.clienteId,
        cliente:
          presupuesto.cliente.trim(),

        items: itemsPresupuesto,

        productoId: primerItem.productId,
        productoCodigo:
          primerItem.productCode,
        productoNombre:
          primerItem.productName,
        cantidad: primerItem.quantity,

        horasImpresionDia:
          primerItem.hoursPerDay,

        diasProduccion:
          totalesPresupuesto.diasProduccion,

        tiempoTotalMinutos:
          totalesPresupuesto.tiempoTotalMinutos,

        trabajoManualMinutos:
          totalesPresupuesto.trabajoManualMinutos,

        pesoTotalGramos:
          totalesPresupuesto.pesoTotalGramos,

        kilosFilamento:
          totalesPresupuesto.kilosFilamento,

        accesorios:
          primerItem.accessories,

        costoTotal:
          totalesPresupuesto.costoTotal,

        costoPorUnidad:
          primerItem.unitCost,

        precioMayoristaUnitario:
          primerItem.wholesaleUnitPrice,

        precioMayoristaTotal:
          totalesPresupuesto.mayoristaTotal,

        gananciaMayorista:
          totalesPresupuesto.mayoristaGanancia,

        precioMinoristaUnitario:
          primerItem.retailUnitPrice,

        precioMinoristaTotal:
          totalesPresupuesto.minoristaTotal,

        gananciaMinorista:
          totalesPresupuesto.minoristaGanancia,
      });

    setPresupuestosGuardados(
      (presupuestosActuales) => [
        ...presupuestosActuales,
        presupuestoGuardado,
      ]
    );

    setItemsPresupuesto([]);

    setPresupuesto(
      PRESUPUESTO_INICIAL
    );

    limpiarProductoActual();

    alert(
      `Presupuesto ${presupuestoGuardado.id} guardado correctamente.`
    );
  }

  async function manejarEliminarPresupuesto(
    id: string
  ) {
    const confirmar = window.confirm(
      `¿Querés eliminar el presupuesto ${id}?`
    );

    if (!confirmar) return;

    const eliminado =
      await eliminarPresupuesto(id);

    if (!eliminado) {
      alert(
        "No se pudo eliminar el presupuesto."
      );
      return;
    }

    setPresupuestosGuardados(
      (presupuestosActuales) =>
        presupuestosActuales.filter(
          (presupuestoGuardado) =>
            presupuestoGuardado.id !== id
        )
    );
  }

  return {
    clientes,
    productos,
    productoSeleccionadoId,
    productoSeleccionado,

    presupuesto,
    actualizarPresupuesto,
    seleccionarProducto,

    accesoriosPresupuesto,
    actualizarAccesorio,

    horasImpresionDiaPedido,
    usarHorasPersonalizadas,
    horasDiariasCalculadas,
    setHorasImpresionDiaPedido,
    setUsarHorasPersonalizadas,
    seleccionarHorasRapidas,

    config,
    resultado,

    camasCalculadas,
    minutosManualPorCama,
    minutosTrabajoManualBase,
    minutosTrabajoExtra,
    minutosTrabajoPersonalTotal,

    preciosFinales,
    setPreciosFinales,

    itemsPresupuesto,
    totalesPresupuesto,
    agregarProductoAlPresupuesto,
    eliminarItemPresupuesto,

    presupuestosGuardados,
    manejarGuardarPresupuesto,
    manejarEliminarPresupuesto,
  };
}
