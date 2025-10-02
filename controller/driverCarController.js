const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const driverCarQueries = require("../config/driverQueries/driverCarQueries");
const imagekit = require("../config/imagekit");

// Add Car - UPDATED with car_image
const addCar = asyncHandler(async (req, res) => {
  const { 
    carName, carNumber, carSize, carType, 
    bus_capacity, vehicle_age, vehicle_condition, 
    specialized_services, wheelchair_accessible, 
    vehicle_features, maintenance_schedule, 
    insurance_expiry, license_plate_expiry 
  } = req.body;

  const driver_id = req.user?.driver_id; 

  if (!carName || !carNumber || !carSize || !carType || !driver_id) {
    return res.status(400).json({ message: "All required fields must be provided" });
  }

  // ✅ Upload car image via ImageKit
  let car_image = null;
  if (req.file) { // if using multer
    const uploadResult = await imagekit.upload({
      file: req.file.buffer, // use buffer if using multer memoryStorage
      fileName: `car_${Date.now()}_${req.file.originalname}`,
      folder: "/cars"
    });
    car_image = uploadResult.url;
  }

  try {
    // Check license plate exists
    const [existingCar] = await db.query(driverCarQueries.checkExistingCarNumber, [carNumber]);
    if (existingCar.length > 0) return res.status(400).json({ message: "License plate number already exists" });

    // Check driver approval
    const [driverCheck] = await db.query(driverCarQueries.getDriverStatusById, [driver_id]);
    if (driverCheck.length === 0) return res.status(404).json({ message: "Driver not found" });
    if (driverCheck[0].status !== 1) return res.status(403).json({ message: "Driver must be approved before adding vehicles" });

    // Insert new car
    const [result] = await db.query(driverCarQueries.insertNewCar, [
      driver_id, carName, carNumber, carSize, carType, 
      car_image, // ✅ store ImageKit URL
      bus_capacity || null,
      vehicle_age || null,
      vehicle_condition || 'good',
      specialized_services ? JSON.stringify(specialized_services) : null,
      wheelchair_accessible || false,
      vehicle_features ? JSON.stringify(vehicle_features) : null,
      maintenance_schedule || null,
      insurance_expiry || null,
      license_plate_expiry || null,
      0
    ]);

    res.status(201).json({ 
      message: "Vehicle added successfully, pending approval",
      car_id: result.insertId,
      carName,
      carNumber,
      car_image,
      status: "pending_approval"
    });

  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all cars for a driver - ENHANCED with detailed info
const getCarsByDriver = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  console.log('Fetching cars for driver:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Unauthorized: driver_id missing in token" });
  }

  try {
    // Enhanced query to get all car details
    const [cars] = await db.query(
      driverCarQueries.getCarsByDriver
      , [driver_id]);

    // Parse JSON fields
    const formattedCars = cars.map(car => ({
      ...car,
      specialized_services: car.specialized_services ? JSON.parse(car.specialized_services) : [],
      vehicle_features: car.vehicle_features ? JSON.parse(car.vehicle_features) : [],
      wheelchair_accessible: Boolean(car.wheelchair_accessible)
    }));

    console.log(`Found ${formattedCars.length} cars for driver ${driver_id}`);

    res.status(200).json({
      message: "Cars fetched successfully",
      count: formattedCars.length,
      cars: formattedCars
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get car details by ID - NEW
const getCarDetails = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const driver_id = req.user?.driver_id;

  console.log('Fetching car details:', car_id, 'for driver:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Unauthorized: driver_id missing in token" });
  }

  try {
    const [cars] = await db.query(
      driverCarQueries.getCarById
    , [car_id, driver_id]);

    if (cars.length === 0) {
      return res.status(404).json({ message: "Car not found or access denied" });
    }

    const car = cars[0];
    
    // Parse JSON fields
    const formattedCar = {
      ...car,
      specialized_services: car.specialized_services ? JSON.parse(car.specialized_services) : [],
      vehicle_features: car.vehicle_features ? JSON.parse(car.vehicle_features) : [],
      wheelchair_accessible: Boolean(car.wheelchair_accessible)
    };

    res.status(200).json({
      message: "Car details fetched successfully",
      car: formattedCar
    });
  } catch (error) {
    console.error("Error fetching car details:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update car - NEW
const updateCar = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const driver_id = req.user?.driver_id;
  const updateData = req.body;

  console.log('Updating car:', car_id, 'for driver:', driver_id, 'with data:', updateData);

  if (!driver_id) {
    return res.status(401).json({ message: "Unauthorized: driver_id missing in token" });
  }

  try {
    // Check if car exists and belongs to driver
    const [existingCar] = await db.query(
      driverCarQueries.getExistingCarById,
      [car_id, driver_id]
    );

    if (existingCar.length === 0) {
      return res.status(404).json({ message: "Car not found or access denied" });
    }

    // Check if license plate is being changed and if it already exists
    if (updateData.carNumber) {
      const [duplicateCheck] = await db.query(
        driverCarQueries.checkDuplicateCarNumber,
        [updateData.carNumber, car_id]
      );

      if (duplicateCheck.length > 0) {
        return res.status(400).json({ message: "License plate number already exists" });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'carName', 'carNumber', 'carSize', 'carType', 'bus_capacity',
      'vehicle_age', 'vehicle_condition', 'specialized_services',
      'wheelchair_accessible', 'vehicle_features', 'maintenance_schedule',
      'insurance_expiry', 'license_plate_expiry'
    ];

    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        
        // Handle JSON fields
        if (field === 'specialized_services' || field === 'vehicle_features') {
          updateValues.push(Array.isArray(updateData[field]) ? JSON.stringify(updateData[field]) : updateData[field]);
        } else if (field === 'wheelchair_accessible') {
          updateValues.push(Boolean(updateData[field]));
        } else {
          updateValues.push(updateData[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // If car was previously approved and significant changes are made, reset to pending
    const significantFields = ['carNumber', 'carType', 'carSize'];
    const hasSignificantChanges = significantFields.some(field => updateData.hasOwnProperty(field));
    
    if (hasSignificantChanges && existingCar[0].status === 1) {
      updateFields.push('status = ?');
      updateValues.push(0); // Reset to pending approval
    }

    updateValues.push(car_id);

    const updateQuery = `UPDATE car SET ${updateFields.join(', ')} WHERE car_id = ?`;
    
    const [result] = await db.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log('Car updated successfully:', car_id);

    // Fetch updated car details
    const [updatedCar] = await db.query(
     driverCarQueries.getUpdatedCarById
    , [car_id]);

    const car = updatedCar[0];
    const formattedCar = {
      ...car,
      specialized_services: car.specialized_services ? JSON.parse(car.specialized_services) : [],
      vehicle_features: car.vehicle_features ? JSON.parse(car.vehicle_features) : [],
      wheelchair_accessible: Boolean(car.wheelchair_accessible)
    };

    res.status(200).json({
      message: hasSignificantChanges && existingCar[0].status === 1 
        ? "Vehicle updated successfully. Significant changes require re-approval."
        : "Vehicle updated successfully",
      car: formattedCar
    });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Delete car - NEW
const deleteCar = asyncHandler(async (req, res) => {
  const { car_id } = req.params;
  const driver_id = req.user?.driver_id;

  console.log('Deleting car:', car_id, 'for driver:', driver_id);

  if (!driver_id) {
    return res.status(401).json({ message: "Unauthorized: driver_id missing in token" });
  }

  try {
    // Check if car exists and belongs to driver
    const [existingCar] = await db.query(
      driverCarQueries.getCarForDelete,
      [car_id, driver_id]
    );

    if (existingCar.length === 0) {
      return res.status(404).json({ message: "Car not found or access denied" });
    }

    // Check if car is currently assigned to any active trips
    const [activeTrips] = await db.query(
      driverCarQueries.checkActiveTrips,
      [car_id]
    );

    if (activeTrips.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete vehicle with active trips. Please complete or cancel active trips first.",
        activeTrips: activeTrips.length
      });
    }

    // Delete the car
    const [result] = await db.query(driverCarQueries.deleteCar, [car_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log('Car deleted successfully:', car_id);

    res.status(200).json({
      message: "Vehicle deleted successfully",
      deletedCar: {
        car_id: parseInt(car_id),
        carName: existingCar[0].carName,
        carNumber: existingCar[0].carNumber
      }
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  addCar,
  getCarsByDriver,
  getCarDetails,
  updateCar,
  deleteCar
};