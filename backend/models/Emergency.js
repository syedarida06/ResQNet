const mongoose = require("mongoose");

/* =========================================================
   MESSAGE SCHEMA
========================================================= */

const messageSchema =
  new mongoose.Schema(
    {
      sender: {
        type: String,
        required: true,
        trim: true,
      },

      senderType: {
        type: String,

        enum: [
          "citizen",
          "responder",
          "command",
          "admin",
        ],

        default:
          "responder",
      },

      text: {
        type: String,
        required: true,
        trim: true,
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: true,
    }
  );

/* =========================================================
   RESOURCE ALLOCATION SCHEMA
========================================================= */

const allocatedResourceSchema =
  new mongoose.Schema(
    {
      resourceId: {
        type: String,
        default: "",
        trim: true,
      },

      resourceName: {
        type: String,
        required: true,
        trim: true,
      },

      category: {
        type: String,
        default: "",
        trim: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 0,
      },

      unit: {
        type: String,
        default: "",
        trim: true,
      },

      icon: {
        type: String,
        default: "📦",
      },

      allocatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================================
   EMERGENCY SCHEMA
========================================================= */

const emergencySchema =
  new mongoose.Schema(
    {
      /* =====================================================
         CITIZEN INFORMATION
      ===================================================== */

      name: {
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
        default: "",
        trim: true,
      },

      /* =====================================================
         EMERGENCY INFORMATION
      ===================================================== */

      emergencyType: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      isSOS: {
        type: Boolean,
        default: false,
      },

      people: {
        type: Number,
        default: 1,
        min: 1,
      },

      adults: {
        type: Number,
        default: 0,
        min: 0,
      },

      children: {
        type: Number,
        default: 0,
        min: 0,
      },

      elderly: {
        type: Number,
        default: 0,
        min: 0,
      },

      specialNeeds: {
        type: [String],
        default: [],
      },

      bloodGroup: {
        type: String,
        default: "",
      },

      medicalInfo: {
        type: String,
        default: "",
      },

      contactName: {
        type: String,
        default: "",
      },

      contactPhone: {
        type: String,
        default: "",
      },

      /* =====================================================
         LOCATION
      ===================================================== */

      location: {
        type: String,
        default: "",
        trim: true,
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      /* =====================================================
         RESPONSE STATUS
      ===================================================== */

      status: {
        type: String,

        enum: [
          "Pending",
          "Dispatched",
          "Accepted",
          "Started",
          "Arriving",
          "Arrived",
          "Rescued",
          "Cancelled",

          /*
           * Older records
           */
          "En Route",
          "Resolved",
        ],

        default:
          "Pending",
      },

      /* =====================================================
         ADMIN ASSIGNED TEAM
      ===================================================== */

      assignedTeam: {
        type: String,
        default: "",
        trim: true,
      },

      /* =====================================================
         RESPONDER
      ===================================================== */

      assignedResponder: {
        type: String,
        default: "",
        trim: true,
      },

      /* =====================================================
         ETA
      ===================================================== */

      eta: {
        type: Number,
        default: 0,
        min: 0,
      },

      /* =====================================================
         RESPONSE TIMESTAMPS
      ===================================================== */

      dispatchedAt: {
        type: Date,
        default: null,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      startedAt: {
        type: Date,
        default: null,
      },

      enRouteAt: {
        type: Date,
        default: null,
      },

      arrivingAt: {
        type: Date,
        default: null,
      },

      arrivedAt: {
        type: Date,
        default: null,
      },

      rescuedAt: {
        type: Date,
        default: null,
      },

      resolvedAt: {
        type: Date,
        default: null,
      },

      /* =====================================================
         CANCELLATION
      ===================================================== */

      cancelReason: {
        type: String,
        default: "",
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      /* =====================================================
         RESOURCE ALLOCATION
      ===================================================== */

      allocatedResources: {
        type:
          [allocatedResourceSchema],

        default: [],
      },

      /* =====================================================
         INCIDENT COMMUNICATION
      ===================================================== */

      messages: {
        type: [messageSchema],
        default: [],
      },

      /* =====================================================
         ASSISTANCE
      ===================================================== */

      assistanceRequested: {
        type: Boolean,
        default: false,
      },

      assistanceRequestedAt: {
        type: Date,
        default: null,
      },

      assistanceRequestedBy: {
        type: String,
        default: "",
      },
    },

    {
      timestamps: true,
    }
  );

/* =========================================================
   INDEXES
========================================================= */

/*
 * Helpful for responder/team queries.
 */

emergencySchema.index({
  assignedTeam: 1,
  status: 1,
});

emergencySchema.index({
  assignedResponder: 1,
  status: 1,
});

emergencySchema.index({
  status: 1,
  createdAt: -1,
});

/* =========================================================
   EXPORT
========================================================= */

module.exports =
  mongoose.models.Emergency ||
  mongoose.model(
    "Emergency",
    emergencySchema
  );