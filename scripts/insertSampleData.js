const database = require("../config/database");
const { ObjectId, Double } = require("mongodb");

class SampleDataInserter {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      this.db = await database.connect();
      console.log("🚀 Iniciando inserción de datos de ejemplo...\n");
    } catch (error) {
      console.error("❌ Error inicializando:", error);
      process.exit(1);
    }
  }

  async insertData(collectionName, data) {
    try {
      const collection = this.db.collection(collectionName);

      // Limpiar colección existente
      await collection.deleteMany({});
      console.log(`🧹 Colección ${collectionName} limpiada`);

      // Insertar nuevos datos
      const result = await collection.insertMany(data);
      console.log(
        `✅ ${result.insertedCount} documentos insertados en ${collectionName}`
      );

      return result.insertedCount;
    } catch (error) {
      console.error(`❌ Error insertando en ${collectionName}:`, error.message);

      if (error.writeErrors) {
        error.writeErrors.forEach((writeError, index) => {
          console.log(`   Documento ${index + 1} falló:`);
          console.log(`   - Error: ${writeError.errmsg}`);
          if (writeError.errInfo && writeError.errInfo.details) {
            console.log(
              `   - Detalles: ${JSON.stringify(
                writeError.errInfo.details,
                null,
                2
              )}`
            );
          }
        });
      }

      return 0;
    }
  }

  ensureDouble(value) {
    return new Double(value);
  }

  async insertAllSampleData() {
    const results = {};

    // 1. SERVICIO
    results.servicio = await this.insertData("servicio", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439014"),
        idServicio: 4001,
        nombre: "Spa Premium",
        descripcion:
          "Centro de relajación y bienestar con masajes terapéuticos",
        precio: this.ensureDouble(89.99),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439015"),
        idServicio: 4002,
        nombre: "Transporte Aeropuerto",
        descripcion: "Servicio de transporte desde/hacia el aeropuerto",
        precio: this.ensureDouble(35.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439016"),
        idServicio: 4003,
        nombre: "Desayuno Buffet",
        descripcion: "Buffet de desayuno internacional",
        precio: this.ensureDouble(25.5),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439024"),
        idServicio: 4004,
        nombre: "Tour Guiado",
        descripcion: "Tour guiado por la ciudad con guía profesional",
        precio: this.ensureDouble(65.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439025"),
        idServicio: 4005,
        nombre: "Gimnasio Premium",
        descripcion: "Acceso completo al gimnasio y clases grupales",
        precio: this.ensureDouble(15.0),
      },
    ]);

    // 2. HOTEL (3 hoteles diferentes)
    results.hotel = await this.insertData("hotel", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439020"),
        idHotel: 1,
        nombre: "Hotel Paradise",
        direccion: "Calle Principal 123, Playa del Carmen",
        numeroEstrelllas: 5,
        ciudad: "Playa del Carmen",
        capacidad: 150,
        disponible: true,
        contacto: "info@hotelparadise.com",
        habitaciones: [
          {
            idHabitacion: 101,
            capacidad: 2,
            tipo: "Doble",
            precio: this.ensureDouble(150.0),
          },
          {
            idHabitacion: 102,
            capacidad: 4,
            tipo: "Familiar",
            precio: this.ensureDouble(250.0),
          },
          {
            idHabitacion: 201,
            capacidad: 2,
            tipo: "Suite",
            precio: this.ensureDouble(350.0),
          },
          {
            idHabitacion: 202,
            capacidad: 1,
            tipo: "Individual",
            precio: this.ensureDouble(100.0),
          },
        ],
        empleados: ["87654321", "87654322"],
        vehiculos: [
          {
            idVehiculo: 1001,
            tipo: "Sedan",
            capacidad: 4,
            precio: this.ensureDouble(50.0),
          },
          {
            idVehiculo: 1002,
            tipo: "SUV",
            capacidad: 6,
            precio: this.ensureDouble(80.0),
          },
        ],
        habitacion: [],
        tutorial: [],
        tipo: "Resort",
        capacidad: 150,
        precio: this.ensureDouble(150.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439030"),
        idHotel: 2,
        nombre: "Grand Boutique Hotel",
        direccion: "Avenida Central 456, Ciudad de México",
        numeroEstrelllas: 4,
        ciudad: "Ciudad de México",
        capacidad: 80,
        disponible: true,
        contacto: "reservas@grandboutique.com",
        habitaciones: [
          {
            idHabitacion: 301,
            capacidad: 2,
            tipo: "Doble Ejecutiva",
            precio: this.ensureDouble(180.0),
          },
          {
            idHabitacion: 302,
            capacidad: 2,
            tipo: "Suite Junior",
            precio: this.ensureDouble(280.0),
          },
          {
            idHabitacion: 401,
            capacidad: 3,
            tipo: "Triple",
            precio: this.ensureDouble(220.0),
          },
        ],
        empleados: ["87654323", "87654324"],
        vehiculos: [
          {
            idVehiculo: 2001,
            tipo: "Van",
            capacidad: 8,
            precio: this.ensureDouble(100.0),
          },
        ],
        habitacion: [],
        tutorial: [],
        tipo: "Boutique",
        capacidad: 80,
        precio: this.ensureDouble(180.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439040"),
        idHotel: 3,
        nombre: "Mountain View Lodge",
        direccion: "Carretera Nacional km 45, Monterrey",
        numeroEstrelllas: 3,
        ciudad: "Monterrey",
        capacidad: 60,
        disponible: true,
        contacto: "contacto@mountainview.com",
        habitaciones: [
          {
            idHabitacion: 501,
            capacidad: 2,
            tipo: "Estándar",
            precio: this.ensureDouble(90.0),
          },
          {
            idHabitacion: 502,
            capacidad: 4,
            tipo: "Familiar",
            precio: this.ensureDouble(160.0),
          },
          {
            idHabitacion: 503,
            capacidad: 2,
            tipo: "Vista Montaña",
            precio: this.ensureDouble(120.0),
          },
        ],
        empleados: ["87654325"],
        vehiculos: [
          {
            idVehiculo: 3001,
            tipo: "Pickup",
            capacidad: 5,
            precio: this.ensureDouble(60.0),
          },
        ],
        habitacion: [],
        tutorial: [],
        tipo: "Lodge",
        capacidad: 60,
        precio: this.ensureDouble(90.0),
      },
    ]);

    // 3. CLIENTE
    results.cliente = await this.insertData("cliente", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439015"),
        cedula: "12345678",
        nombre: "Juan",
        apellidos: "Pérez García",
        categoria: "Premium",
        factura: [],
        pagos: [],
        idReservaHabl: 3001,
        precioTotal: this.ensureDouble(539.99),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439017"),
        cedula: "87654321",
        nombre: "María",
        apellidos: "González López",
        categoria: "Estándar",
        factura: [],
        pagos: [],
        idReservaHabl: 3002,
        precioTotal: this.ensureDouble(250.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439050"),
        cedula: "11223344",
        nombre: "Carlos",
        apellidos: "Ramírez Torres",
        categoria: "Premium",
        factura: [],
        pagos: [],
        idReservaHabl: 3003,
        precioTotal: this.ensureDouble(840.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439051"),
        cedula: "55667788",
        nombre: "Ana",
        apellidos: "Martínez Silva",
        categoria: "Estándar",
        factura: [],
        pagos: [],
        idReservaHabl: 3004,
        precioTotal: this.ensureDouble(360.0),
      },
    ]);

    // 4. EMPLEADO
    results.empleado = await this.insertData("empleado", [
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
      {
        _id: new ObjectId("507f1f77bcf86cd799439053"),
        cedula: "87654324",
        nombre: "Patricia",
        apellido: "Morales",
        cargo: "Supervisora",
        turno: "Mañana",
        idHotel: 2,
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439054"),
        cedula: "87654325",
        nombre: "Roberto",
        apellido: "Sánchez",
        cargo: "Conserje",
        turno: "Noche",
        idHotel: 3,
      },
    ]);

    // 5. RESERVA HABITACION (sin reseñas - campo vacío)
    results.reservaHabitacion = await this.insertData("reservaHabitacion", [
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
      {
        _id: new ObjectId("507f1f77bcf86cd799439055"),
        idReservaHabl: 3003,
        idCliente: "11223344",
        idHabitacion: 301,
        fechaReserva: new Date("2024-11-01T15:00:00Z"),
        fechaSalida: new Date("2024-11-05T11:00:00Z"),
        estado: "Confirmada",
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439056"),
        idReservaHabl: 3004,
        idCliente: "55667788",
        idHabitacion: 501,
        fechaReserva: new Date("2024-11-10T14:00:00Z"),
        fechaSalida: new Date("2024-11-14T10:00:00Z"),
        estado: "Pendiente",
      },
    ]);

    // 6. RESERVA SERVICIO
    results.reservaServicio = await this.insertData("reservaServicio", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439013"),
        idReservaServi: 5001,
        idReservaHabl: 3001,
        idServicio: 4001,
        idFactura: 6001,
        fecha: new Date("2024-10-18T10:00:00Z"),
        descripcion: "Masaje relajante de 60 minutos",
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439057"),
        idReservaServi: 5002,
        idReservaHabl: 3001,
        idServicio: 4003,
        idFactura: 6001,
        fecha: new Date("2024-10-18T08:00:00Z"),
        descripcion: "Desayuno buffet para 2 personas",
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439058"),
        idReservaServi: 5003,
        idReservaHabl: 3003,
        idServicio: 4004,
        idFactura: 6003,
        fecha: new Date("2024-11-02T09:00:00Z"),
        descripcion: "Tour por el centro histórico",
      },
    ]);

    // 7. EMPLEADO RESERVA SERVICIO
    results.empleadoReservaServicio = await this.insertData(
      "empleadoReservaServicio",
      [
        {
          _id: new ObjectId("507f1f77bcf86cd799439012"),
          idAsignacion: 2001,
          idReservaServi: 5001,
          idEmpleado: "87654321",
          fecha: new Date("2024-10-18T10:00:00Z"),
          descripcion: "Asignado al servicio de spa",
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439059"),
          idAsignacion: 2002,
          idReservaServi: 5002,
          idEmpleado: "87654322",
          fecha: new Date("2024-10-18T08:00:00Z"),
          descripcion: "Coordinación de desayuno buffet",
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439060"),
          idAsignacion: 2003,
          idReservaServi: 5003,
          idEmpleado: "87654323",
          fecha: new Date("2024-11-02T09:00:00Z"),
          descripcion: "Guía turístico asignado",
        },
      ]
    );

    // 8. VEHICULOS RESERVA SERVICIO
    results.vehiculosReservaServicio = await this.insertData(
      "vehiculosReservaServicio",
      [
        {
          _id: new ObjectId("507f1f77bcf86cd799439011"),
          idVehiculo: 1001,
          idReservaServi: 5002,
          fecha: new Date("2024-10-18T08:00:00Z"),
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439061"),
          idVehiculo: 2001,
          idReservaServi: 5003,
          fecha: new Date("2024-11-02T09:00:00Z"),
        },
      ]
    );

    // 9. PAGA
    results.paga = await this.insertData("paga", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439016"),
        idFactura: 6001,
        idCliente: "12345678",
        fechaPago: new Date("2024-10-17T14:30:00Z"),
        monto: this.ensureDouble(450.0),
        metodoPago: "Tarjeta de crédito",
        estado: "Completado",
        restante: this.ensureDouble(89.99),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439062"),
        idFactura: 6002,
        idCliente: "87654321",
        fechaPago: new Date("2024-10-19T09:00:00Z"),
        monto: this.ensureDouble(250.0),
        metodoPago: "Efectivo",
        estado: "Completado",
        restante: this.ensureDouble(0.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439063"),
        idFactura: 6003,
        idCliente: "11223344",
        fechaPago: new Date("2024-11-01T16:00:00Z"),
        monto: this.ensureDouble(500.0),
        metodoPago: "Transferencia",
        estado: "Pendiente",
        restante: this.ensureDouble(340.0),
      },
    ]);

    // 10. COMPRA
    results.compra = await this.insertData("compra", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439018"),
        idCompra: 9001,
        idFactura: 6001,
        idCliente: "12345678",
        fecha: new Date("2024-10-17T16:45:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439064"),
        idCompra: 9002,
        idCliente: "87654321",
        idFactura: 6002,
        fecha: new Date("2024-10-19T10:30:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439065"),
        idCompra: 9003,
        idCliente: "11223344",
        idFactura: 6003,
        fecha: new Date("2024-11-01T17:00:00Z"),
      },
    ]);

    // 11. PRODUCTO
    results.producto = await this.insertData("producto", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439021"),
        idProducto: 5001,
        nombreProducto: "Bebida Premium",
        cantidadGap: 10,
        cantidadStock: 100,
        idProveedor: 2001,
        tipoProducto: "Bebida",
        valorUnidad: this.ensureDouble(12.5),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439022"),
        idProducto: 5002,
        nombreProducto: "Snack Ejecutivo",
        cantidadGap: 5,
        cantidadStock: 50,
        idProveedor: 2001,
        tipoProducto: "Alimento",
        valorUnidad: this.ensureDouble(8.75),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439066"),
        idProducto: 5003,
        nombreProducto: "Agua Mineral",
        cantidadGap: 20,
        cantidadStock: 200,
        idProveedor: 2002,
        tipoProducto: "Bebida",
        valorUnidad: this.ensureDouble(3.5),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439067"),
        idProducto: 5004,
        nombreProducto: "Chocolate Gourmet",
        cantidadGap: 8,
        cantidadStock: 75,
        idProveedor: 2001,
        tipoProducto: "Alimento",
        valorUnidad: this.ensureDouble(15.0),
      },
    ]);

    // 12. PROVEEDOR
    results.proveedor = await this.insertData("proveedor", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439023"),
        idProveedor: 2001,
        nombre: "Distribuidor ABC",
        contacto: "contacto@distribuidorabc.com",
        tipoSuministro: "Bebidas y Alimentos",
        productos: [
          { idProducto: 5001 },
          { idProducto: 5002 },
          { idProducto: 5004 },
        ],
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439068"),
        idProveedor: 2002,
        nombre: "Bebidas del Norte",
        contacto: "ventas@bebidasnorte.com",
        tipoSuministro: "Bebidas",
        productos: [{ idProducto: 5003 }],
      },
    ]);

    // 13. CARRITO
    results.carrito = await this.insertData("carrito", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439022"),
        idVentaMercial: 10001,
        idCompra: 9001,
        idProducto: 5001,
        cantidad: 2,
        monto: this.ensureDouble(25.0),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439023"),
        idVentaMercial: 10002,
        idCompra: 9001,
        idProducto: 5002,
        cantidad: 1,
        monto: this.ensureDouble(8.75),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439069"),
        idVentaMercial: 10003,
        idCompra: 9002,
        idProducto: 5003,
        cantidad: 3,
        monto: this.ensureDouble(10.5),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439070"),
        idVentaMercial: 10004,
        idCompra: 9003,
        idProducto: 5004,
        cantidad: 2,
        monto: this.ensureDouble(30.0),
      },
    ]);

    // 14. PRODUCTO HOTEL
    results.productoHotel = await this.insertData("productoHotel", [
      {
        _id: new ObjectId("507f1f77bcf86cd799439024"),
        idProductoHot: 11001,
        idProducto: 5001,
        idHotel: 1,
        cantidadStock: 80,
        fechaIngresacion: new Date("2024-10-01T09:00:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439025"),
        idProductoHot: 11002,
        idProducto: 5002,
        idHotel: 1,
        cantidadStock: 45,
        fechaIngresacion: new Date("2024-10-02T10:00:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439071"),
        idProductoHot: 11003,
        idProducto: 5003,
        idHotel: 2,
        cantidadStock: 150,
        fechaIngresacion: new Date("2024-10-03T08:00:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439072"),
        idProductoHot: 11004,
        idProducto: 5004,
        idHotel: 2,
        cantidadStock: 60,
        fechaIngresacion: new Date("2024-10-04T11:00:00Z"),
      },
      {
        _id: new ObjectId("507f1f77bcf86cd799439073"),
        idProductoHot: 11005,
        idProducto: 5001,
        idHotel: 3,
        cantidadStock: 40,
        fechaIngresacion: new Date("2024-10-05T09:30:00Z"),
      },
    ]);

    return results;
  }

  async run() {
    try {
      await this.initialize();

      console.log(
        "📥 Insertando datos de ejemplo en todas las colecciones...\n"
      );
      const results = await this.insertAllSampleData();

      console.log("\n📊 Resumen de inserciones:");
      console.table(results);

      const totalInserted = Object.values(results).reduce(
        (sum, count) => sum + count,
        0
      );
      console.log(`\n🎉 Total de documentos insertados: ${totalInserted}`);

      if (totalInserted > 0) {
        console.log("\n🔍 Verificando datos insertados...");
        await this.verifyData();
      }
    } catch (error) {
      console.error("💥 Error durante la inserción:", error);
    } finally {
      await database.disconnect();
    }
  }

  async verifyData() {
    try {
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
        const collection = this.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   ${collectionName}: ${count} documentos`);
      }

      console.log("\n🔍 Verificación de tipos de datos:");
      await this.verifyDataTypes();
    } catch (error) {
      console.error("Error en verificación:", error);
    }
  }

  async verifyDataTypes() {
    try {
      const servicio = await this.db.collection("servicio").findOne({});
      console.log(
        `   ✓ Tipo de precio en servicio: ${typeof servicio.precio}, valor: ${
          servicio.precio
        }`
      );

      const hotel = await this.db.collection("hotel").findOne({});
      console.log(
        `   ✓ Tipo de precio en habitación: ${typeof hotel.habitaciones[0]
          .precio}, valor: ${hotel.habitaciones[0].precio}`
      );

      const cliente = await this.db.collection("cliente").findOne({});
      console.log(
        `   ✓ Tipo de precioTotal en cliente: ${typeof cliente.precioTotal}, valor: ${
          cliente.precioTotal
        }`
      );

      console.log("\n📋 Verificando estructura de reservaHabitacion:");
      const reserva = await this.db.collection("reservaHabitacion").findOne({});
      console.log(`   ✓ Campos en reserva: ${Object.keys(reserva).join(", ")}`);
      console.log(
        `   ✓ Campo reseñas presente: ${
          "resenas" in reserva ? "SÍ (eliminado del modelo)" : "NO (correcto)"
        }`
      );
    } catch (error) {
      console.log("   ⚠️  No se pudieron verificar todos los tipos de datos");
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const inserter = new SampleDataInserter();
  inserter.run();
}

module.exports = SampleDataInserter;
