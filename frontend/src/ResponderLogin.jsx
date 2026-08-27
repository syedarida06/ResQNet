import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./ResponderLogin.css";

function ResponderLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    applicationId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const applicationId =
      formData.applicationId.trim().toUpperCase();

    if (!applicationId || !formData.password) {
      setError(
        "Please enter your Application ID and password."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/responders/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed."
        );
      }

      /*
       * IMPORTANT:
       * Store the responder returned by the backend.
       *
       * The responder's preferredTeam is NOT used
       * as the emergency assignment.
       *
       * Admin-selected assignedTeam comes from the
       * emergency record fetched by ResponderDashboard.
       */
      localStorage.setItem(
        "resqnetResponder",
        JSON.stringify(result.data)
      );

      navigate("/responder-dashboard");

    } catch (err) {
      console.error(
        "Responder login error:",
        err
      );

      setError(
        err.message ||
          "Unable to login. Please check your credentials."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="responder-login-page">

      <Navbar />

      <main className="responder-login-main">

        {/* LEFT SIDE */}
        <section className="responder-login-intro">

          <div className="login-eyebrow">
            <span></span>
            RESQNET RESPONDER NETWORK
          </div>

          <h1>
            Welcome back,
            <br />
            <em>responder.</em>
          </h1>

          <p>
            Sign in to access your response assignments,
            team information and active emergency operations.
          </p>

          <div className="login-features">

            <div className="login-feature">

              <span>✓</span>

              <div>
                <strong>
                  View assignments
                </strong>

                <small>
                  Access incidents assigned to your team
                </small>
              </div>

            </div>

            <div className="login-feature">

              <span>✓</span>

              <div>
                <strong>
                  Stay connected
                </strong>

                <small>
                  Receive important response updates
                </small>
              </div>

            </div>

            <div className="login-feature">

              <span>✓</span>

              <div>
                <strong>
                  Update your status
                </strong>

                <small>
                  Let the command centre know your availability
                </small>
              </div>

            </div>

          </div>

        </section>

        {/* LOGIN CARD */}
        <section className="responder-login-card">

          <div className="login-card-header">

            <div className="login-icon">
              🚑
            </div>

            <div>
              <span>
                RESPONDER PORTAL
              </span>

              <h2>
                Sign in
              </h2>
            </div>

          </div>

          <p className="login-description">
            Use your ResQNet responder credentials to
            access the response network.
          </p>

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fff0f0",
                color: "#b42318",
                border: "1px solid #f3b7b7",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* APPLICATION ID */}
            <div className="login-field">

              <label>
                Application ID
              </label>

              <input
                type="text"
                name="applicationId"
                value={formData.applicationId}
                onChange={handleChange}
                placeholder="e.g. RQR-12345"
                required
                autoComplete="username"
              />

              <small>
                Your ResQNet responder application ID
              </small>

            </div>

            {/* PASSWORD */}
            <div className="login-field">

              <label>
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />

            </div>

            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  alert(
                    "Please contact the ResQNet command centre for password recovery."
                  )
                }
              >
                Forgot password?
              </button>

            </div>

            <button
              type="submit"
              className="responder-login-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in to ResQNet"}

              <span>→</span>

            </button>

          </form>

          <div className="new-responder">

            <span>
              Not registered yet?
            </span>

            <Link to="/responder-registration">
              Register as responder →
            </Link>

          </div>

          <div className="login-security">

            <span>🔐</span>

            <div>

              <strong>
                Secure responder access
              </strong>

              <small>
                Your responder credentials are securely
                verified by the ResQNet backend.
              </small>

            </div>

          </div>

        </section>

      </main>

      <footer className="responder-login-footer">

        <strong>
          ResQNet
        </strong>

        <span>
          Connected disaster response.
        </span>

        <span>
          Responder Portal
        </span>

      </footer>

    </div>
  );
}

export default ResponderLogin;