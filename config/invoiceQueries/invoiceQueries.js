const invoiceQueries = {
  createInvoice: `
    INSERT INTO invoices (
      trip_id, user_id, invoice_number, subtotal, 
      tax_amount, total_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  getInvoicesByUserId: `
    SELECT 
      i.*,
      t.pickupLocation,
      t.dropLocation,
      t.tripStartDate
    FROM invoices i
    JOIN trips t ON i.trip_id = t.trip_id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `,

  getInvoiceById: `
    SELECT 
      i.*,
      t.*,
      u.firstName,
      u.lastName,
      u.email,
      u.address,
      u.cityName,
      u.zipCord,
      u.phoneNo
    FROM invoices i
    JOIN trips t ON i.trip_id = t.trip_id
    JOIN users u ON i.user_id = u.user_id
    WHERE i.invoice_id = ?
  `,

  updateInvoiceStatus: `
    UPDATE invoices 
    SET status = ?, paid_at = CURRENT_TIMESTAMP 
    WHERE invoice_id = ?
  `,

  getAllInvoicesForAdmin: `
    SELECT 
      i.*,
      u.firstName,
      u.lastName,
      u.email,
      t.pickupLocation,
      t.dropLocation
    FROM invoices i
    JOIN users u ON i.user_id = u.user_id
    JOIN trips t ON i.trip_id = t.trip_id
    ORDER BY i.created_at DESC
  `
};

module.exports = invoiceQueries;