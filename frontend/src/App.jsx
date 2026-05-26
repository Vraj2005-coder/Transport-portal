import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";

/* ADMIN PAGES */

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminRegister from "./pages/Admin/AdminRegister";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Vehicles from "./pages/Admin/Vehicles";
import VehicleDetails from "./pages/Admin/VehicleDetails";
import Trips from "./pages/Admin/Trips";
import TripDetails from "./pages/Admin/TripDetails";

/* DRIVER PAGES */

import DriverLogin from "./pages/Driver/DriverLogin";
import DriverDashboard from "./pages/Driver/DriverDashboard";
import Drivers from "./pages/Admin/Drivers";

import "./App.css";

function App() {

  return (

    <div className="app">

      <BrowserRouter>

        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<RoleSelection />}
          />

          {/* ADMIN ROUTES */}

          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin-register"
            element={<AdminRegister />}
          />

          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/vehicles"
            element={<Vehicles />}
          />

          <Route
            path="/vehicle-details"
            element={<VehicleDetails />}
          />

          <Route
            path="/trips"
            element={<Trips />}
          />

          <Route
            path="/trip-details"
            element={<TripDetails />}
          />

          {/* DRIVER ROUTES */}

          <Route
            path="/driver-login"
            element={<DriverLogin />}
          />

          <Route
            path="/drivers"
            element={<Drivers />}
          />

          <Route
            path="/driver-dashboard"
            element={<DriverDashboard />}
          />

        </Routes>

      </BrowserRouter>

    </div>

  );
}

export default App;