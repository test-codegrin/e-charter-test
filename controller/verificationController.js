const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const verificationQueries = require("../config/adminQueries/verificationQueries");

// Approve or Reject Driver
const approveDriver = asyncHandler(async (req, res) => {
  const { driver_id } = req.params;
  const { status, reason } = req.body;

  console.log('Approve driver request:', { driver_id, status, reason });

  if (!['in_review', 'approved', 'rejected'].includes(status) || !driver_id) {
    return res.status(400).json({ 
      message: "Invalid driver_id or status (must be 'in_review', 'approved', or 'rejected')" 
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

    // FIXED: Update driver status with string value
    const [result] = await db.query(
      verificationQueries.updateDriverStatus,
      [status, reason,driver_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Failed to update driver status" });
    }

    const statusText = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'In Review';
    
    console.log(`Driver ${driver.firstname} ${driver.lastname} (${driver.email}) ${statusText.toLowerCase()} successfully`);

    // FIXED: Return response matching frontend expectations
    res.status(200).json({ 
      success: true,
      message: `${driver.driver_type === 'fleet_partner' ? 'Fleet Partner' : 'Driver'} ${statusText} successfully`,
    });

  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Approve or Reject Company
const approveFleetCompany = asyncHandler(async (req, res) => {
  const { fleet_company_id } = req.params;
  const { status, reason } = req.body;

  console.log('Approve fleet company request:', { fleet_company_id, status, reason });

  // Validate status
  if (!['in_review', 'approved', 'rejected'].includes(status) || !fleet_company_id) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid fleet_company_id or status (must be 'in_review', 'approved', or 'rejected')" 
    });
  }

  try {
    // Check if fleet company exists
    const [companyCheck] = await db.query(
      verificationQueries.checkFleetCompanyExists,
      [fleet_company_id]
    );

    if (companyCheck.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Fleet company not found" 
      });
    }

    const company = companyCheck[0];

    // Check if status is already the same
    if (company.status === status) {
      return res.status(200).json({
        success: true,
        message: `Fleet company is already ${status}`,
        company: {
          fleet_company_id: company.fleet_company_id,
          name: company.company_name,
          current_status: status
        }
      });
    }

    // Update fleet company status
    const [result] = await db.query(
      verificationQueries.updateFleetCompanyStatus,
      [status, reason, fleet_company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ 
        success: false,
        message: "Failed to update fleet company status" 
      });
    }

    const statusText = status === 'approved' ? 'Approved' : 
                      status === 'rejected' ? 'Rejected' : 'In Review';
    
    console.log(`Fleet Company ${company.company_name} (${company.email}) ${statusText.toLowerCase()} successfully`);

    res.status(200).json({ 
      success: true,
      message: `Fleet company ${statusText.toLowerCase()} successfully`,
      company: {
        fleet_company_id: company.fleet_company_id,
        name: company.company_name,
        email: company.email,
        previous_status: company.status,
        new_status: status,
        status_text: statusText
      }
    });

  } catch (error) {
    console.error('Approve fleet company error:', error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Approve or Reject Vehicle
const approveVehicle = asyncHandler(async (req, res) => {
  const { vehicle_id } = req.params;
  const { status, reason } = req.body;

  console.log('Approve vehicle request:', { vehicle_id, status, reason });

  if (!['in_review', 'approved', 'rejected'].includes(status) || !vehicle_id) {
    return res.status(400).json({ 
      message: "Invalid vehicle_id or status (must be 'in_review', 'approved', or 'rejected')" 
    });
  }

  try {
    // Check if vehicle exists first
    const [vehicleCheck] = await db.query(
      verificationQueries.checkVehicleExists,
      [vehicle_id]
    );

    if (vehicleCheck.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const vehicle = vehicleCheck[0];

    // FIXED: Update driver status with string value
    const [result] = await db.query(
      verificationQueries.updateVehicleStatus,
      [status, reason, vehicle_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Failed to update vehicle status" });
    }

    const statusText = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'In Review';
    
    console.log(`Vehicle ${vehicle.maker} ${vehicle.model} (${vehicle.email}) ${statusText.toLowerCase()} successfully`);

    // FIXED: Return response matching frontend expectations
    res.status(200).json({ 
      success: true,
      message: `${vehicle.maker} ${vehicle.model} ${statusText} successfully`,
    });

  } catch (error) {
    console.error('Approve vehicle error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});




// // Approve or Reject Car - FIXED
// const approveCar = asyncHandler(async (req, res) => {
//   const { car_id } = req.params;
//   const { status } = req.body;


//   // Validate - status should be 0 (reject) or 1 (approve)
//   if (![0, 1].includes(Number(status)) || !car_id) {
//     return res.status(400).json({ 
//       message: "Invalid car_id or status (must be 0=reject, 1=approve)" 
//     });
//   }

//   try {
//     // Check if car exists first
//     const [carCheck] = await db.query(
//       verificationQueries.checkCarExists, 
//       [car_id]
//     );

//     if (carCheck.length === 0) {
//       return res.status(404).json({ message: "Car not found" });
//     }

//     const car = carCheck[0];

//     // Update car status
//     const [result] = await db.query(verificationQueries.updateCarStatus, [status, car_id]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Failed to update car status" });
//     }

//     const statusText = status === 1 ? "Approved" : "Rejected";
    

//     res.status(200).json({ 
//       message: `Car ${statusText} successfully.`,
//       car: {
//         car_id: car.car_id,
//         name: car.carName,
//         number: car.carNumber,
//         driver: car.driverName,
//         driver_email: car.email,
//         new_status: statusText
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// });

// Get pending approvals - NEW
// const getPendingApprovals = asyncHandler(async (req, res) => {
//   try {
//     // Get pending drivers
//     const [pendingDrivers] = await db.query(
//       verificationQueries.getPendingDrivers
//     );

//     // Get pending vehicles
//     const [pendingVehicles] = await db.query(
//       verificationQueries.getPendingVehicles
//     );

//     res.status(200).json({
//       message: "Pending approvals fetched successfully",
//       pendingDrivers,
//       pendingVehicles,
//       summary: {
//         totalPendingDrivers: pendingDrivers.length,
//         totalPendingVehicles: pendingVehicles.length,
//         totalPending: pendingDrivers.length + pendingVehicles.length
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// });

module.exports = { 
  approveDriver, 
  approveVehicle, 
  // getPendingApprovals,
  approveFleetCompany
};