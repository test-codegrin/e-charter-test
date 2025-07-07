const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const fleetPartnerQueries = require("../config/fleetPartnerQueries/fleetPartnerQueries");
const imagekit = require("../config/imagekit");
require("dotenv").config();

// Register Fleet Partner
const registerFleetPartner = asyncHandler(async (req, res) => {
  const {
    // Company Information
    company_name,
    legal_entity_type,
    business_address,
    contact_person_name,
    contact_person_position,
    
    // Contact Information
    driverName, // This will be the main contact person
    email,
    password,
    phoneNo,
    address,
    cityName,
    zipCord,
    
    // Fleet Details
    fleet_size,
    
    // Operational Information
    service_areas,
    operating_hours,
    safety_protocols,
    
    // Insurance and Compliance
    insurance_policy_number,
    business_license_number,
    
    // Experience and Reputation
    years_experience,
    certifications,
    references,
    
    // Additional Information
    additional_services,
    sustainability_practices,
    special_offers,
    
    // Technology and Communication
    communication_channels,
    terms_accepted,
    technology_agreement
  } = req.body;

  // Validation for required fields
  if (!company_name || !legal_entity_type || !business_address || !contact_person_name || 
      !driverName || !email || !password || !phoneNo || !terms_accepted || !technology_agreement) {
    return res.status(400).json({ error: "All required fields must be completed" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check if email already exists
    const [existingDriver] = await db.query(
      fleetPartnerQueries.checkExistingEmail, 
      [email]
    );
    
    if (existingDriver.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert fleet partner with all required information - FIXED column name
    const [result] = await db.query(
    fleetPartnerQueries.insertFleetPartner
    , [
      driverName, email, hashedPassword, address, cityName, zipCord, phoneNo,
      company_name, legal_entity_type, business_address, contact_person_name,
      contact_person_position, fleet_size, JSON.stringify(service_areas), operating_hours,
      years_experience, safety_protocols, insurance_policy_number,
      business_license_number, JSON.stringify(certifications), JSON.stringify(references),
      JSON.stringify(additional_services), sustainability_practices, special_offers,
      JSON.stringify(communication_channels), terms_accepted, technology_agreement,
      'fleet_partner', 0 // Status 0 = pending approval
    ]);

    const driver_id = result.insertId;

    // Insert service areas if provided
    if (service_areas && Array.isArray(service_areas)) {
      for (const area of service_areas) {
        await db.query(
          fleetPartnerQueries.insertServiceArea
          , [driver_id, area.city, area.province, area.radius || 50, area.is_primary || false]);
      }
    }

    // Insert certifications if provided
    if (certifications && Array.isArray(certifications)) {
      for (const cert of certifications) {
        await db.query(
          fleetPartnerQueries.insertCertification
        , [driver_id, cert.name, cert.authority, cert.number, cert.issue_date, cert.expiry_date]);
      }
    }

    // Insert references if provided
    if (references && Array.isArray(references)) {
      for (const ref of references) {
        await db.query(
          fleetPartnerQueries.insertReference
          , [driver_id, ref.name, ref.contact, ref.email, ref.phone, ref.period, ref.description]);
      }
    }

    res.status(201).json({
      message: "Fleet partner registration submitted successfully. Your application is under review.",
      driver_id,
      company_name,
      status: "pending_approval"
    });

  } catch (error) {
    console.error("Fleet partner registration error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Add Fleet Vehicle
const addFleetVehicle = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const {
    carName,
    carNumber,
    carSize,
    carType,
    bus_capacity,
    vehicle_age,
    vehicle_condition,
    specialized_services,
    wheelchair_accessible,
    vehicle_features,
    maintenance_schedule,
    insurance_expiry,
    license_plate_expiry
  } = req.body;

  if (!driver_id || !carName || !carNumber || !carSize || !carType) {
    return res.status(400).json({ message: "All required vehicle fields must be provided" });
  }

  try {
    await db.query(
     fleetPartnerQueries.insertFleetVehicle
    , [
      driver_id, carName, carNumber, carSize, carType, bus_capacity,
      vehicle_age, vehicle_condition, JSON.stringify(specialized_services),
      wheelchair_accessible, JSON.stringify(vehicle_features), maintenance_schedule,
      insurance_expiry, license_plate_expiry, 0 // Status 0 = pending approval
    ]);

    res.status(201).json({
      message: "Fleet vehicle added successfully. Pending approval.",
      vehicle: { carName, carType, carSize, status: "pending_approval" }
    });

  } catch (error) {
    console.error("Error adding fleet vehicle:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Upload Fleet Documents
const uploadFleetDocument = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const { document_type, document_name, expiry_date } = req.body;
  const file = req.file;

  if (!driver_id || !document_type || !document_name || !file) {
    return res.status(400).json({ message: "All document fields are required" });
  }

  try {
    // Upload to ImageKit
    const uploadedDocument = await imagekit.upload({
      file: file.buffer,
      fileName: `${document_name}_${Date.now()}.pdf`,
      folder: "echarter/fleet-documents",
    });

    // Save document info to database
    await db.query(
    fleetPartnerQueries.insertFleetDocument
    , [driver_id, document_type, document_name, uploadedDocument.url, expiry_date]);

    res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        type: document_type,
        name: document_name,
        url: uploadedDocument.url,
        status: "pending_verification"
      }
    });

  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Fleet Partner Profile
const getFleetPartnerProfile = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    // Get fleet partner details
    const [fleetPartner] = await db.query(
    fleetPartnerQueries.getFleetPartnerById
      , [driver_id]);

    if (fleetPartner.length === 0) {
      return res.status(404).json({ message: "Fleet partner not found" });
    }

    const partner = fleetPartner[0];

    // Get service areas
    const [serviceAreas] = await db.query(
      fleetPartnerQueries.getServiceAreasByDriver
    , [driver_id]);

    // Get certifications
    const [certifications] = await db.query(
      fleetPartnerQueries.getCertificationsByDriver,
       [driver_id]);

    // Get references
    const [references] = await db.query(
      fleetPartnerQueries.getReferencesByDriver
    , [driver_id]);

    // Get documents
    const [documents] = await db.query(
      fleetPartnerQueries.getDocumentsByDriver
    , [driver_id]);

    // Get vehicles
    const [vehicles] = await db.query(
      fleetPartnerQueries.getVehiclesByDriver
    , [driver_id]);

    res.status(200).json({
      message: "Fleet partner profile retrieved successfully",
      profile: {
        ...partner,
        service_areas: partner.service_areas ? JSON.parse(partner.service_areas) : [],
        certifications: partner.certifications ? JSON.parse(partner.certifications) : [],
        client_references: partner.client_references ? JSON.parse(partner.client_references) : [],
        additional_services: partner.additional_services ? JSON.parse(partner.additional_services) : [],
        communication_channels: partner.communication_channels ? JSON.parse(partner.communication_channels) : [],
        serviceAreas,
        certifications,
        references,
        documents,
        vehicles
      }
    });

  } catch (error) {
    console.error("Error fetching fleet partner profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Admin: Get All Fleet Partners
const getAllFleetPartners = asyncHandler(async (req, res) => {
  try {
    const [fleetPartners] = await db.query(
      fleetPartnerQueries.getAllFleetPartners
    );

    res.status(200).json({
      message: "Fleet partners retrieved successfully",
      count: fleetPartners.length,
      fleetPartners
    });

  } catch (error) {
    console.error("Error fetching fleet partners:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  registerFleetPartner,
  addFleetVehicle,
  uploadFleetDocument,
  getFleetPartnerProfile,
  getAllFleetPartners
};