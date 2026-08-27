import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Dashboard from "./Dashboard";
import Citizen from "./Citizen";
import JoinNetwork from "./JoinNetwork";
import Volunteer from "./Volunteer";
import Contribute from "./Contribute";
import LiveMap from "./LiveMap";

import ResponderRegistration from "./ResponderRegistration";
import ResponseCentre from "./ResponseCentre";
import ResponderLogin from "./ResponderLogin";
import ResponderDashboard from "./ResponderDashboard";

import AdminLogin from "./AdminLogin";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            HOME
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =====================================================
            MAIN DASHBOARD
        ===================================================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =====================================================
            GET HELP / CITIZEN
        ===================================================== */}

        <Route
          path="/citizen"
          element={<Citizen />}
        />


        {/* =====================================================
            JOIN NETWORK
        ===================================================== */}

        <Route
          path="/join-network"
          element={<JoinNetwork />}
        />


        {/* =====================================================
            VOLUNTEER
        ===================================================== */}

        <Route
          path="/volunteer"
          element={<Volunteer />}
        />


        {/* =====================================================
            CONTRIBUTE TO RELIEF
        ===================================================== */}

        <Route
          path="/contribute"
          element={<Contribute />}
        />


        {/* =====================================================
            LIVE MAP
        ===================================================== */}

        <Route
          path="/livemap"
          element={<LiveMap />}
        />


        {/* =====================================================
            RESPONSE CENTRE
        ===================================================== */}

        <Route
          path="/response-centre"
          element={<ResponseCentre />}
        />


        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />


        {/* =====================================================
            RESPONDER REGISTRATION
        ===================================================== */}

        <Route
          path="/responder-registration"
          element={<ResponderRegistration />}
        />


        {/* =====================================================
            RESPONDER LOGIN
        ===================================================== */}

        <Route
          path="/responder-login"
          element={<ResponderLogin />}
        />


        {/* =====================================================
            RESPONDER DASHBOARD
        ===================================================== */}

        <Route
          path="/responder-dashboard"
          element={<ResponderDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;