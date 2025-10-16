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

const getAllFleetCompanies = asyncHandler(async (req, res) => {
  try {
    const [companies] = await db.query(adminGetQueries.getAllFleetCompanies);
    
    // Parse JSON fields for each company
    const parsedCompanies = companies.map(company => {
      // Parse documents - handle null or empty cases
      let documents = [];
      if (company.documents) {
        try {
          const parsedDocs = JSON.parse(company.documents);
          // Filter out null values and ensure it's an array
          documents = Array.isArray(parsedDocs) 
            ? parsedDocs.filter(doc => doc !== null) 
            : [];
        } catch (e) {
          console.error('Error parsing documents for company:', company.fleet_company_id);
          documents = [];
        }
      }

      return {
        ...company,
        documents
      };
    });

    res.status(200).json({
      message: "All fleet companies fetched successfully",
      count: parsedCompanies.length,
      companies: parsedCompanies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getFleetCompanyById = asyncHandler(async (req, res) => {
  try {
    const { fleet_company_id } = req.params;

    console.log('Fetching fleet company with ID:', fleet_company_id);
    
    const [companies] = await db.query(
      adminGetQueries.getFleetCompanyById, 
      [fleet_company_id]
    );
    
    console.log('Query result:', companies);

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: "Fleet company not found" });
    }

    const company = companies[0];

    // Parse documents - FIXED NULL HANDLING
    let documents = [];
    if (company.documents && company.documents !== null) {
      try {
        // Check if it's already an array or needs parsing
        if (typeof company.documents === 'string') {
          const parsedDocs = JSON.parse(company.documents);
          documents = Array.isArray(parsedDocs) 
            ? parsedDocs.filter(doc => doc !== null) 
            : [];
        } else if (Array.isArray(company.documents)) {
          documents = company.documents.filter(doc => doc !== null);
        }
      } catch (e) {
        console.error('Error parsing documents:', e);
        documents = [];
      }
    }

    let contact_person = [];
    if (company.contact_person && company.contact_person !== null) {
      try {
        // Check if it's already an array or needs parsing
        if (typeof company.contact_person === 'string') {
          const parsedDocs = JSON.parse(company.contact_person);
          contact_person = Array.isArray(parsedDocs) 
            ? parsedDocs.filter(doc => doc !== null) 
            : [];
        } else if (Array.isArray(company.contact_person)) {
          contact_person = company.contact_person.filter(doc => doc !== null);
        }
      } catch (e) {
        console.error('Error parsing contact person:', e);
        contact_person = [];
      }
    }

    res.status(200).json({
      message: "Fleet company fetched successfully",
      company: {
        ...company,
        documents,
        contact_person
      }
    });
  } catch (error) {
    console.error("Error fetching fleet company:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

const deleteFleetCompany = asyncHandler(async (req, res) => {
  try {
    const { fleet_company_id } = req.params;

    // Check if company exists
    const [companies] = await db.query(
      adminDeleteQueries.deleteFleetCompany,
      [fleet_company_id]
    );

    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: "Fleet company not found" });
    }

    // Soft delete
    await db.query(
      adminGetQueries.deleteFleetCompany, 
      [fleet_company_id]
    );

    res.status(200).json({
      message: "Fleet company deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting fleet company:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


const getAllVehiclesByFleetCompany = asyncHandler(async (req, res) => {
  try {
    const { fleet_company_id } = req.params;
    const [vehicles] = await db.query(adminGetQueries.getAllVehiclesByFleetCompany, [fleet_company_id]);
    
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

const getAllDriversByFleetCompany = asyncHandler(async (req, res) => {
    try {
        const { fleet_company_id } = req.params;
        const [drivers] = await db.query(adminGetQueries.getAllDriversByFleetCompany, [fleet_company_id]);

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

const getVehicleByDriverId = asyncHandler(async (req, res) => {
    try {
        const { driver_id } = req.params;
        const [vehicles] = await db.query(adminGetQueries.getVehicleByDriverId, [driver_id]);

        // Parse documents JSON for each vehicle
        const parsedVehicles = vehicles.map(vehicle => ({
            ...vehicle,
            documents: vehicle.documents ? JSON.parse(vehicle.documents) : null,
            features: vehicle.features ? JSON.parse(vehicle.features) : null
        }));

        res.status(200).json({
            message: "Vehicles fetched successfully",
            count: parsedVehicles.length,
            vehicles: parsedVehicles
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
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



const getAllTrips = async (req, res) => {
  try {
    const { 
      status, 
      payment_status, 
      trip_type, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build dynamic query based on filters
    let query = adminGetQueries.getAllTrips;
    let countQuery = 'SELECT COUNT(*) as total FROM trips t';
    const queryParams = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push('t.trip_status = ?');
      queryParams.push(status);
    }

    if (payment_status) {
      whereConditions.push('t.payment_status = ?');
      queryParams.push(payment_status);
    }

    if (trip_type) {
      whereConditions.push('t.trip_type = ?');
      queryParams.push(trip_type);
    }

    // Add WHERE clause if filters exist
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query = query.replace('GROUP BY t.trip_id', whereClause + ' GROUP BY t.trip_id');
      countQuery += whereClause;
    }

    // Get total count
    const [countResult] = await db.query(countQuery, queryParams);
    const totalTrips = countResult[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    // Execute query
    const [trips] = await db.query(query, queryParams);

    // Parse JSON fields
    trips.forEach(trip => {
      if (trip.stops) {
        trip.stops = JSON.parse(trip.stops) || [];
      } else {
        trip.stops = [];
      }
    });

    res.status(200).json({
      message: 'Trips fetched successfully',
      total: totalTrips,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalTrips / limit),
      trips: trips
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      message: 'Failed to fetch trips',
      error: error.message
    });
  }
};

const getTripById = async (req, res) => {
  try {
    const { trip_id } = req.params;

    const [result] = await db.query(adminGetQueries.getTripById, [trip_id]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const trip = result[0];

    // Parse JSON objects
    trip.user_details = JSON.parse(trip.user_details);
    trip.driver_details = JSON.parse(trip.driver_details);
    trip.vehicle_details = JSON.parse(trip.vehicle_details);
    trip.payment_transaction = JSON.parse(trip.payment_transaction);
    trip.fleet_company_details = JSON.parse(trip.fleet_company_details);
    trip.stops = JSON.parse(trip.stops) || [];

    res.status(200).json({
      message: 'Trip fetched successfully',
      trip: trip
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      message: 'Failed to fetch trip',
      error: error.message
    });
  }
};



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







module.exports = {
    getAllDrivers,
    getDriverById,
    getAllVehicles,
    getVehicleById,
    getDashboardStats,
    getAllVehiclesByFleetCompany,
    getAllDriversByFleetCompany,
    getVehicleByDriverId,
    getFleetCompanyById,
    deleteFleetCompany,
    deleteDriver,
    deleteVehicle,
    getAllFleetCompanies,
    getAllTrips,
    getTripById
}