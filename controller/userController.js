const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const userGetQueries = require("../config/userQueries/userGetQueries");

const getUserProfile = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;   
  try {
    const [user] = await db.query(userGetQueries.getUserProfile, [user_id]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user: user[0]
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

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





module.exports = { getApprovedCars,getUserProfile };
