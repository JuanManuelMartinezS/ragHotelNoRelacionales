const database = require("../config/database");
const { ObjectId, Double } = require("mongodb");

async function dropAndRecreateAllCollections() {
  let db;

  try {
    db = await database.connect();

    console.log("🧨 ELIMINANDO Y RECREANDO TODAS LAS COLECCIONES\n");
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

    // PASO 1: Eliminar todas las colecciones existentes
    console.log("\n🗑️  PASO 1: Eliminando colecciones existentes...\n");

    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`   ✅ ${collectionName} eliminada`);
      } catch (error) {
        if (error.code === 26) {
          // NamespaceNotFound
          console.log(`   ℹ️  ${collectionName} no existía`);
        } else {
          console.log(`   ⚠️  ${collectionName}: ${error.message}`);
        }
      }
    }

    // PASO 2: Crear colecciones vacías sin validaciones
    console.log("\n📦 PASO 2: Creando colecciones sin validaciones...\n");

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName, {
          validator: {},
          validationLevel: "off",
          validationAction: "warn",
        });
        console.log(`   ✅ ${collectionName} creada sin validaciones`);
      } catch (error) {
        console.log(`   ⚠️  ${collectionName}: ${error.message}`);
      }
    }

    // PASO 3: Insertar datos
    console.log("\n💾 PASO 3: Insertando datos...\n");

    const insertResults = {};

    // Helper function
    const ensureDouble = (value) => new Double(value);

    // 1. SERVICIO
    try {
      const result = await db.collection("servicio").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439014"),
          idServicio: 4001,
          nombre: "Spa Premium",
          descripcion:
            "Centro de relajación y bienestar con masajes terapéuticos",
          precio: ensureDouble(89.99),
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439015"),
          idServicio: 4002,
          nombre: "Transporte Aeropuerto",
          descripcion: "Servicio de transporte desde/hacia el aeropuerto",
          precio: ensureDouble(35.0),
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439016"),
          idServicio: 4003,
          nombre: "Desayuno Buffet",
          descripcion: "Buffet de desayuno internacional",
          precio: ensureDouble(25.5),
        },
      ]);
      insertResults.servicio = result.insertedCount;
      console.log(`   ✅ servicio: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ servicio: ${error.message}`);
      insertResults.servicio = 0;
    }

    // 2. HOTEL
    try {
      const result = await db.collection("hotel").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439020"),
          idHotel: 1,
          nombre: "Hotel Paradise",
          direccion: "Calle Principal 123, Playa del Carmen",
          numeroEstrelllas: 5,
          ciudad: "Playa del Carmen",
          capacidad: 150,
          contacto: "info@hotelparadise.com",
          empleados: ["87654321", "87654322"],
          habitaciones: [
            {
              idHabitacion: 101,
              capacidad: 2,
              tipo: "Doble",
              precio: ensureDouble(150.0),
            },
            {
              idHabitacion: 102,
              capacidad: 4,
              tipo: "Familiar",
              precio: ensureDouble(250.0),
            },
          ],
          vehiculos: [
            {
              idVehiculo: 1001,
              tipo: "Sedan",
              capacidad: 4,
              precio: ensureDouble(50.0),
            },
          ],
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439030"),
          idHotel: 2,
          nombre: "Grand Boutique Hotel",
          direccion: "Avenida Central 456, CDMX",
          numeroEstrelllas: 4,
          ciudad: "Ciudad de México",
          capacidad: 80,
          contacto: "reservas@grandboutique.com",
          empleados: ["87654323"],
          habitaciones: [
            {
              idHabitacion: 301,
              capacidad: 2,
              tipo: "Doble",
              precio: ensureDouble(180.0),
            },
          ],
          vehiculos: [],
        },
      ]);
      insertResults.hotel = result.insertedCount;
      console.log(`   ✅ hotel: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ hotel: ${error.message}`);
      insertResults.hotel = 0;
    }

    // 3. CLIENTE
    try {
      const result = await db.collection("cliente").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439015"),
          cedula: "12345678",
          nombre: "Juan",
          apellidos: "Pérez García",
          categoria: "Premium",
          pagos: [
            {
              idFactura: 6001,
              monto: ensureDouble(450.0),
              fechaPago: new Date("2024-10-17T14:30:00Z"),
              estado: "Completado",
            },
          ],
          idReservaHabl: 3001,
          precioTotal: ensureDouble(539.99),
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439017"),
          cedula: "87654321",
          nombre: "María",
          apellidos: "González López",
          categoria: "Estándar",
          pagos: [
            {
              idFactura: 6002,
              monto: ensureDouble(250.0),
              fechaPago: new Date("2024-10-19T09:00:00Z"),
              estado: "Completado",
            },
          ],
          idReservaHabl: 3002,
          precioTotal: ensureDouble(250.0),
        },
      ]);
      insertResults.cliente = result.insertedCount;
      console.log(`   ✅ cliente: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ cliente: ${error.message}`);
      insertResults.cliente = 0;
    }

    // 4. EMPLEADO
    try {
      const result = await db.collection("empleado").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439019"),
          cedula: "87654321",
          nombre: "Carlos",
          apellido: "García",
          cargo: "Recepcionista",
          turno: "Mañana",
          idHotel: 1,
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439020"),
          cedula: "87654322",
          nombre: "Ana",
          apellido: "Martínez",
          cargo: "Gerente",
          turno: "Completo",
          idHotel: 1,
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439052"),
          cedula: "87654323",
          nombre: "Luis",
          apellido: "Hernández",
          cargo: "Recepcionista",
          turno: "Tarde",
          idHotel: 2,
        },
      ]);
      insertResults.empleado = result.insertedCount;
      console.log(`   ✅ empleado: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ empleado: ${error.message}`);
      insertResults.empleado = 0;
    }

    // 5. RESERVA HABITACION
    try {
      const result = await db.collection("reservaHabitacion").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439017"),
          idReservaHabl: 3001,
          idCliente: "12345678",
          idHabitacion: 101,
          fechaReserva: new Date("2024-10-17T15:00:00Z"),
          fechaSalida: new Date("2024-10-20T11:00:00Z"),
          estado: "Confirmada",
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439018"),
          idReservaHabl: 3002,
          idCliente: "87654321",
          idHabitacion: 102,
          fechaReserva: new Date("2024-10-18T14:00:00Z"),
          fechaSalida: new Date("2024-10-22T10:00:00Z"),
          estado: "Activa",
        },
      ]);
      insertResults.reservaHabitacion = result.insertedCount;
      console.log(`   ✅ reservaHabitacion: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ reservaHabitacion: ${error.message}`);
      insertResults.reservaHabitacion = 0;
    }

    // 6. RESERVA SERVICIO
    try {
      const result = await db.collection("reservaServicio").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439013"),
          idReservaServi: 5001,
          idReservaHabl: 3001,
          idServicio: 4001,
          idFactura: 6001,
          fecha: new Date("2024-10-18T10:00:00Z"),
          descripcion: "Masaje relajante de 60 minutos",
        },
      ]);
      insertResults.reservaServicio = result.insertedCount;
      console.log(`   ✅ reservaServicio: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ reservaServicio: ${error.message}`);
      insertResults.reservaServicio = 0;
    }

    // 7. EMPLEADO RESERVA SERVICIO
    try {
      const result = await db.collection("empleadoReservaServicio").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439012"),
          idAsignacion: 2001,
          idReservaServi: 5001,
          idEmpleado: "87654321",
          fecha: new Date("2024-10-18T10:00:00Z"),
          descripcion: "Asignado al servicio de spa",
        },
      ]);
      insertResults.empleadoReservaServicio = result.insertedCount;
      console.log(
        `   ✅ empleadoReservaServicio: ${result.insertedCount} docs`
      );
    } catch (error) {
      console.log(`   ❌ empleadoReservaServicio: ${error.message}`);
      insertResults.empleadoReservaServicio = 0;
    }

    // 8. VEHICULOS RESERVA SERVICIO
    try {
      const result = await db
        .collection("vehiculosReservaServicio")
        .insertMany([
          {
            _id: new ObjectId("507f1f77bcf86cd799439011"),
            idVehiculo: 1001,
            idReservaServi: 5001,
            fecha: new Date("2024-10-18T08:00:00Z"),
          },
        ]);
      insertResults.vehiculosReservaServicio = result.insertedCount;
      console.log(
        `   ✅ vehiculosReservaServicio: ${result.insertedCount} docs`
      );
    } catch (error) {
      console.log(`   ❌ vehiculosReservaServicio: ${error.message}`);
      insertResults.vehiculosReservaServicio = 0;
    }

    // 9. PAGA
    try {
      const result = await db.collection("paga").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439016"),
          idFactura: 6001,
          idCliente: "12345678",
          fechaPago: new Date("2024-10-17T14:30:00Z"),
          monto: ensureDouble(450.0),
          metodoPago: "Tarjeta de crédito",
          estado: "Completado",
          restante: ensureDouble(89.99),
        },
      ]);
      insertResults.paga = result.insertedCount;
      console.log(`   ✅ paga: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ paga: ${error.message}`);
      insertResults.paga = 0;
    }

    // 10. COMPRA
    try {
      const result = await db.collection("compra").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439018"),
          idCompra: 9001,
          idFactura: 6001,
          idCliente: "12345678",
          fecha: new Date("2024-10-17T16:45:00Z"),
        },
      ]);
      insertResults.compra = result.insertedCount;
      console.log(`   ✅ compra: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ compra: ${error.message}`);
      insertResults.compra = 0;
    }

    // 11. PRODUCTO
    try {
      const result = await db.collection("producto").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439021"),
          idProducto: 5001,
          nombreProducto: "Bebida Premium",
          cantidadGap: 10,
          cantidadStock: 100,
          idProveedor: 2001,
          tipoProducto: "Bebida",
          valorUnidad: ensureDouble(12.5),
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439022"),
          idProducto: 5002,
          nombreProducto: "Snack Ejecutivo",
          cantidadGap: 5,
          cantidadStock: 50,
          idProveedor: 2001,
          tipoProducto: "Alimento",
          valorUnidad: ensureDouble(8.75),
        },
      ]);
      insertResults.producto = result.insertedCount;
      console.log(`   ✅ producto: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ producto: ${error.message}`);
      insertResults.producto = 0;
    }

    // 12. PROVEEDOR
    try {
      const result = await db.collection("proveedor").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439023"),
          idProveedor: 2001,
          nombre: "Distribuidor ABC",
          contacto: "contacto@distribuidorabc.com",
          tipoSuministro: "Bebidas y Alimentos",
          productos: [{ idProducto: 5001 }, { idProducto: 5002 }],
        },
      ]);
      insertResults.proveedor = result.insertedCount;
      console.log(`   ✅ proveedor: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ proveedor: ${error.message}`);
      insertResults.proveedor = 0;
    }

    // 13. CARRITO
    try {
      const result = await db.collection("carrito").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439022"),
          idVentaMercial: 10001,
          idCompra: 9001,
          idProducto: 5001,
          cantidad: 2,
          monto: ensureDouble(25.0),
        },
      ]);
      insertResults.carrito = result.insertedCount;
      console.log(`   ✅ carrito: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ carrito: ${error.message}`);
      insertResults.carrito = 0;
    }

    // 14. PRODUCTO HOTEL
    try {
      const result = await db.collection("productoHotel").insertMany([
        {
          _id: new ObjectId("507f1f77bcf86cd799439024"),
          idProductoHot: 11001,
          idProducto: 5001,
          idHotel: 1,
          cantidadStock: 80,
          fechaIngresacion: new Date("2024-10-01T09:00:00Z"),
        },
      ]);
      insertResults.productoHotel = result.insertedCount;
      console.log(`   ✅ productoHotel: ${result.insertedCount} docs`);
    } catch (error) {
      console.log(`   ❌ productoHotel: ${error.message}`);
      insertResults.productoHotel = 0;
    }

    // RESUMEN
    console.log("\n" + "=".repeat(70));
    console.log("\n📊 RESUMEN FINAL:");
    console.table(insertResults);

    const total = Object.values(insertResults).reduce((a, b) => a + b, 0);
    console.log(`\n🎉 Total insertado: ${total} documentos`);

    if (total > 0) {
      console.log("\n✅ ÉXITO - Datos cargados correctamente");
      console.log("💡 Ahora ejecuta: node verifyData.js");
    } else {
      console.log("\n❌ No se insertaron datos");
    }
  } catch (error) {
    console.error("\n💥 Error fatal:", error);
  } finally {
    if (db) {
      await database.disconnect();
    }
  }
}

dropAndRecreateAllCollections();
