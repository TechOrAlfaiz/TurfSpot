import { MockPaymentProvider } from "./MockPaymentProvider.js";
import { RazorpayPaymentProvider } from "./RazorpayPaymentProvider.js";

let activeProviderInstance = null;

export function getPaymentProvider() {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const requestedProvider = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase().trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && requestedProvider === "mock" && process.env.REQUIRE_LIVE_PAYMENTS === "true") {
    throw new Error(
      "FATAL CONFIGURATION ERROR: Mock payment provider is strictly forbidden when REQUIRE_LIVE_PAYMENTS=true. Set PAYMENT_PROVIDER=razorpay and provide valid credentials."
    );
  }

  if (requestedProvider === "razorpay") {
    if (isProduction && process.env.REQUIRE_LIVE_PAYMENTS === "true" && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
      throw new Error(
        "FATAL CONFIGURATION ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required when REQUIRE_LIVE_PAYMENTS=true."
      );
    }
    activeProviderInstance = new RazorpayPaymentProvider();
  } else {
    activeProviderInstance = new MockPaymentProvider();
  }

  return activeProviderInstance;
}

export const paymentProvider = getPaymentProvider();
export default paymentProvider;
