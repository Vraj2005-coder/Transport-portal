import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Vehicles() {

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [vehicleFilter, setVehicleFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [vehicles, setVehicles] =
    useState([
      {
        number: "MH12AB1234",
        type: "49-Seater AC",
        model: "Volvo 9600",
        driver: "Rahul Sharma",
        insurance: "2026-07-15",
        permit: "2026-09-10",
        fitness: "2026-08-20",
        status: "Active",
      },

      {
        number: "RJ14XY5678",
        type: "Truck",
        model: "Tata Truck",
        driver: "Aman Verma",
        insurance: "2026-06-12",
        permit: "2026-08-20",
        fitness: "2026-09-18",
        status: "Maintenance",
      },

      {
        number: "DL10CD5678",
        type: "40-Seater",
        model: "Eicher Skyline",
        driver: "Rakesh Patel",
        insurance: "2026-11-18",
        permit: "2026-12-15",
        fitness: "2026-10-21",
        status: "Booked",
      },
    ]);

  const [formData, setFormData] =
    useState({
      number: "",
      type: "",
      model: "",
      driver: "",
      insurance: "",
      permit: "",
      fitness: "",
      status: "",
    });

  function handleChange(e) {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  }

  function addVehicle() {

    if (
      formData.number === "" ||
      formData.driver === "" ||
      formData.status === ""
    ) {

      alert(
        "Please fill all required fields"
      );

      return;
    }

    setVehicles([
      ...vehicles,
      formData,
    ]);

    setFormData({
      number: "",
      type: "",
      model: "",
      driver: "",
      insurance: "",
      permit: "",
      fitness: "",
      status: "",
    });

    setShowForm(false);

    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });

    alert(
      "Vehicle Added Successfully"
    );
  }

  const filteredVehicles =
    vehicles.filter((vehicle) => {

      const searchMatch =
        vehicle.number
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        vehicle.driver
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const vehicleTypeMatch =
        vehicleFilter === "All"
          ? true
          : vehicle.type ===
            vehicleFilter;

      const statusMatch =
        statusFilter === "All"
          ? true
          : vehicle.status ===
            statusFilter;

      return (
        searchMatch &&
        vehicleTypeMatch &&
        statusMatch
      );
    });

  const availableVehicles =
    vehicles.filter(
      (v) => v.status === "Active"
    ).length;

  const bookedVehicles =
    vehicles.filter(
      (v) => v.status === "Booked"
    ).length;

  const maintenanceVehicles =
    vehicles.filter(
      (v) =>
        v.status === "Maintenance"
    ).length;

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
          "Segoe UI, sans-serif",
      }}
    >

      {/* SIDEBAR */}

      {sidebarOpen && (

        <div
          style={{
            width: "240px",
            background: "#071739",
            color: "white",
            padding: "24px 18px",
            position: "fixed",
            height: "100vh",
          }}
        >

          <h2
            style={{
              marginBottom: "40px",
              fontSize: "24px",
            }}
          >
            TMS Admin
          </h2>

          <ul
            style={{
              listStyle: "none",
            }}
          >

            {[
              "Dashboard",
              "Vehicles",
              "Drivers",
              "Trips",
              "Documents",
              "Settings",
            ].map((item) => (

              <li
                key={item}
                style={{
                  padding:
                    "14px 16px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  background:
                    item === "Vehicles"
                      ? "#2563eb"
                      : "transparent",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                {item}
              </li>

            ))}

          </ul>

        </div>

      )}

      {/* MAIN */}

      <div
        style={{
          flex: 1,
          marginLeft:
            sidebarOpen
              ? "240px"
              : "0",
          padding: "22px",
          transition: "0.3s",
          overflowY: "auto",
          height: "100vh",
        }}
      >

        {/* NAVBAR */}

        <div
          style={{
            background: "#071739",
            borderRadius: "18px",
            padding: "16px 22px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >

            <button
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              style={{
                width: "48px",
                height: "48px",
                border: "none",
                borderRadius: "12px",
                background: "white",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ☰
            </button>

            <h1
              style={{
                color: "white",
                fontSize: "22px",
              }}
            >
              TMS Admin
            </h1>

          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >

            <div
              style={{
                background: "white",
                padding:
                  "10px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              📅 23 May 2025
            </div>

            <div
              style={{
                color: "white",
                fontSize: "20px",
              }}
            >
              🔔
            </div>

            <div
              style={{
                background: "white",
                padding:
                  "8px 14px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >

              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems: "center",
                  fontWeight: "700",
                }}
              >
                A
              </div>

              <h3
                style={{
                  fontSize: "14px",
                }}
              >
                Admin
              </h3>

            </div>

          </div>

        </div>

        {/* TITLE */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >

          <div>

            <h1
              style={{
                fontSize: "22px",
                color: "#071739",
              }}
            >
              Vehicles Management
            </h1>

            <p
              style={{
                color: "#64748b",
                marginTop: "4px",
                fontSize: "14px",
              }}
            >
              Manage all transport vehicles
            </p>

          </div>

          <button
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "14px 22px",
              borderRadius: "12px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            + Add Vehicle
          </button>

        </div>

        {/* CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: "18px",
            marginBottom: "24px",
          }}
        >

          <div style={cardGreen}>
            <h2 style={cardTitle}>
              Available Vehicles
            </h2>

            <h1 style={cardValue}>
              {
                availableVehicles
              }
            </h1>
          </div>

          <div style={cardBlue}>
            <h2 style={cardTitle}>
              Booked Vehicles
            </h2>

            <h1 style={cardValue}>
              {bookedVehicles}
            </h1>
          </div>

          <div style={cardOrange}>
            <h2 style={cardTitle}>
              In Maintenance
            </h2>

            <h1 style={cardValue}>
              {
                maintenanceVehicles
              }
            </h1>
          </div>

          <div style={cardWhite}>
            <h2 style={cardTitle}>
              Total Vehicles
            </h2>

            <h1 style={cardValue}>
              {vehicles.length}
            </h1>
          </div>

        </div>

        {/* FORM */}

        {showForm && (

          <div
            style={{
              background: "white",
              padding: "28px",
              borderRadius: "20px",
              marginBottom: "24px",
            }}
          >

            <h2
              style={{
                marginBottom: "20px",
                color: "#071739",
                fontSize: "18px",
              }}
            >
              Add Vehicle
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3,1fr)",
                gap: "18px",
              }}
            >

              <input
                name="number"
                value={
                  formData.number
                }
                onChange={
                  handleChange
                }
                placeholder="Vehicle Number"
                style={inputStyle}
              />

              <input
                name="type"
                value={
                  formData.type
                }
                onChange={
                  handleChange
                }
                placeholder="Vehicle Type"
                style={inputStyle}
              />

              <input
                name="model"
                value={
                  formData.model
                }
                onChange={
                  handleChange
                }
                placeholder="Vehicle Model"
                style={inputStyle}
              />

              <input
                name="driver"
                value={
                  formData.driver
                }
                onChange={
                  handleChange
                }
                placeholder="Driver Name"
                style={inputStyle}
              />

              <input
                type="date"
                name="insurance"
                value={
                  formData.insurance
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              />

              <input
                type="date"
                name="permit"
                value={
                  formData.permit
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              />

              <input
                type="date"
                name="fitness"
                value={
                  formData.fitness
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              />

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                style={inputStyle}
              >

                <option value="">
                  Select Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Booked">
                  Booked
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

              </select>

            </div>

            <button
              onClick={addVehicle}
              style={{
                marginTop: "20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "12px 22px",
                borderRadius: "10px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Save Vehicle
            </button>

          </div>

        )}

        {/* SEARCH + FILTER */}

        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >

          <input
            placeholder="Search by vehicle number or driver..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border:
                "1px solid #d1d5db",
              fontSize: "14px",
              minWidth: "300px",
            }}
          />

          <select
            value={vehicleFilter}
            onChange={(e) =>
              setVehicleFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >

            <option value="All">
              All Types
            </option>

            <option value="49-Seater AC">
              49-Seater AC
            </option>

            <option value="40-Seater">
              40-Seater
            </option>

            <option value="Truck">
              Truck
            </option>

          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >

            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Booked">
              Booked
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

          </select>

        </div>

        {/* TABLE */}

        <div
          style={{
            background: "white",
            borderRadius: "20px",
            overflowX: "auto",
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#f8fafc",
                }}
              >

                {[
                  "Vehicle No.",
                  "Type",
                  "Model",
                  "Driver",
                  "Insurance",
                  "Permit",
                  "Fitness",
                  "Status",
                  "Actions",
                ].map((head) => (

                  <th
                    key={head}
                    style={{
                      padding:
                        "16px",
                      textAlign:
                        "left",
                      color:
                        "#071739",
                      fontSize:
                        "14px",
                    }}
                  >
                    {head}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {filteredVehicles.map(
                (
                  vehicle,
                  index
                ) => (

                  <tr
                    key={index}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >

                    <td style={tableCell}>
                      {vehicle.number}
                    </td>

                    <td style={tableCell}>
                      {vehicle.type}
                    </td>

                    <td style={tableCell}>
                      {vehicle.model}
                    </td>

                    <td style={tableCell}>
                      {vehicle.driver}
                    </td>

                    <td style={tableCell}>
                      {vehicle.insurance}
                    </td>

                    <td style={tableCell}>
                      {vehicle.permit}
                    </td>

                    <td style={tableCell}>
                      {vehicle.fitness}
                    </td>

                    <td style={tableCell}>

                      <span
                        style={{
                          padding:
                            "8px 14px",
                          borderRadius:
                            "20px",
                          background:
                            vehicle.status ===
                            "Active"
                              ? "#dcfce7"
                              : vehicle.status ===
                                "Booked"
                              ? "#dbeafe"
                              : "#fef3c7",
                          color:
                            vehicle.status ===
                            "Active"
                              ? "green"
                              : vehicle.status ===
                                "Booked"
                              ? "#2563eb"
                              : "#d97706",
                          fontSize:
                            "13px",
                        }}
                      >
                        {
                          vehicle.status
                        }
                      </span>

                    </td>

                    <td style={tableCell}>

                      <button
                        onClick={() =>
                          navigate(
                            "/vehicle-details",
                            {
                              state: {
                                vehicle,
                              },
                            }
                          )
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "#2563eb",
                          color:
                            "white",
                          padding:
                            "10px 16px",
                          borderRadius:
                            "10px",
                          cursor:
                            "pointer",
                          fontSize:
                            "13px",
                        }}
                      >
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
};

const filterStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  background: "white",
  minWidth: "170px",
};

const tableCell = {
  padding: "16px",
  fontSize: "14px",
  color: "#374151",
};

const cardTitle = {
  fontSize: "15px",
  fontWeight: "600",
};

const cardValue = {
  fontSize: "34px",
  marginTop: "10px",
};

const cardGreen = {
  background: "#22c55e",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
};

const cardBlue = {
  background: "#2563eb",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
};

const cardOrange = {
  background: "#f59e0b",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
};

const cardWhite = {
  background: "white",
  color: "#071739",
  padding: "22px",
  borderRadius: "18px",
};

export default Vehicles;    