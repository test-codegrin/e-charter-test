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


// Customer routes - Fixed parameter syntax
router.post("/book", authenticationToken, bookTripWithPricing);
router.get("/user-trips", authenticationToken, getUserTrips);
router.get("/:trip_id", authenticationToken, getTripDetails);

// Driver routes - Fixed parameter syntax  
router.post("/:trip_id/start", authenticationToken, startTrip);
router.put("/:trip_id/location", authenticationToken, updateTripLocation);
router.post("/:trip_id/complete", authenticationToken, completeTrip);

// Admin routes - Fixed route definition
router.get("/admin/all", authenticationToken, async (req, res) => {
  try {
    const { db } = require("../config/db");
    const tripGetQueries = require("../config/tripQueries/tripGetQueries");
    
    const [trips] = await db.query(tripGetQueries.getAllTripsForAdmin);
    
    res.status(200).json({
      message: "All trips fetched successfully",
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error("Error fetching all trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

console.log("Enhanced trip routes configured successfully");

module.exports = router;