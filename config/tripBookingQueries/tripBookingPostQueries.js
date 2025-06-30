const tripBookingPostQueries = {

createTrip: `
  INSERT INTO trips (
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
    distance_km,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,

 createMidStop: `
  INSERT INTO trip_midstops (trip_id, stopName, stopOrder, latitude, longitude,stayDuration)
  VALUES ?
`

};

module.exports = tripBookingPostQueries;