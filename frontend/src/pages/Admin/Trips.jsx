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
    vehicle_id: "",
    client_name: "",
    client_phone: "",
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
      !formData.reporting_time ||
      formData.balance_amount === ""
    ) {
      alert("Please fill all required fields including Trip Cost.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        trip_id: `TRIP-${Date.now()}`,
        balance_amount: parseFloat(formData.balance_amount) || 0,
        reporting_time: new Date(formData.reporting_time).toISOString(),
      };

      const created = await tripsAPI.create(payload);
      setTrips([created, ...trips]);

      setFormData({
        vehicle_id: "",
        client_name: "",
        client_phone: "",
        pickup_location: "",
        drop_location: "",
        reporting_time: "",
        balance_amount: "",
        notes: "",
      });
      setShowForm(false);
      fetchVehicles();
      alert("Trip Created! Notifications sent to Driver & Client.");
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
      fetchVehicles();
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
    const q = search.toLowerCase();
    const searchMatch =
      t.client_name?.toLowerCase().includes(q) ||
      t.client_phone?.toLowerCase().includes(q) ||
      t.vehicle_number?.toLowerCase().includes(q) ||
      t.driver_name?.toLowerCase().includes(q);
    const statusMatch = statusFilter === "All" || t.trip_status === statusFilter;
    return searchMatch && statusMatch;
  });

  const scheduledCount = trips.filter((t) => t.trip_status === "Scheduled").length;
  const onTripCount   = trips.filter((t) => t.trip_status === "On Trip").length;
  const completedCount = trips.filter((t) => t.trip_status === "Completed").length;

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className={`trips-content ${sidebarOpen ? "sidebar-open" : "sidebar-close"}`}>
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {error && (
          <div className="trips-error-banner">⚠ {error}</div>
        )}

        {/* ── Header ── */}
        <div className="trips-header">
          <div>
            <h1>Trips &amp; Bookings</h1>
            <p>Manage all trips, auto-assign drivers, and trigger notifications.</p>
          </div>
          <div className="trips-header-actions">
            <button className="btn-danger" onClick={handleClearAll} disabled={loading || trips.length === 0}>
              Clear All Trips
            </button>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Hide Form" : "+ Create Trip"}
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
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

        {/* ── Create Trip Form ── */}
        {showForm && (
          <div className="trips-form-panel">
            <h2>Create New Trip</h2>
            <p className="trips-form-subtitle">
              Notifications will be sent to the Driver &amp; Client automatically.
            </p>

            <div className="trips-form-grid">
              {/* Row 1 */}
              <label className="trips-label">
                <span>Client Name <span className="req">*</span></span>
                <input
                  className="t-input"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
              </label>
              <label className="trips-label">
                <span>Client Phone <span className="req">*</span></span>
                <input
                  className="t-input"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  placeholder="e.g. +919876543210"
                />
              </label>

              {/* Row 2 */}
              <label className="trips-label">
                <span>Pickup Location <span className="req">*</span></span>
                <input
                  className="t-input"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai Central"
                />
              </label>
              <label className="trips-label">
                <span>Drop Location <span className="req">*</span></span>
                <input
                  className="t-input"
                  name="drop_location"
                  value={formData.drop_location}
                  onChange={handleChange}
                  placeholder="e.g. Pune Station"
                />
              </label>

              {/* Row 3 */}
              <label className="trips-label">
                <span>Vehicle <span className="req">*</span></span>
                <select
                  className="t-input"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                >
                  <option value="">Select Available Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.number} ({v.type}) — Driver: {v.driver || "None"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="trips-label">
                <span>Reporting Time <span className="req">*</span></span>
                <input
                  className="t-input"
                  type="datetime-local"
                  name="reporting_time"
                  value={formData.reporting_time}
                  onChange={handleChange}
                />
              </label>
              {/* Row 4 — Balance Amount + Notes */}
              <label className="trips-label">
                <span>Balance Amount (₹) <span className="req">*</span></span>
                <input
                  className="t-input"
                  type="number"
                  name="balance_amount"
                  value={formData.balance_amount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  min="0"
                />
              </label>
              <label className="trips-label">
                <span>Special Notes</span>
                <input
                  className="t-input"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional instructions"
                />
              </label>
            </div>

            <div className="trips-form-footer">
              <button className="btn-primary" onClick={handleCreateTrip} disabled={saving}>
                {saving ? "Creating & Sending..." : "Create Trip"}
              </button>
            </div>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="trips-filter-bar">
          <input
            className="t-input"
            placeholder="Search by client, phone, vehicle, or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="t-input trips-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="On Trip">On Trip</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="trips-table-panel">
          {loading ? (
            <p className="trips-empty">Loading trips...</p>
          ) : filteredTrips.length === 0 ? (
            <p className="trips-empty">No trips found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Client</th>
                  <th>Vehicle &amp; Driver</th>
                  <th>Route</th>
                  <th>Reporting Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip, idx) => (
                  <tr key={trip.id || idx}>
                    <td>
                      <div className="trips-trip-id">{trip.trip_id}</div>
                    </td>
                    <td>
                      <div className="trips-cell-primary">{trip.client_name}</div>
                      <div className="trips-cell-secondary">{trip.client_phone}</div>
                    </td>
                    <td>
                      <div className="trips-cell-primary">{trip.vehicle_number}</div>
                      <div className="trips-cell-secondary">{trip.driver_name}</div>
                    </td>
                    <td>
                      <div className="trips-cell-route">{trip.pickup_location} ➔</div>
                      <div className="trips-cell-route">{trip.drop_location}</div>
                    </td>
                    <td className="trips-cell-date">
                      {new Date(trip.reporting_time).toLocaleString(undefined, {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        trip.trip_status === "Scheduled"  ? "active"      :
                        trip.trip_status === "On Trip"    ? "booked"      :
                        trip.trip_status === "Cancelled"  ? "maintenance" : "active"
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
