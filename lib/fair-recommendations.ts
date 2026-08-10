import type { ProductoGuardado } from "./product-service";

export type IdeaFeria = {
  titulo: string;
  descripcion: string;
  busquedas: string[];
};

export type RecomendacionCatalogo = {
  producto: ProductoGuardado;
  puntaje: number;
  motivo: string;
};

type PerfilFeria = {
  keywords: string[];
  ideas: IdeaFeria[];
};

const PERFILES: Record<string, PerfilFeria> = {
  "Anime / Geek": {
    keywords: [
      "anime",
      "manga",
      "pokemon",
      "naruto",
      "dragon ball",
      "goku",
      "otaku",
      "geek",
      "llavero",
      "señalador",
      "figura",
    ],
    ideas: [
      {
        titulo: "Llaveros temáticos",
        descripcion:
          "Producto de compra impulsiva, fácil de variar por personaje o serie.",
        busquedas: [
          "anime keychain",
          "manga keychain",
          "pokemon keychain",
        ],
      },
      {
        titulo: "Señaladores y bookmarks",
        descripcion:
          "Livianos, rápidos de producir y fáciles de ofrecer en variedad.",
        busquedas: [
          "anime bookmark",
          "manga bookmark",
          "pokemon bookmark",
        ],
      },
      {
        titulo: "Soportes para celular",
        descripcion:
          "Producto funcional con margen para personalización temática.",
        busquedas: [
          "anime phone stand",
          "pokemon phone stand",
          "geek phone holder",
        ],
      },
      {
        titulo: "Mini figuras articuladas",
        descripcion:
          "Atractivas para exhibición y venta por impulso.",
        busquedas: [
          "articulated anime",
          "flexi pokemon",
          "mini articulated dragon",
        ],
      },
    ],
  },

  Escuela: {
    keywords: [
      "escuela",
      "colegio",
      "lapiz",
      "lápiz",
      "nombre",
      "señalador",
      "llavero",
      "organizador",
      "estudiante",
    ],
    ideas: [
      {
        titulo: "Llaveros con nombre",
        descripcion:
          "Personalizables y fáciles de adaptar a cursos o colores.",
        busquedas: [
          "custom name keychain",
          "student name tag keychain",
          "school keychain",
        ],
      },
      {
        titulo: "Señaladores",
        descripcion:
          "Bajo costo, poco material y buena variedad para estudiantes.",
        busquedas: [
          "bookmark school",
          "cute bookmark",
          "name bookmark",
        ],
      },
      {
        titulo: "Organizadores de escritorio",
        descripcion:
          "Producto funcional para lápices, notas o accesorios.",
        busquedas: [
          "desk organizer student",
          "pencil holder school",
          "small desk organizer",
        ],
      },
    ],
  },

  "Atletismo / Running": {
    keywords: [
      "running",
      "atletismo",
      "runner",
      "maraton",
      "maratón",
      "medalla",
      "dorsal",
      "zapatilla",
      "deporte",
      "llavero",
    ],
    ideas: [
      {
        titulo: "Llaveros running",
        descripcion:
          "Buen producto de recuerdo, fácil de adaptar con distancia, fecha o logo.",
        busquedas: [
          "running keychain",
          "runner keychain",
          "marathon keychain",
        ],
      },
      {
        titulo: "Medalleros",
        descripcion:
          "Producto de mayor ticket para corredores que acumulan medallas.",
        busquedas: [
          "medal holder running",
          "marathon medal hanger",
          "running medal display",
        ],
      },
      {
        titulo: "Porta dorsales",
        descripcion:
          "Producto funcional y específico del público de carreras.",
        busquedas: [
          "race bib holder",
          "running bib holder",
          "marathon bib display",
        ],
      },
      {
        titulo: "Mini zapatillas y trofeos",
        descripcion:
          "Funcionan como souvenir o premio económico.",
        busquedas: [
          "running shoe keychain",
          "mini running shoe",
          "running trophy",
        ],
      },
    ],
  },

  Fitness: {
    keywords: [
      "fitness",
      "gym",
      "gimnasio",
      "mancuerna",
      "pesas",
      "crossfit",
      "proteina",
      "proteína",
      "suplemento",
      "llavero",
    ],
    ideas: [
      {
        titulo: "Llaveros fitness",
        descripcion:
          "Mancuernas, discos y elementos de gimnasio funcionan bien como souvenir.",
        busquedas: [
          "gym keychain",
          "dumbbell keychain",
          "weight plate keychain",
        ],
      },
      {
        titulo: "Accesorios para suplementos",
        descripcion:
          "Productos funcionales vinculados a proteína, creatina y shaker.",
        busquedas: [
          "protein scoop holder",
          "creatine container",
          "supplement organizer",
        ],
      },
      {
        titulo: "Soportes para auriculares",
        descripcion:
          "Producto funcional y relacionado con entrenamiento.",
        busquedas: [
          "gym headphone holder",
          "headphone stand",
          "earbud holder gym",
        ],
      },
    ],
  },

  Emprendedores: {
    keywords: [
      "emprendedor",
      "negocio",
      "exhibidor",
      "display",
      "qr",
      "cartel",
      "organizador",
      "stand",
      "logo",
    ],
    ideas: [
      {
        titulo: "Exhibidores y stands",
        descripcion:
          "Útiles para otros emprendedores y fáciles de mostrar en el propio stand.",
        busquedas: [
          "product display stand",
          "market display stand",
          "small retail display",
        ],
      },
      {
        titulo: "Carteles QR",
        descripcion:
          "Producto funcional para pagos, redes o menú.",
        busquedas: [
          "qr code stand",
          "payment qr stand",
          "instagram qr stand",
        ],
      },
      {
        titulo: "Porta tarjetas",
        descripcion:
          "Pequeños, económicos y útiles para ferias.",
        busquedas: [
          "business card holder",
          "business card stand",
          "market card holder",
        ],
      },
    ],
  },

  Música: {
    keywords: [
      "musica",
      "música",
      "guitarra",
      "rock",
      "banda",
      "llavero",
      "pick",
      "pua",
      "púa",
      "vinilo",
    ],
    ideas: [
      {
        titulo: "Llaveros musicales",
        descripcion:
          "Guitarras, notas, discos y logos son fáciles de adaptar.",
        busquedas: [
          "music keychain",
          "guitar keychain",
          "rock keychain",
        ],
      },
      {
        titulo: "Porta púas",
        descripcion:
          "Producto pequeño y funcional para músicos.",
        busquedas: [
          "guitar pick holder",
          "pick holder keychain",
          "guitar pick case",
        ],
      },
      {
        titulo: "Soportes para auriculares",
        descripcion:
          "Producto de ticket medio y muy relacionado con música.",
        busquedas: [
          "headphone stand music",
          "headphone holder",
          "headset stand",
        ],
      },
    ],
  },

  Navidad: {
    keywords: [
      "navidad",
      "christmas",
      "ornamento",
      "adorno",
      "arbol",
      "árbol",
      "regalo",
      "estrella",
    ],
    ideas: [
      {
        titulo: "Adornos para árbol",
        descripcion:
          "Bajo material, variedad alta y posibilidad de personalización.",
        busquedas: [
          "christmas ornament",
          "personalized christmas ornament",
          "christmas tree decoration",
        ],
      },
      {
        titulo: "Llaveros navideños",
        descripcion:
          "Producto económico para compra impulsiva o regalo.",
        busquedas: [
          "christmas keychain",
          "santa keychain",
          "snowman keychain",
        ],
      },
      {
        titulo: "Decoración de mesa",
        descripcion:
          "Permite sumar productos de ticket medio.",
        busquedas: [
          "christmas table decoration",
          "christmas village",
          "christmas desk decor",
        ],
      },
    ],
  },

  Otro: {
    keywords: [
      "llavero",
      "señalador",
      "organizador",
      "soporte",
      "display",
      "cartel",
    ],
    ideas: [
      {
        titulo: "Llaveros temáticos",
        descripcion:
          "Una opción versátil que se adapta fácilmente a casi cualquier público.",
        busquedas: [
          "themed keychain",
          "custom keychain",
          "souvenir keychain",
        ],
      },
      {
        titulo: "Productos funcionales pequeños",
        descripcion:
          "Conviene buscar objetos rápidos y fáciles de vender por impulso.",
        busquedas: [
          "small useful 3d print",
          "quick print useful",
          "market 3d print",
        ],
      },
    ],
  },
};

function textoProducto(
  producto: ProductoGuardado
) {
  return [
    producto.nombre,
    producto.categoria,
    producto.descripcion,
    ...producto.materiales.map(
      (material) =>
        `${material.material} ${material.color}`
    ),
  ]
    .join(" ")
    .toLocaleLowerCase("es-AR");
}

export function obtenerIdeasFeria(
  tipo: string
): IdeaFeria[] {
  return (
    PERFILES[tipo]?.ideas ??
    PERFILES.Otro.ideas
  );
}

export function recomendarCatalogo(
  tipo: string,
  productos: ProductoGuardado[]
): RecomendacionCatalogo[] {
  const perfil =
    PERFILES[tipo] ?? PERFILES.Otro;

  return productos
    .map((producto) => {
      const texto = textoProducto(producto);

      const coincidencias = perfil.keywords.filter(
        (keyword) =>
          texto.includes(
            keyword.toLocaleLowerCase("es-AR")
          )
      );

      const minutosPorCama =
        Number(producto.horas || 0) * 60 +
        Number(producto.minutos || 0);

      let puntaje = coincidencias.length * 12;

      if (minutosPorCama > 0 && minutosPorCama <= 120) {
        puntaje += 5;
      }

      if (
        Number(producto.pesoPorCama || 0) > 0 &&
        Number(producto.pesoPorCama || 0) <= 120
      ) {
        puntaje += 3;
      }

      return {
        producto,
        puntaje,
        motivo:
          coincidencias.length > 0
            ? `Coincide con ${coincidencias
                .slice(0, 3)
                .join(", ")}`
            : "Producto del catálogo",
      };
    })
    .filter((item) => item.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 5);
}

export function urlBusqueda(
  sitio: "printables" | "makerworld" | "cults3d",
  termino: string
) {
  const query = encodeURIComponent(
    termino.trim()
  ).replace(/%20/g, "+");

  if (sitio === "makerworld") {
    return `https://makerworld.com/en/search/models?keyword=${query}`;
  }

  if (sitio === "cults3d") {
    return `https://cults3d.com/en/search?q=${query}`;
  }

  return `https://www.printables.com/search/models?ctx=models&q=${query}`;
}
