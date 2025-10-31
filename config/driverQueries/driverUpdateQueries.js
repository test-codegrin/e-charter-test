const driverUpdateQueries = {
    updateDriverProfile: `UPDATE drivers 
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

    updateDriverStatus: `UPDATE drivers SET status = 'in_review', status_description = 'Document Updated', updated_at = NOW() 
       WHERE driver_id = ? AND is_deleted = 0`,


    updateExistingVehicleDocument: `UPDATE vehicle_documents 
         SET document_url = ?, document_number = ?, document_expiry_date = ?, updated_at = NOW()
         WHERE vehicle_document_id = ?`,

    insertNewVehicleDocument: `INSERT INTO vehicle_documents 
         (vehicle_id, document_type, document_url, document_number, document_expiry_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,

    updateVehicleStatus: `UPDATE vehicle 
                        SET 
                        status = 'in_review', 
                        status_description = CONCAT(IFNULL(status_description, ''), ',', ?) ,
                        updated_at = NOW() 
                        WHERE 
                        vehicle_id = ? 
                        AND is_deleted = 0;
`,

    // Check if vehicle features exist
    checkVehicleFeatures: `
    SELECT vehicle_features_id 
    FROM vehicle_features 
    WHERE vehicle_id = ?
  `,

    checkVehicleDriver: `
   SELECT vehicle_id, driver_id 
       FROM vehicle
       WHERE vehicle_id = ? AND driver_id = ? AND is_deleted = 0
  `,

    // Insert new vehicle features
    insertVehicleFeatures: `
    INSERT INTO vehicle_features (
      vehicle_id,
      has_air_conditioner,
      has_charging_port,
      has_wifi,
      has_entertainment_system,
      has_gps,
      has_recliner_seats,
      is_wheelchair_accessible
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,

    // Update existing vehicle features
    updateVehicleFeatures: `
    UPDATE vehicle_features 
    SET has_air_conditioner = ?,
        has_charging_port = ?,
        has_wifi = ?,
        has_entertainment_system = ?,
        has_gps = ?,
        has_recliner_seats = ?,
        is_wheelchair_accessible = ?
    WHERE vehicle_id = ?
  `,

    updateVehicleImage: `UPDATE vehicle 
    SET car_image = ?, updated_at = NOW()
    WHERE vehicle_id = ? AND is_deleted = 0
  `,
};

module.exports = driverUpdateQueries;
