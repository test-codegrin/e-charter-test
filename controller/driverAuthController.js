const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const driverAuthQueries = require("../config/driverQueries/driverAuthQueries");
const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
const nodemailer = require("nodemailer");
require("dotenv").config();

const resetCodes = new Map();
const RESET_EXPIRATION = 5 * 60 * 1000;

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateResetCode = () =>
  Math.floor(1000 + Math.random() * 900000).toString();

// 🔹 Register Driver
const registerDriver = asyncHandler(async (req, res) => {
  const { driverName, email, password, address, cityName, zipCord, phoneNo } =
    req.body;
  // const file = req.file;

  if (
    !driverName ||
    !email ||
    !password ||
    !address ||
    !cityName ||
    !zipCord ||
    !phoneNo
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
    driverName,
    email,
    hashedPassword,
    address,
    cityName,
    zipCord,
    phoneNo,
  ];

  const [result] = await db.query(driverAuthQueries.driverInsert, driverValues);

  res
    .status(201)
    .json({
      message: "Driver registered successfully, pending approval",
      driverId: result.insertId,
    });
});

// 🔹 Login Driver
const loginDriver = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("Driver login attempt:", { email });

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [driver] = await db.query(driverAuthQueries.driverLogin, [email]);

  if (driver.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if driver is approved
  if (driver[0].status !== 1) {
    return res
      .status(403)
      .json({ error: "Your account is not approved by the admin yet." });
  }

  const isMatch = await bcrypt.compare(password, driver[0].password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Get full driver details for response
  const [driverDetails] = await db.query(driverAuthQueries.driverMailCheck, [
    email,
  ]);
  const driverData = driverDetails[0];

  const token = jwt.sign(
    {
      driver_id: driver[0].driver_id,
      email: driver[0].email,
      role: "driver",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Return consistent user object matching admin login format
  const user = {
    driver_id: driverData.driver_id,
    driverName: driverData.driverName,
    email: driverData.email,
    role: "driver",
  };

  console.log("Driver login successful:", {
    driver_id: driver[0].driver_id,
    email: driver[0].email,
  });

  res.status(200).json({
    message: "Login successful",
    token,
    user,
  });
});

// 🔹 Request Password Reset
const requestDriverReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const [driver] = await db.query(driverAuthQueries.getDriverByEmail, [email]);
  if (!driver || driver.length === 0)
    return res.status(404).json({ error: "Driver not found" });

  const code = generateResetCode();
  resetCodes.set(email, { code, expires: Date.now() + RESET_EXPIRATION });

  await transport.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Driver Password Reset Code",
    text: `Your reset code is: ${code}. It expires in 5 minutes.`,
  });

  res.status(200).json({ message: "Reset code sent" });
});

// 🔹 Verify Reset Code
const verifyDriverResetCode = asyncHandler(async (req, res) => {
  const { email, resetCode } = req.body;
  const stored = resetCodes.get(email);

  if (!stored || stored.expires < Date.now())
    return res.status(400).json({ error: "Expired or invalid code" });
  if (stored.code !== resetCode)
    return res.status(400).json({ error: "Incorrect reset code" });

  resetCodes.delete(email);
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  res.status(200).json({ message: "Code verified", token });
});

// 🔹 Reset Password
const resetDriverPassword = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  const { newPassword } = req.body;
  if (!newPassword)
    return res.status(400).json({ error: "New password required" });

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(driverAuthQueries.passwordUpdate, [
      hashed,
      email,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Driver not found" });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Invalid or expired token", details: err.message });
  }
});

// 🔹 Change Password
const updateDriverPassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword)
    return res.status(400).json({ error: "All fields required" });

  const [rows] = await db.query(driverAuthQueries.getHashedPassword, [email]);
  if (rows.length === 0)
    return res.status(404).json({ error: "Driver not found" });

  const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
  if (!isMatch)
    return res.status(401).json({ error: "Incorrect old password" });

  const hashedNew = await bcrypt.hash(newPassword, 10);
  const [update] = await db.query(driverAuthQueries.passwordUpdate, [
    hashedNew,
    email,
  ]);

  if (update.affectedRows === 0)
    return res.status(500).json({ error: "Password update failed" });

  res.status(200).json({ message: "Password updated successfully" });
});

module.exports = {
  registerDriver,
  loginDriver,
  requestDriverReset,
  verifyDriverResetCode,
  resetDriverPassword,
  updateDriverPassword,
};
