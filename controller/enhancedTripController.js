const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const tripBookingPostQueries = require("../config/tripBookingQueries/tripBookingPostQueries");
const tripGetQueries = require("../config/tripQueries/tripGetQueries");
const tripUpdateQueries = require("../config/tripQueries/tripUpdateQueries");
const pricingService = require("../services/pricingService");

// Helper function to format date as DD-MM-YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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
    const [carDetails] = await db.query(tripBookingPostQueries.getCarDetails, [selectedCarId]);
    if (carDetails.length === 0) {
      return res.status(400).json({ message: "Selected vehicle not available" });
    }

    const selectedCar = carDetails[0];

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const toRad = angle => (angle * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalDistance = 0;
    const allStops = [
      { latitude: pickupLatitude, longitude: pickupLongitude },
      ...mid_stops.map(stop => ({ latitude: stop.latitude, longitude: stop.longitude })),
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

    const pricing = pricingService.calculateTripPrice({
      carType: selectedCar.carType,
      carSize: selectedCar.carSize,
      distance_km: totalDistance,
      durationHours,
      midStopsCount: mid_stops.length,
      serviceType
    });

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

    await db.query(tripBookingPostQueries.updateTripWithCarAndPricing,
      [selectedCarId, pricing.totalPrice, pricing.subtotal, pricing.taxAmount, trip_id]
    );

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

    res.status(201).json({
      message: "Trip booked successfully",
      trip_id,
      pricing,
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

// Get user trips
const getUserTrips = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;
  const { status } = req.query;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    let query = tripGetQueries.getTripsByUserId;
    let params = [user_id];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    const [trips] = await db.query(query, params);

    for (let trip of trips) {
      try {
        const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip.trip_id]);
        trip.midStops = midStops;
      } catch {
        trip.midStops = [];
      }

      // Format dates
      if (trip.tripStartDate) trip.tripStartDate = formatDate(trip.tripStartDate);
      if (trip.tripEndDate) trip.tripEndDate = formatDate(trip.tripEndDate);
      if (trip.created_at) trip.created_at = formatDate(trip.created_at);
    }

    res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips
    });

  } catch (tableError) {
    const userTrips = mockTrips.filter(trip => trip.user_id === user_id).map(trip => ({
      ...trip,
      tripStartDate: formatDate(trip.tripStartDate),
      created_at: formatDate(trip.created_at)
    }));
    res.status(200).json({
      message: "Trips fetched successfully",
      count: userTrips.length,
      trips: userTrips
    });
  }
});

// Get trip details
const getTripDetails = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const user_id = req.user?.user_id;

  try {
    const [tripDetails] = await db.query(tripGetQueries.getTripById, [trip_id]);

    if (tripDetails.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripDetails[0];

    if (req.user.user_id && trip.user_id !== user_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip_id]);
    trip.midStops = midStops || [];

    // Format dates
    if (trip.tripStartDate) trip.tripStartDate = formatDate(trip.tripStartDate);
    if (trip.tripEndDate) trip.tripEndDate = formatDate(trip.tripEndDate);
    if (trip.created_at) trip.created_at = formatDate(trip.created_at);

    res.status(200).json({
      message: "Trip details fetched successfully",
      trip
    });

  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Start trip
const startTrip = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [tripDetails] = await db.query(tripGetQueries.getTripDetailsForDriver, [trip_id, driver_id]);

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

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

// Update trip location
const updateTripLocation = asyncHandler(async (req, res) => {
  const { trip_id } = req.params;
  const { latitude, longitude } = req.body;
  const driver_id = req.user?.driver_id;

  if (!driver_id || !latitude || !longitude) {
    return res.status(400).json({ message: "Driver authentication and location required" });
  }

  try {
    const [tripCheck] = await db.query(tripUpdateQueries.checkInProgressTrip, [trip_id, driver_id]);

    if (tripCheck.length === 0) {
      return res.status(403).json({ message: "Trip not found or not in progress" });
    }

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
    const [tripDetails] = await db.query(tripUpdateQueries.getTripDetailsForCompletion, [trip_id, driver_id]);

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

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
