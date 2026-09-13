import Turf from "../../models/turf.model.js";
import Booking from "../../models/booking.model.js";

// 1. Get all turfs belonging to the authenticated owner
export const getOwnerTurfs = async (req, res) => {
  const ownerId = req.owner?.id;

  try {
    const turfs = await Turf.find({ owner: ownerId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      turfs,
      totalTurfs: turfs.length,
    });
  } catch (err) {
    console.error("Error in getOwnerTurfs:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Get all bookings for the authenticated owner's turfs
export const getOwnerBookings = async (req, res) => {
  const ownerId = req.owner?.id;

  try {
    // Find all turfs owned by this owner
    const ownedTurfs = await Turf.find({ owner: ownerId }).select("_id name");
    const turfMap = new Map();
    const turfIdList = [];

    ownedTurfs.forEach((t) => {
      const idStr = t._id.toString();
      turfMap.set(idStr, t.name);
      turfIdList.push(idStr);
      turfIdList.push(t._id);
    });

    if (turfIdList.length === 0) {
      return res.status(200).json({
        success: true,
        bookings: [],
        totalBookings: 0,
        stats: { confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 },
      });
    }

    // Find bookings linked to any of these turfs
    const rawBookings = await Booking.find({ turf: { $in: turfIdList } })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    let totalRevenue = 0;
    let confirmedCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    const formattedBookings = rawBookings.map((b) => {
      if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
        totalRevenue += b.totalPrice || 0;
      }
      if (b.status === "CONFIRMED") confirmedCount++;
      if (b.status === "COMPLETED") completedCount++;
      if (b.status === "CANCELLED") cancelledCount++;

      const turfName = turfMap.get(b.turf?.toString()) || b.turf || "Owned Turf";

      return {
        id: b._id,
        bookingReference: b.bookingReference,
        turfName,
        customerName: b.user?.name || "Guest Customer",
        customerEmail: b.user?.email || "customer@example.com",
        customerPhone: b.user?.phone || "N/A",
        sport: b.sport || "Cricket",
        bookingDate: b.bookingDate,
        slotTime: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : "Standard Slot",
        totalPrice: b.totalPrice,
        status: b.status,
        paymentStatus: b.payment?.status || (b.status === "CONFIRMED" ? "PAID" : "PENDING"),
        paymentId: b.payment?.paymentId || "N/A",
        createdAt: b.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      bookings: formattedBookings,
      totalBookings: formattedBookings.length,
      stats: {
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Error in getOwnerBookings:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Update Turf Operating Schedule & Slot Availability
export const updateTurfAvailability = async (req, res) => {
  const ownerId = req.owner?.id;
  const { id } = req.params;
  const { openTime, closeTime, isLateNight, pricePerHour } = req.body;

  try {
    const turf = await Turf.findOne({ _id: id, owner: ownerId });
    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found or you do not have permission to modify it",
      });
    }

    if (openTime) turf.openTime = openTime;
    if (closeTime) turf.closeTime = closeTime;
    if (isLateNight !== undefined) turf.isLateNight = Boolean(isLateNight);
    if (pricePerHour && Number(pricePerHour) > 0) turf.pricePerHour = Number(pricePerHour);

    await turf.save();

    return res.status(200).json({
      success: true,
      message: `Availability and timings for "${turf.name}" updated successfully.`,
      turf,
    });
  } catch (err) {
    console.error("Error in updateTurfAvailability:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
