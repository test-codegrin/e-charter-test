const adminPostQueries = {

insertDriverDocument: `INSERT INTO driver_documents (driver_id, document_type, document_number, document_expiry_date, document_url)
VALUES (?, ?, ?, ?, ?)`,

};

module.exports = adminPostQueries;
