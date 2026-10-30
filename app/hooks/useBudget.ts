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
  type TipoMensajeWhatsapp,
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

export type DatosPresupuestoRapido = {
  nombre: string;
  cantidad: string;
  cantidadPorCama: string;
  pesoPorCama: string;
  horasPorCama: string;
  minutosPorCama: string;
  horasManual: string;
  minutosManual: string;
  precioMayoristaUnitario: string;
  precioMinoristaUnitario: string;
  accesorios: Accesorio[];
};

const PRESUPUESTO_RAPIDO_INICIAL: DatosPresupuestoRapido = {
  nombre: "",
  cantidad: "",
  cantidadPorCama: "",
  pesoPorCama: "",
  horasPorCama: "",
  minutosPorCama: "",
  horasManual: "",
  minutosManual: "",
  precioMayoristaUnitario: "",
  precioMinoristaUnitario: "",
  accesorios: [],
};

export type MensajeWhatsappPendiente = {
  tipo: TipoMensajeWhatsapp;
  texto: string;
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
    presupuestoRapido,
    setPresupuestoRapido,
  ] = useState<DatosPresupuestoRapido>(
    PRESUPUESTO_RAPIDO_INICIAL
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
    mensajeWhatsappPendiente,
    setMensajeWhatsappPendiente,
  ] = useState<MensajeWhatsappPendiente | null>(
    null
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
      .catch((error: unknown) => {
        console.error(
          "No se pudieron cargar los clientes desde Supabase:",
          error
        );
      });

    setProductos(obtenerProductos());

    void cargarProductosDesdeNube()
      .then(setProductos)
      .catch((error: unknown) => {
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
      .catch((error: unknown) => {
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

  useEffect(() => {
    function manejarMensajeCopiado(
      evento: Event
    ) {
      const detalle = (
        evento as CustomEvent<{
          tipo: TipoMensajeWhatsapp;
          mensaje: string;
        }>
      ).detail;

      if (detalle && detalle.mensaje) {
        registrarMensajeWhatsapp(
          detalle.tipo,
          detalle.mensaje
        );
      }
    }

    window.addEventListener(
      "ryuka-whatsapp-copied",
      manejarMensajeCopiado
    );

    return () => {
      window.removeEventListener(
        "ryuka-whatsapp-copied",
        manejarMensajeCopiado
      );
    };
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

  function actualizarPresupuestoRapido(
    cambios: Partial<DatosPresupuestoRapido>
  ) {
    setPresupuestoRapido(
      (actual) => ({
        ...actual,
        ...cambios,
      })
    );
  }

  function registrarMensajeWhatsapp(
    tipo: TipoMensajeWhatsapp,
    texto: string
  ) {
    setMensajeWhatsappPendiente({ tipo, texto });
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

  function limpiarPresupuestoRapido() {
    setPresupuestoRapido(
      PRESUPUESTO_RAPIDO_INICIAL
    );
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

  function actualizarAccesorioRapido(
    id: string,
    cambios: Partial<Accesorio>
  ) {
    setPresupuestoRapido(
      (actual) => ({
        ...actual,
        accesorios: actual.accesorios.map(
          (accesorio) =>
            accesorio.id === id
              ? {
                  ...accesorio,
                  ...cambios,
                }
              : accesorio
        ),
      })
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

  const cantidadRapidaNumero = Number(
    presupuestoRapido.cantidad || 0
  );

  const cantidadPorCamaRapido = Math.max(
    1,
    Number(
      presupuestoRapido.cantidadPorCama || 1
    )
  );

  const pesoPorCamaRapido = Number(
    presupuestoRapido.pesoPorCama || 0
  );

  const minutosManualRapido =
    Number(
      presupuestoRapido.horasManual || 0
    ) *
      60 +
    Number(
      presupuestoRapido.minutosManual || 0
    );

  const horasManualRapido = Math.floor(
    minutosManualRapido / 60
  );

  const minutosManualRapidoResto =
    minutosManualRapido % 60;

  const resultadoRapido = calcularPresupuesto(
    {
      cantidadSolicitada:
        cantidadRapidaNumero,

      cantidadPorCama:
        cantidadPorCamaRapido,

      pesoPorCama: pesoPorCamaRapido,

      horasPorCama: Number(
        presupuestoRapido.horasPorCama || 0
      ),

      minutosPorCama: Number(
        presupuestoRapido.minutosPorCama || 0
      ),

      horasTrabajoPersonal:
        horasManualRapido,

      minutosTrabajoPersonal:
        minutosManualRapidoResto,

      colores: 0,

      accesorios:
        presupuestoRapido.accesorios,
    },
    {
      ...config,
      horasImpresionDia:
        horasDiariasCalculadas,
    }
  );

  const preciosSugeridosRapido = useMemo(() => {
    if (cantidadRapidaNumero <= 0) {
      return {
        mayoristaUnitario: 0,
        minoristaUnitario: 0,
      };
    }

    return {
      mayoristaUnitario:
        resultadoRapido.mayoristaPorUnidad,
      minoristaUnitario:
        resultadoRapido.minoristaPorUnidad,
    };
  }, [
    cantidadRapidaNumero,
    resultadoRapido.mayoristaPorUnidad,
    resultadoRapido.minoristaPorUnidad,
  ]);

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
        preciosFinales.mayoristaGanancia,
    };

    setItemsPresupuesto(
      (itemsActuales) => [
        ...itemsActuales,
        nuevoItem,
      ]
    );

    limpiarProductoActual();
  }

  function agregarItemRapido() {
    if (!presupuestoRapido.nombre.trim()) {
      alert("Ingresá un nombre para el ítem.");
      return;
    }

    if (cantidadRapidaNumero <= 0) {
      alert("Ingresá una cantidad válida.");
      return;
    }

    const precioMayoristaUnitario =
      Number(
        presupuestoRapido.precioMayoristaUnitario ||
          0
      ) || preciosSugeridosRapido.mayoristaUnitario;

    const precioMinoristaUnitario =
      Number(
        presupuestoRapido.precioMinoristaUnitario ||
          0
      ) || preciosSugeridosRapido.minoristaUnitario;

    if (
      precioMayoristaUnitario <= 0 ||
      precioMinoristaUnitario <= 0
    ) {
      alert(
        "Ingresá los datos de producción para calcular los precios automáticamente."
      );
      return;
    }

    const precioMayoristaTotal =
      precioMayoristaUnitario *
      cantidadRapidaNumero;

    const precioMinoristaTotal =
      precioMinoristaUnitario *
      cantidadRapidaNumero;

    const nuevoItem: PresupuestoItemGuardado = {
      productId: "",
      productCode: "RAPIDO",
      productName:
        presupuestoRapido.nombre.trim(),
      quantity: cantidadRapidaNumero,

      hoursPerDay: horasDiariasCalculadas,
      productionDays:
        resultadoRapido.diasProduccion,
      totalPrintMinutes:
        resultadoRapido.tiempoTotalMinutos,
      manualMinutes: minutosManualRapido,

      totalWeightGrams:
        resultadoRapido.pesoTotal,
      filamentKilos:
        resultadoRapido.kilosFilamento,

      accessories:
        presupuestoRapido.accesorios.map(
          (accesorio) => ({
            ...accesorio,
          })
        ),

      unitCost: resultadoRapido.costoPorUnidad,
      totalCost: resultadoRapido.costoTotal,

      wholesaleUnitPrice:
        precioMayoristaUnitario,
      wholesaleTotal: precioMayoristaTotal,
      wholesaleProfit:
        precioMayoristaTotal -
        resultadoRapido.costoTotal,

      retailUnitPrice:
        precioMinoristaUnitario,
      retailTotal: precioMinoristaTotal,
      retailProfit:
        precioMinoristaTotal -
        resultadoRapido.costoTotal,
    };

    setItemsPresupuesto(
      (itemsActuales) => [
        ...itemsActuales,
        nuevoItem,
      ]
    );

    limpiarPresupuestoRapido();
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

        mensajeWhatsapp:
          mensajeWhatsappPendiente?.texto ?? "",
        mensajeWhatsappTipo:
          mensajeWhatsappPendiente?.tipo ?? null,

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

    setPresupuesto(PRESUPUESTO_INICIAL);

    setMensajeWhatsappPendiente(null);

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

    presupuestoRapido,
    actualizarPresupuestoRapido,
    actualizarAccesorioRapido,
    agregarItemRapido,
    resultadoRapido,
    preciosSugeridosRapido,

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