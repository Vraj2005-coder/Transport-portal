import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { vehiclesAPI, driversAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Vehicles.css";

function Vehicles() {

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    number: "", type: "", model: "", driver: "", driver_id: "",
    insurance: "", permit: "", fitness: "", puc: "", status: "",
  });

  // ── Load vehicles and drivers on mount ──────────────────────────────────────
  useEffect(() => {
    requireAuth();
    fetchVehicles();
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      const data = await driversAPI.list();
      setDrivers(data);
    } catch (err) {
      console.error("Failed to load drivers:", err);
    }
  }

  async function fetchVehicles() {
    try {
      setLoading(true);
      const data = await vehiclesAPI.list();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Add vehicle ─────────────────────────────────────────────────────────────
  async function addVehicle() {
    if (!formData.number || !formData.driver || !formData.status) {
      alert("Please fill all required fields (Number, Driver, Status)");
      return;
    }
    try {
      setSaving(true);
      const created = await vehiclesAPI.create(formData);
      setVehicles([...vehicles, created]);
      setFormData({ number: "", type: "", model: "", driver: "", driver_id: "", insurance: "", permit: "", fitness: "", puc: "", status: "" });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add vehicle: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    const searchMatch =
      v.number?.toLowerCase().includes(search.toLowerCase()) ||
      v.driver?.toLowerCase().includes(search.toLowerCase());
    const typeMatch = vehicleFilter === "All" ? true : v.type === vehicleFilter;
    const statusMatch = statusFilter === "All" ? true : v.status === statusFilter;
    return searchMatch && typeMatch && statusMatch;
  });

  const availableVehicles = vehicles.filter((v) => v.status === "Active").length;
  const bookedVehicles = vehicles.filter((v) => v.status === "Booked").length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === "Maintenance").length;

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN */}
      <div className={`vehicles-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>

        {/* TOPBAR */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* ERROR */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="vehicles-header">
          <div>
            <h1>Vehicles Management</h1>
            <p>Manage all transport vehicles</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + Add Vehicle
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="vehicles-cards">
          <div className="v-card green">
            <h3>Available Vehicles</h3>
            <p>{loading ? "—" : availableVehicles}</p>
          </div>
          <div className="v-card blue">
            <h3>Booked Vehicles</h3>
            <p>{loading ? "—" : bookedVehicles}</p>
          </div>
          <div className="v-card orange">
            <h3>In Maintenance</h3>
            <p>{loading ? "—" : maintenanceVehicles}</p>
          </div>
          <div className="v-card white">
            <h3>Total Vehicles</h3>
            <p>{loading ? "—" : vehicles.length}</p>
          </div>
        </div>

        {/* ADD VEHICLE FORM */}
        {showForm && (
          <div className="vehicles-form-panel">
            <h2>Add Vehicle</h2>
            <div className="vehicles-form-grid">

              <input className="v-input" name="number" value={formData.number} onChange={handleChange} placeholder="Vehicle Number *" />
              <input className="v-input" name="type" value={formData.type} onChange={handleChange} placeholder="Vehicle Type" />
              <input className="v-input" name="model" value={formData.model} onChange={handleChange} placeholder="Vehicle Model" />
              <select
                className="v-input"
                name="driver"
                value={formData.driver_id ? `${formData.driver_id}|${formData.driver}` : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setFormData({ ...formData, driver: "", driver_id: "" });
                  } else {
                    const [id, name] = val.split("|");
                    setFormData({ ...formData, driver: name, driver_id: id });
                  }
                }}
              >
                <option value="">Select Driver *</option>
                {drivers.map((d) => (
                  <option key={d.id} value={`${d.id}|${d.name}`}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Insurance Expiry Date</span>
                <input className="v-input" type="date" name="insurance" value={formData.insurance} onChange={handleChange} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Permit Expiry Date</span>
                <input className="v-input" type="date" name="permit" value={formData.permit} onChange={handleChange} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Fitness Certificate Expiry</span>
                <input className="v-input" type="date" name="fitness" value={formData.fitness} onChange={handleChange} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>PUC Expiry Date</span>
                <input className="v-input" type="date" name="puc" value={formData.puc} onChange={handleChange} />
              </label>

              <select className="v-input" name="status" value={formData.status} onChange={handleChange}>
                <option value="">Select Status *</option>
                <option value="Active">Active</option>
                <option value="Booked">Booked</option>
                <option value="Maintenance">Maintenance</option>
              </select>

            </div>
            <div style={{ marginTop: "20px" }}>
              <button className="btn-primary" onClick={addVehicle} disabled={saving}>
                {saving ? "Saving..." : "Save Vehicle"}
              </button>
            </div>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="vehicles-filter-bar">
          <input
            placeholder="Search by vehicle number or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="49-Seater AC">49-Seater AC</option>
            <option value="40-Seater">40-Seater</option>
            <option value="Truck">Truck</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="vehicles-table-panel">
          {loading ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>Loading vehicles...</p>
          ) : filteredVehicles.length === 0 ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>
              {vehicles.length === 0
                ? "No vehicles yet. Click '+ Add Vehicle' to get started."
                : "No vehicles match your filters."}
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  {["Vehicle No.", "Type", "Model", "Driver", "Insurance", "Permit", "Fitness", "PUC", "Status", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id || index}>
                    <td>{vehicle.number}</td>
                    <td>{vehicle.type || "—"}</td>
                    <td>{vehicle.model || "—"}</td>
                    <td>{vehicle.driver}</td>
                    <td>{vehicle.insurance || "—"}</td>
                    <td>{vehicle.permit || "—"}</td>
                    <td>{vehicle.fitness || "—"}</td>
                    <td>{vehicle.puc || "—"}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status?.toLowerCase()}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => navigate("/vehicle-details", { state: { vehicle } })}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default Vehicles;