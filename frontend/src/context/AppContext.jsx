import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState({
    bins: false,
    vehicles: false,
    routes: false,
    reports: false,
    analytics: false,
  });

  const socketRef = useRef(null);
  const API_BASE = 'http://localhost:5000/api';

  // Helper for authenticated headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: user ? `Bearer ${user.token}` : '',
    };
  };

  // ═══ SOCKET.IO INITIALIZATION ═══
  useEffect(() => {
    try {
      // Connect to Socket.io server
      socketRef.current = io('http://localhost:5000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Handle bin updates in real-time
      socketRef.current.on('bins:updated', (updatedBins) => {
        setBins((prevBins) => {
          const newBins = [...prevBins];
          updatedBins.forEach((updatedBin) => {
            const index = newBins.findIndex((b) => b._id === updatedBin._id);
            if (index !== -1) {
              newBins[index] = updatedBin;
            } else {
              newBins.push(updatedBin);
            }
          });
          return newBins;
        });
      });

      // Handle vehicle updates in real-time
      socketRef.current.on('vehicles:updated', (updatedVehicles) => {
        setVehicles((prevVehicles) => {
          const newVehicles = [...prevVehicles];
          updatedVehicles.forEach((updatedVehicle) => {
            const index = newVehicles.findIndex((v) => v._id === updatedVehicle._id);
            if (index !== -1) {
              newVehicles[index] = updatedVehicle;
            } else {
              newVehicles.push(updatedVehicle);
            }
          });
          return newVehicles;
        });
      });

      // Handle route updates in real-time
      socketRef.current.on('routes:updated', (updatedRoutes) => {
        setRoutes((prevRoutes) => {
          const newRoutes = [...prevRoutes];
          updatedRoutes.forEach((updatedRoute) => {
            const index = newRoutes.findIndex((r) => r._id === updatedRoute._id);
            if (index !== -1) {
              newRoutes[index] = updatedRoute;
            } else {
              newRoutes.push(updatedRoute);
            }
          });
          return newRoutes;
        });
      });

      // Handle report updates in real-time
      socketRef.current.on('reports:updated', (updatedReports) => {
        setReports((prevReports) => {
          const newReports = [...prevReports];
          updatedReports.forEach((updatedReport) => {
            const index = newReports.findIndex((r) => r._id === updatedReport._id);
            if (index !== -1) {
              newReports[index] = updatedReport;
            } else {
              newReports.push(updatedReport);
            }
          });
          return newReports;
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket.io connection error:', error);
    }
  }, []);

  // Fetch Bins (Public)
  const fetchBins = async () => {
    setLoading((prev) => ({ ...prev, bins: true }));
    try {
      const res = await fetch(`${API_BASE}/bins`);
      if (res.ok) {
        const data = await res.json();
        setBins(data);
      }
    } catch (err) {
      console.error('Error fetching bins:', err);
    } finally {
      setLoading((prev) => ({ ...prev, bins: false }));
    }
  };

  // Fetch Vehicles
  const fetchVehicles = async () => {
    setLoading((prev) => ({ ...prev, vehicles: true }));
    try {
      const headers = user ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE}/vehicles`, { headers });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading((prev) => ({ ...prev, vehicles: false }));
    }
  };

  // Fetch Routes
  const fetchRoutes = async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, routes: true }));
    try {
      const res = await fetch(`${API_BASE}/routes`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setLoading((prev) => ({ ...prev, routes: false }));
    }
  };

  // Fetch Reports — public endpoint, no auth required
  const fetchReports = async () => {
    setLoading((prev) => ({ ...prev, reports: true }));
    try {
      const headers = user ? getAuthHeaders() : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE}/reports/overflow`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading((prev) => ({ ...prev, reports: false }));
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading((prev) => ({ ...prev, analytics: true }));
    try {
      const res = await fetch(`${API_BASE}/reports/analytics`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading((prev) => ({ ...prev, analytics: false }));
    }
  };

  // Create Bin (Admin)
  const createBin = async (binData) => {
    try {
      const res = await fetch(`${API_BASE}/bins`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(binData),
      });
      if (res.ok) {
        const newBin = await res.json();
        setBins((prev) => [...prev, newBin]);
        fetchAnalytics(); // refresh stats
        return newBin;
      } else {
        const errData = await res.json();
        throw new Error(errData.message);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Update Bin (Internal/Simulation or Admin)
  const updateBin = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/bins/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const updatedBin = await res.json();
        setBins((prev) => prev.map((b) => (b._id === id ? updatedBin : b)));
        return updatedBin;
      }
    } catch (err) {
      console.error('Error updating bin:', err);
    }
  };

  // Delete Bin (Admin)
  const deleteBin = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bins/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setBins((prev) => prev.filter((b) => b._id !== id));
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error deleting bin:', err);
    }
  };

  // Create Vehicle (Admin)
  const createVehicle = async (vehicleData) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });
      if (res.ok) {
        const newVehicle = await res.json();
        setVehicles((prev) => [...prev, newVehicle]);
        fetchAnalytics();
        return newVehicle;
      } else {
        const errData = await res.json();
        throw new Error(errData.message);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Update Vehicle
  const updateVehicle = async (id, vehicleData) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(vehicleData),
      });
      if (res.ok) {
        const updatedVehicle = await res.json();
        setVehicles((prev) => prev.map((v) => (v._id === id ? updatedVehicle : v)));
        return updatedVehicle;
      }
    } catch (err) {
      console.error('Error updating vehicle:', err);
    }
  };

  // Delete Vehicle (Admin)
  const deleteVehicle = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    }
  };

  // Optimize Route (Admin)
  const optimizeRoute = async (vehicleId) => {
    try {
      const res = await fetch(`${API_BASE}/routes/optimize`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vehicleId }),
      });
      if (res.ok) {
        const newRoute = await res.json();
        setRoutes((prev) => [...prev, newRoute]);
        fetchVehicles(); // updates status of vehicle to 'Active'
        fetchAnalytics();
        return newRoute;
      } else {
        const errData = await res.json();
        throw new Error(errData.message);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Collect Waypoint Bin (Driver)
  const collectWaypoint = async (routeId, binId) => {
    try {
      const res = await fetch(`${API_BASE}/routes/${routeId}/collect/${binId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const updatedRoute = await res.json();
        setRoutes((prev) => prev.map((r) => (r._id === routeId ? updatedRoute : r)));
        
        // Refresh bin fill levels & vehicles
        fetchBins();
        fetchVehicles();
        return updatedRoute;
      }
    } catch (err) {
      console.error('Error collecting bin:', err);
    }
  };

  // Complete Route (Driver)
  const completeRoute = async (routeId) => {
    try {
      const res = await fetch(`${API_BASE}/routes/${routeId}/complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const updatedRoute = await res.json();
        setRoutes((prev) => prev.map((r) => (r._id === routeId ? updatedRoute : r)));
        fetchVehicles();
        fetchAnalytics();
        return updatedRoute;
      }
    } catch (err) {
      console.error('Error completing route:', err);
    }
  };

  // Submit Citizen Report (Authenticated)
  const submitReport = async (reportData) => {
    try {
      const res = await fetch(`${API_BASE}/reports/overflow`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reportData),
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports((prev) => [newReport, ...prev]);
        fetchBins(); // nearby bins might have their level set to 100%
        return newReport;
      } else {
        const errData = await res.json();
        throw new Error(errData.message);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Resolve Overflow Report (Admin)
  const resolveReport = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/reports/overflow/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'Resolved' }),
      });
      if (res.ok) {
        const updatedReport = await res.json();
        setReports((prev) => prev.map((r) => (r._id === id ? updatedReport : r)));
        fetchAnalytics();
        return updatedReport;
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  // Initial Fetches on Auth change
  useEffect(() => {
    fetchBins();
    fetchReports(); // public — works with or without auth
    fetchVehicles(); // Always fetch vehicles for real-time map representation
    if (user) {
      fetchRoutes();
      if (user.role === 'admin') {
        fetchAnalytics();
      }
    } else {
      setRoutes([]);
      setAnalytics(null);
    }
  }, [user]);

  // Polling for real-time updates (faster polling + socket.io)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchBins();
      fetchReports();
      fetchVehicles();
      if (user && user.role === 'admin') {
        fetchAnalytics();
      }
    }, 10000); // Poll every 10 seconds for fallback
    return () => clearInterval(timer);
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        bins,
        vehicles,
        routes,
        reports,
        analytics,
        loading,
        fetchBins,
        fetchVehicles,
        fetchRoutes,
        fetchReports,
        fetchAnalytics,
        createBin,
        updateBin,
        deleteBin,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        optimizeRoute,
        collectWaypoint,
        completeRoute,
        submitReport,
        resolveReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
