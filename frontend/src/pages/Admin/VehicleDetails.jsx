import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar";
import Topbar from "../../components/Admin/Topbar";

import {
  vehiclesAPI,
  driversAPI,
  requireAuth,
} from "../../api";

import "../../styles/Admin/AdminDashboard.css";
import "../../styles/Admin/Vehicles.css";
import "../../styles/Admin/VehicleDetails.css";

function VehicleDetails() {

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================
     VEHICLE DATA FROM TABLE
  ========================================= */

  const passedVehicle =
    location.state?.vehicle || null;

  /* =========================================
     STATES
  ========================================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [editMode, setEditMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [drivers, setDrivers] =
    useState([]);

  const [vehicleData, setVehicleData] =
    useState({

      id: "",
      number: "",
      type: "",
      model: "",

      driver: "",
      driver_id: "",

      insurance: "",
      permit: "",
      fitness: "",
      puc: "",

      status: "Active",

      location: "",

      /* TRUCK */

      truck_size: "",
      body_type: "",
      truck_category: "",

      /* BUS */

      bus_type: "",
      seating_capacity: "",
    });

  /* =========================================
     FETCH VEHICLE + DRIVER DATA
  ========================================= */

  useEffect(() => {

    requireAuth();

    if (passedVehicle?.id) {

      vehiclesAPI
        .get(passedVehicle.id)

        .then((data) => {

          setVehicleData(data);
        })

        .catch((err) => {

          console.log(err);
        });
    }

    driversAPI
      .list()

      .then((data) => {

        setDrivers(data);
      })

      .catch((err) => {

        console.log(err);
      });

  }, []);

  /* =========================================
     SAVE VEHICLE
  ========================================= */

  async function handleSave() {

    /* ENABLE EDIT */

    if (!editMode) {

      setEditMode(true);

      return;
    }

    try {

      setSaving(true);

      const updatedVehicle =
        await vehiclesAPI.update(
          vehicleData.id,
          vehicleData
        );

      setVehicleData(updatedVehicle);

      setEditMode(false);

    } catch (err) {

      console.log(err);

    } finally {

      setSaving(false);
    }
  }

  /* =========================================
     COMMON INPUT FIELD
  ========================================= */

  function renderField(
    label,
    key
  ) {

    return (

      <div className="vd-detail-box">

        <p>{label}</p>

        {
          editMode ? (

            <input
              className="v-input"
              value={
                vehicleData[key] || ""
              }
              onChange={(e) =>
                setVehicleData({

                  ...vehicleData,

                  [key]:
                    e.target.value,
                })
              }
            />

          ) : (

            <h4>
              {
                vehicleData[key] || "—"
              }
            </h4>
          )
        }

      </div>
    );
  }

  /* =========================================
     DRIVER RECORD
  ========================================= */

  const assignedDriver =
    drivers.find(
      (d) =>
        d.id ===
        vehicleData.driver_id
    );

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar
        sidebarOpen={sidebarOpen}
      />

      {/* MAIN CONTENT */}

      <div
        className={`vehicles-content ${
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

        <div className="vd-wrapper">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="vehicles-header">

            <div>

              <h1>
                Vehicle Details
              </h1>

              <p>
                Manage vehicle
                information and
                documents
              </p>

            </div>

            <div className="vd-header-actions">

              <button
                className="btn-danger"
                onClick={() =>
                  navigate("/vehicles")
                }
              >
                Close
              </button>

              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >

                {
                  saving
                    ? "Saving..."
                    : editMode
                    ? "Save Vehicle"
                    : "Edit Vehicle"
                }

              </button>

            </div>

          </div>

          {/* =========================================
              TOP GRID
          ========================================= */}

          <div className="vd-main-grid">

            {/* =========================================
                VEHICLE CARD
            ========================================= */}

            <div className="vd-panel">

              <div className="vd-vehicle-card">

                {/* VEHICLE ICON */}

                <div className="vd-vehicle-icon">

                  🚚

                </div>

                {/* VEHICLE DETAILS */}

                <div style={{ flex: 1 }}>

                  <div className="vd-top-row">

                    {
                      editMode ? (

                        <input
                          className="v-input"
                          value={
                            vehicleData.number
                          }
                          onChange={(e) =>
                            setVehicleData({

                              ...vehicleData,

                              number:
                                e.target
                                  .value,
                            })
                          }
                        />

                      ) : (

                        <h2>
                          {
                            vehicleData.number
                          }
                        </h2>
                      )
                    }

                    <span
                      className={`status-badge ${vehicleData.status?.toLowerCase()}`}
                    >
                      {
                        vehicleData.status
                      }
                    </span>

                  </div>

                  {/* TYPE */}

                  <div
                    style={{
                      marginBottom:
                        "20px",
                    }}
                  >

                    {
                      editMode ? (

                        <select
                          className="v-input"
                          value={
                            vehicleData.type
                          }
                          onChange={(e) =>
                            setVehicleData({

                              ...vehicleData,

                              type:
                                e.target
                                  .value,
                            })
                          }
                        >

                          <option value="Bus">
                            Bus
                          </option>

                          <option value="Truck">
                            Truck
                          </option>

                        </select>

                      ) : (

                        <p className="vd-type-text">

                          {
                            vehicleData.type
                          }

                        </p>
                      )
                    }

                  </div>

                  {/* DETAILS GRID */}

                  <div className="vd-details-grid">

                    {renderField(
                      "Model",
                      "model"
                    )}

                    {/* DRIVER */}

                    <div className="vd-detail-box">

                      <p>
                        Assign Driver
                      </p>

                      {
                        editMode ? (

                          <select
                            className="v-input"
                            value={
                              vehicleData.driver_id
                            }
                            onChange={(e) => {

                              const selected =
                                drivers.find(
                                  (d) =>
                                    d.id ===
                                    e.target
                                      .value
                                );

                              setVehicleData({

                                ...vehicleData,

                                driver_id:
                                  selected?.id ||
                                  "",

                                driver:
                                  selected?.name ||
                                  "",
                              });
                            }}
                          >

                            <option value="">
                              Select Driver
                            </option>

                            {
                              drivers.map(
                                (
                                  driver
                                ) => (

                                  <option
                                    key={
                                      driver.id
                                    }
                                    value={
                                      driver.id
                                    }
                                  >

                                    {
                                      driver.name
                                    }

                                  </option>
                                )
                              )
                            }

                          </select>

                        ) : (

                          <h4>
                            {
                              vehicleData.driver ||
                              "—"
                            }
                          </h4>
                        )
                      }

                    </div>

                    {renderField(
                      "Insurance Valid Till",
                      "insurance"
                    )}

                    {renderField(
                      "Permit Valid Till",
                      "permit"
                    )}

                    {renderField(
                      "Fitness Valid Till",
                      "fitness"
                    )}

                    {renderField(
                      "PUC Valid Till",
                      "puc"
                    )}

                    {/* STATUS */}

                    <div className="vd-detail-box">

                      <p>Status</p>

                      {
                        editMode ? (

                          <select
                            className="v-input"
                            value={
                              vehicleData.status
                            }
                            onChange={(e) =>
                              setVehicleData({

                                ...vehicleData,

                                status:
                                  e.target
                                    .value,
                              })
                            }
                          >

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

                        ) : (

                          <h4>
                            {
                              vehicleData.status
                            }
                          </h4>
                        )
                      }

                    </div>

                    {/* =========================================
                        TRUCK FIELDS
                    ========================================= */}

                    {
                      vehicleData.type
                        ?.toLowerCase() ===
                        "truck" && (

                        <>
                          {renderField(
                            "Truck Size",
                            "truck_size"
                          )}

                          {renderField(
                            "Body Type",
                            "body_type"
                          )}

                          {renderField(
                            "Truck Category",
                            "truck_category"
                          )}
                        </>
                      )
                    }

                    {/* =========================================
                        BUS FIELDS
                    ========================================= */}

                    {
                      vehicleData.type
                        ?.toLowerCase() ===
                        "bus" && (

                        <>
                          {renderField(
                            "Bus Type",
                            "bus_type"
                          )}

                          {renderField(
                            "Seating Capacity",
                            "seating_capacity"
                          )}
                        </>
                      )
                    }

                  </div>

                </div>

              </div>

            </div>

            {/* =========================================
                DRIVER PANEL
            ========================================= */}

            <div className="vd-panel">

              <h2>
                Assigned Driver
              </h2>

              <div className="vd-driver-top">

                <div className="vd-driver-avatar">

                  {
                    assignedDriver?.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "D"
                  }

                </div>

                <div className="vd-driver-info">

                  <h3>
                    {
                      assignedDriver?.name ||
                      "No Driver"
                    }
                  </h3>

                  <p>
                    Assigned to this
                    vehicle
                  </p>

                </div>

              </div>

              <div className="vd-driver-row">

                <span>
                  Phone Number
                </span>

                <span>
                  {
                    assignedDriver?.phone ||
                    "—"
                  }
                </span>

              </div>

              <div className="vd-driver-row">

                <span>
                  License Number
                </span>

                <span>

                  {
                    assignedDriver?.license_number ||
                    "—"
                  }

                </span>

              </div>

              <div className="vd-driver-row">

                <span>
                  Vehicle Type
                </span>

                <span>
                  {
                    vehicleData.type ||
                    "—"
                  }
                </span>

              </div>

              <div className="vd-driver-row">

                <span>
                  Status
                </span>

                <span>

                  <span
                    className={`status-badge ${vehicleData.status?.toLowerCase()}`}
                  >

                    {
                      vehicleData.status
                    }

                  </span>

                </span>

              </div>

            </div>

          </div>

          {/* =========================================
              BOTTOM GRID
          ========================================= */}

          <div className="vd-bottom-grid">

            {/* DOCUMENT TABLE */}

            <div className="vd-panel">

              <h2>
                Document Expiry Dates
              </h2>

              <table className="vd-table">

                <thead>

                  <tr>

                    <th>
                      Document
                    </th>

                    <th>
                      Expiry Date
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    [

                      {
                        name:
                          "Insurance",

                        date:
                          vehicleData.insurance,
                      },

                      {
                        name:
                          "Permit",

                        date:
                          vehicleData.permit,
                      },

                      {
                        name:
                          "Fitness",

                        date:
                          vehicleData.fitness,
                      },

                      {
                        name:
                          "PUC",

                        date:
                          vehicleData.puc,
                      },

                    ].map((doc) => (

                      <tr
                        key={doc.name}
                      >

                        <td>
                          {
                            doc.name
                          }
                        </td>

                        <td>
                          {
                            doc.date ||
                            "—"
                          }
                        </td>

                        <td>

                          <span className="status-badge active">

                            Valid

                          </span>

                        </td>

                      </tr>
                    ))
                  }

                </tbody>

              </table>

            </div>

            {/* VEHICLE INFO */}

            <div className="vd-panel">

              <h2>
                Vehicle Info
              </h2>

              <div className="vd-driver-row">

                <span>
                  Registration No.
                </span>

                <span>
                  {
                    vehicleData.number ||
                    "—"
                  }
                </span>

              </div>

              <div className="vd-driver-row">

                <span>
                  Model
                </span>

                <span>
                  {
                    vehicleData.model ||
                    "—"
                  }
                </span>

              </div>

              {
                vehicleData.type
                  ?.toLowerCase() ===
                  "truck" && (

                  <>
                    <div className="vd-driver-row">

                      <span>
                        Truck Size
                      </span>

                      <span>
                        {
                          vehicleData.truck_size ||
                          "—"
                        }
                      </span>

                    </div>

                    <div className="vd-driver-row">

                      <span>
                        Body Type
                      </span>

                      <span>
                        {
                          vehicleData.body_type ||
                          "—"
                        }
                      </span>

                    </div>

                    <div className="vd-driver-row">

                      <span>
                        Truck Category
                      </span>

                      <span>
                        {
                          vehicleData.truck_category ||
                          "—"
                        }
                      </span>

                    </div>
                  </>
                )
              }

              {
                vehicleData.type
                  ?.toLowerCase() ===
                  "bus" && (

                  <>
                    <div className="vd-driver-row">

                      <span>
                        Bus Type
                      </span>

                      <span>
                        {
                          vehicleData.bus_type ||
                          "—"
                        }
                      </span>

                    </div>

                    <div className="vd-driver-row">

                      <span>
                        Seating Capacity
                      </span>

                      <span>
                        {
                          vehicleData.seating_capacity ||
                          "—"
                        }
                      </span>

                    </div>
                  </>
                )
              }

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VehicleDetails;