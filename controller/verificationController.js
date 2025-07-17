const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const verificationQueries = require("../config/adminQueries/verificationQueries");

// Approve or Reject Driver - FIXED
const approveDriver = asyncHandler(async (req, res) => {
  const { driver_id } = req.params;
  const { status } = req.body;


  // Validate - status should be 0 (reject), 1 (approve), or 2 (suspend)
  if (![0, 1, 2].includes(Number(status)) || !driver_id) {
    return res.status(400).json({ 
      message: "Invalid driver_id or status (must be 0=reject, 1=approve, 2=suspend)" 
    });
  }

  try {
    // Check if driver exists first
    const [driverCheck] = await db.query(
      verificationQueries.checkDriverExists,
      [driver_id]
    );

    if (driverCheck.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const driver = driverCheck[0];

    // Update driver status
    const [result] = await db.query(verificationQueries.updateDriverStatus, [status, driver_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Failed to update driver status" });
    }

    const statusText = status == 1 ? "Approved" : status == 2 ? "Suspended" : "Rejected";
    
    console.log(`Driver ${driver.driverName} (${driver.email}) ${statusText.toLowerCase()} successfully`);

    res.status(200).json({ 
      message: `${driver.registration_type === 'fleet_partner' ? 'Fleet Partner' : 'Driver'} ${statusText} successfully.`,
      driver: {
        driver_id: driver.driver_id,
        name: driver.driverName,
        email: driver.email,
        type: driver.registration_type,
        new_status: statusText
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Approve or Reject Car - FIXED
const approveCar = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const { status } = req.body;


  // Validate - status should be 0 (reject) or 1 (approve)
  if (![0, 1].includes(Number(status)) || !car_id) {
    return res.status(400).json({ 
      message: "Invalid car_id or status (must be 0=reject, 1=approve)" 
    });
  }

  try {
    // Check if car exists first
    const [carCheck] = await db.query(
      verificationQueries.checkCarExists, 
      [car_id]
    );

    if (carCheck.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const car = carCheck[0];

    // Update car status
    const [result] = await db.query(verificationQueries.updateCarStatus, [status, car_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Failed to update car status" });
    }

    const statusText = status === 1 ? "Approved" : "Rejected";
    

    res.status(200).json({ 
      message: `Car ${statusText} successfully.`,
      car: {
        car_id: car.car_id,
        name: car.carName,
        number: car.carNumber,
        driver: car.driverName,
        driver_email: car.email,
        new_status: statusText
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get pending approvals - NEW
const getPendingApprovals = asyncHandler(async (req, res) => {
  try {
    // Get pending drivers
    const [pendingDrivers] = await db.query(
      verificationQueries.getPendingDrivers
    );

    // Get pending vehicles
    const [pendingVehicles] = await db.query(
      verificationQueries.getPendingVehicles
    );

    res.status(200).json({
      message: "Pending approvals fetched successfully",
      pendingDrivers,
      pendingVehicles,
      summary: {
        totalPendingDrivers: pendingDrivers.length,
        totalPendingVehicles: pendingVehicles.length,
        totalPending: pendingDrivers.length + pendingVehicles.length
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = { 
  approveDriver, 
  approveCar, 
  getPendingApprovals 
};