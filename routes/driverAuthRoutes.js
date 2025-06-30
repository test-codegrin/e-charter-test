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

router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/requestreset", requestDriverReset);
router.post("/verifyreset", verifyDriverResetCode);
router.post("/resetpassword", resetDriverPassword);
router.put("/updatepassword", updateDriverPassword);

module.exports = router;
