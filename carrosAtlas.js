const { MongoClient } = require("mongodb");

// URL de conexión de MongoDB Atlas
const url =
  "mongodb+srv://juanyaca2006_db_user:juanmanuel07@cluster0.563va5d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(url);

async function getCarDetailsByModelId(modelId) {
  try {
    await client.connect();

    const db = client.db("CarrosAtlas"); //
    const collection = db.collection("carDetails");

    //valida que exista el MODELID
    const modelos2 = await collection.distinct("carName.modelDetail.modelid");
    console.log("MODELIDs en carName.modelDetail.MODELID:", modelos2);

    const pipeline = [
      {
        $match: {
          "carName.modelDetail.modelid": modelId,
        },
      },
      {
        $project: {
          _id: 0,
          Descripcion: "$carName.description",
          Modelo: "$carName.modelDetail.model",
          PrecioUnitario: "$carName.modelDetail.valoruni",
          TotalDisponible: "$carName.modelDetail.totalcars",
        },
      },
    ];

    //en model details inserta el total cars
    // const results = await collection.aggregate(pipeline).toArray();

    if (results.length === 0) {
      console.log("No se encontraron autos para ese modelo.");
    } else {
      results.forEach((car) => {
        console.log("Descripción:", car.Descripcion);
        console.log("Modelo:", car.Modelo);
        console.log("Precio Unitario:", car.PrecioUnitario);
        console.log("Total Disponible:", car.TotalDisponible);
        console.log("-----------");
      });
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

//funcion que verifique si el fabricante tiene modelos en models details no lo deje eliminar, sino tiene modleos si lo deja eliminar
//si maker id tiene modelos en model details no lo deja eliminar

async function canDeleteMaker(makerId) {
  try {
    await client.connect();
    const db = client.db("CarrosAtlas");
    const collection = db.collection("carDetails");

    // Verificamos si ese makerId tiene modelos asociados
    const modelos = await collection
      .find({ "carName.modelDetail.makerid": makerId })
      .toArray();

    if (modelos.length > 0) {
      console.log(
        `❌ El fabricante con makerid ${makerId} aún tiene modelos. No se puede eliminar.`
      );
      return false;
    }

    // Si no tiene modelos, eliminamos el fabricante
    // const result = await collection.deleteOne({ "carName.makerid": makerId });
    return true;
  } catch (err) {
    console.error("Error:", err);
    return false;
  } finally {
    await client.close();
  }
}

async function deleteMaker(makerId) {
  try {
    await client.connect();
    const db = client.db("CarrosAtlas");
    const collection = db.collection("carMakers");
    //verificar si tiene modelos
    const canDelete = await canDeleteMaker(makerId);
    if (!canDelete) {
      console.log(
        `❌ No se puede eliminar el fabricante con makerid ${makerId} porque tiene modelos asociados.`
      );
      return;
    }
    const result = await collection.deleteOne({ makerid: makerId });
    if (result.deletedCount === 1) {
      console.log(`✅ Fabricante con makerid ${makerId} eliminado.`);
    } else {
      console.log(`❌ No se encontró el fabricante con makerid ${makerId}.`);
    }
  } catch (error) {}
}
async function insertCarWithoutMakerId() {
  try {
    await client.connect();
    const db = client.db("CarrosAtlas");
    const collection = db.collection("carDetails");

    const newCar = {
      carid: 202, // puedes generar un ID único
      mpg: 30.0,
      cylinders: 4,
      enginedisplacement: 2,
      horsepower: 180,
      weight: 2800,
      acceleration: 6.5,
      year: 2024,
      fechaActualizacion: new Date(),
      carName: {
        carid: 202,
        description: "Mazda 3 Sedan 2024",
        modelid: 5,
        modelDetail: {
          // ⚠️ aquí no se coloca makerid
          model: "Mazda 3",
          modelid: 5,
          totalcars: 1000,
          valoruni: 25000.75,
        },
      },
    };

    const result = await collection.insertOne(newCar);
    console.log("✅ Carro insertado sin makerid:", result.insertedId);
  } catch (err) {
    console.error("Error al insertar:", err);
  } finally {
    await client.close();
  }
}
async function insertCarMaker() {
  try {
    await client.connect();
    const db = client.db("CarrosAtlas");
    const collection = db.collection("carMakers");

    const newMaker = {
      makerid: 999,
      maker: "Chevrolet",
      fullname: "Chevrolet Motors",
      countryid: 1,
    };

    const result = await collection.insertOne(newMaker);
    console.log("✅ Fabricante insertado en carMaker:", result.insertedId);
  } catch (err) {
    console.error("Error al insertar fabricante:", err);
  } finally {
    await client.close();
  }
}

// La función se crea dentro del contexto del mismo código
async function addCarDetails(carData) {
  try {
    await client.connect();
    console.log("Conexión a la base de datos establecida.");

    const db = client.db("CarrosAtlas"); // Asegúrate de que el nombre de la DB sea correcto.
    const collection = db.collection("carDetails"); // Asegúrate de que el nombre de la colección sea correcto.

    const result = await collection.insertOne(carData);
    console.log(
      `✅ Documento insertado en carDetails con ID: ${result.insertedId}`
    );
  } catch (err) {
    console.error("❌ Error al insertar el documento en carDetails:", err);
  } finally {
    await client.close();
    console.log("Conexión a la base de datos cerrada.");
  }
}
const newCar = {
  CARID: 110,
  MPG: 22.5,
  CYLINDERS: 4,
  ENGINEDISPLACEMENT: 3,
  HORSEPOWER: 250,
  WEIGHT: 3500,
  ACCELERATION: 6.0,
  YEAR: 2024,
  FECHA_ACTUALIZACION: new Date(),
  CAR_NAME: {
    CARID: 110,
    DESCRIPTION: "Ford Mustang 2024",
    MODELID: 44,
    MODEL_DETAIL: {
      MAKERID: 999,
      MODEL: "Mustang",
      MODELID: 12,
      TOTALCARS: 50,
      VALORUNI: 38000.0,
    },
  },
};

// Llamamos a la función para insertar el auto.
addCarDetails(newCar);
// Llamamos la función con MODELID = 2
// getCarDetailsByModelId(2);
// canDeleteMaker(4);
// insertCarWithoutMakerId();
