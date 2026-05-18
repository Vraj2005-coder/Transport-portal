import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import DriverLogin from "./pages/DriverLogin";
import DriverRegister from "./pages/DriverRegister";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<RoleSelection />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin-register" element={<AdminRegister />} />

        <Route path="/driver-login" element={<DriverLogin />} />

        <Route path="/driver-register" element={<DriverRegister />} />
         
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/driver-dashboard" element={<DriverDashboard />} />
      </Routes>

    </BrowserRouter>

  );
}

export default App;