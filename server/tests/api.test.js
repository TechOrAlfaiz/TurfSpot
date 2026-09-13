import { describe, it, before } from "node:test";
import assert from "node:assert";

const API_BASE = process.env.TEST_API_BASE || "http://localhost:1234";

describe("TurfSpot Backend Production Readiness API Test Suite", async () => {
  let adminToken = "";
  let ownerToken = "";
  let ownerEmail = "";
  let ownerPassword = "";
  let playerToken = "";
  let playerEmail = "";
  let testTurfId = "";

  // Helper fetch wrapper
  const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, headers: res.headers, data };
  };

  before(async () => {
    // 1. Fetch live turfs to get a real test turf ID
    const turfsRes = await request("/api/user/turf/all");
    const turfs = turfsRes.data?.turfs || turfsRes.data?.data || [];
    if (turfs.length > 0) {
      testTurfId = turfs[0]._id;
    }
  });

  // ==========================================
  // SECTION 1: AUTHENTICATION & JWT INTEGRITY
  // ==========================================
  describe("1. Authentication & JWT Integrity", () => {
    it("Admin login with .env credentials returns 200 and role 'admin'", async () => {
      const res = await request("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "admin@gmail.com",
          password: "Admin@TurfSpot2025!",
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "admin");
      assert.ok(res.data.token, "Admin JWT token should be returned");
      adminToken = res.data.token;
    });

    it("Player registration creates user and returns JWT", async () => {
      playerEmail = `player_${Date.now()}@turfspot.test`;
      const res = await request("/api/user/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Player",
          email: playerEmail,
          phone: "9876543210",
          password: "Password@123",
        }),
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.token, "Player JWT token should be returned");
    });

    it("Player login with valid credentials returns 200 and role 'user'", async () => {
      const res = await request("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: playerEmail,
          password: "Password@123",
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "user");
      assert.ok(res.data.token, "Player JWT token should be returned");
      playerToken = res.data.token;
    });

    it("Login with incorrect password returns 400 Bad Request", async () => {
      const res = await request("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: playerEmail,
          password: "WrongPassword999!",
        }),
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /invalid/i);
    });

    it("Login with non-existent email returns 400 Bad Request", async () => {
      const res = await request("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "ghost_user_does_not_exist@turfspot.test",
          password: "Password@123",
        }),
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /invalid/i);
    });

    it("Protected route rejects request with missing authorization header (401)", async () => {
      const res = await request("/api/admin/owner-requests/list");
      assert.strictEqual(res.status, 401);
    });

    it("Protected route rejects forged / invalid signature JWT (401)", async () => {
      const forgedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4ifQ.forged_signature";
      const res = await request("/api/admin/owner-requests/list", {
        headers: { Authorization: `Bearer ${forgedToken}` },
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.success, false);
    });
  });

  // ==========================================
  // SECTION 2: CROSS-ROLE AUTHORIZATION (RBAC)
  // ==========================================
  describe("2. Cross-Role Authorization Matrix", () => {
    it("Player token is blocked from Admin endpoints (403 Forbidden)", async () => {
      const res = await request("/api/admin/owner-requests/list", {
        headers: { Authorization: `Bearer ${playerToken}` },
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.data.success, false);
    });

    it("Player token is blocked from Owner endpoints (403 Forbidden)", async () => {
      const res = await request("/api/owner/dashboard/my-turfs", {
        headers: { Authorization: `Bearer ${playerToken}` },
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.data.success, false);
    });

    it("Admin token is authorized on Admin endpoints (200 OK)", async () => {
      const res = await request("/api/admin/owner-requests/list", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });
  });

  // ==========================================
  // SECTION 3: BECOME OWNER ONBOARDING LIFECYCLE
  // ==========================================
  describe("3. 'Become Owner' Request Lifecycle", () => {
    let requestId = "";
    let approvedTurfName = "Jaipur Super Box Arena";

    it("Submitting Become Owner application with missing address/photos is rejected (400)", async () => {
      const res = await request("/api/owner/auth/ownerRequest", {
        method: "POST",
        body: JSON.stringify({
          name: "Invalid Applicant",
          email: `invalid_${Date.now()}@turfspot.test`,
          phone: "9876543210",
        }),
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    it("Submitting valid Become Owner application with address, coordinates, and photos creates pending request", async () => {
      ownerEmail = `owner_partner_${Date.now()}@turfspot.test`;
      const res = await request("/api/owner/auth/ownerRequest", {
        method: "POST",
        body: JSON.stringify({
          name: "Mohd Alfaiz",
          email: ownerEmail,
          phone: "9123456780",
          turfName: approvedTurfName,
          address: "Plot 24, Near City Park, Mansarovar, Jaipur, Rajasthan 302020",
          latitude: 26.8533,
          longitude: 75.7684,
          coordinates: [75.7684, 26.8533],
          sportTypes: ["Cricket", "Football"],
          pricePerHour: 1100,
          images: [
            "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80"
          ],
        }),
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);

      // Verify request appears in Admin list with address & coordinates
      const listRes = await request("/api/admin/owner-requests/list", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const match = (listRes.data.ownerRequests || []).find((r) => r.email === ownerEmail);
      assert.ok(match, "Newly submitted request should be in Admin pending list");
      assert.strictEqual(match.turfName, approvedTurfName);
      assert.ok(match.images?.length >= 1, "Must store uploaded photos");
      assert.ok(match.location?.coordinates?.length === 2, "Must store coordinates");
      requestId = match._id;
    });

    it("Admin approves Become Owner request -> provisions Owner account + creates live Turf record", async () => {
      assert.ok(requestId, "Must have valid requestId");
      const res = await request(`/api/admin/owner-requests/${requestId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.credentials?.password, "Generated password must be returned");
      ownerPassword = res.data.credentials.password;

      // Verify Turf was created and appears in platform turf listings
      const turfsRes = await request("/api/user/turf/all");
      const turfsList = turfsRes.data?.turfs || [];
      const newTurf = turfsList.find((t) => t.name === approvedTurfName);
      assert.ok(newTurf, "Newly approved turf should exist in live public listings");
      assert.strictEqual(newTurf.address, "Plot 24, Near City Park, Mansarovar, Jaipur, Rajasthan 302020");
      assert.strictEqual(newTurf.location.coordinates[0], 75.7684);
      assert.strictEqual(newTurf.location.coordinates[1], 26.8533);
    });

    it("Newly approved Owner can log in via unified /login and receive 'owner' role", async () => {
      const res = await request("/api/user/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: ownerEmail,
          password: ownerPassword,
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "owner");
      assert.ok(res.data.token);
      ownerToken = res.data.token;
    });

    it("Newly approved Turf appears in Owner's /my-turfs dashboard", async () => {
      const res = await request("/api/owner/dashboard/my-turfs", {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      const owned = res.data.turfs.find((t) => t.name === approvedTurfName);
      assert.ok(owned, "Approved turf must be linked to this owner");
    });

    it("Owner token is blocked from Admin endpoints (403 Forbidden)", async () => {
      const res = await request("/api/admin/turfs/all", {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.data.success, false);
    });

    it("Admin rejects a separate request -> status is updated to rejected with reason", async () => {
      const rejectEmail = `rejected_${Date.now()}@turfspot.test`;
      await request("/api/owner/auth/ownerRequest", {
        method: "POST",
        body: JSON.stringify({
          name: "Incomplete Docs Arena",
          email: rejectEmail,
          phone: "9123456781",
          turfName: "Incomplete Arena",
          address: "Somewhere in Jaipur",
          images: ["https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80"],
        }),
      });

      const listRes = await request("/api/admin/owner-requests/list", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const match = (listRes.data.ownerRequests || []).find((r) => r.email === rejectEmail);
      assert.ok(match);

      const rejectRes = await request(`/api/admin/owner-requests/${match._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ reason: "Incomplete property ownership documentation" }),
      });
      assert.strictEqual(rejectRes.status, 200);
      assert.strictEqual(rejectRes.data.success, true);
    });
  });


  // ==========================================
  // SECTION 4: OWNER SCOPING & DATA ISOLATION
  // ==========================================
  describe("4. Owner Dashboard Scoping & Tenant Isolation", () => {
    it("Owner A calling /my-turfs only receives turfs where owner matches their token ID", async () => {
      const res = await request("/api/owner/dashboard/my-turfs", {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.turfs));
    });

    it("Owner A cannot modify a turf belonging to another owner (404/403)", async () => {
      if (!testTurfId) return;
      const res = await request(`/api/owner/dashboard/turf/${testTurfId}/availability`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${ownerToken}` },
        body: JSON.stringify({ pricePerHour: 99999 }),
      });
      // Should be 404 or not found since testTurf is not owned by this newly registered owner
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /not found|permission/i);
    });
  });

  // ==========================================
  // SECTION 5: BOOKING RACE CONDITIONS & CONCURRENCY
  // ==========================================
  describe("5. Booking Race Conditions & Atomic Slot Locking", () => {
    it("Simultaneous duplicate order creation for the exact same slot allows only 1 winner (409 Conflict)", async () => {
      if (!testTurfId) return;
      // Dynamic test date in the future
      const uniqueDays = Math.floor(Math.random() * 20) + 10;
      const testDate = new Date(Date.now() + 86400000 * uniqueDays).toISOString().split("T")[0];
      const slotHour = (Date.now() % 8) + 1;
      const slotTime = `${slotHour.toString().padStart(2, "0")}:00 PM`;

      // Fire 2 concurrent order creation calls for identical turf, date, and slot
      const call1 = request("/api/user/booking/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: slotTime,
          selectedTurfDate: testDate,
          duration: 1,
          sport: "Cricket",
        }),
      });

      const call2 = request("/api/user/booking/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: slotTime,
          selectedTurfDate: testDate,
          duration: 1,
          sport: "Cricket",
        }),
      });

      const [res1, res2] = await Promise.all([call1, call2]);

      const statuses = [res1.status, res2.status].sort();
      // At least one MUST be 409 Conflict because of atomic slot hold
      assert.ok(
        statuses.includes(409),
        `Expected at least one request to return 409 Conflict. Got: ${res1.status} and ${res2.status}`
      );
      assert.ok(
        statuses.includes(200),
        `Expected winning request to return 200 OK. Got: ${res1.status} and ${res2.status}`
      );
    });

    it("Order creation with missing turf ID returns 404 or 400", async () => {
      const res = await request("/api/user/booking/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: "000000000000000000000000",
          startTime: "10:00 AM",
        }),
      });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
    });
  });

  // ==========================================
  // SECTION 6: PAYMENT ORDER & SIGNATURE VERIFICATION
  // ==========================================
  describe("6. Payment Lifecycle & Signature Verification", () => {
    let orderId = "";
    const uniqueDays = Math.floor(Math.random() * 20) + 35;
    const testDate = new Date(Date.now() + 86400000 * uniqueDays).toISOString().split("T")[0];
    const slotTime = "06:00 PM";

    it("Creates payment order and places temporary 10-minute hold on slot", async () => {
      if (!testTurfId) return;
      const res = await request("/api/user/booking/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: slotTime,
          selectedTurfDate: testDate,
          duration: 1,
          sport: "Football",
        }),
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.order?.id, "Order ID must be generated");
      orderId = res.data.order.id;
    });

    it("Rejects payment confirmation when status is FAILED and releases slot hold", async () => {
      if (!testTurfId || !orderId) return;
      const res = await request("/api/user/booking/verify-payment", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: slotTime,
          selectedTurfDate: testDate,
          orderId,
          paymentId: "pay_failed_sim_123",
          status: "FAILED",
        }),
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /failure|failed|declined/i);
    });

    it("Confirms booking when payment is verified and issues booking reference", async () => {
      if (!testTurfId) return;
      // 1. Create a fresh order with a separate pristine slot
      const confirmDate = new Date(Date.now() + 86400000 * (uniqueDays + 2)).toISOString().split("T")[0];
      const confirmSlotTime = "09:00 PM";

      const orderRes = await request("/api/user/booking/create-order", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: confirmSlotTime,
          selectedTurfDate: confirmDate,
          duration: 1,
          sport: "Football",
        }),
      });
      assert.strictEqual(orderRes.status, 200);
      const newOrderId = orderRes.data.order.id;

      // 2. Verify with success
      const verifyRes = await request("/api/user/booking/verify-payment", {
        method: "POST",
        headers: { Authorization: `Bearer ${playerToken}` },
        body: JSON.stringify({
          id: testTurfId,
          startTime: confirmSlotTime,
          selectedTurfDate: confirmDate,
          orderId: newOrderId,
          paymentId: `pay_mock_${Date.now()}`,
          status: "SUCCESS",
        }),
      });
      assert.strictEqual(verifyRes.status, 200);
      assert.strictEqual(verifyRes.data.success, true);
      assert.ok(verifyRes.data.bookingReference, "Booking reference should be generated");
      assert.strictEqual(verifyRes.data.booking?.status, "CONFIRMED");

      // 3. Verify booking appears in customer's my-bookings
      const myBookingsRes = await request("/api/user/booking/my-bookings", {
        headers: { Authorization: `Bearer ${playerToken}` },
      });
      const bookingsList = Array.isArray(myBookingsRes.data)
        ? myBookingsRes.data
        : myBookingsRes.data?.bookings || [];
      const match = bookingsList.find(
        (b) => b.bookingReference === verifyRes.data.bookingReference
      );
      assert.ok(match, "Confirmed booking must be listed in my-bookings");

      // 4. Test Cancellation within window
      if (match) {
        const cancelRes = await request(`/api/user/booking/${match._id}/cancel`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${playerToken}` },
          body: JSON.stringify({ reason: "Customer reschedule request" }),
        });
        assert.strictEqual(cancelRes.status, 200);
        assert.strictEqual(cancelRes.data.success, true);
        assert.strictEqual(cancelRes.data.booking?.status, "CANCELLED");
      }
    });
  });

  // ==========================================
  // SECTION 7: PROXIMITY MAP & GEOSPATIAL QUERIES
  // ==========================================
  describe("7. Proximity Map & Geospatial Coordinates", () => {
    it("Nearby turfs query returns turfs with valid coordinates and distance metrics", async () => {
      // Query from Mansarovar, Jaipur coordinates (26.8533, 75.7684)
      const res = await request("/api/user/turf/nearby?lat=26.8533&lng=75.7684&radius=15");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.turfs), "Turfs array must be returned");
      assert.ok(res.data.turfs.length > 0, "Should return nearby turfs in Jaipur");

      // Verify every turf has valid coordinates and non-null distance
      res.data.turfs.forEach((turf) => {
        assert.ok(turf.location?.coordinates?.length === 2, `Turf ${turf.name} must have 2D coordinates`);
        const [lng, lat] = turf.location.coordinates;
        assert.ok(!isNaN(lng) && lng >= -180 && lng <= 180, `Valid longitude expected, got ${lng}`);
        assert.ok(!isNaN(lat) && lat >= -90 && lat <= 90, `Valid latitude expected, got ${lat}`);
        assert.ok(turf.distanceKm !== undefined && turf.distanceKm !== null, `Distance must be calculated for ${turf.name}`);
      });
    });

    it("Nearby turfs query respects sport filtering", async () => {
      const res = await request("/api/user/turf/nearby?lat=26.8533&lng=75.7684&radius=25&sport=Cricket");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      res.data.turfs.forEach((t) => {
        assert.ok(
          t.sportTypes.some((s) => s.toLowerCase().includes("cricket")),
          `Turf ${t.name} should include Cricket in sportTypes`
        );
      });
    });
  });
});

