const { MongoClient } = require("mongodb");
require("dotenv").config();

class Database {
  constructor() {
    this.uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.dbName = process.env.DB_NAME || "Hotel";
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);

      console.log("✅ Conectado a MongoDB correctamente");
      console.log(`📊 Base de datos: ${this.dbName}`);

      return this.db;
    } catch (error) {
      console.error("❌ Error conectando a MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        console.log("🔌 Desconectado de MongoDB");
      }
    } catch (error) {
      console.error("❌ Error desconectando de MongoDB:", error);
      throw error;
    }
  }

  getCollection(collectionName) {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db.collection(collectionName);
  }
}

module.exports = new Database();
