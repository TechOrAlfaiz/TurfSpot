import chalk from "chalk";

/**
 * WhatsApp Business Cloud API Integration Service
 * Sends structured, interactive booking confirmations to players upon successful reservation.
 */
export async function sendWhatsAppBookingConfirmation({
  recipientPhone,
  userName,
  turfName,
  sport,
  bookingDate,
  startTime,
  endTime,
  duration,
  totalPrice,
  bookingReference,
  address,
  coordinates,
}) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.log(
      chalk.yellow(
        "[WhatsApp Service] Credentials not configured in .env (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID). Skipping live dispatch."
      )
    );
    return {
      success: false,
      status: "NOT_CONFIGURED",
      message: "WhatsApp credentials not configured",
    };
  }

  // Clean and normalize recipient phone number (E.164 format without '+' for WhatsApp API)
  let cleanPhone = String(recipientPhone || "").replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`; // Default to India country code
  }

  if (!cleanPhone || cleanPhone.length < 10) {
    console.warn("[WhatsApp Service] Invalid recipient phone number:", recipientPhone);
    return {
      success: false,
      status: "FAILED",
      message: "Invalid phone number",
    };
  }

  const directionsUrl =
    coordinates && Array.isArray(coordinates) && coordinates.length >= 2
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`
      : "https://maps.google.com";

  const messageText = `*TurfSpot Booking Confirmed!* ⚽🏏\n\nHi ${userName || "Player"},\nYour game is locked in and ready!\n\n*Turf:* ${turfName}\n*Sport:* ${sport}\n*Date:* ${bookingDate}\n*Time:* ${startTime} - ${endTime} (${duration} hr)\n*Amount Paid:* ₹${totalPrice}\n*Booking ID:* ${bookingReference}\n\n*Venue Address:*\n${address || "Jaipur, Rajasthan"}\n\n*Get Directions:*\n${directionsUrl}\n\n_Show your QR code at the turf reception for entry. Have a great game!_`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: {
      preview_url: true,
      body: messageText,
    },
  };

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(chalk.green(`[WhatsApp Service] Confirmation sent to ${cleanPhone}. Message ID: ${data.messages?.[0]?.id}`));
      return {
        success: true,
        status: "SENT",
        messageId: data.messages?.[0]?.id,
      };
    } else {
      console.error(chalk.red("[WhatsApp Service] API Error:"), data.error?.message || data);
      return {
        success: false,
        status: "FAILED",
        error: data.error?.message,
      };
    }
  } catch (err) {
    console.error(chalk.red("[WhatsApp Service] Network Error:"), err.message);
    return {
      success: false,
      status: "FAILED",
      error: err.message,
    };
  }
}

export default sendWhatsAppBookingConfirmation;
