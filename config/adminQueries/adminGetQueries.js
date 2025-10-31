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

  getAllDriversByFleetCompany: `SELECT 
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
    WHERE d.is_deleted = 0 and d.driver_type="fleet_partner" and d.fleet_company_id=?
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

 getAllVehiclesByFleetCompany: `
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
  WHERE v.is_deleted = 0 and v.ownership="fleet_company" and v.fleet_company_id=?
  ORDER BY v.created_at DESC;
  `,



getDriverById: `
SELECT 
    d.driver_id,
    d.email,
    d.phone_no,
    d.firstname,
    d.lastname,
    d.profile_image, 
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
    
    -- Dynamic Current Status: On Leave, In Trip, or Available
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM driver_leave_history dlh 
            WHERE dlh.driver_id = d.driver_id 
            AND NOW() BETWEEN dlh.leave_start AND dlh.leave_end
        ) THEN 'On Leave'
        WHEN EXISTS (
            SELECT 1 FROM trips t 
            WHERE t.driver_id = d.driver_id 
            AND t.trip_status IN ('upcoming', 'running')
        ) THEN 'In Trip'
        ELSE 'Available'
    END AS current_status,
    
    -- Driver Leave History
    CASE 
        WHEN COUNT(DISTINCT dlh.driver_leave_id) > 0 THEN
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'driver_leave_id', dlh.driver_leave_id,
                    'leave_start', dlh.leave_start,
                    'leave_end', dlh.leave_end,
                    'leave_reason', dlh.leave_reason,
                    'created_at', dlh.created_at,
                    'updated_at', dlh.updated_at
                )
            )
        ELSE NULL
    END AS leave_history,
    
    -- Documents handling with NULL check
    CASE 
        WHEN COUNT(DISTINCT dd.driver_document_id) > 0 THEN
            JSON_ARRAYAGG(
                DISTINCT JSON_OBJECT(
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
LEFT JOIN driver_leave_history dlh ON d.driver_id = dlh.driver_id
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

getVehicleByDriverId:`SELECT
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
  WHERE v.is_deleted = 0 and v.ownership="individual" and v.driver_id=?
  ORDER BY v.created_at DESC;`,


  getAllFleetCompanies: `SELECT 
    fc.*,
    (SELECT COUNT(v.vehicle_id) from vehicle v where v.ownership="fleet_company" and v.fleet_company_id = fc.fleet_company_id) as total_vehicles,
    (SELECT COUNT(d.driver_id) from drivers d where d.driver_type="fleet_partner" and d.fleet_company_id = fc.fleet_company_id) as total_drivers,
    (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'fleet_company_document_id', fcd.fleet_company_document_id,
                'document_type', fcd.document_type,
                'document_number', fcd.document_number,
                'document_url', fcd.document_url,
                'document_expiry_date', fcd.document_expiry_date,
                'is_deleted', fcd.is_deleted,
                'created_at', fcd.created_at,
                'updated_at', fcd.updated_at
            )
        )
        FROM fleet_company_documents fcd
        WHERE fcd.fleet_company_id = fc.fleet_company_id AND fcd.is_deleted = 0
    ) AS documents
FROM fleet_companies fc 
WHERE fc.is_deleted = 0
ORDER BY fc.created_at DESC;
`,

getFleetCompanyById: `
    SELECT 
      fc.*,
      COALESCE(
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'fleet_company_document_id', fcd.fleet_company_document_id,
              'document_type', fcd.document_type,
              'document_number', fcd.document_number,
              'document_url', fcd.document_url,
              'document_expiry_date', fcd.document_expiry_date,
              'is_deleted', fcd.is_deleted,
              'created_at', fcd.created_at,
              'updated_at', fcd.updated_at
            )
          )
          FROM fleet_company_documents fcd
          WHERE fcd.fleet_company_id = fc.fleet_company_id AND fcd.is_deleted = 0
        ),
        JSON_ARRAY()
      ) AS documents,
      COALESCE(
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'fleet_company_contact_person_id', fccp.fleet_company_contact_person_id,
              'fullname', fccp.fullname,
              'email', fccp.email,
              'phone_no', fccp.phone_no,
              'is_deleted', fccp.is_deleted,
              'created_at', fccp.created_at,
              'updated_at', fccp.updated_at
            )
          )
          FROM fleet_company_contact_person fccp
          WHERE fccp.fleet_company_id = fc.fleet_company_id AND fccp.is_deleted = 0
        ),
        JSON_ARRAY()
      ) AS contact_person
    FROM fleet_companies fc 
    WHERE fc.fleet_company_id = ? AND fc.is_deleted = 0
  `,

getAllTrips: `
   SELECT 
  t.*,
  
  -- Trip-specific rating (for THIS trip only)
  trip_dr.rating AS trip_rating,
  trip_dr.review AS trip_review,
  trip_dr.created_at AS rating_created_at,
  
  -- User details
  u.firstname AS user_firstname,
  u.lastname AS user_lastname,
  u.email AS user_email,
  u.phone_no AS user_phone,
  
  -- Driver details
  d.firstname AS driver_firstname,
  d.lastname AS driver_lastname,
  d.email AS driver_email,
  d.phone_no AS driver_phone,
  d.driver_type,
  
  -- Driver's average rating (across all trips)
  (
    SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
    FROM driver_ratings
    WHERE driver_id = d.driver_id
  ) AS driver_average_rating,
  
  -- Vehicle details
  v.maker AS vehicle_maker,
  v.model AS vehicle_model,
  v.registration_number,
  v.vehicle_type,
  v.number_of_seats,
  v.fuel_type,
  v.car_image,
  
  -- Fleet company details (if driver is fleet_partner)
  fc.company_name AS fleet_company_name,
  fc.fleet_company_id,
  
  -- Trip stops (for multi-stop trips)
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'trip_stop_id', ts.trip_stop_id,
        'stop_location_name', ts.stop_location_name,
        'stop_location_latitude', ts.stop_location_latitude,
        'stop_location_longitude', ts.stop_location_longitude,
        'stop_order', ts.stop_order,
        'stop_date', ts.stop_date
      )
    )
    FROM trip_stops ts
    WHERE ts.trip_id = t.trip_id
    ORDER BY ts.stop_order ASC
  ) AS stops
  
FROM trips t
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN drivers d ON t.driver_id = d.driver_id
LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id
-- Join for THIS TRIP's specific rating
LEFT JOIN driver_ratings trip_dr ON trip_dr.trip_id = t.trip_id
ORDER BY t.created_at DESC

  `,

getTripById: `
    SELECT 
  t.*,
  -- Trip-specific rating and review
  trip_dr.rating as trip_rating,
  trip_dr.review as trip_review,
  trip_dr.created_at as rating_created_at,
  
  -- User details as JSON object
  JSON_OBJECT(
    'user_id', u.user_id,
    'firstname', u.firstname,
    'lastname', u.lastname,
    'email', u.email,
    'phone_no', u.phone_no
  ) AS user_details,
  
  -- Driver details as JSON object with average rating
  JSON_OBJECT(
    'driver_id', d.driver_id,
    'firstname', d.firstname,
    'lastname', d.lastname,
    'email', d.email,
    'phone_no', d.phone_no,
    'driver_type', d.driver_type,
    'average_rating', (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM driver_ratings
      WHERE driver_id = d.driver_id
    ),
    'total_rating',(SELECT COUNT(*) FROM driver_ratings WHERE driver_id = d.driver_id),
    'year_of_experiance', d.year_of_experiance
  ) AS driver_details,
  
  -- Vehicle details as JSON object
  JSON_OBJECT(
    'vehicle_id', v.vehicle_id,
    'maker', v.maker,
    'model', v.model,
    'registration_number', v.registration_number,
    'vehicle_type', v.vehicle_type,
    'number_of_seats', v.number_of_seats,
    'fuel_type', v.fuel_type,
    'car_image', v.car_image
  ) AS vehicle_details,
  
  -- Fleet company details as JSON object
  JSON_OBJECT(
    'fleet_company_id', fc.fleet_company_id,
    'company_name', fc.company_name,
    'email', fc.email,
    'phone_no', fc.phone_no
  ) AS fleet_company_details,
  
  -- Payment transaction details as JSON object
  JSON_OBJECT(
    'transaction_id', pt.transaction_id,
    'payment_gateway', pt.payment_gateway,
    'card_number', pt.card_number,
    'gateway_transaction_id', pt.gateway_transaction_id,
    'amount', pt.amount,
    'currency', pt.currency,
    'gateway_response', pt.gateway_response,
    'processed_at', pt.processed_at,
    'created_at', pt.created_at
  ) AS payment_transaction,
  
  -- Trip stops
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'trip_stop_id', ts.trip_stop_id,
        'stop_location_name', ts.stop_location_name,
        'stop_location_latitude', ts.stop_location_latitude,
        'stop_location_longitude', ts.stop_location_longitude,
        'stop_order', ts.stop_order,
        'stop_date', ts.stop_date
      )
    )
    FROM trip_stops ts
    WHERE ts.trip_id = t.trip_id
    ORDER BY ts.stop_order ASC
  ) AS stops
  
FROM trips t
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN drivers d ON t.driver_id = d.driver_id
LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id
LEFT JOIN user_payment_transactions pt ON t.trip_id = pt.trip_id
-- Join for THIS TRIP's specific rating
LEFT JOIN driver_ratings trip_dr ON trip_dr.trip_id = t.trip_id
WHERE t.trip_id = ?
  `,

getTripByDriver: `
    SELECT 
  t.*,
  
  -- Trip-specific rating and review
  trip_dr.rating AS trip_rating,
  trip_dr.review AS trip_review,
  trip_dr.created_at AS rating_created_at,
  
  -- User details as JSON object
  JSON_OBJECT(
    'user_id', u.user_id,
    'firstname', u.firstname,
    'lastname', u.lastname,
    'email', u.email,
    'phone_no', u.phone_no
  ) AS user_details,
  
  -- Driver details as JSON object with BOTH average and trip-specific rating
  JSON_OBJECT(
    'driver_id', d.driver_id,
    'firstname', d.firstname,
    'lastname', d.lastname,
    'email', d.email,
    'phone_no', d.phone_no,
    'driver_type', d.driver_type,
    'average_rating', (
      SELECT COALESCE(ROUND(AVG(rating), 1), 0.0)
      FROM driver_ratings
      WHERE driver_id = d.driver_id
    ),
    'trip_rating', trip_dr.rating,
    'trip_review', trip_dr.review,
    'year_of_experiance', d.year_of_experiance
  ) AS driver_details,
  
  -- Vehicle details as JSON object
  JSON_OBJECT(
    'vehicle_id', v.vehicle_id,
    'maker', v.maker,
    'model', v.model,
    'registration_number', v.registration_number,
    'vehicle_type', v.vehicle_type,
    'number_of_seats', v.number_of_seats,
    'fuel_type', v.fuel_type,
    'car_image', v.car_image
  ) AS vehicle_details,
  
  -- Fleet company details as JSON object
  JSON_OBJECT(
    'fleet_company_id', fc.fleet_company_id,
    'company_name', fc.company_name,
    'email', fc.email,
    'phone_no', fc.phone_no
  ) AS fleet_company_details,
  
  -- Payment transaction details as JSON object
  JSON_OBJECT(
    'transaction_id', pt.transaction_id,
    'payment_gateway', pt.payment_gateway,
    'card_number', pt.card_number,
    'gateway_transaction_id', pt.gateway_transaction_id,
    'amount', pt.amount,
    'currency', pt.currency,
    'gateway_response', pt.gateway_response,
    'processed_at', pt.processed_at,
    'created_at', pt.created_at
  ) AS payment_transaction,
  
  -- Trip stops
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'trip_stop_id', ts.trip_stop_id,
        'stop_location_name', ts.stop_location_name,
        'stop_location_latitude', ts.stop_location_latitude,
        'stop_location_longitude', ts.stop_location_longitude,
        'stop_order', ts.stop_order,
        'stop_date', ts.stop_date
      )
    )
    FROM trip_stops ts
    WHERE ts.trip_id = t.trip_id
    ORDER BY ts.stop_order ASC
  ) AS stops
  
FROM trips t
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN drivers d ON t.driver_id = d.driver_id
LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id
LEFT JOIN user_payment_transactions pt ON t.trip_id = pt.trip_id
-- Join for THIS TRIP's specific rating
LEFT JOIN driver_ratings trip_dr ON trip_dr.trip_id = t.trip_id
WHERE t.driver_id = ?
ORDER BY t.created_at DESC
  `,
};


module.exports = adminGetQueries;
