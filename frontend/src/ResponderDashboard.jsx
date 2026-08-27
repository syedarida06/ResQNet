import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Navbar from "./Navbar";

import "./ResponderDashboard.css";

const API_URL =
  "https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app/api";

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

function formatDateTime(
  value
) {
  if (!value) {
    return "Time not recorded";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Time not recorded";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/* =========================================================
   RESPONDER DASHBOARD
========================================================= */

function ResponderDashboard() {
  const navigate =
    useNavigate();

  const [responder, setResponder] =
    useState(null);

  const [availability, setAvailability] =
    useState("Available");

  const [assignments, setAssignments] =
    useState([]);

  const [newRequests, setNewRequests] =
    useState([]);

  const [selectedEmergency, setSelectedEmergency] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [showProfile, setShowProfile] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [helpRequested, setHelpRequested] =
    useState(false);

  const [notification, setNotification] =
    useState("");

  const [notificationType, setNotificationType] =
    useState("info");

  const [showAssignmentAlert, setShowAssignmentAlert] =
    useState(false);

  const previousAssignmentsRef =
    useRef([]);

  const initialDashboardLoadRef =
    useRef(true);

  /* =========================================================
     STATUS DEFINITIONS
  ========================================================= */

  const statusSteps = [
    {
      status: "Dispatched",
      label: "Assigned",
      description:
        "Admin has assigned this incident to your team.",
      icon: "📨",
      timestampField:
        "dispatchedAt",
    },

    {
      status: "Accepted",
      label: "Accepted",
      description:
        "Responder has accepted the assignment.",
      icon: "✓",
      timestampField:
        "acceptedAt",
    },

    {
      status: "Started",
      label: "Started",
      description:
        "Response operation has started.",
      icon: "🚀",
      timestampField:
        "startedAt",
    },

    {
      status: "Arriving",
      label: "Arriving",
      description:
        "Team is approaching the incident.",
      icon: "🚑",
      timestampField:
        "arrivingAt",
    },

    {
      status: "Arrived",
      label: "Arrived",
      description:
        "Team has reached the incident location.",
      icon: "📍",
      timestampField:
        "arrivedAt",
    },

    {
      status: "Rescued",
      label: "Rescued",
      description:
        "Rescue operation has been completed.",
      icon: "🛟",
      timestampField:
        "rescuedAt",
    },
  ];

  /* =========================================================
     LOAD LOGIN SESSION
  ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "resqnetResponder"
      );

    if (!saved) {
      navigate(
        "/responder-login"
      );

      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (
        !parsed.applicationId
      ) {
        throw new Error(
          "Invalid responder session."
        );
      }

      setResponder(
        parsed
      );

      setAvailability(
        parsed.availabilityStatus ||
          "Available"
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      localStorage.removeItem(
        "resqnetResponder"
      );

      navigate(
        "/responder-login"
      );
    }
  }, [
    navigate,
  ]);

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const showNotification = (
    messageText,
    type = "info"
  ) => {
    setNotification(
      messageText
    );

    setNotificationType(
      type
    );

    setTimeout(() => {
      setNotification("");
    }, 4500);
  };

  /* =========================================================
     CHECK NEW ASSIGNMENTS
  ========================================================= */

  const checkAssignmentUpdates = (
    emergencyData
  ) => {
    if (
      initialDashboardLoadRef.current
    ) {
      previousAssignmentsRef.current =
        emergencyData;

      initialDashboardLoadRef.current =
        false;

      return;
    }

    const oldIds =
      new Set(
        previousAssignmentsRef.current.map(
          (
            item
          ) =>
            item._id
        )
      );

    const newlyAssigned =
      emergencyData.filter(
        (
          item
        ) =>
          !oldIds.has(
            item._id
          ) &&
          item.assignedTeam
      );

    const statusChanged =
      emergencyData.filter(
        (
          item
        ) => {
          const previous =
            previousAssignmentsRef.current.find(
              (
                oldItem
              ) =>
                oldItem._id ===
                item._id
            );

          return (
            previous &&
            previous.status !==
              item.status
          );
        }
      );

    if (
      newlyAssigned.length
    ) {
      const latest =
        newlyAssigned[0];

      showNotification(
        `🚨 New assignment: ${
          latest.emergencyType ||
          "Emergency"
        } at ${
          latest.location ||
          "incident location"
        }`,
        "assignment"
      );

      setShowAssignmentAlert(
        true
      );
    }

    if (
      statusChanged.length
    ) {
      const latest =
        statusChanged[
          statusChanged.length - 1
        ];

      if (
        latest.status !==
        "Dispatched"
      ) {
        showNotification(
          `Incident ${
            latest._id
              ?.toString()
              .slice(-6)
              .toUpperCase()
          } updated to ${
            latest.status
          }.`,
          "status"
        );
      }
    }

    previousAssignmentsRef.current =
      emergencyData;
  };

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  const loadDashboardData =
    async (
      silent = false
    ) => {
      if (
        !responder?.applicationId
      ) {
        return;
      }

      try {
        if (!silent) {
          setLoading(
            true
          );
        }

        const response =
          await fetch(
            `${API_URL}/responders/${encodeURIComponent(
              responder.applicationId
            )}/dashboard`
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load responder dashboard."
          );
        }

        const responderData =
          result.data?.responder ||
          {};

        const emergencyData =
          result.data?.assignments ||
          [];

        const newRequestData =
          result.data?.newRequests ||
          result.data?.pendingRequests ||
          [];

        const historyData =
          result.data?.history ||
          [];

        setResponder(
          (
            previous
          ) => ({
            ...previous,
            ...responderData,
          })
        );

        setAvailability(
          responderData.availabilityStatus ||
            "Available"
        );

        setAssignments(
          emergencyData
        );

        setNewRequests(
          newRequestData
        );

        setHistory(
          historyData
        );

        checkAssignmentUpdates(
          emergencyData
        );

        setSelectedEmergency(
          (
            previous
          ) => {

            if (
              emergencyData.length
            ) {
              if (!previous) {
                return emergencyData[0];
              }

              const updated =
                emergencyData.find(
                  (
                    item
                  ) =>
                    item._id ===
                    previous._id
                );

              return (
                updated ||
                emergencyData[0]
              );
            }

            if (
              newRequestData.length
            ) {
              if (!previous) {
                return newRequestData[0];
              }

              const updatedNew =
                newRequestData.find(
                  (
                    item
                  ) =>
                    item._id ===
                    previous._id
                );

              return (
                updatedNew ||
                newRequestData[0]
              );
            }

            return null;
          }
        );

        if (!silent) {
          setError("");
        }
      } catch (
        error
      ) {
        console.error(
          "Responder dashboard error:",
          error
        );

        if (!silent) {
          setError(
            error.message ||
              "Unable to load responder dashboard."
          );
        }
      } finally {
        if (!silent) {
          setLoading(
            false
          );
        }
      }
    };

  /* =========================================================
     AUTOMATIC REFRESH
  ========================================================= */

  useEffect(() => {
    if (
      !responder?.applicationId
    ) {
      return;
    }

    loadDashboardData();

    const interval =
      setInterval(() => {
        loadDashboardData(
          true
        );
      }, 3000);

    return () =>
      clearInterval(
        interval
      );
  }, [
    responder?.applicationId,
  ]);

  /* =========================================================
     ACTIVE INCIDENT
  ========================================================= */

  const incident =
    selectedEmergency ||
    assignments[0] ||
    newRequests[0] ||
    null;

  /* =========================================================
     TEAM
  ========================================================= */

  const assignedTeam =
    incident?.assignedTeam ||
    responder?.preferredTeam ||
    "Rescue Unit Alpha";

  /* =========================================================
     ASSIGNED?
  ========================================================= */

  const isAssigned =
    Boolean(
      incident?.assignedTeam
    );

  /* =========================================================
     AVAILABILITY
  ========================================================= */

  const updateAvailability =
    async (
      value
    ) => {
      if (
        !responder?.applicationId
      ) {
        return;
      }

      const previous =
        availability;

      setAvailability(
        value
      );

      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/responders/${encodeURIComponent(
              responder.applicationId
            )}/availability`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  availabilityStatus:
                    value,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to update availability."
          );
        }

        setResponder(
          (
            previousResponder
          ) => ({
            ...previousResponder,
            availabilityStatus:
              value,
          })
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setAvailability(
          previous
        );

        setError(
          error.message ||
            "Unable to update availability."
        );
      }
    };

  /* =========================================================
     STATUS ACTION
  ========================================================= */

  const updateEmergencyStatus =
    async (
      newStatus
    ) => {
      if (
        !incident ||
        !responder
      ) {
        return;
      }

      if (!isAssigned) {
        showNotification(
          "This incident has not been assigned to your team yet.",
          "warning"
        );

        return;
      }

      setActionLoading(
        true
      );

      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/emergency/${incident._id}/status`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  status:
                    newStatus,

                  responder:
                    responder.applicationId,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to update emergency status."
          );
        }

        const updated =
          result.data;

        setAssignments(
          (
            previous
          ) =>
            previous.map(
              (
                item
              ) =>
                item._id ===
                updated._id
                  ? updated
                  : item
            )
        );

        setNewRequests(
          (
            previous
          ) =>
            previous.filter(
              (
                item
              ) =>
                item._id !==
                updated._id
            )
        );

        setSelectedEmergency(
          updated
        );

        showNotification(
          `✓ Incident status updated to ${newStatus}.`,
          "status"
        );

        await loadDashboardData(
          true
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setError(
          error.message ||
            "Unable to update emergency status."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =========================================================
     NEXT ACTION
  ========================================================= */

  const nextAction =
    useMemo(() => {
      if (!incident) {
        return null;
      }

      if (!isAssigned) {
        return null;
      }

      switch (
        incident.status
      ) {
        case "Pending":
        case "Dispatched":
        case "Assigned":
          return {
            label:
              "Accept assignment",
            status:
              "Accepted",
          };

        case "Accepted":
          return {
            label:
              "Start response",
            status:
              "Started",
          };

        case "Started":
          return {
            label:
              "Mark arriving",
            status:
              "Arriving",
          };

        case "Arriving":
          return {
            label:
              "Mark arrived",
            status:
              "Arrived",
          };

        case "Arrived":
          return {
            label:
              "Mark rescued",
            status:
              "Rescued",
          };

        default:
          return null;
      }
    }, [
      incident,
      isAssigned,
    ]);

  /* =========================================================
     STATUS INDEX
  ========================================================= */

  const getStatusIndex = (
    currentStatus
  ) => {
    const normalized =
      currentStatus ===
      "Assigned"
        ? "Dispatched"
        : currentStatus;

    return statusSteps.findIndex(
      (
        item
      ) =>
        item.status ===
        normalized
    );
  };

  const currentStatusIndex =
    getStatusIndex(
      incident?.status
    );

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigateToIncident =
    () => {
      if (!incident) {
        return;
      }

      const lat =
        Number(
          incident.latitude
        );

      const lng =
        Number(
          incident.longitude
        );

      if (
        Number.isFinite(
          lat
        ) &&
        Number.isFinite(
          lng
        )
      ) {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          "_blank"
        );

        return;
      }

      if (
        incident.location
      ) {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            incident.location
          )}`,
          "_blank"
        );
      }
    };

  /* =========================================================
     MESSAGES
  ========================================================= */

  const loadMessages =
    async () => {
      if (!incident?._id) {
        setMessages(
          []
        );

        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/emergency/${incident._id}/messages`
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success
        ) {
          setMessages(
            result.data
              ?.messages ||
              []
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Message error:",
          error
        );
      }
    };

  useEffect(() => {
    loadMessages();

    const interval =
      setInterval(
        loadMessages,
        3000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    incident?._id,
  ]);

  const sendMessage =
    async (
      event
    ) => {
      event.preventDefault();

      const text =
        message.trim();

      if (
        !text ||
        !incident ||
        !responder
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/emergency/${incident._id}/messages`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  sender:
                    responder.fullName ||
                    "Responder",

                  senderType:
                    "responder",

                  text,
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to send message."
          );
        }

        setMessages(
          result.data
            ?.messages ||
            []
        );

        setMessage("");
      } catch (
        error
      ) {
        console.error(
          error
        );

        setError(
          error.message ||
            "Unable to send message."
        );
      }
    };

  /* =========================================================
     ASSISTANCE
  ========================================================= */

  const requestAssistance =
    async () => {
      if (
        !incident ||
        !responder ||
        helpRequested
      ) {
        return;
      }

      setActionLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_URL}/emergency/${incident._id}/assistance`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  responder:
                    responder.applicationId,

                  message:
                    "Responder requires additional assistance at the incident.",
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to request assistance."
          );
        }

        setHelpRequested(
          true
        );

        showNotification(
          "🆘 Assistance request sent to Command Centre.",
          "warning"
        );
      } catch (
        error
      ) {
        console.error(
          error
        );

        setError(
          error.message ||
            "Unable to request assistance."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =========================================================
     SELECT NEW REQUEST
  ========================================================= */

  const selectIncident =
    (
      item
    ) => {
      setSelectedEmergency(
        item
      );

      setHelpRequested(
        false
      );

      setShowAssignmentAlert(
        false
      );
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout =
    () => {
      localStorage.removeItem(
        "resqnetResponder"
      );

      navigate(
        "/responder-login"
      );
    };

  /* =========================================================
     DISPLAY
  ========================================================= */

  const initials =
    responder?.fullName
      ? responder.fullName
          .split(" ")
          .map(
            (
              word
            ) =>
              word[0]
          )
          .join("")
          .slice(
            0,
            2
          )
          .toUpperCase()
      : "RS";

  const activeAssignments =
    assignments.filter(
      (
        item
      ) =>
        ![
          "Rescued",
          "Resolved",
          "Cancelled",
        ].includes(
          item.status
        )
    );

  const completedCount =
    history.length;

  const allocatedResources =
    Array.isArray(
      incident?.allocatedResources
    )
      ? incident.allocatedResources
      : [];

  /* =========================================================
     TIMESTAMP FOR CURRENT STATUS
  ========================================================= */

  const currentStatusTimestamp =
    incident
      ? incident.status ===
        "Dispatched"
        ? incident.dispatchedAt
        : incident.status ===
          "Accepted"
        ? incident.acceptedAt
        : incident.status ===
            "Started" ||
          incident.status ===
            "En Route"
        ? incident.startedAt ||
          incident.enRouteAt
        : incident.status ===
          "Arriving"
        ? incident.arrivingAt
        : incident.status ===
          "Arrived"
        ? incident.arrivedAt
        : incident.status ===
            "Rescued" ||
          incident.status ===
            "Resolved"
        ? incident.rescuedAt ||
          incident.resolvedAt
        : null
      : null;

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    !responder
  ) {
    return (
      <div className="responder-dashboard-page">

        <Navbar />

        <main
          className="responder-dashboard"
          style={{
            minHeight:
              "70vh",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",
          }}
        >

          <div>

            <h2>
              Loading responder portal...
            </h2>

            <p>
              Connecting to the
              ResQNet response network.
            </p>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="responder-dashboard-page">

      <Navbar />

      <main className="responder-dashboard">

        {/* =================================================
            ASSIGNMENT ALERT
        ================================================= */}

        {showAssignmentAlert &&
          incident &&
          isAssigned && (

            <div className="assignment-alert">

              <div className="assignment-alert-icon">
                🚨
              </div>

              <div className="assignment-alert-content">

                <span>
                  NEW TEAM ASSIGNMENT
                </span>

                <strong>
                  {
                    incident.emergencyType
                  }{" "}
                  ·{" "}
                  {
                    incident.location
                  }
                </strong>

                <small>
                  Team{" "}
                  <b>
                    {assignedTeam}
                  </b>{" "}
                  has been assigned this incident.
                </small>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAssignmentAlert(
                    false
                  )
                }
              >
                ×
              </button>

            </div>
          )}

        {/* =================================================
            NEW REQUEST ALERT
        ================================================= */}

        {newRequests.length >
          0 &&
          !isAssigned && (

            <div className="new-request-banner">

              <div className="new-request-icon">
                🆘
              </div>

              <div>

                <span>
                  NEW CITIZEN EMERGENCY
                </span>

                <strong>
                  {
                    newRequests[0]
                      ?.emergencyType ||
                    "Emergency"
                  }
                </strong>

                <small>
                  📍{" "}
                  {
                    newRequests[0]
                      ?.location ||
                    "Location unavailable"
                  }
                </small>

              </div>

              <button
                type="button"
                onClick={() =>
                  selectIncident(
                    newRequests[0]
                  )
                }
              >
                View request →
              </button>

            </div>
          )}

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="responder-welcome">

          <div className="welcome-content">

            <div className="responder-dashboard-eyebrow">
              <span></span>
              RESPONDER FIELD PORTAL
            </div>

            <h1>

              Welcome,

              <em>
                {" "}
                {
                  responder?.fullName ||
                  "Responder"
                }.
              </em>

            </h1>

            <p>
              Your response operations
              and active assignments
              are all in one place.
            </p>

          </div>

          <div className="availability-box">

            <span className="availability-label">
              YOUR STATUS
            </span>

            <select
              value={
                availability
              }
              onChange={(e) =>
                updateAvailability(
                  e.target.value
                )
              }
            >

              <option value="Available">
                Available
              </option>

              <option value="On Assignment">
                On Assignment
              </option>

              <option value="Unavailable">
                Unavailable
              </option>

            </select>

            <div
              className={`availability-indicator ${
                availability ===
                "Available"
                  ? "available"
                  : availability ===
                    "On Assignment"
                  ? "busy"
                  : "offline"
              }`}
            />

          </div>

        </section>

        {/* ERROR */}

        {error && (

          <div className="responder-error">
            {error}
          </div>

        )}

        {/* =================================================
            ACTIVE ASSIGNMENT
        ================================================= */}

        <section className="active-assignment">

          {incident ? (
            <>

              <div className="assignment-top">

                <div>

                  <span className="section-label">

                    {isAssigned
                      ? "ACTIVE TEAM ASSIGNMENT"
                      : "NEW CITIZEN REQUEST"}

                  </span>

                  <h2>

                    {
                      incident.emergencyType ||
                      incident.type ||
                      "Emergency Response"
                    }

                    {" — "}

                    {
                      incident._id
                        ?.toString()
                        .slice(
                          -6
                        )
                        .toUpperCase()
                    }

                  </h2>

                  <p>
                    📍{" "}
                    {
                      incident.location ||
                      "Location unavailable"
                    }
                  </p>

                </div>

                <div
                  className={`priority-badge ${
                    incident.isSOS
                      ? "danger"
                      : ""
                  }`}
                >

                  {incident.isSOS
                    ? "SOS / HIGH PRIORITY"
                    : isAssigned
                    ? "TEAM ASSIGNED"
                    : "AWAITING DISPATCH"}

                </div>

              </div>

              {/* =================================================
                  INCIDENT DATE / TIME
              ================================================= */}

              <div
                style={{
                  marginTop:
                    "18px",

                  padding:
                    "12px 16px",

                  border:
                    "1px solid #dce9e8",

                  borderRadius:
                    "12px",

                  background:
                    "#f7fbfa",

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap:
                    "15px",

                  flexWrap:
                    "wrap",
                }}
              >

                <div>

                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#8aa0a7",

                      fontSize:
                        "9px",

                      fontWeight:
                        800,

                      letterSpacing:
                        "1px",
                    }}
                  >
                    EMERGENCY RECEIVED
                  </span>

                  <strong
                    style={{
                      display:
                        "block",

                      marginTop:
                        "4px",

                      color:
                        "#315767",

                      fontSize:
                        "13px",
                    }}
                  >
                    🕒{" "}
                    {
                      formatDateTime(
                        incident.createdAt
                      )
                    }
                  </strong>

                </div>

                <div>

                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#8aa0a7",

                      fontSize:
                        "9px",

                      fontWeight:
                        800,

                      letterSpacing:
                        "1px",
                    }}
                  >
                    CURRENT STATUS TIME
                  </span>

                  <strong
                    style={{
                      display:
                        "block",

                      marginTop:
                        "4px",

                      color:
                        "#0a9994",

                      fontSize:
                        "13px",
                    }}
                  >
                    {currentStatusTimestamp
                      ? formatDateTime(
                          currentStatusTimestamp
                        )
                      : "Waiting for status update"}
                  </strong>

                </div>

              </div>

              <div className="assignment-grid">

                <div className="assignment-info">

                  <span>
                    INCIDENT STATUS
                  </span>

                  <strong>
                    {
                      incident.status ||
                      "Pending"
                    }
                  </strong>

                </div>

                <div className="assignment-info">

                  <span>
                    AFFECTED PEOPLE
                  </span>

                  <strong>
                    {
                      incident.people ||
                      1
                    }{" "}
                    reported
                  </strong>

                </div>

                <div className="assignment-info">

                  <span>
                    RESPONSE TEAM
                  </span>

                  <strong>
                    {isAssigned
                      ? assignedTeam
                      : "Not yet assigned"}
                  </strong>

                </div>

                <div className="assignment-info">

                  <span>
                    ESTIMATED ARRIVAL
                  </span>

                  <strong>

                    {incident.status ===
                    "Arrived"
                      ? "Arrived"
                      : incident.eta
                      ? `${incident.eta} minutes`
                      : "Not available"}

                  </strong>

                </div>

              </div>

              {/* =================================================
                  RESPONSE TIMELINE
              ================================================= */}

              <div className="response-timeline">

                <div className="timeline-heading">

                  <span>
                    RESPONSE PROGRESS
                  </span>

                  <strong>
                    {
                      incident.status ||
                      "Pending"
                    }
                  </strong>

                </div>

                <div className="timeline">

                  {statusSteps.map(
                    (
                      step,
                      index
                    ) => {

                      const active =
                        index <=
                        currentStatusIndex;

                      const completed =
                        index <
                        currentStatusIndex;

                      const timestamp =
                        incident[
                          step.timestampField
                        ];

                      return (

                        <div
                          key={
                            step.status
                          }
                          className={
                            `timeline-step ${
                              active
                                ? "active"
                                : ""
                            } ${
                              completed
                                ? "completed"
                                : ""
                            }`
                          }
                        >

                          <div className="timeline-node">

                            {completed
                              ? "✓"
                              : step.icon}

                          </div>

                          <div className="timeline-content">

                            <strong>
                              {
                                step.label
                              }
                            </strong>

                            <small>
                              {
                                step.description
                              }
                            </small>

                            {timestamp && (
                              <small
                                style={{
                                  display:
                                    "block",

                                  marginTop:
                                    "4px",

                                  color:
                                    "#0a9994",

                                  fontWeight:
                                    700,
                                }}
                              >
                                🕒{" "}
                                {
                                  formatDateTime(
                                    timestamp
                                  )
                                }
                              </small>
                            )}

                          </div>

                          {index <
                            statusSteps.length -
                              1 && (

                            <div className="timeline-line"></div>

                          )}

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="assignment-actions">

                <button
                  type="button"
                  className="primary-action"
                  onClick={
                    navigateToIncident
                  }
                >
                  🧭 Navigate to incident
                </button>

                {nextAction && (

                  <button
                    type="button"
                    className="secondary-action"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      updateEmergencyStatus(
                        nextAction.status
                      )
                    }
                  >

                    {actionLoading
                      ? "Updating..."
                      : `✓ ${nextAction.label}`}

                  </button>

                )}

              </div>

              {!isAssigned && (

                <div className="awaiting-dispatch-note">

                  <span>
                    ⏳
                  </span>

                  <div>

                    <strong>
                      Waiting for Command Centre
                    </strong>

                    <small>
                      This citizen request is visible
                      to the response network but has
                      not yet been assigned to a team.
                    </small>

                  </div>

                </div>

              )}

            </>
          ) : (

            <div className="no-assignment">

              <span className="section-label">
                ACTIVE ASSIGNMENT
              </span>

              <h2>
                No active emergency assigned
              </h2>

              <p>
                You are available for
                new response assignments
                from the command centre.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section className="responder-content-grid">

          <div className="responder-main-column">

            {/* TEAM */}

            <section className="dashboard-card team-card">

              <div className="card-heading">

                <div>

                  <span className="section-label">
                    YOUR TEAM
                  </span>

                  <h3>
                    {assignedTeam}
                  </h3>

                </div>

                <span className="team-status">

                  {incident &&
                  isAssigned
                    ? "DEPLOYED"
                    : "READY"}

                </span>

              </div>

              <div className="team-list">

                <div className="team-member">

                  <div className="member-avatar">
                    {initials}
                  </div>

                  <div className="member-information">

                    <strong>
                      {
                        responder?.fullName ||
                        "Responder"
                      }
                    </strong>

                    <small>
                      {
                        responder?.specialization ||
                        "Emergency Responder"
                      }
                    </small>

                  </div>

                  <span className="member-online">
                    ●
                  </span>

                </div>

                <div className="team-member">

                  <div className="member-avatar">
                    RC
                  </div>

                  <div className="member-information">

                    <strong>
                      Command Centre
                    </strong>

                    <small>
                      Coordination
                    </small>

                  </div>

                  <span className="member-online">
                    ●
                  </span>

                </div>

              </div>

            </section>

            {/* MAP */}

            <section className="dashboard-card incident-map-card">

              <div className="card-heading">

                <div>

                  <span className="section-label">
                    INCIDENT LOCATION
                  </span>

                  <h3>
                    {incident
                      ? "Live incident location"
                      : "No active incident"}
                  </h3>

                </div>

                {incident && (

                  <span className="live-tag">
                    ● LIVE
                  </span>

                )}

              </div>

              <div className="fake-map">

                <div className="map-grid"></div>

                <div className="map-road road-one"></div>

                <div className="map-road road-two"></div>

                <div className="map-road road-three"></div>

                {incident && (

                  <>

                    <div className="map-marker incident-marker">
                      🚨
                    </div>

                    <div className="map-label incident-label">
                      Incident
                    </div>

                    <div className="map-marker team-marker">
                      🚑
                    </div>

                    <div className="map-label team-label">
                      {assignedTeam}
                    </div>

                  </>

                )}

              </div>

              <div className="map-footer">

                <span>
                  📍{" "}
                  {
                    incident?.location ||
                    "Waiting for assignment"
                  }
                </span>

                {incident && (

                  <button
                    type="button"
                    onClick={
                      navigateToIncident
                    }
                  >
                    Open navigation →
                  </button>

                )}

              </div>

            </section>

            {/* RESOURCES */}

            <section className="dashboard-card resources-card">

              <div className="card-heading">

                <div>

                  <span className="section-label">
                    ADMIN ALLOCATED RESOURCES
                  </span>

                  <h3>
                    Supplies for this operation
                  </h3>

                </div>

                {allocatedResources.length >
                  0 && (

                  <span className="resource-count">
                    {
                      allocatedResources.length
                    }{" "}
                    ITEMS
                  </span>

                )}

              </div>

              {allocatedResources.length >
              0 ? (

                <div className="resource-grid">

                  {allocatedResources.map(
                    (
                      resource,
                      index
                    ) => (

                      <div
                        key={
                          resource.resourceId ||
                          index
                        }
                        className="resource-item"
                      >

                        <span>
                          {
                            resource.icon ||
                            "📦"
                          }
                        </span>

                        <div>

                          <strong>
                            {
                              resource.resourceName ||
                              "Resource"
                            }
                          </strong>

                          <small>
                            {
                              resource.quantity
                            }{" "}
                            {
                              resource.unit
                            }
                          </small>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="no-resources">

                  <span>
                    📦
                  </span>

                  <div>

                    <strong>
                      No resources allocated yet
                    </strong>

                    <small>
                      When Admin allocates food,
                      water, clothes, medical kits
                      or other supplies, they will
                      appear here automatically.
                    </small>

                  </div>

                </div>

              )}

            </section>

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="responder-side-column">

            {/* PROFILE */}

            <section
              className="dashboard-card profile-card"
              onClick={() =>
                setShowProfile(
                  true
                )
              }
              role="button"
              tabIndex={0}
            >

              <div className="profile-top">

                <div className="profile-avatar">
                  {initials}
                </div>

                <div className="profile-main-info">

                  <span className="verified-badge">
                    ✓ VERIFIED
                  </span>

                  <h3>
                    {
                      responder?.fullName ||
                      "Responder"
                    }
                  </h3>

                  <small>
                    Responder ID:{" "}
                    {
                      responder?.applicationId ||
                      "—"
                    }
                  </small>

                </div>

              </div>

              <div className="profile-details">

                <div>

                  <span>
                    ROLE
                  </span>

                  <strong>
                    {
                      responder?.specialization ||
                      "Responder"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    AREA
                  </span>

                  <strong>
                    {
                      responder?.city ||
                      "—"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    TEAM
                  </span>

                  <strong>
                    {
                      responder?.preferredTeam ||
                      "Rescue Unit Alpha"
                    }
                  </strong>

                </div>

              </div>

              <div className="profile-view-hint">
                👤 View my profile, history &
                achievements →
              </div>

            </section>

            {/* COMMAND */}

            <section className="dashboard-card command-card">

              <div className="card-heading">

                <div>

                  <span className="section-label">
                    COMMAND UPDATES
                  </span>

                  <h3>
                    Response overview
                  </h3>

                </div>

                <span className="notification-dot">
                  {
                    activeAssignments.length
                  }
                </span>

              </div>

              <div className="command-update">

                <span>
                  {
                    incident
                      ? "!"
                      : "✓"
                  }
                </span>

                <div>

                  <strong>
                    {
                      incident
                        ? isAssigned
                          ? "Active assignment"
                          : "New citizen request"
                        : "You are available"
                    }
                  </strong>

                  <p>
                    {
                      incident
                        ? `${
                            incident.emergencyType ||
                            incident.type ||
                            "Emergency"
                          } response is currently ${
                            incident.status ||
                            "Pending"
                          }.`
                        : "Waiting for a new emergency assignment."
                    }
                  </p>

                  {incident && (

                    <small>
                      Team:{" "}
                      {isAssigned
                        ? assignedTeam
                        : "Awaiting dispatch"}
                    </small>

                  )}

                </div>

              </div>

            </section>

            {/* CHAT */}

            <section className="dashboard-card chat-card">

              <div className="card-heading">

                <div>

                  <span className="section-label">
                    INCIDENT COMMUNICATION
                  </span>

                  <h3>
                    Response channel
                  </h3>

                </div>

                <span className="live-tag">
                  LIVE
                </span>

              </div>

              <div className="chat-messages">

                {messages.length ===
                0 ? (

                  <div
                    style={{
                      padding:
                        "20px 0",
                      opacity:
                        0.7,
                    }}
                  >
                    No messages yet.
                  </div>

                ) : (

                  messages.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={
                          item._id ||
                          index
                        }
                        className={`chat-message ${
                          item.senderType ===
                          "responder"
                            ? "responder"
                            : item.senderType ===
                              "command"
                            ? "command"
                            : "citizen"
                        }`}
                      >

                        <div className="message-meta">

                          <strong>
                            {
                              item.sender
                            }
                          </strong>

                          <small>
                            {item.createdAt
                              ? formatTime(
                                  item.createdAt
                                )
                              : "Now"}
                          </small>

                        </div>

                        <p>
                          {
                            item.text
                          }
                        </p>

                      </div>

                    )
                  )

                )}

              </div>

              <form
                className="chat-form"
                onSubmit={
                  sendMessage
                }
              >

                <input
                  type="text"
                  value={
                    message
                  }
                  onChange={(
                    e
                  ) =>
                    setMessage(
                      e.target
                        .value
                    )
                  }
                  placeholder={
                    incident
                      ? "Send an incident update..."
                      : "No active incident"
                  }
                  disabled={
                    !incident
                  }
                />

                <button
                  type="submit"
                  disabled={
                    !incident
                  }
                >
                  →
                </button>

              </form>

            </section>

            {/* HELP */}

            <button
              type="button"
              className={`request-help ${
                helpRequested
                  ? "help-requested"
                  : ""
              }`}
              onClick={
                requestAssistance
              }
              disabled={
                !incident ||
                helpRequested ||
                actionLoading
              }
            >

              <span>
                {
                  helpRequested
                    ? "✓"
                    : "🆘"
                }
              </span>

              <div>

                <strong>
                  {
                    helpRequested
                      ? "Assistance requested"
                      : "Request assistance"
                  }
                </strong>

                <small>
                  {
                    helpRequested
                      ? "Command centre has been alerted"
                      : "Alert command centre"
                  }
                </small>

              </div>

              <b>
                →
              </b>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={
                logout
              }
              className="responder-logout"
            >
              Sign out
            </button>

          </aside>

        </section>

      </main>

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (

        <div
          className={`responder-notification ${notificationType}`}
        >

          <span>

            {notificationType ===
            "assignment"
              ? "🚨"
              : notificationType ===
                "warning"
              ? "⚠️"
              : "✓"}

          </span>

          <p>
            {notification}
          </p>

          <button
            type="button"
            onClick={() =>
              setNotification(
                ""
              )
            }
          >
            ×
          </button>

        </div>

      )}

      {/* =================================================
          PROFILE MODAL
      ================================================= */}

      {showProfile && (

        <div
          className="profile-overlay"
          onClick={() =>
            setShowProfile(
              false
            )
          }
        >

          <div
            className="profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="profile-modal-header">

              <div>

                <span className="profile-modal-eyebrow">
                  RESPONDER PROFILE
                </span>

                <h2>
                  My Profile
                </h2>

                <p>
                  Your ResQNet response
                  history, impact and
                  recognition.
                </p>

              </div>

              <button
                type="button"
                className="profile-close"
                onClick={() =>
                  setShowProfile(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="profile-identity">

              <div className="profile-modal-avatar">
                {initials}
              </div>

              <div>

                <span className="verified-badge">
                  ✓ VERIFIED RESPONDER
                </span>

                <h3>
                  {
                    responder?.fullName ||
                    "Responder"
                  }
                </h3>

                <p>
                  Responder ID:{" "}
                  {
                    responder?.applicationId ||
                    "—"
                  }
                </p>

              </div>

            </div>

            <div className="profile-detail-grid">

              <div>

                <span>
                  SPECIALIZATION
                </span>

                <strong>
                  {
                    responder?.specialization ||
                    "—"
                  }
                </strong>

              </div>

              <div>

                <span>
                  OPERATING AREA
                </span>

                <strong>
                  {
                    responder?.city ||
                    "—"
                  }
                </strong>

              </div>

              <div>

                <span>
                  EXPERIENCE
                </span>

                <strong>
                  {
                    responder?.experience ||
                    "—"
                  }
                </strong>

              </div>

              <div>

                <span>
                  CURRENT TEAM
                </span>

                <strong>
                  {assignedTeam}
                </strong>

              </div>

            </div>

            {/* HISTORY */}

            <div className="profile-section">

              <div className="profile-section-heading">

                <div>

                  <span className="section-label">
                    RESPONSE HISTORY
                  </span>

                  <h3>
                    Completed rescue operations
                  </h3>

                </div>

                <span className="history-count">
                  {completedCount}{" "}
                  COMPLETED
                </span>

              </div>

              <div className="rescue-history">

                {history.length ===
                0 ? (

                  <p>
                    No completed operations
                    yet.
                  </p>

                ) : (

                  history.map(
                    (
                      item
                    ) => (

                      <div
                        className="history-item"
                        key={
                          item._id
                        }
                      >

                        <div className="history-icon">

                          {item.emergencyType ===
                          "Flood"
                            ? "🌊"
                            : item.emergencyType ===
                              "Fire"
                            ? "🔥"
                            : "🚨"}

                        </div>

                        <div className="history-content">

                          <strong>
                            {
                              item.emergencyType
                            }
                            {" — "}
                            {item._id
                              ?.toString()
                              .slice(
                                -6
                              )
                              .toUpperCase()}
                          </strong>

                          <p>
                            {
                              item.location ||
                              "Location unavailable"
                            }
                          </p>

                          <small>
                            {
                              item.assignedTeam ||
                              "Response Team"
                            }
                            {" · Completed "}
                            {
                              item.resolvedAt
                                ? formatDateTime(
                                    item.resolvedAt
                                  )
                                : item.rescuedAt
                                ? formatDateTime(
                                    item.rescuedAt
                                  )
                                : "—"
                            }
                          </small>

                        </div>

                        <span className="completed-badge">
                          ✓ Completed
                        </span>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

            {/* IMPACT */}

            <div className="profile-section">

              <div className="profile-section-heading">

                <div>

                  <span className="section-label">
                    RESQNET IMPACT
                  </span>

                  <h3>
                    Your contribution
                  </h3>

                </div>

              </div>

              <div className="impact-grid">

                <div className="impact-card">

                  <strong>
                    {
                      history.length
                    }
                  </strong>

                  <span>
                    Incidents completed
                  </span>

                </div>

                <div className="impact-card">

                  <strong>
                    {history.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        Number(
                          item.people ||
                            0
                        ),
                      0
                    )}
                  </strong>

                  <span>
                    People assisted
                  </span>

                </div>

                <div className="impact-card">

                  <strong>
                    {
                      history.length
                    }
                  </strong>

                  <span>
                    Deployments
                  </span>

                </div>

                <div className="impact-card">

                  <strong>
                    {history.length >
                    0
                      ? "Active"
                      : "New"}
                  </strong>

                  <span>
                    Response record
                  </span>

                </div>

              </div>

            </div>

            {/* REWARDS */}

            <div className="profile-section">

              <div className="profile-section-heading">

                <div>

                  <span className="section-label">
                    RECOGNITION & REWARDS
                  </span>

                  <h3>
                    Your achievements
                  </h3>

                </div>

              </div>

              <div className="rewards-grid">

                <div className="reward-card">

                  <div className="reward-icon">
                    🏅
                  </div>

                  <div>

                    <strong>
                      Verified Responder
                    </strong>

                    <small>
                      ResQNet responder
                      verification
                    </small>

                  </div>

                </div>

                {history.length >=
                  3 && (

                  <div className="reward-card">

                    <div className="reward-icon">
                      🎖️
                    </div>

                    <div>

                      <strong>
                        Disaster Response
                        — Level 1
                      </strong>

                      <small>
                        Recognition for
                        completed response
                        operations
                      </small>

                    </div>

                  </div>

                )}

                {history.length >=
                  5 && (

                  <div className="reward-card">

                    <div className="reward-icon">
                      🏆
                    </div>

                    <div>

                      <strong>
                        Outstanding Response
                        Award
                      </strong>

                      <small>
                        Recognition for
                        sustained emergency
                        response
                      </small>

                    </div>

                  </div>

                )}

              </div>

            </div>

            <div className="profile-modal-footer">

              <div className="profile-security-note">

                <span>
                  🔐
                </span>

                <p>
                  Your responder records
                  are securely maintained
                  by ResQNet.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProfile(
                    false
                  )
                }
              >
                Close profile
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ResponderDashboard;