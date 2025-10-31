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
  `,


// Get driver trips
getTripsByDriver:`
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
where d.driver_id = ?
ORDER BY t.created_at DESC;`,

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
  
}
module.exports = driverGetQueries;