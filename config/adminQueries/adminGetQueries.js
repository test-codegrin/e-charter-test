const adminGetQueries = {

  getAllDrivers: ` SELECT 
    driver_id, driverName, email, phoneNo, cityName, status, created_at 
  FROM drivers 
  ORDER BY created_at DESC`,

  getAllCars: `SELECT * FROM car ORDER BY created_at DESC`,

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
   getAllUsers : `SELECT user_id, firstName, lastName, email, address, cityName, zipCode, phoneNo, profileImage, created_at FROM users ORDER BY created_at DESC`,


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
  `

}

module.exports = adminGetQueries;