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
    console.log("✓ User auth routes registered");
    
    app.use("/api/user", userRoutes)
    console.log("✓ User routes registered");
    
    // Admin routes
    app.use("/api/admin", adminAuthRoutes)
    console.log("✓ Admin auth routes registered");
    
    app.use("/api/admin", adminRoutes)
    console.log("✓ Admin routes registered");
    
    // Driver routes - FIXED: Separate auth and main driver routes
    app.use("/api/driver", driverAuthRoutes)
    console.log("✓ Driver auth routes registered");
    
    app.use("/api/driver", driverRoutes)
    console.log("✓ Driver main routes registered");
    
    app.use("/api/driver", driverCarRoutes)
    console.log("✓ Driver car routes registered");
    
    // Fleet partner routes
    app.use("/api/fleet", fleetPartnerRoutes)
    console.log("✓ Fleet partner routes registered");
    
    // Verification routes
    app.use("/api/verification", verificationRoutes)
    console.log("✓ Verification routes registered");
    
    // Trip booking routes
    app.use("/api/trip", tripBookingRoutes)
    console.log("✓ Trip booking routes registered");

    // Enhanced API Routes
    app.use("/api/pricing", pricingRoutes)
    console.log("✓ Pricing routes registered");
    
    app.use("/api/trips", enhancedTripRoutes)
    console.log("✓ Enhanced trip routes registered");
    
    app.use("/api/invoices", invoiceRoutes)
    console.log("✓ Invoice routes registered");
    
    app.use("/api/notifications", notificationRoutes)
    console.log("✓ Notification routes registered");

    // Settings routes
    app.use("/api/admin/settings", settingsRoutes)
    console.log("✓ Settings routes registered");
    
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

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
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
    
    console.log("\n🎯 Available API endpoints:");
    console.log("   - User Auth: /api/user/*");
    console.log("   - Admin: /api/admin/*");
    console.log("   - Driver: /api/driver/*");
    console.log("   - Fleet Partners: /api/fleet/*");
    console.log("   - Pricing: /api/pricing/*");
    console.log("   - Trips: /api/trips/*");
    console.log("   - Invoices: /api/invoices/*");
    console.log("   - Notifications: /api/notifications/*");
    console.log("   - Settings: /api/admin/settings/*");
    
    console.log("\n📋 Key routes available:");
    console.log("   🔐 Authentication:");
    console.log("     - POST /api/admin/login");
    console.log("     - POST /api/driver/login");
    console.log("     - POST /api/user/login");
    console.log("   🏢 Fleet Partners:");
    console.log("     - POST /api/fleet/register");
    console.log("     - GET /api/admin/fleet-partners");
    console.log("   📊 Admin Dashboard:");
    console.log("     - GET /api/admin/dashboard/stats");
    console.log("     - GET /api/admin/alldrivers");
    console.log("     - GET /api/admin/allcars");
    console.log("     - GET /api/admin/alltrips");
    console.log("   🚗 Driver Dashboard:");
    console.log("     - GET /api/driver/dashboard/stats");
    console.log("     - GET /api/driver/trips");
    console.log("     - GET /api/driver/profile");
    console.log("     - GET /api/driver/getdrivercar");
    console.log("   💰 Business Operations:");
    console.log("     - POST /api/pricing/quote");
    console.log("     - GET /api/invoices/admin/all");
    console.log("     - GET /api/notifications/admin");
    console.log("   ⚙️ System Settings:");
    console.log("     - GET /api/admin/settings");
    console.log("     - PUT /api/admin/settings");
    
    console.log("\n🎯 Server ready for requests!");
})