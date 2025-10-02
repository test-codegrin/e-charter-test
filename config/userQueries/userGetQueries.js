const { get } = require("../../routes/userRoutes");

const userGetQueries = {

getApprovedCars : `
  SELECT 
    car.car_id,
    car.carName,
    car.carNumber,
    car.carSize,
    car.carType,
    car.car_image,
    drivers.driver_id,
   drivers.driverName AS driverName,
    drivers.email,
    drivers.phoneNo
  FROM car 
  JOIN drivers ON car.driver_id = drivers.driver_id
  WHERE car.status = 1
`,

 getUserProfileById : `
  SELECT user_id, firstName, lastName, email, address, cityName, zipCode, phoneNo, profileImage, created_at
  FROM users
  WHERE user_id = ? AND is_deleted = 0
`


};

module.exports = userGetQueries;