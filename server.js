const express = require("express")
const cors = require("cors")
const { db } = require("./config/db")

// Import routes
const userAuthRoutes = require("./routes/userAuthRoutes")
const adminAuthRoutes = require("./routes/adminAuthRoutes")
const driverRoutes = require("./routes/driverAuthRoutes")
const verificationRoutes = require("./routes/verificationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const driverCarRoutes = require("./routes/driverCarRoutes")
const userRoutes = require("./routes/userRoutes")
const tripBookingRoutes = require("./routes/tripBookingRoutes")

// Import new enhanced routes
const pricingRoutes = require("./routes/pricingRoutes")
const enhancedTripRoutes = require("./routes/enhancedTripRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: "*", // Configure this properly for production
}));

app.use(express.json())

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "eCharter API is running",
        timestamp: new Date().toISOString()
    });
});

// API Routes - Fixed route definitions
app.use("/api/user", userAuthRoutes)
app.use("/api/admin", adminAuthRoutes)
app.use("/api/driver", driverRoutes)
app.use("/api/verification", verificationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/driver", driverCarRoutes)
app.use("/api/user", userRoutes)
app.use("/api/trip", tripBookingRoutes)

// Enhanced API Routes
app.use("/api/pricing", pricingRoutes)
app.use("/api/trips", enhancedTripRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/notifications", notificationRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `The requested route ${req.originalUrl} does not exist`
    });
});

async function testConnection() {
    try {
        const [rows] = await db.query("SELECT 1 as test")
        console.log("✅ Database connected successfully");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        return false;
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 eCharter API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.log("⚠️  Server started but database connection failed");
        console.log("   Please check your database configuration");
    }
    
    console.log("🎯 Available API endpoints:");
    console.log("   - User Auth: /api/user/*");
    console.log("   - Admin: /api/admin/*");
    console.log("   - Driver: /api/driver/*");
    console.log("   - Pricing: /api/pricing/*");
    console.log("   - Trips: /api/trips/*");
    console.log("   - Invoices: /api/invoices/*");
    console.log("   - Notifications: /api/notifications/*");
})