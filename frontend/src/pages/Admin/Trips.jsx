import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";
import { tripsAPI, vehiclesAPI, requireAuth } from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Trips.css";

function Trips() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    vehicle_id: "",
    pickup_location: "",
    drop_location: "",
    reporting_time: "",
    balance_amount: "",
    notes: "",
  });

  useEffect(() => {
    requireAuth();
    fetchTrips();
    fetchVehicles();
  }, []);

  async function fetchTrips() {
    try {
      setLoading(true);
      const data = await tripsAPI.list();
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicles() {
    try {
      const data = await vehiclesAPI.list();
      // Only show Active vehicles in the dropdown
      setVehicles(data.filter((v) => v.status === "Active"));
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  }

  async function handleCreateTrip() {
    if (
      !formData.client_name ||
      !formData.client_phone ||
      !formData.vehicle_id ||
      !formData.pickup_location ||
      !formData.drop_location ||
      !formData.reporting_time
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
  ...formData,

  trip_id: `TRIP-${Date.now()}`,

  balance_amount: formData.balance_amount
    ? parseFloat(formData.balance_amount)
    : 0,

  reporting_time: new Date(
    formData.reporting_time
  ).toISOString(),
};

      const created = await tripsAPI.create(payload);
      
      // Auto triggers SMS + reminder schedule + dummy payment link on backend
      setTrips([created, ...trips]);
      
      setFormData({
        client_name: "",
        client_phone: "",
        vehicle_id: "",
        pickup_location: "",
        drop_location: "",
        reporting_time: "",
        balance_amount: "",
        notes: "",
      });
      setShowForm(false);
      
      // Fetch vehicles again to remove the newly booked vehicle from dropdown
      fetchVehicles();
      
      alert("Trip Created! SMS sent to Driver and Client.");
      
    } catch (err) {
      alert("Failed to create trip: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Are you sure you want to delete ALL trips? This cannot be undone.")) return;
    try {
      setLoading(true);
      await tripsAPI.deleteAll();
      setTrips([]);
      fetchVehicles(); // Refresh vehicles to show them as available
      alert("All trips cleared!");
    } catch (err) {
      alert("Failed to clear trips: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const filteredTrips = trips.filter((t) => {
    const searchMatch =
      t.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.client_phone?.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.driver_name?.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter === "All" ? true : t.trip_status === statusFilter;

    return searchMatch && statusMatch;
  });

  const scheduledCount = trips.filter((t) => t.trip_status === "Scheduled").length;
  const onTripCount = trips.filter((t) => t.trip_status === "On Trip").length;
  const completedCount = trips.filter((t) => t.trip_status === "Completed").length;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN */}
      <div className={`trips-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {error && (
          <div style={{ background: "#fee2e2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", margin: "20px 32px 0", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        <div className="trips-header">
          <div>
            <h1>Trips & Bookings</h1>
            <p>Manage all trips, auto-assign drivers, and trigger SMS notifications.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-danger" onClick={handleClearAll} disabled={loading || trips.length === 0}>
              Clear All Trips
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Hide Form" : "+ Create Trip"}
            </button>
          </div>
        </div>

        <div className="trips-cards">
          <div className="t-card green">
            <h3>Scheduled</h3>
            <p>{loading ? "—" : scheduledCount}</p>
          </div>
          <div className="t-card blue">
            <h3>On Trip</h3>
            <p>{loading ? "—" : onTripCount}</p>
          </div>
          <div className="t-card orange">
            <h3>Completed</h3>
            <p>{loading ? "—" : completedCount}</p>
          </div>
          <div className="t-card white">
            <h3>Total Trips</h3>
            <p>{loading ? "—" : trips.length}</p>
          </div>
        </div>

        {showForm && (
          <div className="trips-form-panel">
            <h2>Create New Trip (Auto SMS enabled)</h2>
            <div className="trips-form-grid">
              <input className="t-input" name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Client Name *" />
              <input className="t-input" name="client_phone" value={formData.client_phone} onChange={handleChange} placeholder="Client Phone (e.g. +1234567890) *" />
              
              <select className="t-input" name="vehicle_id" value={formData.vehicle_id} onChange={handleChange}>
                <option value="">Select Available Vehicle *</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.number} ({v.type}) - Driver: {v.driver || "None"}
                  </option>
                ))}
              </select>

              <input className="t-input" name="pickup_location" value={formData.pickup_location} onChange={handleChange} placeholder="Pickup Location *" />
              <input className="t-input" name="drop_location" value={formData.drop_location} onChange={handleChange} placeholder="Drop Location *" />
              
              <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Reporting Time *</span>
                <input className="t-input" type="datetime-local" name="reporting_time" value={formData.reporting_time} onChange={handleChange} />
              </label>

              <input className="t-input" type="number" name="balance_amount" value={formData.balance_amount} onChange={handleChange} placeholder="Balance Amount (₹)" />
              <input className="t-input" name="notes" value={formData.notes} onChange={handleChange} placeholder="Special Notes (Optional)" />
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
              * Creating this trip will instantly send an SMS to the Driver & Client, and schedule duty reminders 2hr & 1hr before.
            </p>

            <div style={{ marginTop: "20px" }}>
              <button className="btn-primary" onClick={handleCreateTrip} disabled={saving}>
                {saving ? "Creating & Sending SMS..." : "Create Trip"}
              </button>
            </div>
          </div>
        )}

        <div className="trips-filter-bar">
          <input
            placeholder="Search by client, phone, vehicle, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="On Trip">On Trip</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="trips-table-panel">
          {loading ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>Loading trips...</p>
          ) : filteredTrips.length === 0 ? (
            <p style={{ padding: "24px", color: "#64748b", fontSize: "14px" }}>No trips found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Client</th>
                  <th>Vehicle & Driver</th>
                  <th>Route</th>
                  <th>Reporting Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, idx) => (
                  <tr key={trip.id || idx}><td>
  <div
    style={{
      fontWeight: "700",
      color: "#2563eb",
    }}
  >
    {trip.trip_id}
  </div>
</td>

                    <td>
                      <div style={{ fontWeight: "600", color: "#071739" }}>{trip.client_name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{trip.client_phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#071739" }}>{trip.vehicle_number}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{trip.driver_name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px" }}>{trip.pickup_location} ➔</div>
                      <div style={{ fontSize: "13px" }}>{trip.drop_location}</div>
                    </td>
                    <td>
                      {new Date(trip.reporting_time).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        trip.trip_status === 'Scheduled' ? 'active' :
                        trip.trip_status === 'On Trip' ? 'booked' :
                        trip.trip_status === 'Cancelled' ? 'maintenance' : 'active'
                      }`}>
                        {trip.trip_status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => navigate("/trip-details", { state: { trip } })}
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

export default Trips;
