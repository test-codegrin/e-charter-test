const {db} = require("../config/db");
const asyncHandler = require("express-async-handler");
const adminGetQueries = require("../config/adminQueries/adminGetQueries");

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

// Get all trips for admin dashboard
const getAllTrips = asyncHandler(async (req, res) => {
  try {
    // Try to get trips with enhanced query first
    try {
      const [trips] = await db.query(`
        SELECT 
          t.*,
          u.firstName,
          u.lastName,
          u.email as userEmail,
          u.phoneNo as userPhone,
          c.carName,
          c.carType,
          d.driverName,
          d.phoneNo as driverPhone
        FROM trips t
        JOIN users u ON t.user_id = u.user_id
        LEFT JOIN car c ON t.car_id = c.car_id
        LEFT JOIN drivers d ON c.driver_id = d.driver_id
        ORDER BY t.created_at DESC
      `);

      res.status(200).json({
        message: "All trips fetched successfully",
        count: trips.length,
        trips
      });
    } catch (enhancedError) {
      // Fallback to basic trips query
      const [trips] = await db.query(`
        SELECT 
          t.*,
          u.firstName,
          u.lastName
        FROM trips t
        JOIN users u ON t.user_id = u.user_id
        ORDER BY t.created_at DESC
      `);

      res.status(200).json({
        message: "All trips fetched successfully",
        count: trips.length,
        trips
      });
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get dashboard statistics for admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get all required data in parallel
    const [
      [drivers],
      [vehicles], 
      [trips],
      [users]
    ] = await Promise.all([
      db.query(adminGetQueries.getAllDrivers),
      db.query(adminGetQueries.getAllCars),
      db.query(`
        SELECT 
          t.*,
          u.firstName,
          u.lastName,
          u.email as userEmail
        FROM trips t
        JOIN users u ON t.user_id = u.user_id
        ORDER BY t.created_at DESC
      `),
      db.query(`SELECT * FROM users`)
    ]);

    // Calculate statistics
    const stats = {
      totalDrivers: drivers.length,
      totalVehicles: vehicles.length,
      totalTrips: trips.length,
      totalUsers: users.length,
      
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
      completedTrips: trips.filter(t => t.status === 'completed').length,
      cancelledTrips: trips.filter(t => t.status === 'cancelled').length,
      
      // Revenue calculation
      totalRevenue: trips
        .filter(t => t.status === 'completed')
        .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0),
      
      // Monthly revenue (current month)
      monthlyRevenue: trips
        .filter(t => {
          if (t.status !== 'completed') return false;
          const tripDate = new Date(t.created_at);
          const now = new Date();
          return tripDate.getMonth() === now.getMonth() && 
                 tripDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0),
      
      // Pending approvals
      pendingApprovals: drivers.filter(d => d.status === 0).length + 
                       vehicles.filter(v => v.status === 0).length
    };

    // Get recent trips (last 10)
    const recentTrips = trips.slice(0, 10);

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

module.exports = {
    getAllDrivers,
    getAllCars,
    getAllTrips,
    getDashboardStats
}