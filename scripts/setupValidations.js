const database = require("../config/database");
const schemas = require("../models/schemas");

class ValidationSetup {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await database.connect();
      console.log("🚀 Iniciando configuración de validaciones...\n");
    } catch (error) {
      console.error("❌ Error inicializando:", error);
      process.exit(1);
    }
  }

  async setupCollectionValidation(collectionName, schema) {
    try {
      console.log(`📝 Configurando validación para: ${collectionName}`);

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
        // La colección existe, aplicar validación
        await this.db.command({
          collMod: collectionName,
          validator: schema.validator,
          validationLevel: schema.validationLevel,
          validationAction: schema.validationAction,
        });
        console.log(`   ✅ Validación aplicada a ${collectionName}`);
      }

      return true;
    } catch (error) {
      console.error(
        `   ❌ Error configurando ${collectionName}:`,
        error.message
      );
      return false;
    }
  }

  async setupAllValidations() {
    const results = {};

    for (const [collectionName, schema] of Object.entries(schemas)) {
      const success = await this.setupCollectionValidation(
        collectionName,
        schema
      );
      results[collectionName] = success ? "✅ Éxito" : "❌ Falló";

      // Pequeña pausa entre colecciones
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  async createIndexes() {
    console.log("\n🔧 Creando índices...");

    const indexCommands = [
      // Índices para vehiculosReservaServicio
      { collection: "vehiculosReservaServicio", spec: { idVehiculo: 1 } },
      {
        collection: "vehiculosReservaServicio",
        spec: { idReservaServicio: 1 },
      },
      {
        collection: "vehiculosReservaServicio",
        spec: { idVehiculo: 1, idReservaServicio: 1 },
        options: { unique: true },
      },

      // Índices para empleadoReservaServicio
      {
        collection: "empleadoReservaServicio",
        spec: { idAsignacion: 1 },
        options: { unique: true },
      },
      { collection: "empleadoReservaServicio", spec: { idEmpleado: 1 } },
      { collection: "empleadoReservaServicio", spec: { descripcion: "text" } },

      // Índices para reservaServicio
      { collection: "reservaServicio", spec: { idReservableHabitacion: 1 } },
      { collection: "reservaServicio", spec: { idServicio: 1 } },
      {
        collection: "reservaServicio",
        spec: { nombre: "text", descripcion: "text" },
      },

      // Índices para servicio
      {
        collection: "servicio",
        spec: { idServicio: 1 },
        options: { unique: true },
      },
      { collection: "servicio", spec: { nombre: "text", descripcion: "text" } },

      // Índices para cliente
      { collection: "cliente", spec: { cedula: 1 }, options: { unique: true } },
      { collection: "cliente", spec: { nombre: 1, apellido: 1 } },
      { collection: "cliente", spec: { "pagos.idFactura": 1 } },

      // Índices para reservaHabitacion
      {
        collection: "reservaHabitacion",
        spec: { idReservableHabitacion: 1 },
        options: { unique: true },
      },
      {
        collection: "reservaHabitacion",
        spec: { fechaEntrada: 1, fechaSalida: 1 },
      },
      {
        collection: "reservaHabitacion",
        spec: { "resenas.comentario": "text" },
      },

      // Índices para hotel
      { collection: "hotel", spec: { idHotel: 1 }, options: { unique: true } },
      { collection: "hotel", spec: { nombre: "text", direccion: "text" } },
      { collection: "hotel", spec: { "habitaciones.idHabitacion": 1 } },
      { collection: "hotel", spec: { "vehiculos.idVehiculo": 1 } },
    ];

    for (const indexCmd of indexCommands) {
      try {
        const collection = this.db.collection(indexCmd.collection);
        await collection.createIndex(indexCmd.spec, indexCmd.options || {});
        console.log(
          `   ✅ Índice creado en ${indexCmd.collection}: ${JSON.stringify(
            indexCmd.spec
          )}`
        );
      } catch (error) {
        console.log(
          `   ⚠️  Índice ya existe en ${indexCmd.collection}: ${error.message}`
        );
      }
    }
  }

  async run() {
    try {
      await this.initialize();

      console.log("🎯 Configurando validaciones de esquema...");
      const results = await this.setupAllValidations();

      console.log("\n📊 Resumen de validaciones:");
      console.table(results);

      await this.createIndexes();

      console.log("\n🎉 Configuración completada exitosamente!");
    } catch (error) {
      console.error("💥 Error durante la configuración:", error);
    } finally {
      await database.disconnect();
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const setup = new ValidationSetup();
  setup.run();
}

module.exports = ValidationSetup;
