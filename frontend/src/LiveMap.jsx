import { useMemo, useState } from "react";
import Navbar from "./Navbar";
import "./LiveMap.css";

function LiveMap() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPanel, setShowPanel] = useState(true);
  const [notification, setNotification] = useState("");

  /*
   * ============================================================
   * BACKEND-READY MAP DATA
   * Replace these arrays with API response data later.
   * ============================================================
   */

  const mapData = {
    emergencies: [
      {
        id: "EM-10482",
        type: "emergency",
        category: "Flood",
        title: "Government School Area",
        description: "Water level rising rapidly. Immediate evacuation required.",
        status: "Critical",
        priority: 96,
        people: 37,
        x: 24,
        y: 30,
        time: "12:41 PM",
      },
      {
        id: "EM-10479",
        type: "emergency",
        category: "Fire",
        title: "Central Market",
        description: "Commercial building fire reported.",
        status: "High",
        priority: 84,
        people: 8,
        x: 69,
        y: 42,
        time: "12:44 PM",
      },
      {
        id: "EM-10476",
        type: "emergency",
        category: "Landslide",
        title: "Hill View Road",
        description: "Road partially blocked by debris.",
        status: "High",
        priority: 81,
        people: 18,
        x: 42,
        y: 67,
        time: "12:47 PM",
      },
    ],

    volunteers: [
      {
        id: "VOL-28471",
        type: "volunteer",
        category: "Volunteer",
        title: "Aarav Sharma",
        description: "First Aid volunteer",
        status: "Available",
        skill: "First Aid",
        x: 34,
        y: 48,
      },
      {
        id: "VOL-30172",
        type: "volunteer",
        category: "Volunteer",
        title: "Meera Khan",
        description: "Logistics volunteer",
        status: "Available",
        skill: "Logistics",
        x: 57,
        y: 27,
      },
      {
        id: "VOL-11743",
        type: "volunteer",
        category: "Volunteer",
        title: "Rahul Verma",
        description: "Driver",
        status: "Responding",
        skill: "Driving",
        x: 62,
        y: 68,
      },
    ],

    teams: [
      {
        id: "TEAM-ART07",
        type: "team",
        category: "Response Team",
        title: "Alpha Response",
        description: "Flood rescue team",
        status: "En Route",
        eta: "12 min",
        x: 48,
        y: 56,
      },
      {
        id: "TEAM-RFR04",
        type: "team",
        category: "Response Team",
        title: "Rapid Fire Unit",
        description: "Fire & medical response",
        status: "Available",
        eta: "7 min",
        x: 76,
        y: 55,
      },
      {
        id: "TEAM-MRU05",
        type: "team",
        category: "Response Team",
        title: "Mountain Unit",
        description: "Landslide rescue",
        status: "Available",
        eta: "18 min",
        x: 29,
        y: 72,
      },
    ],

    resources: [
      {
        id: "RES-WATER",
        type: "resource",
        category: "Resource",
        title: "Drinking Water",
        description: "Emergency water stock",
        status: "Available",
        quantity: "840 units",
        x: 53,
        y: 78,
      },
      {
        id: "RES-MEDICAL",
        type: "resource",
        category: "Resource",
        title: "Medical Kits",
        description: "Emergency medical supplies",
        status: "Available",
        quantity: "216 kits",
        x: 83,
        y: 30,
      },
      {
        id: "RES-FOOD",
        type: "resource",
        category: "Resource",
        title: "Food Kits",
        description: "Ready-to-distribute food packages",
        status: "Limited",
        quantity: "520 kits",
        x: 18,
        y: 57,
      },
    ],

    shelters: [
      {
        id: "SH-04",
        type: "shelter",
        category: "Shelter",
        title: "Zone 4 Safe Shelter",
        description: "Emergency accommodation",
        status: "Open",
        capacity: "74 spaces",
        x: 35,
        y: 84,
      },
      {
        id: "SH-A",
        type: "shelter",
        category: "Shelter",
        title: "Community Shelter A",
        description: "Temporary relief shelter",
        status: "Open",
        capacity: "120 spaces",
        x: 72,
        y: 79,
      },
    ],

    hospitals: [
      {
        id: "HOSP-01",
        type: "hospital",
        category: "Hospital",
        title: "City Emergency Hospital",
        description: "Emergency and trauma care",
        status: "Operational",
        capacity: "18 beds available",
        x: 82,
        y: 68,
      },
      {
        id: "HOSP-02",
        type: "hospital",
        category: "Hospital",
        title: "District Hospital",
        description: "Emergency medical support",
        status: "Operational",
        capacity: "24 beds available",
        x: 60,
        y: 87,
      },
    ],

    fireStations: [
      {
        id: "FIRE-01",
        type: "fire",
        category: "Fire Station",
        title: "Central Fire Station",
        description: "Fire response unit",
        status: "Operational",
        x: 86,
        y: 45,
      },
    ],

    policeStations: [
      {
        id: "POL-01",
        type: "police",
        category: "Police Station",
        title: "Central Police Station",
        description: "Police and evacuation support",
        status: "Operational",
        x: 15,
        y: 37,
      },
    ],

    gasStations: [
      {
        id: "GAS-01",
        type: "gas",
        category: "Gas Station",
        title: "City Fuel Point",
        description: "Fuel availability",
        status: "Open",
        x: 63,
        y: 15,
      },
    ],

    safeZones: [
      {
        id: "SAFE-01",
        type: "safe",
        category: "Safe Zone",
        title: "ResQ Safe Zone",
        description: "Designated emergency gathering area",
        status: "Active",
        capacity: "150 people",
        x: 45,
        y: 18,
      },
    ],
  };

  /*
   * ============================================================
   * CATEGORY CONFIGURATION
   * ============================================================
   */

  const categories = [
    {
      id: "all",
      label: "Everything",
      icon: "◉",
    },
    {
      id: "emergency",
      label: "Emergencies",
      icon: "!",
      count: mapData.emergencies.length,
    },
    {
      id: "volunteer",
      label: "Volunteers",
      icon: "♙",
      count: mapData.volunteers.length,
    },
    {
      id: "team",
      label: "Response Teams",
      icon: "🚑",
      count: mapData.teams.length,
    },
    {
      id: "resource",
      label: "Resources",
      icon: "▣",
      count: mapData.resources.length,
    },
    {
      id: "shelter",
      label: "Shelters",
      icon: "⌂",
      count: mapData.shelters.length,
    },
    {
      id: "hospital",
      label: "Hospitals",
      icon: "✚",
      count: mapData.hospitals.length,
    },
    {
      id: "fire",
      label: "Fire Stations",
      icon: "♨",
      count: mapData.fireStations.length,
    },
    {
      id: "police",
      label: "Police Stations",
      icon: "★",
      count: mapData.policeStations.length,
    },
    {
      id: "gas",
      label: "Gas Stations",
      icon: "⛽",
      count: mapData.gasStations.length,
    },
    {
      id: "safe",
      label: "Safe Zones",
      icon: "✓",
      count: mapData.safeZones.length,
    },
  ];

  /*
   * ============================================================
   * FLATTEN DATA FOR MAP
   * ============================================================
   */

  const allItems = useMemo(() => {
    return Object.values(mapData).flat();
  }, []);

  /*
   * ============================================================
   * FILTER + SEARCH
   * ============================================================
   */

  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      const categoryMatch =
        activeFilter === "all" || item.type === activeFilter;

      const searchText =
        `${item.title} ${item.category} ${item.description}`.toLowerCase();

      return (
        categoryMatch &&
        searchText.includes(search.toLowerCase())
      );
    });
  }, [allItems, activeFilter, search]);

  /*
   * ============================================================
   * TOAST
   * ============================================================
   */

  const showToast = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 2800);
  };

  /*
   * ============================================================
   * MARKER ICON
   * ============================================================
   */

  const getMarkerIcon = (type) => {
    const icons = {
      emergency: "!",
      volunteer: "♙",
      team: "🚑",
      resource: "▣",
      shelter: "⌂",
      hospital: "✚",
      fire: "♨",
      police: "★",
      gas: "⛽",
      safe: "✓",
    };

    return icons[type] || "•";
  };

  return (
    <div className="live-map-page">

      {/* ======================================================
          COMMON NAVBAR
      ====================================================== */}

      <Navbar />


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <section className="map-page-header">

        <div>

          <div className="map-eyebrow">
            <span></span>
            LIVE RESPONSE NETWORK
          </div>

          <h1>
            Live <em>Response Map</em>
          </h1>

          <p>
            See emergencies, volunteers, response teams and critical
            resources across the response network in real time.
          </p>

        </div>

        <div className="network-status">

          <span className="status-pulse"></span>

          <div>
            <strong>NETWORK LIVE</strong>
            <small>All systems operational</small>
          </div>

        </div>

      </section>


      {/* ======================================================
          MAP APPLICATION
      ====================================================== */}

      <main className="map-application">


        {/* ====================================================
            LEFT PANEL
        ==================================================== */}

        {showPanel && (
          <aside className="map-sidebar">

            {/* SEARCH */}

            <div className="map-search">

              <span>⌕</span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search location, resource..."
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}

            </div>


            {/* LIVE SUMMARY */}

            <div className="sidebar-summary">

              <div>
                <span className="summary-number critical-number">
                  {mapData.emergencies.length}
                </span>

                <small>Emergencies</small>
              </div>

              <div>
                <span className="summary-number">
                  {mapData.teams.length}
                </span>

                <small>Teams</small>
              </div>

              <div>
                <span className="summary-number">
                  {mapData.volunteers.length}
                </span>

                <small>Volunteers</small>
              </div>

            </div>


            {/* LAYERS */}

            <div className="sidebar-section">

              <div className="sidebar-heading">
                <span>MAP LAYERS</span>
                <small>{visibleItems.length} visible</small>
              </div>


              <div className="layer-list">

                {categories.map((category) => (

                  <button
                    key={category.id}
                    className={
                      activeFilter === category.id
                        ? `layer-item active ${category.id}`
                        : `layer-item ${category.id}`
                    }
                    onClick={() =>
                      setActiveFilter(category.id)
                    }
                  >

                    <span className="layer-icon">
                      {category.icon}
                    </span>

                    <span className="layer-name">
                      {category.label}
                    </span>

                    {category.count !== undefined && (
                      <span className="layer-count">
                        {category.count}
                      </span>
                    )}

                    <span className="layer-arrow">
                      →
                    </span>

                  </button>

                ))}

              </div>

            </div>


            {/* SELECTED ITEM */}

            {selectedItem && (

              <div className="sidebar-selected">

                <button
                  className="selected-close"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                >
                  ×
                </button>

                <span
                  className={`selected-type ${selectedItem.type}`}
                >
                  {selectedItem.category}
                </span>

                <h3>{selectedItem.title}</h3>

                <p>{selectedItem.description}</p>

                <div className="selected-info">

                  <div>
                    <small>STATUS</small>
                    <strong>{selectedItem.status}</strong>
                  </div>

                  {selectedItem.people && (
                    <div>
                      <small>PEOPLE</small>
                      <strong>{selectedItem.people}</strong>
                    </div>
                  )}

                  {selectedItem.eta && (
                    <div>
                      <small>ETA</small>
                      <strong>{selectedItem.eta}</strong>
                    </div>
                  )}

                  {selectedItem.capacity && (
                    <div>
                      <small>CAPACITY</small>
                      <strong>{selectedItem.capacity}</strong>
                    </div>
                  )}

                  {selectedItem.quantity && (
                    <div>
                      <small>STOCK</small>
                      <strong>{selectedItem.quantity}</strong>
                    </div>
                  )}

                  {selectedItem.skill && (
                    <div>
                      <small>SKILL</small>
                      <strong>{selectedItem.skill}</strong>
                    </div>
                  )}

                </div>

                {selectedItem.type === "emergency" && (
                  <button
                    className="selected-action danger"
                    onClick={() =>
                      showToast(
                        `${selectedItem.id} response details opened`
                      )
                    }
                  >
                    Open Emergency →
                  </button>
                )}

                {selectedItem.type === "volunteer" && (
                  <button
                    className="selected-action"
                    onClick={() =>
                      showToast(
                        `Contact request prepared for ${selectedItem.title}`
                      )
                    }
                  >
                    Contact Volunteer →
                  </button>
                )}

                {selectedItem.type === "team" && (
                  <button
                    className="selected-action"
                    onClick={() =>
                      showToast(
                        `${selectedItem.title} location selected`
                      )
                    }
                  >
                    Track Team →
                  </button>
                )}

              </div>

            )}

          </aside>
        )}


        {/* ====================================================
            MAP
        ==================================================== */}

        <section className="map-canvas">


          {/* MAP TOOLBAR */}

          <div className="map-toolbar">

            <button
              className="panel-toggle"
              onClick={() =>
                setShowPanel(!showPanel)
              }
            >
              {showPanel ? "←" : "☰"}
            </button>

            <div className="map-mode">
              <button className="active">
                Live
              </button>

              <button>
                Satellite
              </button>

              <button>
                Terrain
              </button>
            </div>

            <div className="map-tools">

              <button
                onClick={() =>
                  showToast("Location centered on active incidents.")
                }
              >
                ◎
              </button>

              <button>+</button>
              <button>−</button>

            </div>

          </div>


          {/* ==================================================
              MAP BACKGROUND
          ================================================== */}

          <div className="map-background">

            <div className="map-grid-lines"></div>

            {/* WATER */}

            <div className="map-water water-one"></div>
            <div className="map-water water-two"></div>


            {/* PARKS */}

            <div className="map-park park-one">
              <span>GREEN PARK</span>
            </div>

            <div className="map-park park-two">
              <span>CITY GARDEN</span>
            </div>


            {/* ROADS */}

            <div className="map-road road-one"></div>
            <div className="map-road road-two"></div>
            <div className="map-road road-three"></div>
            <div className="map-road road-four"></div>
            <div className="map-road road-five"></div>
            <div className="map-road road-six"></div>
            <div className="map-road road-seven"></div>


            {/* SECONDARY ROADS */}

            <div className="map-road secondary-road sr-one"></div>
            <div className="map-road secondary-road sr-two"></div>
            <div className="map-road secondary-road sr-three"></div>
            <div className="map-road secondary-road sr-four"></div>
            <div className="map-road secondary-road sr-five"></div>


            {/* ZONES */}

            <div className="map-zone zone-a">
              ZONE A
            </div>

            <div className="map-zone zone-b">
              ZONE B
            </div>

            <div className="map-zone zone-c">
              ZONE C
            </div>

            <div className="map-zone zone-d">
              ZONE D
            </div>


            {/* LOCATION LABELS */}

            <span className="map-city city-one">
              CENTRAL MARKET
            </span>

            <span className="map-city city-two">
              OLD TOWN
            </span>

            <span className="map-city city-three">
              HILL VIEW
            </span>

            <span className="map-city city-four">
              RIVERSIDE
            </span>


            {/* COMMAND CENTER */}

            <div className="command-center">

              <span className="command-ring"></span>

              <div>
                <strong>RESQNET</strong>
                <small>COMMAND</small>
              </div>

            </div>


            {/* =================================================
                MARKERS
            ================================================= */}

            {visibleItems.map((item) => (

              <button
                key={item.id}
                className={`live-marker marker-${item.type} ${
                  selectedItem?.id === item.id
                    ? "selected"
                    : ""
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                onClick={() =>
                  setSelectedItem(item)
                }
                title={item.title}
              >

                {item.type === "emergency" && (
                  <span className="marker-pulse"></span>
                )}

                <span className="marker-icon">
                  {getMarkerIcon(item.type)}
                </span>

              </button>

            ))}


            {/* ROUTE LINES */}

            <svg
              className="response-routes"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
            >

              <path
                d="M480 335 C410 300 350 245 240 180"
                className="route route-active"
              />

              <path
                d="M480 335 C580 300 670 265 760 250"
                className="route route-secondary"
              />

              <path
                d="M480 335 C420 390 370 445 300 500"
                className="route route-secondary"
              />

            </svg>


            {/* MAP SCALE */}

            <div className="map-scale">
              <span></span>
              <small>1 km</small>
            </div>


            {/* NORTH */}

            <div className="north-indicator">
              <strong>↑</strong>
              <span>N</span>
            </div>


            {/* LEGEND */}

            <div className="floating-legend">

              <div>
                <i className="legend-dot emergency"></i>
                Emergency
              </div>

              <div>
                <i className="legend-dot volunteer"></i>
                Volunteer
              </div>

              <div>
                <i className="legend-dot team"></i>
                Team
              </div>

              <div>
                <i className="legend-dot resource"></i>
                Resource
              </div>

            </div>


            {/* LIVE MAP STATUS */}

            <div className="map-live-status">

              <span className="live-dot"></span>

              <div>
                <strong>LIVE DATA</strong>
                <small>Updated just now</small>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* ======================================================
          BOTTOM INFORMATION BAR
      ====================================================== */}

      <section className="map-bottom-bar">

        <div className="bottom-status">

          <span className="bottom-pulse"></span>

          <div>
            <strong>Response network active</strong>
            <small>Real-time coordination enabled</small>
          </div>

        </div>


        <div className="bottom-stat">
          <span>ACTIVE EMERGENCIES</span>
          <strong>{mapData.emergencies.length}</strong>
        </div>

        <div className="bottom-stat">
          <span>TEAMS RESPONDING</span>
          <strong>{mapData.teams.length}</strong>
        </div>

        <div className="bottom-stat">
          <span>VOLUNTEERS ONLINE</span>
          <strong>{mapData.volunteers.length}</strong>
        </div>

        <div className="bottom-stat">
          <span>SAFE SHELTERS</span>
          <strong>{mapData.shelters.length}</strong>
        </div>

        <button
          className="report-button"
          onClick={() =>
            showToast("Emergency reporting flow opened.")
          }
        >
          + Report Emergency
        </button>

      </section>


      {/* ======================================================
          TOAST
      ====================================================== */}

      {notification && (
        <div className="map-toast">

          <span>✓</span>

          <div>
            <strong>ResQNet Network</strong>
            <p>{notification}</p>
          </div>

        </div>
      )}

    </div>
  );
}

export default LiveMap;