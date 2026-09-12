import { validationResult } from "express-validator";
import cloudinary from "../../utils/cloudinary.js";
import Turf from "../../models/turf.model.js";
import chalk from "chalk";
import Review from "../../models/review.model.js"

export const turfRegister = async (req, res) => {
  const image = req.file.path;
  const owner = req.owner.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array() });
  }
  try {
    // upload the turf image to cloudinary
    const turfImage = await cloudinary.uploader.upload(image, {
      folder: "TurfSpot/turfs",
    });

    const lat = req.body.latitude ?? req.body.lat;
    const lng = req.body.longitude ?? req.body.lng;

    let locationObj = req.body.location;
    if (lat !== undefined && lng !== undefined) {
      locationObj = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };
    } else if (typeof locationObj === "string") {
      try {
        const parsed = JSON.parse(locationObj);
        if (parsed && parsed.coordinates) {
          locationObj = parsed;
        }
      } catch (e) {
        const parts = locationObj.split(",").map((p) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          locationObj = {
            type: "Point",
            coordinates: [parts[1], parts[0]],
          };
        }
      }
    }

    const turf = new Turf({
      ...req.body,
      image: turfImage.secure_url,
      owner,
      location: locationObj,
    });
    await turf.save();
    return res
      .status(201)
      .json({ success: true, message: "Turf created successfully", turf });
  } catch (err) {
    console.error(chalk.red(err.message));
    return res.status(500).json({ success: false, message: err.message });
  }
};

// get all turfs by owner id

export const getTurfByOwner = async (req, res) => {
  const ownerId = req.owner.id;

  try {
    const turfs = await Turf.find({ owner: ownerId });

    // get all reviews by turf id of owner
    const turfsWithAvgRating = await Promise.all(
      turfs.map(async (turf) => {
        const reviewCount = turf.reviews.length;
        const avgRating =
          reviewCount > 0
            ? await Review.aggregate([
                { $match: { turf: turf._id } },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } },
              ])
            : 0;
        return {
          ...turf.toObject(),
          avgRating: avgRating[0] ? avgRating[0].avgRating : 0,
        };
      })
    );
 
    return res.status(200).json(turfsWithAvgRating);
  } catch (err) {
    console.error("Error getting turfs by ownerId", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

//  edit turf by id

export const editTurfById = async (req, res) => {
  const owner = req.owner.id;

  const { id } = req.params;
  const { sportTypes, sportsType, ...otherDetails } = req.body;

  let parsedSportTypes = sportTypes || [];
  if (req.body.sportsType) {
    parsedSportTypes.push(sportsType);
  }

  const updatedTurfData = {
    ...otherDetails,
  };
  if (parsedSportTypes.length > 0) {
    updatedTurfData.sportTypes = parsedSportTypes;
  }

  const lat = req.body.latitude ?? req.body.lat;
  const lng = req.body.longitude ?? req.body.lng;
  if (lat !== undefined && lng !== undefined) {
    updatedTurfData.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };
  } else if (req.body.location) {
    if (typeof req.body.location === "object") {
      updatedTurfData.location = req.body.location;
    } else if (typeof req.body.location === "string") {
      try {
        updatedTurfData.location = JSON.parse(req.body.location);
      } catch (e) {
        const parts = req.body.location.split(",").map((p) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          updatedTurfData.location = {
            type: "Point",
            coordinates: [parts[1], parts[0]],
          };
        }
      }
    }
  }

  try {
    const updatedTurf = await Turf.findOne({ owner: owner, _id: id });
    if (!updatedTurf) {
      return res
        .status(404)
        .json({ success: false, message: "Turf not found" });
    }

    await Turf.findOneAndUpdate({ owner: owner, _id: id }, updatedTurfData, {
      new: true,
    });
    const allTurfs = await Turf.find({ owner: owner });
    return res
      .status(200)
      .json({ success: true, message: "Turf updated successfully", allTurfs });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
