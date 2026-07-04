import mongoose from 'mongoose';

const overflowReportSchema = new mongoose.Schema({
  reportedBy: { type: String, default: 'Anonymous' },
  locationName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Dispatched', 'Resolved'], 
    default: 'Pending' 
  }
}, { timestamps: true });

const OverflowReport = mongoose.models.OverflowReport || mongoose.model('OverflowReport', overflowReportSchema);
export default OverflowReport;
