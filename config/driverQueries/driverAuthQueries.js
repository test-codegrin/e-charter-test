const driverAuthQueries = {
  // Existing login query (password check)
  driverLogin: `
    SELECT 
      driver_id, 
      email, 
      password 
    FROM drivers 
    WHERE email = ? AND is_deleted = 0
  `,

  // Existing mail check query - UPDATE THIS
  driverMailCheck: `
    SELECT 
      driver_id,
      email,
      phone_no,
      firstname,
      lastname,
      gender,
      profile_image,
      driver_type,
      fleet_company_id,
      address,
      city_name,
      zip_code,
      year_of_experiance,
      status,
      created_at,
      updated_at
    FROM drivers 
    WHERE email = ? AND is_deleted = 0
  `,

  // NEW: Get fleet company details by ID
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
      created_at
    FROM fleet_companies 
    WHERE fleet_company_id = ? AND is_deleted = 0
  `,

  // NEW: Get driver with fleet company details (alternative - single query)
  getDriverWithFleetCompany: `
    SELECT 
      d.driver_id,
      d.email,
      d.phone_no,
      d.firstname,
      d.lastname,
      d.gender,
      d.profile_image,
      d.driver_type,
      d.fleet_company_id,
      d.address,
      d.city_name,
      d.zip_code,
      d.year_of_experiance,
      d.status,
      d.created_at,
      d.updated_at,
      -- Fleet company details (only if fleet_partner)
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
    WHERE d.email = ? AND d.is_deleted = 0
  `,

  // Check if email exists (for registration)
  checkEmailExists: `
    SELECT driver_id 
    FROM drivers 
    WHERE email = ? AND is_deleted = 0
  `,

  // Register new driver
  registerDriver: `
    INSERT INTO drivers (
      email, 
      password, 
      phone_no, 
      firstname, 
      lastname, 
      gender, 
      driver_type, 
      fleet_company_id,
      address, 
      city_name, 
      zip_code, 
      year_of_experiance,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_review')
  `,

  // Update driver password
  updatePassword: `
    UPDATE drivers 
    SET password = ?, updated_at = NOW() 
    WHERE driver_id = ? AND is_deleted = 0
  `,

  // Get driver by ID
  getDriverById: `
    SELECT 
      driver_id,
      email,
      phone_no,
      firstname,
      lastname,
      profile_image,
      gender,
      driver_type,
      fleet_company_id,
      status
    FROM drivers 
    WHERE driver_id = ? AND is_deleted = 0
  `
};

module.exports = driverAuthQueries;
