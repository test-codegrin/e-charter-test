const adminGetQueries = {

  getDriverExists: `SELECT * FROM drivers WHERE driver_id = ? AND is_deleted = 0`,

  getAllDrivers: `SELECT 
    d.*,
    COALESCE(ROUND(AVG(dr.rating), 1), 0.0) AS average_rating,
    COUNT(DISTINCT dr.driver_rating_id) AS total_ratings,
    fc.company_name AS fleet_company_name,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'driver_document_id', dd.driver_document_id,
                'document_type', dd.document_type,
                'document_expiry_date', dd.document_expiry_date
            )
        )
        FROM driver_documents dd
        WHERE dd.driver_id = d.driver_id AND dd.is_deleted = 0
    ) AS documents
    FROM drivers d
    LEFT JOIN driver_ratings dr ON d.driver_id = dr.driver_id
    LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id
    WHERE d.is_deleted = 0
    GROUP BY d.driver_id
    ORDER BY d.created_at DESC;
`,


getAllVehicles: `
 SELECT
    v.*,
    CASE 
        WHEN v.fleet_company_id IS NOT NULL 
        THEN JSON_OBJECT(
            'fleet_company_id', fc.fleet_company_id,
            'company_name', fc.company_name,
            'email', fc.email,
            'phone_no', fc.phone_no,
            'address', fc.address,
            'city', fc.city_name,
            'postal_code', fc.postal_code,
            'website', fc.website,
            'profile_image', fc.profile_image,
            'status', fc.status
        )
        ELSE NULL
    END AS fleet_company_details,
    CASE 
        WHEN vf.vehicle_features_id IS NOT NULL THEN
            JSON_OBJECT(
                'vehicle_features_id', vf.vehicle_features_id,
                'has_air_conditioner', vf.has_air_conditioner,
                'has_charging_port', vf.has_charging_port,
                'has_wifi', vf.has_wifi,
                'has_entertainment_system', vf.has_entertainment_system,
                'has_gps', vf.has_gps,
                'has_recliner_seats', vf.has_recliner_seats,
                'is_wheelchair_accessible', vf.is_wheelchair_accessible
            )
        ELSE NULL
    END AS features,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'vehicle_document_id', vd.vehicle_document_id,
                'document_type', vd.document_type,
                'document_number', vd.document_number,
                'document_url', vd.document_url,
                'document_expiry_date', vd.document_expiry_date,
                'is_deleted', vd.is_deleted,
                'created_at', vd.created_at,
                'updated_at', vd.updated_at
            )
        )
        FROM vehicle_documents vd
        WHERE vd.vehicle_id = v.vehicle_id AND vd.is_deleted = 0
    ) AS documents
FROM vehicle v
LEFT JOIN fleet_companies fc ON v.fleet_company_id = fc.fleet_company_id
LEFT JOIN vehicle_features vf ON v.vehicle_id = vf.vehicle_id
WHERE v.is_deleted = 0
ORDER BY v.created_at DESC;
`,



  getDriverById: `SELECT 
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
    d.created_at,
    d.updated_at,
    COALESCE(AVG(dr.rating), 0) AS average_rating,
    COUNT(DISTINCT dr.driver_rating_id) AS total_ratings,
    -- Documents handling with NULL check
    CASE 
        WHEN COUNT(dd.driver_document_id) > 0 THEN
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'driver_document_id', dd.driver_document_id,
                    'document_type', dd.document_type,
                    'document_number', dd.document_number,
                    'document_expiry_date', dd.document_expiry_date,
                    'document_url', dd.document_url
                )
            )
        ELSE NULL
    END AS documents,
    -- Ratings subquery
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'driver_rating_id', dr2.driver_rating_id,
                'trip_id', dr2.trip_id,
                'rating', dr2.rating,
                'review', dr2.review,
                'created_at', dr2.created_at
            )
        )
        FROM driver_ratings dr2
        WHERE dr2.driver_id = d.driver_id
    ) AS ratings,
    -- Fleet company details (only for fleet_partner drivers)
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
LEFT JOIN driver_ratings dr ON d.driver_id = dr.driver_id
LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id 
    AND fc.is_deleted = 0
WHERE d.is_deleted = 0 AND d.driver_id = ?
GROUP BY d.driver_id;
`,

  getVehicleById: `SELECT 
    v.*,
    CASE 
          WHEN v.fleet_company_id IS NOT NULL 
          THEN JSON_OBJECT(
              'fleet_company_id', fc.fleet_company_id,
              'company_name', fc.company_name,
              'email', fc.email,
              'phone_no', fc.phone_no,
              'address', fc.address,
              'city', fc.city_name,
              'postal_code', fc.postal_code,
              'website', fc.website,
              'profile_image', fc.profile_image,
              'status', fc.status
          )
          ELSE NULL
      END AS fleet_company_details,
    CASE 
        WHEN COUNT(vf.vehicle_features_id) > 0 THEN
                JSON_OBJECT(
                    'vehicle_features_id', vf.vehicle_features_id,
                    'has_air_conditioner', vf.has_air_conditioner,
                    'has_charging_port', vf.has_charging_port,
                    'has_wifi', vf.has_wifi,
                    'has_entertainment_system', vf.has_entertainment_system,
                    'has_gps', vf.has_gps,
                    'has_recliner_seats', vf.has_recliner_seats,
                    'is_wheelchair_accessible', vf.is_wheelchair_accessible
            )
        ELSE NULL
    END AS features,
    CASE 
        WHEN COUNT(vd.vehicle_document_id) > 0 THEN
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'vehicle_document_id', vd.vehicle_document_id,
                    'document_type', vd.document_type,
                    'document_number', vd.document_number,
                    'document_expiry_date', vd.document_expiry_date,
                    'document_url', vd.document_url,
                    'document_expiry_date', vd.document_expiry_date,
                    'is_delete', vd.is_deleted,
                    'created_at', vd.created_at,
                    'updated_at', vd.updated_at
                )
            )
        ELSE NULL
    END AS documents
FROM vehicle v
LEFT JOIN vehicle_documents vd ON v.vehicle_id = vd.vehicle_id AND (vd.is_deleted = 0 OR vd.is_deleted IS NULL)
LEFT JOIN fleet_companies fc ON v.fleet_company_id = fc.fleet_company_id AND fc.is_deleted = 0
LEFT JOIN vehicle_features vf ON v.vehicle_id = vf.vehicle_id 

WHERE v.is_deleted = 0 AND v.vehicle_id = ?
GROUP BY v.vehicle_id;
`,

  getAllFleetCompanies: `Select * from fleet_companies where is_deleted = 0 order by created_at DESC`,

//   getAllVehicles: `
//   SELECT
//       v.*,
//       fc.company_name AS fleet_company_name,
//       COALESCE(
//           JSON_ARRAYAGG(
//               CASE 
//                   WHEN vd.vehicle_document_id IS NOT NULL 
//                   THEN JSON_OBJECT(
//                       'vehicle_document_id', vd.vehicle_document_id,
//                       'document_type', vd.document_type,
//                       'document_number', vd.document_number,
//                       'document_url', vd.document_url,
//                       'document_expiry_date', vd.document_expiry_date,
//                       'is_delete', vd.is_deleted,
//                       'created_at', vd.created_at,
//                       'updated_at', vd.updated_at
//                   )
//                   ELSE NULL
//               END
//           ), 
//           JSON_ARRAY()
//       ) AS documents
//   FROM vehicle v
//   LEFT JOIN vehicle_document vd ON v.vehicle_id = vd.vehicle_id AND vd.is_deleted = 0
//   LEFT JOIN fleet_companies fc ON v.fleet_company_id = fc.fleet_company_id
//   WHERE v.is_deleted = 0
//   GROUP BY v.vehicle_id
//   ORDER BY v.created_at DESC;
// `,

  getAllUsers: ` SELECT 
    user_id, firstName, lastName, email, phoneNo, created_at 
  FROM users WHERE is_deleted = 0`,

  getAllTrips: `
    SELECT 
      t.trip_id,
      t.user_id,
      t.car_id,
      t.pickupLocation,
      t.dropLocation,
      t.tripStartDate,
      t.tripEndDate,
      t.tripTime,
      t.durationHours,
      t.distance_km,
      t.status,
      COALESCE(t.total_price, 0) as total_price,
      COALESCE(t.base_price, 0) as base_price,
      COALESCE(t.tax_amount, 0) as tax_amount,
      t.service_type,
      t.created_at,
      u.firstName,
      u.lastName,
      u.email as userEmail,
      u.phoneNo as userPhone,
      COALESCE(c.carName, 'Not Assigned') as carName,
      COALESCE(c.carType, 'N/A') as carType,
      COALESCE(d.driverName, 'Not Assigned') as driverName,
      COALESCE(d.phoneNo, 'N/A') as driverPhone
    FROM trips t
    JOIN users u ON t.user_id = u.user_id
    LEFT JOIN car c ON t.car_id = c.car_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    ORDER BY t.created_at DESC
  `,
  getAllUsers: `SELECT user_id, firstName, lastName, email, address, cityName, zipCode, phoneNo, profileImage, created_at FROM users ORDER BY created_at DESC`,

  getDashboardTrips: `
    SELECT 
      t.*,
      u.firstName,
      u.lastName,
      u.email as userEmail
    FROM trips t
    JOIN users u ON t.user_id = u.user_id
    ORDER BY t.created_at DESC
  `,
  getFleetPartnersOnly: `
    SELECT * FROM drivers 
    WHERE registration_type = 'fleet_partner' OR company_name IS NOT NULL
  `,
  getFleetPartnersEnhanced: `
    SELECT 
      driver_id,
      driverName,
      email,
      phoneNo,
      cityName,
      COALESCE(company_name, 'Not Set') as company_name,
      COALESCE(legal_entity_type, 'Not Specified') as legal_entity_type,
      COALESCE(business_address, 'Not Provided') as business_address,
      COALESCE(contact_person_name, 'Not Provided') as contact_person_name,
      COALESCE(contact_person_position, 'Not Provided') as contact_person_position,
      COALESCE(fleet_size, 0) as fleet_size,
      COALESCE(years_experience, 0) as years_experience,
      COALESCE(operating_hours, 'Not Specified') as operating_hours,
      status,
      COALESCE(registration_type, 'individual') as registration_type,
      COALESCE(terms_accepted, 0) as terms_accepted,
      COALESCE(technology_agreement, 0) as technology_agreement,
      COALESCE(created_at, NOW()) as created_at
    FROM drivers 
    WHERE registration_type = 'fleet_partner' OR company_name IS NOT NULL
    ORDER BY created_at DESC
  `,

  getFleetPartnersBasic: `
    SELECT 
      driver_id,
      driverName,
      email,
      phoneNo,
      cityName,
      'Not Set' as company_name,
      'Not Specified' as legal_entity_type,
      'Not Provided' as business_address,
      'Not Provided' as contact_person_name,
      'Not Provided' as contact_person_position,
      0 as fleet_size,
      0 as years_experience,
      'Not Specified' as operating_hours,
      status,
      'fleet_partner' as registration_type,
      1 as terms_accepted,
      1 as technology_agreement,
      NOW() as created_at
    FROM drivers 
    WHERE driver_id > 2
    ORDER BY driver_id DESC
  `,

  getPayoutSummary: `
    SELECT 
      t.trip_id,
      COALESCE(t.total_price, 0) as total_price,
      t.created_at as trip_date,
      d.driver_id,
      d.driverName,
      d.email as driver_email,
      COALESCE(d.registration_type, 'individual') as registration_type,
      COALESCE(d.company_name, d.driverName) as company_name,
      COALESCE(c.carName, 'Unknown Vehicle') as carName,
      u.firstName as customer_first_name,
      u.lastName as customer_last_name,
      CASE 
        WHEN COALESCE(d.registration_type, 'individual') = 'fleet_partner' THEN COALESCE(t.total_price, 0) * 0.15
        ELSE COALESCE(t.total_price, 0) * 0.20
      END as admin_commission,
      CASE 
        WHEN COALESCE(d.registration_type, 'individual') = 'fleet_partner' THEN COALESCE(t.total_price, 0) * 0.85
        ELSE COALESCE(t.total_price, 0) * 0.80
      END as driver_payout
    FROM trips t
    JOIN car c ON t.car_id = c.car_id
    JOIN drivers d ON c.driver_id = d.driver_id
    JOIN users u ON t.user_id = u.user_id
    WHERE t.status = 'completed' AND COALESCE(t.total_price, 0) > 0
    ORDER BY t.created_at DESC
  `,
};


module.exports = adminGetQueries;
