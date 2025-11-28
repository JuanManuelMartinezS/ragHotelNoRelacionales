const schemas = {
  // 1. vehiculosReservaServicio - CORREGIDO
  vehiculosReservaServicio: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idVehiculo", "idReservaServicio"],
        properties: {
          _id: { bsonType: "objectId" },
          idVehiculo: { bsonType: "int" }, // Cambiado de decimal a int
          idReservaServicio: { bsonType: "int" }, // Cambiado de decimal a int
          fechaRegistro: { bsonType: "date" },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 2. empleadoReservaServicio - CORREGIDO
  empleadoReservaServicio: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idAsignacion", "idReservaServicio", "idEmpleado"],
        properties: {
          _id: { bsonType: "objectId" },
          idAsignacion: { bsonType: "int" }, // Cambiado de decimal a int
          idReservaServicio: { bsonType: "int" }, // Cambiado de decimal a int
          idEmpleado: { bsonType: "string" },
          fecha: { bsonType: "date" },
          descripcion: { bsonType: "string" },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 3. reservaServicio - CORREGIDO
  reservaServicio: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idReservableHabitacion", "idServicio", "idFactura"],
        properties: {
          _id: { bsonType: "objectId" },
          idReservableHabitacion: { bsonType: "int" }, // Cambiado de decimal a int
          idServicio: { bsonType: "int" }, // Cambiado de decimal a int
          idFactura: { bsonType: "int" }, // Cambiado de decimal a int
          nombre: { bsonType: "string" },
          descripcion: { bsonType: "string" },
          precio: { bsonType: "double" }, // Cambiado de decimal a double para valores decimales
          idHotel: { bsonType: "int" }, // Cambiado de decimal a int
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 4. servicio - CORREGIDO
  servicio: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idServicio", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          idServicio: { bsonType: "int" }, // Cambiado de decimal a int
          nombre: { bsonType: "string" },
          descripcion: { bsonType: "string" },
          precio: { bsonType: "double" }, // Cambiado de decimal a double
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 5. cliente - CORREGIDO
  cliente: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "cedula", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          cedula: { bsonType: "string" },
          nombre: { bsonType: "string" },
          apellido: { bsonType: "string" },
          categoria: { bsonType: "string" },
          pagos: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["idFactura", "monto", "fechaPago"],
              properties: {
                idFactura: { bsonType: "int" }, // Cambiado de decimal a int
                monto: { bsonType: "double" }, // Cambiado de decimal a double
                fechaPago: { bsonType: "date" },
                estado: { bsonType: "string" },
              },
            },
          },
          idReservaHabitacion: { bsonType: "int" }, // Cambiado de decimal a int
          precioTotal: { bsonType: "double" }, // Cambiado de decimal a double
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 6. paga - CORREGIDO
  paga: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idFactura"],
        properties: {
          _id: { bsonType: "objectId" },
          idFactura: { bsonType: "int" }, // Cambiado de decimal a int
          idCliente: { bsonType: "string" },
          monto: { bsonType: "double" }, // Cambiado de decimal a double
          fechaPago: { bsonType: "date" },
          metodoPago: { bsonType: "string" },
          estado: { bsonType: "string" },
          restante: { bsonType: "double" }, // Cambiado de decimal a double
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 7. reservaHabitacion - CORREGIDO
  reservaHabitacion: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "_id",
          "idReservableHabitacion",
          "idCliente",
          "idHabitacion",
        ],
        properties: {
          _id: { bsonType: "objectId" },
          idReservableHabitacion: { bsonType: "int" }, // Cambiado de decimal a int
          idCliente: { bsonType: "string" },
          idHabitacion: { bsonType: "int" }, // Cambiado de decimal a int
          fechaEntrada: { bsonType: "date" },
          fechaSalida: { bsonType: "date" },
          estado: { bsonType: "string" },
          resenas: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["idResena", "comentario", "puntuacion"],
              properties: {
                idResena: { bsonType: "int" }, // Cambiado de decimal a int
                comentario: { bsonType: "string" },
                puntuacion: { bsonType: "int" },
              },
            },
          },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 8. compra - CORREGIDO
  compra: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idCompra", "idFactura", "idCliente"],
        properties: {
          _id: { bsonType: "objectId" },
          idCompra: { bsonType: "int" }, // Cambiado de decimal a int
          idFactura: { bsonType: "int" }, // Cambiado de decimal a int
          idCliente: { bsonType: "string" },
          fecha: { bsonType: "date" },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 9. empleado - CORREGIDO
  empleado: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "cedula", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          cedula: { bsonType: "string" },
          nombre: { bsonType: "string" },
          apellido: { bsonType: "string" },
          cargo: { bsonType: "string" },
          turno: { bsonType: "string" },
          idHotel: { bsonType: "int" }, // Cambiado de decimal a int
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 10. hotel - CORREGIDO
  hotel: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idHotel", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          idHotel: { bsonType: "int" }, // Cambiado de decimal a int
          nombre: { bsonType: "string" },
          direccion: { bsonType: "string" },
          numeroEstrelllas: { bsonType: "int" },
          capacidad: { bsonType: "int" }, // Cambiado de decimal a int
          contacto: { bsonType: "string" },
          habitaciones: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["idHabitacion", "capacidad", "tipo", "precio"],
              properties: {
                idHabitacion: { bsonType: "int" }, // Cambiado de decimal a int
                capacidad: { bsonType: "int" }, // Cambiado de decimal a int
                tipo: { bsonType: "string" },
                precio: { bsonType: "double" }, // Cambiado de decimal a double
              },
            },
          },
          empleados: {
            bsonType: "array",
            items: { bsonType: "string" },
          },
          vehiculos: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["idVehiculo", "tipo", "capacidad", "precio"],
              properties: {
                idVehiculo: { bsonType: "int" }, // Cambiado de decimal a int
                tipo: { bsonType: "string" },
                capacidad: { bsonType: "int" }, // Cambiado de decimal a int
                precio: { bsonType: "double" }, // Cambiado de decimal a double
              },
            },
          },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 11. producto - CORREGIDO
  producto: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idProducto", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          idProducto: { bsonType: "int" }, // Cambiado de decimal a int
          nombre: { bsonType: "string" },
          cantidadStock: { bsonType: "int" }, // Cambiado de decimal a int
          cantidadGap: { bsonType: "int" }, // Cambiado de decimal a int
          idProveedor: { bsonType: "int" }, // Cambiado de decimal a int
          tipoProducto: { bsonType: "string" },
          valorUnidad: { bsonType: "double" }, // Cambiado de decimal a double
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 12. carrito - CORREGIDO
  carrito: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idVentaMercial", "idCompra", "idProducto"],
        properties: {
          _id: { bsonType: "objectId" },
          idVentaMercial: { bsonType: "int" }, // Cambiado de decimal a int
          idCompra: { bsonType: "int" }, // Cambiado de decimal a int
          idProducto: { bsonType: "int" }, // Cambiado de decimal a int
          cantidad: { bsonType: "int" }, // Cambiado de decimal a int
          monto: { bsonType: "double" }, // Cambiado de decimal a double
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 13. proveedor - CORREGIDO
  proveedor: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idProveedor", "nombre"],
        properties: {
          _id: { bsonType: "objectId" },
          idProveedor: { bsonType: "int" }, // Cambiado de decimal a int
          nombre: { bsonType: "string" },
          contacto: { bsonType: "string" },
          tipoSuministro: { bsonType: "string" },
          productos: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["idProducto"],
              properties: {
                idProducto: { bsonType: "int" }, // Cambiado de decimal a int
              },
            },
          },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },

  // 14. productoHotel - CORREGIDO
  productoHotel: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "idProductoHotel", "idProducto"],
        properties: {
          _id: { bsonType: "objectId" },
          idProductoHotel: { bsonType: "int" }, // Cambiado de decimal a int
          idProducto: { bsonType: "int" }, // Cambiado de decimal a int
          idHotel: { bsonType: "int" }, // Cambiado de decimal a int
          cantidadStock: { bsonType: "int" }, // Cambiado de decimal a int
          fechaIngresacion: { bsonType: "date" },
        },
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  },
};

module.exports = schemas;
