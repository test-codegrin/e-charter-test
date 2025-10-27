const express = require("express")
const cors = require("cors")
const { db } = require("./config/db")

// Import routes
const userAuthRoutes = require("./routes/userAuthRoutes")
const adminAuthRoutes = require("./routes/adminAuthRoutes")
const driverAuthRoutes = require("./routes/driverAuthRoutes")
const driverRoutes = require("./routes/driverRoutes")
const verificationRoutes = require("./routes/verificationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const driverCarRoutes = require("./routes/driverCarRoutes")
const userRoutes = require("./routes/userRoutes")
const tripBookingRoutes = require("./routes/tripBookingRoutes")
const fleetCompanyAuthRoutes = require("./routes/fleetCompanyAuthRoutes")
// const fleetCompanyRoutes = require("./routes/fleetCompanyRoutes")

// Import new enhanced routes
const pricingRoutes = require("./routes/pricingRoutes")
const enhancedTripRoutes = require("./routes/enhancedTripRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const fleetPartnerRoutes = require("./routes/fleetPartnerRoutes")
const settingsRoutes = require("./routes/settingsRoutes")

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

console.log("🔧 Registering API routes...");

// API Routes - Fixed order and proper registration
try {
    // User routes
    app.use("/api/user", userAuthRoutes)
    app.use("/api/user", userRoutes)

    // Admin routes
    app.use("/api/admin", adminAuthRoutes)
    app.use("/api/admin", adminRoutes)

    // Driver routes - FIXED: Separate auth and main driver routes
    app.use("/api/driver", driverAuthRoutes)
    app.use("/api/driver", driverRoutes)
    app.use("/api/driver", driverCarRoutes)

    //Vehicle routes
    // app.use("/api/vehicle", vehicleRoutes)

    // Fleet company routes
    app.use("/api/fleet-company", fleetCompanyAuthRoutes)
    // app.use("/api/fleet-company", fleetCompanyRoutes)

    // Fleet partner routes
    app.use("/api/fleet", fleetPartnerRoutes)

    // Verification routes
    app.use("/api/verification", verificationRoutes)

    // Trip booking routes
    app.use("/api/trip", tripBookingRoutes)

    // Enhanced API Routes
    app.use("/api/pricing", pricingRoutes)
    app.use("/api/trips", enhancedTripRoutes)
    app.use("/api/invoices", invoiceRoutes)
    
    app.use("/api/notifications", notificationRoutes)

    // Settings routes
    app.use("/api/admin/settings", settingsRoutes)

    console.log("🎉 All routes registered successfully!");
} catch (routeError) {
    console.error("❌ Error registering routes:", routeError);
    process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Root route to avoid 404 on GET /
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the eCharter API!",
        health: "https://e-charter-test.onrender.com/health",
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
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

    console.log("\n🎯 Server ready for requests!");
})