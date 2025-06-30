const express = require("express");
const router = express.Router();
const {
  getUserInvoices,
  getInvoiceDetails,
  getAllInvoices,
  updateInvoiceStatus
} = require("../controller/invoiceController");
const { authenticationToken } = require("../middleware/authMiddleware");

// Customer routes
router.get("/user-invoices", authenticationToken, getUserInvoices);
router.get("/:invoice_id", authenticationToken, getInvoiceDetails);

// Admin routes
router.get("/admin/all", authenticationToken, getAllInvoices);
router.put("/:invoice_id/status", authenticationToken, updateInvoiceStatus);

module.exports = router;