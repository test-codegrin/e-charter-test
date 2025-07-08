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


// CRUD operations for driver vehicles
router.post("/addcar", authenticationToken, addCar); 
router.get("/getdrivercar", authenticationToken, getCarsByDriver);
router.get("/car/:car_id", authenticationToken, getCarDetails);
router.put("/car/:car_id", authenticationToken, updateCar);
router.delete("/car/:car_id", authenticationToken, deleteCar);


module.exports = router;