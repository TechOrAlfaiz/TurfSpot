import nodemailer from "nodemailer";
import chalk from "chalk";

/**
 * Enterprise Nodemailer SMTP Email Dispatcher
 */
export default async function generateEmail(to, subject, html) {
  if (!process.env.EMAIL || !process.env.PASSWORD) {
    console.log(
      chalk.yellow("[Email Service] SMTP credentials not configured in .env (EMAIL / PASSWORD). Skipping live dispatch.")
    );
    return { success: false, status: "NOT_CONFIGURED" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `"TurfSpot" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(chalk.green(`[Email Service] Sent confirmation email to: ${to}`));
    return { success: true, status: "SENT" };
  } catch (e) {
    console.error(chalk.red("[Email Service] Dispatch error:"), e.message);
    return { success: false, status: "FAILED", error: e.message };
  }
}

export const generateHTMLContent = (
  turfName,
  address,
  date,
  startTime,
  endTime,
  totalPrice,
  QRcode,
  bookingRef,
  sport
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TurfSpot Booking Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #059669, #0d9488); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 8px; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
    .content { padding: 28px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 13px; }
    .label { color: #94a3b8; font-weight: 500; }
    .val { color: #ffffff; font-weight: 700; }
    .qr-box { text-align: center; margin: 24px 0 16px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.15); }
    .qr-box img { max-width: 170px; border-radius: 12px; background: #fff; padding: 8px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Booking Confirmed! ⚡</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your game at TurfSpot is locked in.</p>
    </div>
    <div class="content">
      <span class="badge">${sport || "Sports Arena"}</span>
      <div class="row"><span class="label">Booking ID</span><span class="val" style="color: #34d399;">${bookingRef || "TS-REF"}</span></div>
      <div class="row"><span class="label">Turf Arena</span><span class="val">${turfName}</span></div>
      <div class="row"><span class="label">Match Date</span><span class="val">${date}</span></div>
      <div class="row"><span class="label">Time Slot</span><span class="val">${startTime} - ${endTime}</span></div>
      <div class="row"><span class="label">Venue Location</span><span class="val">${address || "Jaipur, Rajasthan"}</span></div>
      <div class="row"><span class="label">Total Paid</span><span class="val" style="color: #10b981; font-size: 15px;">₹${totalPrice}</span></div>

      <div class="qr-box">
        <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; color: #cbd5e1;">Scan QR Code at Venue Entry</p>
        <img src="${QRcode}" alt="Venue Entry QR Code" />
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
        • Please arrive 10 minutes prior to your start time.<br/>
        • Proper turf footwear is required on the playing pitch.<br/>
        • Free cancellations are available up to 4 hours before slot start time.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} TurfSpot Sports Discovery Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};

