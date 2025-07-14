const fleetPartnerQueries = {
  checkExistingEmail: `SELECT * FROM drivers WHERE email = ?`,

  insertFleetPartner: `
    INSERT INTO drivers (
      driverName, email, password, address, cityName, zipCord, phoneNo,
      company_name, legal_entity_type, business_address, contact_person_name, 
      contact_person_position, fleet_size, service_areas, operating_hours,
      years_experience, safety_protocols, insurance_policy_number, 
      business_license_number, certifications, client_references, additional_services,
      sustainability_practices, special_offers, communication_channels,
      terms_accepted, technology_agreement, registration_type, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  insertServiceArea: `
    INSERT INTO fleet_service_areas (driver_id, city, province, coverage_radius, is_primary)
    VALUES (?, ?, ?, ?, ?)
  `,

  insertCertification: `
    INSERT INTO fleet_certifications (driver_id, certification_name, issuing_authority, 
                                      certification_number, issue_date, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  insertReference: `
    INSERT INTO fleet_references (driver_id, client_name, client_contact, client_email, 
                                  client_phone, service_period, service_description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,

  insertFleetVehicle: `
    INSERT INTO car (
      driver_id, carName, carNumber, carSize, carType, bus_capacity,
      vehicle_age, vehicle_condition, specialized_services, wheelchair_accessible,
      vehicle_features, maintenance_schedule, insurance_expiry, license_plate_expiry, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  insertFleetDocument: `
    INSERT INTO fleet_documents (driver_id, document_type, document_name, document_url, expiry_date)
    VALUES (?, ?, ?, ?, ?)
  `,

  getFleetPartnerById: `
    SELECT * FROM drivers WHERE driver_id = ? AND registration_type = 'fleet_partner'
  `,

  getServiceAreasByDriver: `SELECT * FROM fleet_service_areas WHERE driver_id = ?`,
  getCertificationsByDriver: `SELECT * FROM fleet_certifications WHERE driver_id = ?`,
  getReferencesByDriver: `SELECT * FROM fleet_references WHERE driver_id = ?`,
  getDocumentsByDriver: `SELECT * FROM fleet_documents WHERE driver_id = ?`,
  getVehiclesByDriver: `SELECT * FROM car WHERE driver_id = ?`,

  getAllFleetPartners: `
    SELECT 
      driver_id, company_name, driverName, email, phoneNo, cityName,
      legal_entity_type, fleet_size, years_experience, status,
      registration_completed, created_at
    FROM drivers 
    WHERE registration_type = 'fleet_partner'
    ORDER BY created_at DESC
  `,



  updateFleetPartnerByAdmin: `
  UPDATE drivers SET
    driverName = ?,
    email = ?,
    phoneNo = ?,
    address = ?,
    cityName = ?,
    zipCord = ?,
    company_name = ?,
    legal_entity_type = ?,
    business_address = ?,
    contact_person_name = ?,
    contact_person_position = ?,
    fleet_size = ?,
    service_areas = ?,
    operating_hours = ?,
    years_experience = ?,
    safety_protocols = ?,
    insurance_policy_number = ?,
    business_license_number = ?,
    certifications = ?,
    client_references = ?,
    additional_services = ?,
    sustainability_practices = ?,
    special_offers = ?,
    communication_channels = ?,
    status = ?
  WHERE driver_id = ?
`

};

module.exports = fleetPartnerQueries;
