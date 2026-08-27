import {
  useEffect,
  useRef,
  useState,
} from "react";

import Navbar from "./Navbar";
import "./Citizen.css";

const API_URL = "https://res-q-net-j6pb-5nuqnak23-syeda-rida-s-projects1.vercel.app/api";

const CITIZEN_EMERGENCY_STORAGE_KEY =
  "resqnetCitizenEmergencyId";

const CITIZEN_REQUEST_STORAGE_KEY =
  "resqnetCitizenRequestId";

/* =========================================================
   CITIZEN DASHBOARD
========================================================= */

function Citizen() {
  const [step, setStep] = useState(1);

  const [location, setLocation] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [responseSent, setResponseSent] =
    useState(false);

  const [sosOpen, setSosOpen] =
    useState(false);

  const [photo, setPhoto] =
    useState(null);

  const [voiceText, setVoiceText] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [requestId, setRequestId] =
    useState("");

  /*
   * REAL MongoDB Emergency _id
   */
  const [backendEmergencyId, setBackendEmergencyId] =
    useState("");

  const [responseDetails, setResponseDetails] =
    useState(null);

  const [backendError, setBackendError] =
    useState("");

  const reportPanelRef =
    useRef(null);

  /* =========================================================
     REAL RESPONSE STATE
  ========================================================= */

  const [responseStage, setResponseStage] =
    useState(1);

  const [showUpdateModal, setShowUpdateModal] =
    useState(false);

  const [showChat, setShowChat] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [showArrivalNotification, setShowArrivalNotification] =
    useState(false);

  const [requestCancelled, setRequestCancelled] =
    useState(false);

  const [safetyConfirmed, setSafetyConfirmed] =
    useState(false);

  const [messageText, setMessageText] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        id: 1,
        sender: "team",
        text:
          "Your emergency has been received by ResQNet. A response team will be assigned by the command centre.",
        time: "Now",
      },
    ]);

  const [cancelReason, setCancelReason] =
    useState("");

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  const [updateForm, setUpdateForm] =
    useState({
      name: "",
      phone: "",
      email: "",
      emergencyType: "",
      description: "",
      people: 1,
      adults: 1,
      children: 0,
      elderly: 0,
      specialNeeds: [],
      bloodGroup: "",
      medicalInfo: "",
      contactName: "",
      contactPhone: "",
      currentLocation: "",
    });

  /* =========================================================
     ORIGINAL FORM
  ========================================================= */

  const [form, setForm] =
    useState({
      name: "",
      phone: "",
      email: "",
      emergencyType: "",
      description: "",
      people: 1,
      adults: 1,
      children: 0,
      elderly: 0,
      specialNeeds: [],
      bloodGroup: "",
      medicalInfo: "",
      contactName: "",
      contactPhone: "",
    });

  const updateMainForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleSpecialNeed = (
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      specialNeeds:
        previous.specialNeeds.includes(
          value
        )
          ? previous.specialNeeds.filter(
              (item) =>
                item !== value
            )
          : [
              ...previous.specialNeeds,
              value,
            ],
    }));
  };

  /* =========================================================
     LOCATION
  ========================================================= */

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocation(
        "Location services are not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude.toFixed(
            5
          );

        const lng =
          position.coords.longitude.toFixed(
            5
          );

        setLocation(
          `${lat}° N, ${lng}° E`
        );

        setLocationLoading(false);
      },
      () => {
        setLocation(
          "Unable to access location. Please enter it manually."
        );

        setLocationLoading(false);
      }
    );
  };

  /* =========================================================
     VOICE
  ========================================================= */

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (
      event
    ) => {
      const text =
        event.results[0][0]
          .transcript;

      setVoiceText(text);

      setForm((previous) => ({
        ...previous,

        description:
          previous.description
            ? `${previous.description} ${text}`
            : text,
      }));

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  /* =========================================================
     PHOTO
  ========================================================= */

  const handlePhoto = (
    event
  ) => {
    const file =
      event.target.files[0];

    if (file) {
      setPhoto(file.name);
    }
  };

  /* =========================================================
     SCROLL TO WIZARD
  ========================================================= */

  const scrollToWizard = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (
          reportPanelRef.current
        ) {
          reportPanelRef.current.scrollIntoView(
            {
              behavior: "smooth",
              block: "start",
            }
          );
        }
      });
    });
  };

  /* =========================================================
     8 STEP NAVIGATION
  ========================================================= */

  const nextStep = () => {
    if (
      step === 1 &&
      (
        !form.name.trim() ||
        !form.phone.trim()
      )
    ) {
      alert(
        "Please enter your name and mobile number."
      );

      return;
    }

    if (
      step === 2 &&
      !form.emergencyType
    ) {
      alert(
        "Please select what happened."
      );

      return;
    }

    if (
      step === 3 &&
      !location
    ) {
      alert(
        "Please share or enter your location."
      );

      return;
    }

    if (step < 8) {
      setStep(
        (previous) =>
          previous + 1
      );

      scrollToWizard();
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(
        (previous) =>
          previous - 1
      );

      scrollToWizard();
    }
  };

  /* =========================================================
     BACKEND STATUS → CITIZEN STAGE
  ========================================================= */

  const getStageFromBackendStatus =
    (status) => {
      switch (status) {
        case "Pending":
          return 1;

        case "Dispatched":
          return 2;

        case "Accepted":
          return 3;

        case "Started":
        case "En Route":
          return 4;

        case "Arriving":
          return 5;

        case "Arrived":
          return 6;

        case "Rescued":
        case "Resolved":
          return 7;

        case "Cancelled":
          return 8;

        default:
          return 1;
      }
    };

  /* =========================================================
     CREATE REAL EMERGENCY
     
     IMPORTANT:
     No fake team assignment is created here.
     Admin decides the team.
  ========================================================= */

  const createResponse =
    async (
      isSOS = false
    ) => {
      setBackendError("");

      try {
        const backendResponse =
          await fetch(
            `${API_URL}/emergency`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  ...form,

                  location:
                    location,

                  currentLocation:
                    location,

                  photo,

                  isSOS:
                    Boolean(isSOS),
                }),
            }
          );

        const backendData =
          await backendResponse.json();

        console.log(
          "ResQNet backend response:",
          backendData
        );

        if (
          !backendResponse.ok ||
          !backendData.success
        ) {
          throw new Error(
            backendData.message ||
              "Emergency could not be submitted."
          );
        }

        const savedEmergency =
          backendData.data;

        const mongoId =
          savedEmergency?._id;

        if (!mongoId) {
          throw new Error(
            "Emergency was saved, but no emergency ID was returned."
          );
        }

        /*
         * SAVE THE REAL MONGODB ID
         *
         * This is the important part that allows
         * Citizen page restoration after navigation.
         */
        setBackendEmergencyId(
          mongoId
        );

        localStorage.setItem(
          CITIZEN_EMERGENCY_STORAGE_KEY,
          String(mongoId)
        );

        /*
         * Citizen-friendly request ID
         */
        const generatedRequestId =
          `RQ-${Math.floor(
            10000 +
              Math.random() *
                90000
          )}`;

        setRequestId(
          generatedRequestId
        );

        localStorage.setItem(
          CITIZEN_REQUEST_STORAGE_KEY,
          generatedRequestId
        );

        /*
         * NO TEAM IS ASSIGNED HERE.
         * Admin chooses the appropriate team.
         */
        const initialResponse =
          {
            id:
              generatedRequestId,

            backendId:
              mongoId,

            team:
              savedEmergency.assignedTeam ||
              "Waiting for command centre",

            teamCode:
              "—",

            eta:
              savedEmergency.eta
                ? `${savedEmergency.eta} min`
                : "Awaiting assignment",

            arrival:
              "A response team will be assigned by the command centre.",

            status:
              savedEmergency.status ||
              "Pending",

            hospital:
              "City Emergency Hospital",

            hospitalDistance:
              "1.8 km",

            shelter:
              "ResQNet Safe Shelter – Zone 4",

            shelterDistance:
              "3.1 km",

            responderContact:
              "Response Center",

            priority:
              isSOS
                ? "CRITICAL"
                : "HIGH",

            location:
              location ||
              savedEmergency.location ||
              "Location shared with responders",

            allocatedResources:
              savedEmergency.allocatedResources ||
              [],
          };

        setResponseDetails(
          initialResponse
        );

        setResponseSent(true);

        /*
         * Show the response details immediately
         * after the first submission.
         */
        setSubmitted(true);

        setResponseStage(
          getStageFromBackendStatus(
            savedEmergency.status
          )
        );

        setRequestCancelled(
          savedEmergency.status ===
          "Cancelled"
        );

        setSafetyConfirmed(
          false
        );

        setShowArrivalNotification(
          false
        );

        /*
         * Copy submitted data into
         * the update form.
         */
        setUpdateForm({
          ...form,
          currentLocation:
            location,
        });

        /*
         * Tell citizen what is happening.
         */
        setMessages([
          {
            id:
              Date.now(),

            sender:
              "team",

            text:
              isSOS
                ? "Your SOS has been received as a critical emergency. The command centre will assign the appropriate response team."
                : "Your emergency has been received. The command centre will assign the most suitable response team.",

            time:
              "Now",
          },
        ]);
      } catch (error) {
        console.error(
          "ResQNet emergency submission failed:",
          error
        );

        setBackendError(
          error.message ||
            "Unable to send emergency request."
        );

        alert(
          error.message ||
            "Unable to send emergency request. Please try again."
        );
      }
    };

  const submitEmergency = () => {
    createResponse(false);
  };

  const activateSOS = () => {
    setSosOpen(false);

    createResponse(true);
  };

  /* =========================================================
     RESTORE PREVIOUS CITIZEN EMERGENCY
     
     THIS FIXES:
     
     Citizen submits
        ↓
     Admin dispatches
        ↓
     Citizen page is left
        ↓
     Citizen page is opened again
        ↓
     Emergency comes back from MongoDB
  ========================================================= */

  useEffect(() => {
    const savedEmergencyId =
      localStorage.getItem(
        CITIZEN_EMERGENCY_STORAGE_KEY
      );

    const savedRequestId =
      localStorage.getItem(
        CITIZEN_REQUEST_STORAGE_KEY
      );

    if (!savedEmergencyId) {
      return;
    }

    let mounted = true;

    const restoreEmergency =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/emergency/${savedEmergencyId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success ||
            !result.data
          ) {
            localStorage.removeItem(
              CITIZEN_EMERGENCY_STORAGE_KEY
            );

            localStorage.removeItem(
              CITIZEN_REQUEST_STORAGE_KEY
            );

            return;
          }

          if (!mounted) {
            return;
          }

          const emergency =
            result.data;

          /*
           * Restore actual backend ID.
           */
          setBackendEmergencyId(
            emergency._id
          );

          /*
           * Restore request ID.
           */
          const restoredRequestId =
            savedRequestId ||
            `RQ-${String(
              emergency._id
            )
              .slice(-6)
              .toUpperCase()}`;

          setRequestId(
            restoredRequestId
          );

          /*
           * Restore citizen form data.
           */
          setForm({
            name:
              emergency.name ||
              "",
            phone:
              emergency.phone ||
              "",
            email:
              emergency.email ||
              "",
            emergencyType:
              emergency.emergencyType ||
              "",
            description:
              emergency.description ||
              "",
            people:
              Number(
                emergency.people
              ) || 1,
            adults:
              Number(
                emergency.adults
              ) || 0,
            children:
              Number(
                emergency.children
              ) || 0,
            elderly:
              Number(
                emergency.elderly
              ) || 0,
            specialNeeds:
              Array.isArray(
                emergency.specialNeeds
              )
                ? emergency.specialNeeds
                : [],
            bloodGroup:
              emergency.bloodGroup ||
              "",
            medicalInfo:
              emergency.medicalInfo ||
              "",
            contactName:
              emergency.contactName ||
              "",
            contactPhone:
              emergency.contactPhone ||
              "",
          });

          /*
           * Restore location.
           */
          setLocation(
            emergency.location ||
              ""
          );

          /*
           * Restore photo name if backend
           * contains one.
           */
          setPhoto(
            emergency.photo ||
              null
          );

          /*
           * Restore response details.
           */
          setResponseDetails({
            id:
              restoredRequestId,

            backendId:
              emergency._id,

            team:
              emergency.assignedTeam ||
              "Waiting for command centre",

            teamCode:
              emergency.teamCode ||
              "—",

            eta:
              emergency.eta
                ? `${emergency.eta} min`
                : emergency.assignedTeam
                ? "Assigned"
                : "Awaiting assignment",

            arrival:
              emergency.assignedTeam
                ? "Response team has been assigned by the command centre."
                : "A response team will be assigned by the command centre.",

            status:
              emergency.status ||
              "Pending",

            hospital:
              "City Emergency Hospital",

            hospitalDistance:
              "1.8 km",

            shelter:
              "ResQNet Safe Shelter – Zone 4",

            shelterDistance:
              "3.1 km",

            responderContact:
              "Response Center",

            priority:
              emergency.isSOS
                ? "CRITICAL"
                : "HIGH",

            location:
              emergency.location ||
              "Location unavailable",

            allocatedResources:
              Array.isArray(
                emergency.allocatedResources
              )
                ? emergency.allocatedResources
                : [],
          });

          /*
           * Restore status stage.
           */
          setResponseStage(
            getStageFromBackendStatus(
              emergency.status
            )
          );

          setRequestCancelled(
            emergency.status ===
            "Cancelled"
          );

          /*
           * Keep sidebar tracking visible,
           * but don't reopen the large popup
           * automatically when returning.
           */
          setResponseSent(true);
          setSubmitted(false);

          setSafetyConfirmed(
            emergency.status ===
              "Rescued" ||
            emergency.status ===
              "Resolved"
          );

          setUpdateForm({
            name:
              emergency.name ||
              "",
            phone:
              emergency.phone ||
              "",
            email:
              emergency.email ||
              "",
            emergencyType:
              emergency.emergencyType ||
              "",
            description:
              emergency.description ||
              "",
            people:
              Number(
                emergency.people
              ) || 1,
            adults:
              Number(
                emergency.adults
              ) || 0,
            children:
              Number(
                emergency.children
              ) || 0,
            elderly:
              Number(
                emergency.elderly
              ) || 0,
            specialNeeds:
              Array.isArray(
                emergency.specialNeeds
              )
                ? emergency.specialNeeds
                : [],
            bloodGroup:
              emergency.bloodGroup ||
              "",
            medicalInfo:
              emergency.medicalInfo ||
              "",
            contactName:
              emergency.contactName ||
              "",
            contactPhone:
              emergency.contactPhone ||
              "",
            currentLocation:
              emergency.location ||
              "",
          });

          /*
           * Arrival popup only if the
           * backend is actually Arrived.
           */
          if (
            emergency.status ===
            "Arrived"
          ) {
            setShowArrivalNotification(
              true
            );
          } else {
            setShowArrivalNotification(
              false
            );
          }
        } catch (error) {
          console.error(
            "Failed to restore citizen emergency:",
            error
          );
        }
      };

    restoreEmergency();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     REAL BACKEND STATUS POLLING
     
     MongoDB remains the source of truth.
  ========================================================= */

  useEffect(() => {
    if (
      !backendEmergencyId ||
      !responseSent
    ) {
      return;
    }

    let cancelled = false;

    const fetchEmergencyStatus =
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/emergency/${backendEmergencyId}`
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            return;
          }

          if (
            cancelled ||
            !result.data
          ) {
            return;
          }

          const emergency =
            result.data;

          const newStage =
            getStageFromBackendStatus(
              emergency.status
            );

          setResponseStage(
            newStage
          );

          setResponseDetails(
            (previous) => ({
              ...previous,

              id:
                requestId ||
                previous?.id ||
                `RQ-${String(
                  emergency._id
                )
                  .slice(-6)
                  .toUpperCase()}`,

              backendId:
                emergency._id,

              team:
                emergency.assignedTeam ||
                "Waiting for command centre",

              teamCode:
                emergency.teamCode ||
                "—",

              eta:
                emergency.eta
                  ? `${emergency.eta} min`
                  : emergency.assignedTeam
                  ? "Assigned"
                  : "Awaiting assignment",

              arrival:
                emergency.assignedTeam
                  ? "Response team has been assigned by the command centre."
                  : "A response team will be assigned by the command centre.",

              status:
                emergency.status,

              priority:
                emergency.isSOS
                  ? "CRITICAL"
                  : "HIGH",

              location:
                emergency.location ||
                previous?.location ||
                location,

              allocatedResources:
                Array.isArray(
                  emergency.allocatedResources
                )
                  ? emergency.allocatedResources
                  : [],
            })
          );

          /*
           * Cancelled
           */
          if (
            emergency.status ===
            "Cancelled"
          ) {
            setRequestCancelled(
              true
            );

            setShowArrivalNotification(
              false
            );
          }

          /*
           * Arrived
           */
          if (
            emergency.status ===
            "Arrived"
          ) {
            setShowArrivalNotification(
              true
            );
          }

          /*
           * Rescued / Resolved
           */
          if (
            emergency.status ===
              "Rescued" ||
            emergency.status ===
              "Resolved"
          ) {
            setShowArrivalNotification(
              false
            );

            setSafetyConfirmed(
              true
            );
          }
        } catch (error) {
          console.error(
            "Citizen status polling error:",
            error
          );
        }
      };

    /*
     * Fetch immediately.
     */
    fetchEmergencyStatus();

    /*
     * Continue checking every 3 seconds.
     */
    const interval =
      setInterval(
        fetchEmergencyStatus,
        3000
      );

    return () => {
      cancelled = true;

      clearInterval(
        interval
      );
    };
  }, [
    backendEmergencyId,
    responseSent,
  ]);

  /* =========================================================
     RESPONSE STATUS TEXT
  ========================================================= */

  const getResponseStatus =
    () => {
      if (
        !responseDetails
      ) {
        return "Emergency received";
      }

      switch (
        responseDetails.status
      ) {
        case "Pending":
          return "Waiting for team assignment";

        case "Dispatched":
          return "Response team assigned";

        case "Accepted":
          return "Response team accepted the assignment";

        case "Started":
          return "Response team has started the operation";

        case "En Route":
          return "Team is travelling to your location";

        case "Arriving":
          return "Response team is arriving";

        case "Arrived":
          return "Rescue team has arrived";

        case "Rescued":
        case "Resolved":
          return "Emergency response completed";

        case "Cancelled":
          return "Emergency request cancelled";

        default:
          return "Emergency received";
      }
    };

  /* =========================================================
     ETA / RESPONSE STATUS
  ========================================================= */

  const getEta = () => {
    if (
      !responseDetails
    ) {
      return "Awaiting assignment";
    }

    switch (
      responseDetails.status
    ) {
      case "Pending":
        return "Awaiting assignment";

      case "Dispatched":
        return (
          responseDetails.eta ||
          "Assigned"
        );

      case "Accepted":
        return "Accepted";

      case "Started":
        return "En route";

      case "En Route":
        return "En route";

      case "Arriving":
        return "Arriving";

      case "Arrived":
        return "ARRIVED";

      case "Rescued":
      case "Resolved":
        return "COMPLETED";

      case "Cancelled":
        return "CLOSED";

      default:
        return "Awaiting assignment";
    }
  };

  /* =========================================================
     UPDATE REQUEST
  ========================================================= */

  const openUpdateModal =
    () => {
      setUpdateForm({
        ...form,

        currentLocation:
          location,
      });

      setShowUpdateModal(
        true
      );
    };

  const handleUpdateField =
    (
      field,
      value
    ) => {
      setUpdateForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  const toggleUpdateSpecialNeed =
    (
      value
    ) => {
      setUpdateForm((previous) => ({
        ...previous,

        specialNeeds:
          previous.specialNeeds.includes(
            value
          )
            ? previous.specialNeeds.filter(
                (item) =>
                  item !== value
              )
            : [
                ...previous.specialNeeds,
                value,
              ],
      }));
    };

  /*
   * NOTE:
   * Keeping your existing update UI behaviour.
   * Backend synchronization for update fields
   * can be added separately.
   */
  const saveUpdatedRequest =
    () => {
      setForm((previous) => ({
        ...previous,

        name:
          updateForm.name,

        phone:
          updateForm.phone,

        email:
          updateForm.email,

        emergencyType:
          updateForm.emergencyType,

        description:
          updateForm.description,

        people:
          updateForm.people,

        adults:
          updateForm.adults,

        children:
          updateForm.children,

        elderly:
          updateForm.elderly,

        specialNeeds:
          updateForm.specialNeeds,

        bloodGroup:
          updateForm.bloodGroup,

        medicalInfo:
          updateForm.medicalInfo,

        contactName:
          updateForm.contactName,

        contactPhone:
          updateForm.contactPhone,
      }));

      setLocation(
        updateForm.currentLocation
      );

      setResponseDetails(
        (previous) => ({
          ...previous,

          location:
            updateForm.currentLocation ||
            previous?.location,
        })
      );

      setShowUpdateModal(
        false
      );

      setMessages(
        (previous) => [
          ...previous,

          {
            id:
              Date.now(),

            sender:
              "team",

            text:
              "Your emergency details have been updated and shared with the response team.",

            time:
              "Now",
          },
        ]
      );
    };

  /* =========================================================
     CHAT
  ========================================================= */

  const sendMessage = (
    presetMessage = null
  ) => {
    const finalMessage =
      presetMessage ||
      messageText.trim();

    if (!finalMessage) {
      return;
    }

    const newMessage = {
      id:
        Date.now(),

      sender:
        "citizen",

      text:
        finalMessage,

      time:
        "Now",
    };

    setMessages(
      (previous) => [
        ...previous,
        newMessage,
      ]
    );

    setMessageText("");

    /*
     * Existing simulated response.
     */
    setTimeout(() => {
      setMessages(
        (previous) => [
          ...previous,

          {
            id:
              Date.now() + 1,

            sender:
              "team",

            text:
              "Message received. The response team has been notified.",

            time:
              "Now",
          },
        ]
      );
    }, 1200);
  };

  /* =========================================================
     CANCEL REQUEST
  ========================================================= */

  const cancelRequest = () => {
    if (!cancelReason) {
      alert(
        "Please select a reason for cancelling the request."
      );

      return;
    }

    setRequestCancelled(
      true
    );

    setShowCancelModal(
      false
    );

    setResponseDetails(
      (previous) => ({
        ...previous,
        status:
          "Cancelled",
      })
    );

    setResponseStage(8);

    setMessages(
      (previous) => [
        ...previous,

        {
          id:
            Date.now(),

          sender:
            "system",

          text:
            "Your emergency request has been cancelled. The response team has been notified.",

          time:
            "Now",
        },
      ]
    );
  };

  /* =========================================================
     SAFETY CONFIRMATION
  ========================================================= */

  const confirmSafe = (
    safe
  ) => {
    if (safe) {
      setSafetyConfirmed(
        true
      );

      setShowArrivalNotification(
        false
      );

      setResponseDetails(
        (previous) => ({
          ...previous,

          status:
            "Rescued",
        })
      );

      setResponseStage(7);
    } else {
      setShowArrivalNotification(
        false
      );

      setMessages(
        (previous) => [
          ...previous,

          {
            id:
              Date.now(),

            sender:
              "team",

            text:
              "Additional assistance has been requested. Please remain in a safe location.",

            time:
              "Now",
          },
        ]
      );
    }
  };

  /* =========================================================
     EMERGENCY TYPES
  ========================================================= */

  const emergencyTypes = [
    {
      icon:
        "🌊",
      name:
        "Flood",
    },

    {
      icon:
        "🔥",
      name:
        "Fire",
    },

    {
      icon:
        "🌍",
      name:
        "Earthquake",
    },

    {
      icon:
        "⛰️",
      name:
        "Landslide",
    },

    {
      icon:
        "🌀",
      name:
        "Cyclone",
    },

    {
      icon:
        "🚨",
      name:
        "Other",
    },
  ];

  const specialNeeds = [
    {
      icon:
        "♿",
      name:
        "Disability",
    },

    {
      icon:
        "👶",
      name:
        "Infant / Child",
    },

    {
      icon:
        "👵",
      name:
        "Elderly",
    },

    {
      icon:
        "🤰",
      name:
        "Pregnant",
    },

    {
      icon:
        "🩺",
      name:
        "Medical help",
    },

    {
      icon:
        "💊",
      name:
        "Medication",
    },
  ];

  return (
    <div className="citizen-page">

      <Navbar />

      {/* =====================================================
          STATUS BAR
      ===================================================== */}

      <div className="citizen-status-bar">

        <div>
          <span className="status-live-dot"></span>

          ResQNet Emergency Network is live
        </div>

        <span>
          Your information is shared only with authorized responders.
        </span>

      </div>

      <main className="citizen-main">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="citizen-hero">

          <div className="hero-orbit orbit-one"></div>
          <div className="hero-orbit orbit-two"></div>

          <div className="hero-copy">

            <div className="hero-badge">

              <span>
                ●
              </span>

              CITIZEN RESPONSE PORTAL

            </div>

            <h2>

              When every second
              <span>
                {" "}
                matters.
              </span>

            </h2>

            <p>
              Tell ResQNet what is happening. We will help connect
              your emergency with the right response team.
            </p>

            <div className="hero-trust">

              <span>
                ✓ Live location
              </span>

              <span>
                ✓ Priority routing
              </span>

              <span>
                ✓ Secure reporting
              </span>

              <span>
                ✓ Live response tracking
              </span>

            </div>

          </div>

          {/* =================================================
              SOS
          ================================================= */}

          <div className="hero-sos-card">

            <div className="sos-card-alert">

              <span className="sos-alert-dot"></span>

              IMMEDIATE ASSISTANCE

            </div>

            <div className="sos-card-label">
              NEED IMMEDIATE HELP?
            </div>

            <div className="sos-ring">

              <div>

                <span>
                  SOS
                </span>

                <small>
                  Emergency
                </small>

              </div>

            </div>

            <button
              type="button"
              className="hero-sos-button"
              onClick={() =>
                setSosOpen(true)
              }
            >

              <span>
                🚨
              </span>

              Activate Emergency SOS

            </button>

            <p>
              Use SOS only when immediate emergency
              assistance is required.
            </p>

          </div>

        </section>

        {/* ===================================================
            BACKEND ERROR
        =================================================== */}

        {backendError && (

          <div
            style={{
              marginTop:
                "18px",

              padding:
                "13px 16px",

              borderRadius:
                "11px",

              border:
                "1px solid #efc3c0",

              background:
                "#fff3f2",

              color:
                "#a63f39",

              fontSize:
                "11px",
            }}
          >
            {backendError}
          </div>

        )}

        {/* ===================================================
            ACTIVE RESPONSE
        =================================================== */}

        {responseSent &&
          responseDetails &&
          !requestCancelled && (

          <section className="active-response-banner">

            <div className="active-response-left">

              <div className="active-response-icon">
                🚑
              </div>

              <div>

                <span>
                  {responseDetails.status ===
                  "Pending"
                    ? "REQUEST RECEIVED"
                    : "ACTIVE EMERGENCY RESPONSE"}
                </span>

                <strong>
                  {
                    getResponseStatus()
                  }
                </strong>

                <small>
                  Request{" "}
                  {responseDetails.id}
                  {" • "}
                  {
                    responseDetails.team
                  }
                </small>

              </div>

            </div>

            <div className="active-response-eta">

              <span>
                RESPONSE STATUS
              </span>

              <strong>
                {getEta()}
              </strong>

              <small>
                {responseDetails.status ===
                "Pending"
                  ? "Waiting for command centre assignment"
                  : responseDetails.status ===
                    "Arrived"
                  ? "Team has reached your location"
                  : "Response is being coordinated"}
              </small>

            </div>

            <button
              type="button"
              className="active-response-button"
              onClick={() =>
                setSubmitted(true)
              }
            >
              Track Response →
            </button>

          </section>
        )}

        {/* ===================================================
            CANCELLED BANNER
        =================================================== */}

        {requestCancelled && (

          <section className="active-response-banner cancelled-response">

            <div className="active-response-left">

              <div className="active-response-icon">
                ✓
              </div>

              <div>

                <span>
                  EMERGENCY REQUEST
                </span>

                <strong>
                  Request Cancelled
                </strong>

                <small>
                  Request{" "}
                  {requestId}
                </small>

              </div>

            </div>

            <div className="active-response-eta">

              <span>
                STATUS
              </span>

              <strong>
                CLOSED
              </strong>

              <small>
                Response team has been notified
              </small>

            </div>

          </section>

        )}

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <section className="progress-section">

          <div className="progress-top">

            <div>

              <span>
                EMERGENCY REPORT
              </span>

              <strong>
                Step {step} of 8
              </strong>

            </div>

            <small>

              {step === 1 &&
                "Let's start with you"}

              {step === 2 &&
                "Tell us what happened"}

              {step === 3 &&
                "Help us locate you"}

              {step === 4 &&
                "Tell us who needs help"}

              {step === 5 &&
                "Any special assistance?"}

              {step === 6 &&
                "Add useful information"}

              {step === 7 &&
                "Who should we notify?"}

              {step === 8 &&
                "Review before sending"}

            </small>

          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width:
                  `${(step / 8) * 100}%`,
              }}
            ></div>

          </div>

          <div className="step-dots">

            {[1,2,3,4,5,6,7,8].map(
              (item) => (

              <span
                key={item}
                className={
                  item <= step
                    ? "step-dot completed"
                    : "step-dot"
                }
              >
                {item < step
                  ? "✓"
                  : item}
              </span>

            ))}

          </div>

        </section>

        {/* ===================================================
            WORKSPACE
        =================================================== */}

        <section className="citizen-workspace">

          <div
            className="report-panel"
            ref={reportPanelRef}
          >

            {/* =================================================
                STEP 1
            ================================================= */}

            {step === 1 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    01
                  </div>

                  <div>

                    <span>
                      YOUR DETAILS
                    </span>

                    <h3>
                      Who are we helping?
                    </h3>

                    <p>
                      Enter your basic details so responders can
                      contact you.
                    </p>

                  </div>

                </div>

                <div className="form-grid">

                  <div className="field full">

                    <label>
                      Full name <b>*</b>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={
                        form.name
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "name",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="field">

                    <label>
                      Mobile number <b>*</b>
                    </label>

                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={
                        form.phone
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "phone",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="field">

                    <label>
                      Email{" "}
                      <span>
                        Optional
                      </span>
                    </label>

                    <input
                      type="email"
                      placeholder="For updates only"
                      value={
                        form.email
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "email",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="privacy-note">

                  <span>
                    🔐
                  </span>

                  <div>

                    <strong>
                      Your information stays protected
                    </strong>

                    <p>
                      Contact details are used only for emergency
                      coordination and updates.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 2
            ================================================= */}

            {step === 2 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    02
                  </div>

                  <div>

                    <span>
                      INCIDENT TYPE
                    </span>

                    <h3>
                      What happened?
                    </h3>

                    <p>
                      Select the situation that best describes
                      your emergency.
                    </p>

                  </div>

                </div>

                <div className="emergency-grid">

                  {emergencyTypes.map(
                    (item) => (

                    <button
                      key={
                        item.name
                      }
                      type="button"
                      className={
                        form.emergencyType ===
                        item.name
                          ? "emergency-card selected"
                          : "emergency-card"
                      }
                      onClick={() =>
                        updateMainForm(
                          "emergencyType",
                          item.name
                        )
                      }
                    >

                      <span>
                        {item.icon}
                      </span>

                      <strong>
                        {item.name}
                      </strong>

                      {form.emergencyType ===
                        item.name && (

                        <b>
                          ✓
                        </b>

                      )}

                    </button>

                  ))}

                </div>

                <div className="field">

                  <label>
                    Briefly describe what is happening
                  </label>

                  <textarea
                    rows="5"
                    placeholder="Example: Water has entered our house and three people are trapped inside..."
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateMainForm(
                        "description",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}

            {/* =================================================
                STEP 3
            ================================================= */}

            {step === 3 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    03
                  </div>

                  <div>

                    <span>
                      YOUR LOCATION
                    </span>

                    <h3>
                      Where are you right now?
                    </h3>

                    <p>
                      Your live location helps responders reach
                      you faster.
                    </p>

                  </div>

                </div>

                <div className="location-card">

                  <div className="location-visual">

                    <div className="location-pulse">
                      📍
                    </div>

                  </div>

                  <div className="location-content">

                    <strong>
                      Share your live location
                    </strong>

                    <p>
                      ResQNet will use your device GPS to
                      identify your current position.
                    </p>

                    {location && (

                      <div className="location-success">
                        ✓{" "}
                        {location}
                      </div>

                    )}

                    <button
                      type="button"
                      className="location-main-btn"
                      onClick={
                        getLocation
                      }
                    >
                      {locationLoading
                        ? "Locating you..."
                        : location
                        ? "↻ Update my location"
                        : "📍 Use my live location"}
                    </button>

                  </div>

                </div>

                <div className="manual-location">

                  <div className="manual-label">
                    Or enter your location manually
                  </div>

                  <input
                    type="text"
                    placeholder="Area, landmark, street or village"
                    value={
                      location.startsWith(
                        "Unable"
                      )
                        ? ""
                        : location
                    }
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>
            )}

            {/* =================================================
                STEP 4
            ================================================= */}

            {step === 4 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    04
                  </div>

                  <div>

                    <span>
                      PEOPLE AT RISK
                    </span>

                    <h3>
                      Who needs help?
                    </h3>

                    <p>
                      This helps the response center understand
                      the scale of the emergency.
                    </p>

                  </div>

                </div>

                <div className="people-counter">

                  <div>

                    <span>
                      Total people needing help
                    </span>

                    <small>
                      Include yourself
                    </small>

                  </div>

                  <div className="counter">

                    <button
                      type="button"
                      onClick={() =>
                        updateMainForm(
                          "people",
                          Math.max(
                            1,
                            Number(
                              form.people
                            ) - 1
                          )
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {form.people}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        updateMainForm(
                          "people",
                          Number(
                            form.people
                          ) + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

                <div className="people-breakdown">

                  <div>

                    <span>
                      👨 Adults
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.adults
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "adults",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <span>
                      👶 Children
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.children
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "children",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <span>
                      👵 Elderly
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.elderly
                      }
                      onChange={(e) =>
                        updateMainForm(
                          "elderly",
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 5
            ================================================= */}

            {step === 5 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    05
                  </div>

                  <div>

                    <span>
                      SPECIAL ASSISTANCE
                    </span>

                    <h3>
                      Does anyone need extra help?
                    </h3>

                    <p>
                      Select anything responders should know.
                      You can skip this step.
                    </p>

                  </div>

                </div>

                <div className="special-grid">

                  {specialNeeds.map(
                    (item) => (

                    <button
                      key={
                        item.name
                      }
                      type="button"
                      className={
                        form.specialNeeds.includes(
                          item.name
                        )
                          ? "special-card selected"
                          : "special-card"
                      }
                      onClick={() =>
                        toggleSpecialNeed(
                          item.name
                        )
                      }
                    >

                      <span>
                        {item.icon}
                      </span>

                      <strong>
                        {item.name}
                      </strong>

                      {form.specialNeeds.includes(
                        item.name
                      ) && (

                        <b>
                          ✓
                        </b>

                      )}

                    </button>

                  ))}

                </div>

                <div className="medical-box">

                  <div className="medical-heading">

                    <span>
                      🩺
                    </span>

                    <div>

                      <strong>
                        Medical snapshot
                      </strong>

                      <small>
                        Optional
                      </small>

                    </div>

                  </div>

                  <div className="form-grid">

                    <div className="field">

                      <label>
                        Blood group
                      </label>

                      <select
                        value={
                          form.bloodGroup
                        }
                        onChange={(e) =>
                          updateMainForm(
                            "bloodGroup",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        <option>
                          A+
                        </option>

                        <option>
                          A-
                        </option>

                        <option>
                          B+
                        </option>

                        <option>
                          B-
                        </option>

                        <option>
                          AB+
                        </option>

                        <option>
                          AB-
                        </option>

                        <option>
                          O+
                        </option>

                        <option>
                          O-
                        </option>

                      </select>

                    </div>

                    <div className="field">

                      <label>
                        Medical information
                      </label>

                      <input
                        type="text"
                        placeholder="Allergy / medication / condition"
                        value={
                          form.medicalInfo
                        }
                        onChange={(e) =>
                          updateMainForm(
                            "medicalInfo",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 6
            ================================================= */}

            {step === 6 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    06
                  </div>

                  <div>

                    <span>
                      ADDITIONAL EVIDENCE
                    </span>

                    <h3>
                      Help responders understand faster
                    </h3>

                    <p>
                      Everything here is optional.
                    </p>

                  </div>

                </div>

                <div className="evidence-grid">

                  <label className="evidence-card">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handlePhoto
                      }
                    />

                    <span className="evidence-icon">
                      📷
                    </span>

                    <strong>
                      Add a photo
                    </strong>

                    <small>
                      Show responders what is happening
                    </small>

                    {photo && (

                      <em>
                        ✓ {photo}
                      </em>

                    )}

                  </label>

                  <button
                    type="button"
                    className={
                      isListening
                        ? "evidence-card listening"
                        : "evidence-card"
                    }
                    onClick={
                      startVoice
                    }
                  >

                    <span className="evidence-icon">
                      🎙️
                    </span>

                    <strong>
                      Describe by voice
                    </strong>

                    <small>
                      Speak instead of typing
                    </small>

                    {isListening && (

                      <em>
                        Listening...
                      </em>

                    )}

                  </button>

                </div>

                {voiceText && (

                  <div className="voice-result">

                    <span>
                      Voice description
                    </span>

                    <p>
                      {voiceText}
                    </p>

                  </div>

                )}

                <div className="safety-tip">

                  <span>
                    ✦
                  </span>

                  <div>

                    <strong>
                      Safety guidance
                    </strong>

                    <p>
                      Stay away from immediate danger and
                      follow instructions from local authorities
                      while help is being coordinated.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 7
            ================================================= */}

            {step === 7 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    07
                  </div>

                  <div>

                    <span>
                      EMERGENCY CONTACT
                    </span>

                    <h3>
                      Who should we notify?
                    </h3>

                    <p>
                      Add someone you trust. This is optional.
                    </p>

                  </div>

                </div>

                <div className="contact-card">

                  <div className="contact-avatar">
                    👤
                  </div>

                  <div className="contact-fields">

                    <div className="field">

                      <label>
                        Contact name
                      </label>

                      <input
                        type="text"
                        placeholder="Parent, friend, guardian..."
                        value={
                          form.contactName
                        }
                        onChange={(e) =>
                          updateMainForm(
                            "contactName",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <div className="field">

                      <label>
                        Contact number
                      </label>

                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={
                          form.contactPhone
                        }
                        onChange={(e) =>
                          updateMainForm(
                            "contactPhone",
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="skip-note">
                  You can skip this and continue if you don't
                  have an emergency contact available.
                </div>

              </div>
            )}

            {/* =================================================
                STEP 8
            ================================================= */}

            {step === 8 && (

              <div className="wizard-step">

                <div className="step-heading">

                  <div className="step-icon">
                    08
                  </div>

                  <div>

                    <span>
                      FINAL CHECK
                    </span>

                    <h3>
                      Review your emergency report
                    </h3>

                    <p>
                      Make sure the important information is correct
                      before sending.
                    </p>

                  </div>

                </div>

                <div className="review-card">

                  <div className="review-row">

                    <span>
                      Person
                    </span>

                    <strong>
                      {form.name ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      Mobile
                    </span>

                    <strong>
                      {form.phone ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      Email
                    </span>

                    <strong>
                      {form.email ||
                        "Not provided — optional"}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      Emergency
                    </span>

                    <strong>
                      {form.emergencyType ||
                        "Not selected"}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      Location
                    </span>

                    <strong>
                      {location ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      People affected
                    </span>

                    <strong>
                      {form.people}
                    </strong>

                  </div>

                  <div className="review-row">

                    <span>
                      Special assistance
                    </span>

                    <strong>
                      {form.specialNeeds.length
                        ? form.specialNeeds.join(
                            ", "
                          )
                        : "None selected"}
                    </strong>

                  </div>

                </div>

                <div className="final-warning">

                  <span>
                    🚨
                  </span>

                  <div>

                    <strong>
                      Ready to send this emergency?
                    </strong>

                    <p>
                      Your report will be sent to the ResQNet
                      Response Center for immediate coordination.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div className="wizard-navigation">

              {step > 1 ? (

                <button
                  type="button"
                  className="back-step"
                  onClick={
                    previousStep
                  }
                >
                  ← Back
                </button>

              ) : (
                <span></span>
              )}

              {step < 8 ? (

                <button
                  type="button"
                  className="next-step"
                  onClick={
                    nextStep
                  }
                >
                  Continue
                  <span>
                    →
                  </span>
                </button>

              ) : (

                <button
                  type="button"
                  className="send-final"
                  onClick={
                    submitEmergency
                  }
                >
                  🚨 Send Emergency Alert
                </button>

              )}

            </div>

          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <aside className="citizen-sidebar">

            {responseSent &&
            responseDetails ? (

              <div className="response-tracking-card">

                <div className="tracking-header">

                  <div>

                    <span className="live-dot"></span>

                    LIVE RESPONSE

                  </div>

                  <span
                    className={
                      responseDetails.priority ===
                      "CRITICAL"
                        ? "priority-badge critical"
                        : "priority-badge"
                    }
                  >
                    {
                      responseDetails.priority
                    }
                  </span>

                </div>

                <div className="tracking-id">

                  <span>
                    REQUEST ID
                  </span>

                  <strong>
                    {
                      responseDetails.id
                    }
                  </strong>

                </div>

                <div className="tracking-status">

                  <div className="status-check">

                    {responseDetails.status ===
                    "Rescued"
                      ? "✓"
                      : responseDetails.status ===
                        "Arrived"
                      ? "✓"
                      : "•"}

                  </div>

                  <div>

                    <strong>
                      {
                        getResponseStatus()
                      }
                    </strong>

                    <small>
                      {responseDetails.status ===
                      "Pending"
                        ? "The command centre has received your request"
                        : responseDetails.status ===
                          "Dispatched"
                        ? "A response team has been assigned"
                        : responseDetails.status ===
                          "Arrived"
                        ? "Your rescue team has reached you"
                        : "Response team is handling your emergency"}
                    </small>

                  </div>

                </div>

                <div className="eta-highlight">

                  <span>
                    {responseDetails.status ===
                    "Pending"
                      ? "TEAM ASSIGNMENT"
                      : "RESPONSE STATUS"}
                  </span>

                  <strong>
                    {
                      getEta()
                    }
                  </strong>

                  <small>
                    {responseDetails.status ===
                    "Pending"
                      ? "Waiting for Admin to select the most suitable team"
                      : responseDetails.status ===
                        "Arrived"
                      ? "Team is at your location"
                      : "Live response coordination"}
                  </small>

                </div>

                <div className="assigned-team">

                  <div className="team-icon">
                    🚑
                  </div>

                  <div>

                    <span>
                      ASSIGNED TEAM
                    </span>

                    <strong>
                      {
                        responseDetails.team
                      }
                    </strong>

                    <small>
                      Unit{" "}
                      {
                        responseDetails.teamCode
                      }
                    </small>

                  </div>

                </div>

                {/* =================================================
                    REAL RESPONSE STATUS
                ================================================= */}

                <div
                  style={{
                    marginTop:
                      "17px",

                    padding:
                      "12px 13px",

                    borderRadius:
                      "11px",

                    background:
                      responseDetails.status ===
                      "Pending"
                        ? "#fff8ed"
                        : responseDetails.status ===
                          "Arrived"
                        ? "#eaf9f7"
                        : "#f4fafb",

                    border:
                      responseDetails.status ===
                      "Pending"
                        ? "1px solid #eeddbb"
                        : "1px solid #dcebed",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap:
                        "8px",

                      fontSize:
                        "10px",

                      fontWeight:
                        800,

                      color:
                        responseDetails.status ===
                        "Pending"
                          ? "#9a6b22"
                          : "#0a9189",
                    }}
                  >

                    <span>
                      {responseDetails.status ===
                      "Pending"
                        ? "⏳"
                        : responseDetails.status ===
                          "Arrived"
                        ? "🟢"
                        : "●"}
                    </span>

                    {
                      getResponseStatus()
                    }

                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="response-action-grid">

                  <button
                    type="button"
                    onClick={
                      openUpdateModal
                    }
                  >
                    ✏️

                    <span>
                      Update Request
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowChat(
                        true
                      )
                    }
                  >
                    💬

                    <span>
                      Contact Team
                    </span>
                  </button>

                  {!requestCancelled && (

                    <button
                      type="button"
                      className="danger-action"
                      onClick={() =>
                        setShowCancelModal(
                          true
                        )
                      }
                    >
                      ✕

                      <span>
                        Cancel Request
                      </span>
                    </button>

                  )}

                </div>

                <button
                  className="track-button"
                  onClick={() =>
                    setSubmitted(
                      true
                    )
                  }
                >
                  View Full Response Details →
                </button>

              </div>

            ) : (

              <div className="live-card">

                <div className="side-card-top">

                  <span className="live-dot"></span>

                  LIVE RESPONSE NETWORK

                </div>

                <h3>
                  Help is being coordinated.
                </h3>

                <p>
                  Your report will be reviewed by the
                  command centre and routed to an appropriate
                  response team.
                </p>

                <div className="network-stats">

                  <div>

                    <strong>
                      24
                    </strong>

                    <span>
                      Resources
                    </span>

                  </div>

                  <div>

                    <strong>
                      10
                    </strong>

                    <span>
                      Teams
                    </span>

                  </div>

                  <div>

                    <strong>
                      07
                    </strong>

                    <span>
                      Zones
                    </span>

                  </div>

                </div>

              </div>

            )}

            {/* =================================================
                HELP NEAR YOU
            ================================================= */}

            <div className="help-card">

              <div className="side-title">

                <span>
                  ✦
                </span>

                HELP NEAR YOU

              </div>

              <div className="help-item">

                <span>
                  🏥
                </span>

                <div>

                  <strong>
                    Nearest Emergency Hospital
                  </strong>

                  <small>
                    24/7 emergency medical care
                  </small>

                </div>

                <b>
                  {
                    responseDetails?.hospitalDistance ||
                    "1.8 km"
                  }
                </b>

              </div>

              <div className="help-item">

                <span>
                  🚒
                </span>

                <div>

                  <strong>
                    Fire & Rescue
                  </strong>

                  <small>
                    Emergency response
                  </small>

                </div>

                <b>
                  2.4 km
                </b>

              </div>

              <div className="help-item">

                <span>
                  🏠
                </span>

                <div>

                  <strong>
                    Safe Shelter
                  </strong>

                  <small>
                    {
                      responseDetails?.shelter ||
                      "Temporary accommodation"
                    }
                  </small>

                </div>

                <b>
                  {
                    responseDetails?.shelterDistance ||
                    "3.1 km"
                  }
                </b>

              </div>

            </div>

            <div className="security-card">

              <span>
                🔐
              </span>

              <div>

                <strong>
                  Protected reporting
                </strong>

                <p>
                  Your emergency information is handled
                  securely by ResQNet.
                </p>

              </div>

            </div>

          </aside>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="citizen-footer">

          <div>

            <strong>
              ResQNet
            </strong>

            <span>
              Connected disaster response.
            </span>

          </div>

          <span>
            Built for faster, smarter emergency coordination.
          </span>

        </footer>

      </main>

      {/* =====================================================
          SOS MODAL
      ===================================================== */}

      {sosOpen && (

        <div
          className="sos-overlay"
          onClick={() =>
            setSosOpen(false)
          }
        >

          <div
            className="sos-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-sos-icon">
              🚨
            </div>

            <span className="modal-eyebrow">
              IMMEDIATE EMERGENCY
            </span>

            <h3>
              Activate Emergency SOS?
            </h3>

            <p>
              Your current location and basic emergency
              information will be sent to the ResQNet
              Response Center.
            </p>

            <div className="modal-warning-box">

              <span>
                ⚠️
              </span>

              <div>

                <strong>
                  CRITICAL PRIORITY RESPONSE
                </strong>

                <small>
                  SOS requests are marked as critical.
                  The command centre will choose the
                  appropriate response team.
                </small>

              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="modal-cancel"
                onClick={() =>
                  setSosOpen(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-confirm"
                onClick={
                  activateSOS
                }
              >
                🚨 Send SOS
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RESPONSE DETAILS MODAL
      ===================================================== */}

      {submitted &&
        responseDetails && (

        <div className="success-overlay">

          <div className="success-modal">

            <div className="success-icon">

              {responseDetails.status ===
              "Arrived"
                ? "🚑"
                : responseDetails.status ===
                  "Rescued"
                ? "✓"
                : "⏳"}

            </div>

            <span className="success-eyebrow">

              {responseDetails.status ===
              "Pending"
                ? "EMERGENCY RECEIVED"
                : responseDetails.status ===
                  "Dispatched"
                ? "TEAM ASSIGNED"
                : responseDetails.status ===
                  "Arrived"
                ? "RESCUE TEAM ARRIVED"
                : responseDetails.status ===
                  "Rescued"
                ? "RESPONSE COMPLETED"
                : "LIVE EMERGENCY RESPONSE"}

            </span>

            <h3>

              {responseDetails.status ===
              "Pending"
                ? "Your emergency is waiting for team assignment."
                : responseDetails.status ===
                  "Dispatched"
                ? "A response team has been assigned."
                : responseDetails.status ===
                  "Arrived"
                ? "Your rescue team has arrived."
                : responseDetails.status ===
                  "Rescued"
                ? "Your emergency response is complete."
                : "Your emergency response is being coordinated."}

            </h3>

            <p>

              {responseDetails.status ===
              "Pending"
                ? "The ResQNet command centre has received your emergency and will select the most suitable available team."
                : responseDetails.status ===
                  "Dispatched"
                ? `The command centre assigned ${responseDetails.team} to your incident.`
                : responseDetails.status ===
                  "Arrived"
                ? "Please confirm whether you are safe."
                : "You can continue to monitor the real-time response status here."}

            </p>

            <div className="reference-box">

              <span>
                EMERGENCY REQUEST ID
              </span>

              <strong>
                {requestId}
              </strong>

              <small>
                Keep this ID for tracking your emergency.
              </small>

            </div>

            <div className="response-eta-box">

              <div className="eta-clock">
                ⏱️
              </div>

              <div>

                <span>
                  RESPONSE STATUS
                </span>

                <strong>
                  {
                    getEta()
                  }
                </strong>

                <small>
                  {
                    getResponseStatus()
                  }
                </small>

              </div>

            </div>

            <div className="assigned-response-box">

              <div className="assigned-icon">
                🚑
              </div>

              <div className="assigned-info">

                <span>
                  ASSIGNED RESPONSE TEAM
                </span>

                <strong>
                  {
                    responseDetails.team
                  }
                </strong>

                <small>
                  Unit{" "}
                  {
                    responseDetails.teamCode
                  }
                </small>

              </div>

              <div className="assigned-live">

                <span></span>

                {responseDetails.status ===
                "Pending"
                  ? "WAITING"
                  : responseDetails.status ===
                    "Arrived"
                  ? "ARRIVED"
                  : responseDetails.status ===
                    "Rescued"
                  ? "DONE"
                  : "LIVE"}

              </div>

            </div>

            {/* =================================================
                RESPONSE TIMELINE
            ================================================= */}

            <div className="response-timeline">

              <div
                className={
                  responseStage >= 1
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 1
                    ? "✓"
                    : "1"}
                </span>

                <div>

                  <strong>
                    Emergency received
                  </strong>

                  <small>
                    ResQNet has received your emergency
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 2
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 2
                    ? "✓"
                    : "2"}
                </span>

                <div>

                  <strong>
                    Response team assigned
                  </strong>

                  <small>
                    {responseStage >= 2
                      ? responseDetails.team
                      : "Waiting for command centre assignment"}
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 3
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 3
                    ? "✓"
                    : "3"}
                </span>

                <div>

                  <strong>
                    Assignment accepted
                  </strong>

                  <small>
                    {responseStage >= 3
                      ? "Response team accepted the incident"
                      : "Waiting for responder acceptance"}
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 4
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 4
                    ? "✓"
                    : "4"}
                </span>

                <div>

                  <strong>
                    Response started
                  </strong>

                  <small>
                    {responseStage >= 4
                      ? "Team is travelling to the incident"
                      : "Waiting for response to start"}
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 5
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 5
                    ? "✓"
                    : "5"}
                </span>

                <div>

                  <strong>
                    Team arriving
                  </strong>

                  <small>
                    {responseStage >= 5
                      ? "Team is approaching your location"
                      : "Waiting for responder update"}
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 6
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage > 6
                    ? "✓"
                    : "6"}
                </span>

                <div>

                  <strong>
                    Team arrived
                  </strong>

                  <small>
                    {responseStage >= 6
                      ? "Response team has reached your location"
                      : "Waiting for arrival"}
                  </small>

                </div>

              </div>

              <div
                className={
                  responseStage >= 7
                    ? "timeline-active"
                    : "timeline-next"
                }
              >

                <span>
                  {responseStage >= 7
                    ? "✓"
                    : "7"}
                </span>

                <div>

                  <strong>
                    Rescue completed
                  </strong>

                  <small>
                    {responseStage >= 7
                      ? "Emergency response completed"
                      : "Waiting for rescue completion"}
                  </small>

                </div>

              </div>

            </div>

            {responseDetails.status ===
              "Arrived" &&
            !safetyConfirmed ? (

              <div className="arrival-actions">

                <strong>
                  Are you safe now?
                </strong>

                <div>

                  <button
                    type="button"
                    onClick={() =>
                      confirmSafe(
                        true
                      )
                    }
                  >
                    🟢 I'm Safe
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      confirmSafe(
                        false
                      )
                    }
                  >
                    🔴 I Still Need Help
                  </button>

                </div>

              </div>

            ) : (

              <button
                type="button"
                className="success-close"
                onClick={() =>
                  setSubmitted(
                    false
                  )
                }
              >
                Continue to Portal
              </button>

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          UPDATE REQUEST MODAL
      ===================================================== */}

      {showUpdateModal &&
        responseDetails && (

        <div
          className="feature-overlay"
          onClick={() =>
            setShowUpdateModal(
              false
            )
          }
        >

          <div
            className="feature-modal update-request-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="feature-modal-header">

              <div>

                <span>
                  EMERGENCY REQUEST
                </span>

                <h3>
                  ✏️ Update Request
                </h3>

                <p>
                  Update anything that has changed. The response
                  team will receive your latest information.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowUpdateModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="update-notice">

              <span>
                ℹ️
              </span>

              <p>
                You can update{" "}
                <strong>
                  any detail
                </strong>{" "}
                from your original emergency report in one place.
              </p>

            </div>

            <div className="update-form-grid">

              <div className="field">

                <label>
                  Full name
                </label>

                <input
                  value={
                    updateForm.name
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "name",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  Mobile number
                </label>

                <input
                  value={
                    updateForm.phone
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "phone",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field full">

                <label>
                  Emergency type
                </label>

                <select
                  value={
                    updateForm.emergencyType
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "emergencyType",
                      e.target.value
                    )
                  }
                >

                  {emergencyTypes.map(
                    (item) => (

                    <option
                      key={
                        item.name
                      }
                      value={
                        item.name
                      }
                    >
                      {item.icon}{" "}
                      {item.name}
                    </option>

                  ))}

                </select>

              </div>

              <div className="field full">

                <label>
                  Current situation
                </label>

                <textarea
                  rows="4"
                  value={
                    updateForm.description
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "description",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  People needing help
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    updateForm.people
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "people",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  Children
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    updateForm.children
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "children",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  Elderly
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    updateForm.elderly
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "elderly",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="field">

                <label>
                  Blood group
                </label>

                <select
                  value={
                    updateForm.bloodGroup
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "bloodGroup",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select
                  </option>

                  <option>
                    A+
                  </option>

                  <option>
                    A-
                  </option>

                  <option>
                    B+
                  </option>

                  <option>
                    B-
                  </option>

                  <option>
                    AB+
                  </option>

                  <option>
                    AB-
                  </option>

                  <option>
                    O+
                  </option>

                  <option>
                    O-
                  </option>

                </select>

              </div>

              <div className="field full">

                <label>
                  Medical information
                </label>

                <input
                  value={
                    updateForm.medicalInfo
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "medicalInfo",
                      e.target.value
                    )
                  }
                  placeholder="Allergy, medication, condition..."
                />

              </div>

              <div className="field full">

                <label>
                  📍 Current location
                </label>

                <input
                  value={
                    updateForm.currentLocation
                  }
                  onChange={(e) =>
                    handleUpdateField(
                      "currentLocation",
                      e.target.value
                    )
                  }
                  placeholder="Update your current location"
                />

                <button
                  type="button"
                  className="mini-location-button"
                  onClick={() => {

                    if (
                      !navigator.geolocation
                    ) {
                      alert(
                        "Location services are not supported."
                      );

                      return;
                    }

                    navigator.geolocation.getCurrentPosition(
                      (
                        position
                      ) => {

                        const lat =
                          position.coords.latitude.toFixed(
                            5
                          );

                        const lng =
                          position.coords.longitude.toFixed(
                            5
                          );

                        handleUpdateField(
                          "currentLocation",
                          `${lat}° N, ${lng}° E`
                        );

                      },

                      () => {
                        alert(
                          "Unable to access your location."
                        );
                      }
                    );

                  }}
                >
                  📍 Use current GPS location
                </button>

              </div>

              <div className="field full">

                <label>
                  Emergency contact
                </label>

                <div className="update-contact-row">

                  <input
                    placeholder="Name"
                    value={
                      updateForm.contactName
                    }
                    onChange={(e) =>
                      handleUpdateField(
                        "contactName",
                        e.target.value
                      )
                    }
                  />

                  <input
                    placeholder="Phone"
                    value={
                      updateForm.contactPhone
                    }
                    onChange={(e) =>
                      handleUpdateField(
                        "contactPhone",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

            <div className="update-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setShowUpdateModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveUpdatedRequest
                }
              >
                ✓ Save Updated Request
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RESPONSE TEAM CHAT
      ===================================================== */}

      {showChat &&
        responseDetails && (

        <div
          className="feature-overlay"
          onClick={() =>
            setShowChat(false)
          }
        >

          <div
            className="feature-modal chat-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="chat-header">

              <div className="chat-team-avatar">
                🚑
              </div>

              <div>

                <span>
                  SECURE RESPONSE CHANNEL
                </span>

                <h3>
                  {
                    responseDetails.team
                  }
                </h3>

                <small>
                  {responseDetails.status ||
                    "Pending"}
                  {" • "}
                  <i></i> LIVE
                </small>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowChat(false)
                }
              >
                ×
              </button>

            </div>

            <div className="chat-security">

              🔐 Messages are shared only with your assigned
              response team.

            </div>

            <div className="quick-message-title">
              QUICK EMERGENCY MESSAGE
            </div>

            <div className="quick-messages">

              <button
                onClick={() =>
                  sendMessage(
                    "Please come quickly."
                  )
                }
              >
                🚨 Please come quickly
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    "Someone is injured."
                  )
                }
              >
                🩹 Someone is injured
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    "The situation is getting worse."
                  )
                }
              >
                ⚠️ Situation getting worse
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    "We are trapped."
                  )
                }
              >
                🆘 We are trapped
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    "We have changed location."
                  )
                }
              >
                📍 We changed location
              </button>

            </div>

            <div className="chat-messages">

              {messages.map(
                (message) => (

                <div
                  key={
                    message.id
                  }
                  className={`chat-message ${
                    message.sender
                  }`}
                >

                  <div>
                    {
                      message.text
                    }
                  </div>

                  <small>
                    {
                      message.time
                    }
                  </small>

                </div>

              ))}

            </div>

            <div className="chat-input-area">

              <input
                type="text"
                placeholder="Type a message to the rescue team..."
                value={
                  messageText
                }
                onChange={(e) =>
                  setMessageText(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {
                    sendMessage();
                  }

                }}
              />

              <button
                type="button"
                onClick={() =>
                  sendMessage()
                }
              >
                ➤
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CANCEL REQUEST MODAL
      ===================================================== */}

      {showCancelModal && (

        <div
          className="feature-overlay"
          onClick={() =>
            setShowCancelModal(
              false
            )
          }
        >

          <div
            className="feature-modal cancel-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="cancel-icon">
              ⚠️
            </div>

            <span>
              CANCEL EMERGENCY REQUEST
            </span>

            <h3>
              Do you no longer need rescue?
            </h3>

            <p>
              Cancelling will immediately notify the assigned
              response team that assistance is no longer required.
            </p>

            <div className="cancel-reasons">

              <button
                className={
                  cancelReason ===
                  "Situation resolved"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setCancelReason(
                    "Situation resolved"
                  )
                }
              >
                ✓ Situation resolved
              </button>

              <button
                className={
                  cancelReason ===
                  "Reported by mistake"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setCancelReason(
                    "Reported by mistake"
                  )
                }
              >
                Reported by mistake
              </button>

              <button
                className={
                  cancelReason ===
                  "Found another source of help"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setCancelReason(
                    "Found another source of help"
                  )
                }
              >
                Found another source of help
              </button>

              <button
                className={
                  cancelReason ===
                  "No longer need assistance"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setCancelReason(
                    "No longer need assistance"
                  )
                }
              >
                No longer need assistance
              </button>

            </div>

            <div className="cancel-modal-actions">

              <button
                type="button"
                onClick={() =>
                  setShowCancelModal(
                    false
                  )
                }
              >
                Keep Rescue Active
              </button>

              <button
                type="button"
                onClick={
                  cancelRequest
                }
              >
                Cancel Emergency
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ARRIVAL NOTIFICATION
      ===================================================== */}

      {showArrivalNotification &&
        responseDetails && (

        <div className="arrival-notification-overlay">

          <div className="arrival-notification">

            <div className="arrival-pulse">
              🚑
            </div>

            <span>
              RESCUE TEAM ARRIVED
            </span>

            <h3>
              Help has reached your location.
            </h3>

            <p>
              <strong>
                {
                  responseDetails.team
                }
              </strong>{" "}
              — The responder has marked the team as
              arrived at your reported location.
            </p>

            <div className="arrival-team-status">

              <div>

                <span>
                  TEAM
                </span>

                <strong>
                  {
                    responseDetails.team
                  }
                </strong>

              </div>

              <div>

                <span>
                  STATUS
                </span>

                <strong>
                  🟢 ARRIVED
                </strong>

              </div>

            </div>

            <div className="arrival-question">
              Are you safe now?
            </div>

            <div className="arrival-actions">

              <button
                type="button"
                onClick={() =>
                  confirmSafe(
                    true
                  )
                }
              >
                🟢 Yes, I'm Safe
              </button>

              <button
                type="button"
                onClick={() =>
                  confirmSafe(
                    false
                  )
                }
              >
                🔴 I Still Need Help
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Citizen;