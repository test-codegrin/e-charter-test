const adminGetQueries = {

  getAllDrivers: `SELECT driver_id, driverName, email,  address, cityName,status, zipCord, phoneNo  FROM drivers`,

    getAllCars: `
    SELECT car.car_id, car.carName, car.carNumber, car.carSize, car.carType, car.status,
           drivers.driver_id, drivers.driverName AS driverName, drivers.email,drivers.phoneNo
    FROM car
    JOIN drivers ON car.driver_id = drivers.driver_id
  `

}

module.exports = adminGetQueries;