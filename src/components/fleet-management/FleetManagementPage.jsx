// components/FleetManagementPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryAlertIcon from "@mui/icons-material/BatteryAlert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import WarningIcon from "@mui/icons-material/Warning";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useInitializedDroneStore } from "../../store/droneStore";
import { useMissionStore } from "../../store/missionStore";
import "../../styles/fleetManagement.css"; // Import the custom CSS

const DroneCard = ({ drone, onStatusChange, onBatteryUpdate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const missions = useMissionStore((state) => state.missions);
  const currentMission = missions.find((m) => m.droneId === drone.id);

  const getBatteryColor = (level) => {
    if (level > 70) return "success";
    if (level > 30) return "warning";
    return "error";
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "available":
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Available"
            color="success"
            size="small"
          />
        );
      case "in-mission":
        return (
          <Chip
            icon={<FlightTakeoffIcon />}
            label="In Mission"
            color="primary"
            size="small"
          />
        );
      case "maintenance":
        return (
          <Chip
            icon={<WarningIcon />}
            label="Maintenance"
            color="error"
            size="small"
          />
        );
      case "charging":
        return (
          <Chip
            icon={<BatteryAlertIcon />}
            label="Charging"
            color="warning"
            size="small"
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getAvailableStatusOptions = () => {
    if (drone.status === "in-mission") return [];
    const options = [];
    if (drone.status !== "available") options.push("available");
    if (drone.status !== "maintenance") options.push("maintenance");
    if (drone.status !== "charging" && drone.batteryLevel < 30)
      options.push("charging");
    return options;
  };

  return (
    <>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                <FlightIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{drone.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {drone.model}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {getStatusChip(drone.status)}
              {drone.status !== "in-mission" && (
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Battery Level
            </Typography>
            <Box display="flex" alignItems="center">
              <BatteryFullIcon color={getBatteryColor(drone.batteryLevel)} />
              <Box sx={{ width: "100%", ml: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={drone.batteryLevel}
                  color={getBatteryColor(drone.batteryLevel)}
                />
              </Box>
              <Typography variant="body2" sx={{ ml: 1 }}>
                {`${drone.batteryLevel}%`}
              </Typography>
            </Box>
          </Box>

          {currentMission && (
            <Box mt={2}>
              <Alert severity="info">
                Currently assigned to: {currentMission.name}
              </Alert>
            </Box>
          )}

          <Box mt={2}>
            <Typography variant="body2">Location: {drone.location}</Typography>
            <Typography variant="body2">
              Total Flights: {drone.totalFlights}
            </Typography>
            <Typography variant="body2">
              Last Mission:{" "}
              {drone.lastMission
                ? new Date(drone.lastMission).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            onClick={() => setShowDetailsDialog(true)}
          >
            View Details
          </Button>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {getAvailableStatusOptions().map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              onStatusChange(drone.id, status);
              setAnchorEl(null);
            }}
          >
            Set {status.charAt(0).toUpperCase() + status.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Drone Details - {drone.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Model</Typography>
              <Typography variant="body1">{drone.model}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Status</Typography>
              {getStatusChip(drone.status)}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Battery Level</Typography>
              <Typography variant="body1">{drone.batteryLevel}%</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Total Flights</Typography>
              <Typography variant="body1">{drone.totalFlights}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Current Mission</Typography>
              <Typography variant="body1">
                {currentMission ? currentMission.name : "None"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Location</Typography>
              <Typography variant="body1">{drone.location}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Maximum Flight Time</Typography>
              <Typography variant="body1">
                {drone.maxFlightTime} minutes
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Maximum Speed</Typography>
              <Typography variant="body1">{drone.maxSpeed} km/h</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const FleetManagementPage = () => {
  const {
    drones,
    updateDroneStatus,
    updateDroneBattery,
    getFleetStats,
    initialized,
  } = useInitializedDroneStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initialized) {
      setIsLoading(false);
    }
  }, [initialized]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDroneStatusUpdate = async (droneId, newStatus) => {
    try {
      await updateDroneStatus(droneId, newStatus);
    } catch (error) {
      console.error("Error updating drone status:", error);
    }
  };

  const handleBatteryUpdate = async (droneId, batteryLevel) => {
    try {
      await updateDroneBattery(droneId, batteryLevel);
    } catch (error) {
      console.error("Error updating battery level:", error);
    }
  };

  const stats = getFleetStats();

  return (
    <Box
      p={3}
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        backgroundImage:
          "url('https://amritmahotsav.nic.in/writereaddata/Portal/Images/Technology.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Fleet Management
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 4 }}
      >
        <Tab label="Overview" />
        <Tab label="Inventory" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#e3f2fd",
                minHeight: "120px",
              }}
            >
              <Typography variant="h5">{stats.total}</Typography>
              <Typography variant="body1">Total Drones</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#c8e6c9",
                minHeight: "120px",
              }}
            >
              <Typography variant="h5">{stats.available}</Typography>
              <Typography variant="body1">Available</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#bbdefb",
                minHeight: "120px",
              }}
            >
              <Typography variant="h5">{stats.inMission}</Typography>
              <Typography variant="body1">In Mission</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#ffcdd2",
                minHeight: "120px",
              }}
            >
              <Typography variant="h5">{stats.maintenance}</Typography>
              <Typography variant="body1">Under Maintenance</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <>
          <Typography variant="h5" gutterBottom>
            Drone Inventory
          </Typography>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={5}>
              <Typography>Loading drone data...</Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {drones.map((drone) => (
                <Grid item xs={12} sm={6} md={4} key={drone.id}>
                  <DroneCard
                    drone={drone}
                    onStatusChange={handleDroneStatusUpdate}
                    onBatteryUpdate={handleBatteryUpdate}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default FleetManagementPage;
