import Bin from '../models/Bin.js';

// @desc    Get all bins
// @route   GET /api/bins
// @access  Public
export const getBins = async (req, res) => {
  try {
    const bins = await Bin.find({});
    res.json(bins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bin
// @route   GET /api/bins/:id
// @access  Public
export const getBinById = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (bin) {
      res.json(bin);
    } else {
      res.status(404).json({ message: 'Bin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bin
// @route   POST /api/bins
// @access  Private/Admin
export const createBin = async (req, res) => {
  const { binId, locationName, latitude, longitude, capacity, fillLevel, wasteType } = req.body;

  try {
    const binExists = await Bin.findOne({ binId });

    if (binExists) {
      return res.status(400).json({ message: 'Bin with this ID already exists' });
    }

    const bin = new Bin({
      binId,
      locationName,
      latitude,
      longitude,
      capacity: capacity || 100,
      fillLevel: fillLevel || 0,
      wasteType: wasteType || 'Organic'
    });

    const createdBin = await bin.save();
    res.status(201).json(createdBin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bin details
// @route   PUT /api/bins/:id
// @access  Private
export const updateBin = async (req, res) => {
  const { locationName, latitude, longitude, capacity, fillLevel, wasteType } = req.body;

  try {
    const bin = await Bin.findById(req.params.id);

    if (bin) {
      if (locationName) bin.locationName = locationName;
      if (latitude !== undefined) bin.latitude = latitude;
      if (longitude !== undefined) bin.longitude = longitude;
      if (capacity !== undefined) bin.capacity = capacity;
      if (fillLevel !== undefined) bin.fillLevel = fillLevel;
      if (wasteType) bin.wasteType = wasteType;

      const updatedBin = await bin.save();
      
      // Emit real-time update via Socket.io
      if (req.io) {
        req.io.emit('bins:updated', [updatedBin]);
      }
      
      res.json(updatedBin);
    } else {
      res.status(404).json({ message: 'Bin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bin
// @route   DELETE /api/bins/:id
// @access  Private/Admin
export const deleteBin = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);

    if (bin) {
      await Bin.deleteOne({ _id: req.params.id });
      res.json({ message: 'Bin removed successfully' });
    } else {
      res.status(404).json({ message: 'Bin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
