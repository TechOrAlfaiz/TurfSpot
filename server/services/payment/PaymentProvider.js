/**
 * Abstract Payment Provider Interface
 */
export class PaymentProvider {
  constructor(name) {
    this.name = name;
  }

  async createOrder({ amount, currency, receipt, notes }) {
    throw new Error("createOrder() must be implemented by payment provider");
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    throw new Error("verifyPayment() must be implemented by payment provider");
  }

  async handleWebhook(payload, signature) {
    throw new Error("handleWebhook() must be implemented by payment provider");
  }

  async refundPayment({ paymentId, amount, reason, bookingId }) {
    throw new Error("refundPayment() must be implemented by payment provider");
  }

  getProviderInfo() {
    return {
      provider: this.name,
      isTestMode: this.name === "mock",
    };
  }
}
