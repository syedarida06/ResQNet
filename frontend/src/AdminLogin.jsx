import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // DEMO ADMIN CREDENTIALS
    const validAdminId = "RQN-ADM-001";
    const validPassword = "ResQ@123";

    if (adminId === validAdminId && password === validPassword) {
      navigate("/Dashboard");
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
    <div className="admin-login-page">

      {/* LEFT SECTION */}
      <div className="admin-login-left">

        <div className="admin-brand">
          <div className="admin-brand-icon">🚨</div>

          <div>
            <h1>ResQNet</h1>
            <p>Disaster Response Network</p>
          </div>
        </div>

        <div className="admin-left-content">
          <span className="admin-badge">
            🛡️ AUTHORIZED ACCESS
          </span>

          <h2>
            Response starts with
            <span> coordination.</span>
          </h2>

          <p>
            Access the ResQNet Response Centre to monitor emergencies,
            coordinate responders and manage disaster operations in real time.
          </p>

          <div className="admin-features">

            <div className="admin-feature">
              <span>📍</span>
              <div>
                <strong>Live Incident Monitoring</strong>
                <p>Track active emergencies and affected areas.</p>
              </div>
            </div>

            <div className="admin-feature">
              <span>🚑</span>
              <div>
                <strong>Responder Coordination</strong>
                <p>Assign and coordinate available responders.</p>
              </div>
            </div>

            <div className="admin-feature">
              <span>⚡</span>
              <div>
                <strong>Priority-Based Response</strong>
                <p>Identify critical incidents and act faster.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="admin-left-footer">
          <span>●</span> Secure Response Centre
        </div>

      </div>


      {/* RIGHT SECTION */}
      <div className="admin-login-right">

        <div className="admin-login-card">

          <div className="login-icon">
            🛡️
          </div>

          <div className="login-heading">
            <h2>Admin Login</h2>
            <p>
              Sign in to access the ResQNet Response Centre
            </p>
          </div>

          <form onSubmit={handleLogin}>

            {/* ADMIN ID */}
            <div className="form-group">

              <label htmlFor="adminId">
                Admin ID
              </label>

              <div className="input-wrapper">
                <span className="input-icon">🆔</span>

                <input
                  id="adminId"
                  type="text"
                  placeholder="Enter your Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </div>

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

            </div>


            {/* ERROR */}
            {error && (
              <div className="login-error">
                ⚠️ {error}
              </div>
            )}


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="admin-login-button"
            >
              Access Response Centre
              <span>→</span>
            </button>

          </form>


          {/* SECURITY NOTE */}
          <div className="security-note">
            <span>🔐</span>

            <div>
              <strong>Authorized Personnel Only</strong>
              <p>
                Admin accounts are system-provisioned and cannot be
                created through public registration.
              </p>
            </div>
          </div>


          <button
            className="back-home"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;