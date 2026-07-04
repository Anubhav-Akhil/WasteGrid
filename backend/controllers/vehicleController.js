import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).populate('driver', 'name email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
export const createVehicle = async (req, res) => {
  const { vehicleNumber, driverId, status, fuelLevel, capacity, currentLoad, latitude, longitude } = req.body;

  try {
    const vehicleExists = await Vehicle.findOne({ vehicleNumber });

    if (vehicleExists) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }

    const vehicle = new Vehicle({
      vehicleNumber,
      driver: driverId || null,
      status: status || 'Idle',
      fuelLevel: fuelLevel || 100,
      capacity: capacity || 1000,
      currentLoad: currentLoad || 0,
      latitude: latitude || 30.7046, // Default default center location (e.g. Chandigarh)
      longitude: longitude || 76.7179
    });

    const createdVehicle = await vehicle.save();

    // If driver is assigned, update user too
    if (driverId) {
      await User.findByIdAndUpdate(driverId, { vehicleAssigned: createdVehicle._id });
    }

    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res) => {
  const { driverId, status, fuelLevel, capacity, currentLoad, latitude, longitude } = req.body;

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      // Manage driver assignment change
      if (driverId !== undefined) {
        // If driver changed
        if (vehicle.driver && vehicle.driver.toString() !== driverId) {
          // Remove from old driver
          await User.findByIdAndUpdate(vehicle.driver, { vehicleAssigned: null });
        }
        
        vehicle.driver = driverId || null;

        if (driverId) {
          // Set to new driver
          await User.findByIdAndUpdate(driverId, { vehicleAssigned: vehicle._id });
        }
      }

      if (status) vehicle.status = status;
      if (fuelLevel !== undefined) vehicle.fuelLevel = fuelLevel;
      if (capacity !== undefined) vehicle.capacity = capacity;
      if (currentLoad !== undefined) vehicle.currentLoad = currentLoad;
      if (latitude !== undefined) vehicle.latitude = latitude;
      if (longitude !== undefined) vehicle.longitude = longitude;

      const updatedVehicle = await vehicle.save();
      const populatedVehicle = await Vehicle.findById(updatedVehicle._id).populate('driver', 'name email');
      res.json(populatedVehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
      if (vehicle.driver) {
        await User.findByIdAndUpdate(vehicle.driver, { vehicleAssigned: null });
      }
      await Vehicle.deleteOne({ _id: req.params.id });
      res.json({ message: 'Vehicle removed successfully' });
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
