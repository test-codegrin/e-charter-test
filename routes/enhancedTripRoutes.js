const express = require("express");
const router = express.Router();
const {
  bookTripWithPricing,
  getUserTrips,
  getTripDetails,
  startTrip,
  updateTripLocation,
  completeTrip
} = require("../controller/enhancedTripController");
const { authenticationToken } = require("../middleware/authMiddleware");

// Customer routes
router.post("/book", authenticationToken, bookTripWithPricing);
router.get("/user-trips", authenticationToken, getUserTrips);
router.get("/:trip_id", authenticationToken, getTripDetails);

// Driver routes
router.post("/:trip_id/start", authenticationToken, startTrip);
router.put("/:trip_id/location", authenticationToken, updateTripLocation);
router.post("/:trip_id/complete", authenticationToken, completeTrip);

module.exports = router;