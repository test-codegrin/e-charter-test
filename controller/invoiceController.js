const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const invoiceQueries = require("../config/invoiceQueries/invoiceQueries");
const emailService = require("../services/emailService");

// Get user invoices
const getUserInvoices = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [invoices] = await db.query(invoiceQueries.getInvoicesByUserId, [user_id]);

    res.status(200).json({
      message: "Invoices fetched successfully",
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get invoice details
const getInvoiceDetails = asyncHandler(async (req, res) => {
  const { invoice_id } = req.params;
  const user_id = req.user?.user_id;

  try {
    const [invoiceDetails] = await db.query(invoiceQueries.getInvoiceById, [invoice_id]);

    if (invoiceDetails.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoiceDetails[0];

    // Check if user owns this invoice
    if (invoice.user_id !== user_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      message: "Invoice details fetched successfully",
      invoice
    });

  } catch (error) {
    console.error("Error fetching invoice details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Admin: Get all invoices
const getAllInvoices = asyncHandler(async (req, res) => {
  try {
    const [invoices] = await db.query(invoiceQueries.getAllInvoicesForAdmin);

    res.status(200).json({
      message: "All invoices fetched successfully",
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.error("Error fetching all invoices:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update invoice status (for payment processing)
const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { invoice_id } = req.params;
  const { status } = req.body;

  if (!['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const [result] = await db.query(invoiceQueries.updateInvoiceStatus, [status, invoice_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // If paid, send invoice email
    if (status === 'paid') {
      const [invoiceDetails] = await db.query(invoiceQueries.getInvoiceById, [invoice_id]);
      if (invoiceDetails.length > 0) {
        const invoice = invoiceDetails[0];
        try {
          await emailService.sendInvoice(invoice, invoice);
        } catch (emailError) {
          console.error("Invoice email failed:", emailError);
        }
      }
    }

    res.status(200).json({
      message: `Invoice status updated to ${status}`,
      invoice_id
    });

  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  getUserInvoices,
  getInvoiceDetails,
  getAllInvoices,
  updateInvoiceStatus
};