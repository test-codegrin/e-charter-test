const express = require("express");
const router = express.Router();
const { getQuote } = require("../controller/pricingController");

router.post("/quote", getQuote);

module.exports = router;