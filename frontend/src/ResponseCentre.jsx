import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./ResponseCentre.css";

function ResponseCentre() {
  return (
    <div className="response-centre-page">

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="response-centre-main">

        <section className="response-hero">

          <div className="response-hero-content">

            <div className="response-eyebrow">
              <span className="eyebrow-dot"></span>
              RESQNET RESPONSE CENTRE
            </div>

            <h1>
              The command point
              <br />
              for <em>emergency response.</em>
            </h1>

            <p>
              Access the tools that connect responders,
              coordinate emergency operations and help
              communities receive faster assistance.
            </p>

            <div className="response-stats">

              <div className="response-stat">
                <strong>24/7</strong>
                <span>Response Network</span>
              </div>

              <div className="stat-divider"></div>

              <div className="response-stat">
                <strong>Live</strong>
                <span>Incident Coordination</span>
              </div>

              <div className="stat-divider"></div>

              <div className="response-stat">
                <strong>AI</strong>
                <span>Decision Support</span>
              </div>

            </div>

          </div>


          {/* =================================================
              HERO VISUAL
          ================================================= */}

          <div className="response-hero-visual">

            <div className="visual-glow"></div>

            <div className="response-orbit orbit-one"></div>
            <div className="response-orbit orbit-two"></div>

            <div className="response-center-icon">
              <span>🚨</span>
            </div>

            <div className="floating-card card-one">
              <span>📍</span>
              <div>
                <strong>Live incidents</strong>
                <small>Being monitored</small>
              </div>
            </div>

            <div className="floating-card card-two">
              <span>🚑</span>
              <div>
                <strong>Response teams</strong>
                <small>Ready to deploy</small>
              </div>
            </div>

            <div className="floating-card card-three">
              <span>🛡️</span>
              <div>
                <strong>Verified network</strong>
                <small>Responder access</small>
              </div>
            </div>

          </div>

        </section>


        {/* =====================================================
            ACCESS SECTION
        ===================================================== */}

        <section className="response-access">

          <div className="access-heading">

            <div>
              <span className="section-label">
                ACCESS PORTAL
              </span>

              <h2>
                Choose your response role
              </h2>
            </div>

            <p>
              Select the portal that matches your role
              within the ResQNet emergency network.
            </p>

          </div>


          <div className="access-grid">

            {/* =================================================
                REGISTER
            ================================================= */}

            <Link
              to="/responder-registration"
              className="access-card responder-card"
            >

              <div className="card-top">

                <div className="access-icon">
                  🛡️
                </div>

                <span className="card-number">
                  01
                </span>

              </div>

              <div className="access-card-content">

                <span className="access-label">
                  NEW RESPONDER
                </span>

                <h3>
                  Register as Responder
                </h3>

                <p>
                  Join the verified ResQNet response
                  network and become eligible for
                  emergency assignments.
                </p>

              </div>

              <div className="access-card-footer">

                <span>
                  Start registration
                </span>

                <strong>
                  →
                </strong>

              </div>

            </Link>


            {/* =================================================
                RESPONDER LOGIN
            ================================================= */}

            <Link
              to="/responder-login"
              className="access-card login-card"
            >

              <div className="card-top">

                <div className="access-icon">
                  🚑
                </div>

                <span className="card-number">
                  02
                </span>

              </div>

              <div className="access-card-content">

                <span className="access-label">
                  VERIFIED RESPONDER
                </span>

                <h3>
                  Responder Login
                </h3>

                <p>
                  Access assigned incidents, team
                  information, emergency tasks and
                  your current response status.
                </p>

              </div>

              <div className="access-card-footer">

                <span>
                  Open responder portal
                </span>

                <strong>
                  →
                </strong>

              </div>

            </Link>


            {/* =================================================
                ADMIN LOGIN
            ================================================= */}

            <Link
              to="/admin-login"
              className="access-card admin-card"
            >

              <div className="card-top">

                <div className="access-icon">
                  🔐
                </div>

                <span className="card-number">
                  03
                </span>

              </div>

              <div className="access-card-content">

                <span className="access-label">
                  AUTHORIZED PERSONNEL
                </span>

                <h3>
                  Admin Login
                </h3>

                <p>
                  Access the ResQNet command centre
                  to coordinate incidents, responders,
                  resources and emergency operations.
                </p>

              </div>

              <div className="access-card-footer">

                <span>
                  Enter command centre
                </span>

                <strong>
                  →
                </strong>

              </div>

            </Link>

          </div>

        </section>


        {/* =====================================================
            BOTTOM INFO
        ===================================================== */}

        <section className="response-bottom">

          <div className="bottom-line"></div>

          <div className="bottom-content">

            <div className="bottom-item">

              <span>✓</span>

              <div>
                <strong>Verified access</strong>
                <small>
                  Authorized users only
                </small>
              </div>

            </div>


            <div className="bottom-item">

              <span>⚡</span>

              <div>
                <strong>Faster coordination</strong>
                <small>
                  Connect response teams quickly
                </small>
              </div>

            </div>


            <div className="bottom-item">

              <span>🤖</span>

              <div>
                <strong>Intelligent operations</strong>
                <small>
                  AI support inside the admin centre
                </small>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="response-footer">

        <div>
          <strong>ResQNet</strong>
          <span>
            Connected disaster response.
          </span>
        </div>

        <span>
          Response Centre
        </span>

      </footer>

    </div>
  );
}

export default ResponseCentre;