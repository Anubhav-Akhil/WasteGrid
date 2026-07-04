import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { 
    type: String, 
    enum: ['Idle', 'Active', 'Maintenance'], 
    default: 'Idle' 
  },
  fuelLevel: { type: Number, default: 100, min: 0, max: 100 }, // percentage
  capacity: { type: Number, default: 1000 }, // in kg
  currentLoad: { type: Number, default: 0 }, // in kg
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
}, { timestamps: true });

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
