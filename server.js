const express = require("express")
const cors = require("cors")
const { db } = require("./config/db")
const userAuthRoutes = require("./routes/userAuthRoutes")
const adminAuthRoutes = require("./routes/adminAuthRoutes")
const driverRoutes = require("./routes/driverAuthRoutes")
const verificationRoutes = require("./routes/verificationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const driverCarRoutes = require("./routes/driverCarRoutes")
const userRoutes = require("./routes/userRoutes")
const tripBookingRoutes = require("./routes/tripBookingRoutes")

const app = express();
const PORT = 3000

app.use(cors({
    origin: "*", // allows all origins
}));

app.use(express.json())

app.use("/api/user", userAuthRoutes)
app.use("/api/admin",adminAuthRoutes)
app.use("/api/driver", driverRoutes)
app.use("/api/verification", verificationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/driver", driverCarRoutes)
app.use("/api/user", userRoutes)
app.use("/api/trip", tripBookingRoutes)
    
async function testConnection() {
    try {
        const [rows] = await db.query("SELECT 1")
        console.log("DB connected");
    } catch (error) {
        console.error("Failed to connect", error.message);
        process.exit(1)
    }
}

app.listen(PORT, async () => {
    await testConnection()
    console.log(`Server running :${PORT}`);
})
