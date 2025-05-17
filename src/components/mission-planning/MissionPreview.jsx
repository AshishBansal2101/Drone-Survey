// src/components/mission-planning/MissionPreview.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import { useMissionStore } from "../../store/missionStore";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useInitializedMissionStore } from "../../store/missionStore";
import { useNavigate } from "react-router-dom";

const MissionPreview = ({ onFinish }) => {
  const { activeMission, saveMission } = useInitializedMissionStore();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState(new Date());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  if (!activeMission) {
    return (
      <Box p={3}>
        <Typography>
          No active mission. Please create a mission first.
        </Typography>
      </Box>
    );
  }

  const handleSchedule = () => {
    setScheduleDialogOpen(true);
  };

  const handleScheduleConfirm = () => {
    // Update mission with scheduled time
    const updatedMission = {
      ...activeMission,
      scheduledFor: scheduledDateTime,
      status: "scheduled",
    };
    saveMission(updatedMission);
    setScheduleDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleSaveAndFinalize = () => {
    // Update mission status to ready
    const updatedMission = {
      ...activeMission,
      status: "ready",
    };
    saveMission(updatedMission);
    setConfirmDialogOpen(true);
  };

  const handleFinish = () => {
    setConfirmDialogOpen(false);
    navigate("/mission-success");
  };

  const getMapCenter = () => {
    if (
      !activeMission.surveyAreaPolygon ||
      activeMission.surveyAreaPolygon.length === 0
    ) {
      return [51.505, -0.09];
    }
    const sumLat = activeMission.surveyAreaPolygon.reduce(
      (sum, point) => sum + point.lat,
      0
    );
    const sumLng = activeMission.surveyAreaPolygon.reduce(
      (sum, point) => sum + point.lng,
      0
    );
    const count = activeMission.surveyAreaPolygon.length;
    return [sumLat / count, sumLng / count];
  };

  const waypointPositions = activeMission?.waypoints?.length
    ? activeMission.waypoints.map((wp) => [
        wp?.coordinates?.lat ?? 51.505,
        wp?.coordinates?.lng ?? -0.09,
      ])
    : [[51.505, -0.09]];

  const surveyAreaPositions = activeMission?.surveyAreaPolygon?.length
    ? activeMission.surveyAreaPolygon.map((point) => [
        point?.lat ?? 51.505,
        point?.lng ?? -0.09,
      ])
    : [[51.505, -0.09]];

  return (
    <Box
      display="flex"
      height="100%"
      sx={{
        backgroundImage:
          "url('https://amritmahotsav.nic.in/writereaddata/Portal/Images/Technology.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Left side: Mission details */}
      <Box
        flex={1}
        p={3}
        sx={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: 2 }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Mission Preview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{ height: "500px", borderRadius: 2, overflow: "hidden" }}
            >
              <MapContainer
                center={getMapCenter()}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <Polyline
                  positions={surveyAreaPositions}
                  color="red"
                  weight={2}
                />

                <Polyline
                  positions={waypointPositions}
                  color="blue"
                  weight={3}
                />

                {activeMission.waypoints.map((waypoint, index) => (
                  <Marker
                    key={waypoint.id}
                    position={[
                      waypoint?.coordinates?.lat ?? 51.505,
                      waypoint?.coordinates?.lng ?? -0.09,
                    ]}
                  >
                    <Popup>
                      Waypoint {index + 1}
                      <br />
                      Altitude: {waypoint.altitude}m
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{ p: 3, borderRadius: 2, backgroundColor: "#fff" }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#555" }}
              >
                Mission Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Mission Name"
                    secondary={activeMission.name}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Survey Pattern"
                    secondary={activeMission.surveyPattern}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Altitude"
                    secondary={`${activeMission.parameters.altitudeMeters} meters`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Waypoints"
                    secondary={activeMission.waypoints.length}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Estimated Duration"
                    secondary={`${(
                      activeMission.estimatedDuration || 0
                    ).toFixed(2)} minutes`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Estimated Distance"
                    secondary={`${(
                      activeMission.estimatedDistance || 0
                    ).toFixed(2)} meters`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Battery Usage"
                    secondary={`${(
                      activeMission.estimatedBatteryUsage || 0
                    ).toFixed(2)}%`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Sensors"
                    secondary={activeMission.parameters.sensors.join(", ")}
                  />
                </ListItem>
              </List>

              <Box mt={3} display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSchedule}
                  fullWidth
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: "#1976d2" },
                  }}
                >
                  Schedule Mission
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSaveAndFinalize}
                  fullWidth
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: "#ff7043" },
                  }}
                >
                  Save & Finalize
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Schedule Dialog */}
        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
        >
          <DialogTitle>Schedule Mission</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Mission Date & Time"
                  value={scheduledDateTime}
                  onChange={(newValue) => setScheduledDateTime(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDateTime={new Date()}
                />
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleScheduleConfirm}
              variant="contained"
              color="primary"
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#1976d2" },
              }}
            >
              Confirm Schedule
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
        >
          <DialogTitle>
            Mission{" "}
            {activeMission.status === "scheduled" ? "Scheduled" : "Finalized"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {activeMission.status === "scheduled"
                ? `Mission has been scheduled for ${new Date(
                    scheduledDateTime
                  ).toLocaleString()}`
                : "Mission has been finalized and is ready for execution."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleFinish}
              variant="contained"
              color="primary"
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#1976d2" },
              }}
            >
              Finish
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default MissionPreview;
