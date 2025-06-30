const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverGetQueries = require("../config/driverQueries/driverGetQueries");

// Get driver dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  console.log('Driver dashboard stats request for driver_id:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Get driver's vehicles
    const [vehicles] = await db.query(driverGetQueries.getCarsByDriverId, [driver_id]);
    
    // Get driver's trips with enhanced query
    let trips = [];
    try {
      const [tripsResult] = await db.query(`
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
      trips = tripsResult;
    } catch (tripsError) {
      console.log('Enhanced trips query failed, using basic query:', tripsError.message);
      // Fallback to basic query if enhanced fails
      const [basicTrips] = await db.query(`
        SELECT t.* FROM trips t
        JOIN car c ON t.car_id = c.car_id
        WHERE c.driver_id = ?
        ORDER BY t.created_at DESC
      `, [driver_id]);
      trips = basicTrips;
    }

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
      
      // Performance metrics
      averageRating: 4.8,
      completionRate: trips.length > 0 ? 
        (trips.filter(t => t.status === 'completed').length / trips.length * 100).toFixed(1) : 0,
      onTimeRate: 95.0
    };

    // Get recent trips (last 10)
    const recentTrips = trips.slice(0, 10);

    console.log('Driver dashboard stats calculated:', {
      driver_id,
      totalTrips: stats.totalTrips,
      totalEarnings: stats.totalEarnings,
      vehicleCount: stats.totalVehicles
    });

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

  console.log('Driver trips request for driver_id:', driver_id, 'status filter:', status);

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    let trips = [];
    
    // Try enhanced query first
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

      const [tripsResult] = await db.query(query, params);
      trips = tripsResult;
    } catch (enhancedError) {
      console.log('Enhanced trips query failed, using basic query:', enhancedError.message);
      
      // Fallback to basic query
      let basicQuery = `
        SELECT t.* FROM trips t
        JOIN car c ON t.car_id = c.car_id
        WHERE c.driver_id = ?
      `;
      
      let params = [driver_id];

      if (status) {
        basicQuery += ` AND t.status = ?`;
        params.push(status);
      }

      basicQuery += ` ORDER BY t.created_at DESC`;

      const [basicTrips] = await db.query(basicQuery, params);
      trips = basicTrips;
    }

    // Get mid stops for each trip (if table exists)
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

    console.log('Driver trips fetched:', {
      driver_id,
      tripCount: trips.length,
      statusFilter: status
    });

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

  console.log('Driver profile request for driver_id:', driver_id);

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

    console.log('Driver profile fetched for:', drivers[0].driverName);

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

  console.log('Driver profile update request for driver_id:', driver_id);

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

    console.log('Driver profile updated successfully for driver_id:', driver_id);

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