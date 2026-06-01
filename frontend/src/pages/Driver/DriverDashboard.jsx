import { useState } from "react";

import DriverSidebar from "../../components/Driver/DriverSidebar";
import DriverNavbar from "../../components/Driver/DriverNavbar";

import "../../styles/Driver/DriverDashboard.css";

function DriverDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [dashboard] = useState({
    assigned_trips: null,
    completed_trips: null,
    assigned_vehicle: null,
    current_trip: null,
    duty_status: null,
  });

  return (
    <div className="driver-layout">
      <DriverSidebar isOpen={sidebarOpen} />

      <div
        className={`driver-content ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <DriverNavbar
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="dashboard-wrapper">

          <div className="dashboard-header">
            <h1>Driver Dashboard</h1>
            <p>
              Overview of assigned trips, vehicle information,
              duties and live tracking.
            </p>
          </div>

          {/* KPI ROW */}

          <div className="dashboard-kpis">

            <div className="kpi-card blue">
              <h4>Assigned Trips</h4>
              <span>{dashboard.assigned_trips ?? "--"}</span>
            </div>

            <div className="kpi-card green">
              <h4>Completed Trips</h4>
              <span>{dashboard.completed_trips ?? "--"}</span>
            </div>

            <div className="kpi-card purple">
              <h4>Assigned Vehicle</h4>
              <span>{dashboard.assigned_vehicle ?? "--"}</span>
            </div>

            <div className="kpi-card orange">
              <h4>Current Trip</h4>
              <span>{dashboard.current_trip ?? "--"}</span>
            </div>

            <div className="kpi-card teal">
              <h4>Duty Status</h4>
              <span>{dashboard.duty_status ?? "--"}</span>
            </div>

          </div>

          {/* TOP CARDS */}

          <div className="driver-dashboard-grid">

            <div className="dashboard-card">
              <h2>Current Assigned Trip</h2>

              <div className="info-row">
                <span>Trip ID</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Client Name</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Route</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Reporting Time</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Status</span>
                <strong>--</strong>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Assigned Vehicle</h2>

              <div className="info-row">
                <span>Vehicle Number</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Vehicle Type</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Permit Status</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Insurance</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Fitness</span>
                <strong>--</strong>
              </div>
            </div>

          </div>

          {/* LIVE TRACKING */}

          <div className="dashboard-card tracking-card">

            <h2>Live Vehicle Tracking</h2>

            <div className="tracking-placeholder">
              <h3>Map Integration Coming Soon</h3>

              <p>
                Real-time GPS tracking, current vehicle location,
                destination route and trip monitoring will appear
                here after tracking integration.
              </p>
            </div>

          </div>

          {/* BOTTOM CARDS */}

          <div className="driver-dashboard-grid">

            <div className="dashboard-card">
              <h2>Upcoming Duties</h2>

              <div className="info-row">
                <span>Next Duty</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Reporting Time</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Vehicle</span>
                <strong>--</strong>
              </div>

              <div className="info-row">
                <span>Client</span>
                <strong>--</strong>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>Recent Trip History</h2>

              <div className="empty-history">
                Completed trip history will appear here.
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;