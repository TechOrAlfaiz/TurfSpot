import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Turf from "../models/turf.model.js";
import OwnerRequest from "../models/ownerRequest.model.js";
import Owner from "../models/owner.model.js";

// Ensure DNS servers for SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config();

const JAIPUR_BACKFILL_COORDINATES = [
  { area: "Mansarovar", coords: [75.7684, 26.8533] },
  { area: "Vaishali Nagar", coords: [75.7431, 26.9069] },
  { area: "Malviya Nagar", coords: [75.8152, 26.8528] },
  { area: "Jagatpura", coords: [75.8458, 26.8228] },
  { area: "Raja Park", coords: [75.8315, 26.8924] },
  { area: "C-Scheme", coords: [75.7985, 26.9085] },
  { area: "Sodala", coords: [75.7725, 26.8962] },
  { area: "Durgapura", coords: [75.7892, 26.8491] },
];

const BACKFILL_IMAGES = [
  "/turfs/turf-cricket-1.jpg",
  "/turfs/turf-football-1.jpg",
  "/turfs/turf-indoor-1.jpg",
  "/turfs/turf-night-1.jpg",
  "/turfs/turf-1.jpg",
  "/turfs/turf-2.jpg",
  "/turfs/turf-3.jpg",
  "/turfs/turf-4.jpg",
];

async function runBackfill() {
  const connStr = process.env.MONGO_URI || "mongodb://localhost:27017/turfspot";
  await mongoose.connect(connStr, { dbName: "turfspot" });
  console.log("Connected to MongoDB Atlas for backfill migration.");

  const approvedRequests = await OwnerRequest.find({ status: "approved" });
  console.log(`Auditing ${approvedRequests.length} approved owner requests...`);

  let backfilledCount = 0;

  for (let i = 0; i < approvedRequests.length; i++) {
    const req = approvedRequests[i];

    // Check if turf already exists
    let existingTurf = null;
    if (req.turfId) {
      existingTurf = await Turf.findById(req.turfId);
    }

    if (existingTurf) {
      // Ensure existing turf is active
      if (!existingTurf.isActive) {
        existingTurf.isActive = true;
        await existingTurf.save();
        console.log(`Activated existing turf: ${existingTurf.name} (${existingTurf._id})`);
      }
      continue;
    }

    // Provision new Turf for this approved request
    const coordPreset = JAIPUR_BACKFILL_COORDINATES[i % JAIPUR_BACKFILL_COORDINATES.length];
    const imagePreset = BACKFILL_IMAGES[i % BACKFILL_IMAGES.length];
    const nextImagePreset = BACKFILL_IMAGES[(i + 1) % BACKFILL_IMAGES.length];

    let owner = await Owner.findOne({ email: req.email });
    let ownerId = owner ? owner._id : null;

    const turfName =
      req.turfName && req.turfName.trim()
        ? req.turfName.trim()
        : `${req.name}'s Premier Sports Arena`;

    const area = req.area || coordPreset.area;
    const coords =
      req.location?.coordinates && req.location.coordinates.length >= 2
        ? req.location.coordinates
        : coordPreset.coords;

    const primaryImage =
      req.images && req.images.length > 0 && req.images[0]
        ? req.images[0]
        : imagePreset;

    const allImages =
      req.images && req.images.length > 0
        ? req.images
        : [primaryImage, nextImagePreset];

    const newTurf = new Turf({
      name: turfName,
      description: `Premium approved sports turf situated in ${area}, Jaipur. Features certified synthetic grass, tournament-grade high-lux LED floodlights, and dedicated player dugouts.`,
      area,
      city: req.city || "Jaipur",
      address: req.address || `${area}, Jaipur, Rajasthan`,
      location: {
        type: "Point",
        coordinates: coords,
      },
      image: primaryImage,
      images: allImages,
      sportTypes:
        req.sportTypes && req.sportTypes.length > 0
          ? req.sportTypes
          : ["Cricket", "Football"],
      pitchType: "Synthetic Grass Pitch",
      capacity: "6v6 Box Cricket • 5v5 Football",
      amenities: [
        "Night Floodlights",
        "Dugout Seating",
        "Drinking Water",
        "Free Parking",
        "Cricket Equipment Available",
      ],
      pricePerHour: req.pricePerHour || 1000,
      rating: 4.8,
      reviewsCount: 12,
      openTime: "06:00",
      closeTime: "02:00",
      lateNightAvailable: true,
      slotDuration: 60,
      isActive: true,
      owner: ownerId,
    });

    await newTurf.save();

    req.turfId = newTurf._id;
    await req.save();

    backfilledCount++;
    console.log(
      `[Backfilled ${backfilledCount}] Created Turf "${newTurf.name}" (_id: ${newTurf._id}) for owner "${req.name}" (${req.email})`
    );
  }

  console.log(`\nMigration Complete: Successfully backfilled ${backfilledCount} turfs.`);
  await mongoose.disconnect();
}

runBackfill().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
