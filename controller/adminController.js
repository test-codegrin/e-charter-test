const {db} = require("../config/db");
const asyncHandler = require("express-async-handler");
const adminGetQueries = require("../config/adminQueries/adminGetQueries");


const  getAllDrivers = asyncHandler(async (req, res) => {
    try {
        const [drivers] = await db.query(adminGetQueries.getAllDrivers);

        res.status(200).json({
            message: "Drivers fetched successfully",
            count: drivers.length,
            drivers
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

const getAllCars = asyncHandler(async (req, res) => {
  try {
    const [cars] = await db.query(adminGetQueries.getAllCars);
    res.status(200).json({
      message: "All cars fetched successfully",
      count: cars.length,
      cars
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


module.exports ={
    getAllDrivers,
    getAllCars
}