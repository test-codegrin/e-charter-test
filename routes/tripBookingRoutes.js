const express = require("express");
const router = express.Router();
const { bookTrip } = require("../controller/tripBookingController");
const { authenticationToken } = require("../middleware/authMiddleware");

// Fixed route definitions - no parameters needed here
router.post("/tripbook", authenticationToken, bookTrip);

module.exports = router;