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
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Validate pagination parameters
        if (page < 1) {
            return res.status(400).json({ 
                message: "Page number must be greater than 0" 
            });
        }
        
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ 
                message: "Limit must be between 1 and 100" 
            });
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get total count of drivers
        const [countResult] = await db.query(adminGetQueries.getTotalDriversCount);
        const totalDrivers = countResult[0].total;

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalDrivers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Get paginated drivers
        const [drivers] = await db.query(
            adminGetQueries.getAllDrivers,
            [limit, offset]
        );

        // Parse documents JSON for each driver
        const parsedDrivers = drivers.map(driver => ({
            ...driver,
            documents: driver.documents ? JSON.parse(driver.documents) : null
        }));

        res.status(200).json({
            message: "Drivers fetched successfully",
            pagination: {
                currentPage: page,
                limit: limit,
                totalPages: totalPages,
                totalDrivers: totalDrivers,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            },
            count: parsedDrivers.length,
            drivers: parsedDrivers
        });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
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
                : null,
            // Handle leave history - return empty array if no leave history, otherwise parse
            leave_history: driver[0].leave_history ? JSON.parse(driver[0].leave_history) : [],
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
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count of vehicles
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM vehicle WHERE is_deleted = 0'
    );
    const totalVehicles = countResult[0].total;

    // Calculate pagination info
    const totalPages = Math.ceil(totalVehicles / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get paginated vehicles
    const [vehicles] = await db.query(
      adminGetQueries.getAllVehicles,
      [limit, offset]
    );
    
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
      message: "Vehicles fetched successfully",
      count: parsedVehicles.length,
      vehicles: parsedVehicles,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalVehicles: totalVehicles,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage
      }
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
            pricing: vehicle[0].pricing ? JSON.parse(vehicle[0].pricing) : null,
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




/// Get dashboard statistics for admin - ENHANCED with revenue and trip metrics
const getDashboardStats = asyncHandler(async (req, res) => {
  try { 
    // Execute the dashboard stats query
    const [statsRows] = await db.query(dashboardGetQueries.getDashboardStats);
    
    // Get the first row which contains all the counts
    const statsData = statsRows[0];
    
    // Calculate revenue growth percentage
    const revenueGrowth = statsData.last_month_revenue > 0 
      ? ((statsData.this_month_revenue - statsData.last_month_revenue) / statsData.last_month_revenue * 100).toFixed(2)
      : 0;
    
    // Calculate trip growth percentage
    const tripGrowth = statsData.last_month_trips > 0
      ? ((statsData.this_month_trips - statsData.last_month_trips) / statsData.last_month_trips * 100).toFixed(2)
      : 0;

    const stats = {
      // Driver stats
      drivers: {
        total: statsData.total_drivers,
        approved: statsData.approved_drivers,
        pending: statsData.pending_drivers,
        rejectionRate: statsData.total_drivers > 0 
          ? ((statsData.total_drivers - statsData.approved_drivers) / statsData.total_drivers * 100).toFixed(2)
          : "0.00"
      },
      
      // Fleet Companies stats
      fleet_companies: {
        total: statsData.total_fleet_companies,
        approved: statsData.approved_fleet_companies,
        pending: statsData.pending_fleet_companies,
        approvalRate: statsData.total_fleet_companies > 0
          ? ((statsData.approved_fleet_companies / statsData.total_fleet_companies) * 100).toFixed(2)
          : "0.00"
      },
      
      // Vehicle stats
      vehicles: {
        total: statsData.total_vehicles,
        approved: statsData.approved_vehicles,
        pending: statsData.pending_vehicles,
        approvalRate: statsData.total_vehicles > 0
          ? ((statsData.approved_vehicles / statsData.total_vehicles) * 100).toFixed(2)
          : "0.00"
      },
      
      // Trip stats
      trips: {
        total: statsData.total_trips,
        completed: statsData.completed_trips,
        upcoming: statsData.upcoming_trips,
        running: statsData.running_trips,
        canceled: statsData.canceled_trips,
        completionRate: statsData.total_trips > 0
          ? ((statsData.completed_trips / statsData.total_trips) * 100).toFixed(2)
          : "0.00",
        thisMonth: statsData.this_month_trips,
        lastMonth: statsData.last_month_trips,
        thisMonthCompleted: statsData.this_month_completed_trips,
        lastMonthCompleted: statsData.last_month_completed_trips,
        growth: parseFloat(tripGrowth)
      },
      
      // Revenue stats
      revenue: {
        total: parseFloat(statsData.total_revenue || 0).toFixed(2),
        thisMonth: parseFloat(statsData.this_month_revenue || 0).toFixed(2),
        lastMonth: parseFloat(statsData.last_month_revenue || 0).toFixed(2),
        growth: parseFloat(revenueGrowth),
        average: parseFloat(statsData.avg_trip_price || 0).toFixed(2),
        totalTax: parseFloat(statsData.total_tax_collected || 0).toFixed(2)
      },
      
      // Pending approvals (combined - now includes fleet companies)
      pendingApprovals: statsData.pending_drivers + statsData.pending_vehicles + statsData.pending_fleet_companies
    };

    console.log("Dashboard stats calculated successfully");

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
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


const getTripByDriverId = async (req, res) => {
  try {
    const { driver_id } = req.params;

    // Fixed: Use correct query name
    const [result] = await db.query(adminGetQueries.getTripByDriver, [driver_id]);

    if (result.length === 0) {
      return res.status(404).json({ 
        message: 'No trips found for this driver',
        trips: []
      });
    }

    // Process each trip
    const trips = result.map(trip => {
      // Helper function to safely parse or use data
      const safeParse = (data) => {
        if (!data) return null;
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            return null;
          }
        }
        return data;
      };

      return {
        ...trip,
        user_details: safeParse(trip.user_details),
        driver_details: safeParse(trip.driver_details),
        vehicle_details: safeParse(trip.vehicle_details),
        payment_transaction: safeParse(trip.payment_transaction),
        fleet_company_details: safeParse(trip.fleet_company_details),
        stops: safeParse(trip.stops) || []
      };
    });

    res.status(200).json({
      message: 'Trips fetched successfully',
      count: trips.length,
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

module.exports = { getTripByDriverId };




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
    getTripByDriverId,
    getTripById
}