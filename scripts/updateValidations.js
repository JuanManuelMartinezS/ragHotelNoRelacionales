const database = require("../config/database");
const schemas = require("../models/schemas");

class ValidationUpdater {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await database.connect();
      console.log("🚀 Iniciando actualización de validaciones...\n");
    } catch (error) {
      console.error("❌ Error inicializando:", error);
      process.exit(1);
    }
  }

  async updateCollectionValidation(collectionName, schema) {
    try {
      console.log(`📝 Actualizando validación para: ${collectionName}`);

      // Verificar si la colección existe
      const collections = await this.db
        .listCollections({ name: collectionName })
        .toArray();

      if (collections.length === 0) {
        console.log(
          `   ⚠️  La colección ${collectionName} no existe. Creando...`
        );
        await this.db.createCollection(collectionName, schema);
        console.log(`   ✅ Colección ${collectionName} creada con validación`);
      } else {
        // La colección existe, actualizar validación
        await this.db.command({
          collMod: collectionName,
          validator: schema.validator,
          validationLevel: schema.validationLevel,
          validationAction: schema.validationAction,
        });
        console.log(`   ✅ Validación actualizada para ${collectionName}`);
      }

      return true;
    } catch (error) {
      console.error(
        `   ❌ Error actualizando ${collectionName}:`,
        error.message
      );
      return false;
    }
  }

  async updateAllValidations() {
    const results = {};

    for (const [collectionName, schema] of Object.entries(schemas)) {
      const success = await this.updateCollectionValidation(
        collectionName,
        schema
      );
      results[collectionName] = success ? "✅ Éxito" : "❌ Falló";

      // Pequeña pausa entre colecciones
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  async run() {
    try {
      await this.initialize();

      console.log("🎯 Actualizando validaciones de esquema...");
      const results = await this.updateAllValidations();

      console.log("\n📊 Resumen de actualizaciones:");
      console.table(results);

      console.log("\n🎉 Actualización completada exitosamente!");
    } catch (error) {
      console.error("💥 Error durante la actualización:", error);
    } finally {
      await database.disconnect();
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const updater = new ValidationUpdater();
  updater.run();
}

module.exports = ValidationUpdater;
