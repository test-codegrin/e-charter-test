const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverCarQueries = require("../config/driverQueries/driverPostQueries");
const driverGetQueries = require("../config/driverQueries/driverGetQueries");

const addCar = asyncHandler(async (req, res) => {
  const { carName, carNumber, carSize, carType } = req.body;
  const driver_id = req.user?.driver_id; 

  if (!carName || !carNumber || !carSize || !carType || !driver_id) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  try {
    await db.query(driverCarQueries.insertCarQuery, [driver_id, carName, carNumber, carSize, carType]);
    res.status(201).json({ message: "Car added successfully, pending approval" });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getCarsByDriver = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Unauthorized: driver_id missing in token" });
  }

  try {
    const [cars] = await db.query(driverGetQueries.getCarsByDriverId, [driver_id]);

    res.status(200).json({
      message: "Cars fetched successfully",
      count: cars.length,
      cars
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  addCar,
  getCarsByDriver
};
