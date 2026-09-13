import chalk from "chalk";
import * as argon2 from "argon2";
import OwnerRequest from "../../models/ownerRequest.model.js";
import Owner from "../../models/owner.model.js";
import Turf from "../../models/turf.model.js";
import generateEmail from "../../utils/generateEmail.js";

// 1. Get all requested owners grouped by status
export const getAllRequestedOwners = async (req, res) => {
  const adminRole = req.admin?.role;
  if (adminRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Admin privileges required" });
  }

  try {
    const ownerRequests = await OwnerRequest.find({ status: "pending" }).sort({ createdAt: -1 });
    const ownerApprovedRequests = await OwnerRequest.find({ status: "approved" }).sort({ updatedAt: -1 });
    const ownerRejectedRequests = await OwnerRequest.find({ status: "rejected" }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "success",
      ownerRequests,
      ownerApprovedRequests,
      ownerRejectedRequests,
      counts: {
        pending: ownerRequests.length,
        approved: ownerApprovedRequests.length,
        rejected: ownerRejectedRequests.length,
        total: ownerRequests.length + ownerApprovedRequests.length + ownerRejectedRequests.length,
      },
    });
  } catch (err) {
    console.error(chalk.red("Error in getAllRequestedOwners: "), err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Approve Owner Request & automatically provision Owner Account with generated credentials
export const approveOwnerRequest = async (req, res) => {
  const adminRole = req.admin?.role;
  const { id } = req.params;

  if (adminRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Admin privileges required" });
  }

  try {
    const ownerRequest = await OwnerRequest.findById(id);
    if (!ownerRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Owner request not found" });
    }

    // Determine credentials (admin-provided or auto-generated)
    const rawPassword = req.body.password?.trim() || `TurfOwner@${Math.floor(1000 + Math.random() * 9000)}`;

    let owner = await Owner.findOne({ email: ownerRequest.email });
    if (!owner) {
      const hashedPassword = await argon2.hash(rawPassword);
      owner = new Owner({
        name: ownerRequest.name,
        email: ownerRequest.email,
        phone: ownerRequest.phone,
        password: hashedPassword,
        role: "owner",
      });
      await owner.save();
    } else if (req.body.password) {
      owner.password = await argon2.hash(rawPassword);
      await owner.save();
    }

    // Automatically provision or activate live Turf record carrying address, coordinates, and photos
    let turfRecord = null;
    if (ownerRequest.turfId) {
      turfRecord = await Turf.findById(ownerRequest.turfId);
      if (turfRecord) {
        turfRecord.isActive = true;
        turfRecord.owner = owner._id;
        await turfRecord.save();
      }
    }

    if (!turfRecord) {
      const primaryPhoto =
        ownerRequest.images?.[0] ||
        "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80";
      const allPhotos =
        ownerRequest.images && ownerRequest.images.length > 0
          ? ownerRequest.images
          : [primaryPhoto];

      turfRecord = new Turf({
        name: ownerRequest.turfName || `${ownerRequest.name}'s Sports Arena`,
        description: `Premier sports arena situated at ${ownerRequest.address || "Jaipur"}. Features certified synthetic grass, pro night floodlights, and dedicated team dugouts.`,
        area: ownerRequest.area || "Jaipur",
        city: ownerRequest.city || "Jaipur",
        address: ownerRequest.address || "Jaipur, Rajasthan",
        location: {
          type: "Point",
          coordinates:
            ownerRequest.location?.coordinates && ownerRequest.location.coordinates.length >= 2
              ? ownerRequest.location.coordinates
              : [75.7684, 26.8533],
        },
        image: primaryPhoto,
        images: allPhotos,
        sportTypes:
          ownerRequest.sportTypes && ownerRequest.sportTypes.length > 0
            ? ownerRequest.sportTypes
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
        pricePerHour: ownerRequest.pricePerHour || 1000,
        rating: 4.8,
        reviewsCount: 1,
        openTime: "06:00",
        closeTime: "02:00",
        lateNightAvailable: true,
        slotDuration: 60,
        isActive: true,
        owner: owner._id,
      });

      await turfRecord.save();
      ownerRequest.turfId = turfRecord._id;
    }

    ownerRequest.status = "approved";
    ownerRequest.generatedCredentials = {
      email: ownerRequest.email,
      passwordText: rawPassword,
    };
    await ownerRequest.save();


    // Send notification email if configured
    try {
      const to = ownerRequest.email;
      const subject = "Your TurfSpot Owner Request has been Approved!";
      const html = ` 
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
          <h2 style="color: #10b981;">Congratulations! You are now a TurfSpot Owner</h2>
          <p>Hi <strong>${ownerRequest.name}</strong>,</p>
          <p>Your request to list and manage sports venues on TurfSpot has been approved by the platform administrator.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Your Login Credentials:</strong></p>
            <p style="margin: 0 0 4px 0;">Email: <code>${ownerRequest.email}</code></p>
            <p style="margin: 0;">Password: <code>${rawPassword}</code></p>
          </div>
          <p>Log in to your Owner Dashboard to manage your turfs, view bookings, and update availability.</p>
        </div>
      `;
      await generateEmail(to, subject, html);
    } catch (emailErr) {
      console.warn("[Email Notice] Could not dispatch approval email:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Owner "${ownerRequest.name}" approved and account created successfully!`,
      credentials: {
        email: ownerRequest.email,
        password: rawPassword,
      },
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        role: owner.role,
      },
      request: ownerRequest,
    });
  } catch (err) {
    console.error(chalk.red("Error in approveOwnerRequest: "), err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Reject Owner Request with optional reason
export const deleteOwnerRequest = async (req, res) => {
  const adminRole = req.admin?.role;
  const { id } = req.params;
  const reason = req.body.reason || req.body.rejectionReason || "Application does not meet platform requirements.";

  if (adminRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Admin privileges required" });
  }

  try {
    const ownerRequest = await OwnerRequest.findById(id);
    if (!ownerRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Owner request not found" });
    }

    ownerRequest.status = "rejected";
    ownerRequest.rejectionReason = reason;
    await ownerRequest.save();

    try {
      const to = ownerRequest.email;
      const subject = "Update regarding your TurfSpot Owner Request";
      const html = ` 
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #ef4444;">TurfSpot Owner Application Status</h2>
          <p>Hi <strong>${ownerRequest.name}</strong>,</p>
          <p>Thank you for your interest in partnering with TurfSpot. After review, your application could not be approved at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
      `;
      await generateEmail(to, subject, html);
    } catch (emailErr) {
      console.warn("[Email Notice] Could not dispatch rejection email:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Owner request rejected.",
      rejectionReason: reason,
      request: ownerRequest,
    });
  } catch (err) {
    console.error("Error in deleteOwnerRequest: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Reconsider a rejected request
export const reconsiderOwnerRequest = async (req, res) => {
  const adminRole = req.admin?.role;
  const { id } = req.params;

  if (adminRole !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized: Admin privileges required" });
  }

  try {
    const ownerRequest = await OwnerRequest.findById(id);
    if (!ownerRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Owner request not found" });
    }

    ownerRequest.status = "pending";
    ownerRequest.rejectionReason = "";
    await ownerRequest.save();

    return res.status(200).json({
      success: true,
      message: "Owner request reset to pending.",
      request: ownerRequest,
    });
  } catch (err) {
    console.error(chalk.red("Error in reconsiderOwnerRequest: "), err);
    return res.status(500).json({ success: false, message: err.message });
  }
};