const express = require("express");
const router = express.Router();
const { getQuote } = require("../controller/pricingController");

// Fixed route definitions - no parameters needed here
router.post("/quote", getQuote);

module.exports = router;