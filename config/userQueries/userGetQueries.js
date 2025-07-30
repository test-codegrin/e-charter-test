const { get } = require("../../routes/userRoutes");

const userGetQueries = {

getApprovedCars : `
  SELECT 
    car.car_id,
    car.carName,
    car.carNumber,
    car.carSize,
    car.carType,
    drivers.driver_id,
   drivers.driverName AS driverName,
    drivers.email,
    drivers.phoneNo
  FROM car 
  JOIN drivers ON car.driver_id = drivers.driver_id
  WHERE car.status = 1
`,

getUserProfile: `
  SELECT firstName, lastName, email, address,cityName,zipCode,phoneNo, profileImage
  FROM users WHERE user_id = ?`


};

module.exports = userGetQueries;