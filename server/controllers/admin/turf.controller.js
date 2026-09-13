import Turf from "../../models/turf.model.js";
import Review from "../../models/review.model.js";

// 1. Get all turfs with owner details and rating for admin
export const getAllTurfs = async (req, res) => {
  const admin = req.admin?.role;
  if (admin !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access denied" });
  }
  try {
    const turfs = await Turf.find().populate("owner", "name email phone").lean();

    const turfsWithAvgRating = await Promise.all(
      turfs.map(async (turf) => {
        const reviews = await Review.find({ turf: turf._id });
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        return {
          ...turf,
          avgRating: Number(avgRating.toFixed(1)),
          isActive: turf.isActive !== false,
        };
      })
    );

    return res.status(200).json({
      success: true,
      turfs: turfsWithAvgRating,
      totalCount: turfsWithAvgRating.length,
    });
  } catch (error) {
    console.error("Error in getAllTurfs: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Toggle active/inactive status of any turf
export const toggleTurfActiveStatus = async (req, res) => {
  const admin = req.admin?.role;
  if (admin !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access denied" });
  }

  const { id } = req.params;
  try {
    const turf = await Turf.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, message: "Turf not found" });
    }

    turf.isActive = turf.isActive === false ? true : false;
    await turf.save();

    return res.status(200).json({
      success: true,
      message: `Turf "${turf.name}" is now ${turf.isActive ? "Active (Live)" : "Inactive (Hidden)"}`,
      turf,
    });
  } catch (error) {
    console.error("Error in toggleTurfActiveStatus: ", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
