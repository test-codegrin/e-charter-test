const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    getDashboardStats,
    getDriverTrips,
    getDriverProfile,
    updateDriverProfile,
    getDriverNotificationSettings,
    updateDriverNotificationSettings,
    getDriverFleetSettings,
    updateDriverFleetSettings,
    getDriverPaymentSettings,
    updateDriverPaymentSettings,
    uploadDriverDocument,
    updateProfilePhoto,
    getTripById,
    getVehicleByDriverId,
    getDriverVehicleById,
    uploadVehicleDocument,
    updateVehicleFeatures,
    updateVehicleImage
} = require("../controller/driverController");

const { authenticationToken } = require("../middleware/authMiddleware");


// Dashboard and profile routes
router.get("/dashboard/stats", authenticationToken, getDashboardStats);

router.get("/profile", authenticationToken, getDriverProfile);
router.put('/profile', authenticationToken, updateDriverProfile);
router.put('/profile/photo', authenticationToken, upload.single("profile_image"),updateProfilePhoto);
router.post('/document/upload', authenticationToken, upload.single("document"),uploadDriverDocument);

router.get("/trips", authenticationToken, getDriverTrips);
router.get("/trip/:trip_id", authenticationToken, getTripById);

router.get("/vehicles", authenticationToken, getVehicleByDriverId);
router.get("/vehicle/:vehicle_id", authenticationToken, getDriverVehicleById);
router.post("/vehicle/document/upload", authenticationToken, upload.single("document"), uploadVehicleDocument);
router.put("/vehicle/features/:vehicle_id", authenticationToken, updateVehicleFeatures);
router.put("/vehicle/image/:vehicle_id", authenticationToken, upload.single("document"), updateVehicleImage);

// Settings routes
router.get("/settings/notifications", authenticationToken, getDriverNotificationSettings);
router.put("/settings/notifications", authenticationToken, updateDriverNotificationSettings);
router.get("/settings/fleet", authenticationToken, getDriverFleetSettings);
router.put("/settings/fleet", authenticationToken, updateDriverFleetSettings);
router.get("/settings/payment", authenticationToken, getDriverPaymentSettings);
router.put("/settings/payment", authenticationToken, updateDriverPaymentSettings);



module.exports = router;