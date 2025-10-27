const driverUpdateQueries = {
    updateDriverProfile:  `UPDATE drivers 
       SET firstname = ?, lastname = ?, phone_no = ?, address = ?, 
           city_name = ?, zip_code = ?, year_of_experiance = ?, gender = ?,
           status = 'in_review', updated_at = NOW()
       WHERE driver_id = ? AND is_deleted = 0`,

       updateProfilePhoto: `UPDATE drivers 
       SET profile_image = ?, updated_at = NOW()
       WHERE driver_id = ? AND is_deleted = 0`,

        documentExist: `SELECT driver_document_id FROM driver_documents 
       WHERE driver_id = ? AND document_type = ? AND is_deleted = 0`,

       updateExistingDocument: `UPDATE driver_documents 
         SET document_url = ?, document_number = ?, document_expiry_date = ?, updated_at = NOW()
         WHERE driver_document_id = ?`,

        insertNewDocument: `INSERT INTO driver_documents 
         (driver_id, document_type, document_url, document_number, document_expiry_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,

        updateDriverStatus: `UPDATE drivers SET status = 'in_review', updated_at = NOW() 
       WHERE driver_id = ? AND is_deleted = 0`

};

module.exports = driverUpdateQueries;
