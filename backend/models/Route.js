import mongoose from 'mongoose';

const waypointSchema = new mongoose.Schema({
  binId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin', required: true },
  locationName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  collected: { type: Boolean, default: false },
  collectedAt: { type: Date }
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  waypoints: [waypointSchema],
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], 
    default: 'Pending' 
  },
  distance: { type: Number, default: 0 }, // in km
  duration: { type: Number, default: 0 }, // in minutes
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
