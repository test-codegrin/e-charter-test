const { db } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAuthQueries = require("../config/adminQueries/adminAuthQueries");
const asyncHandler = require("express-async-handler");
const imagekit = require("../config/imagekit");
const nodemailer = require("nodemailer");

require("dotenv").config();

const adminRegister = asyncHandler(async (req, res) => {
    const { adminName, email, password } = req.body;
    // const adminImage = req.file;

    // Validation
    if (!adminName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    try {
        // Check if admin email already exists
        const [existingAdmin] = await db.query(adminAuthQueries.adminMailCheck, [email]);

        if (existingAdmin.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // let imageURL = null;

        // Upload profile image if available
        // if (adminImage) {
        //     const uploadedImage = await imagekit.upload({
        //         file: file.buffer,
        //         fileName: `${adminName}_admin_profile_${Date.now()}.jpg`,
        //         folder: "echarter/admin-profile",
        //     });
        //     imageURL = uploadedImage.url;
        // }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminValues = [adminName, email, hashedPassword];

        // Insert admin into DB
        const [result] = await db.query(adminAuthQueries.adminInsert, adminValues);

        res.status(201).json({
            message: "Admin registered successfully.",
            adminId: result.insertId,
            // profileImage: imageURL,
        });

    } catch (err) {
        console.error("Admin Register Error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

  
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
    
        const [adminRows] = await db.query(adminAuthQueries.adminMailCheck, [email]);

        if (adminRows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const admin = adminRows[0];

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                admin_id: admin.admin_id,
                adminName: admin.adminName,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            admin_id: admin.admin_id,
        });

    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});




module.exports = { adminRegister,adminLogin }