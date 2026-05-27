import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";

import "../../styles/Admin/Payments.css";

import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiEye,
  FiDownload,
  FiUpload,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiAlertTriangle,
  FiCreditCard,
  FiArrowRight,
  FiX,
} from "react-icons/fi";

const Payment = () => {
  // =========================================
  // SIDEBAR TOGGLE WORKING
  // =========================================

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  // =========================================
  // REAL DATABASE DATA
  // =========================================
  // KEEP EMPTY
  // FETCH FROM API / DATABASE
 const [trips, setTrips] = useState([]);
  const [payments, setPayments] = useState(
    []
  );

  // =========================================
  // FILTER STATES
  // =========================================

  const [search, setSearch] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("All Status");

  const [selectedClient, setSelectedClient] =
    useState("All Clients");

  const [selectedMethod, setSelectedMethod] =
    useState("All Payment Methods");

  // =========================================
  // DATE FILTER
  // =========================================
  useEffect(() => {

  const fetchTrips = async () => {

    try {

      const response = await fetch(
  "http://localhost:8000/api/trips/",
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }
  
);
      const data = await response.json();

      setTrips(Array.isArray(data) ? data : []);

    } catch (error) {

      console.log(error);

    }
  };

  fetchTrips();

}, []);
  const [fromDate, setFromDate] = useState(
    ""
  );

  const [toDate, setToDate] = useState("");

  // =========================================
  // ADD PAYMENT MODAL
  // =========================================

  const [showAddForm, setShowAddForm] =
    useState(false);
  const [isEdit, setIsEdit] =
  useState(false);
  const [editIndex, setEditIndex] =
  useState(null);
  // =========================================
  // NEW PAYMENT
  // =========================================

  const [newPayment, setNewPayment] =
    useState({
      id: "",
      client: "",
      vehicle: "",
      completedDate: "",
      tripAmount: "",
      paidAmount: "",
      transactionId: "",
      method: "UPI",
    });

  // =========================================
  // FILTER LOGIC
  // =========================================

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesSearch =
        item.id
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.client
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.vehicle
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.transactionId
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "All Status"
          ? true
          : item.status === selectedStatus;

      const matchesClient =
        selectedClient === "All Clients"
          ? true
          : item.client === selectedClient;

      const matchesMethod =
        selectedMethod ===
        "All Payment Methods"
          ? true
          : item.method === selectedMethod;

      let matchesDate = true;

      if (fromDate && toDate) {
        const itemDate = new Date(
          item.completedDate
        );

        matchesDate =
          itemDate >= new Date(fromDate) &&
          itemDate <= new Date(toDate);
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesClient &&
        matchesMethod &&
        matchesDate
      );
    });
  }, [
    payments,
    search,
    selectedStatus,
    selectedClient,
    selectedMethod,
    fromDate,
    toDate,
  ]);

  // =========================================
  // KPI CALCULATIONS
  // =========================================

  const totalTrips =
    filteredPayments.length;

  const totalTripAmount =
    filteredPayments.reduce(
      (acc, item) =>
        acc + Number(item.tripAmount || 0),
      0
    );

  const totalReceived =
    filteredPayments.reduce(
      (acc, item) =>
        acc + Number(item.paidAmount || 0),
      0
    );

  const totalOutstanding =
    filteredPayments.reduce(
      (acc, item) =>
        acc + Number(item.balance || 0),
      0
    );

  const overdueTrips =
    filteredPayments.filter(
      (item) => item.status === "Overdue"
    ).length;

  // =========================================
  // ADD PAYMENT
  // =========================================

  const handleAddPayment = (e) => {
    e.preventDefault();

    const tripAmount = Number(
      newPayment.tripAmount
    );

    const paidAmount = Number(
      newPayment.paidAmount
    );

    const balance =
      tripAmount - paidAmount;

    let status = "Paid";

    if (paidAmount === 0) {
      status = "Overdue";
    } else if (balance > 0) {
      status = "Partial";
    }

    const paymentData = {
      ...newPayment,
      tripAmount,
      paidAmount,
      balance,
      status,
    };

    // =====================================
    // API POST HERE
    // =====================================

    if (isEdit) {

  const updatedPayments = [
    ...payments,
  ];

  updatedPayments[
    editIndex
  ] = paymentData;

  setPayments(
    updatedPayments
  );

  setIsEdit(false);

  setEditIndex(null);

} else {

  setPayments((prev) => [
    paymentData,
    ...prev,
  ]);
}

    setNewPayment({
      id: "",
      client: "",
      vehicle: "",
      completedDate: "",
      tripAmount: "",
      paidAmount: "",
      transactionId: "",
      method: "UPI",
    });

    setShowAddForm(false);
  };

  /* =========================================
   EDIT PAYMENT
========================================= */

const handleEdit = (index) => {

  const payment =
    filteredPayments[index];

  setNewPayment(payment);

  setEditIndex(index);

  setIsEdit(true);

  setShowAddForm(true);
};

  // =========================================
  // DELETE PAYMENT
  // =========================================

 const handleDelete = (id) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this payment?"
    );

  if (!confirmDelete) return;

  const updated = payments.filter(
    (item) => item.id !== id
  );

  setPayments(updated);

  // API DELETE HERE
};

  // =========================================
  // DOWNLOAD REPORT
  // =========================================

  const handleDownloadReport = () => {
    const data = JSON.stringify(
      filteredPayments,
      null,
      2
    );

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = "payments.json";

    link.click();
  };

  // =========================================
  // FILE UPLOAD
  // =========================================

  const handleUploadProof = (e, id) => {
    const file = e.target.files[0];

    if (!file) return;

    const updated = payments.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          proof: file.name,
        };
      }

      return item;
    });

    setPayments(updated);

    // API FILE UPLOAD HERE
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <Sidebar
        sidebarOpen={sidebarOpen}
      />

      {/* MAIN */}

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
          setSidebarOpen={
            setSidebarOpen
          }
        />

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <div className="payments-header-row">
          <div>
            <h2 className="payments-page-title">
              Payment & Balance
              Management
            </h2>

            <div className="payments-breadcrumb">
              Dashboard
              <span>›</span>
              Payments
            </div>
          </div>

          <div className="payments-top-actions">
            {/* SEARCH */}

            <div className="payments-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search by trip ID, client, vehicle, transaction ID..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* DATE */}

            <div className="payments-date-box">
              <div className="date-item">
                <FiCalendar />

                <div>
                  <label>From</label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="date-divider">
                -
              </div>

              <div className="date-item">
                <FiCalendar />

                <div>
                  <label>To</label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) =>
                      setToDate(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}

            <button
              className="add-payment-btn"
              onClick={() =>
                setShowAddForm(true)
              }
            >
              <FiPlus />
              Add Payment
            </button>
          </div>
        </div>

        {/* ================================= */}
        {/* ADD PAYMENT MODAL */}
        {/* ================================= */}

        {showAddForm && (
          <div className="payment-modal-overlay">
            <div className="payment-modal">
              <div className="payment-modal-top">
                <h3>Add Payment</h3>

                <button
                  onClick={() =>
                    setShowAddForm(false)
                  }
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={
                  handleAddPayment
                }
              >
                <div className="payment-form-grid">
                  <select
  required
  value={newPayment.id}
  onChange={(e) => {
    const selectedTrip = trips.find(
      (trip) => trip.trip_id  === e.target.value
    );

    setNewPayment({
      ...newPayment,
      id: selectedTrip?.trip_id || "",
      client: selectedTrip?.client_name  || "",
      vehicle: selectedTrip?.vehicle_number  || "",
      tripAmount:
        selectedTrip?.balance_amount  || "",
    });
  }}
>
  <option value="">
    Select Trip ID
  </option>

  {trips.map((trip) => (
  <option
    key={trip.trip_id}
    value={trip.trip_id}
  >
    {trip.trip_id}
  </option>
))}
</select>

                  <input
                    type="text"
                    placeholder="Client Name"
                    required
                    value={
                      newPayment.client
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        client:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Vehicle Number"
                    required
                    value={
                      newPayment.vehicle
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        vehicle:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="date"
                    required
                    value={
                      newPayment.completedDate
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        completedDate:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Trip Amount"
                    required
                    value={
                      newPayment.tripAmount
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        tripAmount:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Paid Amount"
                    required
                    value={
                      newPayment.paidAmount
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        paidAmount:
                          e.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Transaction ID"
                    value={
                      newPayment.transactionId
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        transactionId:
                          e.target.value,
                      })
                    }
                  />

                  <select
                    value={
                      newPayment.method
                    }
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        method:
                          e.target.value,
                      })
                    }
                  >
                    <option>UPI</option>

                    <option>
                      Bank Transfer
                    </option>

                    <option>NEFT</option>

                    <option>Cash</option>
                  </select>
                </div>
                  
                  {/* FILE UPLOAD */}

<div className="payment-upload-field">

  <label className="payment-upload-title">
    Upload Payment Proof
  </label>

  <input
    type="file"
    className="payment-file-input"
    accept="image/*,.pdf"
    onChange={(e) =>
      setNewPayment({
        ...newPayment,
        paymentProof:
          e.target.files[0],
      })
    }
  />

  {newPayment.paymentProof && (
    <div className="uploaded-file-box">
      {newPayment.paymentProof.name}
    </div>
  )}
</div>
                <button
                  type="submit"
                  className="save-payment-btn"
                >
                  Save Payment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* KPI CARDS */}
        {/* ================================= */}

        <div className="payment-kpi-grid">
          

          <div className="payment-kpi-card orange-card">
            <div className="payment-kpi-content">
              <div>
                <p className="payment-kpi-label">
                  Total Trip Amount
                </p>

                <h3>
                  ₹
                  {totalTripAmount.toLocaleString()}
                </h3>
              </div>

              <div className="payment-kpi-icon orange-icon">
                <FiDollarSign />
              </div>
            </div>
          </div>

          <div className="payment-kpi-card red-card">
            <div className="payment-kpi-content">
              <div>
                <p className="payment-kpi-label">
                  Total Received
                </p>

                <h3>
                  ₹
                  {totalReceived.toLocaleString()}
                </h3>
              </div>

              <div className="payment-kpi-icon red-icon">
                <FiDownload />
              </div>
            </div>
          </div>

          <div className="payment-kpi-card green-card">
            <div className="payment-kpi-content">
              <div>
                <p className="payment-kpi-label">
                  Total Outstanding
                </p>

                <h3>
                  ₹
                  {totalOutstanding.toLocaleString()}
                </h3>
              </div>

              <div className="payment-kpi-icon green-icon">
                <FiDollarSign />
              </div>
            </div>
          </div>

          <div className="payment-kpi-card purple-card">
            <div className="payment-kpi-content">
              <div>
                <p className="payment-kpi-label">
                  Overdue Trips
                </p>

                <h3>{overdueTrips}</h3>
              </div>

              <div className="payment-kpi-icon purple-icon">
                <FiAlertTriangle />
              </div>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* TABLE */}
        {/* ================================= */}

        <div className="payments-table-wrapper">
          <div className="payments-table-top">
            <h3>Trips & Payments</h3>

            <div className="payments-table-actions">
              {/* STATUS */}

              <select
                value={
                  selectedStatus
                }
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >
                <option>
                  All Status
                </option>

                <option>Paid</option>

                <option>Partial</option>

                <option>Overdue</option>
              </select>

              {/* CLIENT */}

              <select
                value={
                  selectedClient
                }
                onChange={(e) =>
                  setSelectedClient(
                    e.target.value
                  )
                }
              >
                <option>
                  All Clients
                </option>

                {[
                  ...new Set(
                    payments.map(
                      (item) =>
                        item.client
                    )
                  ),
                ].map((client) => (
                  <option
                    key={client}
                  >
                    {client}
                  </option>
                ))}
              </select>

              {/* METHOD */}

              <select
                value={
                  selectedMethod
                }
                onChange={(e) =>
                  setSelectedMethod(
                    e.target.value
                  )
                }
              >
                <option>
                  All Payment Methods
                </option>

                <option>UPI</option>

                <option>
                  Bank Transfer
                </option>

                <option>NEFT</option>

                <option>Cash</option>
              </select>

              <button className="filter-btn">
                <FiFilter />
                Filter
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className="payments-table-scroll">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Trip ID</th>

                  <th>Client</th>

                  <th>Vehicle</th>

                  <th>Date</th>

                  <th>Trip Amount</th>

                  <th>Paid Amount</th>

                  <th>Balance</th>

                  <th>Transaction ID</th>

                  <th>Method</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.length >
                0 ? (
                  filteredPayments.map(
                    (item, index) => (
                      <tr
                        key={item.id}
                      >
                        <td className="trip-link">
                          {item.id}
                        </td>

                        <td>
                          {
                            item.client
                          }
                        </td>

                        <td>
                          {
                            item.vehicle
                          }
                        </td>

                        <td>
                          {
                            item.completedDate
                          }
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.tripAmount
                          ).toLocaleString()}
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.paidAmount
                          ).toLocaleString()}
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.balance
                          ).toLocaleString()}
                        </td>

                        <td>
                          {
                            item.transactionId
                          }
                        </td>

                        <td>
                          {item.method}
                        </td>

                        <td>
                          <span
                            className={`payment-status ${item.status?.toLowerCase()}`}
                          >
                            {
                              item.status
                            }
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="payment-action-buttons">
                            <button>
                              <FiEye />
                            </button>

                            <button
                              onClick={() =>
                             handleEdit(index)
                            }
                            >
                              <FiEdit2 />
                          </button>

                            <label className="upload-btn">
                              <FiUpload />

                              <input
                                type="file"
                                hidden
                                onChange={(
                                  e
                                ) =>
                                  handleUploadProof(
                                    e,
                                    item.id
                                  )
                                }
                              />
                            </label>

                            <button
                              onClick={
                                handleDownloadReport
                              }
                            >
                              <FiDownload />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="no-payment-data"
                    >
                      No Payment Records
                      Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================================= */}
        {/* BOTTOM CARDS */}
        {/* ================================= */}

        {/* <div className="payment-bottom-grid">
          <div
            className="payment-bottom-card green-soft"
            onClick={() =>
              setShowAddForm(true)
            }
          >
            <div className="payment-bottom-icon green-light">
              <FiPlus />
            </div>

            <div className="payment-bottom-content">
              <h4>Add Payment</h4>

              <p>
                Add new payment record
              </p>
            </div>

            <button>
              <FiArrowRight />
            </button>
          </div>

          <div className="payment-bottom-card orange-soft">
            <div className="payment-bottom-icon orange-light">
              <FiUpload />
            </div>

            <div className="payment-bottom-content">
              <h4>
                Upload Payment Proof
              </h4>

              <p>
                Upload receipts &
                screenshots
              </p>
            </div>

            <button>
              <FiArrowRight />
            </button>
          </div>

          <div
            className="payment-bottom-card sky-soft"
            onClick={
              handleDownloadReport
            }
          >
            <div className="payment-bottom-icon sky-light">
              <FiDownload />
            </div>

            <div className="payment-bottom-content">
              <h4>Download Report</h4>

              <p>
                Export payment records
              </p>
            </div>

            <button>
              <FiArrowRight />
            </button>
          </div>
        </div> */}


      </div>
    </div>
  );
};

export default Payment;