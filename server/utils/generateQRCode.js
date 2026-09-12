import QRCode from "qrcode";
import cloudinary from "./cloudinary.js"

async function generateQRCode(
  price,
  startTime,
  endTime,
  date,
  turfName,
  location
) {
  try {
    const locStr =
      typeof location === "object" && location?.coordinates
        ? `${location.coordinates[1]}, ${location.coordinates[0]}`
        : String(location || "");

    // Create the content string
    const content = `Turf Name: ${turfName}\nLocation: ${locStr}\nPrice: ${price}\nDate: ${date}\nStart Time: ${startTime}\nEnd Time: ${endTime}`;

    // Generate QR code as a data URL
    const qrCodeDataURL = await QRCode.toDataURL(content);

    try {
      // Upload the QR code to Cloudinary if available
      const uploadResponse = await cloudinary.uploader.upload(qrCodeDataURL, {
        folder: "TurfSpot/qrcode",
      });
      console.log("QR code has been generated and uploaded successfully!");
      return uploadResponse.secure_url;
    } catch (cloudErr) {
      console.warn("Cloudinary upload fallback to data URL:", cloudErr.message);
      return qrCodeDataURL;
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

export default generateQRCode;
