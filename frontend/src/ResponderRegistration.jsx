import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./ResponderRegister.css";

const initialFormData = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  idType: "",
  idNumber: "",
  age: "",
  city: "",
  specialization: "",
  experience: "",
  availability: "",
  emergencyContact: "",
  emergencyPhone: "",
  organization: "",
  preferredTeam: "",
};

function ResponderRegistration() {
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [formData, setFormData] = useState(initialFormData);
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

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app/api/responders/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            age: Number(formData.age),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Registration failed."
        );
      }

      setApplicationId(result.data.applicationId);
      setSubmitted(true);
    } catch (err) {
      console.error("Responder registration error:", err);

      setError(
        err.message ||
          "Unable to submit registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setApplicationId("");
    setError("");
    setFormData(initialFormData);
  };

  return (
    <div className="responder-page">
      <Navbar />

      <main className="responder-container">

        {/* HERO */}
        <section className="responder-hero">

          <div className="hero-left">

            <div className="responder-eyebrow">
              <span></span>
              RESQNET RESPONSE NETWORK
            </div>

            <h1>
              Become part of the
              <br />
              <em>response force.</em>
            </h1>

            <p>
              Register as a responder and help coordinate
              faster, safer disaster response operations
              in your area.
            </p>

            <div className="hero-points">

              <div>
                <span>✓</span>
                Verified responder identity
              </div>

              <div>
                <span>✓</span>
                Join specialized response teams
              </div>

              <div>
                <span>✓</span>
                Receive emergency assignments
              </div>

            </div>

          </div>

          <div className="hero-status">

            <div className="status-dot"></div>

            <div>
              <small>NETWORK STATUS</small>
              <strong>Registration open</strong>
            </div>

          </div>

        </section>

        {!submitted ? (

          <section className="registration-layout">

            {/* LEFT INFO */}
            <aside className="registration-info">

              <div className="info-number">
                01
              </div>

              <h2>
                Responder
                <br />
                registration
              </h2>

              <p>
                Tell us about yourself, your experience
                and the type of emergencies you are
                prepared to respond to.
              </p>

              <div className="registration-process">

                <div className="process-item active">
                  <span>01</span>

                  <div>
                    <strong>Registration</strong>
                    <small>Submit your details</small>
                  </div>
                </div>

                <div className="process-line"></div>

                <div className="process-item">
                  <span>02</span>

                  <div>
                    <strong>Verification</strong>
                    <small>Identity review</small>
                  </div>
                </div>

                <div className="process-line"></div>

                <div className="process-item">
                  <span>03</span>

                  <div>
                    <strong>Approval</strong>
                    <small>Responder activation</small>
                  </div>
                </div>

                <div className="process-line"></div>

                <div className="process-item">
                  <span>04</span>

                  <div>
                    <strong>Team assignment</strong>
                    <small>Join a response unit</small>
                  </div>
                </div>

              </div>

              <div className="verification-note">

                <span>🔐</span>

                <div>
                  <strong>Your information is protected</strong>

                  <p>
                    Registration details are used for
                    responder verification and emergency
                    coordination.
                  </p>
                </div>

              </div>

            </aside>

            {/* FORM */}
            <div className="registration-card">

              <div className="form-header">

                <div>
                  <span>APPLICATION FORM</span>

                  <h2>
                    Join the response network
                  </h2>

                  <p>
                    All fields marked with * are required.
                  </p>
                </div>

                <div className="form-step">
                  01 <span>/</span> 01
                </div>

              </div>

              {error && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "#fff0f0",
                    color: "#b42318",
                    border: "1px solid #f3b7b7",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* PERSONAL INFORMATION */}
                <div className="form-section">

                  <div className="form-section-title">
                    <span>01</span>

                    <div>
                      <strong>Personal information</strong>

                      <small>
                        Basic details for responder identification
                      </small>
                    </div>
                  </div>

                  <div className="form-grid">

                    <div className="field full">

                      <label>
                        Full name <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        Phone number <b>*</b>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        Email address <b>*</b>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        Age <b>*</b>
                      </label>

                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                        min="18"
                        max="100"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        City / Operating area <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru"
                        required
                      />

                    </div>

                    <div className="field full">

                      <label>
                        Password <b>*</b>
                      </label>

                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a secure password"
                        minLength="6"
                        required
                      />

                    </div>

                  </div>
                </div>

                {/* IDENTITY */}
                <div className="form-section">

                  <div className="form-section-title">

                    <span>02</span>

                    <div>
                      <strong>
                        Identity verification
                      </strong>

                      <small>
                        Used during responder verification
                      </small>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field">

                      <label>
                        Identification type <b>*</b>
                      </label>

                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select ID type
                        </option>

                        <option value="Aadhaar">
                          Aadhaar
                        </option>

                        <option value="Driving Licence">
                          Driving Licence
                        </option>

                        <option value="Passport">
                          Passport
                        </option>

                        <option value="Voter ID">
                          Voter ID
                        </option>

                        <option value="Organization ID">
                          Organization ID
                        </option>
                      </select>

                    </div>

                    <div className="field">

                      <label>
                        ID number <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        placeholder="Enter identification number"
                        required
                      />

                    </div>

                  </div>

                </div>

                {/* RESPONSE CAPABILITY */}
                <div className="form-section">

                  <div className="form-section-title">

                    <span>03</span>

                    <div>
                      <strong>
                        Response capability
                      </strong>

                      <small>
                        Tell us where you can contribute
                      </small>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field">

                      <label>
                        Primary specialization <b>*</b>
                      </label>

                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select specialization
                        </option>

                        <option value="Flood Rescue">
                          🌊 Flood Rescue
                        </option>

                        <option value="Fire & Rescue">
                          🔥 Fire & Rescue
                        </option>

                        <option value="Medical Response">
                          🏥 Medical Response
                        </option>

                        <option value="Search & Rescue">
                          🔎 Search & Rescue
                        </option>

                        <option value="Landslide Rescue">
                          ⛰️ Landslide Rescue
                        </option>

                        <option value="Emergency Logistics">
                          📦 Emergency Logistics
                        </option>

                        <option value="General Disaster Response">
                          🚨 General Disaster Response
                        </option>

                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Experience <b>*</b>
                      </label>

                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select experience
                        </option>

                        <option value="No experience">
                          No formal experience
                        </option>

                        <option value="Less than 1 year">
                          Less than 1 year
                        </option>

                        <option value="1-3 years">
                          1–3 years
                        </option>

                        <option value="3-5 years">
                          3–5 years
                        </option>

                        <option value="5+ years">
                          5+ years
                        </option>

                      </select>

                    </div>

                    <div className="field full">

                      <label>
                        Current organization / affiliation
                      </label>

                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="NGO, hospital, fire service, college, organization, etc."
                      />

                    </div>

                    {/* EXACT ADMIN DASHBOARD TEAM NAMES */}
                    <div className="field">

                      <label>
                        Preferred response team <b>*</b>
                      </label>

                      <select
                        name="preferredTeam"
                        value={formData.preferredTeam}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select response team
                        </option>

                        <option value="Rescue Unit Alpha">
                          🚑 Rescue Unit Alpha
                        </option>

                        <option value="Rapid Fire Unit">
                          🚒 Rapid Fire Unit
                        </option>

                        <option value="Mountain Rescue Unit">
                          🧗 Mountain Rescue Unit
                        </option>

                        <option value="Urban Search & Rescue">
                          🚙 Urban Search & Rescue
                        </option>

                        <option value="Coastal Rescue Unit">
                          🚤 Coastal Rescue Unit
                        </option>

                        <option value="Water Rescue Team">
                          🛶 Water Rescue Team
                        </option>

                        <option value="Medical Response Team">
                          🩺 Medical Response Team
                        </option>

                        <option value="Hazard Response Team">
                          ☣️ Hazard Response Team
                        </option>

                        <option value="Disaster Relief Unit">
                          🏕️ Disaster Relief Unit
                        </option>

                        <option value="Emergency Response Unit">
                          🚨 Emergency Response Unit
                        </option>

                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Emergency availability <b>*</b>
                      </label>

                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select availability
                        </option>

                        <option value="24/7">
                          24 / 7 emergency availability
                        </option>

                        <option value="Day">
                          Daytime availability
                        </option>

                        <option value="Night">
                          Night availability
                        </option>

                        <option value="Weekends">
                          Weekends only
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                {/* EMERGENCY CONTACT */}
                <div className="form-section">

                  <div className="form-section-title">

                    <span>04</span>

                    <div>
                      <strong>
                        Emergency contact
                      </strong>

                      <small>
                        Someone we can contact if necessary
                      </small>
                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field">

                      <label>
                        Contact name <b>*</b>
                      </label>

                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Emergency contact name"
                        required
                      />

                    </div>

                    <div className="field">

                      <label>
                        Contact phone <b>*</b>
                      </label>

                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />

                    </div>

                  </div>

                </div>

                {/* SUBMIT */}
                <div className="form-submit-area">

                  <div className="submit-note">

                    <span>✦</span>

                    <p>
                      By submitting, you agree to undergo
                      ResQNet's responder verification process.
                    </p>

                  </div>

                  <button
                    type="submit"
                    className="submit-responder"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit registration"}

                    <span>→</span>
                  </button>

                </div>

              </form>

            </div>

          </section>

        ) : (

          /* SUCCESS */
          <section className="registration-success">

            <div className="success-icon">
              ✓
            </div>

            <span className="success-label">
              REGISTRATION RECEIVED
            </span>

            <h2>
              You're one step closer
              <br />
              to joining the <em>response network.</em>
            </h2>

            <p>
              Your responder application has been
              successfully submitted. Your account is now
              ready for responder portal access.
            </p>

            <div className="application-card">

              <small>
                YOUR APPLICATION ID
              </small>

              <strong>
                {applicationId}
              </strong>

              <span>
                Keep this ID safe. Use it with your password
                to access the responder portal.
              </span>

            </div>

            <div className="success-status">

              <div className="status-step active">

                <span>✓</span>

                <div>
                  <strong>
                    Application submitted
                  </strong>

                  <small>
                    Completed
                  </small>
                </div>

              </div>

              <div className="status-line"></div>

              <div className="status-step active">

                <span>✓</span>

                <div>
                  <strong>
                    Account activated
                  </strong>

                  <small>
                    Ready for login
                  </small>
                </div>

              </div>

              <div className="status-line"></div>

              <div className="status-step">

                <span>03</span>

                <div>
                  <strong>
                    Emergency assignments
                  </strong>

                  <small>
                    Available after login
                  </small>
                </div>

              </div>

            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >

              <button
                className="register-another"
                onClick={() =>
                  navigate("/responder-login")
                }
              >
                Go to responder login →
              </button>

              <button
                className="register-another"
                onClick={handleReset}
              >
                Register another responder
              </button>

            </div>

          </section>

        )}

      </main>

      <footer className="responder-footer">

        <div>
          <strong>ResQNet</strong>

          <span>
            Connected disaster response.
          </span>
        </div>

        <span>
          Responder registration portal
        </span>

      </footer>

    </div>
  );
}

export default ResponderRegistration;