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
    car_id,
    pickupLocation,
    pickupLatitude,
    pickupLongitude,
    dropLocation,
    dropLatitude,
    dropLongitude,
    tripStartDate,
    tripEndDate,
    tripTime,
    mid_stops = []
  } = req.body;

  if (!user_id || !pickupLocation || !dropLocation || !tripStartDate || !tripTime || !car_id) {
    return res.status(400).json({ message: "Required fields missing" });
  }

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
  totalDistance = parseFloat(totalDistance.toFixed(2));

  let totalStayHours = 0;
  mid_stops.forEach(stop => { totalStayHours += parseFloat(stop.stayDuration || 0); });
  totalStayHours = parseFloat(totalStayHours.toFixed(2));

  const travelHours = parseFloat((totalDistance / 40).toFixed(2));
  const durationHours = parseFloat((travelHours + totalStayHours).toFixed(2));

  const status = 0;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(tripBookingPostQueries.createTrip, [
      user_id,
      car_id,
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
      car_id,
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

const recommendCars = asyncHandler(async (req, res) => {
  try {
    const { distance, passengers, luggages, number_of_stop, number_of_days } = req.body;

    // ✅ Validate input
    if (!distance || !passengers || !luggages || !number_of_days) {
      return res.status(400).json({
        success: false,
        message: 'Please provide distance, passengers, luggages, and number_of_days'
      });
    }

    // ✅ Fetch suitable cars along with driver's address dynamically
    const [cars] = await db.query(
      `SELECT 
          c.car_id,
          c.carName,
          c.carSize,
          c.carType,
          c.car_image,
          c.passenger_capacity,
          c.luggage_capacity,
          c.fuel_type,
          c.daily_rate,
          c.per_km_rate,
          '200' AS cancellation_charge,
          d.address AS driver_address,
          d.cityName AS driver_city,
          d.zipCode AS driver_zip,
          d.driverName
       FROM car AS c
       LEFT JOIN drivers AS d ON c.driver_id = d.driver_id
       WHERE c.passenger_capacity >= ? 
         AND c.luggage_capacity >= ? 
         AND c.status = 1
         AND c.vehicle_condition IN ('excellent', 'good')`,
      [passengers, luggages]
    );

    if (cars.length === 0) {
      return res.json({ success: true, cars: [] });
    }

    // ✅ Calculate total price and return results
    const carsWithPrice = cars.map(car => {
      const kmRate = car.per_km_rate || 0;
      const dayRate = car.daily_rate || 0;
      const totalPrice = (distance * kmRate) + (number_of_days * dayRate);

      // Combine address fields
      const fullAddress = `${car.driver_address || ''}, ${car.driver_city || ''} - ${car.driver_zip || ''}`;

      return {
        car_id: car.car_id,
        carName: car.carName,
        carSize: car.carSize,
        carType: car.carType,
        car_image: car.car_image,
        passenger_capacity: car.passenger_capacity,
        fuelType: car.fuel_type === 'gasoline' ? 'Petrol' : 'Diesel',
        cancellation_charge: car.cancellation_charge,
        driver_name: car.driverName,
        driver_address: fullAddress.trim(),
        price: parseFloat(totalPrice.toFixed(2))
      };
    });

    res.json({
      success: true,
      cars: carsWithPrice
    });

  } catch (error) {
    console.error('Error recommending cars:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recommending cars',
      error: error.message
    });
  }
});



module.exports = { bookTrip, recommendCars };
