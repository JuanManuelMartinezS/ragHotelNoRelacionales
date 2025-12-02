// MongoDB Change Stream - Monitor critical reviews in real-time using Node.js
const { MongoClient } = require("mongodb");

// MongoDB connection configuration (USE YOUR ACTUAL CREDENTIALS)
const USER = "juanyaca2006_db_user";
const PASS = "juanmanuel07";
const CLUSTER = "cluster0.563va5d.mongodb.net";
const DBNAME = "Hotel";
const APPNAME = "Cluster0";

// Construct MongoDB URI
const uri = `mongodb+srv://${USER}:${PASS}@${CLUSTER}/${DBNAME}?retryWrites=true&w=majority&appName=${APPNAME}`;

// Define the collection to watch
const collectionName = "resena";

// Define the aggregation pipeline - Monitor reviews with puntuacion <= 2
const pipeline = [
  {
    $match: {
      $and: [
        {
          operationType: { $in: ["insert", "update", "replace"] },
        },
        {
          $or: [
            // Para inserciones/reemplazos - verificamos el documento completo
            { "fullDocument.puntuacion": { $lte: 2 } },
            // Para actualizaciones - verificamos si 'puntuacion' fue cambiada a un valor crítico
            { "updateDescription.updatedFields.puntuacion": { $lte: 2 } },
          ],
        },
      ],
    },
  },
];

async function monitorChangeStream() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Conectado a MongoDB");

    const db = client.db(DBNAME);
    const collection = db.collection(collectionName);

    // Create the change stream
    const changeStream = collection.watch(pipeline);

    console.log(
      `✅ Monitoreando reseñas críticas (puntuación <= 2) en '${DBNAME}.${collectionName}'...`
    );
    console.log("Presiona Ctrl+C para detener el monitoreo\n");

    // Listen to change events
    changeStream.on("change", (change) => {
      console.log("─────────────────────────────────────────");
      console.log(`⚡ Evento Crítico Detectado: ${change.operationType}`);
      console.log(`📅 Timestamp: ${new Date().toISOString()}`);
      console.log(`🆔 Document ID: ${change.documentKey._id}`);

      const changeType = change.operationType;

      if (changeType === "insert" || changeType === "replace") {
        console.log("❌ Nueva Reseña CRÍTICA registrada:");
        console.log(`   ID Reseña: ${change.fullDocument.idResena}`);
        console.log(`   Puntuación: ${change.fullDocument.puntuacion}`);
        console.log(
          `   Comentario: ${
            change.fullDocument.comentario
              ? change.fullDocument.comentario.substring(0, 80) + "..."
              : "N/A"
          }`
        );
        console.log("\n📄 Documento Completo:");
        // Muestra solo los campos relevantes para una reseña
        const criticalReviewData = {
          idResena: change.fullDocument.idResena,
          puntuacion: change.fullDocument.puntuacion,
          comentario: change.fullDocument.comentario,
          idReservaHabitacion: change.fullDocument.idReservaHabitacion,
        };
        console.log(JSON.stringify(criticalReviewData, null, 2));
      } else if (changeType === "update") {
        console.log("🔄 Documento Actualizado (Puntuación Crítica):");
        const updatedScore = change.updateDescription.updatedFields.puntuacion;
        console.log(`   Puntuación Actualizada a: ${updatedScore}`);
        console.log("   Campos Actualizados:");
        console.log(
          JSON.stringify(change.updateDescription.updatedFields, null, 2)
        );
      }

      console.log("─────────────────────────────────────────\n");
    });

    changeStream.on("error", (error) => {
      console.error(`❌ Error: ${error.message}`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n👋 Cerrando change stream...");
      await changeStream.close();
      await client.close();
      console.log("✅ Monitoreo de Change Stream detenido.");
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ Error de Conexión: ${error.message}`);
    if (client) await client.close();
    process.exit(1);
  }
}

// Start monitoring
monitorChangeStream().catch(console.error);
