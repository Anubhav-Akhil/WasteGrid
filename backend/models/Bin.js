import mongoose from 'mongoose';

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  locationName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, default: 100 }, // in Liters
  fillLevel: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  wasteType: { 
    type: String, 
    enum: ['Organic', 'Recyclable', 'Hazardous', 'E-waste'], 
    default: 'Organic' 
  },
  status: { 
    type: String, 
    enum: ['Empty', 'Medium', 'Full', 'Overflowing'], 
    default: 'Empty' 
  },
  lastCollectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-adjust status based on fillLevel before saving
binSchema.pre('save', function(next) {
  if (this.fillLevel < 50) {
    this.status = 'Empty';
  } else if (this.fillLevel < 80) {
    this.status = 'Medium';
  } else if (this.fillLevel < 95) {
    this.status = 'Full';
  } else {
    this.status = 'Overflowing';
  }
  next();
});

const Bin = mongoose.models.Bin || mongoose.model('Bin', binSchema);
export default Bin;
