import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
      console.log('Database already populated, skipping seed.');
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

// Simulate vehicle movement (update location periodically)
const startVehicleSimulation = () => {
  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find({ status: 'Active' }).populate('driver');
      
      for (const vehicle of vehicles) {
        // Randomly move vehicle slightly (simulate GPS tracking)
        const latOffset = (Math.random() - 0.5) * 0.005; // ~250m
        const lngOffset = (Math.random() - 0.5) * 0.005;
        
        vehicle.latitude = Math.max(30.6, Math.min(30.9, vehicle.latitude + latOffset));
        vehicle.longitude = Math.max(76.6, Math.min(76.9, vehicle.longitude + lngOffset));
        
        await vehicle.save();
      }
      
      // Emit vehicle locations to all connected clients
      if (vehicles.length > 0) {
        const vehiclesPopulated = await Vehicle.find({ status: 'Active' }).populate('driver');
        io.emit('vehicles:updated', vehiclesPopulated);
      }
    } catch (error) {
      console.error('Error during vehicle simulation:', error.message);
    }
  }, 5000); // Every 5 seconds
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
