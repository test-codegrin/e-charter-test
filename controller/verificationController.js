const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const verificationQueries = require("../config/adminQueries/verificationQueries");

// Approve or Reject Driver - FIXED
const approveDriver = asyncHandler(async (req, res) => {
  const { driver_id } = req.params;
  const { status } = req.body;

  console.log(`Approving driver ${driver_id} with status ${status}`);

  // Validate - status should be 0 (reject), 1 (approve), or 2 (suspend)
  if (![0, 1, 2].includes(Number(status)) || !driver_id) {
    return res.status(400).json({ 
      message: "Invalid driver_id or status (must be 0=reject, 1=approve, 2=suspend)" 
    });
  }

  try {
    // Check if driver exists first
    const [driverCheck] = await db.query(
      `SELECT driver_id, driverName, email, registration_type FROM drivers WHERE driver_id = ?`, 
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
    console.error("Error updating driver status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Approve or Reject Car - FIXED
const approveCar = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const { status } = req.body;

  console.log(`Approving car ${car_id} with status ${status}`);

  // Validate - status should be 0 (reject) or 1 (approve)
  if (![0, 1].includes(Number(status)) || !car_id) {
    return res.status(400).json({ 
      message: "Invalid car_id or status (must be 0=reject, 1=approve)" 
    });
  }

  try {
    // Check if car exists first
    const [carCheck] = await db.query(
      `SELECT c.car_id, c.carName, c.carNumber, d.driverName, d.email 
       FROM car c 
       JOIN drivers d ON c.driver_id = d.driver_id 
       WHERE c.car_id = ?`, 
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
    
    console.log(`Car ${car.carName} (${car.carNumber}) ${statusText.toLowerCase()} successfully`);

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
    console.error("Error updating car status:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get pending approvals - NEW
const getPendingApprovals = asyncHandler(async (req, res) => {
  try {
    // Get pending drivers
    const [pendingDrivers] = await db.query(`
      SELECT 
        driver_id,
        driverName,
        email,
        phoneNo,
        cityName,
        registration_type,
        company_name,
        created_at
      FROM drivers 
      WHERE status = 0
      ORDER BY created_at DESC
    `);

    // Get pending vehicles
    const [pendingVehicles] = await db.query(`
      SELECT 
        c.car_id,
        c.carName,
        c.carNumber,
        c.carType,
        c.carSize,
        d.driverName,
        d.email,
        d.registration_type,
        c.created_at
      FROM car c
      JOIN drivers d ON c.driver_id = d.driver_id
      WHERE c.status = 0
      ORDER BY c.created_at DESC
    `);

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
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = { 
  approveDriver, 
  approveCar, 
  getPendingApprovals 
};