const driverDashboardQueries = {
  // Get driver basic info with type
  getDriverInfo: `
    SELECT 
      driver_id,
      driver_type,
      fleet_company_id,
      firstname,
      lastname,
      status,
      email,
      phone_no
    FROM drivers 
    WHERE driver_id = ? AND is_deleted = 0
  `,

  // Get all trips for a driver with full details
  getTripsEnhanced: `
    SELECT 
      t.trip_id,
      t.trip_name,
      t.trip_type,
      t.trip_status,
      t.pickup_location_name,
      t.dropoff_location_name,
      t.pickup_datetime,
      t.total_price,
      t.created_at,
      t.updated_at,
      -- User details
      JSON_OBJECT(
        'user_id', u.user_id,
        'firstname', u.firstname,
        'lastname', u.lastname,
        'email', u.email,
        'phone_no', u.phone_no
      ) AS user_details
    FROM trips t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.driver_id = ?
    ORDER BY t.created_at DESC
  `,

  // Basic trips query (fallback)
  getTripsBasic: `
    SELECT 
      trip_id,
      trip_name,
      trip_type,
      trip_status,
      pickup_location_name,
      dropoff_location_name,
      pickup_datetime,
      total_price,
      created_at,
      updated_at
    FROM trips
    WHERE driver_id = ?
    ORDER BY created_at DESC
  `,

  // Get vehicles by driver ID (for individual drivers)
  getCarsByDriverId: `
    SELECT 
      vehicle_id,
      registration_number,
      maker,
      model,
      vehicle_type,
      number_of_seats,
      car_image,
      status,
      ownership,
      created_at,
      updated_at
    FROM vehicle
    WHERE driver_id = ? AND is_deleted = 0
    ORDER BY created_at DESC
  `,

  // Get fleet company details by ID
  getFleetCompanyById: `
    SELECT 
      fleet_company_id,
      company_name,
      email,
      phone_no,
      profile_image,
      website,
      address,
      city_name,
      postal_code,
      status,
      created_at,
      updated_at
    FROM fleet_companies 
    WHERE fleet_company_id = ? AND is_deleted = 0
  `,

  // Get driver with fleet company details (single query alternative)
  getDriverWithFleetCompany: `
    SELECT 
      d.driver_id,
      d.driver_type,
      d.fleet_company_id,
      d.firstname,
      d.lastname,
      d.status,
      d.email,
      d.phone_no,
      -- Fleet company details
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
    LEFT JOIN fleet_companies fc ON d.fleet_company_id = fc.fleet_company_id 
      AND fc.is_deleted = 0
    WHERE d.driver_id = ? AND d.is_deleted = 0
  `,

  // Get trip statistics for a driver
  getTripStats: `
    SELECT 
      COUNT(*) as total_trips,
      COUNT(CASE WHEN trip_status = 'upcoming' THEN 1 END) as upcoming_trips,
      COUNT(CASE WHEN trip_status = 'running' THEN 1 END) as running_trips,
      COUNT(CASE WHEN trip_status = 'completed' THEN 1 END) as completed_trips,
      COUNT(CASE WHEN trip_status = 'canceled' THEN 1 END) as canceled_trips,
      COALESCE(SUM(CASE WHEN trip_status = 'completed' THEN total_price END), 0) as total_earnings,
      COALESCE(AVG(CASE WHEN trip_status = 'completed' THEN total_price END), 0) as avg_earnings
    FROM trips
    WHERE driver_id = ?
  `,

  // Get monthly trip statistics
  getMonthlyTripStats: `
    SELECT 
      COUNT(*) as this_month_trips,
      COUNT(CASE WHEN trip_status = 'completed' THEN 1 END) as this_month_completed,
      COALESCE(SUM(CASE WHEN trip_status = 'completed' THEN total_price END), 0) as this_month_earnings
    FROM trips
    WHERE driver_id = ?
      AND YEAR(created_at) = YEAR(CURDATE())
      AND MONTH(created_at) = MONTH(CURDATE())
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

  // Get recent trips (last N trips)
  getRecentTrips: `
    SELECT 
      t.trip_id,
      t.trip_name,
      t.trip_type,
      t.trip_status,
      t.pickup_location_name,
      t.dropoff_location_name,
      t.pickup_datetime,
      t.total_price,
      t.created_at,
      -- User details
      JSON_OBJECT(
        'user_id', u.user_id,
        'firstname', u.firstname,
        'lastname', u.lastname,
        'email', u.email,
        'phone_no', u.phone_no
      ) AS user_details,
      -- Vehicle details
      JSON_OBJECT(
        'vehicle_id', v.vehicle_id,
        'registration_number', v.registration_number,
        'maker', v.maker,
        'model', v.model
      ) AS vehicle_details
    FROM trips t
    LEFT JOIN users u ON t.user_id = u.user_id
    LEFT JOIN vehicle v ON t.vehicle_id = v.vehicle_id
    WHERE t.driver_id = ?
    ORDER BY t.created_at DESC
    LIMIT ?
  `
};

module.exports = driverDashboardQueries;
