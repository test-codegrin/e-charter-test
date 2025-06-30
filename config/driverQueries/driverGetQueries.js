const driverGetQueries = {

getCarsByDriverId: `
  SELECT car_id, carName, carNumber, carSize, carType, status
  FROM car
  WHERE driver_id = ?
`


}

module.exports = driverGetQueries;