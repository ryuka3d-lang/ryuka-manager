import type {
  Dispatch,
  SetStateAction,
} from "react";

export type ModoAccesorio =
  | "porUnidad"
  | "porPedido";

export type Accesorio = {
  id: string;
  nombre: string;
  activo: boolean;
  modo: ModoAccesorio;
  cantidad: string;
};

export type MaterialProducto = {
  id: string;
  material: string;
  color: string;
  gramosPorCama: string;
};

export type Producto = {
  nombre: string;
  categoria: string;
  descripcion: string;

  cantidadPorCama: string;
  pesoPorCama: string;
  colores: string;

  horas: string;
  minutos: string;

  horasTrabajoManualPorCama: string;
  minutosTrabajoManualPorCama: string;

  materiales: MaterialProducto[];
  accesorios: Accesorio[];
};

export type SetProducto =
  Dispatch<SetStateAction<Producto>>;