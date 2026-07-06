import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import binRoutes from './routes/binRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Model Imports (for seeding and simulation)
import User from './models/User.js';
import Bin from './models/Bin.js';
import Vehicle from './models/Vehicle.js';
import OverflowReport from './models/OverflowReport.js';
import Route from './models/Route.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Attach io to app for access in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  let maskedUri = 'not-defined';
  if (process.env.MONGO_URI) {
    maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
  }

  res.json({
    status: states[state] || 'unknown',
    readyState: state,
    hasMongoUri: !!process.env.MONGO_URI,
    maskedUri: maskedUri,
  });
});

app.get('/', (req, res) => {
  res.send('Smart Waste Collection & Route Optimization API is running...');
});

const PORT = process.env.PORT || 5000;

// Database seeding logic
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      // Ensure citizen user exists even if already seeded before
      const citizenExists = await User.findOne({ email: 'citizen@waste.com' });
      if (!citizenExists) {
        await User.create({
          name: 'Citizen Demo',
          email: 'citizen@waste.com',
          password: 'citizen123',
          role: 'citizen',
        });
        console.log('Seeded missing Citizen Demo user.');
      }
      
      // Reset the default bins to their initial seeded fill levels on startup
      console.log('Database already populated. Resetting default bins to initial seeded fill levels...');
      const defaultBinsData = [
        { binId: 'BIN-101', fillLevel: 85 },
        { binId: 'BIN-102', fillLevel: 45 },
        { binId: 'BIN-103', fillLevel: 92 },
        { binId: 'BIN-104', fillLevel: 30 },
        { binId: 'BIN-105', fillLevel: 80 },
        { binId: 'BIN-106', fillLevel: 15 },
        { binId: 'BIN-107', fillLevel: 96 },
      ];
      for (const binData of defaultBinsData) {
        const bin = await Bin.findOne({ binId: binData.binId });
        if (bin) {
          bin.fillLevel = binData.fillLevel;
          await bin.save();
        }
      }
      
      console.log('Database already populated, default bins reset, skipping seed.');
      return;
    }

    console.log('Seeding database with default data...');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Admin Supervisor',
      email: 'admin@waste.com',
      password: 'admin123',
      role: 'admin',
    });

    const driver1 = await User.create({
      name: 'Ramesh Singh',
      email: 'driver1@waste.com',
      password: 'driver123',
      role: 'driver',
    });

    const driver2 = await User.create({
      name: 'Suresh Kumar',
      email: 'driver2@waste.com',
      password: 'driver123',
      role: 'driver',
    });

    const citizenUser = await User.create({
      name: 'Citizen Demo',
      email: 'citizen@waste.com',
      password: 'citizen123',
      role: 'citizen',
    });

    console.log('Users Seeded!');

    // 2. Create Bins around Chandigarh
    const binsData = [
      { binId: 'BIN-101', locationName: 'Sector 17 Plaza Market', latitude: 30.7410, longitude: 76.7820, capacity: 120, fillLevel: 85, wasteType: 'Organic' },
      { binId: 'BIN-102', locationName: 'Sector 35-C Food Street', latitude: 30.7230, longitude: 76.7680, capacity: 120, fillLevel: 45, wasteType: 'Recyclable' },
      { binId: 'BIN-103', locationName: 'Sector 22 Shastri Market', latitude: 30.7320, longitude: 76.7730, capacity: 100, fillLevel: 92, wasteType: 'Organic' },
      { binId: 'BIN-104', locationName: 'Sukhna Lake Promenade', latitude: 30.7420, longitude: 76.8110, capacity: 150, fillLevel: 30, wasteType: 'Recyclable' },
      { binId: 'BIN-105', locationName: 'Elante Mall Commercial Zone', latitude: 30.7060, longitude: 76.8010, capacity: 200, fillLevel: 80, wasteType: 'Hazardous' },
      { binId: 'BIN-106', locationName: 'PEC Campus Sector 12', latitude: 30.7620, longitude: 76.7860, capacity: 120, fillLevel: 15, wasteType: 'E-waste' },
      { binId: 'BIN-107', locationName: 'Sector 43 Bus Stand Entrance', latitude: 30.7180, longitude: 76.7410, capacity: 180, fillLevel: 96, wasteType: 'Organic' },
    ];

    for (const bin of binsData) {
      await Bin.create(bin);
    }
    console.log('Bins Seeded!');

    // 3. Create Vehicles
    const vehicle1 = await Vehicle.create({
      vehicleNumber: 'CH-01-G-4321',
      driver: driver1._id,
      status: 'Idle',
      fuelLevel: 88,
      capacity: 1200,
      currentLoad: 0,
      latitude: 30.7450,
      longitude: 76.7850,
    });

    const vehicle2 = await Vehicle.create({
      vehicleNumber: 'CH-01-G-8765',
      driver: driver2._id,
      status: 'Idle',
      fuelLevel: 95,
      capacity: 1500,
      currentLoad: 0,
      latitude: 30.7250,
      longitude: 76.7700,
    });

    // Assign vehicles back to drivers
    driver1.vehicleAssigned = vehicle1._id;
    await driver1.save();
    driver2.vehicleAssigned = vehicle2._id;
    await driver2.save();

    console.log('Vehicles Seeded!');

    // 4. Create a mock Citizen Report
    await OverflowReport.create({
      reportedBy: 'Amit Sharma',
      locationName: 'Sector 22 Market Parking Area',
      latitude: 30.7315,
      longitude: 76.7725,
      description: 'The bin has been overflowing for 2 days. Bad smell spreading.',
      status: 'Pending'
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Simulation Loop: Accumulate waste in bins periodically (every 30 seconds)
const startWasteSimulation = () => {
  setInterval(async () => {
    try {
      // Find all bins
      const bins = await Bin.find({});
      if (bins.length === 0) return;

      // Randomly select 2-3 bins to increase their fillLevel
      const numBinsToUpdate = Math.min(bins.length, Math.floor(Math.random() * 3) + 1);
      
      const updatedBins = [];
      for (let i = 0; i < numBinsToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * bins.length);
        const bin = bins[randomIndex];
        
        // Increase fill level by a random percentage (5% to 15%)
        const currentFill = bin.fillLevel;
        if (currentFill < 100) {
          const increase = Math.floor(Math.random() * 11) + 5;
          bin.fillLevel = Math.min(100, currentFill + increase);
          await bin.save();
          updatedBins.push(bin);
          console.log(`Simulation: Bin ${bin.binId} fill level increased from ${currentFill}% to ${bin.fillLevel}%`);
        }
      }
      
      // Emit real-time updates to all connected clients
      if (updatedBins.length > 0) {
        io.emit('bins:updated', updatedBins);
      }
    } catch (error) {
      console.error('Error during waste simulation step:', error.message);
    }
  }, 30000); // 30 seconds
};

// ── Route-aware vehicle simulation ──────────────────────────────────────────
// Instead of random movement, vehicles follow their assigned route sequentially.
// Every tick the vehicle moves more quickly along the path.
// When it arrives (<0.0006 deg ≈ 60m), the bin is auto-collected.
// When all bins are done, the route completes and notifications fire.
const startVehicleSimulation = () => {
  setInterval(async () => {
    try {
      // Only process vehicles that are Active (have a dispatched route)
      const activeVehicles = await Vehicle.find({ status: 'Active' }).populate('driver');

      for (const vehicle of activeVehicles) {
        // Find the In-Progress or Pending route for this vehicle
        const route = await Route.findOne({
          vehicle: vehicle._id,
        status: { $in: ['Pending', 'In Progress', 'Dumping'] }
      });

      if (!route) continue;

      // Find the FIRST uncollected waypoint (preserves nearest-neighbor order)
      const nextWp = route.waypoints.find(wp => !wp.collected);

      if (!nextWp && route.status !== 'Dumping') {
        // All pickups are collected. Transition to dump yard travel.
        if (route.dumpGeometry && route.dumpGeometry.length > 0) {
          route.status = 'Dumping';
          route.dumpStartedAt = new Date();
          await route.save();

          // Emit updated route to all clients
          const populatedRoute = await Route.findById(route._id)
            .populate('vehicle')
            .populate('driver');
          io.emit('routes:updated', [populatedRoute]);
          continue;
        }
      }

        if (route.status === 'Dumping') {
          const dumpPath = route.dumpGeometry || [];
          if (dumpPath.length === 0) continue;

          let closestIdx = 0;
          let minGeomDist = Infinity;
          for (let i = 0; i < dumpPath.length; i++) {
            const pt = dumpPath[i];
            const distSq = (vehicle.latitude - pt[0]) ** 2 + (vehicle.longitude - pt[1]) ** 2;
            if (distSq < minGeomDist) {
              minGeomDist = distSq;
              closestIdx = i;
            }
          }

          const target = dumpPath[dumpPath.length - 1];
          const dx = target[0] - vehicle.latitude;
          const dy = target[1] - vehicle.longitude;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const ARRIVAL_THRESHOLD = 0.0012;

          if (distance > ARRIVAL_THRESHOLD) {
            const nextStepIdx = Math.min(dumpPath.length - 1, closestIdx + 4);
            const nextStepCoord = dumpPath[nextStepIdx];
            vehicle.latitude = nextStepCoord[0];
            vehicle.longitude = nextStepCoord[1];
            await vehicle.save();
            io.emit('vehicles:updated', [vehicle]);
            continue;
          }

          // Arrived at dump yard.
          vehicle.latitude = route.dumpYard.latitude;
          vehicle.longitude = route.dumpYard.longitude;
          vehicle.currentLoad = 0;
          vehicle.fuelLevel = Math.max(10, vehicle.fuelLevel - 2);
          vehicle.status = 'Idle';

          // Randomly reposition slightly after dumping so the truck appears on a nearby road.
          const randomOffset = () => (Math.random() - 0.5) * 0.015;
          vehicle.latitude += randomOffset();
          vehicle.longitude += randomOffset();
          await vehicle.save();
          io.emit('vehicles:updated', [vehicle]);

          route.status = 'Completed';
          route.completedAt = new Date();
          await route.save();

          io.emit('notification:admin', {
            title: '🚛 Dump Yard Arrival',
            message: `Vehicle ${vehicle.vehicleNumber} completed dumping at ${route.dumpYard.name}.`,
            type: 'success',
            timestamp: new Date().toISOString()
          });

          io.emit('notification:citizen', {
            title: '✅ Waste Disposed',
            message: `The cleanup route has been completed and garbage was safely dumped.`,
            type: 'success',
            timestamp: new Date().toISOString()
          });

          continue;
        }

        // Normal pickup movement
        const dx = nextWp.latitude - vehicle.latitude;
        const dy = nextWp.longitude - vehicle.longitude;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const ARRIVAL_THRESHOLD = 0.0006; // ~60 meters

        // Find the index of the last collected waypoint in geometry to prevent jumping backwards
        let prevWpGeomIdx = 0;
        const collectedWaypoints = route.waypoints.filter(wp => wp.collected);
        if (collectedWaypoints.length > 0) {
          const lastCollectedWp = collectedWaypoints[collectedWaypoints.length - 1];
          let minPrevDist = Infinity;
          for (let i = 0; i < route.geometry.length; i++) {
            const pt = route.geometry[i];
            const distSq = (lastCollectedWp.latitude - pt[0]) ** 2 + (lastCollectedWp.longitude - pt[1]) ** 2;
            if (distSq < minPrevDist) {
              minPrevDist = distSq;
              prevWpGeomIdx = i;
            }
          }
        }

        // Find the index of the closest point in the road route geometry (search only from prevWpGeomIdx)
        let closestIdx = prevWpGeomIdx;
        let minGeomDist = Infinity;
        if (route.geometry && route.geometry.length > 0) {
          for (let i = prevWpGeomIdx; i < route.geometry.length; i++) {
            const pt = route.geometry[i];
            const distSq = (vehicle.latitude - pt[0]) ** 2 + (vehicle.longitude - pt[1]) ** 2;
            if (distSq < minGeomDist) {
              minGeomDist = distSq;
              closestIdx = i;
            }
          }
        }

        if (distance > ARRIVAL_THRESHOLD) {
          if (route.geometry && route.geometry.length > 0) {
            // Find the index in geometry closest to nextWp
            let nextWpGeomIdx = 0;
            let minWpDist = Infinity;
            for (let i = 0; i < route.geometry.length; i++) {
              const pt = route.geometry[i];
              const distSq = (nextWp.latitude - pt[0]) ** 2 + (nextWp.longitude - pt[1]) ** 2;
              if (distSq < minWpDist) {
                minWpDist = distSq;
                nextWpGeomIdx = i;
              }
            }

            const nearestGeomPoint = route.geometry[closestIdx];
            const gapDx = nearestGeomPoint[0] - vehicle.latitude;
            const gapDy = nearestGeomPoint[1] - vehicle.longitude;
            const gapDistance = Math.sqrt(gapDx * gapDx + gapDy * gapDy);

            if (gapDistance > 0.0012) {
              // If the vehicle is still off the road geometry, move faster toward the nearest road point.
              vehicle.latitude += gapDx * 0.5;
              vehicle.longitude += gapDy * 0.5;
            } else {
              // Move along geometry towards nextWpGeomIdx
              if (closestIdx === nextWpGeomIdx) {
                // Snap directly to nextWp coords to trigger collection on next tick
                vehicle.latitude = nextWp.latitude;
                vehicle.longitude = nextWp.longitude;
              } else {
                let nextStepIdx;
                if (closestIdx < nextWpGeomIdx) {
                  nextStepIdx = Math.min(nextWpGeomIdx, closestIdx + 4);
                } else {
                  nextStepIdx = Math.max(nextWpGeomIdx, closestIdx - 4);
                }
                const nextStepCoord = route.geometry[nextStepIdx];
                vehicle.latitude = nextStepCoord[0];
                vehicle.longitude = nextStepCoord[1];
              }
            }
          } else {
            // Fallback to straight line linear interpolation
            vehicle.latitude += dx * 0.55;
            vehicle.longitude += dy * 0.55;
          }
          await vehicle.save();

          // Emit position update to all clients
          io.emit('vehicles:updated', [vehicle]);
        } else {
          // ── Arrived at the bin — auto-collect ──
          vehicle.latitude = nextWp.latitude;
          vehicle.longitude = nextWp.longitude;

          // Mark waypoint as collected
          nextWp.collected = true;
          nextWp.collectedAt = new Date();

          // Reset the actual Bin in database
          const bin = await Bin.findById(nextWp.binId);
          let wasteWeightCollected = 0;
          if (bin) {
            wasteWeightCollected = Math.round(bin.capacity * (bin.fillLevel / 100) * 0.15);
            bin.fillLevel = 0;
            bin.status = 'Empty';
            bin.lastCollectedAt = new Date();
            await bin.save();
            io.emit('bins:updated', [bin]);
            console.log(`🗑️  Auto-collected ${bin.binId} (${nextWp.locationName})`);
          }

          // Update vehicle load & fuel
          vehicle.currentLoad = Math.min(vehicle.capacity, vehicle.currentLoad + wasteWeightCollected);
          vehicle.fuelLevel = Math.max(10, vehicle.fuelLevel - 2);
          await vehicle.save();
          io.emit('vehicles:updated', [vehicle]);

          // Update route status
          if (route.status === 'Pending') {
            route.status = 'In Progress';
            route.startedAt = new Date();
          }

          // ── Check if ALL waypoints are now collected ──
          const allCollected = route.waypoints.every(wp => wp.collected);
          if (allCollected) {
            const driverName = vehicle.driver?.name || 'Driver';
            const binCount = route.waypoints.length;

            if (route.dumpGeometry && route.dumpGeometry.length > 0) {
              route.status = 'Dumping';
              route.dumpStartedAt = new Date();

              io.emit('notification:admin', {
                title: '🎉 Pickups Completed!',
                message: `All ${binCount} bins collected by ${driverName}. Vehicle ${vehicle.vehicleNumber} is heading to the dump yard.`,
                type: 'success',
                timestamp: new Date().toISOString()
              });

              console.log(`🚛 Pickups completed for route "${route.routeName}" by ${driverName}. Heading to dump yard.`);
            } else {
              route.status = 'Completed';
              route.completedAt = new Date();

              // Return vehicle to idle
              vehicle.status = 'Idle';
              vehicle.currentLoad = 0;
              await vehicle.save();
              io.emit('vehicles:updated', [vehicle]);

              // ── Fire notification events ──
              io.emit('notification:admin', {
                title: '🎉 Route Completed!',
                message: `All ${binCount} bins collected by ${driverName}. Vehicle ${vehicle.vehicleNumber} returned to idle.`,
                type: 'success',
                timestamp: new Date().toISOString()
              });

              io.emit('notification:citizen', {
                title: '✅ Bins Cleaned Up!',
                message: `Good news! ${binCount} waste bins in your area have been cleaned. Thank you for keeping the city clean!`,
                type: 'success',
                timestamp: new Date().toISOString()
              });

              console.log(`✅ Route "${route.routeName}" completed by ${driverName}`);
            }
          }

          await route.save();

          // Emit updated route to all clients
          const populatedRoute = await Route.findById(route._id)
            .populate('vehicle')
            .populate('driver');
          io.emit('routes:updated', [populatedRoute]);
        }
      }
    } catch (error) {
      console.error('Error during vehicle simulation:', error.message);
    }
  }, 700); // Every 0.7 seconds for much faster movement
};

// Initialize server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    await seedDatabase();
    startWasteSimulation();
    startVehicleSimulation();
  } else {
    console.warn('\nRunning API in mock DB mode because MongoDB is not connected.\n');
  }

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
    
    // Request for initial data
    socket.on('request:bins', async () => {
      const bins = await Bin.find({});
      socket.emit('bins:updated', bins);
    });
    
    socket.on('request:vehicles', async () => {
      const vehicles = await Vehicle.find({}).populate('driver');
      socket.emit('vehicles:updated', vehicles);
    });
    
    socket.on('request:routes', async () => {
      const routes = await Route.find({})
        .populate('vehicle')
        .populate('driver');
      socket.emit('routes:updated', routes);
    });
    
    socket.on('request:reports', async () => {
      const reports = await OverflowReport.find({});
      socket.emit('reports:updated', reports);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Real-time updates enabled via Socket.io`);
  });
};

startServer();
