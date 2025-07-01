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

// Get all trips for admin dashboard - FIXED
const getAllTrips = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all trips for admin...");
    
    // Enhanced query with better error handling
    const [trips] = await db.query(`
      SELECT 
        t.trip_id,
        t.user_id,
        t.car_id,
        t.pickupLocation,
        t.dropLocation,
        t.tripStartDate,
        t.tripEndDate,
        t.tripTime,
        t.durationHours,
        t.distance_km,
        t.status,
        t.total_price,
        t.base_price,
        t.tax_amount,
        t.service_type,
        t.created_at,
        u.firstName,
        u.lastName,
        u.email as userEmail,
        u.phoneNo as userPhone,
        COALESCE(c.carName, 'Not Assigned') as carName,
        COALESCE(c.carType, 'N/A') as carType,
        COALESCE(d.driverName, 'Not Assigned') as driverName,
        COALESCE(d.phoneNo, 'N/A') as driverPhone
      FROM trips t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN car c ON t.car_id = c.car_id
      LEFT JOIN drivers d ON c.driver_id = d.driver_id
      ORDER BY t.created_at DESC
    `);

    console.log(`Found ${trips.length} trips`);

    res.status(200).json({
      message: "All trips fetched successfully",
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get dashboard statistics for admin - ENHANCED
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
      db.query(`SELECT * FROM drivers`),
      db.query(`SELECT * FROM car`),
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
      db.query(`SELECT * FROM users`),
      db.query(`SELECT * FROM drivers WHERE registration_type = 'fleet_partner'`).catch(() => [[]])
    ]);

    // Calculate statistics
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
                       vehicles.filter(v => v.status === 0).length +
                       fleetPartners.filter(fp => fp.status === 0).length
    };

    // Get recent trips (last 10)
    const recentTrips = trips.slice(0, 10);

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

// Get all fleet partners for admin - NEW
const getAllFleetPartners = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all fleet partners for admin...");
    
    const [fleetPartners] = await db.query(`
      SELECT 
        driver_id,
        driverName,
        email,
        phoneNo,
        cityName,
        company_name,
        legal_entity_type,
        business_address,
        contact_person_name,
        contact_person_position,
        fleet_size,
        years_experience,
        operating_hours,
        status,
        registration_type,
        terms_accepted,
        technology_agreement,
        created_at
      FROM drivers 
      WHERE registration_type = 'fleet_partner'
      ORDER BY created_at DESC
    `);

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

// Get payout summary for admin - NEW
const getPayoutSummary = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching payout summary...");
    
    // Get completed trips with driver/fleet partner info
    const [payoutData] = await db.query(`
      SELECT 
        t.trip_id,
        t.total_price,
        t.created_at as trip_date,
        d.driver_id,
        d.driverName,
        d.email as driver_email,
        d.registration_type,
        d.company_name,
        c.carName,
        u.firstName as customer_first_name,
        u.lastName as customer_last_name,
        CASE 
          WHEN d.registration_type = 'fleet_partner' THEN t.total_price * 0.15  -- 15% commission for fleet partners
          ELSE t.total_price * 0.20  -- 20% commission for individual drivers
        END as admin_commission,
        CASE 
          WHEN d.registration_type = 'fleet_partner' THEN t.total_price * 0.85  -- 85% payout for fleet partners
          ELSE t.total_price * 0.80  -- 80% payout for individual drivers
        END as driver_payout
      FROM trips t
      JOIN car c ON t.car_id = c.car_id
      JOIN drivers d ON c.driver_id = d.driver_id
      JOIN users u ON t.user_id = u.user_id
      WHERE t.status = 'completed'
      ORDER BY t.created_at DESC
    `);

    // Calculate summary statistics
    const totalRevenue = payoutData.reduce((sum, trip) => sum + parseFloat(trip.total_price), 0);
    const totalCommission = payoutData.reduce((sum, trip) => sum + parseFloat(trip.admin_commission), 0);
    const totalPayouts = payoutData.reduce((sum, trip) => sum + parseFloat(trip.driver_payout), 0);

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
      driverPayouts[driverId].total_earnings += parseFloat(trip.total_price);
      driverPayouts[driverId].total_payout += parseFloat(trip.driver_payout);
    });

    res.status(200).json({
      message: "Payout summary fetched successfully",
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        totalPayouts: parseFloat(totalPayouts.toFixed(2)),
        totalTrips: payoutData.length
      },
      driverPayouts: Object.values(driverPayouts),
      recentPayouts: payoutData.slice(0, 20)
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
    getDashboardStats,
    getAllFleetPartners,
    getPayoutSummary
}