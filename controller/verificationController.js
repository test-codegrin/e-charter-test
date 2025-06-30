const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const adminPostQueries = require("../config/adminQueries/verificationQueries");
const verificationQueries = require("../config/adminQueries/verificationQueries");

// Approve or Reject Driver
const approveDriver = asyncHandler(async (req, res) => {
  const { driver_id } = req.params;
  const { status } = req.body;

  // Validate
  if (![0, 1].includes(Number(status)) || !driver_id) {
    return res.status(400).json({ message: "Invalid driver_id or status (must be 0 or 1)" });
  }

  try {
    const [result] = await db.query(adminPostQueries.updateDriverStatus, [status, driver_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const statusText = status == 1 ? "Approved" : "Rejected";

    res.status(200).json({ message: `Driver ${statusText} successfully.` });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

const approveCar = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const { status } = req.body;

  if (![0, 1].includes(Number(status)) || !car_id) {
    return res.status(400).json({ message: "Invalid car_id or status (must be 0 or 1)" });
  }

  try {
    const [result] = await db.query(verificationQueries.updateCarStatus, [status, car_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const statusText = status === 1 ? "Approved" : "Rejected";
    res.status(200).json({ message: `Car ${statusText} successfully.` });
  } catch (error) {
    console.error("Error updating car status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


module.exports = { approveDriver,approveCar };
