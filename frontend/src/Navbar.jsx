import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="common-navbar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <Link to="/" className="common-logo">

        <span className="common-logo-icon">
          🚨
        </span>

        <div>
          <h2>ResQNet</h2>
          <p>Disaster Response Network</p>
        </div>

      </Link>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="common-nav-actions">


        {/* =================================================
            HOME
        ================================================= */}

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "nav-home active"
              : "nav-home"
          }
        >
          Home
        </Link>


        {/* =================================================
            GET HELP
        ================================================= */}

        <Link
          to="/citizen"
          className={
            location.pathname === "/citizen"
              ? "nav-help active"
              : "nav-help"
          }
        >
          <span>🚨</span>
          Get Help
        </Link>


        {/* =================================================
            LIVE MAP
        ================================================= */}

        <Link
          to="/livemap"
          className={
            location.pathname === "/livemap"
              ? "nav-livemap active"
              : "nav-livemap"
          }
        >
          <span className="livemap-icon">
            🗺️
          </span>

          <span className="livemap-text">
            <strong>Live Map</strong>
            <small>Track response</small>
          </span>

          <span className="livemap-arrow">
            ↗
          </span>
        </Link>


        {/* =================================================
            JOIN NETWORK
        ================================================= */}

        <Link
          to="/join-network"
          className={
            location.pathname === "/join-network"
              ? "nav-join-network active"
              : "nav-join-network"
          }
        >

          <span className="join-network-icon">
            🤝
          </span>

          <span className="join-network-text">

            <strong>Join Network</strong>

            <small>
              Volunteer or contribute
            </small>

          </span>

          <span className="join-network-arrow">
            →
          </span>

        </Link>


        {/* =================================================
            RESPONSE CENTRE
        ================================================= */}

        <Link
          to="/response-centre"
          className={
            location.pathname === "/response-centre"
              ? "nav-dashboard active"
              : "nav-dashboard"
          }
        >
          Response Centre
          <span>↗</span>
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;