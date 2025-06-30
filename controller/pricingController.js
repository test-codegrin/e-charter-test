const asyncHandler = require("express-async-handler");
const pricingService = require("../services/pricingService");
const { db } = require("../config/db");
const userGetQueries = require("../config/userQueries/userGetQueries");

const getQuote = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropLocation,
    dropLatitude,
    dropLongitude,
    tripStartDate,
    tripEndDate,
    serviceType = 'one-way',
    mid_stops = []
  } = req.body;

  // Validate required fields
  if (!pickupLocation || !dropLocation || !tripStartDate) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    // Calculate distance using Haversine formula
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth radius in kilometers
      const toRad = angle => (angle * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Calculate total distance including mid stops
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

    // Calculate duration
    let totalStayHours = 0;
    mid_stops.forEach(stop => {
      totalStayHours += parseFloat(stop.stayDuration || 0);
    });

    const travelHours = totalDistance / 40; // Assuming 40 km/h average speed
    const durationHours = travelHours + totalStayHours;

    // Get available vehicles
    const [vehicles] = await db.query(userGetQueries.getApprovedCars);

    if (vehicles.length === 0) {
      return res.status(200).json({
        message: "No vehicles available for your requested itinerary",
        hasVehicles: false,
        tripData: {
          pickupLocation,
          dropLocation,
          tripStartDate,
          distance_km: parseFloat(totalDistance.toFixed(2)),
          durationHours: parseFloat(durationHours.toFixed(2)),
          midStopsCount: mid_stops.length
        }
      });
    }

    // Calculate pricing for each vehicle
    const quotedVehicles = pricingService.getVehicleQuote(vehicles, {
      distance_km: totalDistance,
      durationHours,
      midStopsCount: mid_stops.length,
      serviceType
    });

    res.status(200).json({
      message: "Quote generated successfully",
      hasVehicles: true,
      tripData: {
        pickupLocation,
        dropLocation,
        tripStartDate,
        tripEndDate,
        distance_km: parseFloat(totalDistance.toFixed(2)),
        durationHours: parseFloat(durationHours.toFixed(2)),
        midStopsCount: mid_stops.length,
        serviceType
      },
      vehicles: quotedVehicles
    });

  } catch (error) {
    console.error("Error generating quote:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = { getQuote };