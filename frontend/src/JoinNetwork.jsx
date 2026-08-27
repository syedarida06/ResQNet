import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./JoinNetwork.css";

function JoinNetwork() {
  const navigate = useNavigate();

  return (
    <div className="join-network-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="join-hero">

        <div className="join-hero-glow join-glow-one"></div>
        <div className="join-hero-glow join-glow-two"></div>

        <div className="join-hero-content">

          <div className="join-badge">
            <span className="join-badge-dot"></span>
            BE PART OF THE RESPONSE
          </div>

          <h1>
            Every helping hand
            <span> matters.</span>
          </h1>

          <p>
            Whether you are ready to help on the ground or want to support
            disaster relief from anywhere, ResQNet gives you a way to make
            a meaningful difference.
          </p>

        </div>

      </section>


      {/* =====================================================
          CHOOSE HOW TO HELP
      ===================================================== */}

      <section className="join-options-section">

        <div className="join-section-heading">

          <span>CHOOSE HOW YOU WANT TO HELP</span>

          <h2>
            Make an impact,
            <strong> your way.</strong>
          </h2>

          <p>
            You don't have to be at the incident site to contribute.
            Choose the kind of support you can provide.
          </p>

        </div>


        <div className="join-options">


          {/* =================================================
              VOLUNTEER
          ================================================= */}

          <div className="join-option-card volunteer-card">

            <div className="option-card-top">

              <div className="option-icon volunteer-icon">
                🤝
              </div>

              <span className="option-arrow">
                ↗
              </span>

            </div>


            <div className="option-content">

              <span className="option-label">
                ON-GROUND SUPPORT
              </span>

              <h3>
                Become a
                <span> Volunteer</span>
              </h3>

              <p>
                Help directly where it is needed. Support rescue teams,
                shelters, hospitals and affected communities during
                emergencies.
              </p>


              <div className="option-list">

                <div>
                  <span>✓</span>
                  Help at incident sites
                </div>

                <div>
                  <span>✓</span>
                  Support nearby shelters
                </div>

                <div>
                  <span>✓</span>
                  Assist hospitals and relief teams
                </div>

              </div>


              {/* VOLUNTEER BUTTON */}

              <button
                className="option-button volunteer-button"
                onClick={() => navigate("/volunteer")}
              >
                Join as Volunteer
                <span>→</span>
              </button>

            </div>

          </div>


          {/* =================================================
              CONTRIBUTE
          ================================================= */}

          <div className="join-option-card contribute-card">

            <div className="option-card-top">

              <div className="option-icon contribute-icon">
                💙
              </div>

              <span className="option-arrow">
                ↗
              </span>

            </div>


            <div className="option-content">

              <span className="option-label">
                SUPPORT FROM ANYWHERE
              </span>

              <h3>
                Contribute to
                <span> Relief</span>
              </h3>

              <p>
                Can't be there physically? You can still make an impact.
                Support active relief efforts through financial or
                essential-resource contributions.
              </p>


              <div className="option-list">

                <div>
                  <span>✓</span>
                  Support active emergencies
                </div>

                <div>
                  <span>✓</span>
                  Contribute essential supplies
                </div>

                <div>
                  <span>✓</span>
                  Help communities from anywhere
                </div>

              </div>


              {/* CONTRIBUTE BUTTON */}

              <button
                className="option-button contribute-button"
                onClick={() => navigate("/contribute")}
              >
                Contribute to Relief
                <span>→</span>
              </button>

            </div>

          </div>


        </div>

      </section>


      {/* =====================================================
          BOTTOM MESSAGE
      ===================================================== */}

      <section className="join-bottom">

        <div className="join-bottom-icon">
          ♥
        </div>

        <div>

          <h3>
            Different ways. One purpose.
          </h3>

          <p>
            Help communities recover faster when disaster strikes.
          </p>

        </div>

      </section>

    </div>
  );
}

export default JoinNetwork;