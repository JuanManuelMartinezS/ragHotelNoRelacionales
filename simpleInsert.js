const database = require("./config/database");
const { ObjectId, Double } = require("mongodb");

async function loadCompleteData() {
  try {
    const db = await database.connect();

    console.log("\n🚀 CARGANDO BASE DE DATOS COMPLETA\n");
    console.log("=".repeat(70));

    // Helper
    const D = (val) => new Double(val);

    // 1. SERVICIO - 7 servicios
    console.log("\n📦 Insertando SERVICIOS...");
    await db.collection("servicio").deleteMany({});
    const servicios = await db.collection("servicio").insertMany([
      {
        idServicio: 4001,
        nombre: "Spa Premium",
        descripcion: "Centro de relajación con masajes terapéuticos",
        precio: D(89.99),
      },
      {
        idServicio: 4002,
        nombre: "Transporte Aeropuerto",
        descripcion: "Servicio de transporte desde/hacia aeropuerto",
        precio: D(35.0),
      },
      {
        idServicio: 4003,
        nombre: "Desayuno Buffet",
        descripcion: "Buffet de desayuno internacional",
        precio: D(25.5),
      },
      {
        idServicio: 4004,
        nombre: "Tour Guiado",
        descripcion: "Tour por la ciudad con guía profesional",
        precio: D(65.0),
      },
      {
        idServicio: 4005,
        nombre: "Gimnasio Premium",
        descripcion: "Acceso al gimnasio y clases grupales",
        precio: D(15.0),
      },
      {
        idServicio: 4006,
        nombre: "Cena Romántica",
        descripcion: "Cena especial para dos personas",
        precio: D(120.0),
      },
      {
        idServicio: 4007,
        nombre: "Limpieza Extra",
        descripcion: "Servicio de limpieza adicional",
        precio: D(20.0),
      },
    ]);
    console.log(`   ✅ ${servicios.insertedCount} servicios insertados`);

    // 2. HOTEL - 5 hoteles
    console.log("\n🏨 Insertando HOTELES...");
    await db.collection("hotel").deleteMany({});
    const hoteles = await db.collection("hotel").insertMany([
      {
        idHotel: 1,
        nombre: "Hotel Paradise",
        direccion: "Calle Principal 123, Playa del Carmen",
        numeroEstrelllas: 5,
        ciudad: "Playa del Carmen",
        capacidad: 150,
        contacto: "info@hotelparadise.com",
        empleados: ["EMP001", "EMP002"],
        habitaciones: [
          { idHabitacion: 101, capacidad: 2, tipo: "Doble", precio: D(150.0) },
          {
            idHabitacion: 102,
            capacidad: 4,
            tipo: "Familiar",
            precio: D(250.0),
          },
          { idHabitacion: 103, capacidad: 2, tipo: "Suite", precio: D(350.0) },
          {
            idHabitacion: 104,
            capacidad: 1,
            tipo: "Individual",
            precio: D(100.0),
          },
        ],
        vehiculos: [
          { idVehiculo: 1001, tipo: "Sedan", capacidad: 4, precio: D(50.0) },
          { idVehiculo: 1002, tipo: "SUV", capacidad: 6, precio: D(80.0) },
        ],
      },
      {
        idHotel: 2,
        nombre: "Grand Boutique Hotel",
        direccion: "Avenida Central 456, Ciudad de México",
        numeroEstrelllas: 4,
        ciudad: "Ciudad de México",
        capacidad: 80,
        contacto: "reservas@grandboutique.com",
        empleados: ["EMP003", "EMP004"],
        habitaciones: [
          {
            idHabitacion: 201,
            capacidad: 2,
            tipo: "Doble Ejecutiva",
            precio: D(180.0),
          },
          {
            idHabitacion: 202,
            capacidad: 2,
            tipo: "Suite Junior",
            precio: D(280.0),
          },
          { idHabitacion: 203, capacidad: 3, tipo: "Triple", precio: D(220.0) },
        ],
        vehiculos: [
          { idVehiculo: 2001, tipo: "Van", capacidad: 8, precio: D(100.0) },
        ],
      },
      {
        idHotel: 3,
        nombre: "Mountain View Lodge",
        direccion: "Carretera Nacional km 45, Monterrey",
        numeroEstrelllas: 3,
        ciudad: "Monterrey",
        capacidad: 60,
        contacto: "contacto@mountainview.com",
        empleados: ["EMP005"],
        habitaciones: [
          {
            idHabitacion: 301,
            capacidad: 2,
            tipo: "Estándar",
            precio: D(90.0),
          },
          {
            idHabitacion: 302,
            capacidad: 4,
            tipo: "Familiar",
            precio: D(160.0),
          },
          {
            idHabitacion: 303,
            capacidad: 2,
            tipo: "Vista Montaña",
            precio: D(120.0),
          },
        ],
        vehiculos: [
          { idVehiculo: 3001, tipo: "Pickup", capacidad: 5, precio: D(60.0) },
        ],
      },
      {
        idHotel: 4,
        nombre: "Beach Resort Premium",
        direccion: "Costera Miguel Alemán 789, Acapulco",
        numeroEstrelllas: 5,
        ciudad: "Acapulco",
        capacidad: 200,
        contacto: "info@beachresort.com",
        empleados: ["EMP006", "EMP007"],
        habitaciones: [
          {
            idHabitacion: 401,
            capacidad: 2,
            tipo: "Vista al Mar",
            precio: D(300.0),
          },
          {
            idHabitacion: 402,
            capacidad: 4,
            tipo: "Suite Familiar",
            precio: D(450.0),
          },
          {
            idHabitacion: 403,
            capacidad: 2,
            tipo: "Penthouse",
            precio: D(800.0),
          },
        ],
        vehiculos: [
          {
            idVehiculo: 4001,
            tipo: "Convertible",
            capacidad: 4,
            precio: D(120.0),
          },
        ],
      },
      {
        idHotel: 5,
        nombre: "City Business Hotel",
        direccion: "Av. Reforma 234, Guadalajara",
        numeroEstrelllas: 4,
        ciudad: "Guadalajara",
        capacidad: 100,
        contacto: "reservas@citybusiness.com",
        empleados: ["EMP008"],
        habitaciones: [
          {
            idHabitacion: 501,
            capacidad: 1,
            tipo: "Ejecutiva",
            precio: D(130.0),
          },
          { idHabitacion: 502, capacidad: 2, tipo: "Doble", precio: D(170.0) },
          { idHabitacion: 503, capacidad: 2, tipo: "Suite", precio: D(250.0) },
        ],
        vehiculos: [],
      },
    ]);
    console.log(`   ✅ ${hoteles.insertedCount} hoteles insertados`);

    // 3. EMPLEADO - 8 empleados
    console.log("\n👥 Insertando EMPLEADOS...");
    await db.collection("empleado").deleteMany({});
    const empleados = await db.collection("empleado").insertMany([
      {
        cedula: "EMP001",
        nombre: "Carlos",
        apellido: "García",
        cargo: "Recepcionista",
        turno: "Mañana",
        idHotel: 1,
      },
      {
        cedula: "EMP002",
        nombre: "Ana",
        apellido: "Martínez",
        cargo: "Gerente",
        turno: "Completo",
        idHotel: 1,
      },
      {
        cedula: "EMP003",
        nombre: "Luis",
        apellido: "Hernández",
        cargo: "Recepcionista",
        turno: "Tarde",
        idHotel: 2,
      },
      {
        cedula: "EMP004",
        nombre: "Patricia",
        apellido: "Morales",
        cargo: "Supervisora",
        turno: "Mañana",
        idHotel: 2,
      },
      {
        cedula: "EMP005",
        nombre: "Roberto",
        apellido: "Sánchez",
        cargo: "Conserje",
        turno: "Noche",
        idHotel: 3,
      },
      {
        cedula: "EMP006",
        nombre: "María",
        apellido: "López",
        cargo: "Gerente",
        turno: "Completo",
        idHotel: 4,
      },
      {
        cedula: "EMP007",
        nombre: "José",
        apellido: "Ramírez",
        cargo: "Recepcionista",
        turno: "Mañana",
        idHotel: 4,
      },
      {
        cedula: "EMP008",
        nombre: "Laura",
        apellido: "Torres",
        cargo: "Supervisora",
        turno: "Tarde",
        idHotel: 5,
      },
    ]);
    console.log(`   ✅ ${empleados.insertedCount} empleados insertados`);

    // 4. CLIENTE - 10 clientes
    console.log("\n🧑 Insertando CLIENTES...");
    await db.collection("cliente").deleteMany({});
    const clientes = await db.collection("cliente").insertMany([
      {
        cedula: "CLI001",
        nombre: "Juan",
        apellidos: "Pérez García",
        categoria: "Premium",
        pagos: [],
        idReservaHabl: 3001,
        precioTotal: D(1200.0),
      },
      {
        cedula: "CLI002",
        nombre: "María",
        apellidos: "González López",
        categoria: "Estándar",
        pagos: [],
        idReservaHabl: 3002,
        precioTotal: D(750.0),
      },
      {
        cedula: "CLI003",
        nombre: "Carlos",
        apellidos: "Ramírez Torres",
        categoria: "Premium",
        pagos: [],
        idReservaHabl: 3003,
        precioTotal: D(1500.0),
      },
      {
        cedula: "CLI004",
        nombre: "Ana",
        apellidos: "Martínez Silva",
        categoria: "Estándar",
        pagos: [],
        idReservaHabl: 3004,
        precioTotal: D(600.0),
      },
      {
        cedula: "CLI005",
        nombre: "Pedro",
        apellidos: "Sánchez Cruz",
        categoria: "VIP",
        pagos: [],
        idReservaHabl: 3005,
        precioTotal: D(2400.0),
      },
      {
        cedula: "CLI006",
        nombre: "Sofía",
        apellidos: "Ruiz Flores",
        categoria: "Premium",
        pagos: [],
        idReservaHabl: 3006,
        precioTotal: D(900.0),
      },
      {
        cedula: "CLI007",
        nombre: "Miguel",
        apellidos: "Hernández Díaz",
        categoria: "Estándar",
        pagos: [],
        idReservaHabl: 3007,
        precioTotal: D(540.0),
      },
      {
        cedula: "CLI008",
        nombre: "Isabel",
        apellidos: "Jiménez Vargas",
        categoria: "Premium",
        pagos: [],
        idReservaHabl: 3008,
        precioTotal: D(1350.0),
      },
      {
        cedula: "CLI009",
        nombre: "Fernando",
        apellidos: "Moreno Castro",
        categoria: "VIP",
        pagos: [],
        idReservaHabl: 3009,
        precioTotal: D(3200.0),
      },
      {
        cedula: "CLI010",
        nombre: "Carmen",
        apellidos: "Ortiz Mendoza",
        categoria: "Estándar",
        pagos: [],
        idReservaHabl: 3010,
        precioTotal: D(480.0),
      },
    ]);
    console.log(`   ✅ ${clientes.insertedCount} clientes insertados`);

    // 5. RESERVA HABITACION - 10 reservas
    console.log("\n🛏️  Insertando RESERVAS DE HABITACIÓN...");
    await db.collection("reservaHabitacion").deleteMany({});
    const reservasHab = await db.collection("reservaHabitacion").insertMany([
      {
        idReservaHabl: 3001,
        idCliente: "CLI001",
        idHabitacion: 101,
        fechaReserva: new Date("2024-11-01"),
        fechaSalida: new Date("2024-11-05"),
        estado: "Confirmada",
      },
      {
        idReservaHabl: 3002,
        idCliente: "CLI002",
        idHabitacion: 102,
        fechaReserva: new Date("2024-11-03"),
        fechaSalida: new Date("2024-11-07"),
        estado: "Activa",
      },
      {
        idReservaHabl: 3003,
        idCliente: "CLI003",
        idHabitacion: 201,
        fechaReserva: new Date("2024-11-05"),
        fechaSalida: new Date("2024-11-10"),
        estado: "Confirmada",
      },
      {
        idReservaHabl: 3004,
        idCliente: "CLI004",
        idHabitacion: 301,
        fechaReserva: new Date("2024-11-07"),
        fechaSalida: new Date("2024-11-12"),
        estado: "Pendiente",
      },
      {
        idReservaHabl: 3005,
        idCliente: "CLI005",
        idHabitacion: 401,
        fechaReserva: new Date("2024-11-10"),
        fechaSalida: new Date("2024-11-15"),
        estado: "Confirmada",
      },
      {
        idReservaHabl: 3006,
        idCliente: "CLI006",
        idHabitacion: 103,
        fechaReserva: new Date("2024-11-12"),
        fechaSalida: new Date("2024-11-16"),
        estado: "Activa",
      },
      {
        idReservaHabl: 3007,
        idCliente: "CLI007",
        idHabitacion: 302,
        fechaReserva: new Date("2024-11-14"),
        fechaSalida: new Date("2024-11-18"),
        estado: "Confirmada",
      },
      {
        idReservaHabl: 3008,
        idCliente: "CLI008",
        idHabitacion: 202,
        fechaReserva: new Date("2024-11-16"),
        fechaSalida: new Date("2024-11-20"),
        estado: "Confirmada",
      },
      {
        idReservaHabl: 3009,
        idCliente: "CLI009",
        idHabitacion: 403,
        fechaReserva: new Date("2024-11-18"),
        fechaSalida: new Date("2024-11-25"),
        estado: "VIP",
      },
      {
        idReservaHabl: 3010,
        idCliente: "CLI010",
        idHabitacion: 501,
        fechaReserva: new Date("2024-11-20"),
        fechaSalida: new Date("2024-11-23"),
        estado: "Pendiente",
      },
    ]);
    console.log(
      `   ✅ ${reservasHab.insertedCount} reservas de habitación insertadas`
    );

    // 6. RESERVA SERVICIO - 8 reservas de servicio
    console.log("\n🎯 Insertando RESERVAS DE SERVICIO...");
    await db.collection("reservaServicio").deleteMany({});
    const reservasServ = await db.collection("reservaServicio").insertMany([
      {
        idReservaServi: 5001,
        idReservaHabl: 3001,
        idServicio: 4001,
        idFactura: 6001,
        fecha: new Date("2024-11-02"),
        descripcion: "Spa Premium",
      },
      {
        idReservaServi: 5002,
        idReservaHabl: 3001,
        idServicio: 4003,
        idFactura: 6001,
        fecha: new Date("2024-11-02"),
        descripcion: "Desayuno",
      },
      {
        idReservaServi: 5003,
        idReservaHabl: 3003,
        idServicio: 4004,
        idFactura: 6003,
        fecha: new Date("2024-11-06"),
        descripcion: "Tour ciudad",
      },
      {
        idReservaServi: 5004,
        idReservaHabl: 3005,
        idServicio: 4006,
        idFactura: 6005,
        fecha: new Date("2024-11-11"),
        descripcion: "Cena romántica",
      },
      {
        idReservaServi: 5005,
        idReservaHabl: 3006,
        idServicio: 4002,
        idFactura: 6006,
        fecha: new Date("2024-11-13"),
        descripcion: "Transporte",
      },
      {
        idReservaServi: 5006,
        idReservaHabl: 3008,
        idServicio: 4005,
        idFactura: 6008,
        fecha: new Date("2024-11-17"),
        descripcion: "Gimnasio",
      },
      {
        idReservaServi: 5007,
        idReservaHabl: 3009,
        idServicio: 4001,
        idFactura: 6009,
        fecha: new Date("2024-11-19"),
        descripcion: "Spa VIP",
      },
      {
        idReservaServi: 5008,
        idReservaHabl: 3009,
        idServicio: 4006,
        idFactura: 6009,
        fecha: new Date("2024-11-20"),
        descripcion: "Cena VIP",
      },
    ]);
    console.log(
      `   ✅ ${reservasServ.insertedCount} reservas de servicio insertadas`
    );

    // 7. EMPLEADO RESERVA SERVICIO
    console.log("\n👔 Insertando EMPLEADO-RESERVA-SERVICIO...");
    await db.collection("empleadoReservaServicio").deleteMany({});
    const empReserv = await db
      .collection("empleadoReservaServicio")
      .insertMany([
        {
          idAsignacion: 2001,
          idReservaServi: 5001,
          idEmpleado: "EMP001",
          fecha: new Date("2024-11-02"),
          descripcion: "Spa",
        },
        {
          idAsignacion: 2002,
          idReservaServi: 5003,
          idEmpleado: "EMP003",
          fecha: new Date("2024-11-06"),
          descripcion: "Tour",
        },
        {
          idAsignacion: 2003,
          idReservaServi: 5004,
          idEmpleado: "EMP006",
          fecha: new Date("2024-11-11"),
          descripcion: "Cena",
        },
        {
          idAsignacion: 2004,
          idReservaServi: 5007,
          idEmpleado: "EMP006",
          fecha: new Date("2024-11-19"),
          descripcion: "Spa VIP",
        },
      ]);
    console.log(`   ✅ ${empReserv.insertedCount} asignaciones insertadas`);

    // 8. VEHICULOS RESERVA SERVICIO
    console.log("\n🚗 Insertando VEHICULOS-RESERVA-SERVICIO...");
    await db.collection("vehiculosReservaServicio").deleteMany({});
    const vehReserv = await db
      .collection("vehiculosReservaServicio")
      .insertMany([
        {
          idVehiculo: 1001,
          idReservaServi: 5005,
          fecha: new Date("2024-11-13"),
        },
        {
          idVehiculo: 4001,
          idReservaServi: 5007,
          fecha: new Date("2024-11-19"),
        },
      ]);
    console.log(`   ✅ ${vehReserv.insertedCount} vehículos asignados`);

    // 9. PAGA
    console.log("\n💰 Insertando PAGOS...");
    await db.collection("paga").deleteMany({});
    const pagos = await db.collection("paga").insertMany([
      {
        idFactura: 6001,
        idCliente: "CLI001",
        fechaPago: new Date("2024-11-01"),
        monto: D(1200.0),
        metodoPago: "Tarjeta",
        estado: "Completado",
        restante: D(0),
      },
      {
        idFactura: 6002,
        idCliente: "CLI002",
        fechaPago: new Date("2024-11-03"),
        monto: D(750.0),
        metodoPago: "Efectivo",
        estado: "Completado",
        restante: D(0),
      },
      {
        idFactura: 6003,
        idCliente: "CLI003",
        fechaPago: new Date("2024-11-05"),
        monto: D(1500.0),
        metodoPago: "Transferencia",
        estado: "Completado",
        restante: D(0),
      },
      {
        idFactura: 6005,
        idCliente: "CLI005",
        fechaPago: new Date("2024-11-10"),
        monto: D(2400.0),
        metodoPago: "Tarjeta",
        estado: "Completado",
        restante: D(0),
      },
    ]);
    console.log(`   ✅ ${pagos.insertedCount} pagos insertados`);

    // 10. COMPRA
    console.log("\n🛒 Insertando COMPRAS...");
    await db.collection("compra").deleteMany({});
    const compras = await db.collection("compra").insertMany([
      {
        idCompra: 9001,
        idFactura: 6001,
        idCliente: "CLI001",
        fecha: new Date("2024-11-01"),
      },
      {
        idCompra: 9002,
        idFactura: 6002,
        idCliente: "CLI002",
        fecha: new Date("2024-11-03"),
      },
      {
        idCompra: 9003,
        idFactura: 6005,
        idCliente: "CLI005",
        fecha: new Date("2024-11-10"),
      },
    ]);
    console.log(`   ✅ ${compras.insertedCount} compras insertadas`);

    // 11. PRODUCTO
    console.log("\n📦 Insertando PRODUCTOS...");
    await db.collection("producto").deleteMany({});
    const productos = await db.collection("producto").insertMany([
      {
        idProducto: 5001,
        nombreProducto: "Bebida Premium",
        cantidadGap: 10,
        cantidadStock: 100,
        idProveedor: 2001,
        tipoProducto: "Bebida",
        valorUnidad: D(12.5),
      },
      {
        idProducto: 5002,
        nombreProducto: "Snack Ejecutivo",
        cantidadGap: 5,
        cantidadStock: 50,
        idProveedor: 2001,
        tipoProducto: "Alimento",
        valorUnidad: D(8.75),
      },
      {
        idProducto: 5003,
        nombreProducto: "Agua Mineral",
        cantidadGap: 20,
        cantidadStock: 200,
        idProveedor: 2002,
        tipoProducto: "Bebida",
        valorUnidad: D(3.5),
      },
      {
        idProducto: 5004,
        nombreProducto: "Chocolate Gourmet",
        cantidadGap: 8,
        cantidadStock: 75,
        idProveedor: 2001,
        tipoProducto: "Alimento",
        valorUnidad: D(15.0),
      },
      {
        idProducto: 5005,
        nombreProducto: "Vino Tinto",
        cantidadGap: 12,
        cantidadStock: 60,
        idProveedor: 2003,
        tipoProducto: "Bebida",
        valorUnidad: D(45.0),
      },
    ]);
    console.log(`   ✅ ${productos.insertedCount} productos insertados`);

    // 12. PROVEEDOR
    console.log("\n🏭 Insertando PROVEEDORES...");
    await db.collection("proveedor").deleteMany({});
    const proveedores = await db.collection("proveedor").insertMany([
      {
        idProveedor: 2001,
        nombre: "Distribuidor ABC",
        contacto: "contacto@abc.com",
        tipoSuministro: "Bebidas y Alimentos",
        productos: [
          { idProducto: 5001 },
          { idProducto: 5002 },
          { idProducto: 5004 },
        ],
      },
      {
        idProveedor: 2002,
        nombre: "Bebidas del Norte",
        contacto: "ventas@norte.com",
        tipoSuministro: "Bebidas",
        productos: [{ idProducto: 5003 }],
      },
      {
        idProveedor: 2003,
        nombre: "Vinos Premium",
        contacto: "info@vinospremium.com",
        tipoSuministro: "Bebidas Alcohólicas",
        productos: [{ idProducto: 5005 }],
      },
    ]);
    console.log(`   ✅ ${proveedores.insertedCount} proveedores insertados`);

    // 13. CARRITO
    console.log("\n🛍️  Insertando CARRITO...");
    await db.collection("carrito").deleteMany({});
    const carritos = await db.collection("carrito").insertMany([
      {
        idVentaMercial: 10001,
        idCompra: 9001,
        idProducto: 5001,
        cantidad: 2,
        monto: D(25.0),
      },
      {
        idVentaMercial: 10002,
        idCompra: 9001,
        idProducto: 5004,
        cantidad: 1,
        monto: D(15.0),
      },
      {
        idVentaMercial: 10003,
        idCompra: 9002,
        idProducto: 5003,
        cantidad: 3,
        monto: D(10.5),
      },
      {
        idVentaMercial: 10004,
        idCompra: 9003,
        idProducto: 5005,
        cantidad: 2,
        monto: D(90.0),
      },
    ]);
    console.log(`   ✅ ${carritos.insertedCount} items en carrito insertados`);

    // 14. PRODUCTO HOTEL
    console.log("\n🏨 Insertando PRODUCTO-HOTEL...");
    await db.collection("productoHotel").deleteMany({});
    const prodHotel = await db.collection("productoHotel").insertMany([
      {
        idProductoHot: 11001,
        idProducto: 5001,
        idHotel: 1,
        cantidadStock: 80,
        fechaIngresacion: new Date("2024-10-01"),
      },
      {
        idProductoHot: 11002,
        idProducto: 5002,
        idHotel: 1,
        cantidadStock: 45,
        fechaIngresacion: new Date("2024-10-01"),
      },
      {
        idProductoHot: 11003,
        idProducto: 5003,
        idHotel: 2,
        cantidadStock: 150,
        fechaIngresacion: new Date("2024-10-05"),
      },
      {
        idProductoHot: 11004,
        idProducto: 5004,
        idHotel: 3,
        cantidadStock: 60,
        fechaIngresacion: new Date("2024-10-10"),
      },
      {
        idProductoHot: 11005,
        idProducto: 5005,
        idHotel: 4,
        cantidadStock: 40,
        fechaIngresacion: new Date("2024-10-15"),
      },
    ]);
    console.log(`   ✅ ${prodHotel.insertedCount} productos-hotel insertados`);

    console.log("\n" + "=".repeat(70));
    console.log("\n📊 RESUMEN TOTAL:");
    const total = [
      servicios,
      hoteles,
      empleados,
      clientes,
      reservasHab,
      reservasServ,
      empReserv,
      vehReserv,
      pagos,
      compras,
      productos,
      proveedores,
      carritos,
      prodHotel,
    ].reduce((sum, r) => sum + r.insertedCount, 0);

    console.log(`   🎉 ${total} documentos insertados en total\n`);
    console.log("   ✅ Base de datos cargada completamente");
    console.log("   💡 Ejecuta: node verifyData.js\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await database.disconnect();
  }
}

loadCompleteData();
