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

module.exports = {
    getAllDrivers,
    getAllCars,
    getAllTrips
}