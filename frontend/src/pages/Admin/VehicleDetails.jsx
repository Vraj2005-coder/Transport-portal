import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function VehicleDetails() {

  const navigate = useNavigate();

  const location = useLocation();

  const vehicle =
    location.state?.vehicle || {
      number: "MH12AB1234",
      type: "49-Seater AC",
      model: "Volvo 9600",
      driver: "Rahul Sharma",
      insurance: "2026-07-15",
      permit: "2026-09-10",
      fitness: "2026-08-20",
      status: "Active",
    };

  const [editMode, setEditMode] = useState(false);

  const [vehicleData, setVehicleData] = useState(vehicle);

  const recentTrips = [
    {
      id: "TRP1256",
      from: "Mumbai",
      to: "Pune",
      date: "23 May 2025",
      status: "Completed",
    },
    {
      id: "TRP1255",
      from: "Pune",
      to: "Nashik",
      date: "22 May 2025",
      status: "Completed",
    },
    {
      id: "TRP1254",
      from: "Nashik",
      to: "Mumbai",
      date: "21 May 2025",
      status: "Completed",
    },
  ];

  const documents = [
    "Registration Certificate",
    "Insurance",
    "PUC Certificate",
    "Permit",
    "Fitness Certificate",
  ];

  return (

    <div
      style={{
        background: "#f4f7fb",
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "14px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >

      {/* TOPBAR */}

      <div
        style={{
          background: "#071739",
          borderRadius: "18px",
          padding: "14px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >

          <button
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              border: "none",
              background: "white",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          <h1
            style={{
              color: "white",
              fontSize: "20px",
              margin: 0,
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
              padding: "10px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            📅 23 May 2025
          </div>

          <div
            style={{
              fontSize: "22px",
            }}
          >
            🔔
          </div>

          <div
            style={{
              background: "white",
              padding: "8px 12px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "15px",
              }}
            >
              A
            </div>

            <h3
              style={{
                fontSize: "14px",
                margin: 0,
              }}
            >
              Admin
            </h3>

          </div>

        </div>

      </div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >

        <div>

          <h1
            style={{
              fontSize: "18px",
              color: "#071739",
              marginBottom: "6px",
            }}
          >
            Vehicle Details
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Dashboard &gt; Vehicles &gt; {vehicleData.number}
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >

          <button
            onClick={() => navigate("/vehicles")}
            style={{
              border: "none",
              background: "#ef4444",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              border: "none",
              background: "#2563eb",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {editMode ? "Save Vehicle" : "Edit Vehicle"}
          </button>

        </div>

      </div>

      {/* TOP GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >

        {/* VEHICLE CARD */}

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "18px",
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >

            {/* IMAGE */}

            <div
              style={{
                width: "160px",
                height: "130px",
                borderRadius: "16px",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "56px",
              }}
            >
              🚌
            </div>

            {/* DETAILS */}

            <div
              style={{
                flex: 1,
                minWidth: "260px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >

                {editMode ? (

                  <input
                    value={vehicleData.number}
                    onChange={(e) =>
                      setVehicleData({
                        ...vehicleData,
                        number: e.target.value,
                      })
                    }
                    style={{
                      ...inputStyle,
                      maxWidth: "220px",
                    }}
                  />

                ) : (

                  <h2
                    style={{
                      fontSize: "16px",
                      color: "#071739",
                      margin: 0,
                    }}
                  >
                    {vehicleData.number}
                  </h2>

                )}

                <span
                  style={{
                    background: "#dcfce7",
                    color: "green",
                    padding: "5px 12px",
                    borderRadius: "18px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {vehicleData.status}
                </span>

              </div>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  marginBottom: "18px",
                }}
              >
                {vehicleData.type}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >

                <DetailBox
                  label="Model"
                  value={vehicleData.model}
                  editMode={editMode}
                  onChange={(v) =>
                    setVehicleData({
                      ...vehicleData,
                      model: v,
                    })
                  }
                />

                <DetailBox
                  label="Driver"
                  value={vehicleData.driver}
                  editMode={editMode}
                  onChange={(v) =>
                    setVehicleData({
                      ...vehicleData,
                      driver: v,
                    })
                  }
                />

                <DetailBox
                  label="Insurance Valid Till"
                  value={vehicleData.insurance}
                  editMode={editMode}
                  onChange={(v) =>
                    setVehicleData({
                      ...vehicleData,
                      insurance: v,
                    })
                  }
                />

                <DetailBox
                  label="Permit Valid Till"
                  value={vehicleData.permit}
                  editMode={editMode}
                  onChange={(v) =>
                    setVehicleData({
                      ...vehicleData,
                      permit: v,
                    })
                  }
                />

                <DetailBox
                  label="Fitness Valid Till"
                  value={vehicleData.fitness}
                  editMode={editMode}
                  onChange={(v) =>
                    setVehicleData({
                      ...vehicleData,
                      fitness: v,
                    })
                  }
                />

                <DetailBox
                  label="Fuel Type"
                  value="Diesel"
                />

                <DetailBox
                  label="Manufacturer"
                  value="Volvo"
                />

                <DetailBox
                  label="Year"
                  value="2022"
                />

              </div>

            </div>

          </div>

        </div>

        {/* DRIVER CARD */}

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "18px",
          }}
        >

          <h2
            style={{
              fontSize: "16px",
              color: "#071739",
              marginBottom: "18px",
            }}
          >
            Assigned Driver
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "22px",
            }}
          >

            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              {vehicleData.driver.charAt(0)}
            </div>

            <div>

              <h3
                style={{
                  fontSize: "15px",
                  marginBottom: "4px",
                  color: "#071739",
                }}
              >
                {vehicleData.driver}
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                +91 9876543210
              </p>

            </div>

          </div>

          <DriverItem
            label="License Number"
            value="MH12 2022 123456"
          />

          <DriverItem
            label="Experience"
            value="8 Years"
          />

          <DriverItem
            label="Duty Status"
            value="Available"
          />

        </div>

      </div>

      {/* BOTTOM GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "18px",
          marginBottom: "20px",
        }}
      >

        {/* RECENT TRIPS */}

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "18px",
            overflowX: "auto",
          }}
        >

          <h2
            style={{
              fontSize: "16px",
              color: "#071739",
              marginBottom: "18px",
            }}
          >
            Recent Trips
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "520px",
            }}
          >

            <thead>

              <tr>

                <TableHead>Trip ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>

              </tr>

            </thead>

            <tbody>

              {recentTrips.map((trip) => (

                <tr key={trip.id}>

                  <TableData>{trip.id}</TableData>
                  <TableData>{trip.from}</TableData>
                  <TableData>{trip.to}</TableData>
                  <TableData>{trip.date}</TableData>

                  <TableData>

                    <span
                      style={{
                        background: "#dcfce7",
                        color: "green",
                        padding: "5px 12px",
                        borderRadius: "18px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {trip.status}
                    </span>

                  </TableData>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* DOCUMENTS */}

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "18px",
          }}
        >

          <h2
            style={{
              fontSize: "16px",
              color: "#071739",
              marginBottom: "18px",
            }}
          >
            Documents
          </h2>

          {documents.map((doc, index) => (

            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >

              <p
                style={{
                  fontSize: "13px",
                  color: "#374151",
                }}
              >
                {doc}
              </p>

              <button
                style={{
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                View
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

/* DETAIL BOX */

function DetailBox({
  label,
  value,
  editMode,
  onChange,
}) {

  return (
    <div>

      <p
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "5px",
        }}
      >
        {label}
      </p>

      {editMode ? (

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          style={inputStyle}
        />

      ) : (

        <h4
          style={{
            fontSize: "14px",
            color: "#071739",
            margin: 0,
            fontWeight: "600",
          }}
        >
          {value}
        </h4>

      )}

    </div>
  );
}

/* DRIVER ITEM */

function DriverItem({
  label,
  value,
}) {

  return (
    <div
      style={{
        marginBottom: "20px",
      }}
    >

      <p
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "5px",
        }}
      >
        {label}
      </p>

      <h4
        style={{
          fontSize: "14px",
          color: "#071739",
          margin: 0,
          fontWeight: "600",
        }}
      >
        {value}
      </h4>

    </div>
  );
}

/* TABLE HEAD */

function TableHead({
  children,
}) {

  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px",
        borderBottom: "2px solid #e5e7eb",
        color: "#071739",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {children}
    </th>
  );
}

/* TABLE DATA */

function TableData({
  children,
}) {

  return (
    <td
      style={{
        padding: "10px",
        borderBottom: "1px solid #e5e7eb",
        color: "#374151",
        fontSize: "12px",
      }}
    >
      {children}
    </td>
  );
}

/* INPUT STYLE */

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "13px",
};

export default VehicleDetails;