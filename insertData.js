const database = require("./config/database");

async function insertResenas() {
  try {
    const db = await database.connect();

    console.log("\n⭐ INSERTANDO RESEÑAS ÚNICAS\n");
    console.log("=".repeat(70));

    // Limpiar colección existente
    await db.collection("resena").deleteMany({});

    // Plantillas base de comentarios por puntuación
    const comentariosBase = {
      5: [
        "Excelente hotel, superó todas nuestras expectativas",
        "Servicio impecable, instalaciones de primera",
        "Todo fue perfecto desde el check-in hasta el check-out",
        "La mejor estadía que hemos tenido",
        "Increíble atención al detalle",
        "Experiencia de 5 estrellas en todo sentido",
        "Nos encantó todo, desde la comida hasta las instalaciones",
        "Personal muy atento y profesional",
        "Ubicación perfecta y servicios excepcionales",
        "Una joya de hotel, todo estuvo impecable",
      ],
      4: [
        "Muy buena experiencia en general",
        "Hotel agradable con buen servicio",
        "Buena estadía, habitaciones cómodas",
        "Nos gustó mucho, aunque el wifi era un poco lento",
        "Instalaciones limpias y personal amable",
        "Recomendable, aunque el check-in tomó más tiempo",
        "Habitación cómoda y limpia",
        "Buena ubicación y servicios correctos",
        "Estadía agradable, personal servicial",
        "Buen hotel en general, la piscina estaba muy bien",
      ],
      3: [
        "Experiencia normal, nada excepcional",
        "Precio justo por lo que ofrece",
        "Aceptable para una noche, no es memorable",
        "Instalaciones algo antiguas pero limpias",
        "Esperaba un poco más por el precio",
        "Cumple con lo básico, la habitación necesita renovación",
        "Servicio promedio, la ubicación es su mejor punto",
        "Nada especial pero tampoco malo",
        "Relación calidad-precio regular",
        "Estadía sin sorpresas, todo bastante estándar",
      ],
      2: [
        "Decepcionante, las fotos no reflejan la realidad",
        "Habitación pequeña y ruidosa",
        "Servicio deficiente y limpieza cuestionable",
        "No cumplió nuestras expectativas",
        "Instalaciones descuidadas, personal no muy atento",
        "Mala experiencia, ruido excesivo durante la noche",
        "No recomendable, mejor buscar otras opciones",
        "Precio elevado para la calidad ofrecida",
        "Muchas cosas por mejorar",
        "Habitación con mantenimiento deficiente",
      ],
      1: [
        "Pésima experiencia, no recomiendo este hotel",
        "Terrible, problemas desde el inicio hasta el final",
        "Muy mala atención, instalaciones en mal estado",
        "Nunca volveré, una de las peores experiencias",
        "Inaceptable para el precio, todo estuvo mal",
        "Deplorable, limpieza inexistente y servicio pésimo",
        "No puedo recomendar este lugar",
        "Muy decepcionados, esperábamos mucho más",
        "Horrible experiencia, no pudieron resolver nada",
        "El peor hotel en el que nos hemos hospedado",
      ],
    };

    // Frases complementarias para crear variaciones
    const complementos = {
      positivos: [
        "El desayuno fue excepcional.",
        "La vista desde la habitación era espectacular.",
        "El spa es maravilloso.",
        "La limpieza es impecable.",
        "El personal siempre con una sonrisa.",
        "La piscina estaba perfecta.",
        "El restaurante tiene comida deliciosa.",
        "Las camas son muy cómodas.",
        "El aire acondicionado funciona perfecto.",
        "La decoración es hermosa.",
        "Volveremos sin duda.",
        "Altamente recomendado.",
        "Vale cada peso.",
        "Superó nuestras expectativas.",
        "Todo estuvo a la altura.",
      ],
      neutros: [
        "El desayuno es básico.",
        "La habitación es estándar.",
        "El wifi es funcional.",
        "La ubicación es conveniente.",
        "El precio es razonable.",
        "Las instalaciones están bien.",
        "El personal es correcto.",
        "Cumple con lo esperado.",
        "Es una opción viable.",
        "Nada fuera de lo común.",
      ],
      negativos: [
        "El ruido no nos dejó dormir.",
        "La limpieza dejó mucho que desear.",
        "El personal fue poco amable.",
        "Las instalaciones están viejas.",
        "No volveremos.",
        "Hay mejores opciones por el mismo precio.",
        "La habitación olía mal.",
        "El aire acondicionado no funcionaba bien.",
        "El wifi era muy lento.",
        "Esperábamos más.",
      ],
    };

    // Función para generar comentario único
    function generarComentarioUnico(puntuacion, usados) {
      let intentos = 0;
      let comentario = "";

      while (intentos < 100) {
        // Seleccionar base aleatoria
        const bases = comentariosBase[puntuacion];
        const base = bases[Math.floor(Math.random() * bases.length)];

        // Seleccionar complementos según puntuación
        let tipoComplemento;
        if (puntuacion >= 4) tipoComplemento = "positivos";
        else if (puntuacion === 3) tipoComplemento = "neutros";
        else tipoComplemento = "negativos";

        const complementosDisponibles = complementos[tipoComplemento];

        // Agregar 1-3 complementos aleatorios
        const numComplementos = Math.floor(Math.random() * 3) + 1;
        const complementosSeleccionados = [];

        for (let i = 0; i < numComplementos; i++) {
          const idx = Math.floor(
            Math.random() * complementosDisponibles.length
          );
          complementosSeleccionados.push(complementosDisponibles[idx]);
        }

        // Construir comentario final
        comentario = `${base}. ${complementosSeleccionados.join(" ")}`;

        // Verificar si es único
        if (!usados.has(comentario)) {
          usados.add(comentario);
          return comentario;
        }

        intentos++;
      }

      // Si no se pudo generar único, agregar timestamp
      comentario = `${comentario} (Ref: ${Date.now()}-${Math.random()})`;
      usados.add(comentario);
      return comentario;
    }

    // Generar 200 reseñas únicas
    const resenasArray = [];
    const comentariosUsados = new Set();
    const reservasDisponibles = [
      3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010,
    ];

    for (let i = 1; i <= 200; i++) {
      // Distribución de puntuaciones (más alta en 4 y 5 estrellas)
      let puntuacion;
      const rand = Math.random();
      if (rand < 0.35) puntuacion = 5; // 35% de 5 estrellas
      else if (rand < 0.65) puntuacion = 4; // 30% de 4 estrellas
      else if (rand < 0.8) puntuacion = 3; // 15% de 3 estrellas
      else if (rand < 0.92) puntuacion = 2; // 12% de 2 estrellas
      else puntuacion = 1; // 8% de 1 estrella

      // Generar comentario único
      const comentario = generarComentarioUnico(puntuacion, comentariosUsados);

      // Asignar a una reserva aleatoria
      const idReservaHabitacion =
        reservasDisponibles[
          Math.floor(Math.random() * reservasDisponibles.length)
        ];

      resenasArray.push({
        idResena: 7000 + i,
        idReservaHabitacion: idReservaHabitacion,
        comentario: comentario,
        puntuacion: puntuacion,
      });

      if (i % 50 === 0) {
        console.log(`   ⏳ Generadas ${i}/200 reseñas únicas...`);
      }
    }

    // Insertar todas las reseñas
    console.log("\n   💾 Insertando en base de datos...");
    const resenas = await db.collection("resena").insertMany(resenasArray);

    console.log(
      `   ✅ ${resenas.insertedCount} reseñas insertadas exitosamente`
    );

    // Verificar unicidad
    const pipeline = [
      {
        $group: {
          _id: "$comentario",
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ];

    const duplicados = await db
      .collection("resena")
      .aggregate(pipeline)
      .toArray();
    console.log(`   🔍 Comentarios duplicados: ${duplicados.length}`);

    // Mostrar resumen por puntuación
    console.log("\n📊 RESUMEN POR PUNTUACIÓN:");
    const resumenPipeline = [
      {
        $group: {
          _id: "$puntuacion",
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ];

    const resumen = await db
      .collection("resena")
      .aggregate(resumenPipeline)
      .toArray();

    resumen.forEach((r) => {
      const estrellas = "⭐".repeat(r._id);
      const porcentaje = ((r.cantidad / 200) * 100).toFixed(1);
      console.log(
        `   ${estrellas} ${r._id} estrellas: ${r.cantidad} reseñas (${porcentaje}%)`
      );
    });

    // Calcular promedio general
    const promedioResult = await db
      .collection("resena")
      .aggregate([
        {
          $group: {
            _id: null,
            promedio: { $avg: "$puntuacion" },
          },
        },
      ])
      .toArray();

    if (promedioResult.length > 0) {
      console.log(
        `\n   📈 Promedio general: ${promedioResult[0].promedio.toFixed(
          2
        )} estrellas`
      );
    }

    console.log("\n" + "=".repeat(70));
    console.log("   ✅ Reseñas únicas cargadas completamente");
    console.log("   💡 Siguiente paso: Generar embeddings con Python\n");
  } catch (error) {
    console.error("❌ Error al insertar reseñas:", error);
  } finally {
    await database.disconnect();
  }
}

insertResenas();
