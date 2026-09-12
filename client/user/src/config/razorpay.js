import toast from "react-hot-toast";

export const handlePayment = async (order, user, explicitKeyId = null) => {
  return new Promise((resolve, reject) => {
    const key =
      explicitKeyId ||
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!key || key === "rzp_test_dummykey" || key.includes("your_public_key")) {
      reject(
        new Error(
          "Razorpay public key is not configured. For development without Razorpay keys, configure PAYMENT_PROVIDER=mock on backend."
        )
      );
      return;
    }

    if (!window.Razorpay) {
      reject(
        new Error("Razorpay SDK is not loaded. Please check your internet connection and refresh.")
      );
      return;
    }

    const options = {
      key,
      amount: order?.amount || 10000,
      currency: order?.currency || "INR",
      order_id: order?.id,
      name: "TurfSpot Jaipur",
      description: `Turf Reservation Payment - Order #${order?.id?.slice(-6) || "TS"}`,
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=200&q=80",
      theme: {
        color: "#10b981",
      },
      handler: function (response) {
        if (response?.error) {
          toast.error(response.error.description || response.error.message || "Payment failed");
          reject(response.error);
        } else {
          resolve(response);
        }
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Payment was cancelled by user."));
        },
      },
      prefill: {
        name: user?.name || "Player",
        email: user?.email || "player@turfspot.com",
        contact: user?.phone || "9829012345",
      },
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (failResponse) {
        reject(new Error(failResponse.error?.description || "Payment transaction failed"));
      });
      rzpInstance.open();
    } catch (e) {
      reject(e);
    }
  });
};
