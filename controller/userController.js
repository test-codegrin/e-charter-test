const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const userGetQueries = require("../config/userQueries/userGetQueries");
const userPutQueries = require("../config/userQueries/userPutQueries");

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

const editUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: User ID missing" });
  }

  const {
    firstName,
    lastName,
    address,
    cityName,
    zipCode,
    phoneNo,
  } = req.body;

  let profileImage = req.body.profileImage || null;

  // Image upload via ImageKit
  if (req.file && req.file.buffer) {
    const fileName = `user_${userId}_${Date.now()}`;
    const uploadResponse = await imagekitUpload(req.file.buffer, fileName);
    profileImage = uploadResponse.url;
  }

  if (
    !firstName ||
    !lastName ||
    !address ||
    !cityName ||
    !zipCode ||
    !phoneNo
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const [result] = await db.query(userPutQueries.updateUserProfileById, [
    firstName,
    lastName,
    address,
    cityName,
    zipCode,
    phoneNo,
    profileImage,
    userId,
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "User not found or no changes made" });
  }

  res.status(200).json({ message: "Profile updated successfully", profileImage });
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


module.exports = { getApprovedCars,editUserProfile, getUserProfile };
