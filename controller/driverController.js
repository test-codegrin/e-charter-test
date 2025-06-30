const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverGetQueries = require("../config/driverQueries/driverGetQueries");

// Get driver dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Get driver's vehicles
    const [vehicles] = await db.query(driverGetQueries.getCarsByDriverId, [driver_id]);
    
    // Get driver's trips
    const [trips] = await db.query(`
      SELECT 
        t.*,
        u.firstName,
        u.lastName,
        u.email as userEmail,
        u.phoneNo as userPhone
      FROM trips t
      JOIN users u ON t.user_id = u.user_id
      JOIN car c ON t.car_id = c.car_id
      WHERE c.driver_id = ?
      ORDER BY t.created_at DESC
    `, [driver_id]);

    // Calculate statistics
    const stats = {
      totalVehicles: vehicles.length,
      approvedVehicles: vehicles.filter(v => v.status === 1).length,
      pendingVehicles: vehicles.filter(v => v.status === 0).length,
      
      totalTrips: trips.length,
      pendingTrips: trips.filter(t => t.status === 'pending' || t.status === '0').length,
      confirmedTrips: trips.filter(t => t.status === 'confirmed').length,
      inProgressTrips: trips.filter(t => t.status === 'in_progress').length,
      completedTrips: trips.filter(t => t.status === 'completed').length,
      cancelledTrips: trips.filter(t => t.status === 'cancelled').length,
      
      // Earnings calculation
      totalEarnings: trips
        .filter(t => t.status === 'completed')
        .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0),
      
      // Monthly earnings (current month)
      monthlyEarnings: trips
        .filter(t => {
          if (t.status !== 'completed') return false;
          const tripDate = new Date(t.created_at);
          const now = new Date();
          return tripDate.getMonth() === now.getMonth() && 
                 tripDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0),
      
      // Performance metrics (mock for now)
      averageRating: 4.8,
      completionRate: trips.length > 0 ? 
        (trips.filter(t => t.status === 'completed').length / trips.length * 100).toFixed(1) : 0,
      onTimeRate: 95.0 // Mock data
    };

    // Get recent trips (last 10)
    const recentTrips = trips.slice(0, 10);

    res.status(200).json({
      message: "Driver dashboard statistics fetched successfully",
      stats,
      recentTrips,
      vehicles
    });

  } catch (error) {
    console.error("Error fetching driver dashboard stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get driver trips
const getDriverTrips = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const { status } = req.query;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    let query = `
      SELECT 
        t.*,
        u.firstName,
        u.lastName,
        u.email as userEmail,
        u.phoneNo as userPhone,
        c.carName,
        c.carType
      FROM trips t
      JOIN users u ON t.user_id = u.user_id
      JOIN car c ON t.car_id = c.car_id
      WHERE c.driver_id = ?
    `;
    
    let params = [driver_id];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC`;

    const [trips] = await db.query(query, params);

    // Get mid stops for each trip
    for (let trip of trips) {
      try {
        const [midStops] = await db.query(
          `SELECT * FROM trip_midstops WHERE trip_id = ? ORDER BY stopOrder`,
          [trip.trip_id]
        );
        trip.midStops = midStops;
      } catch (midStopError) {
        trip.midStops = [];
      }
    }

    res.status(200).json({
      message: "Driver trips fetched successfully",
      count: trips.length,
      trips
    });

  } catch (error) {
    console.error("Error fetching driver trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get driver profile
const getDriverProfile = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [drivers] = await db.query(
      `SELECT driver_id, driverName, email, address, cityName, zipCord, phoneNo, status 
       FROM drivers WHERE driver_id = ?`,
      [driver_id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({
      message: "Driver profile fetched successfully",
      profile: drivers[0]
    });

  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update driver profile
const updateDriverProfile = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const { driverName, email, phoneNo, address, cityName, zipCord } = req.body;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [result] = await db.query(
      `UPDATE drivers 
       SET driverName = ?, email = ?, phoneNo = ?, address = ?, cityName = ?, zipCord = ?
       WHERE driver_id = ?`,
      [driverName, email, phoneNo, address, cityName, zipCord, driver_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({
      message: "Driver profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating driver profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  getDashboardStats,
  getDriverTrips,
  getDriverProfile,
  updateDriverProfile
};