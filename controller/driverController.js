const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverDashboardQueries = require("../config/driverQueries/driverDashboardQueries");
const settingsService = require("../services/settingsService");
const driverSettingsQueries = require("../config/driverQueries/driverSettingsQueries");
const driverGetQueries = require("../config/driverQueries/driverGetQueries");
const { imagekit, ImagekitFolder } = require("../config/imagekit");
const driverUpdateQueries = require("../config/driverQueries/driverUpdateQueries");

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
      driver_status_description: driverData.status_description,
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

  // Validate file type
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ 
      message: "Invalid file type. Only PDF, JPG, and PNG files are allowed." 
    });
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return res.status(400).json({ 
      message: "File size too large. Maximum allowed size is 5MB." 
    });
  }

  try {
    // Get file extension from mimetype
    const fileExtension = file.mimetype === 'application/pdf' 
      ? 'pdf' 
      : file.originalname.split('.').pop().toLowerCase();
    
    // Convert buffer to base64 string
    const fileBase64 = file.buffer.toString('base64');
    
    // Validate document expiry date
    const expiryDate = new Date(document_expiry_date);
    const today = new Date();
    if (expiryDate <= today) {
      return res.status(400).json({ 
        message: "Document expiry date must be in the future." 
      });
    }

    // Upload to ImageKit with proper file extension and metadata
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: `driver_${driver_id}_${document_type}_${Date.now()}.${fileExtension}`,
      folder: ImagekitFolder.driver_documents,
    });

    // Check if document exists
    const [existing] = await db.query(
      driverUpdateQueries.documentExist,
      [driver_id, document_type]
    );

    if (existing.length > 0) {
      // Update existing document
      await db.query(
        driverUpdateQueries.updateExistingDocument,
        [uploadResponse.url, document_number, document_expiry_date, existing[0].driver_document_id]
      );
      
      console.log(`Updated driver document: ${document_type} for driver_id: ${driver_id}`);
    } else {
      // Insert new document
      await db.query(
        driverUpdateQueries.insertNewDocument,
        [driver_id, document_type, uploadResponse.url, document_number, document_expiry_date]
      );
      
      console.log(`Inserted new driver document: ${document_type} for driver_id: ${driver_id}`);
    }

    // Set driver status to in_review with description
    await db.query(
      driverUpdateQueries.updateDriverStatus,
      [driver_id]
    );

    res.status(200).json({
      message: "Document uploaded successfully. Your profile is now under review.",
      document: {
        document_type: document_type,
        document_url: uploadResponse.url,
        document_number: document_number,
        expiry_date: document_expiry_date
      }
    });
  } catch (error) {
    console.error("Error uploading driver document:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


const getDriverTrips = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [trips] = await db.query(driverGetQueries.getTripsByDriver, [driver_id]);

    // Parse stops JSON string for each trip
    const formattedTrips = trips.map(trip => {
      // Parse stops if it's a string
      if (trip.stops && typeof trip.stops === 'string') {
        try {
          trip.stops = JSON.parse(trip.stops);
        } catch (error) {
          console.error('Error parsing stops for trip_id:', trip.trip_id, error);
          trip.stops = [];
        }
      } else if (!trip.stops) {
        trip.stops = [];
      }

      return trip;
    });

    res.status(200).json({
      message: "Driver trips fetched successfully",
      count: formattedTrips.length,
      trips: formattedTrips
    });

  } catch (error) {
    console.error("Error fetching driver trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getTripById = async (req, res) => {
  try {
    const { trip_id } = req.params;

    const [result] = await db.query(driverGetQueries.getTripById, [trip_id]);

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

const getVehicleByDriverId = asyncHandler(async (req, res) => {
    try {
        const driver_id = req.user?.driver_id;
        const [vehicles] = await db.query(driverGetQueries.getVehicleByDriverId, [driver_id]);

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

const getDriverVehicleById = asyncHandler(async (req, res) => {
    const { vehicle_id } = req.params;
    
    if (!vehicle_id) {
        return res.status(400).json({ message: "Vehicle ID is required" });
    }
    
    try {
        const [vehicle] = await db.query(driverGetQueries.getVehicleById, [vehicle_id]);
        
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

const updateVehicleImage = asyncHandler(async (req, res) => {
  const { vehicle_id } = req.body;
  const file = req.file;

  if (!vehicle_id) {
    return res.status(401).json({ message: "Vehicle ID is required" });
  }

  if (!file) {
    return res.status(400).json({ message: "File is required" });
  }

  // Validate file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ 
      message: "Invalid file type. Only JPG and PNG files are allowed." 
    });
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return res.status(400).json({ 
      message: "File size too large. Maximum allowed size is 5MB." 
    });
  }

  try {
    // Get file extension from mimetype
    const fileExtension = file.mimetype === 'image/jpeg' 
      ? 'jpg' 
      : file.mimetype === 'image/png' 
      ? 'png' 
      : file.originalname.split('.').pop().toLowerCase();
    
    // Convert buffer to base64 string
    const fileBase64 = file.buffer.toString('base64');
    

    // Upload to ImageKit with proper file extension and metadata
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: `vehicle_${vehicle_id}_${Date.now()}.${fileExtension}`,
      folder: ImagekitFolder.vehicle_images,
    });

      await db.query(
        driverUpdateQueries.updateVehicleImage,
        [uploadResponse.url, vehicle_id]
      );
      console.log(`Updated vehicle image for vehicle_id: ${vehicle_id}`);
  

    // Set driver status to in_review with description
    await db.query(
      driverUpdateQueries.updateVehicleStatus,
      ["Vehicle image updated.", vehicle_id]
    );

    res.status(200).json({
      message: "Vehicle image updated successfully. Your profile is now under review.",
      vehicle_id: vehicle_id,
      image_url: uploadResponse.url
    });
  } catch (error) {
    console.error("Error uploading driver document:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});


const uploadVehicleDocument = asyncHandler(async (req, res) => {
  const { vehicle_id, document_type, document_number, document_expiry_date } = req.body;
  const file = req.file;

  if (!vehicle_id) {
    return res.status(401).json({ message: "Vehicle authentication required" });
  }

  if (!file || !document_type || !document_number || !document_expiry_date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Get file extension
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    
    // Convert buffer to base64 string
    const fileBase64 = file.buffer.toString('base64');
    
    // Upload to ImageKit with proper file extension
    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: `vehicle_${vehicle_id}_${document_type}_${Date.now()}.${fileExtension}`,
      folder: ImagekitFolder.vehicle_documents,
      // Optional: Add tags for better organization
      tags: [`vehicle_${vehicle_id}`, document_type, 'vehicle_document']
    });

    // Check if document exists
    const [existing] = await db.query(
      driverUpdateQueries.documentExist,
      [vehicle_id, document_type]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        driverUpdateQueries.updateExistingVehicleDocument,
        [uploadResponse.url, document_number, document_expiry_date, existing[0].vehicle_document_id]
      );
    } else {
      // Insert new
      await db.query(
        driverUpdateQueries.insertNewVehicleDocument,
        [vehicle_id, document_type, uploadResponse.url, document_number, document_expiry_date]
      );
    }

    // Set vehicle status to in_review
    await db.query(
      driverUpdateQueries.updateVehicleStatus,
      ["Vehicle document updated", vehicle_id]
    );

    res.status(200).json({
      message: "Document uploaded successfully. Your vehicle is now under review.",
      document_url: uploadResponse.url
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const updateVehicleFeatures = asyncHandler(async (req, res) => {
  const { vehicle_id } = req.params;
  const driver_id = req.user?.driver_id;
  const {
    has_air_conditioner,
    has_charging_port,
    has_wifi,
    has_entertainment_system,
    has_gps,
    has_recliner_seats,
    is_wheelchair_accessible
  } = req.body;

  console.log('Update vehicle features request:', {
    vehicle_id,
    driver_id,
    features: req.body
  });

  // Validate driver authentication
  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  // Validate vehicle_id
  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  try {
    // Verify vehicle belongs to driver
    const [vehicleCheck] = await db.query(
      driverUpdateQueries.checkVehicleDriver,
      [vehicle_id, driver_id]
    );

    if (vehicleCheck.length === 0) {
      return res.status(404).json({ 
        message: "Vehicle not found or you don't have permission to update it" 
      });
    }

    // Convert boolean values to 0 or 1 (handle undefined as 0)
    const features = {
      has_air_conditioner: has_air_conditioner ? 1 : 0,
      has_charging_port: has_charging_port ? 1 : 0,
      has_wifi: has_wifi ? 1 : 0,
      has_entertainment_system: has_entertainment_system ? 1 : 0,
      has_gps: has_gps ? 1 : 0,
      has_recliner_seats: has_recliner_seats ? 1 : 0,
      is_wheelchair_accessible: is_wheelchair_accessible ? 1 : 0
    };

    // Check if vehicle features already exist
    const [existing] = await db.query(
      driverUpdateQueries.checkVehicleFeatures,
      [vehicle_id]
    );

    if (existing.length > 0) {
      // Update existing features
      await db.query(
        driverUpdateQueries.updateVehicleFeatures,
        [
          features.has_air_conditioner,
          features.has_charging_port,
          features.has_wifi,
          features.has_entertainment_system,
          features.has_gps,
          features.has_recliner_seats,
          features.is_wheelchair_accessible,
          vehicle_id
        ]
      );

      console.log(`Updated vehicle features for vehicle_id: ${vehicle_id}`);
      await db.query(
        driverUpdateQueries.updateVehicleStatus,
        ["Vehicle features updated", vehicle_id]
      );

      res.status(200).json({
        message: "Vehicle features updated successfully",
        features: features
      });
    } else {
      // Insert new features
      const [result] = await db.query(
        driverUpdateQueries.insertVehicleFeatures,
        [
          vehicle_id,
          features.has_air_conditioner,
          features.has_charging_port,
          features.has_wifi,
          features.has_entertainment_system,
          features.has_gps,
          features.has_recliner_seats,
          features.is_wheelchair_accessible
        ]
      );

      console.log(`Created new vehicle features for vehicle_id: ${vehicle_id}`);
      await db.query(
        driverUpdateQueries.updateVehicleStatus,
        ["Vehicle features updated", vehicle_id]
      );

      res.status(201).json({
        message: "Vehicle features created successfully",
        vehicle_features_id: result.insertId,
        features: features
      });
    }
  } catch (error) {
    console.error("Error updating vehicle features:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});










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
  getDriverProfile,
  updateDriverProfile,
  updateProfilePhoto,
  uploadDriverDocument,
  getDriverTrips,
  getTripById,
  getVehicleByDriverId,
  getDriverVehicleById,
  uploadVehicleDocument,
  updateVehicleFeatures,
  updateVehicleImage,
  getDriverNotificationSettings,
  updateDriverNotificationSettings,
  getDriverFleetSettings,
  updateDriverFleetSettings,
  getDriverPaymentSettings,
  updateDriverPaymentSettings
};