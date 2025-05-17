// components/MissionMonitoring.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightIcon from "@mui/icons-material/Flight";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useInitializedMissionStore } from "../../store/missionStore";
import { useInitializedDroneStore } from "../../store/droneStore";

const MissionStatusChip = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "assigned":
        return { color: "info", label: "Assigned" };
      case "in-progress":
        return { color: "primary", label: "In Progress" };
      case "pending":
        return { color: "warning", label: "Pending" };
      case "cancelled":
        return { color: "error", label: "Cancelled" };
      case "completed":
        return { color: "success", label: "Completed" };
      default:
        return { color: "default", label: status };
    }
  };

  const config = getStatusConfig(status);
  return <Chip label={config.label} color={config.color} size="small" />;
};

const MissionCard = ({ mission }) => {
  const { cancelMission, updateMissionProgress, updateMissionParameters } =
    useInitializedMissionStore();
  const drone = useInitializedDroneStore((state) =>
    state.getDroneById(mission.droneId)
  );

  useEffect(() => {
    let interval;
    if (mission.status === "in-progress" && mission.progress < 100) {
      interval = setInterval(() => {
        const newProgress = Math.min(mission.progress + 1, 100);
        updateMissionProgress(mission.id, newProgress);

        // Update estimated values
        if (mission.parameters) {
          const completionPercentage = newProgress / 100;
          updateMissionParameters(mission.id, {
            ...mission.parameters,
            estimatedTimeRemaining:
              mission.estimatedDuration * (1 - completionPercentage),
            estimatedBatteryRemaining:
              100 - mission.estimatedBatteryUsage * completionPercentage,
          });
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [mission.status, mission.progress]);

  const handleCancel = () => {
    cancelMission(mission.id);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">{mission.name}</Typography>
          <MissionStatusChip status={mission.status} />
        </Box>

        {mission.description && (
          <Typography variant="body2" color="textSecondary" mb={2}>
            {mission.description}
          </Typography>
        )}

        {drone && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24 }}>
                <FlightIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2">Drone: {drone.name}</Typography>
            </Box>

            {mission.surveyAreaPolygon?.length > 0 && (
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <LocationOnIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  Survey Area: {mission.surveyAreaPolygon.length} points defined
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Mission Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={mission.progress || 0}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Box display="flex" justifyContent="space-between" mt={0.5}>
            <Typography variant="body2">
              {mission.progress || 0}% Complete
            </Typography>
            {mission.estimatedDuration && (
              <Typography variant="body2">
                Est. Duration: {Math.round(mission.estimatedDuration)} min
              </Typography>
            )}
          </Box>
        </Box>

        {mission.parameters && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Mission Parameters
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Altitude: {mission.parameters.altitudeMeters}m
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Speed: {mission.parameters.speed}m/s
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Overlap: {mission.parameters.overlapPercentage}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" display="block">
                  Pattern: {mission.surveyPattern}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {(mission.status === "in-progress" ||
          mission.status === "assigned") && (
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            fullWidth
          >
            Cancel Mission
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const MissionMonitoring = () => {
  const { missions, fetchMissions, createNewMission } =
    useInitializedMissionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch missions if not already loaded
    if (!missions || missions.length === 0) {
      fetchMissions().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [missions, fetchMissions]);

  // Temporary: Create a test mission if none exist
  useEffect(() => {
    if (!loading && missions.length === 0) {
      console.log("No missions found. Creating a test mission...");
      createNewMission("Test Mission", "This is a test mission.");
    }
  }, [loading, missions, createNewMission]);

  // Filter active missions (pending, assigned, in-progress, or ready)
  const activeMissions = missions.filter((m) =>
    ["pending", "assigned", "in-progress", "ready"].includes(m.status)
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
        bgcolor="background.paper"
        borderRadius={1}
      >
        <Typography variant="h6" color="textSecondary">
          Loading missions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mission Monitoring
      </Typography>

      {activeMissions.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="200px"
          bgcolor="background.paper"
          borderRadius={1}
        >
          <Typography variant="h6" color="textSecondary">
            No active missions to display
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {activeMissions.map((mission) => (
            <Grid item xs={12} md={6} lg={4} key={mission.id}>
              <MissionCard mission={mission} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MissionMonitoring;
