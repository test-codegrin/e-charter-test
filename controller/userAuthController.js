const {db }= require("../config/db"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuthQueries = require("../config/userQueries/userAuthQueries");
const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
const nodemailer = require("nodemailer");

require("dotenv").config();

const resetCodes = new Map();
const RESET_EXPIRATION = 5 * 60 * 1000; // 5 minutes expiration

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateResetCode = () => Math.floor(1000 + Math.random() * 900000).toString(); 
// Create User
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, address, cityName, zipCode, phoneNo } = req.body;
    const profileImage = req.file;

    // Validation
    if (!firstName || !lastName || !email || !password || !address || !cityName || !zipCode || !phoneNo) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        const [existingUser] = await db.query(userAuthQueries.userMailCheck, [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        let imageURL = null;

        if (profileImage) {
            const uploadedImage = await imagekit.upload({
                file: profileImage.buffer,
                fileName: `${firstName}_profile_${Date.now()}.jpg`,
                folder: "echarter/user-profile",
            });
            imageURL = uploadedImage.url;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userValues = [firstName,lastName, email,hashedPassword, address, cityName, zipCode, phoneNo, imageURL];

        const [result] = await db
            .query(userAuthQueries.userInsert,
                userValues
            );

        res.status(201).json({
            message: "Registration successful.",
            userId: result.insertId,
            profileImage: imageURL,
        });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const [loginUser] = await db.query(userAuthQueries.userLogin, [email]);

        if (loginUser.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = loginUser[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id, 
                email: user.email
            },
            process.env.JWT_SECRET || "your_jwt_secret", 
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user_id: user.user_id
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});


const requestReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        const [user] = await db.query(userAuthQueries.GetUserOnMail, [email]);

        if (!user || user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const code = generateResetCode();
        const expires = Date.now() + RESET_EXPIRATION;
        resetCodes.set(email, { code, expires });

        await transport.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${code}. It expires in 5 minutes.`,
        });

        res.status(200).json({ message: "Reset code sent to email." });
    } catch (err) {
        console.error("Email sending failed:", err);
        res.status(500).json({ error: "Internal error", details: err.message });
    }
});

const verifyResetCode = asyncHandler(async (req, res) => {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
        return res.status(400).json({ error: "Email and code are required" });
    }

    const stored = resetCodes.get(email);
    if (!stored || stored.expires < Date.now()) {
        return res.status(400).json({ error: "Code expired or invalid" });
    }

    if (stored.code !== resetCode) {
        return res.status(400).json({ error: "Incorrect reset code" });
    }

    resetCodes.delete(email);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    res.status(200).json({ message: "Code verified", token });
});

const resetPassword = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token required" });
    }

    const token = authHeader.split(" ")[1];
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const hashed = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query(userAuthQueries.PasswordUpdate, [hashed, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("Reset Error:", err);
        res.status(400).json({ error: "Invalid or expired token", details: err.message });
    }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;


   if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ error: "All fields are required: email, oldPassword, newPassword" });
    }

    try {
        const [rows] = await db.query(userAuthQueries.getHasedPassword, [email]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const currentPassword = rows[0].password;
        const isMatch = await bcrypt.compare(oldPassword, currentPassword);

        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect old password" });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        const [update] = await db.query(userAuthQueries.PasswordUpdate, [hashedNew, email]);

        if (update.affectedRows === 0) {
            return res.status(500).json({ error: "Password update failed" });
        }

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});


module.exports = { registerUser, loginUser, requestReset, verifyResetCode, resetPassword, updatePassword };
