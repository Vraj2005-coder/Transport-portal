import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCheck, FaUserClock, FaUserTie, FaUsers } from "react-icons/fa";
import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { driversAPI, vehiclesAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Drivers.css";

function Drivers() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    license_number: "",
    license_expiry: "",
  });

  // ── Load drivers and vehicles on mount ──────────────────────────────────────
  useEffect(() => {
    requireAuth();
    fetchDrivers();
    fetchVehicles();
  }, []);

  async function fetchDrivers() {
    try {
      setLoading(true);
      const data = await driversAPI.list();
      setDrivers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicles() {
    try {
      const data = await vehiclesAPI.list();
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  }

  // ── Add driver ─────────────────────────────────────────────────────────────
  async function addDriver() {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.license_number) {
      alert("Please fill all required fields (Name, Email, Phone, Password, License Number)");
      return;
    }

    try {
      setSaving(true);
      
      // Clean up optional fields
      const payload = {
        ...formData,
        license_expiry: formData.license_expiry ? new Date(formData.license_expiry).toISOString() : null,
      };

      const created = await driversAPI.create(payload);
      setDrivers([...drivers, created]);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        license_number: "",
        license_expiry: "",
      });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add driver: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredDrivers = drivers.filter((d) => {
    const searchMatch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number?.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? d.is_active === true
        : d.is_active === false;

    const assignmentMatch =
      assignmentFilter === "All"
        ? true
        : assignmentFilter === "Assigned"
        ? !!d.assigned_truck_id
        : !d.assigned_truck_id;

    return searchMatch && statusMatch && assignmentMatch;
  });

  const activeCount = drivers.filter((d) => d.is_active).length;
  const assignedCount = drivers.filter((d) => d.assigned_truck_id).length;
  const unassignedCount = drivers.filter((d) => !d.assigned_truck_id).length;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN */}
      <div className={`drivers-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        {/* TOPBAR */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* ERROR */}
        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="drivers-header">
          <div>
            <h1>Drivers Management</h1>
            <p>Manage and provision vendor driver accounts</p>
          </div>
          <button className="btn-Driver" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : "+ Add Driver"}
          </button>
        </div>

        {/* STAT CARDS */}
        {/* <div className="drivers-cards">
          <div className="d-card green">
            <h3>Active Drivers</h3>
            <p>{loading ? "—" : activeCount}</p>
          </div>
          <div className="d-card blue">
            <h3>Assigned Drivers</h3>
            <p>{loading ? "—" : assignedCount}</p>
          </div>
          <div className="d-card purple">
            <h3>Unassigned Drivers</h3>
            <p>{loading ? "—" : unassignedCount}</p>
          </div>
          <div className="d-card white">
            <h3>Total Drivers</h3>
            <p>{loading ? "—" : drivers.length}</p>
          </div>
        </div> */}

        {/* ADD DRIVER FORM */}
        {showForm && (
          <div className="drivers-form-panel">
            <h2>Create Driver Account</h2>
            <div className="drivers-form-grid">
              <input
                className="d-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name *"
              />
              <input
                className="d-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address *"
              />
              <input
                className="d-input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (e.g. +1234567890) *"
              />
              <input
                className="d-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Initial Password *"
              />
              <input
                className="d-input"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                placeholder="Driving License Number *"
              />

              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>License Expiry Date</span>
                <input
                  className="d-input"
                  type="date"
                  name="license_expiry"
                  value={formData.license_expiry}
                  onChange={handleChange}
                />
              </label>
            </div>
            
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
              * Password requirements: At least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
            </p>

            <div style={{ marginTop: "20px" }}>
              <button className="btn-primary" onClick={addDriver} disabled={saving}>
                {saving ? "Creating..." : "Save Driver"}
              </button>
            </div>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="drivers-filter-bar">
          <input
            placeholder="Search by name, email, phone, or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
          <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)}>
            <option value="All">All Assignments</option>
            <option value="Assigned">Assigned to Truck</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="drivers-table-panel">
          {loading ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>Loading drivers...</p>
          ) : filteredDrivers.length === 0 ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>
              {drivers.length === 0
                ? "No drivers registered yet. Create a driver account to get started."
                : "No drivers match your filters."}
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "License No.", "License Expiry", "Assigned Vehicle", "Status"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, index) => (
                  <tr key={driver.id || index}>
                    <td style={{ fontWeight: "600", color: "#071739" }}>{driver.name}</td>
                    <td>{driver.email}</td>
                    <td>{driver.phone}</td>
                    <td>{driver.license_number}</td>
                    <td>
                      {driver.license_expiry
                        ? new Date(driver.license_expiry).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      {driver.assigned_truck_id
                        ? vehicles.find((v) => v.id === driver.assigned_truck_id)?.number || driver.assigned_truck_id
                        : "—"}
                    </td>
                    <td>
                      <span className={`status-badge ${driver.is_active ? "active" : "maintenance"}`}>
                        {driver.is_active ? "Active" : "Inactive"}
                      </span>
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

export default Drivers;
