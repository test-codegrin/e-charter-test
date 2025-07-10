const {db} = require("../config/db");
const asyncHandler = require("express-async-handler");
const adminGetQueries = require("../config/adminQueries/adminGetQueries");
const adminDeleteQueries = require("../config/adminQueries/adminDeleteQueries");
const adminUpdateQueries = require("../config/adminQueries/adminUpdateQueries");

const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        const [drivers] = await db.query(adminGetQueries.getAllDrivers);

        res.status(200).json({
            message: "Drivers fetched successfully",
            count: drivers.length,
            drivers
        });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

const getAllCars = asyncHandler(async (req, res) => {
  try {
    const [cars] = await db.query(adminGetQueries.getAllCars);
    res.status(200).json({
      message: "All cars fetched successfully",
      count: cars.length,
      cars
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
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
    zipCord,
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
      zipCord,
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
        zipCord,
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
    console.log("Fetching dashboard statistics...");
    
    // Get all required data in parallel with better error handling
      const [
      [drivers],
      [vehicles],
      [trips],
      [users],
      [fleetPartners]
    ] = await Promise.all([
      db.query(adminGetQueries.getAllDrivers),
      db.query(adminGetQueries.getAllCars),
      db.query(adminGetQueries.getDashboardTrips),
      db.query(adminGetQueries.getAllUsers),
      db.query(adminGetQueries.getFleetPartnersOnly).catch(() => [[]])
    ]);

    // Calculate statistics with proper number handling
    const completedTrips = trips.filter(t => t.status === 'completed');
    const totalRevenue = completedTrips.reduce((sum, trip) => {
      return sum + (parseFloat(trip.total_price) || 0);
    }, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = completedTrips
      .filter(t => {
        const tripDate = new Date(t.created_at);
        return tripDate.getMonth() === currentMonth && 
               tripDate.getFullYear() === currentYear;
      })
      .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0);

    const stats = {
      totalDrivers: drivers.length,
      totalVehicles: vehicles.length,
      totalTrips: trips.length,
      totalUsers: users.length,
      totalFleetPartners: fleetPartners.length,
      
      // Driver stats
      approvedDrivers: drivers.filter(d => d.status === 1).length,
      pendingDrivers: drivers.filter(d => d.status === 0).length,
      rejectedDrivers: drivers.filter(d => d.status === 2).length,
      
      // Vehicle stats
      approvedVehicles: vehicles.filter(v => v.status === 1).length,
      pendingVehicles: vehicles.filter(v => v.status === 0).length,
      
      // Trip stats
      pendingTrips: trips.filter(t => t.status === 'pending' || t.status === '0').length,
      confirmedTrips: trips.filter(t => t.status === 'confirmed').length,
      inProgressTrips: trips.filter(t => t.status === 'in_progress').length,
      completedTrips: completedTrips.length,
      cancelledTrips: trips.filter(t => t.status === 'cancelled').length,
      
      // Revenue calculation - properly formatted
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      
      // Pending approvals
      pendingApprovals: drivers.filter(d => d.status === 0).length + 
                       vehicles.filter(v => v.status === 0).length +
                       fleetPartners.filter(fp => fp.status === 0).length
    };

    // Get recent trips (last 10) with proper formatting
    const recentTrips = trips.slice(0, 10).map(trip => ({
      ...trip,
      total_price: parseFloat(trip.total_price) || 0,
      base_price: parseFloat(trip.base_price) || 0,
      tax_amount: parseFloat(trip.tax_amount) || 0
    }));

    console.log("Dashboard stats calculated successfully");

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      stats,
      recentTrips
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all fleet partners for admin - FIXED with proper column handling
const getAllFleetPartners = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all fleet partners for admin...");
    
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

// Get payout summary for admin - FIXED with proper data formatting
const getPayoutSummary = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching payout summary...");
    
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
    getAllCars,
    getAllTrips,
    getAllUsers,
    deleteUser,
    editUser,
    getDashboardStats,
    getAllFleetPartners,
    getPayoutSummary
}