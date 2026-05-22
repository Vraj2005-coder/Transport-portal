import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { vehiclesAPI, driversAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Vehicles.css";

function VehicleDetails() {

  const navigate   = useNavigate();
  const location   = useLocation();

  // Vehicle passed via navigation state (from Vehicles table)
  const passedVehicle = location.state?.vehicle || null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editMode, setEditMode]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const [vehicleData, setVehicleData] = useState(
    passedVehicle || {
      id: "", number: "", type: "", model: "",
      driver: "", insurance: "", permit: "", fitness: "", status: "Active",
    }
  );
  const [drivers, setDrivers] = useState([]);

  // Fetch fresh data from backend using the vehicle's id
  useEffect(() => {
    requireAuth();
    if (passedVehicle?.id) {
      vehiclesAPI.get(passedVehicle.id)
        .then((data) => setVehicleData(data))
        .catch(() => {}); // fall back to passed state if fetch fails
    }
    driversAPI.list()
      .then((data) => setDrivers(data))
      .catch((err) => console.error("Failed to load drivers:", err));
  }, []);

  // ── Save edits ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!editMode) { setEditMode(true); return; }
    try {
      setSaving(true);
      const updated = await vehiclesAPI.update(vehicleData.id, {
        number:    vehicleData.number,
        type:      vehicleData.type,
        model:     vehicleData.model,
        driver:    vehicleData.driver,
        driver_id: vehicleData.driver_id,
        insurance: vehicleData.insurance,
        permit:    vehicleData.permit,
        fitness:   vehicleData.fitness,
        status:    vehicleData.status,
      });
      setVehicleData(updated);
      setEditMode(false);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Editable field helper ───────────────────────────────────────────────────
  function field(label, key) {
    return (
      <div className="vd-detail-box">
        <p>{label}</p>
        {editMode ? (
          <input
            className="v-input"
            value={vehicleData[key] || ""}
            onChange={(e) => setVehicleData({ ...vehicleData, [key]: e.target.value })}
          />
        ) : (
          <h4>{vehicleData[key] || "—"}</h4>
        )}
      </div>
    );
  }

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
            <h1>Vehicle Details</h1>
            <p>Dashboard &gt; Vehicles &gt; {vehicleData.number}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-danger" onClick={() => navigate("/vehicles")}>
              Close
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editMode ? "Save Vehicle" : "Edit Vehicle"}
            </button>
          </div>
        </div>

        {/* TOP GRID — Vehicle Card + Driver Card */}
        <div className="vd-grid-top">

          {/* VEHICLE CARD */}
          <div className="vd-panel">
            <div className="vd-vehicle-card">

              <div className="vd-vehicle-icon">🚌</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                  {editMode ? (
                    <input
                      className="v-input"
                      style={{ maxWidth: "200px" }}
                      value={vehicleData.number}
                      onChange={(e) => setVehicleData({ ...vehicleData, number: e.target.value })}
                    />
                  ) : (
                    <h2 style={{ fontSize: "17px", color: "#071739", margin: 0 }}>{vehicleData.number}</h2>
                  )}
                  <span className={`status-badge ${vehicleData.status?.toLowerCase()}`}>
                    {vehicleData.status}
                  </span>
                </div>

                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>{vehicleData.type}</p>

                <div className="vd-details-grid">
                  {field("Model",               "model")}
                  <div className="vd-detail-box">
                    <p>Driver</p>
                    {editMode ? (
                      <select
                        className="v-input"
                        value={vehicleData.driver_id ? `${vehicleData.driver_id}|${vehicleData.driver}` : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setVehicleData({ ...vehicleData, driver: "", driver_id: "" });
                          } else {
                            const [id, name] = val.split("|");
                            setVehicleData({ ...vehicleData, driver: name, driver_id: id });
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
                    ) : (
                      <h4>{vehicleData.driver || "—"}</h4>
                    )}
                  </div>
                  {field("Insurance Valid Till", "insurance")}
                  {field("Permit Valid Till",    "permit")}
                  {field("Fitness Valid Till",   "fitness")}
                  {editMode ? (
                    <div className="vd-detail-box">
                      <p>Status</p>
                      <select
                        className="v-input"
                        value={vehicleData.status}
                        onChange={(e) => setVehicleData({ ...vehicleData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Booked">Booked</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  ) : (
                    <div className="vd-detail-box">
                      <p>Status</p>
                      <h4>{vehicleData.status}</h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DRIVER CARD */}
          <div className="vd-panel">
            <h2>Assigned Driver</h2>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "22px" }}>
              <div className="vd-driver-avatar">
                {vehicleData.driver?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div className="vd-driver-info">
                <h3>{vehicleData.driver || "—"}</h3>
                <p>Assigned to this vehicle</p>
              </div>
            </div>

            <div className="vd-driver-row">
              <span>Vehicle No.</span>
              <span>{vehicleData.number}</span>
            </div>
            <div className="vd-driver-row">
              <span>Vehicle Type</span>
              <span>{vehicleData.type || "—"}</span>
            </div>
            <div className="vd-driver-row">
              <span>Current Status</span>
              <span>
                <span className={`status-badge ${vehicleData.status?.toLowerCase()}`}>
                  {vehicleData.status}
                </span>
              </span>
            </div>
          </div>

        </div>

        {/* BOTTOM GRID — Document Expiry + Location */}
        <div className="vd-grid-bottom">

          {/* DOCUMENT EXPIRY PANEL */}
          <div className="vd-panel">
            <h2>Document Expiry Dates</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Document", "Expiry Date", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px", color: "#071739", fontSize: "14px", borderBottom: "2px solid #e5e7eb" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Insurance",          date: vehicleData.insurance },
                  { name: "Permit",             date: vehicleData.permit    },
                  { name: "Fitness Certificate", date: vehicleData.fitness   },
                ].map((doc) => {
                  const isExpiring = doc.date && new Date(doc.date) <= new Date(Date.now() + 30 * 86400000);
                  const isExpired  = doc.date && new Date(doc.date) < new Date();
                  return (
                    <tr key={doc.name}>
                      <td style={{ padding: "12px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{doc.name}</td>
                      <td style={{ padding: "12px", fontSize: "14px", color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{doc.date || "—"}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
                        {doc.date ? (
                          <span className={`status-badge ${isExpired ? "maintenance" : isExpiring ? "booked" : "active"}`}>
                            {isExpired ? "Expired" : isExpiring ? "Expiring Soon" : "Valid"}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* VEHICLE INFO PANEL */}
          <div className="vd-panel">
            <h2>Vehicle Info</h2>
            <div className="vd-driver-row">
              <span>Registration No.</span>
              <span>{vehicleData.number}</span>
            </div>
            <div className="vd-driver-row">
              <span>Model</span>
              <span>{vehicleData.model || "—"}</span>
            </div>
            <div className="vd-driver-row">
              <span>Type</span>
              <span>{vehicleData.type || "—"}</span>
            </div>
            <div className="vd-driver-row">
              <span>Assigned Driver</span>
              <span>{vehicleData.driver || "—"}</span>
            </div>
            <div className="vd-driver-row">
              <span>Location</span>
              <span>{vehicleData.location || "—"}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default VehicleDetails;