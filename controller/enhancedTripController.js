const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const tripBookingPostQueries = require("../config/tripBookingQueries/tripBookingPostQueries");
const tripGetQueries = require("../config/tripQueries/tripGetQueries");
const tripUpdateQueries = require("../config/tripQueries/tripUpdateQueries");
const invoiceQueries = require("../config/invoiceQueries/invoiceQueries");
const pricingService = require("../services/pricingService");
const emailService = require("../services/emailService");
const smsService = require("../services/smsService");

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

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Get car details
    const [carDetails] = await conn.query(
      `SELECT c.*, d.driverName, d.email as driverEmail, d.phoneNo as driverPhone 
       FROM car c 
       JOIN drivers d ON c.driver_id = d.driver_id 
       WHERE c.car_id = ? AND c.status = 1`,
      [selectedCarId]
    );

    if (carDetails.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "Selected vehicle not available" });
    }

    const selectedCar = carDetails[0];

    // Calculate distance and duration
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
    const [tripResult] = await conn.query(tripBookingPostQueries.createTrip, [
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
      'confirmed' // Status is confirmed since car is selected
    ]);

    const trip_id = tripResult.insertId;

    // Update trip with car assignment and pricing
    await conn.query(
      `UPDATE trips SET car_id = ?, total_price = ?, base_price = ?, tax_amount = ? WHERE trip_id = ?`,
      [selectedCarId, pricing.totalPrice, pricing.subtotal, pricing.taxAmount, trip_id]
    );

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
      await conn.query(tripBookingPostQueries.createMidStop, [midStopValues]);
    }

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${trip_id}`;
    const [invoiceResult] = await conn.query(invoiceQueries.createInvoice, [
      trip_id,
      user_id,
      invoiceNumber,
      pricing.subtotal,
      pricing.taxAmount,
      pricing.totalPrice,
      'pending'
    ]);

    await conn.commit();
    conn.release();

    // Get user details for notifications
    const [userDetails] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [user_id]);
    const user = userDetails[0];

    // Send notifications
    try {
      // Customer email
      await emailService.sendBookingConfirmation(
        user,
        { trip_id, pickupLocation, dropLocation, tripStartDate, tripTime, total_price: pricing.totalPrice },
        { invoice_number: invoiceNumber, total_amount: pricing.totalPrice }
      );

      // Customer SMS
      await smsService.sendBookingConfirmation(
        user.phoneNo,
        trip_id,
        pickupLocation,
        tripStartDate
      );

      // Admin email
      await emailService.sendAdminBookingNotification(
        { trip_id, pickupLocation, dropLocation, tripStartDate, tripTime, total_price: pricing.totalPrice },
        user,
        selectedCar
      );

      // Driver email
      await emailService.sendDriverBookingNotification(
        selectedCar,
        { trip_id, pickupLocation, dropLocation, tripStartDate, tripTime },
        user
      );

      // Driver SMS
      await smsService.sendDriverAssignment(
        selectedCar.driverPhone,
        trip_id,
        `${user.firstName} ${user.lastName}`,
        pickupLocation
      );

    } catch (emailError) {
      console.error("Email/SMS notification failed:", emailError);
      // Don't fail the booking if notifications fail
    }

    res.status(201).json({
      message: "Trip booked successfully",
      trip_id,
      invoice_id: invoiceResult.insertId,
      invoice_number: invoiceNumber,
      pricing,
      tripDetails: {
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        durationHours: parseFloat(durationHours.toFixed(2)),
        vehicle: selectedCar
      }
    });

  } catch (error) {
    await conn.rollback();
    conn.release();
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
    let query = tripGetQueries.getTripsByUserId;
    let params = [user_id];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    const [trips] = await db.query(query, params);

    // Get mid stops for each trip
    for (let trip of trips) {
      const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip.trip_id]);
      trip.midStops = midStops;
    }

    res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips
    });

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
    const [midStops] = await db.query(tripGetQueries.getTripMidStops, [trip_id]);
    trip.midStops = midStops;

    // Get invoice details
    const [invoiceDetails] = await db.query(
      `SELECT * FROM invoices WHERE trip_id = ?`,
      [trip_id]
    );
    trip.invoice = invoiceDetails[0] || null;

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
      `SELECT t.*, c.driver_id, u.firstName, u.lastName, u.email, u.phoneNo 
       FROM trips t 
       JOIN car c ON t.car_id = c.car_id 
       JOIN users u ON t.user_id = u.user_id 
       WHERE t.trip_id = ? AND c.driver_id = ?`,
      [trip_id, driver_id]
    );

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

    const trip = tripDetails[0];

    // Update trip status to in_progress
    await db.query(tripUpdateQueries.startTrip, [trip_id]);

    // Generate tracking URL
    const trackingUrl = `${process.env.FRONTEND_URL}/track/${trip_id}`;

    // Send notifications
    try {
      await emailService.sendTrackingLink(
        trip,
        { trip_id, pickupLocation: trip.pickupLocation, dropLocation: trip.dropLocation },
        trackingUrl
      );

      await smsService.sendTripStarted(
        trip.phoneNo,
        trip_id,
        trackingUrl
      );
    } catch (notificationError) {
      console.error("Notification failed:", notificationError);
    }

    res.status(200).json({
      message: "Trip started successfully",
      trip_id,
      trackingUrl
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
      `SELECT t.trip_id FROM trips t 
       JOIN car c ON t.car_id = c.car_id 
       WHERE t.trip_id = ? AND c.driver_id = ? AND t.status = 'in_progress'`,
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
      `SELECT t.*, u.firstName, u.lastName, u.phoneNo 
       FROM trips t 
       JOIN car c ON t.car_id = c.car_id 
       JOIN users u ON t.user_id = u.user_id 
       WHERE t.trip_id = ? AND c.driver_id = ?`,
      [trip_id, driver_id]
    );

    if (tripDetails.length === 0) {
      return res.status(403).json({ message: "Trip not found or not assigned to you" });
    }

    const trip = tripDetails[0];

    // Update trip status to completed
    await db.query(tripUpdateQueries.completeTrip, [trip_id]);

    // Update invoice status to completed
    await db.query(
      `UPDATE invoices SET status = 'completed' WHERE trip_id = ?`,
      [trip_id]
    );

    // Send completion notification
    try {
      await smsService.sendTripCompleted(trip.phoneNo, trip_id);
    } catch (notificationError) {
      console.error("Completion notification failed:", notificationError);
    }

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