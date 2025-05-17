import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import MissionPlanningPage from "./components/mission-planning/MissionPlanningPage";
import Layout from "./components/common/Layout";
import { useEffect } from "react";
// We'll create these pages next
import FleetManagementPage from "./components/fleet-management/FleetManagementPage";
import MonitoringPage from "./components/monitoring/MonitoringPage";
// import ReportingPage from "./components/reporting/ReportingPage";
import { useMissionStore } from "./store/missionStore";
import ReportingPage from "./components/reporting/ReportingPage";
import MissionSuccess from "./pages/MissionSuccess"; // Import the new page

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// In your App.jsx or index.js
function App() {
  useEffect(() => {
    // Initialize the store once when the app loads
    useMissionStore.getState().initialize();
  }, []);
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<MissionPlanningPage />} />
    //   </Routes>
    // </Router>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<MissionPlanningPage />} />
            <Route path="/mission-planning" element={<MissionPlanningPage />} />
            <Route path="/fleet-management" element={<FleetManagementPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/reporting" element={<ReportingPage />} />
            <Route path="/mission-success" element={<MissionSuccess />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
