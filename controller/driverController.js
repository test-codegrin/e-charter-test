const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverDashboardQueries = require("../config/driverQueries/driverDashboardQueries");
const settingsService = require("../services/settingsService");
const driverSettingsQueries = require("../config/driverQueries/driverSettingsQueries");
const driverGetQueries = require("../config/driverQueries/driverGetQueries");
const { imagekit, ImagekitFolder } = require("../config/imagekit");
const driverUpdateQueries = require("../config/driverQueries/driverUpdateQueries");

// Get driver dashboard statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Get driver details
    const [driverInfo] = await db.query(
      driverDashboardQueries.getDriverInfo,
      [driver_id]
    );

    if (driverInfo.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const driverData = driverInfo[0];
    const isFleetPartner = driverData.driver_type === 'fleet_partner';

    // Get driver's trips
    const [trips] = await db.query(
      driverDashboardQueries.getTripsEnhanced,
      [driver_id]
    );

    // Get driver ratings
    const [ratingData] = await db.query(
      driverDashboardQueries.getDriverRatings,
      [driver_id]
    );

    // Initialize stats object WITHOUT onTimeRate
    let stats = {
      driver_type: driverData.driver_type,
      driver_name: `${driverData.firstname} ${driverData.lastname}`,
      driver_status: driverData.status,
      
      totalTrips: trips.length,
      confirmedTrips: trips.filter(t => t.trip_status === 'upcoming').length,
      completedTrips: trips.filter(t => t.trip_status === 'completed').length,
      runningTrips: trips.filter(t => t.trip_status === 'running').length,
      cancelledTrips: trips.filter(t => t.trip_status === 'canceled').length,
      
      // Performance metrics
      averageRating: parseFloat(ratingData[0]?.average_rating || 0).toFixed(1),
      totalRatings: ratingData[0]?.total_ratings || 0,
      completionRate: trips.length > 0 ? 
        (trips.filter(t => t.trip_status === 'completed').length / trips.length * 100).toFixed(1) : "0.0"
      // onTimeRate removed as requested
    };

    // For INDIVIDUAL drivers
    if (!isFleetPartner) {
      const [vehicles] = await db.query(
        driverDashboardQueries.getCarsByDriverId,
        [driver_id]
      );
      
      stats.totalVehicles = vehicles.length;
      stats.approvedVehicles = vehicles.filter(v => v.status === 'approved').length;
      stats.pendingVehicles = vehicles.filter(v => v.status === 'in_review').length;
      
      stats.totalEarnings = trips
        .filter(t => t.trip_status === 'completed')
        .reduce((sum, trip) => sum + (parseFloat(trip.total_price) || 0), 0);
      
      const [monthlyStats] = await db.query(
        driverDashboardQueries.getMonthlyTripStats,
        [driver_id]
      );
      
      stats.monthlyEarnings = parseFloat(monthlyStats[0]?.this_month_earnings || 0);
      stats.vehicles = vehicles;
    } 
    // For FLEET PARTNER drivers
    else {
      if (driverData.fleet_company_id) {
        const [fleetCompany] = await db.query(
          driverDashboardQueries.getFleetCompanyById,
          [driverData.fleet_company_id]
        );

        if (fleetCompany.length > 0) {
          stats.fleet_company = fleetCompany[0];
        }
      }
    }

    // Get recent trips
    const [recentTrips] = await db.query(
      driverDashboardQueries.getRecentTrips,
      [driver_id, 10]
    );

    // PARSE JSON STRINGS TO REMOVE BACKSLASHES
    const parsedTrips = recentTrips.map(trip => {
      const parsedTrip = { ...trip };
      
      // Parse user_details if it's a string
      if (parsedTrip.user_details && typeof parsedTrip.user_details === 'string') {
        try {
          parsedTrip.user_details = JSON.parse(parsedTrip.user_details);
        } catch (e) {
          console.error('Error parsing user_details:', e);
        }
      }
      
      // Parse vehicle_details if it's a string
      if (parsedTrip.vehicle_details && typeof parsedTrip.vehicle_details === 'string') {
        try {
          parsedTrip.vehicle_details = JSON.parse(parsedTrip.vehicle_details);
        } catch (e) {
          console.error('Error parsing vehicle_details:', e);
        }
      }
      
      return parsedTrip;
    });

    res.status(200).json({
      message: "Driver dashboard statistics fetched successfully",
      stats,
      recentTrips: parsedTrips
    });

  } catch (error) {
    console.error("Error fetching driver dashboard stats:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
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
    // Get driver profile with documents
    const [drivers] = await db.query(
      driverGetQueries.getDriverProfile,
      [driver_id]
    );

    if (drivers.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const driverProfile = drivers[0];

    // Parse documents if it's a JSON string
    if (driverProfile.documents && typeof driverProfile.documents === 'string') {
      try {
        driverProfile.documents = JSON.parse(driverProfile.documents);
      } catch (e) {
        console.error('Error parsing documents:', e);
        driverProfile.documents = null;
      }
    }

    // Parse fleet_company_details if it's a JSON string
    if (driverProfile.fleet_company_details && typeof driverProfile.fleet_company_details === 'string') {
      try {
        driverProfile.fleet_company_details = JSON.parse(driverProfile.fleet_company_details);
      } catch (e) {
        console.error('Error parsing fleet_company_details:', e);
        driverProfile.fleet_company_details = null;
      }
    }

    // Get driver ratings
    const [ratingData] = await db.query(
      driverGetQueries.getDriverRatings,
      [driver_id]
    );

    // Add ratings to profile
    driverProfile.ratings = {
      average_rating: parseFloat(ratingData[0]?.average_rating || 0).toFixed(1),
      total_ratings: ratingData[0]?.total_ratings || 0,
      positive_ratings: ratingData[0]?.positive_ratings || 0
    };

    console.log('Driver profile fetched for:', driverProfile.driverName);

    res.status(200).json({
      message: "Driver profile fetched successfully",
      profile: driverProfile
    });

  } catch (error) {
    console.error("Error fetching driver profile:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


// Update profile (text fields) - Returns updated data
const updateDriverProfile = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const { firstname, lastname, phone_no, address, city_name, zip_code, year_of_experiance, gender } = req.body;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Update profile and set status to in_review
    await db.query(
      driverUpdateQueries.updateDriverProfile,
      [firstname, lastname, phone_no, address, city_name, zip_code, year_of_experiance, gender, driver_id]
    );

    // Fetch updated profile data
    const [updatedProfile] = await db.query(
      `SELECT driver_id, firstname, lastname, phone_no, address, city_name, 
              zip_code, year_of_experiance, gender, profile_image, status, 
              CONCAT(firstname, ' ', lastname) as driverName
       FROM drivers 
       WHERE driver_id = ? AND is_deleted = 0`,
      [driver_id]
    );

    res.status(200).json({
      message: "Profile updated successfully. Your changes are now under review.",
      updatedData: updatedProfile[0]
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update profile photo - Returns updated photo URL
const updateProfilePhoto = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const file = req.file;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: `driver_profile_${driver_id}_${Date.now()}`,
      folder: ImagekitFolder.driver_profile,
    });

    // Update database
    await db.query(
      driverUpdateQueries.updateProfilePhoto,
      [uploadResponse.url, driver_id]
    );

    res.status(200).json({
      message: "Profile photo updated successfully",
      updatedData: {
        profile_image: uploadResponse.url
      }
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// Upload document with expiry date
const uploadDriverDocument = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;
  const { document_type, document_number, document_expiry_date } = req.body;
  const file = req.file;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  if (!file || !document_type || !document_number || !document_expiry_date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: `driver_${driver_id}_${document_type}_${Date.now()}`,
      folder: ImagekitFolder.driver_documents,
    });

    // Check if document exists
    const [existing] = await db.query(
      driverUpdateQueries.documentExist,
      [driver_id, document_type]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        driverUpdateQueries.updateExistingDocument,
        [uploadResponse.url, document_number, document_expiry_date, existing[0].driver_document_id]
      );
    } else {
      // Insert new
      await db.query(
        driverUpdateQueries.insertNewDocument,
        [driver_id, document_type, uploadResponse.url, document_number, document_expiry_date]
      );
    }

    // Set driver status to in_review
    await db.query(
      driverUpdateQueries.updateDriverStatus,
      [driver_id]
    );

    res.status(200).json({
      message: "Document uploaded successfully. Your profile is now under review.",
      document_url: uploadResponse.url
    });
  } catch (error) {
    console.error("Error uploading document:", error);
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
  updateProfilePhoto,
  uploadDriverDocument,
  getDriverNotificationSettings,
  updateDriverNotificationSettings,
  getDriverFleetSettings,
  updateDriverFleetSettings,
  getDriverPaymentSettings,
  updateDriverPaymentSettings
};