import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Navbar from "./Navbar";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   TEAM DATA
========================================================= */

const TEAMS = [
  {
    id: "RUA-01",
    name: "Rescue Unit Alpha",
    specialty: "General emergency rescue",
    capabilities:
      "Flood, earthquake, cyclone, evacuation, first aid",
    status: "Available",
    eta: 10,
    location: "Zone A",
    icon: "🚑",
  },
  {
    id: "RFR-04",
    name: "Rapid Fire Unit",
    specialty: "Fire & hazardous rescue",
    capabilities:
      "Fire suppression, smoke rescue, burns, evacuation",
    status: "Available",
    eta: 7,
    location: "Zone B",
    icon: "🚒",
  },
  {
    id: "MRU-05",
    name: "Mountain Rescue Unit",
    specialty: "Mountain & landslide rescue",
    capabilities:
      "Landslides, rockfall, terrain rescue, evacuation",
    status: "Available",
    eta: 18,
    location: "Zone C",
    icon: "🧗",
  },
  {
    id: "USR-02",
    name: "Urban Search & Rescue",
    specialty: "Collapsed structures & urban rescue",
    capabilities:
      "Earthquake, building collapse, trapped victims",
    status: "Available",
    eta: 21,
    location: "Zone A",
    icon: "🚙",
  },
  {
    id: "CRU-07",
    name: "Coastal Rescue Unit",
    specialty: "Cyclone & coastal emergencies",
    capabilities:
      "Cyclone, storm surge, coastal evacuation, water rescue",
    status: "Available",
    eta: 15,
    location: "Zone D",
    icon: "🚤",
  },
  {
    id: "WRT-03",
    name: "Water Rescue Team",
    specialty: "Flood & water rescue",
    capabilities:
      "Floods, drowning rescue, boats, water evacuation",
    status: "Available",
    eta: 12,
    location: "Zone B",
    icon: "🛶",
  },
  {
    id: "MED-08",
    name: "Medical Response Team",
    specialty: "Emergency medical assistance",
    capabilities:
      "Trauma, medical emergencies, first aid, evacuation",
    status: "Available",
    eta: 9,
    location: "Zone A",
    icon: "🩺",
  },
  {
    id: "CBR-06",
    name: "Hazard Response Team",
    specialty: "Chemical & hazardous incidents",
    capabilities:
      "Chemical leaks, hazardous materials, contamination",
    status: "Available",
    eta: 16,
    location: "Zone C",
    icon: "☣️",
  },
  {
    id: "DRU-09",
    name: "Disaster Relief Unit",
    specialty: "Large-scale disaster relief",
    capabilities:
      "Food, water, shelter, evacuation and relief coordination",
    status: "Available",
    eta: 20,
    location: "Zone D",
    icon: "🏕️",
  },
  {
    id: "ERU-10",
    name: "Emergency Response Unit",
    specialty: "Rapid multi-disaster response",
    capabilities:
      "Fire, flood, earthquake, cyclone and general rescue",
    status: "Available",
    eta: 11,
    location: "Zone B",
    icon: "🚨",
  },
];

/* =========================================================
   RESOURCE DATA
========================================================= */

const INITIAL_RESOURCES = [
  {
    id: "food",
    name: "Food Packets",
    category: "Food",
    icon: "🍱",
    quantity: 850,
    unit: "packets",
    description: "Ready-to-eat emergency meals",
  },
  {
    id: "water",
    name: "Drinking Water",
    category: "Water",
    icon: "💧",
    quantity: 1200,
    unit: "bottles",
    description: "Sealed drinking water bottles",
  },
  {
    id: "clothes",
    name: "Emergency Clothes",
    category: "Clothing",
    icon: "👕",
    quantity: 420,
    unit: "sets",
    description: "Clean clothes for affected citizens",
  },
  {
    id: "blankets",
    name: "Blankets",
    category: "Shelter",
    icon: "🛏️",
    quantity: 300,
    unit: "pieces",
    description: "Warm emergency blankets",
  },
  {
    id: "tents",
    name: "Emergency Tents",
    category: "Shelter",
    icon: "⛺",
    quantity: 85,
    unit: "tents",
    description: "Temporary emergency shelters",
  },
  {
    id: "medical",
    name: "Medical Kits",
    category: "Medical",
    icon: "🩹",
    quantity: 175,
    unit: "kits",
    description: "First-aid and emergency medical supplies",
  },
  {
    id: "medicine",
    name: "Essential Medicines",
    category: "Medical",
    icon: "💊",
    quantity: 250,
    unit: "packs",
    description: "Basic emergency medicines",
  },
  {
    id: "baby",
    name: "Baby Care Kits",
    category: "Special Needs",
    icon: "🍼",
    quantity: 110,
    unit: "kits",
    description: "Infant food and baby essentials",
  },
  {
    id: "hygiene",
    name: "Hygiene Kits",
    category: "Hygiene",
    icon: "🧼",
    quantity: 260,
    unit: "kits",
    description: "Soap, sanitizer and hygiene items",
  },
  {
    id: "flashlights",
    name: "Flashlights",
    category: "Equipment",
    icon: "🔦",
    quantity: 180,
    unit: "pieces",
    description: "Battery-powered emergency lights",
  },
  {
    id: "powerbanks",
    name: "Power Banks",
    category: "Equipment",
    icon: "🔋",
    quantity: 95,
    unit: "pieces",
    description: "Portable charging equipment",
  },
  {
    id: "rescue",
    name: "Rescue Equipment",
    category: "Rescue",
    icon: "🧰",
    quantity: 75,
    unit: "sets",
    description: "Ropes, helmets and rescue equipment",
  },
];

/* =========================================================
   LOCATION
========================================================= */

function formatLocation(location) {
  if (!location) {
    return "Location unavailable";
  }

  if (typeof location === "object") {
    if (location.address) {
      return location.address;
    }

    if (
      location.latitude !== undefined &&
      location.longitude !== undefined
    ) {
      return `${location.latitude}, ${location.longitude}`;
    }

    return "Location available";
  }

  return String(location);
}

/* =========================================================
   DATE + TIME
========================================================= */

function formatDateTime(value) {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/* =========================================================
   RECOMMENDATION HELPERS
========================================================= */

function getRecommendedTeam(emergency) {
  const type =
    emergency?.type ||
    emergency?.emergencyType ||
    "";

  const candidates = [];

  const add = (
    teamName,
    score,
    reason
  ) => {
    const team = TEAMS.find(
      (item) =>
        item.name === teamName
    );

    if (team) {
      candidates.push({
        ...team,
        recommendationScore:
          score,
        recommendationReason:
          reason,
      });
    }
  };

  if (type === "Flood") {
    add(
      "Water Rescue Team",
      96,
      "Specialized water and flood rescue capability"
    );

    add(
      "Rescue Unit Alpha",
      88,
      "General rescue, evacuation and first aid"
    );

    add(
      "Emergency Response Unit",
      82,
      "Multi-disaster backup capability"
    );
  } else if (type === "Fire") {
    add(
      "Rapid Fire Unit",
      97,
      "Dedicated fire suppression and evacuation"
    );

    add(
      "Hazard Response Team",
      86,
      "Useful for hazardous fire situations"
    );

    add(
      "Emergency Response Unit",
      81,
      "General emergency backup"
    );
  } else if (
    type === "Earthquake"
  ) {
    add(
      "Urban Search & Rescue",
      97,
      "Collapsed-building and trapped-victim expertise"
    );

    add(
      "Rescue Unit Alpha",
      87,
      "General rescue and evacuation"
    );

    add(
      "Medical Response Team",
      84,
      "Trauma and emergency medical support"
    );
  } else if (
    type === "Landslide"
  ) {
    add(
      "Mountain Rescue Unit",
      97,
      "Terrain, rockfall and landslide capability"
    );

    add(
      "Rescue Unit Alpha",
      84,
      "General rescue and evacuation"
    );

    add(
      "Emergency Response Unit",
      80,
      "General disaster response"
    );
  } else if (
    type === "Cyclone"
  ) {
    add(
      "Coastal Rescue Unit",
      96,
      "Cyclone, storm surge and coastal evacuation"
    );

    add(
      "Water Rescue Team",
      89,
      "Water rescue capability"
    );

    add(
      "Disaster Relief Unit",
      84,
      "Large-scale relief coordination"
    );
  } else {
    add(
      "Emergency Response Unit",
      92,
      "Rapid multi-disaster response"
    );

    add(
      "Rescue Unit Alpha",
      88,
      "General emergency rescue"
    );

    add(
      "Medical Response Team",
      82,
      "Medical and first-aid support"
    );
  }

  return candidates;
}

function getRecommendedResources(
  group
) {
  const people = Math.max(
    1,
    Number(group?.people) || 1
  );

  const type =
    group?.type || "";

  const needs =
    group?.specialNeeds || [];

  const recommendations = [];

  const add = (
    id,
    quantity,
    reason
  ) => {
    const resource =
      INITIAL_RESOURCES.find(
        (item) =>
          item.id === id
      );

    if (!resource) {
      return;
    }

    recommendations.push({
      ...resource,
      recommendedQuantity:
        quantity,
      reason,
    });
  };

  if (type === "Flood") {
    add(
      "water",
      people * 2,
      "Essential drinking water"
    );

    add(
      "food",
      people,
      "Emergency food support"
    );

    add(
      "blankets",
      Math.max(
        1,
        Math.ceil(people / 2)
      ),
      "Temporary protection"
    );

    add(
      "rescue",
      1,
      "Rescue and evacuation equipment"
    );
  } else if (type === "Fire") {
    add(
      "medical",
      Math.max(
        1,
        Math.ceil(people / 5)
      ),
      "First-aid and burn response"
    );

    add(
      "water",
      people,
      "Emergency hydration"
    );

    add(
      "flashlights",
      Math.max(
        1,
        Math.ceil(people / 4)
      ),
      "Visibility during evacuation"
    );
  } else if (
    type === "Earthquake"
  ) {
    add(
      "medical",
      Math.max(
        1,
        Math.ceil(people / 5)
      ),
      "Trauma and first aid support"
    );

    add(
      "water",
      people * 2,
      "Emergency hydration"
    );

    add(
      "food",
      people,
      "Emergency meals"
    );

    add(
      "rescue",
      1,
      "Search and rescue equipment"
    );
  } else if (
    type === "Landslide"
  ) {
    add(
      "rescue",
      1,
      "Terrain rescue equipment"
    );

    add(
      "medical",
      Math.max(
        1,
        Math.ceil(people / 5)
      ),
      "Injury response"
    );

    add(
      "water",
      people * 2,
      "Emergency hydration"
    );
  } else if (
    type === "Cyclone"
  ) {
    add(
      "water",
      people * 2,
      "Emergency drinking water"
    );

    add(
      "food",
      people,
      "Emergency meals"
    );

    add(
      "blankets",
      Math.max(
        1,
        Math.ceil(people / 2)
      ),
      "Temporary shelter support"
    );

    add(
      "flashlights",
      Math.max(
        1,
        Math.ceil(people / 4)
      ),
      "Power outage preparedness"
    );
  } else {
    add(
      "water",
      people * 2,
      "General emergency hydration"
    );

    add(
      "food",
      people,
      "General emergency meals"
    );

    add(
      "medical",
      Math.max(
        1,
        Math.ceil(people / 5)
      ),
      "General first aid"
    );
  }

  if (
    needs.some(
      (item) =>
        item === "Infant / Child"
    )
  ) {
    add(
      "baby",
      Math.max(
        1,
        Math.ceil(people / 3)
      ),
      "Infant and child support"
    );
  }

  if (
    needs.some(
      (item) =>
        item === "Medical help" ||
        item === "Medication"
    )
  ) {
    add(
      "medicine",
      Math.max(
        1,
        Math.ceil(people / 4)
      ),
      "Additional medical support"
    );
  }

  return recommendations;
}

/* =========================================================
   PRIORITY
========================================================= */

function calculatePriorityScore(
  group
) {
  let score = 20;

  if (group?.isSOS) {
    score += 35;
  }

  if (
    group?.severity ===
    "Critical"
  ) {
    score += 20;
  } else if (
    group?.severity === "High"
  ) {
    score += 13;
  } else {
    score += 7;
  }

  const people =
    Number(group?.people) || 1;

  score += Math.min(
    people * 1.5,
    15
  );

  const specialNeedsCount =
    Array.isArray(
      group?.specialNeeds
    )
      ? group.specialNeeds.length
      : 0;

  score += Math.min(
    specialNeedsCount * 3,
    9
  );

  if (
    Number(group?.children) > 0
  ) {
    score += 4;
  }

  if (
    Number(group?.elderly) > 0
  ) {
    score += 4;
  }

  if (
    group?.medicalInfo ||
    group?.medicalNeed
  ) {
    score += 5;
  }

  if (
    group?.status === "Pending"
  ) {
    score += 4;
  }

  return Math.min(
    Math.round(score),
    100
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [selectedTeam, setSelectedTeam] =
    useState(null);

  const [dispatching, setDispatching] =
    useState(false);

  const [notification, setNotification] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [resourceModal, setResourceModal] =
    useState(false);

  const [selectedResource, setSelectedResource] =
    useState(null);

  const [resourceQuantity, setResourceQuantity] =
    useState("");

  const [allocatingResource, setAllocatingResource] =
    useState(false);

  const [incidentModal, setIncidentModal] =
    useState(false);

  const [resources, setResources] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "resqnetResourceStock"
          );

        return saved
          ? JSON.parse(saved)
          : INITIAL_RESOURCES;
      } catch {
        return INITIAL_RESOURCES;
      }
    });

  /* =======================================================
     SAVE LOCAL STOCK
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(
      "resqnetResourceStock",
      JSON.stringify(resources)
    );
  }, [resources]);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const showNotification = (
    message
  ) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 4500);
  };

  /* =======================================================
     FETCH EMERGENCIES
  ======================================================= */

  const fetchEmergencies = async (
    silent = false
  ) => {
    try {
      if (!silent) {
        setLoading(true);
      }

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
          result.message ||
            "Failed to fetch emergencies."
        );
      }

      const formatted =
        (result.data || []).map(
          (
            emergency,
            index
          ) => {
            let severity =
              "Medium";

            if (
              emergency.isSOS ||
              emergency.emergencyType ===
                "Fire" ||
              emergency.emergencyType ===
                "Earthquake"
            ) {
              severity =
                "Critical";
            } else if (
              emergency.emergencyType ===
                "Flood" ||
              emergency.emergencyType ===
                "Landslide" ||
              emergency.emergencyType ===
                "Cyclone"
            ) {
              severity =
                "High";
            }

            const priority =
              severity ===
              "Critical"
                ? 95
                : severity ===
                  "High"
                ? 82
                : 65;

            return {
              ...emergency,

              id:
                `RQ-${String(
                  10000 + index
                )}`,

              mongoId:
                emergency._id,

              citizenName:
                emergency.name ||
                "Unknown citizen",

              type:
                emergency.emergencyType ||
                "Other",

              area:
                formatLocation(
                  emergency.location
                ),

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
                emergency.specialNeeds ||
                [],

              severity,

              priority,

              assignedTeam:
                emergency.assignedTeam ||
                "",

              status:
                emergency.status ||
                "Pending",

              eta:
                Number(
                  emergency.eta
                ) || 0,

              allocatedResources:
                emergency.allocatedResources ||
                [],
            };
          }
        );

      setRequests(
        formatted
      );
    } catch (error) {
      console.error(
        "Admin dashboard fetch error:",
        error
      );

      if (!silent) {
        showNotification(
          "Could not load emergencies from backend."
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchEmergencies();
  }, []);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        fetchEmergencies(
          true
        );
      }, 3000);

    return () =>
      clearInterval(
        interval
      );
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredRequests =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const matchesFilter =
            filter === "All" ||
            request.severity ===
              filter;

          const searchable =
            `
              ${request.id}
              ${request._id}
              ${request.citizenName}
              ${request.type}
              ${request.area}
              ${request.status}
              ${request.assignedTeam}
            `.toLowerCase();

          return (
            matchesFilter &&
            searchable.includes(
              query
            )
          );
        }
      );
    }, [
      requests,
      filter,
      search,
    ]);

  /* =======================================================
     GROUP REQUESTS
  ======================================================= */

  const groupedRequests =
    useMemo(() => {
      const groups = {};

      filteredRequests.forEach(
        (request) => {
          const location =
            request.area
              ?.trim()
              .toLowerCase() ||
            "unknown";

          const type =
            request.type
              ?.trim()
              .toLowerCase() ||
            "other";

          const key =
            `${type}__${location}`;

          if (!groups[key]) {
            groups[key] = {
              id: key,
              type:
                request.type,
              area:
                request.area,
              severity:
                request.severity,
              requests: [],
              people: 0,
              adults: 0,
              children: 0,
              elderly: 0,
              assignedTeam:
                request.assignedTeam ||
                "",
              status:
                request.status ||
                "Pending",
              isSOS:
                Boolean(
                  request.isSOS
                ),
              specialNeeds: [],
              descriptions: [],
              firstRequest:
                request,
            };
          }

          groups[key].requests.push(
            request
          );

          groups[key].people +=
            Number(
              request.people
            ) || 0;

          groups[key].adults +=
            Number(
              request.adults
            ) || 0;

          groups[key].children +=
            Number(
              request.children
            ) || 0;

          groups[key].elderly +=
            Number(
              request.elderly
            ) || 0;

          if (
            request.isSOS
          ) {
            groups[key].isSOS =
              true;
          }

          if (
            request.assignedTeam &&
            !groups[key]
              .assignedTeam
          ) {
            groups[key].assignedTeam =
              request.assignedTeam;
          }

          if (
            request.status !==
              "Pending" &&
            groups[key]
              .status ===
              "Pending"
          ) {
            groups[key].status =
              request.status;
          }

          if (
            Array.isArray(
              request.specialNeeds
            )
          ) {
            groups[key]
              .specialNeeds.push(
                ...request.specialNeeds
              );
          }

          if (
            request.description
          ) {
            groups[key]
              .descriptions.push(
                request.description
              );
          }
        }
      );

      return Object.values(
        groups
      )
        .map(
          (group) => ({
            ...group,

            specialNeeds:
              [
                ...new Set(
                  group.specialNeeds
                ),
              ],

            priorityScore:
              calculatePriorityScore(
                group
              ),
          })
        )
        .sort(
          (a, b) => {
            if (
              a.isSOS !==
              b.isSOS
            ) {
              return a.isSOS
                ? -1
                : 1;
            }

            return (
              b.priorityScore -
              a.priorityScore
            );
          }
        );
    }, [
      filteredRequests,
    ]);

  /* =======================================================
     SELECT INCIDENT
  ======================================================= */

  const selectIncidentGroup =
    (group) => {
      setSelectedRequest(
        group
      );

      setSelectedTeam(
        null
      );

      setIncidentModal(
        true
      );
    };

  /* =======================================================
     DISPATCH GROUP
  ======================================================= */

  const dispatchTeam =
    async () => {
      if (
        !selectedRequest ||
        !selectedTeam
      ) {
        showNotification(
          "Please select a response team first."
        );

        return;
      }

      setDispatching(
        true
      );

      try {
        const groupRequests =
          selectedRequest.requests ||
          [];

        const responses =
          await Promise.all(
            groupRequests.map(
              async (
                request
              ) => {
                return fetch(
                  `${API_URL}/emergency/${request._id}`,
                  {
                    method:
                      "PUT",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body:
                      JSON.stringify(
                        {
                          status:
                            "Dispatched",

                          assignedTeam:
                            selectedTeam.name,

                          eta:
                            selectedTeam.eta,
                        }
                      ),
                  }
                );
              }
            )
          );

        for (
          const response of
            responses
        ) {
          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Dispatch failed."
            );
          }
        }

        setRequests(
          (previous) =>
            previous.map(
              (
                request
              ) => {
                const isInGroup =
                  groupRequests.some(
                    (item) =>
                      item._id ===
                      request._id
                  );

                return isInGroup
                  ? {
                      ...request,
                      status:
                        "Dispatched",
                      assignedTeam:
                        selectedTeam.name,
                      eta:
                        selectedTeam.eta,
                    }
                  : request;
              }
            )
        );

        showNotification(
          `✓ ${selectedTeam.name} dispatched to ${groupRequests.length} related request${
            groupRequests.length !==
            1
              ? "s"
              : ""
          }.`
        );

        setIncidentModal(
          false
        );

        setSelectedRequest(
          null
        );

        setSelectedTeam(
          null
        );

        await fetchEmergencies(
          true
        );
      } catch (error) {
        console.error(
          "Dispatch error:",
          error
        );

        showNotification(
          `Dispatch failed: ${error.message}`
        );
      } finally {
        setDispatching(
          false
        );
      }
    };

  /* =======================================================
     RESOURCE ALLOCATION
  ======================================================= */

  const openResourceAllocation =
    () => {
      if (!selectedRequest) {
        showNotification(
          "Please select an incident first."
        );

        return;
      }

      setSelectedResource(
        null
      );

      setResourceQuantity(
        ""
      );

      setResourceModal(
        true
      );
    };

  const allocateResource =
    async () => {
      if (
        !selectedRequest ||
        !selectedResource
      ) {
        showNotification(
          "Please select a resource."
        );

        return;
      }

      const quantity =
        Number(
          resourceQuantity
        );

      if (
        !quantity ||
        quantity <= 0
      ) {
        showNotification(
          "Please enter a valid quantity."
        );

        return;
      }

      if (
        quantity >
        selectedResource.quantity
      ) {
        showNotification(
          `Only ${selectedResource.quantity} ${selectedResource.unit} available.`
        );

        return;
      }

      setAllocatingResource(
        true
      );

      try {
        const groupRequests =
          selectedRequest.requests ||
          [];

        const target =
          groupRequests[0];

        if (!target?._id) {
          throw new Error(
            "No incident available for resource allocation."
          );
        }

        const previousAllocations =
          Array.isArray(
            target.allocatedResources
          )
            ? target.allocatedResources
            : [];

        const existingIndex =
          previousAllocations.findIndex(
            (item) =>
              item.resourceId ===
              selectedResource.id
          );

        let updatedAllocations =
          [
            ...previousAllocations,
          ];

        if (
          existingIndex >=
          0
        ) {
          const existing =
            updatedAllocations[
              existingIndex
            ];

          updatedAllocations[
            existingIndex
          ] = {
            ...existing,
            quantity:
              Number(
                existing.quantity ||
                  0
              ) +
              quantity,

            allocatedAt:
              new Date().toISOString(),
          };
        } else {
          updatedAllocations.push(
            {
              resourceId:
                selectedResource.id,

              resourceName:
                selectedResource.name,

              category:
                selectedResource.category,

              quantity,

              unit:
                selectedResource.unit,

              icon:
                selectedResource.icon,

              allocatedAt:
                new Date().toISOString(),
            }
          );
        }

        const response =
          await fetch(
            `${API_URL}/emergency/${target._id}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  allocatedResources:
                    updatedAllocations,
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
              "Resource allocation failed."
          );
        }

        setRequests(
          (previous) =>
            previous.map(
              (request) =>
                request._id ===
                target._id
                  ? {
                      ...request,
                      allocatedResources:
                        updatedAllocations,
                    }
                  : request
            )
        );

        setResources(
          (previous) =>
            previous.map(
              (resource) =>
                resource.id ===
                selectedResource.id
                  ? {
                      ...resource,
                      quantity:
                        resource.quantity -
                        quantity,
                    }
                  : resource
            )
        );

        setResourceModal(
          false
        );

        setSelectedResource(
          null
        );

        setResourceQuantity(
          ""
        );

        showNotification(
          `✓ ${quantity} ${selectedResource.unit} of ${selectedResource.name} allocated to ${selectedRequest.type} incident.`
        );

        await fetchEmergencies(
          true
        );
      } catch (error) {
        console.error(
          "Resource allocation error:",
          error
        );

        showNotification(
          `Resource allocation failed: ${error.message}`
        );
      } finally {
        setAllocatingResource(
          false
        );
      }
    };

  /* =======================================================
     STATS
  ======================================================= */

  const pendingCount =
    requests.filter(
      (item) =>
        item.status ===
          "Pending" ||
        item.status ===
          "Dispatched"
    ).length;

  const activeCount =
    requests.filter(
      (item) =>
        [
          "Accepted",
          "Started",
          "Arriving",
          "Arrived",
          "En Route",
        ].includes(
          item.status
        )
    ).length;

  const sosCount =
    requests.filter(
      (item) =>
        item.isSOS
    ).length;

  const totalResourceUnits =
    resources.reduce(
      (
        total,
        resource
      ) =>
        total +
        Number(
          resource.quantity
        ),
      0
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="resq-dashboard">

      <Navbar />

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="admin-hero">

          <div className="hero-live">
            LIVE EMERGENCY COMMAND
          </div>

          <h1>
            Respond faster.
            <br />
            Coordinate smarter.
          </h1>

          <p>
            Real citizen emergencies
            connected directly to
            response teams, relief
            resources and command
            intelligence.
          </p>

          <div className="hero-status">

            <span className="status-dot"></span>

            SYSTEM LIVE

          </div>

        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              📋
            </div>

            <small>
              TOTAL REQUESTS
            </small>

            <h2>
              {requests.length}
            </h2>

            <span className="stat-caption">
              Citizen emergencies
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              ⏱️
            </div>

            <small>
              PENDING / DISPATCHED
            </small>

            <h2>
              {pendingCount}
            </h2>

            <span className="stat-caption">
              Awaiting response
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              🚑
            </div>

            <small>
              ACTIVE RESPONSES
            </small>

            <h2>
              {activeCount}
            </h2>

            <span className="stat-caption">
              Teams currently responding
            </span>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              🚨
            </div>

            <small>
              SOS REQUESTS
            </small>

            <h2>
              {sosCount}
            </h2>

            <span className="stat-caption">
              Critical alerts
            </span>

          </div>

        </section>

        {/* =================================================
            COMMAND OVERVIEW
        ================================================= */}

        <section className="command-overview">

          <div className="command-overview-heading">

            <div>

              <span className="eyebrow">
                COMMAND INTELLIGENCE
              </span>

              <h2>
                Smart response guidance
              </h2>

              <p>
                ResQNet recommends priority,
                suitable teams and resources.
                The administrator always makes
                the final decision.
              </p>

            </div>

            <div className="admin-control-badge">

              <span>●</span>

              ADMIN CONTROLLED

            </div>

          </div>

          <div className="command-overview-grid">

            <div>

              <span>
                🚨
              </span>

              <div>

                <strong>
                  SOS First
                </strong>

                <small>
                  Critical SOS incidents are
                  automatically prioritized.
                </small>

              </div>

            </div>

            <div>

              <span>
                🧠
              </span>

              <div>

                <strong>
                  Priority Score
                </strong>

                <small>
                  People, severity, medical
                  needs and SOS influence urgency.
                </small>

              </div>

            </div>

            <div>

              <span>
                👥
              </span>

              <div>

                <strong>
                  Incident Clustering
                </strong>

                <small>
                  Similar requests from the
                  same location are grouped.
                </small>

              </div>

            </div>

            <div>

              <span>
                🎯
              </span>

              <div>

                <strong>
                  Admin Final Decision
                </strong>

                <small>
                  Recommendations never dispatch
                  or allocate automatically.
                </small>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            REQUEST CONTROLS
        ================================================= */}

        <section className="request-controls">

          <div className="search-box">

            <span>
              ⌕
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search emergency, citizen, location or team..."
            />

          </div>

          <div className="filter-buttons">

            {[
              "All",
              "Critical",
              "High",
              "Medium",
            ].map(
              (item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    filter ===
                    item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      item
                    )
                  }
                >
                  {item}
                </button>

              )
            )}

          </div>

        </section>

        {/* =================================================
            INCIDENT PANEL
        ================================================= */}

        <section className="requests-panel">

          <div className="requests-header">

            <div>

              <span className="eyebrow">
                INCIDENT MANAGEMENT
              </span>

              <h2>
                Citizen Emergency Requests
              </h2>

              <p>
                SOS incidents appear first.
                Similar emergencies are grouped
                by disaster type and location.
              </p>

            </div>

            <div className="live-fetch">

              <span></span>

              LIVE DATABASE

            </div>

          </div>

          {loading ? (

            <div className="loading-state">

              <div className="loading-spinner"></div>

              <h3>
                Loading emergencies...
              </h3>

              <p>
                Connecting to the command system.
              </p>

            </div>

          ) : groupedRequests.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No emergency requests
              </h3>

              <p>
                New citizen requests will
                appear here automatically.
              </p>

            </div>

          ) : (

            <div className="incident-groups">

              {groupedRequests.map(
                (group) => (

                  <div
                    className={
                      `incident-group ${
                        group.isSOS
                          ? "incident-sos"
                          : ""
                      }`
                    }
                    key={
                      group.id
                    }
                  >

                    {/* GROUP HEADER */}

                    <div className="group-header">

                      <div className="group-main">

                        <div className="group-title-row">

                          {group.isSOS && (
                            <span className="sos-badge">
                              🚨 SOS PRIORITY
                            </span>
                          )}

                          <span className="group-type">
                            {
                              group.type
                            }
                          </span>

                          <span
                            className={
                              `severity-badge ${
                                group.severity.toLowerCase()
                              }`
                            }
                          >
                            {
                              group.severity
                            }
                          </span>

                        </div>

                        <h3>
                          📍{" "}
                          {
                            group.area
                          }
                        </h3>

                        <p>
                          {
                            group.requests.length
                          }{" "}
                          related request
                          {
                            group.requests.length !==
                            1
                              ? "s"
                              : ""
                          }{" "}
                          ·{" "}
                          {
                            group.people
                          }{" "}
                          people affected
                        </p>

                      </div>

                      <div className="priority-score-card">

                        <span>
                          PRIORITY
                        </span>

                        <strong>
                          {
                            group.priorityScore
                          }

                          <small>
                            /100
                          </small>
                        </strong>

                        {group.requests[
                          0
                        ]?.createdAt && (
                          <small className="group-created-time">
                            🕒{" "}
                            {formatDateTime(
                              group.requests[
                                0
                              ]
                                .createdAt
                            )}
                          </small>
                        )}

                      </div>

                    </div>

                    {/* GROUP BODY */}

                    <div className="group-body">

                      <div className="group-mini-stats">

                        <div>

                          <span>
                            👥
                          </span>

                          <strong>
                            {
                              group.people
                            }
                          </strong>

                          <small>
                            People
                          </small>

                        </div>

                        <div>

                          <span>
                            👶
                          </span>

                          <strong>
                            {
                              group.children
                            }
                          </strong>

                          <small>
                            Children
                          </small>

                        </div>

                        <div>

                          <span>
                            👵
                          </span>

                          <strong>
                            {
                              group.elderly
                            }
                          </strong>

                          <small>
                            Elderly
                          </small>

                        </div>

                        <div>

                          <span>
                            📋
                          </span>

                          <strong>
                            {
                              group.requests
                                .length
                            }
                          </strong>

                          <small>
                            Requests
                          </small>

                        </div>

                      </div>

                      <div className="group-command-summary">

                        <div>

                          <span className="summary-label">
                            RECOMMENDED TEAM
                          </span>

                          <strong>
                            {
                              getRecommendedTeam(
                                group
                              )[0]?.icon
                            }{" "}
                            {
                              getRecommendedTeam(
                                group
                              )[0]?.name ||
                              "Review manually"
                            }
                          </strong>

                          <small>
                            {
                              getRecommendedTeam(
                                group
                              )[0]
                                ?.recommendationScore ||
                              0
                            }
                            % suitability
                          </small>

                        </div>

                        <div>

                          <span className="summary-label">
                            RESOURCE NEED
                          </span>

                          <strong>
                            {
                              getRecommendedResources(
                                group
                              ).length
                            }{" "}
                            recommendations
                          </strong>

                          <small>
                            Admin must enter final quantities
                          </small>

                        </div>

                      </div>

                      <div className="group-footer">

                        <div>

                          {group.assignedTeam ? (

                            <span className="assigned-team">
                              🚑{" "}
                              {
                                group.assignedTeam
                              }
                            </span>

                          ) : (

                            <span className="awaiting-team">
                              Waiting for team assignment
                            </span>

                          )}

                        </div>

                        <button
                          type="button"
                          className="open-incident-btn"
                          onClick={() =>
                            selectIncidentGroup(
                              group
                            )
                          }
                        >
                          Open Incident →
                        </button>

                      </div>

                    </div>

                    {/* INDIVIDUAL REQUESTS */}

                    <div className="group-requests">

                      {group.requests.map(
                        (request) => (

                          <div
                            key={
                              request._id
                            }
                            className="request-row"
                          >

                            <div className="request-main">

                              <div className="request-title-row">

                                <strong>
                                  {
                                    request.type
                                  }
                                </strong>

                                {request.isSOS && (
                                  <span className="sos-badge">
                                    SOS
                                  </span>
                                )}

                                <span
                                  className={
                                    `severity-badge ${
                                      request.severity.toLowerCase()
                                    }`
                                  }
                                >
                                  {
                                    request.severity
                                  }
                                </span>

                              </div>

                              <h3>
                                {
                                  request.citizenName
                                }
                              </h3>

                              <p className="location-line">
                                📍{" "}
                                {
                                  request.area
                                }
                              </p>

                              <div className="request-meta">

                                <span>
                                  👥{" "}
                                  {
                                    request.people
                                  }{" "}
                                  people
                                </span>

                                <span>
                                  Status:{" "}
                                  {
                                    request.status
                                  }
                                </span>

                                <span>
                                  ID:{" "}
                                  {
                                    request.id
                                  }
                                </span>

                                <span>
                                  🕒{" "}
                                  {formatDateTime(
                                    request.createdAt
                                  )}
                                </span>

                              </div>

                              {request.assignedTeam && (
                                <div className="assigned-team">
                                  🚑{" "}
                                  {
                                    request.assignedTeam
                                  }
                                </div>
                              )}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            RESOURCE STOCK
        ================================================= */}

        <section className="resource-overview">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                RESOURCE CONTROL
              </span>

              <h2>
                Available Relief Resources
              </h2>

              <p>
                Stock decreases whenever the
                administrator allocates supplies.
              </p>

            </div>

            <div className="resource-total">

              <span>
                AVAILABLE UNITS
              </span>

              <strong>
                {
                  totalResourceUnits.toLocaleString()
                }
              </strong>

            </div>

          </div>

          <div className="resource-grid">

            {resources.map(
              (resource) => (

                <div
                  key={
                    resource.id
                  }
                  className={
                    `resource-card ${
                      resource.quantity <=
                      20
                        ? "resource-low"
                        : ""
                    }`
                  }
                >

                  <div className="resource-top">

                    <div className="resource-icon">
                      {
                        resource.icon
                      }
                    </div>

                    <span className="resource-category">
                      {
                        resource.category
                      }
                    </span>

                  </div>

                  <h3>
                    {
                      resource.name
                    }
                  </h3>

                  <p>
                    {
                      resource.description
                    }
                  </p>

                  <div className="resource-bottom">

                    <div>

                      <strong>
                        {
                          resource.quantity.toLocaleString()
                        }
                      </strong>

                      <span>
                        {
                          resource.unit
                        }
                      </span>

                    </div>

                    <span
                      className={
                        resource.quantity <=
                        20
                          ? "resource-warning"
                          : "resource-available"
                      }
                    >
                      {resource.quantity <=
                      20
                        ? "LOW STOCK"
                        : "Available"}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

        {/* =================================================
            TEAMS
        ================================================= */}

        <section className="teams-panel">

          <div className="teams-header">

            <div>

              <span className="eyebrow">
                RESPONSE NETWORK
              </span>

              <h2>
                All Rescue Teams
              </h2>

              <p>
                Recommendations assist the admin;
                team selection remains manual.
              </p>

            </div>

            <div className="team-count">

              <strong>
                {TEAMS.length}
              </strong>

              <span>
                RESPONSE TEAMS
              </span>

            </div>

          </div>

          <div className="teams-grid">

            {TEAMS.map(
              (team) => (

                <div
                  key={
                    team.id
                  }
                  className={
                    `team-card ${
                      selectedTeam?.id ===
                      team.id
                        ? "team-selected"
                        : ""
                    }`
                  }
                >

                  <div className="team-card-top">

                    <div className="team-icon">
                      {
                        team.icon
                      }
                    </div>

                    <span className="available-badge">
                      ● Available
                    </span>

                  </div>

                  <h3>
                    {
                      team.name
                    }
                  </h3>

                  <p className="team-specialty">
                    {
                      team.specialty
                    }
                  </p>

                  <p className="team-capabilities">
                    {
                      team.capabilities
                    }
                  </p>

                  <div className="team-footer">

                    <span>
                      📍{" "}
                      {
                        team.location
                      }
                    </span>

                    <strong>
                      ETA{" "}
                      {
                        team.eta
                      }{" "}
                      min
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>

      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      {notification && (

        <div className="admin-notification">

          <span className="notification-icon">
            ✓
          </span>

          <span>
            {
              notification
            }
          </span>

        </div>

      )}

      {/* =====================================================
          INCIDENT DETAIL MODAL
      ===================================================== */}

      {incidentModal &&
        selectedRequest && (

        <div
          className="modal-overlay"
          onClick={() => {

            if (
              !dispatching &&
              !allocatingResource
            ) {
              setIncidentModal(
                false
              );
            }

          }}
        >

          <div
            className="incident-detail-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="incident-detail-header">

              <div>

                <span className="eyebrow">
                  INCIDENT COMMAND
                </span>

                <h2>
                  {
                    selectedRequest.type
                  }{" "}
                  Response Group
                </h2>

                <p>
                  📍{" "}
                  {
                    selectedRequest.area
                  }
                </p>

                <div className="incident-created-time">
                  🕒 Received:{" "}
                  {formatDateTime(
                    selectedRequest
                      .firstRequest
                      ?.createdAt
                  )}
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setIncidentModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            {/* PRIORITY */}

            <div className="intelligence-panel">

              <div className="intelligence-score">

                <span>
                  PRIORITY SCORE
                </span>

                <strong>
                  {
                    selectedRequest.priorityScore
                  }

                  <small>
                    /100
                  </small>
                </strong>

                {selectedRequest.isSOS && (
                  <b>
                    🚨 SOS CRITICAL
                  </b>
                )}

              </div>

              <div className="intelligence-copy">

                <span>
                  COMMAND INTELLIGENCE
                </span>

                <p>
                  ResQNet recommendations are
                  advisory only. The administrator
                  chooses the final response team
                  and resource quantities.
                </p>

              </div>

            </div>

            {/* CITIZEN DETAILS */}

            <div className="detail-section">

              <div className="detail-section-title">

                <span>
                  01
                </span>

                <div>

                  <strong>
                    Citizen & incident details
                  </strong>

                  <small>
                    Information received from
                    the citizen portal
                  </small>

                </div>

              </div>

              <div className="detail-grid">

                <div>

                  <span>
                    NAME
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.citizenName ||
                      "—"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    PHONE
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.phone ||
                      "—"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.email ||
                      "—"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    INCIDENT TYPE
                  </span>

                  <strong>
                    {
                      selectedRequest.type
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    PEOPLE AFFECTED
                  </span>

                  <strong>
                    {
                      selectedRequest.people
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    ADULTS
                  </span>

                  <strong>
                    {
                      selectedRequest.adults
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    CHILDREN
                  </span>

                  <strong>
                    {
                      selectedRequest.children
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    ELDERLY
                  </span>

                  <strong>
                    {
                      selectedRequest.elderly
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    REQUEST RECEIVED
                  </span>

                  <strong>
                    {formatDateTime(
                      selectedRequest
                        .firstRequest
                        ?.createdAt
                    )}
                  </strong>

                </div>

              </div>

              {selectedRequest
                .firstRequest
                ?.description && (

                <div className="detail-wide-box">

                  <span>
                    DESCRIPTION
                  </span>

                  <p>
                    {
                      selectedRequest
                        .firstRequest
                        .description
                    }
                  </p>

                </div>

              )}

              <div className="detail-grid">

                <div>

                  <span>
                    SPECIAL NEEDS
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .specialNeeds
                        .length >
                      0
                        ? selectedRequest.specialNeeds.join(
                            ", "
                          )
                        : "None reported"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    BLOOD GROUP
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.bloodGroup ||
                      "Not provided"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    MEDICAL INFORMATION
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.medicalInfo ||
                      "Not provided"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    EMERGENCY CONTACT
                  </span>

                  <strong>
                    {
                      selectedRequest
                        .firstRequest
                        ?.contactName ||
                      "Not provided"
                    }

                    {selectedRequest
                      .firstRequest
                      ?.contactPhone
                      ? ` · ${selectedRequest.firstRequest.contactPhone}`
                      : ""}
                  </strong>

                </div>

              </div>

            </div>

            {/* RECOMMENDED TEAM */}

            <div className="detail-section">

              <div className="detail-section-title">

                <span>
                  02
                </span>

                <div>

                  <strong>
                    Recommended response teams
                  </strong>

                  <small>
                    Suggestions only — admin chooses
                  </small>

                </div>

              </div>

              <div className="recommendation-team-grid">

                {getRecommendedTeam(
                  selectedRequest
                ).map(
                  (team) => (

                    <div
                      key={
                        team.id
                      }
                      className="recommendation-team"
                    >

                      <div className="recommendation-team-top">

                        <div className="recommendation-icon">
                          {
                            team.icon
                          }
                        </div>

                        <div className="recommendation-score">

                          <strong>
                            {
                              team.recommendationScore
                            }%
                          </strong>

                          <small>
                            suitable
                          </small>

                        </div>

                      </div>

                      <h3>
                        {
                          team.name
                        }
                      </h3>

                      <p>
                        {
                          team.recommendationReason
                        }
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* ADMIN TEAM SELECTION */}

            <div className="admin-decision-panel">

              <div>

                <span>
                  ADMIN FINAL DECISION
                </span>

                <h3>
                  Select response team
                </h3>

                <p>
                  Choose the team you consider
                  most suitable for this incident.
                </p>

              </div>

              <select
                value={
                  selectedTeam?.name ||
                  ""
                }
                onChange={(e) => {

                  const team =
                    TEAMS.find(
                      (item) =>
                        item.name ===
                        e.target.value
                    );

                  setSelectedTeam(
                    team || null
                  );

                }}
              >

                <option value="">
                  Select a response team
                </option>

                {TEAMS.map(
                  (team) => (

                    <option
                      key={
                        team.id
                      }
                      value={
                        team.name
                      }
                    >
                      {team.icon}{" "}
                      {
                        team.name
                      }{" "}
                      — ETA{" "}
                      {
                        team.eta
                      } min
                    </option>

                  )
                )}

              </select>

              {selectedTeam && (

                <div className="selected-team-preview">

                  <span>
                    SELECTED BY ADMIN
                  </span>

                  <strong>
                    {
                      selectedTeam.icon
                    }{" "}
                    {
                      selectedTeam.name
                    }
                  </strong>

                  <small>
                    {
                      selectedTeam.specialty
                    }{" "}
                    · ETA{" "}
                    {
                      selectedTeam.eta
                    } minutes
                  </small>

                </div>

              )}

              <button
                type="button"
                className="final-dispatch-btn"
                disabled={
                  !selectedTeam ||
                  dispatching ||
                  selectedRequest
                    .requests
                    ?.some(
                      (item) =>
                        item.status !==
                        "Pending"
                    )
                }
                onClick={
                  dispatchTeam
                }
              >
                {
                  dispatching
                    ? "Dispatching..."
                    : `🚑 Dispatch ${
                        selectedTeam?.name ||
                        "Selected Team"
                      }`
                }
              </button>

            </div>

            {/* RECOMMENDED RESOURCES */}

            <div className="detail-section">

              <div className="detail-section-title">

                <span>
                  03
                </span>

                <div>

                  <strong>
                    Recommended resources
                  </strong>

                  <small>
                    Suggested quantities are advisory
                  </small>

                </div>

              </div>

              <div className="recommended-resource-list">

                {getRecommendedResources(
                  selectedRequest
                ).map(
                  (resource) => (

                    <div
                      key={
                        resource.id
                      }
                      className="recommended-resource"
                    >

                      <div className="recommended-resource-icon">
                        {
                          resource.icon
                        }
                      </div>

                      <div>

                        <strong>
                          {
                            resource.name
                          }
                        </strong>

                        <small>
                          Suggested:{" "}
                          {
                            resource.recommendedQuantity
                          }{" "}
                          {
                            resource.unit
                          }
                        </small>

                        <em>
                          {
                            resource.reason
                          }
                        </em>

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                type="button"
                className="detail-resource-btn"
                onClick={
                  openResourceAllocation
                }
              >
                📦 Allocate Resources Manually
              </button>

            </div>

            {/* EXISTING ALLOCATIONS */}

            {selectedRequest
              .firstRequest
              ?.allocatedResources
              ?.length >
              0 && (

              <div className="detail-section">

                <div className="detail-section-title">

                  <span>
                    04
                  </span>

                  <div>

                    <strong>
                      Already allocated
                    </strong>

                    <small>
                      Supplies currently assigned
                    </small>

                  </div>

                </div>

                <div className="detail-allocated-list">

                  {selectedRequest
                    .firstRequest
                    .allocatedResources.map(
                      (
                        resource,
                        index
                      ) => (

                        <div
                          key={
                            index
                          }
                        >

                          <span>
                            {
                              resource.icon
                            }
                          </span>

                          <strong>
                            {
                              resource.quantity
                            }{" "}
                            {
                              resource.unit
                            }
                          </strong>

                          <small>
                            {
                              resource.resourceName
                            }
                          </small>

                        </div>

                      )
                    )}

                </div>

              </div>

            )}

            <div className="incident-modal-footer">

              <button
                type="button"
                className="close-detail-btn"
                onClick={() => {

                  setIncidentModal(
                    false
                  );

                  setSelectedRequest(
                    null
                  );

                  setSelectedTeam(
                    null
                  );

                }}
              >
                Close Incident
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RESOURCE MODAL
      ===================================================== */}

      {resourceModal &&
        selectedRequest && (

        <div
          className="modal-overlay resource-overlay"
          onClick={() => {

            if (
              !allocatingResource
            ) {
              setResourceModal(
                false
              );
            }

          }}
        >

          <div
            className="resource-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-top">

              <div>

                <span className="eyebrow">
                  RESOURCE ALLOCATION
                </span>

                <h2>
                  Allocate Relief Supplies
                </h2>

                <p>
                  Admin enters the final quantity.
                  Recommendations do not allocate
                  automatically.
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                disabled={
                  allocatingResource
                }
                onClick={() =>
                  setResourceModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="allocation-incident">

              <div className="allocation-incident-icon">
                📍
              </div>

              <div>

                <span>
                  ALLOCATING TO INCIDENT
                </span>

                <strong>
                  {
                    selectedRequest.type
                  }{" "}
                  ·{" "}
                  {
                    selectedRequest.area
                  }
                </strong>

                <small>
                  {
                    selectedRequest.people
                  }{" "}
                  people affected
                </small>

              </div>

            </div>

            <div className="modal-section">

              <label>
                01 · SELECT RESOURCE
              </label>

              <div className="modal-resource-grid">

                {resources.map(
                  (resource) => (

                    <button
                      key={
                        resource.id
                      }
                      type="button"
                      className={
                        `modal-resource ${
                          selectedResource?.id ===
                          resource.id
                            ? "selected"
                            : ""
                        } ${
                          resource.quantity <=
                          0
                            ? "out-of-stock"
                            : ""
                        }`
                      }
                      disabled={
                        resource.quantity <=
                        0
                      }
                      onClick={() =>
                        setSelectedResource(
                          resource
                        )
                      }
                    >

                      <span className="modal-resource-icon">
                        {
                          resource.icon
                        }
                      </span>

                      <span className="modal-resource-info">

                        <strong>
                          {
                            resource.name
                          }
                        </strong>

                        <small>
                          {
                            resource.quantity
                          }{" "}
                          {
                            resource.unit
                          }{" "}
                          available
                        </small>

                      </span>

                      {selectedResource?.id ===
                        resource.id && (

                        <span className="resource-check">
                          ✓
                        </span>

                      )}

                    </button>

                  )
                )}

              </div>

            </div>

            {selectedResource && (

              <div className="manual-quantity-panel">

                <div>

                  <span>
                    ADMIN QUANTITY
                  </span>

                  <strong>
                    {
                      selectedResource.icon
                    }{" "}
                    {
                      selectedResource.name
                    }
                  </strong>

                  <small>
                    Available stock:{" "}
                    {
                      selectedResource.quantity
                    }{" "}
                    {
                      selectedResource.unit
                    }
                  </small>

                </div>

                <div className="quantity-input-wrap">

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedResource.quantity
                    }
                    value={
                      resourceQuantity
                    }
                    onChange={(e) =>
                      setResourceQuantity(
                        e.target.value
                      )
                    }
                    placeholder="0"
                    autoFocus
                  />

                  <span>
                    {
                      selectedResource.unit
                    }
                  </span>

                </div>

              </div>

            )}

            <div className="modal-actions">

              <button
                type="button"
                className="modal-cancel"
                disabled={
                  allocatingResource
                }
                onClick={() =>
                  setResourceModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-allocate"
                disabled={
                  !selectedResource ||
                  !resourceQuantity ||
                  Number(
                    resourceQuantity
                  ) <= 0 ||
                  Number(
                    resourceQuantity
                  ) >
                    selectedResource?.quantity ||
                  allocatingResource
                }
                onClick={
                  allocateResource
                }
              >
                {
                  allocatingResource
                    ? "Allocating..."
                    : "📦 Allocate Selected Quantity"
                }
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;