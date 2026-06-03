import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DriverSidebar from "../../components/Driver/DriverSidebar";
import DriverNavbar from "../../components/Driver/DriverNavbar";

import "../../styles/Driver/DriverExpenses.css";

function DriverExpenses() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Backend data will come here
  const [tripExpenses, setTripExpenses] = useState([]);

  useEffect(() => {
    // Future backend integration
    // loadExpenseHistory();
  }, []);

  const totalTrips = tripExpenses.length;

  const totalExpenseAmount = tripExpenses.reduce(
    (sum, trip) => sum + Number(trip.totalExpense || 0),
    0
  );

  const totalEntries = tripExpenses.reduce(
    (sum, trip) => sum + Number(trip.entries || 0),
    0
  );

  return (
    <div className="driver-layout">

      <DriverSidebar isOpen={sidebarOpen} />

      <div
        className={`driver-content ${
          sidebarOpen
            ? "sidebar-open"
            : "sidebar-closed"
        }`}
      >
        <DriverNavbar
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        <div className="expenses-page">

          {/* HEADER */}

          <div className="expenses-header">

            <div>
              <h1>Expense History</h1>

              <p>
                View all trip expense records
                submitted during your trips.
              </p>
            </div>

          </div>

          {/* KPI CARDS */}

          <div className="expense-kpis">

            <div className="expense-kpi blue">
              <h4>Total Trips</h4>
              <span>{totalTrips}</span>
            </div>

            <div className="expense-kpi green">
              <h4>Total Expenses</h4>
              <span>
                ₹
                {totalExpenseAmount.toLocaleString()}
              </span>
            </div>

            <div className="expense-kpi orange">
              <h4>Total Entries</h4>
              <span>{totalEntries}</span>
            </div>

          </div>

          {/* HISTORY TABLE */}

          <div className="expense-history-card">

            <h2>Trip Expense Summary</h2>

            <table className="expense-table">

              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Vehicle</th>
                  <th>Total Expense</th>
                  <th>Entries</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {tripExpenses.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="empty-row"
                    >
                      No expense history found.
                    </td>
                  </tr>

                ) : (

                  tripExpenses.map((trip) => (

                    <tr key={trip.tripId}>

                      <td>
                        {trip.tripId}
                      </td>

                      <td>
                        {trip.vehicle}
                      </td>

                      <td>
                        ₹
                        {Number(
                          trip.totalExpense || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {trip.entries}
                      </td>

                      <td>

                        <button
                          className="view-details-btn"
                          onClick={() =>
                            navigate(
                              `/driver-expense/${trip.tripId}`
                            )
                          }
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DriverExpenses;