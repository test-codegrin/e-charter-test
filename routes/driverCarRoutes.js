const express = require("express");
const router = express.Router();
const { 
  addCar, 
  getCarsByDriver, 
  updateCar, 
  deleteCar, 
  getCarDetails 
} = require("../controller/driverCarController");
const { authenticationToken } = require("../middleware/authMiddleware")

console.log("Setting up driver car CRUD routes...");

// CRUD operations for driver vehicles
router.post("/addcar", authenticationToken, addCar); 
router.get("/getdrivercar", authenticationToken, getCarsByDriver);
router.get("/car/:car_id", authenticationToken, getCarDetails);
router.put("/car/:car_id", authenticationToken, updateCar);
router.delete("/car/:car_id", authenticationToken, deleteCar);

console.log("Driver car CRUD routes configured successfully");
console.log("Available driver car routes:");
console.log("  - POST /api/driver/addcar - Add new vehicle");
console.log("  - GET /api/driver/getdrivercar - Get all driver vehicles");
console.log("  - GET /api/driver/car/:car_id - Get vehicle details");
console.log("  - PUT /api/driver/car/:car_id - Update vehicle");
console.log("  - DELETE /api/driver/car/:car_id - Delete vehicle");

module.exports = router;