import { useState } from "react";
import "../styles/DriverRegister.css";

function DriverRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    
    setPasswordReqs({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[@$!%*?&#^]/.test(value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character");
      return;
    }

    // Logic for connecting to backend can be added here
  };

  return (

    <div className="register-container">

      {/* LEFT SECTION */}

      <div className="register-left">

        <div className="left-content">

          <h1>Driver Portal</h1>

          <p>
            Register to access trips, vehicle assignments
            and transport updates.
          </p>

        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="register-right">

        <div className="register-card">

          <h2>Create Account</h2>

          <p className="sub-title">
            Driver Registration
          </p>

          <form onSubmit={handleSubmit}>

            {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter Full Name"
                required
                value={formData.name}
                onChange={handleChange}
              />

            </div>

            <div className="input-group">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter Email Address"
                required
                value={formData.email}
                onChange={handleChange}
              />

            </div>

            <div className="input-group">

              <label>Phone Number</label>

              <input
                type="text"
                name="phone"
                placeholder="Enter Phone Number"
                maxLength="10"
                required
                value={formData.phone}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                  handleChange(e);
                }}
              />

            </div>

            <div className="input-group">

              <label>License Number</label>

              <input
                type="text"
                name="license_number"
                placeholder="Enter License Number"
                required
                value={formData.license_number}
                onChange={handleChange}
              />

            </div>

            <div className="input-group">

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                required
                value={formData.password}
                onChange={handlePasswordChange}
              />
              <div className="password-requirements" style={{ fontSize: '13px', marginTop: '8px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ color: passwordReqs.length ? '#16a34a' : '#ef4444' }}>{passwordReqs.length ? '✓' : '○'} At least 8 characters</span>
                <span style={{ color: passwordReqs.upper ? '#16a34a' : '#ef4444' }}>{passwordReqs.upper ? '✓' : '○'} One uppercase letter</span>
                <span style={{ color: passwordReqs.lower ? '#16a34a' : '#ef4444' }}>{passwordReqs.lower ? '✓' : '○'} One lowercase letter</span>
                <span style={{ color: passwordReqs.number ? '#16a34a' : '#ef4444' }}>{passwordReqs.number ? '✓' : '○'} One number</span>
                <span style={{ color: passwordReqs.special ? '#16a34a' : '#ef4444' }}>{passwordReqs.special ? '✓' : '○'} One special character (@$!%*?&#^)</span>
              </div>

            </div>

            <button
              type="submit"
              className="register-btn"
            >
              Register
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default DriverRegister;