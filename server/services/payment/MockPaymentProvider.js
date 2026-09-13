import { PaymentProvider } from "./PaymentProvider.js";

/**
 * Development-Only Mock Payment Provider
 * Simulates payment operations for local testing without requiring external credentials.
 */
export class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super("mock");

    // Strictly forbid mock provider in production environment when live payments required
    if (process.env.NODE_ENV === "production" && process.env.REQUIRE_LIVE_PAYMENTS === "true") {
      throw new Error(
        "FATAL CONFIGURATION ERROR: MockPaymentProvider is strictly forbidden when REQUIRE_LIVE_PAYMENTS=true. Set PAYMENT_PROVIDER=razorpay and configure valid Razorpay credentials."
      );
    }
  }

  async createOrder({ amount, currency = "INR", receipt, notes = {} }) {
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: orderId,
      amount,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      provider: "mock",
      isTestMode: true,
      notes,
    };
  }

  async verifyPayment({ orderId, paymentId, signature, status = "SUCCESS" }) {
    if (status === "FAILED" || paymentId?.includes("fail")) {
      return {
        verified: false,
        status: "FAILED",
        message: "Simulated payment failure (Development Mode)",
      };
    }

    return {
      verified: true,
      status: "SUCCESS",
      orderId: orderId || `mock_order_${Date.now()}`,
      paymentId: paymentId || `mock_pay_${Date.now()}`,
      signature: signature || `mock_sig_${Date.now()}`,
      provider: "mock",
      message: "Simulated payment confirmed (Development Mode)",
    };
  }

  async handleWebhook(payload, signature) {
    return {
      received: true,
      provider: "mock",
      event: payload?.event || "payment.captured",
    };
  }

  async refundPayment({ paymentId, amount, reason, bookingId }) {
    return {
      refundId: `mock_rfnd_${Date.now()}`,
      paymentId,
      amount,
      status: "processed",
      reason: reason || "User requested cancellation",
      bookingId,
      provider: "mock",
      refundedAt: new Date(),
    };
  }
}
