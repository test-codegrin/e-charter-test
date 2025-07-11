const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const tripBookingPostQueries = require("../config/tripBookingQueries/tripBookingPostQueries");
const tripGetQueries = require("../config/tripQueries/tripGetQueries");
const tripUpdateQueries = require("../config/tripQueries/tripUpdateQueries");
const pricingService = require("../services/pricingService");


// Mock data for development
const mockTrips = [
  {
    trip_id: 1,
    user_id: 4,
    car_id: 2,
    pickupLocation: 'Toronto Pearson Airport',
    dropLocation: 'CN Tower',
    tripStartDate: '2024-12-15',
    tripTime: '14:30:00',
    status: 'completed',
    total_price: 125.50,
    firstName: 'John',
    lastName: 'asd',
    userEmail: 'asdf@gmail.com',
    carName: 'Honda City',
    driverName: 'test',
    created_at: new Date().toISOString()
  }
];


// Enhanced trip booking with pricing and notifications
const bookTripWithPricing = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;
  const {
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropLocation,
    dropLatitude,
    dropLongitude,
    tripStartDate,
    tripEndDate,
    tripTime,
    selectedCarId,
    serviceType = 'one-way',
    mid_stops = []
  } = req.body;

  if (!user_id || !pickupLocation || !dropLocation || !tripStartDate || !tripTime || !selectedCarId) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    // Get car details
    const [carDetails] = await db.query(
      tripBookingPostQueries.getCarDetails,
      [selectedCarId]
    );

    if (carDetails.length === 0) {
      return res.status(400).json({ message: "Selected vehicle not available" });
    }

    const selectedCar = carDetails[0];

    // Calculate distance and duration
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const toRad = angle => (angle * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalDistance = 0;
    const allStops = [
      { latitude: pickupLatitude, longitude: pickupLongitude },
      ...mid_stops.map(stop => ({
        latitude: stop.latitude,
        longitude: stop.longitude
      })),
      { latitude: dropLatitude, longitude: dropLongitude }
    ];

    for (let i = 0; i < allStops.length - 1; i++) {
      const from = allStops[i];
      const to = allStops[i + 1];
      totalDistance += haversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    }

    let totalStayHours = 0;
    mid_stops.forEach(stop => {
      totalStayHours += parseFloat(stop.stayDuration || 0);
    });

    const travelHours = totalDistance / 40;
    const durationHours = travelHours + totalStayHours;

    // Calculate pricing
    const pricing = pricingService.calculateTripPrice({
      carType: selectedCar.carType,
      carSize: selectedCar.carSize,
      distance_km: totalDistance,
      durationHours,
      midStopsCount: mid_stops.length,
      serviceType
    });

    // Insert trip
    const [tripResult] = await db.query(tripBookingPostQueries.createTrip, [
      user_id,
      pickupLocation,
      pickupLatitude,
      pickupLongitude,
      dropLocation,
      dropLatitude,
      dropLongitude,
      tripStartDate,
      tripEndDate,
      tripTime,
      parseFloat(durationHours.toFixed(2)),
      parseFloat(totalDistance.toFixed(2)),
      'confirmed'
    ]);

    const trip_id = tripResult.insertId;

    // Update trip with car assignment and pricing
    await db.query(tripBookingPostQueries.updateTripWithCarAndPricing, [
      selectedCarId,
      pricing.totalPrice,
      pricing.subtotal,
      pricing.taxAmount,
      trip_id
    ]);

    // Insert mid stops
    if (mid_stops.length > 0) {
      const midStopValues = mid_stops.map((stop, index) => [
        trip_id,
        stop.stopName,
        index + 1,
        stop.latitude,
        stop.longitude,
        stop.stayDuration || 0
      ]);
      await db.query(tripBookingPostQueries.createMidStop, [midStopValues]);
    }

    // Fetch user details
    const [userDetailsResult] = await db.query(tripBookingPostQueries.getUserDetails, [user_id]);

    if (userDetailsResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = userDetailsResult[0];

    // Final response
    res.status(201).json({
      message: "Trip booked successfully",
      trip_id,
      pricing,
      user: userDetails,
      tripDetails: {
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        durationHours: parseFloat(durationHours.toFixed(2)),
        vehicle: selectedCar
      }
    });

  } catch (error) {
    console.error("Error booking trip:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// Get user trips with enhanced details
const getUserTrips = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;
  const { status } = req.query;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Fetch user details
    const [userDetailsResult] = await db.query(tripGetQueries.getUserDetailsById, [user_id]);

    if (userDetailsResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDetails = userDetailsResult[0];

    // Fetch trips
    try {
      let query = tripGetQueries.getTripsByUserId;
      let params = [user_id];

      if (status) {
        query += ` AND t.status = ?`;
        params.push(status);
      }

      const [trips] = await db.query(query, params);

      // Get mid stops for each trip
      for (let trip of trips) {
        try {
          const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip.trip_id]);
          trip.midStops = midStops;
        } catch (midStopError) {
          trip.midStops = [];
        }
      }

      res.status(200).json({
        message: "Trips fetched successfully",
        count: trips.length,
        user: userDetails,
        trips
      });
    } catch (tableError) {
      // If trips table has an issue, fallback to mock
      const userTrips = mockTrips.filter(trip => trip.user_id === user_id);
      res.status(200).json({
        message: "Trips fetched successfully (mock)",
        count: userTrips.length,
        user: userDetails,
        trips: userTrips
      });
    }

  } catch (error) {
    console.error("Error fetching user trips:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get trip details by ID
const getTripDetails = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const user_id = req.user?.user_id;

  try {
    const [tripDetails] = await db.query(tripGetQueries.getTripById, [trip_id]);

    if (tripDetails.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripDetails[0];

    // Check if user owns this trip (for customers) or is assigned driver
    if (req.user.user_id && trip.user_id !== user_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get mid stops
    try {
      const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip_id]);
      trip.midStops = midStops;
    } catch (midStopError) {
      trip.midStops = [];
    }

    res.status(200).json({
      message: "Trip details fetched successfully",
      trip
    });

  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Start trip (for drivers)
const startTrip = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Verify driver is assigned to this trip
    const [tripDetails] = await db.query(
    tripGetQueries.getTripDetailsForDriver,
      [trip_id, driver_id]
    );

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

    // Update trip status to in_progress
    await db.query(tripUpdateQueries.startTrip, [trip_id]);

    res.status(200).json({
      message: "Trip started successfully",
      trip_id
    });

  } catch (error) {
    console.error("Error starting trip:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update trip location (for live tracking)
const updateTripLocation = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const { latitude, longitude } = req.body;
  const driver_id = req.user?.driver_id;

  if (!driver_id || !latitude || !longitude) {
    return res.status(400).json({ message: "Driver authentication and location required" });
  }

  try {
    // Verify driver is assigned to this trip
    const [tripCheck] = await db.query(
      tripUpdateQueries.checkInProgressTrip,
      [trip_id, driver_id]
    );

    if (tripCheck.length === 0) {
      return res.status(403).json({ message: "Trip not found or not in progress" });
    }

    // Update location
    await db.query(tripUpdateQueries.updateTripLocation, [latitude, longitude, trip_id]);

    res.status(200).json({
      message: "Location updated successfully"
    });

  } catch (error) {
    console.error("Error updating trip location:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Complete trip
const completeTrip = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    // Verify and get trip details
    const [tripDetails] = await db.query(
      tripUpdateQueries.getTripDetailsForCompletion,
      [trip_id, driver_id]
    );

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

    // Update trip status to completed
    await db.query(tripUpdateQueries.completeTrip, [trip_id]);

    res.status(200).json({
      message: "Trip completed successfully",
      trip_id
    });

  } catch (error) {
    console.error("Error completing trip:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  bookTripWithPricing,
  getUserTrips,
  getTripDetails,
  startTrip,
  updateTripLocation,
  completeTrip
};