const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverDashboardQueries = require("../config/driverQueries/driverDashboardQueries");
const settingsService = require("../services/settingsService");
const driverSettingsQueries = require("../config/driverQueries/driverSettingsQueries");

// Get driver dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  console.log('Driver dashboard stats request for driver_id:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Get driver's vehicles
    const [vehicles] = await db.query(driverDashboardQueries.getCarsByDriverId, [driver_id]);
    
    // Get driver's trips with enhanced query
    let trips = [];
    try {
      const [tripsResult] = await db.query(driverDashboardQueries.getTripsEnhanced, [driver_id]);
      trips = tripsResult;
    } catch (tripsError) {
      console.log('Enhanced trips query failed, using basic query:', tripsError.message);
      // Fallback to basic query if enhanced fails
      const [basicTrips] = await db.query(driverDashboardQueries.getTripsBasic, [driver_id]);
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
      let query = driverDashboardQueries.getTripsWithStatusEnhanced;
      
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
      let basicQuery = driverDashboardQueries.getTripsWithStatusBasic;
      
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
          driverDashboardQueries.getMidStopsByTripId,
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
      driverDashboardQueries.getDriverProfile,
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
  const { driverName, email, phoneNo, address, cityName, zipCode } = req.body;

  console.log('Driver profile update request for driver_id:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [result] = await db.query(
      driverDashboardQueries.updateDriverProfile,
      [driverName, email, phoneNo, address, cityName, zipCode, driver_id]
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

// Get driver notification settings
const getDriverNotificationSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);
    
    // Try to get from database first
    const [settings] = await db.query(driverSettingsQueries.getNotificationSettings, [driver_id]);

    if (settings.length > 0) {
      // Parse the settings JSON
      let notificationSettings;
      try {
        notificationSettings = JSON.parse(settings[0].settings_data);
      } catch (e) {
        notificationSettings = getDefaultNotificationSettings();
      }

      return res.status(200).json({
        message: "Notification settings fetched successfully",
        settings: notificationSettings
      });
    }

    // If no settings found, return defaults
    res.status(200).json({
      message: "Using default notification settings",
      settings: getDefaultNotificationSettings()
    });

  } catch (error) {
    console.error("Error fetching driver notification settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update driver notification settings
const updateDriverNotificationSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const settings = req.body;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: "Invalid settings format" });
    }

    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);

    // Store settings in database
    await db.query(driverSettingsQueries.updateNotificationSettings, 
      [driver_id, JSON.stringify(settings)]
    );

    res.status(200).json({
      message: "Notification settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating driver notification settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get driver fleet settings
const getDriverFleetSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);
    
    // Try to get from database first
    const [settings] = await db.query(driverSettingsQueries.getFleetSettings, [driver_id]);

    if (settings.length > 0) {
      // Parse the settings JSON
      let fleetSettings;
      try {
        fleetSettings = JSON.parse(settings[0].settings_data);
      } catch (e) {
        fleetSettings = getDefaultFleetSettings();
      }

      return res.status(200).json({
        message: "Fleet settings fetched successfully",
        settings: fleetSettings
      });
    }

    // If no settings found, return defaults
    res.status(200).json({
      message: "Using default fleet settings",
      settings: getDefaultFleetSettings()
    });

  } catch (error) {
    console.error("Error fetching driver fleet settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update driver fleet settings
const updateDriverFleetSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const settings = req.body;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: "Invalid settings format" });
    }

    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);

    // Store settings in database
    await db.query(driverSettingsQueries.updateFleetSettings, 
      [driver_id, JSON.stringify(settings)]
    );

    res.status(200).json({
      message: "Fleet settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating driver fleet settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get driver payment settings
const getDriverPaymentSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);
    
    // Try to get from database first
    const [settings] = await db.query(
      driverSettingsQueries.getPaymentSettings,
      [driver_id]
    );

    if (settings.length > 0) {
      // Parse the settings JSON
      let paymentSettings;
      try {
        paymentSettings = JSON.parse(settings[0].settings_data);
      } catch (e) {
        paymentSettings = getDefaultPaymentSettings();
      }

      return res.status(200).json({
        message: "Payment settings fetched successfully",
        settings: paymentSettings
      });
    }

    // If no settings found, return defaults
    res.status(200).json({
      message: "Using default payment settings",
      settings: getDefaultPaymentSettings()
    });

  } catch (error) {
    console.error("Error fetching driver payment settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update driver payment settings
const updateDriverPaymentSettings = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const settings = req.body;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: "Invalid settings format" });
    }

    // Ensure settings table exists
    await db.query(driverSettingsQueries.createSettingsTable);

    // Store settings in database
    await db.query(
      driverSettingsQueries.updatePaymentSettings,
      [driver_id, JSON.stringify(settings)]
    );

    res.status(200).json({
      message: "Payment settings updated successfully"
    });

  } catch (error) {
    console.error("Error updating driver payment settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Helper function for default notification settings
const getDefaultNotificationSettings = () => {
  return {
    email_trip_assignments: true,
    email_trip_updates: true,
    sms_trip_assignments: true,
    sms_trip_updates: true,
    app_notifications: true
  };
};

// Helper function for default fleet settings
const getDefaultFleetSettings = () => {
  return {
    auto_accept_trips: false,
    service_radius: 50,
    operating_hours: '9:00-17:00',
    availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    max_passengers: 4,
    preferred_trip_types: ['airport', 'corporate', 'event']
  };
};

// Helper function for default payment settings
const getDefaultPaymentSettings = () => {
  return {
    payment_method: 'direct_deposit',
    bank_name: '',
    account_number: '',
    routing_number: '',
    payment_frequency: 'weekly'
  };
};

module.exports = {
  getDashboardStats,
  getDriverTrips,
  getDriverProfile,
  updateDriverProfile,
  getDriverNotificationSettings,
  updateDriverNotificationSettings,
  getDriverFleetSettings,
  updateDriverFleetSettings,
  getDriverPaymentSettings,
  updateDriverPaymentSettings
};