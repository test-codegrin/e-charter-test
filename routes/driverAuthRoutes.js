const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
    registerDriver,
    loginDriver,
    requestDriverReset,
    verifyDriverResetCode,
    resetDriverPassword,
    updateDriverPassword,
} = require("../controller/driverAuthController");

console.log("Setting up driver auth routes...");

// Authentication routes only
router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/requestreset", requestDriverReset);
router.post("/verifyreset", verifyDriverResetCode);
router.post("/resetpassword", resetDriverPassword);
router.put("/updatepassword", updateDriverPassword);

console.log("Driver auth routes configured successfully");
console.log("Available driver auth routes:");
console.log("  - POST /api/driver/register");
console.log("  - POST /api/driver/login");
console.log("  - POST /api/driver/requestreset");
console.log("  - POST /api/driver/verifyreset");
console.log("  - POST /api/driver/resetpassword");
console.log("  - PUT /api/driver/updatepassword");

module.exports = router;