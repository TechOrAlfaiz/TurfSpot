import crypto from "crypto";
import Razorpay from "razorpay";
import { PaymentProvider } from "./PaymentProvider.js";

/**
 * Production Razorpay Payment Provider
 */
export class RazorpayPaymentProvider extends PaymentProvider {
  constructor() {
    super("razorpay");

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "FATAL CONFIGURATION ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set when PAYMENT_PROVIDER=razorpay."
        );
      } else {
        console.warn(
          "[PaymentService] Warning: Razorpay credentials not fully set. For local testing without keys, set PAYMENT_PROVIDER=mock."
        );
      }
    }

    if (keyId && keySecret) {
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  async createOrder({ amount, currency = "INR", receipt, notes = {} }) {
    if (!this.client) {
      throw new Error("Razorpay client is not initialized. Check your credentials.");
    }

    const options = {
      amount: Math.round(amount), // in paise
      currency,
      receipt: receipt || `rcpt_${Date.now().toString(36)}`,
      notes,
    };

    const order = await this.client.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      provider: "razorpay",
      isTestMode: false,
      notes: order.notes,
    };
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("Cannot verify payment signature: RAZORPAY_KEY_SECRET is missing.");
    }

    if (!orderId || !paymentId || !signature) {
      return {
        verified: false,
        status: "FAILED",
        message: "Missing orderId, paymentId, or signature for Razorpay verification",
      };
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );

    if (!isMatch) {
      return {
        verified: false,
        status: "FAILED",
        message: "Invalid Razorpay payment signature",
      };
    }

    return {
      verified: true,
      status: "SUCCESS",
      orderId,
      paymentId,
      signature,
      provider: "razorpay",
      message: "Razorpay payment verified successfully",
    };
  }

  async handleWebhook(payload, signature) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(typeof payload === "string" ? payload : JSON.stringify(payload))
        .digest("hex");

      if (signature !== expectedSignature) {
        throw new Error("Invalid Razorpay webhook signature");
      }
    }

    return {
      received: true,
      provider: "razorpay",
      event: payload?.event,
      payload,
    };
  }

  async refundPayment({ paymentId, amount, reason, bookingId }) {
    if (!this.client) {
      throw new Error("Razorpay client is not configured for refunds.");
    }

    const refundOptions = {
      amount: Math.round(amount * 100), // in paise
      notes: {
        reason: reason || "Player requested cancellation",
        bookingId: String(bookingId || ""),
      },
    };

    const refund = await this.client.payments.refund(paymentId, refundOptions);
    return {
      refundId: refund.id,
      paymentId,
      amount: refund.amount / 100,
      status: refund.status,
      reason,
      bookingId,
      provider: "razorpay",
      refundedAt: new Date(),
    };
  }

  getProviderInfo() {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    return {
      provider: "razorpay",
      isTestMode: keyId.startsWith("rzp_test_"),
      razorpayKeyId: keyId,
    };
  }
}

