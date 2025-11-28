const database = require("./config/database");

async function diagnoseValidations() {
  try {
    const db = await database.connect();

    console.log("\n🔍 DIAGNÓSTICO DE VALIDACIONES DE MONGODB\n");
    console.log("=".repeat(70));

    const collections = [
      "servicio",
      "hotel",
      "cliente",
      "empleado",
      "reservaHabitacion",
      "reservaServicio",
      "vehiculosReservaServicio",
      "empleadoReservaServicio",
      "paga",
      "compra",
      "producto",
      "proveedor",
      "carrito",
      "productoHotel",
    ];

    for (const collectionName of collections) {
      try {
        console.log(`\n📦 ${collectionName}:`);

        // Obtener info de la colección
        const collectionInfo = await db
          .listCollections({ name: collectionName })
          .toArray();

        if (collectionInfo.length === 0) {
          console.log(`   ⚠️  Colección no existe`);
          continue;
        }

        const info = collectionInfo[0];

        // Verificar si tiene validaciones
        if (info.options && info.options.validator) {
          console.log(`   ❌ TIENE VALIDACIONES ACTIVAS:`);
          console.log(JSON.stringify(info.options.validator, null, 2));

          if (info.options.validationLevel) {
            console.log(
              `   📏 Nivel de validación: ${info.options.validationLevel}`
            );
          }
          if (info.options.validationAction) {
            console.log(
              `   ⚡ Acción de validación: ${info.options.validationAction}`
            );
          }
        } else {
          console.log(`   ✅ Sin validaciones activas`);
        }

        // Contar documentos
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   📊 Documentos actuales: ${count}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n💡 RECOMENDACIÓN:");
    console.log(
      "Si ves validaciones activas, ejecuta el script para eliminarlas:"
    );
    console.log("node dropAllValidations.js");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await database.disconnect();
  }
}

diagnoseValidations();
