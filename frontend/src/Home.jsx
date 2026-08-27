import {
  useEffect,
  useState,
} from "react";

import "./Home.css";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const API_URL = "http://https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app/api";

/* =====================================================
   RESPONSE TEAM COUNT
   Same TEAMS count as Dashboard.jsx
===================================================== */

const RESPONSE_TEAM_COUNT = 10;

/* =====================================================
   INITIAL RESOURCE STOCK
   Same stock as Dashboard.jsx
===================================================== */

const INITIAL_RESOURCES = [
  {
    id: "food",
    quantity: 850,
  },
  {
    id: "water",
    quantity: 1200,
  },
  {
    id: "clothes",
    quantity: 420,
  },
  {
    id: "blankets",
    quantity: 300,
  },
  {
    id: "tents",
    quantity: 85,
  },
  {
    id: "medical",
    quantity: 175,
  },
  {
    id: "medicine",
    quantity: 250,
  },
  {
    id: "baby",
    quantity: 110,
  },
  {
    id: "hygiene",
    quantity: 260,
  },
  {
    id: "flashlights",
    quantity: 180,
  },
  {
    id: "powerbanks",
    quantity: 95,
  },
  {
    id: "rescue",
    quantity: 75,
  },
];

/* =====================================================
   GET RESOURCE STOCK
===================================================== */

function getResourceTotal() {
  try {
    const saved =
      localStorage.getItem(
        "resqnetResourceStock"
      );

    const resources = saved
      ? JSON.parse(saved)
      : INITIAL_RESOURCES;

    return resources.reduce(
      (total, resource) =>
        total +
        Number(resource.quantity || 0),
      0
    );
  } catch {
    return INITIAL_RESOURCES.reduce(
      (total, resource) =>
        total +
        Number(resource.quantity || 0),
      0
    );
  }
}

/* =====================================================
   HOME
===================================================== */

function Home() {

  /* ===================================================
     LIVE RESPONSE DATA
  =================================================== */

  const [activeIncidents, setActiveIncidents] =
    useState(0);

  const [responseTeams] =
    useState(RESPONSE_TEAM_COUNT);

  const [resources, setResources] =
    useState(getResourceTotal);


  /* ===================================================
     FETCH ACTIVE INCIDENTS
     Same logic as Dashboard.jsx
  =================================================== */

  const fetchLiveData = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/emergency`
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          "Failed to fetch emergencies"
        );
      }

      const emergencies =
        result.data || [];

      /* -----------------------------------------------
         SAME ACTIVE STATUS LOGIC AS DASHBOARD
      ------------------------------------------------ */

      const activeStatuses = [
        "Accepted",
        "Started",
        "Arriving",
        "Arrived",
        "En Route",
      ];

      const activeCount =
        emergencies.filter(
          (emergency) =>
            activeStatuses.includes(
              emergency.status
            )
        ).length;

      setActiveIncidents(
        activeCount
      );

    } catch (error) {

      console.error(
        "Home live data error:",
        error
      );

    }

    /* =================================================
       RESOURCE STOCK
       Read the same localStorage used by Dashboard
    ================================================= */

    setResources(
      getResourceTotal()
    );
  };


  /* ===================================================
     INITIAL LOAD + AUTO REFRESH
  =================================================== */

  useEffect(() => {

    fetchLiveData();

    const interval =
      setInterval(
        fetchLiveData,
        3000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);


  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="home">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="pulse"></span>
            SMART DISASTER RESPONSE PLATFORM
          </div>

          <h1>
            When disaster strikes,
            <span> every second matters.</span>
          </h1>

          <p className="hero-description">
            ResQNet connects people in need, rescue teams,
            authorities and community volunteers on one
            intelligent disaster response platform.
          </p>

          <div className="hero-buttons">

            <Link
              to="/citizen"
              className="hero-primary"
            >
              🚨 Report an Emergency
            </Link>

            {/* JOIN NETWORK */}
            <Link
              to="/join-network"
              className="hero-secondary"
            >
              🤝 I Want to Help
            </Link>

          </div>

          <div className="hero-trust">
            <span>✓ Faster response</span>
            <span>✓ Better coordination</span>
            <span>✓ Community powered</span>
          </div>

        </div>


        {/* =====================================================
            HERO VISUAL
        ===================================================== */}

        <div className="hero-visual">

          <div className="response-card">

            <div className="response-header">

              <div>
                <p>LIVE RESPONSE</p>
                <h3>Emergency Network</h3>
              </div>

              <span className="live-dot">
                ● LIVE
              </span>

            </div>


            <div className="mini-map">

              <div className="map-line line-one"></div>
              <div className="map-line line-two"></div>
              <div className="map-line line-three"></div>

              <div className="hero-marker marker-red">
                🚨
              </div>

              <div className="hero-marker marker-blue">
                🚑
              </div>

              <div className="hero-marker marker-green">
                📦
              </div>

              <div className="marker-label label-red">
                Incident
              </div>

              <div className="marker-label label-blue">
                Rescue Team
              </div>

              <div className="marker-label label-green">
                Resources
              </div>

            </div>


            {/* =================================================
                LIVE REAL-TIME STATS
            ================================================= */}

            <div className="response-stats">

              <div>
                <strong>
                  {activeIncidents}
                </strong>

                <span>
                  Active Incidents
                </span>
              </div>

              <div>
                <strong>
                  {responseTeams}
                </strong>

                <span>
                  Response Teams
                </span>
              </div>

              <div>
                <strong>
                  {resources.toLocaleString()}
                </strong>

                <span>
                  Resources
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROBLEM SECTION
      ===================================================== */}

      <section className="problem-section">

        <div className="section-heading">

          <span className="section-tag">
            <h2>THE CHALLENGE</h2>
          </span>

          <h2>
            Disasters create chaos.
            <br />
            <span>ResQNet creates coordination.</span>
          </h2>

          <p>
            During emergencies, information, people and resources
            often exist in separate places. ResQNet brings them
            together into one coordinated response network.
          </p>

        </div>


        <div className="problem-grid">

          <div className="problem-card">

            <div className="problem-icon">
              📢
            </div>

            <h3>
              Scattered Reports
            </h3>

            <p>
              Emergency information can come from multiple
              people and channels.
            </p>

          </div>


          <div className="problem-card">

            <div className="problem-icon">
              ⚠️
            </div>

            <h3>
              Unclear Priorities
            </h3>

            <p>
              Responders need to quickly identify which
              incidents require immediate attention.
            </p>

          </div>


          <div className="problem-card">

            <div className="problem-icon">
              🚑
            </div>

            <h3>
              Limited Resources
            </h3>

            <p>
              Rescue teams and relief resources need to reach
              the areas where they are most needed.
            </p>

          </div>


          <div className="problem-card">

            <div className="problem-icon">
              🗺️
            </div>

            <h3>
              Coordination Gaps
            </h3>

            <p>
              Responders need a common view of incidents,
              locations and available resources.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading center">

          <span className="section-tag">
            <h2>HOW IT WORKS</h2>
          </span>

          <h2>
            From <span>SOS to Rescue.</span>
          </h2>

          <p>
            ResQNet turns emergency information into coordinated
            action through a simple response workflow.
          </p>

        </div>


        <div className="workflow">

          <div className="workflow-step">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              📢
            </div>

            <h3>
              Report
            </h3>

            <p>
              People report an emergency with important
              incident details and location.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🔍
            </div>

            <h3>
              Verify & Group
            </h3>

            <p>
              Similar reports can be identified and grouped
              into a common incident.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              🔥
            </div>

            <h3>
              Prioritize
            </h3>

            <p>
              Incidents are ranked according to urgency
              and impact.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              🤝
            </div>

            <h3>
              Match
            </h3>

            <p>
              Nearby rescue teams and available resources
              are identified.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              05
            </div>

            <div className="step-icon">
              🚑
            </div>

            <h3>
              Rescue
            </h3>

            <p>
              Response teams are dispatched and operations
              are coordinated.
            </p>

          </div>


          <div className="workflow-line"></div>


          <div className="workflow-step">

            <div className="step-number">
              06
            </div>

            <div className="step-icon">
              ✓
            </div>

            <h3>
              Resolve
            </h3>

            <p>
              The incident is tracked until the situation
              is handled.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading center">

          <span className="section-tag">
            <h2>KEY FEATURES</h2>
          </span>

          <h2>
            Everything needed for
            <span> coordinated response.</span>
          </h2>

          <p>
            One platform for emergency reporting, response
            coordination and community relief.
          </p>

        </div>


        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon red-icon">
              🚨
            </div>

            <h3>
              Emergency SOS
            </h3>

            <p>
              Quickly report emergencies and share important
              information with response teams.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon purple-icon">
              🧠
            </div>

            <h3>
              AI Incident Fusion
            </h3>

            <p>
              Identify similar reports and help combine them
              into a clearer incident picture.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon orange-icon">
              🔥
            </div>

            <h3>
              Smart Priority Scoring
            </h3>

            <p>
              Help responders identify critical incidents
              that need immediate attention.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon blue-icon">
              🗺️
            </div>

            <h3>
              Live Disaster Map
            </h3>

            <p>
              Visualize incidents, rescue teams and resources
              geographically.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon green-icon">
              🚑
            </div>

            <h3>
              Rescue Coordination
            </h3>

            <p>
              Assign and track response teams for active
              emergency operations.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon yellow-icon">
              🤝
            </div>

            <h3>
              Volunteer & Relief Hub
            </h3>

            <p>
              Connect volunteers and available resources with
              areas that need assistance.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ROLES
      ===================================================== */}

      <section
        className="roles-section"
        id="roles"
      >

        <div className="section-heading center">

          <span className="section-tag">
            <h2>ONE PLATFORM</h2>
          </span>

          <h2>
            Built for the entire
            <span> response network.</span>
          </h2>

        </div>


        <div className="roles-grid">


          {/* =================================================
              CITIZEN
          ================================================= */}

          <div className="role-card citizen-card">

            <div className="role-icon">
              👤
            </div>

            <span className="role-label">
              CITIZEN
            </span>

            <h3>
              I Need Help
            </h3>

            <p>
              Report an emergency, share your location and
              track the response.
            </p>

            <Link to="/citizen">
              Report Emergency →
            </Link>

          </div>


          {/* =================================================
              AUTHORITY
          ================================================= */}

          <div className="role-card authority-card">

            <div className="role-icon">
              🏛️
            </div>

            <span className="role-label">
              AUTHORITY / RESPONDER
            </span>

            <h3>
              Coordinate Response
            </h3>

            <p>
              Monitor incidents, prioritize emergencies and
              coordinate rescue teams.
            </p>

            <Link to="/dashboard">
              Open Response Center →
            </Link>

          </div>


          {/* =================================================
              VOLUNTEER / COMMUNITY
          ================================================= */}

          <div className="role-card volunteer-card">

            <div className="role-icon">
              🤝
            </div>

            <span className="role-label">
              VOLUNTEER / COMMUNITY
            </span>

            <h3>
              I Want to Help
            </h3>

            <p>
              Offer resources, skills and assistance to
              communities affected by disasters.
            </p>

            <Link to="/join-network">
              Join Relief Network →
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="cta-section">

        <div>

          <span className="section-tag">
            <h2>RESQNET</h2>
          </span>

          <h2>
            Be part of a
            <span> faster response.</span>
          </h2>

          <p>
            Whether you need help or want to provide it,
            ResQNet brings the response network together.
          </p>

        </div>


        <div className="cta-buttons">

          <Link
            to="/citizen"
            className="cta-primary"
          >
            🚨 Report an Emergency
          </Link>

          <Link
            to="/join-network"
            className="cta-secondary"
          >
            🤝 Join the Relief Network
          </Link>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="home-logo">

            <span>
              🚨
            </span>

            <div>

              <h2>
                ResQNet
              </h2>

              <p>
                Intelligent Disaster Response
              </p>

            </div>

          </div>

          <p>
            Connecting people, responders and communities
            when every second matters.
          </p>

        </div>


        <div className="footer-links">

          <div>

            <h4>
              Platform
            </h4>

            <a href="#home">
              Home
            </a>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#features">
              Features
            </a>

          </div>


          <div>

            <h4>
              Response
            </h4>

            <Link to="/citizen">
              Citizen
            </Link>

            <Link to="/dashboard">
              Responders
            </Link>

            <Link to="/join-network">
              Join Network
            </Link>

          </div>

        </div>


        <div className="footer-bottom">
          © 2026 ResQNet. Built for smarter disaster response.
        </div>

      </footer>

    </div>
  );
}

export default Home;