const driverGetQueries = {

// Get driver profile with documents
  getDriverProfile: `
    SELECT 
      d.driver_id,
      d.email,
      d.phone_no,
      d.firstname,
      d.lastname,
      d.gender,
      d.driver_type,
      d.fleet_company_id,
      d.address,
      d.city_name,
      d.zip_code,
      d.year_of_experiance,
      d.status,
      d.profile_image,
      d.created_at,
      d.updated_at,
      CONCAT(d.firstname, ' ', d.lastname) AS driverName,
      
      -- Driver Documents
      CASE 
        WHEN COUNT(DISTINCT dd.driver_document_id) > 0 THEN
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'driver_document_id', dd.driver_document_id,
              'document_type', dd.document_type,
              'document_number', dd.document_number,
              'document_expiry_date', dd.document_expiry_date,
              'document_url', dd.document_url,
              'created_at', dd.created_at,
              'updated_at', dd.updated_at
            )
          )
        ELSE NULL
      END AS documents,
      
      -- Fleet Company Details (if fleet_partner)
      CASE 
        WHEN d.driver_type = 'fleet_partner' AND d.fleet_company_id IS NOT NULL THEN
          JSON_OBJECT(
            'fleet_company_id', fc.fleet_company_id,
            'company_name', fc.company_name,
            'email', fc.email,
            'phone_no', fc.phone_no,
            'profile_image', fc.profile_image,
            'website', fc.website,
            'address', fc.address,
            'city_name', fc.city_name,
            'postal_code', fc.postal_code,
            'status', fc.status
          )
        ELSE NULL
      END AS fleet_company_details
      
    FROM drivers d
    LEFT JOIN driver_documents dd ON d.driver_id = dd.driver_id 
      AND (dd.is_deleted = 0 OR dd.is_deleted IS NULL)
    LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id 
      AND fc.is_deleted = 0
    WHERE d.driver_id = ? AND d.is_deleted = 0
    GROUP BY d.driver_id
  `,

  // Get driver ratings
  getDriverRatings: `
    SELECT 
      COALESCE(AVG(rating), 0) as average_rating,
      COUNT(*) as total_ratings,
      COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_ratings
    FROM driver_ratings
    WHERE driver_id = ?
  `
}


module.exports = driverGetQueries;