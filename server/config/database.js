import mongoose from "mongoose";
import dns from "dns";
import Turf from "../models/turf.model.js";
import { MOCK_TURFS } from "../controllers/user/turf.controller.js";

// Ensure reliable SRV DNS resolution for MongoDB Atlas across environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  // Use default system DNS if custom servers cannot be set
}

let mongodInstance = null;

export default async function connectDB() {
  const rawConn = process.env.MONGO_URI || "mongodb://localhost:27017/turfspot";
  // Clean any accidental angle brackets around user credentials
  const connStr = rawConn.replace(/<([^>]+)>/g, "$1");
  const sanitized = connStr.replace(/\/\/.*@/, "//***:***@");
  let connected = false;

  // 1. Attempt connection to provided/local MongoDB daemon or Atlas cluster
  try {
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 15000,
      dbName: "turfspot",
    });
    console.log("Connected to MongoDB at", sanitized);
    connected = true;
    global.isMockDB = false;
  } catch (err) {
    console.warn("External MongoDB unreachable:", err.message, "Falling back to MongoMemoryServer...");
  }

  // 2. If external MongoDB is not running, launch embedded MongoMemoryServer
  if (!connected) {
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: "turfspot" },
      });
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log("Connected to MongoDB Memory Server");
      global.isMockDB = false;
      connected = true;
    } catch (memErr) {
      console.error("Failed to start embedded MongoMemoryServer:", memErr);
      global.isMockDB = true;
    }
  }

  // 3. Auto-seed the 10 Jaipur turfs if Turf collection is empty
  try {
    if (mongoose.connection.readyState === 1) {
      const turfCount = await Turf.countDocuments();
      if (turfCount === 0) {
        console.log("Seeding initial Jaipur turfs into MongoDB...");
        await Turf.insertMany(MOCK_TURFS);
        console.log(`Successfully seeded ${MOCK_TURFS.length} turfs into MongoDB.`);
      }
    }
  } catch (seedErr) {
    console.warn("Turf seeding notice:", seedErr.message);
  }

  return connected;
}

