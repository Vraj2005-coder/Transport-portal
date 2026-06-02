import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DriverSidebar from "../../components/Driver/DriverSidebar";
import DriverNavbar from "../../components/Driver/DriverNavbar";

import "../../styles/Driver/DriverExpenses.css";

function DriverExpenses() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const navigate = useNavigate();

  const trips = [
    {
      tripId: "TRP-1001",
      vehicle: "MH01AB1234",
    },
    {
      tripId: "TRP-1002",
      vehicle: "MH01XY5678",
    },
    {
      tripId: "TRP-1003",
      vehicle: "MH02CD9876",
    },
  ];

  const [expenseHistory, setExpenseHistory] =
    useState([
      {
        id: 1,
        date: "01-06-2026",
        tripId: "TRP-1001",
        vehicle: "MH01AB1234",
        totalExpense: 5650,
        entries: 4,
        status: "Verified",
      },
      {
        id: 2,
        date: "02-06-2026",
        tripId: "TRP-1002",
        vehicle: "MH01XY5678",
        totalExpense: 2300,
        entries: 2,
        status: "Pending",
      },
      {
        id: 3,
        date: "03-06-2026",
        tripId: "TRP-1003",
        vehicle: "MH02CD9876",
        totalExpense: 1100,
        entries: 1,
        status: "Rejected",
      },
    ]);

  const [selectedTrip, setSelectedTrip] =
    useState("");

  const [expenseType, setExpenseType] =
    useState("Fuel (Diesel/Petrol)");

  const [amount, setAmount] =
    useState("");

  const [expenseDate, setExpenseDate] =
    useState("");

  const [receipt, setReceipt] =
    useState(null);

  const selectedVehicle =
    trips.find(
      (trip) =>
        trip.tripId === selectedTrip
    )?.vehicle || "";

  const handleSaveExpense = () => {
    if (
      !selectedTrip ||
      !amount ||
      !expenseDate
    ) {
      alert(
        "Please fill all required fields"
      );
      return;
    }

    const newExpense = {
      id: Date.now(),
      date: expenseDate,
      tripId: selectedTrip,
      vehicle: selectedVehicle,
      totalExpense: Number(amount),
      entries: 1,
      status: "Pending",
    };

    setExpenseHistory([
      newExpense,
      ...expenseHistory,
    ]);

    setSelectedTrip("");
    setExpenseType(
      "Fuel (Diesel/Petrol)"
    );
    setAmount("");
    setExpenseDate("");
    setReceipt(null);

    setShowExpenseModal(false);

    alert(
      "Expense saved successfully"
    );
  };

  const totalExpenses =
    expenseHistory.reduce(
      (sum, item) =>
        sum + item.totalExpense,
      0
    );

  const verifiedCount =
    expenseHistory.filter(
      (item) =>
        item.status === "Verified"
    ).length;

  const pendingCount =
    expenseHistory.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const rejectedCount =
    expenseHistory.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

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

          <div className="expenses-header">

            <div>
              <h1>Driver Expenses</h1>

              <p>
                Track trip expenses
                submitted during
                assigned duties.
              </p>
            </div>

            <button
              className="add-expense-btn"
              onClick={() =>
                setShowExpenseModal(true)
              }
            >
              + Add Expense
            </button>

          </div>

          <div className="expense-kpis">

            <div className="expense-kpi blue">
              <h4>Total Expenses</h4>

              <span>
                ₹
                {totalExpenses.toLocaleString()}
              </span>
            </div>

            <div className="expense-kpi green">
              <h4>Verified</h4>

              <span>
                {verifiedCount}
              </span>
            </div>

            <div className="expense-kpi orange">
              <h4>
                Pending Review
              </h4>

              <span>
                {pendingCount}
              </span>
            </div>

            <div className="expense-kpi red">
              <h4>Rejected</h4>

              <span>
                {rejectedCount}
              </span>
            </div>

          </div>

          <div className="expense-history-card">

            <h2>
              Expense History
            </h2>

            <table className="expense-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trip ID</th>
                  <th>Vehicle</th>
                  <th>Total Expense</th>
                  <th>Entries</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {expenseHistory.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-row"
                    >
                      No expense
                      records found
                    </td>
                  </tr>
                ) : (
                  expenseHistory.map(
                    (expense) => (
                      <tr
                        key={
                          expense.id
                        }
                      >
                        <td>
                          {
                            expense.date
                          }
                        </td>

                        <td>
                          {
                            expense.tripId
                          }
                        </td>

                        <td>
                          {
                            expense.vehicle
                          }
                        </td>

                        <td>
                          ₹
                          {expense.totalExpense.toLocaleString()}
                        </td>

                        <td>
                          {
                            expense.entries
                          }
                        </td>

                        <td>
                          <span
                            className={`status-badge ${expense.status.toLowerCase()}`}
                          >
                            {
                              expense.status
                            }
                          </span>
                        </td>

                        <td>

                          <button
                            className="view-details-btn"
                            onClick={() =>
                              navigate(
                                `/driver-expense/${expense.id}`
                              )
                            }
                          >
                            View
                            Details
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

          {showExpenseModal && (

            <div className="expense-modal-overlay">

              <div className="expense-modal">

                <div className="expense-modal-header">

                  <h2>
                    Add Expense
                  </h2>

                  <button
                    className="close-modal-btn"
                    onClick={() =>
                      setShowExpenseModal(
                        false
                      )
                    }
                  >
                    ✕
                  </button>

                </div>

                <div className="expense-form-grid">

                  <div>

                    <label>
                      Trip ID
                    </label>

                    <select
                      value={
                        selectedTrip
                      }
                      onChange={(e) =>
                        setSelectedTrip(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select Trip
                      </option>

                      {trips.map(
                        (trip) => (
                          <option
                            key={
                              trip.tripId
                            }
                            value={
                              trip.tripId
                            }
                          >
                            {
                              trip.tripId
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label>
                      Vehicle
                    </label>

                    <input
                      type="text"
                      value={
                        selectedVehicle
                      }
                      readOnly
                    />

                  </div>

                  <div>

                    <label>
                      Expense Type
                    </label>

                    <select
                      value={
                        expenseType
                      }
                      onChange={(e) =>
                        setExpenseType(
                          e.target.value
                        )
                      }
                    >

                      <option>
                        Fuel
                        (Diesel/Petrol)
                      </option>

                      <option>
                        Toll Charges
                      </option>

                      <option>
                        Border Tax
                      </option>

                      <option>
                        Parking Fee
                      </option>

                      <option>
                        Loading Charges
                      </option>

                      <option>
                        Unloading Charges
                      </option>

                      <option>
                        Food /
                        Canteen
                      </option>

                      <option>
                        Service
                        Expense
                      </option>

                      <option>
                        Repair
                        Expense
                      </option>

                      <option>
                        Miscellaneous
                      </option>

                    </select>

                  </div>

                  <div>

                    <label>
                      Amount
                    </label>

                    <input
                      type="number"
                      value={
                        amount
                      }
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                      placeholder="Enter Amount"
                    />

                  </div>

                  <div>

                    <label>
                      Expense Date
                    </label>

                    <input
                      type="date"
                      value={
                        expenseDate
                      }
                      onChange={(e) =>
                        setExpenseDate(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <label>
                      Receipt
                    </label>

                    <input
                      type="file"
                      onChange={(e) =>
                        setReceipt(
                          e.target.files[0]
                        )
                      }
                    />

                  </div>

                </div>

                <div className="expense-modal-actions">

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setShowExpenseModal(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="save-btn"
                    onClick={
                      handleSaveExpense
                    }
                  >
                    Save Expense
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default DriverExpenses;