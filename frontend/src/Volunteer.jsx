import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Volunteer.css";

function Volunteer() {
  const navigate = useNavigate();

  /* =========================================================
     VOLUNTEER AUTHENTICATION
  ========================================================= */

  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("resqnetVolunteerLoggedIn") === "true"
  );

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  /* =========================================================
     DASHBOARD STATES
     IMPORTANT: ALL HOOKS ARE BEFORE CONDITIONAL RETURN
  ========================================================= */

  const [activeSection, setActiveSection] =
    useState("overview");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [selectedVolunteer, setSelectedVolunteer] =
    useState(null);

  const [toast, setToast] = useState("");

  const [showSafety, setShowSafety] =
    useState(false);

  /* =========================================================
     REAL EMERGENCY REQUEST STATES
  ========================================================= */

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] =
    useState(false);

  /* =========================================================
     AUTH FORM CHANGE
  ========================================================= */

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });

    setAuthError("");
    setAuthSuccess("");
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (
      !authForm.name.trim() ||
      !authForm.email.trim() ||
      !authForm.phone.trim() ||
      !authForm.password ||
      !authForm.confirmPassword
    ) {
      setAuthError(
        "Please fill in all the required fields."
      );
      return;
    }

    if (authForm.password.length < 6) {
      setAuthError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      authForm.password !==
      authForm.confirmPassword
    ) {
      setAuthError("Passwords do not match.");
      return;
    }

    const volunteerAccount = {
      name: authForm.name.trim(),
      email: authForm.email.trim().toLowerCase(),
      phone: authForm.phone.trim(),
      password: authForm.password,
    };

    localStorage.setItem(
      "resqnetVolunteerAccount",
      JSON.stringify(volunteerAccount)
    );

    /*
      IMPORTANT:
      Do NOT automatically authenticate after registration.
      Send the volunteer back to the login screen.
    */

    localStorage.removeItem(
      "resqnetVolunteerLoggedIn"
    );

    setIsAuthenticated(false);

    setAuthMode("login");

    setAuthForm({
      name: "",
      email: volunteerAccount.email,
      phone: "",
      password: "",
      confirmPassword: "",
    });

    setAuthSuccess(
      "Registration successful! Please log in with your new account."
    );
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthSuccess("");

    if (
      !authForm.email.trim() ||
      !authForm.password
    ) {
      setAuthError(
        "Please enter your email and password."
      );
      return;
    }

    const savedAccount =
      localStorage.getItem(
        "resqnetVolunteerAccount"
      );

    if (!savedAccount) {
      setAuthError(
        "No volunteer account found. Please register first."
      );
      return;
    }

    let account;

    try {
      account = JSON.parse(savedAccount);
    } catch (error) {
      setAuthError(
        "Unable to read your volunteer account. Please register again."
      );
      return;
    }

    if (
      account.email !==
        authForm.email.trim().toLowerCase() ||
      account.password !== authForm.password
    ) {
      setAuthError(
        "Invalid email or password."
      );
      return;
    }

    localStorage.setItem(
      "resqnetVolunteerLoggedIn",
      "true"
    );

    localStorage.setItem(
      "resqnetVolunteerName",
      account.name
    );

    setIsAuthenticated(true);

    setAuthSuccess(
      `Welcome back, ${account.name}!`
    );
  };

  /* =========================================================
     REAL CITIZEN EMERGENCY REQUESTS
  ========================================================= */

  const fetchEmergencyRequests = async () => {
    try {
      setLoadingRequests(true);

      const response = await fetch(
        "http://https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app/api/emergency/pending"
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        const formattedRequests =
          result.data.map((emergency) => ({
            id:
              emergency.requestId ||
              `RQ-${String(emergency._id)
                .slice(-4)
                .toUpperCase()}`,

            type:
              emergency.emergencyType ||
              "Emergency",

            location:
              emergency.location ||
              "Location unavailable",

            distance:
              emergency.distance ||
              "Nearby",

            time:
              emergency.createdAt
                ? getTimeAgo(
                    emergency.createdAt
                  )
                : "Just now",

            priority:
              emergency.priority ||
              (emergency.isSOS
                ? "critical"
                : "high"),

            people:
              emergency.peopleCount ||
              emergency.people ||
              1,

            description:
              emergency.description ||
              "Emergency assistance requested.",

            skills:
              getRequiredSkills(
                emergency.emergencyType
              ),

            icon:
              getEmergencyIcon(
                emergency.emergencyType
              ),

            originalData:
              emergency,
          }));

        setRequests(formattedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch emergency requests:",
        error
      );

      /*
        Don't destroy currently displayed requests
        if a temporary network error happens.
      */
    } finally {
      setLoadingRequests(false);
    }
  };

  /* =========================================================
     TIME FORMATTER
  ========================================================= */

  const getTimeAgo = (date) => {
    const created =
      new Date(date).getTime();

    const now =
      Date.now();

    const difference =
      Math.max(
        0,
        now - created
      );

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes === 1) {
      return "1 min ago";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours === 1) {
      return "1 hour ago";
    }

    return `${hours} hours ago`;
  };

  /* =========================================================
     EMERGENCY ICON
  ========================================================= */

  const getEmergencyIcon = (type) => {
    const emergencyType =
      String(type || "")
        .toLowerCase();

    if (
      emergencyType.includes("flood")
    ) {
      return "🌊";
    }

    if (
      emergencyType.includes("fire")
    ) {
      return "🔥";
    }

    if (
      emergencyType.includes("earthquake")
    ) {
      return "🏚️";
    }

    if (
      emergencyType.includes("landslide")
    ) {
      return "⛰️";
    }

    if (
      emergencyType.includes("cyclone")
    ) {
      return "🌪️";
    }

    if (
      emergencyType.includes("medical")
    ) {
      return "🚑";
    }

    return "🚨";
  };

  /* =========================================================
     REQUIRED SKILLS
  ========================================================= */

  const getRequiredSkills = (type) => {
    const emergencyType =
      String(type || "")
        .toLowerCase();

    if (
      emergencyType.includes("flood")
    ) {
      return [
        "Water Rescue",
        "First Aid",
      ];
    }

    if (
      emergencyType.includes("fire")
    ) {
      return [
        "Fire Safety",
        "Evacuation",
      ];
    }

    if (
      emergencyType.includes("medical")
    ) {
      return [
        "First Aid",
        "Medical",
      ];
    }

    if (
      emergencyType.includes("landslide")
    ) {
      return [
        "Navigation",
        "Logistics",
      ];
    }

    if (
      emergencyType.includes("earthquake")
    ) {
      return [
        "Search & Rescue",
        "First Aid",
      ];
    }

    if (
      emergencyType.includes("cyclone")
    ) {
      return [
        "Rescue",
        "Evacuation",
      ];
    }

    return [
      "Emergency Response",
      "First Aid",
    ];
  };

  /* =========================================================
     LOAD REAL REQUESTS
  ========================================================= */

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    /*
      Load immediately after volunteer login.
    */
    fetchEmergencyRequests();

    /*
      Check for new citizen requests every 5 seconds.
    */
    const interval =
      setInterval(() => {
        fetchEmergencyRequests();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  /* =========================================================
     DASHBOARD DATA
  ========================================================= */

  const volunteers = [
    {
      name: "Arjun Rao",
      role: "Medical Volunteer",
      location: "2.1 km away",
      tasks: 24,
      rating: "4.9",
      skills: ["First Aid", "CPR"],
      avatar: "AR",
    },
    {
      name: "Meera S.",
      role: "Rescue Volunteer",
      location: "3.4 km away",
      tasks: 31,
      rating: "4.8",
      skills: ["Water Rescue", "Navigation"],
      avatar: "MS",
    },
    {
      name: "Rahul K.",
      role: "Logistics Support",
      location: "4.7 km away",
      tasks: 18,
      rating: "4.7",
      skills: ["Transport", "Supplies"],
      avatar: "RK",
    },
    {
      name: "Ananya P.",
      role: "Emergency Responder",
      location: "5.2 km away",
      tasks: 42,
      rating: "5.0",
      skills: ["First Aid", "Evacuation"],
      avatar: "AP",
    },
  ];

  const operations = [
    {
      title: "Flood evacuation — Ward 12",
      status: "ACTIVE",
      time: "Started 14 min ago",
      team: "Team Alpha",
      icon: "🌊",
    },
    {
      title: "Medical support — NH 63",
      status: "ACTIVE",
      time: "Started 28 min ago",
      team: "Team Delta",
      icon: "🚑",
    },
    {
      title: "Relief material delivery",
      status: "COMPLETED",
      time: "Completed today",
      team: "Team Bravo",
      icon: "📦",
    },
  ];

  const stats = [
    {
      icon: "🤝",
      value: "128",
      label: "People Assisted",
      change: "+18 this month",
    },
    {
      icon: "🚨",
      value: "36",
      label: "Rescues Completed",
      change: "+7 this month",
    },
    {
      icon: "⏱️",
      value: "11 min",
      label: "Avg. Response",
      change: "8% faster",
    },
    {
      icon: "⭐",
      value: "4.9",
      label: "Volunteer Rating",
      change: "Top 5%",
    },
  ];

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  /* =========================================================
     ACCEPT REQUEST
  ========================================================= */

  const handleAccept = (request) => {
    setSelectedRequest(null);

    showToast(
      `Request ${request.id} accepted successfully`
    );
  };

  /* =========================================================
     INVITE VOLUNTEER
  ========================================================= */

  const handleInvite = (volunteer) => {
    showToast(
      `${volunteer.name} has been invited to join your team`
    );
  };

  /* =========================================================
     SCROLL
  ========================================================= */

  const scrollToSection = (section) => {
    setActiveSection(section);

    setTimeout(() => {
      const element =
        document.getElementById(section);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  };

  /* =========================================================
     LOGIN / REGISTER SCREEN
  ========================================================= */

  if (!isAuthenticated) {
    return (
      <div className="volunteer-page">

        <Navbar />

        <div className="volunteer-auth-page">

          {/* LEFT SIDE */}

          <div className="volunteer-auth-left">

            <div className="volunteer-auth-brand">

              <div className="auth-brand-icon">
                R
              </div>

              <div>
                <strong>
                  ResQNet
                </strong>

                <span>
                  Volunteer Network
                </span>
              </div>

            </div>

            <div className="volunteer-auth-content">

              <span className="auth-eyebrow">
                🤝 JOIN THE RESPONSE NETWORK
              </span>

              <h1>
                Be there when
                <span>
                  {" "}help is needed most.
                </span>
              </h1>

              <p>
                Join ResQNet's volunteer network and help
                communities respond faster during floods,
                fires, medical emergencies and other disasters.
              </p>

              <div className="auth-benefits">

                <div className="auth-benefit">

                  <div>
                    🚨
                  </div>

                  <div>

                    <strong>
                      Respond to real emergencies
                    </strong>

                    <span>
                      Receive nearby emergency requests
                      through the ResQNet network.
                    </span>

                  </div>

                </div>

                <div className="auth-benefit">

                  <div>
                    📍
                  </div>

                  <div>

                    <strong>
                      Coordinate with response teams
                    </strong>

                    <span>
                      Work together with verified responders
                      and emergency teams.
                    </span>

                  </div>

                </div>

                <div className="auth-benefit">

                  <div>
                    🏅
                  </div>

                  <div>

                    <strong>
                      Build your response profile
                    </strong>

                    <span>
                      Track your contributions and community
                      impact.
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="auth-network-footer">

              <span className="auth-live-dot"></span>

              ResQNet Network Operational

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="volunteer-auth-right">

            <div className="auth-card">

              <div className="auth-card-header">

                <div className="auth-shield">
                  🛡️
                </div>

                <span className="auth-card-kicker">
                  VOLUNTEER PORTAL
                </span>

                <h2>
                  {authMode === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>

                <p>
                  {authMode === "login"
                    ? "Sign in to access your ResQNet volunteer dashboard."
                    : "Register to become part of the ResQNet response network."}
                </p>

              </div>

              {/* TABS */}

              <div className="auth-tabs">

                <button
                  className={
                    authMode === "login"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  type="button"
                >
                  Login
                </button>

                <button
                  className={
                    authMode === "register"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  type="button"
                >
                  Register
                </button>

              </div>

              {/* ERROR */}

              {authError && (
                <div className="auth-message auth-error">

                  <span>
                    !
                  </span>

                  {authError}

                </div>
              )}

              {/* SUCCESS */}

              {authSuccess && (
                <div className="auth-message auth-success">

                  <span>
                    ✓
                  </span>

                  {authSuccess}

                </div>
              )}

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              {authMode === "login" ? (

                <form
                  className="auth-form"
                  onSubmit={handleLogin}
                >

                  <div className="auth-field">

                    <label>
                      Email address
                    </label>

                    <div className="auth-input-wrap">

                      <span>
                        ✉
                      </span>

                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={authForm.email}
                        onChange={handleAuthChange}
                      />

                    </div>

                  </div>

                  <div className="auth-field">

                    <label>
                      Password
                    </label>

                    <div className="auth-input-wrap">

                      <span>
                        🔒
                      </span>

                      <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={authForm.password}
                        onChange={handleAuthChange}
                      />

                    </div>

                  </div>

                  <div className="auth-form-options">

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
                      className="forgot-password"
                      onClick={() =>
                        setAuthError(
                          "Please contact the ResQNet command centre to reset your password."
                        )
                      }
                    >
                      Forgot password?
                    </button>

                  </div>

                  <button
                    type="submit"
                    className="auth-submit"
                  >
                    Sign in to Volunteer Portal

                    <span>
                      →
                    </span>

                  </button>

                </form>

              ) : (

                /* =================================================
                   REGISTER FORM
                ================================================= */

                <form
                  className="auth-form"
                  onSubmit={handleRegister}
                >

                  <div className="auth-two-columns">

                    <div className="auth-field">

                      <label>
                        Full name
                      </label>

                      <div className="auth-input-wrap">

                        <span>
                          👤
                        </span>

                        <input
                          type="text"
                          name="name"
                          placeholder="Your full name"
                          value={authForm.name}
                          onChange={handleAuthChange}
                        />

                      </div>

                    </div>

                    <div className="auth-field">

                      <label>
                        Phone number
                      </label>

                      <div className="auth-input-wrap">

                        <span>
                          📱
                        </span>

                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone number"
                          value={authForm.phone}
                          onChange={handleAuthChange}
                        />

                      </div>

                    </div>

                  </div>

                  <div className="auth-field">

                    <label>
                      Email address
                    </label>

                    <div className="auth-input-wrap">

                      <span>
                        ✉
                      </span>

                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={authForm.email}
                        onChange={handleAuthChange}
                      />

                    </div>

                  </div>

                  <div className="auth-two-columns">

                    <div className="auth-field">

                      <label>
                        Password
                      </label>

                      <div className="auth-input-wrap">

                        <span>
                          🔒
                        </span>

                        <input
                          type="password"
                          name="password"
                          placeholder="Minimum 6 characters"
                          value={authForm.password}
                          onChange={handleAuthChange}
                        />

                      </div>

                    </div>

                    <div className="auth-field">

                      <label>
                        Confirm password
                      </label>

                      <div className="auth-input-wrap">

                        <span>
                          🔐
                        </span>

                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Repeat password"
                          value={
                            authForm.confirmPassword
                          }
                          onChange={handleAuthChange}
                        />

                      </div>

                    </div>

                  </div>

                  <label className="terms-option">

                    <input
                      type="checkbox"
                      required
                    />

                    <span>
                      I agree to follow ResQNet safety
                      guidelines and volunteer responsibly.
                    </span>

                  </label>

                  <button
                    type="submit"
                    className="auth-submit"
                  >
                    Create Volunteer Account

                    <span>
                      →
                    </span>

                  </button>

                </form>

              )}

              <div className="auth-divider">

                <span>
                  SECURE COMMUNITY NETWORK
                </span>

              </div>

              <div className="auth-security">

                <span>
                  🛡️
                </span>

                <div>

                  <strong>
                    Your contribution matters
                  </strong>

                  <small>
                    ResQNet connects volunteers with
                    coordinated emergency response.
                  </small>

                </div>

              </div>

              <button
                className="auth-back-home"
                onClick={() =>
                  navigate("/")
                }
              >
                ← Back to ResQNet Home
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     VOLUNTEER DASHBOARD
  ========================================================= */

  return (
    <div className="volunteer-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="volunteer-topbar">

        <div className="topbar-inner">

          <div className="network-status">

            <span className="status-pulse"></span>

            ResQNet Network

            <span className="status-text">
              Operational
            </span>

          </div>

          <div className="topbar-right">

            <span>
              🛡️ Verified Responder Network
            </span>

            <button
              onClick={() => {
                localStorage.removeItem(
                  "resqnetVolunteerLoggedIn"
                );

                setIsAuthenticated(false);

                setAuthMode("login");

                setAuthError("");

                setAuthSuccess("");

                setAuthForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
            >
              Logout
            </button>

            <button
              onClick={() =>
                navigate("/")
              }
            >
              ← Back to Home
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="volunteer-main">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="volunteer-hero"
          id="overview"
        >

          <div className="hero-copy">

            <div className="hero-eyebrow">

              <span className="eyebrow-dot"></span>

              RESPONDER COMMAND CENTRE

            </div>

            <h1>
              Make every
              <span>
                {" "}response count.
              </span>
            </h1>

            <p>
              Coordinate with nearby responders, respond to
              emergency requests and help communities recover
              faster.
            </p>

            <div className="hero-actions">

              <button
                className="hero-primary"
                onClick={() =>
                  scrollToSection("requests")
                }
              >
                View Emergency Requests

                <span>
                  →
                </span>

              </button>

              <button
                className="hero-secondary"
                onClick={() =>
                  scrollToSection("operations")
                }
              >
                View Operations
              </button>

            </div>

            <div className="hero-trust">

              <div className="trust-avatars">

                <span>
                  AR
                </span>

                <span>
                  MS
                </span>

                <span>
                  RK
                </span>

                <span>
                  +12
                </span>

              </div>

              <div>

                <strong>
                  16 responders online
                </strong>

                <small>
                  Coordinating across the network
                </small>

              </div>

            </div>

          </div>

          <div className="hero-visual">

            <div className="hero-map">

              <div className="map-grid"></div>

              <div className="map-route route-one"></div>

              <div className="map-route route-two"></div>

              <div className="map-route route-three"></div>

              <div className="map-zone zone-one"></div>

              <div className="map-zone zone-two"></div>

              <button className="map-marker marker-red">
                🚨
              </button>

              <button className="map-marker marker-green">
                🧑‍🚒
              </button>

              <button className="map-marker marker-blue">
                🚑
              </button>

              <button className="map-marker marker-orange">
                📦
              </button>

              <div className="map-label label-rescue">
                Emergency
              </div>

              <div className="map-label label-team">
                Team Alpha
              </div>

              <div className="map-live">

                <span></span>

                LIVE NETWORK

              </div>

              <div className="map-bottom-card">

                <div className="mini-icon">
                  🚨
                </div>

                <div>

                  <strong>
                    {requests.length} active incidents
                  </strong>

                  <small>
                    Nearby response required
                  </small>

                </div>

                <span className="arrow">
                  →
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="impact-grid">

          {stats.map((stat, index) => (

            <div
              className="impact-card"
              key={index}
            >

              <div className="impact-top">

                <div className="impact-icon">
                  {stat.icon}
                </div>

                <span className="impact-change">
                  {stat.change}
                </span>

              </div>

              <strong>
                {stat.value}
              </strong>

              <span>
                {stat.label}
              </span>

            </div>

          ))}

        </section>

        {/* =====================================================
            REQUEST SECTION
        ===================================================== */}

        <section
          className="section-block"
          id="requests"
        >

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                NEEDS YOUR ATTENTION
              </span>

              <h2>
                Emergency requests
              </h2>

              <p>
                Nearby incidents that currently need
                responder support.
              </p>

            </div>

            <button
              className="outline-button"
              onClick={() => {
                fetchEmergencyRequests();

                showToast(
                  "Emergency requests refreshed"
                );
              }}
            >
              ↻ Refresh
            </button>

          </div>

          <div className="request-layout">

            <div className="request-list">

              {/* =================================================
                  LOADING
              ================================================= */}

              {loadingRequests &&
                requests.length === 0 && (
                  <div className="request-card">

                    <div className="request-main">

                      <h3>
                        Loading emergency requests...
                      </h3>

                      <p className="request-description">
                        Checking the ResQNet network for
                        active citizen requests.
                      </p>

                    </div>

                  </div>
                )}

              {/* =================================================
                  EMPTY
              ================================================= */}

              {!loadingRequests &&
                requests.length === 0 && (
                  <div className="request-card">

                    <div className="request-main">

                      <h3>
                        No pending emergency requests
                      </h3>

                      <p className="request-description">
                        New citizen emergency requests
                        will appear here automatically.
                      </p>

                    </div>

                  </div>
                )}

              {/* =================================================
                  REAL REQUESTS
              ================================================= */}

              {requests.map((request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

                  <div
                    className={`priority-bar ${request.priority}`}
                  ></div>

                  <div className="request-icon">
                    {request.icon}
                  </div>

                  <div className="request-main">

                    <div className="request-head">

                      <div>

                        <div className="request-id">
                          {request.id}
                        </div>

                        <h3>
                          {request.type}
                        </h3>

                      </div>

                      <span
                        className={`priority-badge ${request.priority}`}
                      >
                        {request.priority}
                      </span>

                    </div>

                    <p className="request-description">
                      {request.description}
                    </p>

                    <div className="request-details">

                      <span>
                        📍 {request.location}
                      </span>

                      <span>
                        👥 {request.people} people
                      </span>

                      <span>
                        ◷ {request.time}
                      </span>

                    </div>

                    <div className="request-footer">

                      <div className="skill-tags">

                        {request.skills.map(
                          (skill) => (
                            <span key={skill}>
                              {skill}
                            </span>
                          )
                        )}

                      </div>

                      <button
                        className="request-view"
                        onClick={() =>
                          setSelectedRequest(
                            request
                          )
                        }
                      >
                        View request →
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            <aside className="request-side-panel">

              <div className="side-card urgent-card">

                <div className="side-card-icon">
                  ⚡
                </div>

                <span className="side-kicker">
                  RESPONSE PRIORITY
                </span>

                <h3>
                  Critical incidents need
                  <span>
                    {" "}immediate action.
                  </span>
                </h3>

                <p>
                  ResQNet prioritizes requests based on
                  severity, distance, people affected and
                  available responder skills.
                </p>

                <div className="priority-meter">

                  <div className="meter-label">

                    <span>
                      Network urgency
                    </span>

                    <strong>
                      High
                    </strong>

                  </div>

                  <div className="meter">
                    <span></span>
                  </div>

                </div>

              </div>

              <div className="side-card quick-card">

                <div className="side-card-title">

                  <strong>
                    Quick actions
                  </strong>

                </div>

                <button
                  onClick={() =>
                    showToast(
                      "Your availability is currently set to Available"
                    )
                  }
                >
                  <span>
                    🟢
                  </span>

                  Update availability

                  <b>
                    →
                  </b>

                </button>

                <button
                  onClick={() =>
                    showToast(
                      "Location sharing is active"
                    )
                  }
                >
                  <span>
                    📍
                  </span>

                  Share live location

                  <b>
                    →
                  </b>

                </button>

                <button
                  onClick={() =>
                    setShowSafety(true)
                  }
                >
                  <span>
                    🛡️
                  </span>

                  Safety checklist

                  <b>
                    →
                  </b>

                </button>

              </div>

            </aside>

          </div>

        </section>

        {/* =====================================================
            NETWORK MAP
        ===================================================== */}

        <section
          className="section-block"
          id="network"
        >

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                COORDINATED RESPONSE
              </span>

              <h2>
                ResQNet live network
              </h2>

              <p>
                See active incidents, responder teams and
                relief resources across the response network.
              </p>

            </div>

            <div className="network-live">

              <span></span>

              Live

            </div>

          </div>

          <div className="network-map">

            <div className="map-large-grid"></div>

            <div className="large-road road-a"></div>

            <div className="large-road road-b"></div>

            <div className="large-road road-c"></div>

            <div className="large-road road-d"></div>

            <div className="large-marker incident-one">
              🚨
              <span>
                Flood
              </span>
            </div>

            <div className="large-marker incident-two">
              🔥
              <span>
                Fire
              </span>
            </div>

            <div className="large-marker responder-one">
              🧑‍🚒
              <span>
                Team Alpha
              </span>
            </div>

            <div className="large-marker responder-two">
              🚑
              <span>
                Medical
              </span>
            </div>

            <div className="large-marker resource-one">
              📦
              <span>
                Relief Hub
              </span>
            </div>

            <div className="network-map-info">

              <div className="network-info-header">

                <div>

                  <span>
                    LIVE OVERVIEW
                  </span>

                  <strong>
                    Response network
                  </strong>

                </div>

                <div className="network-status-pill">
                  ● Active
                </div>

              </div>

              <div className="network-stat-row">

                <div>

                  <strong>
                    {String(
                      requests.length
                    ).padStart(2, "0")}
                  </strong>

                  <span>
                    Incidents
                  </span>

                </div>

                <div>

                  <strong>
                    16
                  </strong>

                  <span>
                    Responders
                  </span>

                </div>

                <div>

                  <strong>
                    08
                  </strong>

                  <span>
                    Resources
                  </span>

                </div>

              </div>

            </div>

            <div className="map-legend-new">

              <span>

                <i className="legend-red"></i>

                Incident

              </span>

              <span>

                <i className="legend-green"></i>

                Responder

              </span>

              <span>

                <i className="legend-blue"></i>

                Medical

              </span>

              <span>

                <i className="legend-orange"></i>

                Resource

              </span>

            </div>

          </div>

        </section>

        {/* =====================================================
            VOLUNTEERS
        ===================================================== */}

        <section
          className="section-block"
          id="volunteers"
        >

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                YOUR RESPONSE NETWORK
              </span>

              <h2>
                Nearby responders
              </h2>

              <p>
                Connect with verified people who can support
                emergency operations.
              </p>

            </div>

            <button
              className="outline-button"
              onClick={() =>
                showToast(
                  "Showing all nearby responders"
                )
              }
            >
              View all →
            </button>

          </div>

          <div className="volunteer-grid">

            {volunteers.map((volunteer) => (

              <div
                className="nearby-volunteer"
                key={volunteer.name}
              >

                <div className="nearby-avatar">

                  {volunteer.avatar}

                  <span></span>

                </div>

                <div className="nearby-info">

                  <div className="nearby-name">

                    <h3>
                      {volunteer.name}
                    </h3>

                    <span>
                      ✓
                    </span>

                  </div>

                  <p>
                    {volunteer.role}
                  </p>

                  <div className="nearby-meta">

                    <span>
                      📍 {volunteer.location}
                    </span>

                    <span>
                      ⭐ {volunteer.rating}
                    </span>

                  </div>

                  <div className="mini-skills">

                    {volunteer.skills.map(
                      (skill) => (
                        <span key={skill}>
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

                <div className="nearby-actions">

                  <span className="available-label">
                    AVAILABLE
                  </span>

                  <button
                    onClick={() =>
                      setSelectedVolunteer(
                        volunteer
                      )
                    }
                  >
                    Profile
                  </button>

                  <button
                    className="invite-button"
                    onClick={() =>
                      handleInvite(
                        volunteer
                      )
                    }
                  >
                    Invite
                  </button>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* =====================================================
            OPERATIONS
        ===================================================== */}

        <section
          className="section-block"
          id="operations"
        >

          <div className="section-heading">

            <div>

              <span className="section-kicker">
                RESPONSE HISTORY
              </span>

              <h2>
                Current operations
              </h2>

              <p>
                Track ongoing and recently completed
                response missions.
              </p>

            </div>

          </div>

          <div className="operations-list">

            {operations.map(
              (operation, index) => (

                <div
                  className="operation-card"
                  key={index}
                >

                  <div className="operation-icon">
                    {operation.icon}
                  </div>

                  <div className="operation-info">

                    <div className="operation-top">

                      <span
                        className={`operation-status ${
                          operation.status ===
                          "ACTIVE"
                            ? "active"
                            : "completed"
                        }`}
                      >
                        {operation.status}
                      </span>

                      <span className="operation-time">
                        {operation.time}
                      </span>

                    </div>

                    <h3>
                      {operation.title}
                    </h3>

                    <p>
                      Coordinated by{" "}
                      <strong>
                        {operation.team}
                      </strong>
                    </p>

                  </div>

                  <button
                    className="operation-arrow"
                    onClick={() =>
                      showToast(
                        `${operation.title} selected`
                      )
                    }
                  >
                    →
                  </button>

                </div>

              )
            )}

          </div>

        </section>

        {/* =====================================================
            SAFETY + RECOGNITION
        ===================================================== */}

        <section className="bottom-grid">

          <div className="safety-card-new">

            <div className="safety-symbol">
              🛡️
            </div>

            <div className="safety-content">

              <span className="section-kicker">
                RESPONDER SAFETY
              </span>

              <h2>
                Your safety comes first.
              </h2>

              <p>
                Never enter a dangerous area alone. Follow
                team instructions, keep your location active
                and carry essential safety equipment.
              </p>

              <button
                onClick={() =>
                  setShowSafety(true)
                }
              >
                Open safety checklist →
              </button>

            </div>

          </div>

          <div className="recognition-card-new">

            <div className="recognition-top">

              <div className="recognition-badge">
                🏅
              </div>

              <div>

                <span className="section-kicker">
                  CONTRIBUTION LEVEL
                </span>

                <h3>
                  Community Champion
                </h3>

              </div>

            </div>

            <div className="recognition-progress">

              <div className="progress-header">

                <span>
                  Progress to next level
                </span>

                <strong>
                  74%
                </strong>

              </div>

              <div className="progress-track-new">
                <span></span>
              </div>

              <small>
                13 more successful responses to reach
                <strong>
                  {" "}Response Leader
                </strong>
              </small>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          REQUEST MODAL
      ===================================================== */}

      {selectedRequest && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedRequest(null)
          }
        >

          <div
            className="details-modal-new"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedRequest(null)
              }
            >
              ×
            </button>

            <div className="modal-top-icon">
              {selectedRequest.icon}
            </div>

            <span
              className={`priority-badge ${selectedRequest.priority}`}
            >
              {selectedRequest.priority} priority
            </span>

            <h2>
              {selectedRequest.type}
            </h2>

            <p className="modal-location">
              📍 {selectedRequest.location}
            </p>

            <div className="modal-stat-grid">

              <div>

                <strong>
                  {selectedRequest.people}
                </strong>

                <span>
                  People
                </span>

              </div>

              <div>

                <strong>
                  {selectedRequest.distance}
                </strong>

                <span>
                  Distance
                </span>

              </div>

              <div>

                <strong>
                  {selectedRequest.time}
                </strong>

                <span>
                  Reported
                </span>

              </div>

            </div>

            <div className="modal-section">

              <span>
                Situation
              </span>

              <p>
                {selectedRequest.description}
              </p>

            </div>

            <div className="modal-section">

              <span>
                Required skills
              </span>

              <div className="modal-skills-new">

                {selectedRequest.skills.map(
                  (skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>

            <div className="modal-actions-new">

              <button
                className="secondary-button-new"
                onClick={() =>
                  setSelectedRequest(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button-new"
                onClick={() =>
                  handleAccept(
                    selectedRequest
                  )
                }
              >
                Accept Request →
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          VOLUNTEER MODAL
      ===================================================== */}

      {selectedVolunteer && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedVolunteer(null)
          }
        >

          <div
            className="details-modal-new volunteer-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedVolunteer(null)
              }
            >
              ×
            </button>

            <div className="profile-modal-avatar">

              {selectedVolunteer.avatar}

              <span>
                ✓
              </span>

            </div>

            <div className="verified-text">
              VERIFIED RESPONDER
            </div>

            <h2>
              {selectedVolunteer.name}
            </h2>

            <p className="modal-location">
              {selectedVolunteer.role}
            </p>

            <div className="volunteer-modal-stats">

              <div>

                <strong>
                  {selectedVolunteer.tasks}
                </strong>

                <span>
                  Responses
                </span>

              </div>

              <div>

                <strong>
                  {selectedVolunteer.rating}
                </strong>

                <span>
                  Rating
                </span>

              </div>

              <div>

                <strong>
                  {
                    selectedVolunteer.location.split(
                      " "
                    )[0]
                  }
                </strong>

                <span>
                  Distance
                </span>

              </div>

            </div>

            <div className="modal-section">

              <span>
                Skills
              </span>

              <div className="modal-skills-new">

                {selectedVolunteer.skills.map(
                  (skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>

            <div className="modal-actions-new">

              <button
                className="secondary-button-new"
                onClick={() =>
                  setSelectedVolunteer(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button-new"
                onClick={() => {

                  handleInvite(
                    selectedVolunteer
                  );

                  setSelectedVolunteer(null);

                }}
              >
                Invite to Team →
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SAFETY MODAL
      ===================================================== */}

      {showSafety && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowSafety(false)
          }
        >

          <div
            className="details-modal-new safety-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setShowSafety(false)
              }
            >
              ×
            </button>

            <div className="modal-top-icon">
              🛡️
            </div>

            <span className="section-kicker">
              BEFORE YOU RESPOND
            </span>

            <h2>
              Safety checklist
            </h2>

            <div className="checklist">

              <div>

                <span>
                  ✓
                </span>

                Confirm the incident location.

              </div>

              <div>

                <span>
                  ✓
                </span>

                Keep your phone and GPS active.

              </div>

              <div>

                <span>
                  ✓
                </span>

                Coordinate with your assigned team.

              </div>

              <div>

                <span>
                  ✓
                </span>

                Carry first-aid and essential equipment.

              </div>

              <div>

                <span>
                  ✓
                </span>

                Never enter an unsafe area alone.

              </div>

            </div>

            <button
              className="primary-button-new full-button"
              onClick={() => {

                setShowSafety(false);

                showToast(
                  "Stay safe. Response checklist completed."
                );

              }}
            >
              I'm ready to respond
            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (

        <div className="toast-new">

          <span>
            ✓
          </span>

          {toast}

        </div>

      )}

    </div>
  );
}

export default Volunteer;