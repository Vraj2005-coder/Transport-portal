import { useState } from "react";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";

import "../../styles/Admin/AdminDashboard.css";

function AdminDashboard() {

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar
        sidebarOpen={sidebarOpen}
      />

      {/* MAIN CONTENT */}

      <div
        className={`dashboard-content ${
          sidebarOpen
            ? "sidebar-open"
            : "sidebar-close"
        }`}
      >

        {/* TOPBAR */}

        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* DASHBOARD CARDS */}

        <div className="cards">

          <div className="card green">

            <h3>Total Vehicles</h3>

            <p>120</p>

          </div>

          <div className="card blue">

            <h3>Active Drivers</h3>

            <p>45</p>

          </div>

          <div className="card white">

            <h3>Trips Today</h3>

            <p>32</p>

          </div>

          <div className="card green">

            <h3>Pending Documents</h3>

            <p>8</p>

          </div>

        </div>

        {/* RECENT ACTIVITY TABLE */}

        <div className="table-section">

          <h2>
            Recent Vehicle Activity
          </h2>

          <table>

            <thead>

              <tr>

                <th>Vehicle</th>

                <th>Driver</th>

                <th>Status</th>

                <th>Location</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>MH12AB1234</td>

                <td>Rahul Sharma</td>

                <td>Active</td>

                <td>Mumbai</td>

              </tr>

              <tr>

                <td>RJ14XY5678</td>

                <td>Aman Verma</td>

                <td>On Trip</td>

                <td>Delhi</td>

              </tr>

              <tr>

                <td>MH09TR8899</td>

                <td>Rakesh Patel</td>

                <td>Maintenance</td>

                <td>Pune</td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default AdminDashboard;