import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../../styles/Driver/DriverLogin.css";

function DriverLogin() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      if (data.role !== "driver") {
        throw new Error(
          "Unauthorized driver access"
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      localStorage.setItem(
        "role",
        data.role
      );

      navigate("/driver-dashboard");

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="driver-container">

      <div className="driver-overlay">

        <div className="driver-left">

          <h1>Driver Portal</h1>

          <p>
            Access trip updates, vehicle details
            and transport assignments securely.
          </p>

        </div>

        <div className="driver-login-card">

          <h2>Driver Login</h2>

          <p className="sub-text">
            Welcome back Driver
          </p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              placeholder="Enter Email Address"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter Password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  paddingRight: "45px",
                }}
              />

              <span
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <div className="register-link">

            <p>
              New Driver?{" "}

              <Link to="/driver-register">
                Register Here
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DriverLogin;