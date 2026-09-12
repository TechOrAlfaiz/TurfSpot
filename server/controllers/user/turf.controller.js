import chalk from "chalk";
import Turf from "../../models/turf.model.js";
import TimeSlot from "../../models/timeSlot.model.js";
import Booking from "../../models/booking.model.js";
import { calculateHaversineDistance } from "../../utils/haversine.js";
import { format, parseISO, startOfDay } from "date-fns";

export const MOCK_TURFS = [
  {
    _id: "jpr-turf-001",
    name: "Pink City Box Arena",
    area: "Mansarovar",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.7684, 26.8533],
    },
    address: "Plot 42, Near Technology Park, Mansarovar, Jaipur, Rajasthan 302020",
    sportTypes: ["Cricket", "Football"],
    pitchType: "AstroTurf Box Cricket Pitch & Futsal",
    capacity: "6v6 Box Cricket • 5v5 Football",
    pricePerHour: 900,
    rating: 4.9,
    reviewsCount: 128,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "500 Lux Floodlights",
      "Cricket Bowling Machine",
      "Dugout Seating",
      "Locker Rooms",
      "Free Parking",
      "Live Scoreboard",
    ],
    description:
      "Jaipur's top-rated box cricket and mini-football turf in Mansarovar. Features tournament-grade synthetic grass, precision floodlights, and pro bowling machine.",
  },
  {
    _id: "jpr-turf-002",
    name: "Vaishali Super Turf Club",
    area: "Vaishali Nagar",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.7431, 26.9069],
    },
    address: "Block B, Queens Road, Vaishali Nagar, Jaipur, Rajasthan 302021",
    sportTypes: ["Football", "Cricket"],
    pitchType: "FIFA Grade 50mm Monofilament Grass",
    capacity: "7v7 Football • 8v8 Cricket",
    pricePerHour: 1200,
    rating: 4.8,
    reviewsCount: 96,
    openTime: "05:30",
    closeTime: "01:00",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "FIFA Standard Turf",
      "High-Lux Night Floodlights",
      "Equipment Rental",
      "Shower & Changing Rooms",
      "Sports Cafe",
    ],
    description:
      "Premier football ground with high-shock absorption turf in the heart of Vaishali Nagar. Ideal for competitive 7-a-side matches and weekend football leagues.",
  },
  {
    _id: "jpr-turf-003",
    name: "Apex High-Lux Cricket Arena",
    area: "Malviya Nagar",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.8152, 26.8528],
    },
    address: "Near World Trade Park, Malviya Nagar, Jaipur, Rajasthan 302017",
    sportTypes: ["Cricket"],
    pitchType: "Dual Spin & Pace Matting Pitch",
    capacity: "6v6 Box Cricket • Practice Nets",
    pricePerHour: 800,
    rating: 4.9,
    reviewsCount: 142,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Cricket Bowling Machine (130 km/h)",
      "Boundary Net Enclosure",
      "Night Floodlights",
      "Drinking Water & Beverages",
      "Bespoke Cricket Bats & Balls",
    ],
    description:
      "Dedicated night cricket arena located steps from WTP. Built specifically for late-night box cricket tournaments with boundary safety netting.",
  },
  {
    _id: "jpr-turf-004",
    name: "Jagatpura Strikers Turf",
    area: "Jagatpura",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.8458, 26.8228],
    },
    address: "Near Bombay Hospital, Mahal Road, Jagatpura, Jaipur, Rajasthan 302017",
    sportTypes: ["Football", "Cricket"],
    pitchType: "Non-infill Synthetic Pitch",
    capacity: "5v5 & 7v7 Football",
    pricePerHour: 1000,
    rating: 4.7,
    reviewsCount: 84,
    openTime: "06:00",
    closeTime: "01:00",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Floodlights (Zero Shadow)",
      "Covered Dugout",
      "Spacious Parking",
      "Live Streaming Cam",
      "Washroom & Showers",
    ],
    description:
      "State-of-the-art football turf situated along Mahal Road, Jagatpura. Designed for explosive fast-paced 5v5 futsal and weekend inter-college tournaments.",
  },
  {
    _id: "jpr-turf-005",
    name: "Raja Park Turf Park",
    area: "Raja Park",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.8315, 26.8924],
    },
    address: "Lane 4, Near LBS College, Raja Park, Jaipur, Rajasthan 302004",
    sportTypes: ["Cricket", "Football"],
    pitchType: "Multi-Sport Synthetic Turf",
    capacity: "6v6 Box Cricket • 5v5 Football",
    pricePerHour: 850,
    rating: 4.8,
    reviewsCount: 110,
    openTime: "06:00",
    closeTime: "23:30",
    lateNightAvailable: false,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "LED Arena Lighting",
      "High Safety Perimeter Nets",
      "Cricket Equipment Included",
      "Waiting Lounge",
      "Clean Drinking Water",
    ],
    description:
      "Vibrant community turf right in central Raja Park. Ideal for casual evening cricket matches and friendly weekend football knockouts.",
  },
  {
    _id: "jpr-turf-006",
    name: "C-Scheme Central Arena",
    area: "C-Scheme",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.7985, 26.9085],
    },
    address: "Subhash Marg, C-Scheme, Jaipur, Rajasthan 302001",
    sportTypes: ["Football", "Cricket"],
    pitchType: "Premium Hybrid Turf",
    capacity: "5v5 Football • 6v6 Cricket",
    pricePerHour: 1400,
    rating: 4.9,
    reviewsCount: 156,
    openTime: "05:00",
    closeTime: "01:30",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Executive Player Lounge",
      "FIFA Grade Grass",
      "Pro Night Floodlights",
      "Valet Parking",
      "Cold Pressed Juice Bar",
    ],
    description:
      "Jaipur's flagship boutique sports turf in upscale C-Scheme. Premium artificial turf with high-traction footwear support and executive facilities.",
  },
  {
    _id: "jpr-turf-007",
    name: "Pratap Stadium Box Turf",
    area: "Pratap Nagar",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.8192, 26.7981],
    },
    address: "Sector 11, Kumbha Marg, Pratap Nagar, Jaipur, Rajasthan 302033",
    sportTypes: ["Cricket", "Football"],
    pitchType: "AstroTurf Pitch with Bowling Runup",
    capacity: "8v8 Cricket • 6v6 Football",
    pricePerHour: 750,
    rating: 4.7,
    reviewsCount: 72,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1562077772-3ab1218688c0?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Night Floodlights",
      "Leather & Tennis Cricket Balls",
      "Spacious Pavilion",
      "Ample Two-Wheeler & Car Parking",
    ],
    description:
      "South Jaipur's favorite late-night cricket box arena. Large playing dimensions with high roof netting, perfect for long-hitting cricket enthusiasts.",
  },
  {
    _id: "jpr-turf-008",
    name: "Highway Floodlight Arena",
    area: "Tonk Road",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.8362, 26.7621],
    },
    address: "Opposite Chokhi Dhani, Tonk Road, Jaipur, Rajasthan 302022",
    sportTypes: ["Football", "Cricket"],
    pitchType: "Full 7v7 Football Field / Dual Box",
    capacity: "7v7 Football • 10v10 Cricket",
    pricePerHour: 1100,
    rating: 4.8,
    reviewsCount: 115,
    openTime: "00:00",
    closeTime: "23:59",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Open 24/7",
      "High-Lux Stadium Floodlights",
      "Full 7-a-side Goalposts",
      "Changing Rooms with Showers",
      "Late Night Food Stalls",
    ],
    description:
      "Open 24 hours a day on Tonk Road. Known across Jaipur as the go-to destination for midnight and 2 AM corporate matches and friendly weekend rivalries.",
  },
  {
    _id: "jpr-turf-009",
    name: "Sodala Knights Sports Hub",
    area: "Sodala",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.7725, 26.8962],
    },
    address: "Near Metro Pillar 84, New Sanganer Road, Sodala, Jaipur, Rajasthan 302019",
    sportTypes: ["Cricket"],
    pitchType: "Compact AstroTurf Box Pitch",
    capacity: "5v5 to 6v6 Box Cricket",
    pricePerHour: 700,
    rating: 4.6,
    reviewsCount: 64,
    openTime: "06:00",
    closeTime: "00:30",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Metro Station Accessibility",
      "Surround Safety Nets",
      "Night Floodlights",
      "Cricket Gear Provided",
    ],
    description:
      "Conveniently located near the Sodala Metro corridor. Ideal for quick after-work cricket matches and fast-paced box tournaments.",
  },
  {
    _id: "jpr-turf-010",
    name: "Durgapura Night Pitch",
    area: "Durgapura",
    city: "Jaipur",
    location: {
      type: "Point",
      coordinates: [75.7892, 26.8491],
    },
    address: "Near Durgapura Railway Station, Tonk Phatak, Jaipur, Rajasthan 302018",
    sportTypes: ["Football", "Cricket"],
    pitchType: "All-Weather Monofilament Turf",
    capacity: "6v6 Football • 6v6 Cricket",
    pricePerHour: 950,
    rating: 4.8,
    reviewsCount: 92,
    openTime: "06:00",
    closeTime: "01:30",
    lateNightAvailable: true,
    slotDuration: 60,
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Shadowless LED Lights",
      "Dugout with Coolers",
      "Digital Scoreboard",
      "Parking Facility",
      "Refreshments Bar",
    ],
    description:
      "Vibrant multi-sport ground in Durgapura offering crystal-clear floodlighting, soft-traction artificial turf, and flexible nighttime bookings.",
  },
];

// Helper: Format distance string nicely (e.g., "650 m", "1.8 km")
export const formatDistanceString = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

// GET /api/user/turf/all - get all active turfs
export const getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({ isActive: { $ne: false } }).sort({ rating: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: turfs.length, turfs });
  } catch (err) {
    console.error(chalk.red("Error in getAllTurfs:"), err);
    return res.status(500).json({ success: false, message: "Failed to fetch turfs", error: err.message });
  }
};

// GET /api/user/turf/:id - get single turf by id with distance calculation if coordinates provided
export const getTurfById = async (req, res) => {
  const { id } = req.params;
  const userLat = parseFloat(req.query.lat ?? req.query.userLat);
  const userLng = parseFloat(req.query.lng ?? req.query.userLng);

  try {
    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    const turfObj = turf.toObject();

    if (!isNaN(userLat) && !isNaN(userLng) && turfObj.location?.coordinates?.length >= 2) {
      const [turfLng, turfLat] = turfObj.location.coordinates;
      const distanceKm = calculateHaversineDistance(userLat, userLng, turfLat, turfLng);
      turfObj.distanceKm = distanceKm;
      turfObj.distanceString = formatDistanceString(distanceKm);
    }

    return res.status(200).json({ success: true, turf: turfObj });
  } catch (error) {
    console.error(chalk.red("Error in getTurfById:"), error);
    return res.status(500).json({ success: false, message: "Failed to fetch turf details", error: error.message });
  }
};

// GET /api/user/turf/nearby?lat=...&lng=...&radius=10&sport=...&lateNight=...&sortBy=...
export const getNearbyTurfs = async (req, res) => {
  const rawLat = req.query.lat ?? req.query.userLat;
  const rawLng = req.query.lng ?? req.query.userLng;
  const userLat = parseFloat(rawLat);
  const userLng = parseFloat(rawLng);
  const radius = parseFloat(req.query.radius ?? 10); // in km (or 0 for unlimited)
  const sport = req.query.sport; // 'Football' | 'Cricket' | 'all'
  const lateNight = req.query.lateNight === "true" || req.query.lateNight === true;
  const availableNow = req.query.availableNow === "true" || req.query.availableNow === true;
  const sortBy = req.query.sortBy || "distance"; // 'distance' | 'rating' | 'price-asc' | 'price-desc'
  const search = req.query.search ? req.query.search.toLowerCase() : "";

  // Validate coordinates
  const hasValidCoords =
    !isNaN(userLat) &&
    !isNaN(userLng) &&
    userLat >= -90 &&
    userLat <= 90 &&
    userLng >= -180 &&
    userLng <= 180;

  try {
    let query = { isActive: { $ne: false } };

    if (sport && sport !== "all") {
      query.sportTypes = { $regex: new RegExp(sport, "i") };
    }

    if (lateNight) {
      query.lateNightAvailable = true;
    }

    // Leverage MongoDB native 2dsphere $near index query when coordinates are provided
    if (hasValidCoords && radius > 0) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLng, userLat],
          },
          $maxDistance: radius * 1000, // in meters
        },
      };
    }

    let allTurfs = [];
    try {
      allTurfs = await Turf.find(query);
    } catch (queryErr) {
      // Fallback without $near if 2dsphere index is warming up or outside bounds
      delete query.location;
      allTurfs = await Turf.find(query);
    }

    const currentHour = new Date().getHours();

    let processedTurfs = allTurfs.map((t) => {
      const turf = t.toObject();

      // Calculate server-side distance
      if (hasValidCoords && turf.location?.coordinates?.length >= 2) {
        const [turfLng, turfLat] = turf.location.coordinates;
        const dist = calculateHaversineDistance(userLat, userLng, turfLat, turfLng);
        turf.distanceKm = dist;
        turf.distanceString = formatDistanceString(dist);
      } else {
        turf.distanceKm = null;
        turf.distanceString = null;
      }

      return turf;
    });

    // Filter by radius if user coordinates are valid and radius > 0
    if (hasValidCoords && radius > 0) {
      processedTurfs = processedTurfs.filter(
        (turf) => turf.distanceKm === null || turf.distanceKm <= radius
      );
    }

    // Filter by Search Query
    if (search) {
      processedTurfs = processedTurfs.filter((turf) => {
        const nameMatch = turf.name?.toLowerCase().includes(search);
        const areaMatch = turf.area?.toLowerCase().includes(search);
        const addrMatch = turf.address?.toLowerCase().includes(search);
        const sportMatch = Array.isArray(turf.sportTypes) && turf.sportTypes.some((s) => s.toLowerCase().includes(search));
        return nameMatch || areaMatch || addrMatch || sportMatch;
      });
    }

    // Filter by "Available Now" (turf is open now)
    if (availableNow) {
      processedTurfs = processedTurfs.filter((turf) => {
        const openH = parseInt(turf.openTime?.split(":")[0] || "6", 10);
        const closeH = parseInt(turf.closeTime?.split(":")[0] || "23", 10);
        if (closeH < openH) {
          // Crosses midnight (e.g. 06:00 to 02:00)
          return currentHour >= openH || currentHour < closeH;
        }
        return currentHour >= openH && currentHour < closeH;
      });
    }

    // Sort results
    if (sortBy === "distance") {
      processedTurfs.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === "rating") {
      processedTurfs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "price-asc") {
      processedTurfs.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortBy === "price-desc") {
      processedTurfs.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    }

    return res.status(200).json({
      success: true,
      count: processedTurfs.length,
      radiusKm: radius,
      turfs: processedTurfs,
    });
  } catch (error) {
    console.error(chalk.red("Error in getNearbyTurfs:"), error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/turf/:id/distance?lat=<userLat>&lng=<userLng>
export const getTurfDistance = async (req, res) => {
  const id = req.params.id || req.query.id;
  const userLat = parseFloat(req.query.lat ?? req.query.userLat);
  const userLng = parseFloat(req.query.lng ?? req.query.userLng);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid lat and lng query parameters are required" });
  }

  try {
    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    if (!turf.location || !turf.location.coordinates || turf.location.coordinates.length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Turf location coordinates are missing" });
    }

    const [turfLng, turfLat] = turf.location.coordinates;
    const distanceKm = calculateHaversineDistance(userLat, userLng, turfLat, turfLng);

    return res.status(200).json({
      success: true,
      distanceKm,
      distanceString: formatDistanceString(distanceKm),
    });
  } catch (error) {
    console.error(chalk.red("Error in getTurfDistance:"), error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/turf/:id/slots?date=YYYY-MM-DD (also supports /slots?turfId=...)
export const getTurfSlots = async (req, res) => {
  const id = req.params.id || req.params.turfId || req.query.turfId || req.query.id;
  const { date } = req.query;

  if (!id || id === "undefined") {
    return res.status(400).json({ success: false, message: "Valid turf ID is required" });
  }

  if (!date) {
    return res
      .status(400)
      .json({ success: false, message: "Date query parameter is required (YYYY-MM-DD)" });
  }

  try {
    let turf = await Turf.findById(id);
    if (!turf) {
      turf = defaultTurfs.find((t) => t._id === id);
    }
    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    const targetDate = new Date(date);
    const startOfSelectedDate = startOfDay(targetDate);
    const endOfSelectedDate = new Date(startOfSelectedDate);
    endOfSelectedDate.setDate(endOfSelectedDate.getDate() + 1);

    // Expired holds cleanup
    const now = new Date();
    await TimeSlot.deleteMany({
      status: "HELD",
      holdExpiresAt: { $lt: now },
    });

    // Find active time slots for this turf and date
    const bookedTimeSlots = await TimeSlot.find({
      turf: String(turf._id || id),
      startTime: { $gte: startOfSelectedDate, $lt: endOfSelectedDate },
      $or: [
        { status: "BOOKED" },
        { status: "HELD", holdExpiresAt: { $gt: now } },
        { status: { $exists: false } },
      ],
    });

    let startHour = 6;
    let closeHour = 23;

    if (turf.openTime) {
      const parsedOpen = parseInt(turf.openTime.split(":")[0], 10);
      if (!isNaN(parsedOpen)) startHour = parsedOpen;
    }
    if (turf.closeTime) {
      const parsedClose = parseInt(turf.closeTime.split(":")[0], 10);
      if (!isNaN(parsedClose)) closeHour = parsedClose;
    }

    // If closeHour <= startHour, it extends past midnight (e.g. 06:00 to 02:00 -> 26)
    const effectiveCloseHour = closeHour <= startHour ? closeHour + 24 : closeHour;

    const isToday = format(new Date(), "yyyy-MM-dd") === date;
    const nowHour = new Date().getHours();

    const slots = [];
    for (let h = startHour; h < effectiveCloseHour; h++) {
      const actualStartH = h % 24;
      const actualEndH = (h + 1) % 24;

      const startStr = `${actualStartH.toString().padStart(2, "0")}:00`;
      const endStr = `${actualEndH.toString().padStart(2, "0")}:00`;

      const slotStart = new Date(targetDate);
      slotStart.setHours(actualStartH, 0, 0, 0);

      const slotEnd = new Date(targetDate);
      slotEnd.setHours(actualEndH, 0, 0, 0);

      // Check if slot has already passed today
      const isPast = isToday && h < nowHour;

      // Check if manually blocked/maintenance
      const isBlocked = turf.blockedSlots?.some(
        (b) => b.date === date && b.startTime === startStr
      );

      // Check if booked or held in DB
      const isDbBooked = bookedTimeSlots.some((booked) => {
        const bStart = new Date(booked.startTime);
        const bEnd = new Date(booked.endTime);
        return slotStart < bEnd && slotEnd > bStart && (booked.status === "BOOKED" || !booked.status);
      });

      const isDbHeld = bookedTimeSlots.some((booked) => {
        const bStart = new Date(booked.startTime);
        const bEnd = new Date(booked.endTime);
        return (
          slotStart < bEnd &&
          slotEnd > bStart &&
          booked.status === "HELD" &&
          booked.holdExpiresAt > now
        );
      });

      const isOccupied = isDbBooked || isDbHeld;

      slots.push({
        startTime: startStr,
        endTime: endStr,
        booked: isOccupied,
        isBooked: isOccupied,
        isHeld: isDbHeld,
        isPast: isPast,
        isBlocked: !!isBlocked,
        status: isBlocked
          ? "MAINTENANCE"
          : isPast
          ? "PAST"
          : isDbBooked
          ? "BOOKED"
          : isDbHeld
          ? "HELD"
          : "AVAILABLE",
      });
    }

    return res.status(200).json(slots);
  } catch (error) {
    console.error(chalk.red("Error in getTurfSlots:"), error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/user/turf/timeSlot?date=...&turfId=... or /api/user/turf/:id/timeslots
export const getTimeSlotByTurfId = async (req, res) => {
  const targetTurfId = req.params.id || req.params.turfId || req.query.turfId || req.query.id;
  const { date } = req.query;

  if (!targetTurfId || targetTurfId === "undefined") {
    return res.status(400).json({ success: false, message: "Valid turf ID is required" });
  }

  const selectedDate = new Date(date || Date.now());
  const startOfSelectedDate = startOfDay(selectedDate);
  const endOfSelectedDate = new Date(startOfSelectedDate);
  endOfSelectedDate.setDate(endOfSelectedDate.getDate() + 1);

  try {
    // Purge expired holds
    const now = new Date();
    await TimeSlot.deleteMany({
      status: "HELD",
      holdExpiresAt: { $lt: now },
    });

    const query = {
      turf: String(targetTurfId),
      startTime: { $gte: startOfSelectedDate },
      endTime: { $lt: endOfSelectedDate },
      $or: [
        { status: "BOOKED" },
        { status: "HELD", holdExpiresAt: { $gt: now } },
        { status: { $exists: false } },
      ],
    };

    const bookedTime = await TimeSlot.find(query);

    let turf = await Turf.findById(targetTurfId).select([
      "name",
      "openTime",
      "closeTime",
      "pricePerHour",
      "slotDuration",
      "blockedSlots",
    ]);

    if (!turf) {
      const fallback = defaultTurfs.find((t) => t._id === targetTurfId);
      if (fallback) {
        turf = {
          name: fallback.name,
          openTime: fallback.openTime,
          closeTime: fallback.closeTime,
          pricePerHour: fallback.pricePerHour,
          slotDuration: fallback.slotDuration || 60,
          blockedSlots: fallback.blockedSlots || [],
        };
      }
    }

    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    return res.status(200).json({ success: true, timeSlots: turf, bookedTime });
  } catch (error) {
    console.error(chalk.red("Error in getTimeSlotByTurfId:"), error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


