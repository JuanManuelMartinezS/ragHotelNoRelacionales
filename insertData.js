const database = require("./config/database");

async function insertResenas() {
  try {
    const db = await database.connect();

    console.log("\n⭐ INSERTANDO RESEÑAS\n");
    console.log("=".repeat(70));

    // Limpiar colección existente
    await db.collection("resena").deleteMany({});

    // Plantillas de comentarios por puntuación
    const comentarios = {
      5: [
        "Excelente hotel, superó todas nuestras expectativas. Volveremos sin duda.",
        "Servicio impecable, instalaciones de primera. Una experiencia inolvidable.",
        "Todo fue perfecto desde el check-in hasta el check-out. Altamente recomendado.",
        "La mejor estadía que hemos tenido. El personal es excepcional.",
        "Increíble atención al detalle. Las habitaciones son espectaculares.",
        "Experiencia de 5 estrellas en todo sentido. Vale cada peso.",
        "Nos encantó todo, desde la comida hasta las instalaciones. Excelente.",
        "Personal muy atento y profesional. Las amenidades son de lujo.",
        "Ubicación perfecta y servicios excepcionales. Muy recomendable.",
        "Una joya de hotel. Todo estuvo impecable durante nuestra estadía.",
      ],
      4: [
        "Muy buena experiencia en general. Pequeños detalles por mejorar.",
        "Hotel agradable con buen servicio. Relación calidad-precio aceptable.",
        "Buena estadía, habitaciones cómodas. El desayuno podría ser mejor.",
        "Nos gustó mucho, aunque el wifi era un poco lento.",
        "Instalaciones limpias y personal amable. Buena opción.",
        "Recomendable, aunque el check-in tomó más tiempo del esperado.",
        "Habitación cómoda y limpia. El restaurante tiene buena comida.",
        "Buena ubicación y servicios correctos. Volveríamos.",
        "Estadía agradable, personal servicial. Algunas mejoras menores pendientes.",
        "Buen hotel en general. La piscina estaba muy bien mantenida.",
      ],
      3: [
        "Experiencia normal, nada excepcional. Cumple lo básico.",
        "Precio justo por lo que ofrece. Habitación estándar.",
        "Aceptable para una noche. No es memorable pero funciona.",
        "Instalaciones algo antiguas pero limpias. Personal correcto.",
        "Esperaba un poco más por el precio. No estuvo mal.",
        "Cumple con lo básico. La habitación necesita renovación.",
        "Servicio promedio. La ubicación es su mejor punto.",
        "Nada especial pero tampoco malo. Hotel funcional.",
        "Relación calidad-precio regular. Hay mejores opciones.",
        "Estadía sin sorpresas. Todo bastante estándar.",
      ],
      2: [
        "Decepcionante. Las fotos no reflejan la realidad.",
        "Habitación pequeña y ruidosa. No volveríamos.",
        "Servicio deficiente y limpieza cuestionable.",
        "No cumplió nuestras expectativas. Varios problemas.",
        "Instalaciones descuidadas. El personal no fue muy atento.",
        "Mala experiencia. Ruido excesivo durante la noche.",
        "No recomendable. Mejor buscar otras opciones.",
        "Precio elevado para la calidad ofrecida. Insatisfecho.",
        "Muchas cosas por mejorar. No vale la pena.",
        "Habitación con mantenimiento deficiente. Decepcionante.",
      ],
      1: [
        "Pésima experiencia. No recomiendo este hotel para nada.",
        "Terrible. Problemas desde el inicio hasta el final.",
        "Muy mala atención. Las instalaciones están en mal estado.",
        "Nunca volveré. Una de las peores experiencias hoteleras.",
        "Inaceptable para el precio. Todo estuvo mal.",
        "Deplorable. Limpieza inexistente y servicio pésimo.",
        "No puedo recomendar este lugar. Fue una pesadilla.",
        "Muy decepcionados. Esperábamos mucho más.",
        "Horrible experiencia. Pedimos cambio de habitación y no pudieron.",
        "El peor hotel en el que nos hemos hospedado. Desastroso.",
      ],
    };

    // Generar 200 reseñas
    const resenasArray = [];
    const reservasDisponibles = [
      3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010,
    ];

    for (let i = 1; i <= 200; i++) {
      // Distribución de puntuaciones (más alta en 4 y 5 estrellas)
      let puntuacion;
      const rand = Math.random();
      if (rand < 0.4) puntuacion = 5; // 40% de 5 estrellas
      else if (rand < 0.7) puntuacion = 4; // 30% de 4 estrellas
      else if (rand < 0.85) puntuacion = 3; // 15% de 3 estrellas
      else if (rand < 0.95) puntuacion = 2; // 10% de 2 estrellas
      else puntuacion = 1; // 5% de 1 estrella

      // Seleccionar comentario aleatorio según puntuación
      const comentariosDisponibles = comentarios[puntuacion];
      const comentario =
        comentariosDisponibles[
          Math.floor(Math.random() * comentariosDisponibles.length)
        ];

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
    }

    // Insertar todas las reseñas
    const resenas = await db.collection("resena").insertMany(resenasArray);

    console.log(
      `   ✅ ${resenas.insertedCount} reseñas insertadas exitosamente`
    );

    // Mostrar resumen por puntuación
    console.log("\n📊 RESUMEN POR PUNTUACIÓN:");
    const pipeline = [
      {
        $group: {
          _id: "$puntuacion",
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ];

    const resumen = await db.collection("resena").aggregate(pipeline).toArray();
    resumen.forEach((r) => {
      console.log(`   ⭐ ${r._id} estrellas: ${r.cantidad} reseñas`);
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
    console.log("   ✅ Reseñas cargadas completamente\n");
  } catch (error) {
    console.error("❌ Error al insertar reseñas:", error);
  } finally {
    await database.disconnect();
  }
}

insertResenas();
