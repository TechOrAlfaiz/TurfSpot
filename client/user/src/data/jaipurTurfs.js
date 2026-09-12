/**
 * JAIPUR TURF CATALOG (Sample / Showcase Data)
 * Covers popular neighborhoods across Jaipur, Rajasthan:
 * Vaishali Nagar, Mansarovar, Malviya Nagar, Jagatpura, Raja Park,
 * C-Scheme, Pratap Nagar, Tonk Road, Sodala, Durgapura.
 * 
 * Includes Football ⚽, Cricket 🏏, and Multi-sport turfs
 * with late-night slot capabilities, pitch types, and playing capacities.
 */

export const JAIPUR_TURFS = [
  {
    _id: "jpr-turf-001",
    name: "Pink City Box Arena",
    area: "Mansarovar",
    location: "Mansarovar, Jaipur",
    address: "Plot 42, Near Technology Park, Mansarovar, Jaipur, Rajasthan 302020",
    coordinates: [75.7684, 26.8533],
    sportTypes: ["Cricket", "Football"],
    primarySport: "Cricket",
    pitchType: "AstroTurf Box Cricket Pitch & Futsal",
    capacity: "6v6 Box Cricket • 5v5 Football",
    pricePerHour: 900,
    rating: 4.9,
    reviewsCount: 128,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    lateNightSlots: ["10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM"],
    availableSlots: 6,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80",
    cricketImage: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "500 Lux Floodlights",
      "Cricket Bowling Machine",
      "Dugout Seating",
      "Locker Rooms",
      "Free Parking",
      "Live Scoreboard"
    ],
    description: "Jaipur's top-rated box cricket and mini-football turf in Mansarovar. Features tournament-grade synthetic grass, precision floodlights, and a pro bowling machine for nighttime cricket leagues."
  },
  {
    _id: "jpr-turf-002",
    name: "Vaishali Super Turf Club",
    area: "Vaishali Nagar",
    location: "Vaishali Nagar, Jaipur",
    address: "Block B, Queens Road, Vaishali Nagar, Jaipur, Rajasthan 302021",
    coordinates: [75.7431, 26.9069],
    sportTypes: ["Football", "Cricket"],
    primarySport: "Football",
    pitchType: "FIFA Grade 50mm Monofilament Grass",
    capacity: "7v7 Football • 8v8 Cricket",
    pricePerHour: 1200,
    rating: 4.8,
    reviewsCount: 96,
    openTime: "05:30",
    closeTime: "01:00",
    lateNightAvailable: true,
    lateNightSlots: ["09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM"],
    availableSlots: 4,
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "FIFA Standard Turf",
      "High-Lux Night Floodlights",
      "Equipment Rental",
      "Shower & Changing Rooms",
      "Sports Cafe",
      "First Aid on Site"
    ],
    description: "Premier football ground with high-shock absorption turf in the heart of Vaishali Nagar. Ideal for competitive 7-a-side matches and weekend football leagues."
  },
  {
    _id: "jpr-turf-003",
    name: "Apex High-Lux Cricket Arena",
    area: "Malviya Nagar",
    location: "Malviya Nagar, Jaipur",
    address: "Near World Trade Park, Malviya Nagar, Jaipur, Rajasthan 302017",
    coordinates: [75.8152, 26.8528],
    sportTypes: ["Cricket"],
    primarySport: "Cricket",
    pitchType: "Dual Spin & Pace Matting Pitch",
    capacity: "6v6 Box Cricket • Practice Nets",
    pricePerHour: 800,
    rating: 4.9,
    reviewsCount: 142,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    lateNightSlots: ["09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM"],
    availableSlots: 7,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    cricketImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Cricket Bowling Machine (130 km/h)",
      "Boundary Net Enclosure",
      "Night Floodlights",
      "Drinking Water & Beverages",
      "Bespoke Cricket Bats & Balls",
      "Coaching Support"
    ],
    description: "Dedicated night cricket arena located steps from WTP. Built specifically for late-night box cricket tournaments with boundary safety netting and instant video replay cameras."
  },
  {
    _id: "jpr-turf-004",
    name: "Jagatpura Strikers Turf",
    area: "Jagatpura",
    location: "Jagatpura, Jaipur",
    address: "Near Bombay Hospital, Mahal Road, Jagatpura, Jaipur, Rajasthan 302017",
    coordinates: [75.8458, 26.8228],
    sportTypes: ["Football", "Cricket"],
    primarySport: "Football",
    pitchType: "Non-infill Synthetic Pitch",
    capacity: "5v5 & 7v7 Football",
    pricePerHour: 1000,
    rating: 4.7,
    reviewsCount: 84,
    openTime: "06:00",
    closeTime: "01:00",
    lateNightAvailable: true,
    lateNightSlots: ["10:00 PM", "11:00 PM", "12:00 AM"],
    availableSlots: 5,
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Floodlights (Zero Shadow)",
      "Covered Dugout",
      "Spacious Parking",
      "Live Streaming Cam",
      "Washroom & Showers"
    ],
    description: "State-of-the-art football turf situated along Mahal Road, Jagatpura. Designed for explosive fast-paced 5v5 futsal and weekend inter-college tournaments."
  },
  {
    _id: "jpr-turf-005",
    name: "Raja Park Turf Park",
    area: "Raja Park",
    location: "Raja Park, Jaipur",
    address: "Lane 4, Near LBS College, Raja Park, Jaipur, Rajasthan 302004",
    coordinates: [75.8315, 26.8924],
    sportTypes: ["Cricket", "Football"],
    primarySport: "Cricket",
    pitchType: "Multi-Sport Synthetic Turf",
    capacity: "6v6 Box Cricket • 5v5 Football",
    pricePerHour: 850,
    rating: 4.8,
    reviewsCount: 110,
    openTime: "06:00",
    closeTime: "23:30",
    lateNightAvailable: false,
    lateNightSlots: ["09:00 PM", "10:00 PM"],
    availableSlots: 3,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "LED Arena Lighting",
      "High Safety Perimeter Nets",
      "Cricket Equipment Included",
      "Waiting Lounge",
      "Clean Drinking Water"
    ],
    description: "Vibrant community turf right in central Raja Park. Ideal for casual evening cricket matches and friendly weekend football knockouts."
  },
  {
    _id: "jpr-turf-006",
    name: "C-Scheme Central Arena",
    area: "C-Scheme",
    location: "C-Scheme, Jaipur",
    address: "Subhash Marg, C-Scheme, Jaipur, Rajasthan 302001",
    coordinates: [75.7985, 26.9085],
    sportTypes: ["Football", "Cricket"],
    primarySport: "Football",
    pitchType: "Premium Hybrid Turf",
    capacity: "5v5 Football • 6v6 Cricket",
    pricePerHour: 1400,
    rating: 4.9,
    reviewsCount: 156,
    openTime: "05:00",
    closeTime: "01:30",
    lateNightAvailable: true,
    lateNightSlots: ["10:00 PM", "11:00 PM", "12:00 AM"],
    availableSlots: 4,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Executive Player Lounge",
      "FIFA Grade Grass",
      "Pro Night Floodlights",
      "Valet Parking",
      "Cold Pressed Juice Bar",
      "Match Referee on Request"
    ],
    description: "Jaipur's flagship boutique sports turf in upscale C-Scheme. Premium artificial turf with high-traction footwear support and executive facilities."
  },
  {
    _id: "jpr-turf-007",
    name: "Pratap Stadium Box Turf",
    area: "Pratap Nagar",
    location: "Pratap Nagar, Jaipur",
    address: "Sector 11, Kumbha Marg, Pratap Nagar, Jaipur, Rajasthan 302033",
    coordinates: [75.8192, 26.7981],
    sportTypes: ["Cricket", "Football"],
    primarySport: "Cricket",
    pitchType: "AstroTurf Pitch with Bowling Runup",
    capacity: "8v8 Cricket • 6v6 Football",
    pricePerHour: 750,
    rating: 4.7,
    reviewsCount: 72,
    openTime: "06:00",
    closeTime: "02:00",
    lateNightAvailable: true,
    lateNightSlots: ["09:00 PM", "10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM"],
    availableSlots: 8,
    image: "https://images.unsplash.com/photo-1562077772-3ab1218688c0?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Night Floodlights",
      "Leather & Tennis Cricket Balls",
      "Spacious Pavilion",
      "Ample Two-Wheeler & Car Parking",
      "Refreshment Kiosk"
    ],
    description: "South Jaipur's favorite late-night cricket box arena. Large playing dimensions with high roof netting, perfect for long-hitting cricket enthusiasts."
  },
  {
    _id: "jpr-turf-008",
    name: "Highway Floodlight Arena",
    area: "Tonk Road",
    location: "Tonk Road, Jaipur",
    address: "Opposite Chokhi Dhani, Tonk Road, Jaipur, Rajasthan 302022",
    coordinates: [75.8362, 26.7621],
    sportTypes: ["Football", "Cricket"],
    primarySport: "Football",
    pitchType: "Full 7v7 Football Field / Dual Box",
    capacity: "7v7 Football • 10v10 Cricket",
    pricePerHour: 1100,
    rating: 4.8,
    reviewsCount: 115,
    openTime: "00:00",
    closeTime: "23:59",
    lateNightAvailable: true,
    lateNightSlots: ["10:00 PM", "11:00 PM", "12:00 AM", "01:00 AM", "02:00 AM"],
    availableSlots: 9,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Open 24/7",
      "High-Lux Stadium Floodlights",
      "Full 7-a-side Goalposts",
      "Changing Rooms with Showers",
      "Late Night Food Stalls"
    ],
    description: "Open 24 hours a day on Tonk Road. Known across Jaipur as the go-to destination for midnight and 2 AM corporate matches and friendly weekend rivalries."
  },
  {
    _id: "jpr-turf-009",
    name: "Sodala Knights Sports Hub",
    area: "Sodala",
    location: "Sodala, Jaipur",
    address: "Near Metro Pillar 84, New Sanganer Road, Sodala, Jaipur, Rajasthan 302019",
    coordinates: [75.7725, 26.8962],
    sportTypes: ["Cricket"],
    primarySport: "Cricket",
    pitchType: "Compact AstroTurf Box Pitch",
    capacity: "5v5 to 6v6 Box Cricket",
    pricePerHour: 700,
    rating: 4.6,
    reviewsCount: 64,
    openTime: "06:00",
    closeTime: "00:30",
    lateNightAvailable: true,
    lateNightSlots: ["09:00 PM", "10:00 PM", "11:00 PM"],
    availableSlots: 4,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Metro Station Accessibility",
      "Surround Safety Nets",
      "Night Floodlights",
      "Cricket Gear Provided",
      "Sound System for Commentary"
    ],
    description: "Conveniently located near the Sodala Metro corridor. Ideal for quick after-work cricket matches and fast-paced box tournaments."
  },
  {
    _id: "jpr-turf-010",
    name: "Durgapura Night Pitch",
    area: "Durgapura",
    location: "Durgapura, Jaipur",
    address: "Near Durgapura Railway Station, Tonk Phatak, Jaipur, Rajasthan 302018",
    coordinates: [75.7892, 26.8491],
    sportTypes: ["Football", "Cricket"],
    primarySport: "Football",
    pitchType: "All-Weather Monofilament Turf",
    capacity: "6v6 Football • 6v6 Cricket",
    pricePerHour: 950,
    rating: 4.8,
    reviewsCount: 92,
    openTime: "06:00",
    closeTime: "01:30",
    lateNightAvailable: true,
    lateNightSlots: ["10:00 PM", "11:00 PM", "12:00 AM"],
    availableSlots: 5,
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80",
    amenities: [
      "Shadowless LED Lights",
      "Dugout with Coolers",
      "Digital Scoreboard",
      "Parking Facility",
      "Refreshments Bar"
    ],
    description: "Vibrant multi-sport ground in Durgapura offering crystal-clear floodlighting, soft-traction artificial turf, and flexible nighttime bookings."
  }
];

export const JAIPUR_AREAS = [
  "All Areas",
  "Mansarovar",
  "Vaishali Nagar",
  "Malviya Nagar",
  "Jagatpura",
  "Raja Park",
  "C-Scheme",
  "Pratap Nagar",
  "Tonk Road",
  "Sodala",
  "Durgapura",
];

// Jaipur Locality Coordinate Center-Points [longitude, latitude]
export const JAIPUR_LOCALITY_COORDINATES = {
  Mansarovar: [75.7684, 26.8533],
  "Vaishali Nagar": [75.7431, 26.9069],
  "Malviya Nagar": [75.8152, 26.8528],
  Jagatpura: [75.8458, 26.8228],
  "Raja Park": [75.8315, 26.8924],
  "C-Scheme": [75.7985, 26.9085],
  "Pratap Nagar": [75.8192, 26.7981],
  "Tonk Road": [75.8362, 26.7621],
  Sodala: [75.7725, 26.8962],
  Durgapura: [75.7892, 26.8491],
  Jaipur: [75.7873, 26.9124],
};

// Client-side Haversine Distance Calculator
export const calculateClientHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
};

export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
};

