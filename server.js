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

console.log("Registering routes...");

// API Routes - All routes properly defined without malformed parameters
try {
    app.use("/api/user", userAuthRoutes)
    console.log("✓ User auth routes registered");
    
    app.use("/api/admin", adminAuthRoutes)
    console.log("✓ Admin auth routes registered");
    
    app.use("/api/driver", driverRoutes)
    console.log("✓ Driver routes registered");
    
    app.use("/api/verification", verificationRoutes)
    console.log("✓ Verification routes registered");
    
    app.use("/api/admin", adminRoutes)
    console.log("✓ Admin routes registered");
    
    app.use("/api/driver", driverCarRoutes)
    console.log("✓ Driver car routes registered");
    
    app.use("/api/user", userRoutes)
    console.log("✓ User routes registered");
    
    app.use("/api/trip", tripBookingRoutes)
    console.log("✓ Trip booking routes registered");

    // Enhanced API Routes - Fixed parameter syntax
    app.use("/api/pricing", pricingRoutes)
    console.log("✓ Pricing routes registered");
    
    app.use("/api/trips", enhancedTripRoutes)
    console.log("✓ Enhanced trip routes registered");
    
    app.use("/api/invoices", invoiceRoutes)
    console.log("✓ Invoice routes registered");
    
    app.use("/api/notifications", notificationRoutes)
    console.log("✓ Notification routes registered");
    
    console.log("All routes registered successfully!");
} catch (routeError) {
    console.error("Error registering routes:", routeError);
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

// 404 handler - FIXED: Use proper Express syntax instead of wildcard
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
    
    console.log("🎯 Available API endpoints:");
    console.log("   - User Auth: /api/user/*");
    console.log("   - Admin: /api/admin/*");
    console.log("   - Driver: /api/driver/*");
    console.log("   - Pricing: /api/pricing/*");
    console.log("   - Trips: /api/trips/*");
    console.log("   - Invoices: /api/invoices/*");
    console.log("   - Notifications: /api/notifications/*");
})