import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DriverSidebar from "../../components/Driver/DriverSidebar";
import DriverNavbar from "../../components/Driver/DriverNavbar";

import "../../styles/Driver/DriverExpenseDetails.css";

function DriverExpenseDetails() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const { expenseId } = useParams();

  // Dummy Data
  // Backend will replace this later
  const expenseDetails = {
    expenseId: expenseId,
    tripId: "TRP-1001",
    vehicle: "MH01AB1234",
    submittedDate: "01-06-2026",
    verificationStatus: "Verified",
    adminRemarks:
      "All receipts verified successfully.",

    expenses: [
      {
        id: 1,
        type: "Fuel",
        amount: 4500,
        date: "01-06-2026",
        receipt: "fuel_receipt.jpg",
        status: "Verified",
      },
      {
        id: 2,
        type: "Toll Charges",
        amount: 850,
        date: "01-06-2026",
        receipt: "toll_receipt.jpg",
        status: "Verified",
      },
      {
        id: 3,
        type: "Parking Fee",
        amount: 200,
        date: "01-06-2026",
        receipt: "parking_receipt.jpg",
        status: "Pending",
      },
      {
        id: 4,
        type: "Food / Canteen",
        amount: 100,
        date: "01-06-2026",
        receipt: "food_receipt.jpg",
        status: "Verified",
      },
    ],
  };

  const totalExpense =
    expenseDetails.expenses.reduce(
      (sum, item) => sum + item.amount,
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

        <div className="expense-details-page">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/driver-expenses")
            }
          >
            ← Back To Expenses
          </button>

          {/* HEADER CARD */}

          <div className="expense-detail-card">

            <h1>Expense Details</h1>

            <div className="detail-row">
              <span>Expense ID</span>
              <strong>
                {expenseDetails.expenseId}
              </strong>
            </div>

            <div className="detail-row">
              <span>Trip ID</span>
              <strong>
                {expenseDetails.tripId}
              </strong>
            </div>

            <div className="detail-row">
              <span>Vehicle</span>
              <strong>
                {expenseDetails.vehicle}
              </strong>
            </div>

            <div className="detail-row">
              <span>Submitted Date</span>
              <strong>
                {
                  expenseDetails.submittedDate
                }
              </strong>
            </div>

            <div className="detail-row">
              <span>Total Expense</span>
              <strong>
                ₹
                {totalExpense.toLocaleString()}
              </strong>
            </div>

            <div className="detail-row">
              <span>Status</span>

              <strong
                className={
                  expenseDetails.verificationStatus.toLowerCase()
                }
              >
                {
                  expenseDetails.verificationStatus
                }
              </strong>
            </div>

          </div>

          {/* EXPENSE BREAKDOWN */}

          <div className="expense-detail-card">

            <h2>Expense Breakdown</h2>

            <table className="breakdown-table">

              <thead>
                <tr>
                  <th>Expense Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Verification</th>
                </tr>
              </thead>

              <tbody>

                {expenseDetails.expenses.map(
                  (expense) => (
                    <tr key={expense.id}>

                      <td>
                        {expense.type}
                      </td>

                      <td>
                        ₹
                        {expense.amount.toLocaleString()}
                      </td>

                      <td>
                        {expense.date}
                      </td>

                      <td>

                        <button className="receipt-btn">
                          View Receipt
                        </button>

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            expense.status.toLowerCase()
                          }`}
                        >
                          {expense.status}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* RECEIPT SECTION */}

          <div className="expense-detail-card">

            <h2>Uploaded Receipts</h2>

            <div className="receipt-grid">

              {expenseDetails.expenses.map(
                (expense) => (
                  <div
                    key={expense.id}
                    className="receipt-card"
                  >

                    <div className="receipt-placeholder">

                      Receipt Image

                    </div>

                    <p>
                      {expense.receipt}
                    </p>

                    <span
                      className={`status-badge ${
                        expense.status.toLowerCase()
                      }`}
                    >
                      {expense.status}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

          {/* ADMIN VERIFICATION */}

          <div className="expense-detail-card">

            <h2>
              Admin Verification
            </h2>

            <div className="detail-row">
              <span>
                Verification Status
              </span>

              <strong>
                {
                  expenseDetails.verificationStatus
                }
              </strong>
            </div>

            <div className="remarks-box">

              {
                expenseDetails.adminRemarks
              }

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DriverExpenseDetails;