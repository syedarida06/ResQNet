const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const Emergency = require("./models/Emergency");

/* =========================================================
   APP
========================================================= */

const app = express();

const PORT =
  process.env.PORT || 5000;

const FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
];

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
    ],
  })
);

app.use(express.json());

/* =========================================================
   RESQNET RESPONSE TEAMS
========================================================= */

const RESQNET_TEAMS = [
  "Rescue Unit Alpha",
  "Rapid Fire Unit",
  "Mountain Rescue Unit",
  "Urban Search & Rescue",
  "Coastal Rescue Unit",
  "Water Rescue Team",
  "Medical Response Team",
  "Hazard Response Team",
  "Disaster Relief Unit",
  "Emergency Response Unit",
];

/* =========================================================
   RESPONSE STATUSES
========================================================= */

const RESPONSE_STATUSES = [
  "Pending",
  "Dispatched",
  "Accepted",
  "Started",
  "Arriving",
  "Arrived",
  "Rescued",
  "Cancelled",
  "En Route",
  "Resolved",
];

/* =========================================================
   CONTRIBUTION OPTIONS
========================================================= */

const CONTRIBUTION_TYPES = [
  "Money",
  "Food",
  "Water",
  "Medicines",
  "Clothing",
  "Rescue Equipment",
  "Other",
];

const CONTRIBUTION_STATUSES = [
  "Pending",
  "Received",
  "Rejected",
  "Paid",
];

/* =========================================================
   PAYMENT METHODS
========================================================= */

const PAYMENT_METHODS = [
  "Card",
  "UPI",
];

/* =========================================================
   RESPONDER SCHEMA
========================================================= */

const responderSchema =
  new mongoose.Schema(
    {
      applicationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      passwordHash: {
        type: String,
        required: true,
      },

      idType: {
        type: String,
        required: true,
      },

      idNumber: {
        type: String,
        required: true,
      },

      age: {
        type: Number,
        required: true,
        min: 18,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      specialization: {
        type: String,
        required: true,
      },

      experience: {
        type: String,
        required: true,
      },

      availability: {
        type: String,
        required: true,
      },

      availabilityStatus: {
        type: String,
        enum: [
          "Available",
          "On Assignment",
          "Unavailable",
        ],
        default: "Available",
      },

      emergencyContact: {
        type: String,
        required: true,
      },

      emergencyPhone: {
        type: String,
        required: true,
      },

      organization: {
        type: String,
        default: "",
      },

      preferredTeam: {
        type: String,
        enum: RESQNET_TEAMS,
        default: "Rescue Unit Alpha",
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Active",
          "Suspended",
        ],
        default: "Active",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },

      lastLoginAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const Responder =
  mongoose.models.Responder ||
  mongoose.model(
    "Responder",
    responderSchema
  );

/* =========================================================
   CONTRIBUTION SCHEMA
========================================================= */

const contributionSchema =
  new mongoose.Schema(
    {
      contributionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      emergencyId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Emergency",
        required: true,
      },

      donorName: {
        type: String,
        required: true,
        trim: true,
      },

      donorPhone: {
        type: String,
        required: true,
        trim: true,
      },

      donorEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      contributionType: {
        type: String,
        enum: CONTRIBUTION_TYPES,
        required: true,
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },

      itemDetails: {
        type: String,
        default: "",
        trim: true,
      },

      message: {
        type: String,
        default: "",
        trim: true,
      },

      status: {
        type: String,
        enum: CONTRIBUTION_STATUSES,
        default: "Pending",
      },

      /* =====================================================
         PAYMENT DATA
      ===================================================== */

      paymentMethod: {
        type: String,
        enum: [
          "Card",
          "UPI",
          "",
        ],
        default: "",
      },

      paymentStatus: {
        type: String,
        enum: [
          "Not Applicable",
          "Pending",
          "Paid",
          "Failed",
        ],
        default: "Not Applicable",
      },

      transactionId: {
        type: String,
        default: "",
        index: true,
      },

      cardLast4: {
        type: String,
        default: "",
      },

      upiId: {
        type: String,
        default: "",
      },

      paidAt: {
        type: Date,
        default: null,
      },

      receivedAt: {
        type: Date,
        default: null,
      },

      receivedBy: {
        type: String,
        default: "",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

const Contribution =
  mongoose.models.Contribution ||
  mongoose.model(
    "Contribution",
    contributionSchema
  );

/* =========================================================
   PASSWORD HASHING
========================================================= */

function hashPassword(password) {
  const salt =
    crypto
      .randomBytes(16)
      .toString("hex");

  const hash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(
  password,
  storedPassword
) {
  try {
    const parts =
      storedPassword.split(":");

    if (
      parts.length !== 2
    ) {
      return false;
    }

    const salt = parts[0];
    const storedHash =
      parts[1];

    const hash =
      crypto
        .scryptSync(
          password,
          salt,
          64
        )
        .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(
        hash,
        "hex"
      ),
      Buffer.from(
        storedHash,
        "hex"
      )
    );
  } catch {
    return false;
  }
}

/* =========================================================
   ID GENERATORS
========================================================= */

async function generateContributionId() {
  let contributionId;

  do {
    contributionId =
      "CON-" +
      Math.floor(
        10000 +
          Math.random() *
            90000
      );
  } while (
    await Contribution.findOne({
      contributionId,
    })
  );

  return contributionId;
}

function generateTransactionId() {
  return (
    "TXN-RQ-" +
    crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()
  );
}

/* =========================================================
   PUBLIC RESPONDER DATA
========================================================= */

function responderPublicData(
  responder
) {
  return {
    id: responder._id,

    applicationId:
      responder.applicationId,

    fullName:
      responder.fullName,

    phone:
      responder.phone,

    email:
      responder.email,

    idType:
      responder.idType,

    age:
      responder.age,

    city:
      responder.city,

    specialization:
      responder.specialization,

    experience:
      responder.experience,

    availability:
      responder.availability,

    availabilityStatus:
      responder.availabilityStatus,

    emergencyContact:
      responder.emergencyContact,

    emergencyPhone:
      responder.emergencyPhone,

    organization:
      responder.organization,

    preferredTeam:
      responder.preferredTeam ||
      "Rescue Unit Alpha",

    status:
      responder.status,

    createdAt:
      responder.createdAt,
  };
}

/* =========================================================
   DATABASE
========================================================= */

mongoose
  .connect(
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log(
      "MongoDB connected successfully!"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

/* =========================================================
   BASIC ROUTES
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.send(
      "ResQNet Backend is running!"
    );
  }
);

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "ResQNet API is working!",
    });
  }
);

/* =========================================================
   RESPONDER REGISTER
========================================================= */

app.post(
  "/api/responders/register",
  async (req, res) => {
    try {
      const {
        fullName,
        phone,
        email,
        password,
        idType,
        idNumber,
        age,
        city,
        specialization,
        experience,
        availability,
        emergencyContact,
        emergencyPhone,
        organization,
        preferredTeam,
      } = req.body;

      if (
        !fullName ||
        !phone ||
        !email ||
        !password ||
        !idType ||
        !idNumber ||
        !age ||
        !city ||
        !specialization ||
        !experience ||
        !availability ||
        !emergencyContact ||
        !emergencyPhone ||
        !preferredTeam
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please fill all required responder fields.",
        });
      }

      if (
        !RESQNET_TEAMS.includes(
          preferredTeam
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid response team selected.",
          validTeams:
            RESQNET_TEAMS,
        });
      }

      if (
        String(password).length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      const cleanId =
        String(idNumber).trim();

      const existingEmail =
        await Responder.findOne({
          email: cleanEmail,
        });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message:
            "A responder account with this email already exists.",
        });
      }

      const existingId =
        await Responder.findOne({
          idNumber: cleanId,
        });

      if (existingId) {
        return res.status(409).json({
          success: false,
          message:
            "This identification number is already registered.",
        });
      }

      let applicationId;

      do {
        applicationId =
          "RQR-" +
          Math.floor(
            10000 +
              Math.random() *
                90000
          );
      } while (
        await Responder.findOne({
          applicationId,
        })
      );

      const responder =
        new Responder({
          applicationId,

          fullName:
            String(
              fullName
            ).trim(),

          phone:
            String(phone).trim(),

          email:
            cleanEmail,

          passwordHash:
            hashPassword(
              password
            ),

          idType,

          idNumber:
            cleanId,

          age:
            Number(age),

          city:
            String(city).trim(),

          specialization,

          experience,

          availability,

          availabilityStatus:
            "Available",

          emergencyContact:
            String(
              emergencyContact
            ).trim(),

          emergencyPhone:
            String(
              emergencyPhone
            ).trim(),

          organization:
            organization
              ? String(
                  organization
                ).trim()
              : "",

          preferredTeam,

          status:
            "Active",
        });

      const saved =
        await responder.save();

      console.log(
        "Responder registered:",
        saved.applicationId,
        "Team:",
        saved.preferredTeam
      );

      return res.status(201).json({
        success: true,
        message:
          "Responder registered successfully.",
        data: {
          applicationId:
            saved.applicationId,

          preferredTeam:
            saved.preferredTeam,
        },
      });
    } catch (error) {
      console.error(
        "Responder registration error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to register responder.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   RESPONDER LOGIN
========================================================= */

app.post(
  "/api/responders/login",
  async (req, res) => {
    try {
      const {
        applicationId,
        password,
      } = req.body;

      if (
        !applicationId ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Application ID and password are required.",
        });
      }

      const responder =
        await Responder.findOne({
          applicationId:
            String(
              applicationId
            )
              .trim()
              .toUpperCase(),
        });

      if (!responder) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid Application ID or password.",
        });
      }

      if (
        responder.status ===
        "Suspended"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This responder account has been suspended.",
        });
      }

      const valid =
        verifyPassword(
          password,
          responder.passwordHash
        );

      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid Application ID or password.",
        });
      }

      responder.lastLoginAt =
        new Date();

      await responder.save();

      return res.json({
        success: true,
        message:
          "Responder login successful.",
        data:
          responderPublicData(
            responder
          ),
      });
    } catch (error) {
      console.error(
        "Responder login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to login responder.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   RESPONDER AVAILABILITY
========================================================= */

app.put(
  "/api/responders/:applicationId/availability",
  async (req, res) => {
    try {
      const {
        availabilityStatus,
      } = req.body;

      const allowed = [
        "Available",
        "On Assignment",
        "Unavailable",
      ];

      if (
        !allowed.includes(
          availabilityStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid availability status.",
        });
      }

      const responder =
        await Responder.findOneAndUpdate(
          {
            applicationId:
              req.params
                .applicationId,
          },
          {
            $set: {
              availabilityStatus,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!responder) {
        return res.status(404).json({
          success: false,
          message:
            "Responder not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Responder availability updated.",
        data:
          responderPublicData(
            responder
          ),
      });
    } catch (error) {
      console.error(
        "Availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update availability.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   RESPONDER DASHBOARD
========================================================= */

app.get(
  "/api/responders/:applicationId/dashboard",
  async (req, res) => {
    try {
      const responder =
        await Responder.findOne({
          applicationId:
            req.params
              .applicationId,
        });

      if (!responder) {
        return res.status(404).json({
          success: false,
          message:
            "Responder not found.",
        });
      }

      const responderTeam =
        responder.preferredTeam ||
        "Rescue Unit Alpha";

      const assignments =
        await Emergency.find({
          $or: [
            {
              assignedResponder:
                responder.applicationId,
            },
            {
              assignedTeam:
                responderTeam,
            },
          ],

          status: {
            $in: [
              "Dispatched",
              "Accepted",
              "Started",
              "Arriving",
              "Arrived",
              "En Route",
            ],
          },
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      const newRequests =
        await Emergency.find({
          status: "Pending",

          $or: [
            {
              assignedTeam: "",
            },
            {
              assignedTeam: {
                $exists: false,
              },
            },
            {
              assignedTeam: null,
            },
          ],
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      const history =
        await Emergency.find({
          $or: [
            {
              assignedResponder:
                responder.applicationId,
            },
            {
              assignedTeam:
                responderTeam,
            },
          ],

          status: {
            $in: [
              "Rescued",
              "Resolved",
            ],
          },
        })
          .sort({
            resolvedAt: -1,
            rescuedAt: -1,
          })
          .limit(20)
          .lean();

      return res.json({
        success: true,

        data: {
          responder:
            responderPublicData(
              responder
            ),

          assignments,

          newRequests,

          history,
        },
      });
    } catch (error) {
      console.error(
        "Responder dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load responder dashboard.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CREATE EMERGENCY — CITIZEN
========================================================= */

app.post(
  "/api/emergency",
  async (req, res) => {
    try {
      console.log(
        "\n========== NEW CITIZEN EMERGENCY =========="
      );

      console.log(req.body);

      const emergencyData = {
        ...req.body,
      };

      if (
        !emergencyData.location &&
        emergencyData.currentLocation
      ) {
        emergencyData.location =
          emergencyData.currentLocation;
      }

      if (
        emergencyData.location &&
        typeof emergencyData.location ===
          "object"
      ) {
        const locationObject =
          emergencyData.location;

        if (
          emergencyData.latitude ==
          null
        ) {
          emergencyData.latitude =
            Number(
              locationObject.latitude
            ) || null;
        }

        if (
          emergencyData.longitude ==
          null
        ) {
          emergencyData.longitude =
            Number(
              locationObject.longitude
            ) || null;
        }

        emergencyData.location =
          locationObject.address ||
          `${locationObject.latitude || ""}, ${locationObject.longitude || ""}`;
      }

      emergencyData.status =
        "Pending";

      emergencyData.assignedTeam =
        "";

      emergencyData.assignedResponder =
        "";

      emergencyData.eta = 0;

      emergencyData.dispatchedAt =
        null;

      emergencyData.acceptedAt =
        null;

      emergencyData.startedAt =
        null;

      emergencyData.enRouteAt =
        null;

      emergencyData.arrivingAt =
        null;

      emergencyData.arrivedAt =
        null;

      emergencyData.rescuedAt =
        null;

      emergencyData.resolvedAt =
        null;

      emergencyData.allocatedResources =
        Array.isArray(
          emergencyData.allocatedResources
        )
          ? emergencyData.allocatedResources
          : [];

      const emergency =
        new Emergency(
          emergencyData
        );

      const saved =
        await emergency.save();

      console.log(
        "NEW EMERGENCY SAVED:",
        saved._id
      );

      console.log(
        "TYPE:",
        saved.emergencyType
      );

      console.log(
        "LOCATION:",
        saved.location
      );

      console.log(
        "SOS:",
        saved.isSOS
      );

      console.log(
        "==========================================\n"
      );

      return res.status(201).json({
        success: true,

        message:
          "Emergency saved successfully!",

        data:
          saved,
      });
    } catch (error) {
      console.error(
        "Error saving emergency:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save emergency.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET ALL EMERGENCIES — ADMIN
========================================================= */

app.get(
  "/api/emergency",
  async (req, res) => {
    try {
      const emergencies =
        await Emergency.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        data:
          emergencies,
      });
    } catch (error) {
      console.error(
        "Error fetching emergencies:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch emergencies.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET PENDING EMERGENCIES
========================================================= */

app.get(
  "/api/emergency/pending",
  async (req, res) => {
    try {
      const pendingEmergencies =
        await Emergency.find({
          status: "Pending",

          $or: [
            {
              assignedTeam: "",
            },
            {
              assignedTeam: {
                $exists: false,
              },
            },
            {
              assignedTeam: null,
            },
          ],
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,

        count:
          pendingEmergencies.length,

        data:
          pendingEmergencies,
      });
    } catch (error) {
      console.error(
        "Pending emergency fetch error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch pending emergency requests.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE EMERGENCY
========================================================= */

app.get(
  "/api/emergency/:id",
  async (req, res) => {
    try {
      const emergency =
        await Emergency.findById(
          req.params.id
        ).lean();

      if (!emergency) {
        return res.status(404).json({
          success: false,
          message:
            "Emergency not found.",
        });
      }

      return res.json({
        success: true,
        data:
          emergency,
      });
    } catch (error) {
      console.error(
        "Get single emergency error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch emergency.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN DISPATCH / UPDATE / RESOURCE ALLOCATION
========================================================= */

app.put(
  "/api/emergency/:id",
  async (req, res) => {
    try {
      const {
        status,
        assignedTeam,
        team,
        eta,
        assignedResponder,
        allocatedResources,
      } = req.body;

      const hasTeamField =
        assignedTeam !==
          undefined ||
        team !==
          undefined;

      const finalTeam =
        String(
          assignedTeam ??
            team ??
            ""
        ).trim();

      const finalStatus =
        status ||
        "Dispatched";

      const finalEta =
        Number(eta) || 0;

      if (
        !RESPONSE_STATUSES.includes(
          finalStatus
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Invalid status: ${finalStatus}`,

          allowedStatuses:
            RESPONSE_STATUSES,
        });
      }

      if (
        finalTeam &&
        !RESQNET_TEAMS.includes(
          finalTeam
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid response team.",

          validTeams:
            RESQNET_TEAMS,
        });
      }

      const existing =
        await Emergency.findById(
          req.params.id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      const updateData = {
        status:
          finalStatus,

        eta:
          finalEta,
      };

      if (hasTeamField) {
        updateData.assignedTeam =
          finalTeam;
      }

      if (
        assignedResponder !==
        undefined
      ) {
        updateData.assignedResponder =
          String(
            assignedResponder ||
              ""
          ).trim();
      }

      if (
        allocatedResources !==
        undefined
      ) {
        if (
          !Array.isArray(
            allocatedResources
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "allocatedResources must be an array.",
          });
        }

        updateData.allocatedResources =
          allocatedResources;
      }

      if (
        finalStatus ===
        "Dispatched"
      ) {
        if (!finalTeam) {
          return res.status(400).json({
            success: false,

            message:
              "Please select a response team before dispatching.",
          });
        }

        updateData.dispatchedAt =
          new Date();
      }

      if (
        finalStatus ===
        "Accepted"
      ) {
        updateData.acceptedAt =
          new Date();
      }

      if (
        finalStatus ===
          "Started" ||
        finalStatus ===
          "En Route"
      ) {
        updateData.startedAt =
          new Date();

        updateData.enRouteAt =
          new Date();
      }

      if (
        finalStatus ===
        "Arriving"
      ) {
        updateData.arrivingAt =
          new Date();
      }

      if (
        finalStatus ===
        "Arrived"
      ) {
        updateData.arrivedAt =
          new Date();
      }

      if (
        finalStatus ===
          "Rescued" ||
        finalStatus ===
          "Resolved"
      ) {
        updateData.rescuedAt =
          new Date();

        updateData.resolvedAt =
          new Date();

        updateData.eta =
          0;
      }

      if (
        finalStatus ===
        "Cancelled"
      ) {
        updateData.eta =
          0;
      }

      const updated =
        await Emergency.findByIdAndUpdate(
          req.params.id,
          {
            $set:
              updateData,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      console.log(
        "EMERGENCY UPDATED:",
        updated._id
      );

      return res.json({
        success: true,

        message:
          finalStatus ===
          "Dispatched"
            ? "Emergency dispatched successfully."
            : "Emergency updated successfully.",

        data:
          updated,
      });
    } catch (error) {
      console.error(
        "EMERGENCY UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update emergency.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CANCEL EMERGENCY — CITIZEN
========================================================= */

app.put(
  "/api/emergency/:id/cancel",
  async (req, res) => {
    try {
      const {
        reason,
      } = req.body;

      const emergency =
        await Emergency.findById(
          req.params.id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      if (
        [
          "Rescued",
          "Resolved",
        ].includes(
          emergency.status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This emergency has already been completed.",
        });
      }

      emergency.status =
        "Cancelled";

      emergency.eta = 0;

      emergency.cancelReason =
        reason || "";

      emergency.cancelledAt =
        new Date();

      if (
        !Array.isArray(
          emergency.messages
        )
      ) {
        emergency.messages =
          [];
      }

      emergency.messages.push({
        sender:
          "Citizen",

        senderType:
          "citizen",

        text:
          reason
            ? `Emergency request cancelled. Reason: ${reason}`
            : "Emergency request cancelled.",

        createdAt:
          new Date(),
      });

      await emergency.save();

      return res.json({
        success: true,

        message:
          "Emergency request cancelled successfully.",

        data:
          emergency,
      });
    } catch (error) {
      console.error(
        "Cancel emergency error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to cancel emergency.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   TEAM EMERGENCIES
========================================================= */

app.get(
  "/api/emergency/team/:team",
  async (req, res) => {
    try {
      const team =
        decodeURIComponent(
          req.params.team
        );

      if (
        !RESQNET_TEAMS.includes(
          team
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid team name.",

          validTeams:
            RESQNET_TEAMS,
        });
      }

      const emergencies =
        await Emergency.find({
          assignedTeam:
            team,

          status: {
            $in: [
              "Dispatched",
              "Accepted",
              "Started",
              "Arriving",
              "Arrived",
              "En Route",
            ],
          },
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,

        data:
          emergencies,
      });
    } catch (error) {
      console.error(
        "Team emergency error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch team emergencies.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   RESPONDER STATUS
========================================================= */

app.put(
  "/api/emergency/:id/status",
  async (req, res) => {
    try {
      const {
        status,
        responder,
      } = req.body;

      const allowedResponderStatuses = [
        "Accepted",
        "Started",
        "Arriving",
        "Arrived",
        "Rescued",
        "En Route",
        "Resolved",
      ];

      if (
        !allowedResponderStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid responder status.",

          allowedStatuses:
            allowedResponderStatuses,
        });
      }

      const emergency =
        await Emergency.findById(
          req.params.id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      if (
        !emergency.assignedTeam
      ) {
        return res.status(400).json({
          success: false,

          message:
            "No response team has been assigned to this incident yet.",
        });
      }

      let currentResponder =
        null;

      if (responder) {
        currentResponder =
          await Responder.findOne({
            applicationId:
              String(
                responder
              )
                .trim()
                .toUpperCase(),
          });

        if (!currentResponder) {
          return res.status(404).json({
            success: false,

            message:
              "Responder not found.",
          });
        }

        const belongsToAssignedTeam =
          currentResponder.preferredTeam ===
          emergency.assignedTeam;

        const isAlreadyAssignedResponder =
          emergency.assignedResponder ===
          currentResponder.applicationId;

        if (
          !belongsToAssignedTeam &&
          !isAlreadyAssignedResponder
        ) {
          return res.status(403).json({
            success: false,

            message:
              "This incident is assigned to a different response team.",
          });
        }
      }

      const updateData = {
        status,
      };

      if (responder) {
        updateData.assignedResponder =
          String(
            responder
          )
            .trim()
            .toUpperCase();
      }

      if (
        status ===
        "Accepted"
      ) {
        updateData.acceptedAt =
          new Date();

        if (
          currentResponder
        ) {
          await Responder.findOneAndUpdate(
            {
              applicationId:
                currentResponder.applicationId,
            },
            {
              $set: {
                availabilityStatus:
                  "On Assignment",
              },
            }
          );
        }
      }

      if (
        status ===
          "Started" ||
        status ===
          "En Route"
      ) {
        updateData.startedAt =
          new Date();

        updateData.enRouteAt =
          new Date();
      }

      if (
        status ===
        "Arriving"
      ) {
        updateData.arrivingAt =
          new Date();
      }

      if (
        status ===
        "Arrived"
      ) {
        updateData.arrivedAt =
          new Date();
      }

      if (
        status ===
          "Rescued" ||
        status ===
          "Resolved"
      ) {
        updateData.rescuedAt =
          new Date();

        updateData.resolvedAt =
          new Date();

        updateData.eta =
          0;

        if (
          currentResponder
        ) {
          await Responder.findOneAndUpdate(
            {
              applicationId:
                currentResponder.applicationId,
            },
            {
              $set: {
                availabilityStatus:
                  "Available",
              },
            }
          );
        }
      }

      const updated =
        await Emergency.findByIdAndUpdate(
          req.params.id,
          {
            $set:
              updateData,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      return res.json({
        success: true,

        message:
          `Emergency status updated to ${status}.`,

        data:
          updated,
      });
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update emergency status.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   ASSISTANCE REQUEST
========================================================= */

app.post(
  "/api/emergency/:id/assistance",
  async (req, res) => {
    try {
      const {
        responder,
        message,
      } = req.body;

      const emergency =
        await Emergency.findById(
          req.params.id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      if (
        !Array.isArray(
          emergency.messages
        )
      ) {
        emergency.messages =
          [];
      }

      emergency.messages.push({
        sender:
          responder ||
          "Responder",

        senderType:
          "responder",

        text:
          message ||
          "Responder requested assistance.",

        createdAt:
          new Date(),
      });

      emergency.assistanceRequested =
        true;

      emergency.assistanceRequestedAt =
        new Date();

      emergency.assistanceRequestedBy =
        responder || "";

      await emergency.save();

      return res.json({
        success: true,

        message:
          "Assistance request sent to command centre.",

        data:
          emergency,
      });
    } catch (error) {
      console.error(
        "Assistance error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to request assistance.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET MESSAGES
========================================================= */

app.get(
  "/api/emergency/:id/messages",
  async (req, res) => {
    try {
      const emergency =
        await Emergency.findById(
          req.params.id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      return res.json({
        success: true,

        data: {
          messages:
            emergency.messages ||
            [],
        },
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch messages.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   SEND MESSAGE
========================================================= */

app.post(
  "/api/emergency/:id/messages",
  async (req, res) => {
    try {
      const {
        sender,
        senderType,
        text,
      } = req.body;

      if (
        !text ||
        !String(text).trim()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Message cannot be empty.",
        });
      }

      const emergency =
        await Emergency.findById(
          req.params.id
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Emergency not found.",
        });
      }

      if (
        !Array.isArray(
          emergency.messages
        )
      ) {
        emergency.messages =
          [];
      }

      emergency.messages.push({
        sender:
          sender ||
          "Responder",

        senderType:
          senderType ||
          "responder",

        text:
          String(text).trim(),

        createdAt:
          new Date(),
      });

      await emergency.save();

      return res.json({
        success: true,

        message:
          "Message sent successfully.",

        data: {
          messages:
            emergency.messages,
        },
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to send message.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CONTRIBUTION — GET ACTIVE EMERGENCIES
========================================================= */

app.get(
  "/api/contributions/emergencies",
  async (req, res) => {
    try {
      const emergencies =
        await Emergency.find({
          status: {
            $nin: [
              "Cancelled",
              "Rescued",
              "Resolved",
            ],
          },
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,

        count:
          emergencies.length,

        data:
          emergencies,
      });
    } catch (error) {
      console.error(
        "Contribution emergency fetch error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch emergencies for contribution.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CREATE CONTRIBUTION — NON-MONEY / GENERIC
========================================================= */

app.post(
  "/api/contributions",
  async (req, res) => {
    try {
      const {
        emergencyId,
        donorName,
        donorPhone,
        donorEmail,
        contributionType,
        amount,
        quantity,
        itemDetails,
        message,
      } = req.body;

      if (
        !emergencyId ||
        !donorName ||
        !donorPhone ||
        !donorEmail ||
        !contributionType
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please fill all required contribution fields.",
        });
      }

      if (
        !CONTRIBUTION_TYPES.includes(
          contributionType
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid contribution type.",

          validTypes:
            CONTRIBUTION_TYPES,
        });
      }

      const emergency =
        await Emergency.findById(
          emergencyId
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Selected emergency was not found.",
        });
      }

      if (
        [
          "Cancelled",
          "Rescued",
          "Resolved",
        ].includes(
          emergency.status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Contributions are no longer accepted for this emergency.",
        });
      }

      let finalAmount =
        Number(amount) || 0;

      let finalQuantity =
        Number(quantity) || 0;

      if (
        contributionType ===
        "Money"
      ) {
        if (
          finalAmount <= 0
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Please enter a valid contribution amount.",
          });
        }
      } else {
        finalAmount = 0;

        if (
          finalQuantity <= 0 &&
          !String(
            itemDetails || ""
          ).trim()
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Please provide a quantity or item details.",
          });
        }
      }

      if (
        contributionType ===
        "Money"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Money contributions must continue through the payment endpoint.",
        });
      }

      const contributionId =
        await generateContributionId();

      const contribution =
        new Contribution({
          contributionId,

          emergencyId,

          donorName:
            String(
              donorName
            ).trim(),

          donorPhone:
            String(
              donorPhone
            ).trim(),

          donorEmail:
            String(
              donorEmail
            )
              .trim()
              .toLowerCase(),

          contributionType,

          amount:
            finalAmount,

          quantity:
            finalQuantity,

          itemDetails:
            String(
              itemDetails ||
                ""
            ).trim(),

          message:
            String(
              message ||
                ""
            ).trim(),

          status:
            "Pending",

          paymentStatus:
            "Not Applicable",
        });

      const saved =
        await contribution.save();

      console.log(
        "\n========== NEW NON-MONEY CONTRIBUTION =========="
      );

      console.log(
        "CONTRIBUTION:",
        saved.contributionId
      );

      console.log(
        "EMERGENCY:",
        emergency._id
      );

      console.log(
        "TYPE:",
        saved.contributionType
      );

      console.log(
        "STATUS:",
        saved.status
      );

      console.log(
        "================================================\n"
      );

      return res.status(201).json({
        success: true,

        message:
          "Contribution submitted successfully.",

        data:
          saved,
      });
    } catch (error) {
      console.error(
        "Contribution creation error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to submit contribution.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   MONEY PAYMENT — HACKATHON DEMO
========================================================= */

app.post(
  "/api/contributions/payment",
  async (req, res) => {
    try {
      const {
        emergencyId,
        donorName,
        donorPhone,
        donorEmail,
        contributionType,
        amount,
        message,
        paymentMethod,
        cardLast4,
        upiId,
      } = req.body;

      /* =====================================================
         REQUIRED FIELDS
      ===================================================== */

      if (
        !emergencyId ||
        !donorName ||
        !donorPhone ||
        !donorEmail ||
        contributionType !==
          "Money"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Missing required payment information.",
        });
      }

      /* =====================================================
         PAYMENT METHOD
      ===================================================== */

      if (
        !PAYMENT_METHODS.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid payment method.",
        });
      }

      /* =====================================================
         AMOUNT
      ===================================================== */

      const finalAmount =
        Number(amount);

      if (
        !Number.isFinite(
          finalAmount
        ) ||
        finalAmount <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Please enter a valid contribution amount.",
        });
      }

      if (
        finalAmount >
        10000000
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Contribution amount exceeds the allowed demo limit.",
        });
      }

      /* =====================================================
         EMERGENCY
      ===================================================== */

      const emergency =
        await Emergency.findById(
          emergencyId
        );

      if (!emergency) {
        return res.status(404).json({
          success: false,

          message:
            "Selected emergency was not found.",
        });
      }

      if (
        [
          "Cancelled",
          "Rescued",
          "Resolved",
        ].includes(
          emergency.status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Contributions are no longer accepted for this emergency.",
        });
      }

      /* =====================================================
         PAYMENT DATA VALIDATION
      ===================================================== */

      let finalCardLast4 =
        "";

      let finalUpiId =
        "";

      if (
        paymentMethod ===
        "Card"
      ) {
        const cleanedLast4 =
          String(
            cardLast4 ||
              ""
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              -4
            );

        if (
          cleanedLast4.length !==
          4
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Invalid card payment details.",
          });
        }

        finalCardLast4 =
          cleanedLast4;
      }

      if (
        paymentMethod ===
        "UPI"
      ) {
        finalUpiId =
          String(
            upiId || ""
          ).trim();

        if (
          !finalUpiId ||
          !finalUpiId.includes(
            "@"
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Invalid UPI ID.",
          });
        }
      }

      /* =====================================================
         GENERATE IDs
      ===================================================== */

      const contributionId =
        await generateContributionId();

      const transactionId =
        generateTransactionId();

      /* =====================================================
         CREATE PAID CONTRIBUTION
      ===================================================== */

      const contribution =
        new Contribution({
          contributionId,

          emergencyId,

          donorName:
            String(
              donorName
            ).trim(),

          donorPhone:
            String(
              donorPhone
            ).trim(),

          donorEmail:
            String(
              donorEmail
            )
              .trim()
              .toLowerCase(),

          contributionType:
            "Money",

          amount:
            finalAmount,

          quantity: 0,

          itemDetails:
            "",

          message:
            String(
              message ||
                ""
            ).trim(),

          status:
            "Paid",

          paymentMethod,

          paymentStatus:
            "Paid",

          transactionId,

          cardLast4:
            finalCardLast4,

          upiId:
            finalUpiId,

          paidAt:
            new Date(),
        });

      const saved =
        await contribution.save();

      console.log(
        "\n========== DEMO PAYMENT SUCCESS =========="
      );

      console.log(
        "CONTRIBUTION:",
        saved.contributionId
      );

      console.log(
        "TRANSACTION:",
        saved.transactionId
      );

      console.log(
        "AMOUNT:",
        saved.amount
      );

      console.log(
        "METHOD:",
        saved.paymentMethod
      );

      console.log(
        "EMERGENCY:",
        saved.emergencyId
      );

      console.log(
        "STATUS:",
        saved.paymentStatus
      );

      console.log(
        "===========================================\n"
      );

      return res.status(201).json({
        success: true,

        message:
          "Payment completed successfully.",

        data: {
          contributionId:
            saved.contributionId,

          transactionId:
            saved.transactionId,

          amount:
            saved.amount,

          paymentMethod:
            saved.paymentMethod,

          paymentStatus:
            saved.paymentStatus,

          status:
            saved.status,

          paidAt:
            saved.paidAt,

          emergencyId:
            saved.emergencyId,
        },
      });
    } catch (error) {
      console.error(
        "Contribution payment error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to complete payment.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET ALL CONTRIBUTIONS
========================================================= */

app.get(
  "/api/contributions",
  async (req, res) => {
    try {
      const contributions =
        await Contribution.find()
          .populate(
            "emergencyId",
            "emergencyType location status severity contactName"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,

        count:
          contributions.length,

        data:
          contributions,
      });
    } catch (error) {
      console.error(
        "Contribution fetch error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch contributions.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE CONTRIBUTION
========================================================= */

app.get(
  "/api/contributions/:id",
  async (req, res) => {
    try {
      const contribution =
        await Contribution.findOne({
          $or: [
            {
              _id:
                mongoose.isValidObjectId(
                  req.params.id
                )
                  ? req.params.id
                  : null,
            },

            {
              contributionId:
                req.params.id,
            },

            {
              transactionId:
                req.params.id,
            },
          ],
        })
          .populate(
            "emergencyId",
            "emergencyType location status severity contactName"
          )
          .lean();

      if (!contribution) {
        return res.status(404).json({
          success: false,

          message:
            "Contribution not found.",
        });
      }

      return res.json({
        success: true,

        data:
          contribution,
      });
    } catch (error) {
      console.error(
        "Single contribution error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch contribution.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE CONTRIBUTION STATUS
========================================================= */

app.put(
  "/api/contributions/:id/status",
  async (req, res) => {
    try {
      const {
        status,
        receivedBy,
      } = req.body;

      if (
        !CONTRIBUTION_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid contribution status.",

          allowedStatuses:
            CONTRIBUTION_STATUSES,
        });
      }

      const contribution =
        await Contribution.findOne({
          $or: [
            {
              _id:
                mongoose.isValidObjectId(
                  req.params.id
                )
                  ? req.params.id
                  : null,
            },

            {
              contributionId:
                req.params.id,
            },

            {
              transactionId:
                req.params.id,
            },
          ],
        });

      if (!contribution) {
        return res.status(404).json({
          success: false,

          message:
            "Contribution not found.",
        });
      }

      contribution.status =
        status;

      if (
        status ===
        "Received"
      ) {
        contribution.receivedAt =
          new Date();

        contribution.receivedBy =
          String(
            receivedBy ||
              "ResQNet Command Centre"
          ).trim();
      }

      if (
        status ===
        "Rejected"
      ) {
        contribution.receivedAt =
          null;

        contribution.receivedBy =
          "";
      }

      if (
        status ===
        "Pending"
      ) {
        contribution.receivedAt =
          null;

        contribution.receivedBy =
          "";
      }

      await contribution.save();

      return res.json({
        success: true,

        message:
          `Contribution marked as ${status}.`,

        data:
          contribution,
      });
    } catch (error) {
      console.error(
        "Contribution status error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to update contribution status.",

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `ResQNet Backend running on http://localhost:${PORT}`
    );
  }
);