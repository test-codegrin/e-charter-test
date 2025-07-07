const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const userGetQueries = require("../config/userQueries/userGetQueries");

const getApprovedCars = asyncHandler(async (req, res) => {
  try {
    const [cars] = await db.query(userGetQueries.getApprovedCars);
    res.status(200).json({
      message: "Approved cars fetched successfully",
      count: cars.length,
      cars
    });
  } catch (error) {
    console.error("Error fetching approved cars:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const [users] = await db.query(userGetQueries.getAllUsers);

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


module.exports = { getApprovedCars , getAllUsers };
