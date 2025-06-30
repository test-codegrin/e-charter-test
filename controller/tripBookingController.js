const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const tripBookingPostQueries = require("../config/tripBookingQueries/tripBookingPostQueries");

// Haversine formula to calculate distance in kilometers
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in kilometers
  const toRad = angle => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

const bookTrip = asyncHandler(async (req, res) => {
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
    mid_stops = [] // optional array of mid stops with stayDuration
  } = req.body;

  // Validate required fields
  if (!user_id || !pickupLocation || !dropLocation || !tripStartDate || !tripTime) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  // Step 1: Calculate total distance via mid stops
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

    totalDistance += haversineDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
  }

  totalDistance = parseFloat(totalDistance.toFixed(2));

  // Step 2: Calculate stay time from mid stops
  let totalStayHours = 0;
  mid_stops.forEach(stop => {
    const stay = parseFloat(stop.stayDuration || 0);
    totalStayHours += isNaN(stay) ? 0 : stay;
  });
  totalStayHours = parseFloat(totalStayHours.toFixed(2));

  // Step 3: Calculate travel & total duration
  const travelHours = parseFloat((totalDistance / 40).toFixed(2)); // Assuming avg speed = 40 km/h
  const durationHours = parseFloat((travelHours + totalStayHours).toFixed(2));

  const status = 0; // 0 = pending

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Step 4: Insert main trip
    const [result] = await conn.query(tripBookingPostQueries.createTrip, [
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
      durationHours,
      totalDistance,
      status
    ]);

    const trip_id = result.insertId;

    // Step 5: Insert mid stops with stayDuration
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

    await conn.commit();
    conn.release();

    res.status(201).json({
      message: "Trip booked successfully",
      trip_id,
      totalDistance,
      travelHours,
      totalStayHours,
      durationHours
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error("Error booking trip:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = { bookTrip };
