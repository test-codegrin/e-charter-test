const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
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
  try {
  const userId = req.user.user_id;
  const { firstName, lastName, address, cityName, zipCode, phoneNo } = req.body;
  const profileImage = req.file;

  if (!firstName || !lastName || !address || !cityName || !zipCode || !phoneNo) {
    return res.status(400).json({ error: "All fields except email are required" });
  }

 
    const [userRows] = await db.query(userPutQueries.getUserById, [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUser = userRows[0];
    let newImageUrl = currentUser.profileImage;

    if (profileImage) {
      if (currentUser.profileImage && currentUser.profileImage.includes("imagekit.io")) {
        const oldImagePath = currentUser.profileImage.split("/echarter/")[1];
        if (oldImagePath) {
          await imagekit.deleteFile(`echarter/${oldImagePath}`);
        }
      }

      const uploadResponse = await imagekit.upload({
        file: profileImage.buffer,
        fileName: `${firstName}_profile_${Date.now()}.jpg`,
        folder: "echarter/user-profile"
      });

      newImageUrl = uploadResponse.url;
    }

    const updateValues = [firstName, lastName, address, cityName, zipCode, phoneNo, newImageUrl, userId];
    await db.query(userPutQueries.updateUserProfile, updateValues);
    console.log(newImageUrl);

    res.status(200).json({
      message: "Profile updated successfully",
      profileImage: newImageUrl,
    });

  } catch (err) {
    console.error("Edit Profile Error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
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


module.exports = { getApprovedCars, editUserProfile, getUserProfile };
