const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
require("dotenv").config();



// 🔹 Register Vehicle
const registerVehicle = asyncHandler(async (req, res) => {
  const { name,maker,model,registration_number,vehicle_type,number_of_seats,fuel_type,vehicle_color, } =
    req.body;
  // const file = req.file;

  if (
    !firstname || !lastname || !email || !password || !phone_no || !gender || !address || !city_name || !zip_code || !year_of_experiance
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const [existingDriver] = await db.query(driverAuthQueries.driverMailCheck, [
    email,
  ]);
  if (existingDriver.length > 0) {
    return res.status(400).json({ error: "Email already exists" });
  }

  // let imageURL = null;
  // if (file) {
  //     const uploaded = await imagekit.upload({
  //         file: file.buffer,
  //         fileName: `${driverName}_profile_${Date.now()}.jpg`,
  //         folder: "echarter/driver-profile",
  //     });
  //     imageURL = uploaded.url;
  // }

  const hashedPassword = await bcrypt.hash(password, 10);
  const driverValues = [
    firstname,lastname, email, hashedPassword,phone_no,gender,driver_type,fleet_company_id, address, city_name, zip_code,year_of_experiance
  ];

  const [result] = await db.query(driverAuthQueries.driverInsert, driverValues);

  res
    .status(201)
    .json({
      message: "Driver registered successfully, pending approval",
      driverId: result.insertId,
    });
});



module.exports = {
  registerVehicle
};
