// MongoDB Change Stream - Monitor ALL events in real-time using Node.js
const { MongoClient } = require("mongodb");

// MongoDB connection configuration
const USER = "juanyaca2006_db_user";
const PASS = "juanmanuel07";
const CLUSTER = "cluster0.563va5d.mongodb.net";
const DBNAME = "Hotel";
const APPNAME = "Cluster0";

// Construct MongoDB URI
const uri = `mongodb+srv://${USER}:${PASS}@${CLUSTER}/${DBNAME}?retryWrites=true&w=majority&appName=${APPNAME}`;

// Define the collection to watch
const collectionName = "resena";

// Define the aggregation pipeline -监控所有事件
const pipeline = [
  {
    $match: {
      operationType: { $in: ["insert", "update", "delete"] },
    },
  },
];

async function monitorChangeStream() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DBNAME);
    const collection = db.collection(collectionName);

    // Create the change stream
    const changeStream = collection.watch(pipeline);

    console.log(
      `✅ Monitoring ALL change events on '${DBNAME}.${collectionName}' collection...`
    );
    console.log("Press Ctrl+C to stop monitoring\n");

    // Listen to change events
    changeStream.on("change", (change) => {
      console.log("─────────────────────────────────────────");
      console.log(`⚡ Event Type: ${change.operationType}`);
      console.log(`📅 Timestamp: ${new Date().toISOString()}`);
      console.log(`🆔 Document ID: ${change.documentKey._id}`);

      if (change.operationType === "insert") {
        console.log("📄 New Document:");
        console.log(JSON.stringify(change.fullDocument, null, 2));
      } else if (change.operationType === "update") {
        console.log("🔄 Updated Fields:");
        console.log(
          JSON.stringify(change.updateDescription.updatedFields, null, 2)
        );
        if (
          change.updateDescription.removedFields &&
          change.updateDescription.removedFields.length > 0
        ) {
          console.log(
            `🗑️  Removed Fields: ${change.updateDescription.removedFields.join(
              ", "
            )}`
          );
        }
        if (change.fullDocument) {
          console.log("📄 Full Document After Update:");
          console.log(JSON.stringify(change.fullDocument, null, 2));
        }
      } else if (change.operationType === "delete") {
        console.log(`🗑️  Deleted Document ID: ${change.documentKey._id}`);
      }

      console.log("─────────────────────────────────────────\n");
    });

    changeStream.on("error", (error) => {
      console.error(`❌ Error: ${error.message}`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n👋 Closing change stream...");
      await changeStream.close();
      await client.close();
      console.log("✅ Change stream monitoring stopped.");
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    await client.close();
    process.exit(1);
  }
}

// Start monitoring
monitorChangeStream().catch(console.error);
