const {db} = require("../config/db");
const asyncHandler = require("express-async-handler");
const adminGetQueries = require("../config/adminQueries/adminGetQueries");
const dashboardGetQueries = require("../config/dashboardQueries/dashboardGetQueries");
const adminDeleteQueries = require("../config/adminQueries/adminDeleteQueries");
const adminUpdateQueries = require("../config/adminQueries/adminUpdateQueries");
const fleetPartnerQueries = require("../config/fleetPartnerQueries/fleetPartnerQueries");
const imagekit = require("../config/imagekit");

// GET 

const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        const [drivers] = await db.query(adminGetQueries.getAllDrivers);

        // Parse documents JSON for each driver
        const parsedDrivers = drivers.map(driver => ({
            ...driver,
            documents: driver.documents ? JSON.parse(driver.documents) : null
        }));

        res.status(200).json({
            message: "Drivers fetched successfully",
            count: parsedDrivers.length,
            drivers: parsedDrivers
        });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

const getDriverById = asyncHandler(async (req, res) => {
    const { driver_id } = req.params;
    
    if (!driver_id) {
        return res.status(400).json({ message: "Driver ID is required" });
    }
    
    try {
        const [driver] = await db.query(adminGetQueries.getDriverById, [driver_id]);
        
        if (driver.length === 0) {
            return res.status(404).json({ message: "Driver not found" });
        }
        
        // Parse JSON strings to actual JSON objects
        const parsedDriver = {
            ...driver[0],
            average_rating: parseFloat(driver[0].average_rating),
            // Handle documents - return null if no documents, otherwise parse
            documents: driver[0].documents ? JSON.parse(driver[0].documents) : null,
            // Handle ratings - return empty array if no ratings, otherwise parse
            ratings: driver[0].ratings ? JSON.parse(driver[0].ratings) : [],
            // Handle fleet company details - return null if not fleet partner, otherwise parse
            fleet_company_details: driver[0].fleet_company_details 
                ? JSON.parse(driver[0].fleet_company_details) 
                : null
        };
        
        res.status(200).json({
            message: "Driver fetched successfully",
            driver: parsedDriver
        });
    } catch (error) {
        console.error("Error fetching driver:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
});

const getVehicleById = asyncHandler(async (req, res) => {
    const { vehicle_id } = req.params;
    
    if (!vehicle_id) {
        return res.status(400).json({ message: "Vehicle ID is required" });
    }
    
    try {
        const [vehicle] = await db.query(adminGetQueries.getVehicleById, [vehicle_id]);
        
        if (vehicle.length === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        
        // Parse JSON strings to actual JSON objects
        const parsedVehicle = {
            ...vehicle[0],
            documents: vehicle[0].documents ? JSON.parse(vehicle[0].documents) : null,
            features: vehicle[0].features ? JSON.parse(vehicle[0].features) : null,
            fleet_company_details: vehicle[0].fleet_company_details 
                ? JSON.parse(vehicle[0].fleet_company_details) 
                : null
        };
        
        res.status(200).json({
            message: "Vehicle fetched successfully",
            vehicle: parsedVehicle
        });
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
});

const getAllFleetCompanies= asyncHandler(async (req, res) => {
  try {
    const [companies] = await db.query(adminGetQueries.getAllFleetCompanies);
    res.status(200).json({
      message: "All fleet companies fetched successfully",
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getAllVehicles = asyncHandler(async (req, res) => {
  try {
    const [vehicles] = await db.query(adminGetQueries.getAllVehicles);
    
    // Parse JSON fields and handle null documents properly
    const parsedVehicles = vehicles.map(vehicle => {
      // Parse documents - handle null or empty cases
      let documents = [];
      if (vehicle.documents) {
        try {
          const parsedDocs = JSON.parse(vehicle.documents);
          // Filter out null values and ensure it's an array
          documents = Array.isArray(parsedDocs) 
            ? parsedDocs.filter(doc => doc !== null) 
            : [];
        } catch (e) {
          console.error('Error parsing documents for vehicle:', vehicle.vehicle_id);
          documents = [];
        }
      }

      // Parse fleet company details
      let fleetCompanyDetails = null;
      if (vehicle.fleet_company_details) {
        try {
          fleetCompanyDetails = JSON.parse(vehicle.fleet_company_details);
        } catch (e) {
          console.error('Error parsing fleet company details for vehicle:', vehicle.vehicle_id);
        }
      }

      // Parse features
      let features = null;
      if (vehicle.features) {
        try {
          features = JSON.parse(vehicle.features);
        } catch (e) {
          console.error('Error parsing features for vehicle:', vehicle.vehicle_id);
        }
      }

      return {
        ...vehicle,
        documents,
        features,
        fleet_company_details: fleetCompanyDetails
      };
    });

    res.status(200).json({
      message: "All vehicles fetched successfully",
      count: parsedVehicles.length,
      vehicles: parsedVehicles
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});




// DELETE

const deleteDriver = asyncHandler(async (req, res) => {
  try {
    const { driver_id } = req.params;
    const [result] = await db.query(adminDeleteQueries.deleteDriverById, [driver_id]);
    res.status(200).json({
      message: "Driver deleted successfully",
      result,
      driver_id,
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const deleteVehicle = asyncHandler(async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const [result] = await db.query(adminDeleteQueries.deleteVehicleById, [vehicle_id]);
    res.status(200).json({
      message: "Vehicle deleted successfully",
      result,
      vehicle_id,
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});






// Get all trips for admin dashboard - FIXED with proper data formatting
const getAllTrips = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all trips for admin...");
    
    // Enhanced query with better error handling and data formatting
    const [trips] = await db.query(adminGetQueries.getAllTrips);

    // Ensure all numeric fields are properly formatted
    const formattedTrips = trips.map(trip => ({
      ...trip,
      total_price: parseFloat(trip.total_price) || 0,
      base_price: parseFloat(trip.base_price) || 0,
      tax_amount: parseFloat(trip.tax_amount) || 0,
      distance_km: parseFloat(trip.distance_km) || 0,
      durationHours: parseFloat(trip.durationHours) || 0
    }));

    console.log(`Found ${formattedTrips.length} trips`);

    res.status(200).json({
      message: "All trips fetched successfully",
      count: formattedTrips.length,
      trips: formattedTrips
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const [users] = await db.query(adminGetQueries.getAllUsers);

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // First delete all trips for the user
    await db.query(adminDeleteQueries.deleteTripsById, [user_id]);

    // Then delete the user
    const [result] = await db.query(adminDeleteQueries.deleteUserById, [user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User and related trips deleted successfully",
      user_id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});


const editUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const {
    firstName,
    lastName,
    email,
    address,
    cityName,
    zipCode,
    phoneNo
  } = req.body;

  if (!firstName || !lastName || !email || !phoneNo) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [result] = await db.query(adminUpdateQueries.updateUserDetails, [
      firstName,
      lastName,
      email,
      address,
      cityName,
      zipCode,
      phoneNo,
      user_id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user_id,
      updatedFields: {
        firstName,
        lastName,
        email,
        address,
        cityName,
        zipCode,
        phoneNo
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get dashboard statistics for admin - ENHANCED with proper data formatting
const getDashboardStats = asyncHandler(async (req, res) => {
  try { 
    // Execute the dashboard stats query
    const [statsRows] = await db.query(dashboardGetQueries.getDashboardStats);
    
    // Get the first row which contains all the counts
    const statsData = statsRows[0];
    
    const stats = {
      totalDrivers: statsData.total_drivers,
      totalVehicles: statsData.total_vehicles,
      
      // Driver stats
      approvedDrivers: statsData.approved_drivers,
      pendingDrivers: statsData.pending_drivers,
      
      // Vehicle stats
      approvedVehicles: statsData.approved_vehicles,
      pendingVehicles: statsData.pending_vehicles,
      
      // Pending approvals
      pendingApprovals: statsData.pending_drivers + statsData.pending_vehicles
    };

    console.log("Dashboard stats calculated successfully");

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



// Get all fleet partners for admin - FIXED with proper column handling
const getAllFleetPartners = asyncHandler(async (req, res) => {
  try {
    
    // First check if the enhanced columns exist
    const [columnCheck] = await db.query(`
      SHOW COLUMNS FROM drivers LIKE 'created_at'
    `);

    let query;
    if (columnCheck.length > 0) {
      // Enhanced query if columns exist
      query = adminGetQueries.getFleetPartnersEnhanced;
    } else {
      // Fallback query for basic structure
      query = adminGetQueries.getFleetPartnersBasic;
    }

    const [fleetPartners] = await db.query(query);

    console.log(`Found ${fleetPartners.length} fleet partners`);

    res.status(200).json({
      message: "Fleet partners fetched successfully",
      count: fleetPartners.length,
      fleetPartners
    });

  } catch (error) {
    console.error("Error fetching fleet partners:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const deleteFleetPartnerByAdmin = asyncHandler(async (req, res) => {
  const { company_id } = req.params;

  if (!company_id) {
    return res.status(400).json({ message: "Company ID is required" });
  }

  try {
    const [company] = await db.query(fleetPartnerQueries.getFleetCompanyById, [company_id]);
    if (company.length === 0) {
      return res.status(404).json({ message: "Fleet partner not found" });
    }

    const [drivers] = await db.query(fleetPartnerQueries.getDriversByCompanyId, [company_id]);
    const driverIds = drivers.map((d) => d.driver_id);

    for (const driver_id of driverIds) {
      const [cars] = await db.query(fleetPartnerQueries.getCarsByDriverId, [driver_id]);
      
      for (const car of cars) {
        const car_id = car.car_id;

        await db.query(fleetPartnerQueries.deleteTripsByCarId, [car_id]);

        await db.query(fleetPartnerQueries.deleteCarById, [car_id]);
      }

      await db.query(fleetPartnerQueries.deleteFleetCertifications, [driver_id]);
      await db.query(fleetPartnerQueries.deleteFleetDocuments, [driver_id]);
      await db.query(fleetPartnerQueries.deleteFleetReferences, [driver_id]);
      await db.query(fleetPartnerQueries.deleteFleetServiceAreas, [driver_id]);

      await db.query(fleetPartnerQueries.deleteDriver, [driver_id]);
    }

    await db.query(fleetPartnerQueries.deleteFleetCompany, [company_id]);

    res.status(200).json({
      message: "Fleet partner and all related drivers, cars, and trips deleted successfully.",
      company_id,
      deleted_drivers: driverIds,
    });
  } catch (error) {
    console.error("Error deleting fleet partner:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});


// Admin: Edit Fleet Partner
const editFleetPartnerByAdmin = asyncHandler(async (req, res) => {
  const { driver_id } = req.params;

  const {
    driverName,
    email,
    phoneNo,
    address,
    cityName,
    zipCode,
    company_name,
    legal_entity_type,
    business_address,
    contact_person_name,
    contact_person_position,
    fleet_size,
    service_areas,
    operating_hours,
    safety_protocols,
    insurance_policy_number,
    business_license_number,
    years_experience,
    certifications,
    references,
    additional_services,
    sustainability_practices,
    special_offers,
    communication_channels,
    status
  } = req.body;

  if (!driver_id) {
    return res.status(400).json({ message: "Driver ID is required" });
  }

  // Helper to safely stringify optional fields
  const safeStringify = (value) => JSON.stringify(value || []);

  try {
    // Check if the fleet partner exists
    const [existing] = await db.query(fleetPartnerQueries.getFleetPartnerById, [driver_id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Fleet partner not found" });
    }

    // Update fleet partner data
    await db.query(fleetPartnerQueries.updateFleetPartnerByAdmin, [
      driverName || "",
      email || "",
      phoneNo || "",
      address || "",
      cityName || "",
      zipCode || "",
      company_name || "",
      legal_entity_type || "",
      business_address || "",
      contact_person_name || "",
      contact_person_position || "",
      fleet_size || 0,
      safeStringify(service_areas),
      operating_hours || "",
      years_experience || 0,
      safety_protocols || "",
      insurance_policy_number || "",
      business_license_number || "",
      safeStringify(certifications),
      safeStringify(references),
      safeStringify(additional_services),
      sustainability_practices || "",
      special_offers || "",
      safeStringify(communication_channels),
      status ?? 0, // use 0 as default if undefined
      driver_id
    ]);

    res.status(200).json({
      message: "Fleet partner profile updated successfully",
      driver_id,
      status
    });

  } catch (error) {
    console.error("Error updating fleet partner:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// Get payout summary for admin - FIXED with proper data formatting
const getPayoutSummary = asyncHandler(async (req, res) => {
  try {    
    // Get completed trips with driver/fleet partner info
    const [payoutData] = await db.query(adminGetQueries.getPayoutSummary);

    // Calculate summary statistics with proper number handling
    const totalRevenue = payoutData.reduce((sum, trip) => {
      return sum + (parseFloat(trip.total_price) || 0);
    }, 0);
    
    const totalCommission = payoutData.reduce((sum, trip) => {
      return sum + (parseFloat(trip.admin_commission) || 0);
    }, 0);
    
    const totalPayouts = payoutData.reduce((sum, trip) => {
      return sum + (parseFloat(trip.driver_payout) || 0);
    }, 0);

    // Group by driver for payout summary
    const driverPayouts = {};
    payoutData.forEach(trip => {
      const driverId = trip.driver_id;
      if (!driverPayouts[driverId]) {
        driverPayouts[driverId] = {
          driver_id: driverId,
          driverName: trip.driverName,
          email: trip.driver_email,
          registration_type: trip.registration_type,
          company_name: trip.company_name,
          total_trips: 0,
          total_earnings: 0,
          total_payout: 0,
          commission_rate: trip.registration_type === 'fleet_partner' ? 15 : 20
        };
      }
      driverPayouts[driverId].total_trips += 1;
      driverPayouts[driverId].total_earnings += parseFloat(trip.total_price) || 0;
      driverPayouts[driverId].total_payout += parseFloat(trip.driver_payout) || 0;
    });

    // Format the response data properly
    const formattedPayoutData = payoutData.map(trip => ({
      ...trip,
      total_price: parseFloat(trip.total_price) || 0,
      admin_commission: parseFloat(trip.admin_commission) || 0,
      driver_payout: parseFloat(trip.driver_payout) || 0
    }));

    res.status(200).json({
      message: "Payout summary fetched successfully",
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        totalPayouts: parseFloat(totalPayouts.toFixed(2)),
        totalTrips: payoutData.length
      },
      driverPayouts: Object.values(driverPayouts).map(driver => ({
        ...driver,
        total_earnings: parseFloat(driver.total_earnings.toFixed(2)),
        total_payout: parseFloat(driver.total_payout.toFixed(2))
      })),
      recentPayouts: formattedPayoutData.slice(0, 20)
    });

  } catch (error) {
    console.error("Error fetching payout summary:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
    getAllDrivers,
    getDriverById,
    getAllVehicles,
    getVehicleById,
    getAllTrips,
    getAllUsers,
    deleteUser,
    deleteDriver,
    deleteVehicle,
    editUser,
    getDashboardStats,
    getAllFleetCompanies,
    getAllFleetPartners,
    editFleetPartnerByAdmin,
    deleteFleetPartnerByAdmin,
    getPayoutSummary
}