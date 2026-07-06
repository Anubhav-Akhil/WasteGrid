import Route from '../models/Route.js';
import Bin from '../models/Bin.js';
import Vehicle from '../models/Vehicle.js';

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// @desc    Get routes
// @route   GET /api/routes
// @access  Private
export const getRoutes = async (req, res) => {
  try {
    let routes;
    if (req.user.role === 'admin') {
      routes = await Route.find({})
        .populate('vehicle', 'vehicleNumber status')
        .populate('driver', 'name email');
    } else {
      // Driver gets their assigned routes that are not completed
      routes = await Route.find({ driver: req.user._id })
        .populate('vehicle', 'vehicleNumber status')
        .populate('driver', 'name email');
    }
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Optimize and generate route for a vehicle
// @route   POST /api/routes/optimize
// @access  Private/Admin
export const optimizeRoute = async (req, res) => {
  const { vehicleId } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId).populate('driver');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicle.driver) {
      return res.status(400).json({ message: 'Vehicle must have an assigned driver to optimize routes' });
    }

    // Cancel/complete any existing active routes for this vehicle to prevent concurrent active routes
    const existingActiveRoutes = await Route.find({
      vehicle: vehicle._id,
      status: { $in: ['Pending', 'In Progress', 'Dumping'] }
    });

    if (existingActiveRoutes.length > 0) {
      await Route.updateMany(
        { _id: { $in: existingActiveRoutes.map(r => r._id) } },
        { $set: { status: 'Completed', completedAt: new Date() } }
      );

      // Emit the completed routes update to all clients
      if (req.io) {
        const completedRoutes = await Route.find({ _id: { $in: existingActiveRoutes.map(r => r._id) } })
          .populate('vehicle')
          .populate('driver');
        req.io.emit('routes:updated', completedRoutes);
      }
    }

    // Find all bins with fill level >= 75% or status 'Overflowing'
    const fullBins = await Bin.find({
      $or: [{ fillLevel: { $gte: 75 } }, { status: 'Overflowing' }],
    });

    if (fullBins.length === 0) {
      return res.status(400).json({ message: 'No bins currently require collection (fill levels are below threshold)' });
    }

    // Nearest Neighbor Routing Algorithm
    const waypoints = [];
    let currentLat = vehicle.latitude;
    let currentLng = vehicle.longitude;
    const unvisited = [...fullBins];
    let totalDistance = 0;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const bin = unvisited[i];
        const dist = calculateDistance(currentLat, currentLng, bin.latitude, bin.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const nearestBin = unvisited[nearestIndex];
      waypoints.push({
        binId: nearestBin._id,
        locationName: nearestBin.locationName,
        latitude: nearestBin.latitude,
        longitude: nearestBin.longitude,
        collected: false,
      });

      totalDistance += minDistance;
      currentLat = nearestBin.latitude;
      currentLng = nearestBin.longitude;
      unvisited.splice(nearestIndex, 1);
    }

    // Query OSRM to get real road coordinates, distance, and duration
    let geometry = [];
    let distance = Math.round(totalDistance * 100) / 100;
    let duration = Math.round(totalDistance * 5 + waypoints.length * 10);

    const points = [
      [vehicle.longitude, vehicle.latitude],
      ...waypoints.map(w => [w.longitude, w.latitude]),
      [vehicle.longitude, vehicle.latitude]
    ];
    const coordString = points.map(p => `${p[0]},${p[1]}`).join(';');

    const osrmEndpoints = [
      'https://router.project-osrm.org/route/v1/driving/',
      'https://routing.openstreetmap.de/routed-car/route/v1/driving/'
    ];

    const fetchRoadGeometry = async (baseUrl) => {
      const osrmUrl = `${baseUrl}${coordString}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.routes || !data.routes[0] || data.code !== 'Ok') return null;
      if (!data.routes[0].geometry?.coordinates?.length) return null;
      return {
        geometry: data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]),
        distance: Math.round((data.routes[0].distance / 1000) * 100) / 100,
        duration: Math.round(data.routes[0].duration / 60 + waypoints.length * 10)
      };
    };

    for (const endpoint of osrmEndpoints) {
      try {
        const osrmResult = await fetchRoadGeometry(endpoint);
        if (osrmResult) {
          geometry = osrmResult.geometry;
          distance = osrmResult.distance;
          duration = osrmResult.duration;
          console.log(`OSRM routing successful using ${endpoint}: ${geometry.length} points, ${distance} km, ${duration} min`);
          break;
        }
      } catch (osrmError) {
        console.warn(`OSRM routing request failed for ${endpoint}:`, osrmError.message);
      }
    }

    if (geometry.length === 0) {
      console.warn('No road geometry could be retrieved from OSRM; falling back to straight-line route geometry.');
    }

    // Fallback to straight lines if OSRM is unreachable or fails
    if (geometry.length === 0) {
      geometry.push([vehicle.latitude, vehicle.longitude]);
      waypoints.forEach(w => geometry.push([w.latitude, w.longitude]));
    }

    const dumpYard = {
      latitude: 30.7485,
      longitude: 76.7623,
      name: 'Municipal Dump Yard',
    };

    let dumpGeometry = [];
    const lastWaypoint = waypoints[waypoints.length - 1];
    if (lastWaypoint) {
      const dumpPoints = [
        [lastWaypoint.longitude, lastWaypoint.latitude],
        [dumpYard.longitude, dumpYard.latitude]
      ];
      const dumpCoordString = dumpPoints.map(p => `${p[0]},${p[1]}`).join(';');

      for (const endpoint of osrmEndpoints) {
        try {
          const response = await fetch(`${endpoint}${dumpCoordString}?overview=full&geometries=geojson`);
          if (!response.ok) continue;
          const data = await response.json();
          if (!data.routes || !data.routes[0] || data.code !== 'Ok') continue;
          if (!data.routes[0].geometry?.coordinates?.length) continue;
          dumpGeometry = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          break;
        } catch (err) {
          console.warn(`OSRM dump yard routing failed for ${endpoint}:`, err.message);
        }
      }

      if (dumpGeometry.length === 0) {
        dumpGeometry = [
          [lastWaypoint.latitude, lastWaypoint.longitude],
          [dumpYard.latitude, dumpYard.longitude]
        ];
      }
    }

    const route = new Route({
      routeName: `Optimize Route - ${new Date().toLocaleDateString()} (${waypoints.length} Bins)`,
      vehicle: vehicle._id,
      driver: vehicle.driver._id,
      waypoints,
      geometry,
      dumpGeometry,
      dumpYard,
      distance,
      duration,
      status: 'Pending',
    });

    const createdRoute = await route.save();

    // Update vehicle status to Active
    vehicle.status = 'Active';
    await vehicle.save();

    const populatedRoute = await Route.findById(createdRoute._id)
      .populate('vehicle', 'vehicleNumber status')
      .populate('driver', 'name email');

    res.status(201).json(populatedRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a waypoint bin as collected
// @route   PUT /api/routes/:id/collect/:binId
// @access  Private/Driver
export const collectBin = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Find the waypoint index
    const waypoint = route.waypoints.find(
      (wp) => wp.binId.toString() === req.params.binId
    );

    if (!waypoint) {
      return res.status(404).json({ message: 'Waypoint not found in this route' });
    }

    if (waypoint.collected) {
      return res.status(400).json({ message: 'Bin already marked as collected' });
    }

    // Update waypoint status
    waypoint.collected = true;
    waypoint.collectedAt = new Date();

    // Reset actual Bin in database
    const bin = await Bin.findById(req.params.binId);
    let wasteWeightCollected = 0;
    if (bin) {
      // Calculate approximate weight in kg collected: 
      // capacity (L) * fill level percentage * conversion factor (e.g. 0.15 kg/L for mixed waste)
      wasteWeightCollected = Math.round(bin.capacity * (bin.fillLevel / 100) * 0.15);
      
      bin.fillLevel = 0;
      bin.status = 'Empty';
      bin.lastCollectedAt = new Date();
      await bin.save();
      
      // Emit real-time bin update
      if (req.io) {
        req.io.emit('bins:updated', [bin]);
      }
    }

    // Update vehicle capacity load & location
    const vehicle = await Vehicle.findById(route.vehicle);
    if (vehicle) {
      vehicle.currentLoad = Math.min(vehicle.capacity, vehicle.currentLoad + wasteWeightCollected);
      vehicle.latitude = waypoint.latitude;
      vehicle.longitude = waypoint.longitude;
      // fuel level drops slightly per collection
      vehicle.fuelLevel = Math.max(10, vehicle.fuelLevel - 2); 
      await vehicle.save();
      
      // Emit real-time vehicle update
      if (req.io) {
        req.io.emit('vehicles:updated', [vehicle]);
      }
    }

    // Check if all waypoints collected
    const allCollected = route.waypoints.every((wp) => wp.collected);
    if (allCollected) {
      route.status = 'Completed';
      route.completedAt = new Date();
      if (vehicle) {
        vehicle.status = 'Idle';
        // Reset load when returning to depot
        vehicle.currentLoad = 0; 
        await vehicle.save();
        
        // Emit vehicle completion update
        if (req.io) {
          req.io.emit('vehicles:updated', [vehicle]);
        }
      }
    } else {
      route.status = 'In Progress';
      if (route.startedAt === undefined) {
        route.startedAt = new Date();
      }
    }

    await route.save();
    
    // Emit route update
    if (req.io) {
      const populatedRoute = await Route.findById(route._id)
        .populate('vehicle')
        .populate('driver');
      req.io.emit('routes:updated', [populatedRoute]);
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete route manually (return to depot)
// @route   PUT /api/routes/:id/complete
// @access  Private/Driver
export const completeRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    route.status = 'Completed';
    route.completedAt = new Date();

    const vehicle = await Vehicle.findById(route.vehicle);
    if (vehicle) {
      vehicle.status = 'Idle';
      vehicle.currentLoad = 0; // Empty vehicle load at depot
      await vehicle.save();
      
      // Emit real-time vehicle update
      if (req.io) {
        req.io.emit('vehicles:updated', [vehicle]);
      }
    }

    await route.save();
    
    // Emit route completion update
    if (req.io) {
      const populatedRoute = await Route.findById(route._id)
        .populate('vehicle')
        .populate('driver');
      req.io.emit('routes:updated', [populatedRoute]);
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
