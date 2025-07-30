const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const userGetQueries = require("../config/userQueries/userGetQueries");

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID not found" });
  }

  const [user] = await db.query(userGetQueries.getUserProfileById, [userId]);

  if (!user.length) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user[0]);
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
