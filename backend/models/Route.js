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
  geometry: { type: [Array], default: [] }, // Array of [lat, lng] coordinates representing the pickup road geometry
  dumpGeometry: { type: [Array], default: [] }, // Array of [lat, lng] coordinates from last pickup to dump yard
  dumpYard: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    name: { type: String, default: 'Municipal Dump Yard' }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Dumping', 'Completed'], 
    default: 'Pending' 
  },
  distance: { type: Number, default: 0 }, // in km
  duration: { type: Number, default: 0 }, // in minutes
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
export default Route;
