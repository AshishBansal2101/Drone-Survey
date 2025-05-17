// src/components/mission-planning/FlightPathEditor.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Button,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  FeatureGroup,
} from "react-leaflet";
import { useMissionStore } from "../../store/missionStore";
import "leaflet/dist/leaflet.css";
import { useInitializedMissionStore } from "../../store/missionStore";
const surveyPatterns = [
  { value: "grid", label: "Grid Pattern" },
  { value: "crosshatch", label: "Crosshatch Pattern" },
  { value: "perimeter", label: "Perimeter Pattern" },
  { value: "custom", label: "Custom Path" },
];

const FlightPathEditor = ({ onNext }) => {
  const {
    activeMission,
    setSurveyPattern,
    generateWaypoints,
    updateMissionParameters,
  } = useInitializedMissionStore();

  const [lineWeight, setLineWeight] = useState(3);
  const [altitude, setAltitude] = useState(50); // Default altitude
  const [mapReady, setMapReady] = useState(false);

  // Initialize altitude once when component mounts or when activeMission changes
  useEffect(() => {
    if (activeMission?.parameters?.altitudeMeters) {
      setAltitude(activeMission.parameters.altitudeMeters);
    }
  }, [activeMission?.id]); // Only dependency is mission ID

  // Generate waypoints once when mission loads
  useEffect(() => {
    if (activeMission?.id && activeMission.surveyAreaPolygon?.length >= 3) {
      generateWaypoints(activeMission.id);
    }
  }, [activeMission?.id]);

  if (!activeMission) {
    return (
      <Box p={3}>
        <Typography>
          No active mission. Please create a mission first.
        </Typography>
      </Box>
    );
  }

  if (
    !activeMission.surveyAreaPolygon ||
    activeMission.surveyAreaPolygon.length < 3
  ) {
    return (
      <Box p={3}>
        <Typography>
          Please define a survey area before configuring flight paths.
        </Typography>
      </Box>
    );
  }

  const handlePatternChange = (event) => {
    setSurveyPattern(activeMission.id, event.target.value);
  };

  const handleAltitudeChange = (event, newValue) => {
    setAltitude(newValue);
    updateMissionParameters(activeMission.id, { altitudeMeters: newValue });
  };

  const handleRegeneratePath = () => {
    if (activeMission) {
      generateWaypoints(activeMission.id);
    }
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

  // Safely compute waypoint positions
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
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Configure Flight Path
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Survey Pattern</InputLabel>
            <Select
              value={activeMission.surveyPattern}
              onChange={handlePatternChange}
              label="Survey Pattern"
            >
              {surveyPatterns.map((pattern) => (
                <MenuItem key={pattern.value} value={pattern.value}>
                  {pattern.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={3}>
            <Typography gutterBottom>Flight Altitude (meters)</Typography>
            <Slider
              value={altitude}
              onChange={handleAltitudeChange}
              min={10}
              max={120}
              step={5}
              marks
              valueLabelDisplay="auto"
              sx={{
                "& .MuiSlider-thumb": {
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 0 8px #1976d2" },
                },
              }}
            />
          </Box>

          <Box mt={3}>
            <Typography id="lineweight-slider" gutterBottom>
              Path Visibility
            </Typography>
            <Slider
              value={lineWeight}
              onChange={(e, newValue) => setLineWeight(newValue)}
              min={1}
              max={10}
              aria-labelledby="lineweight-slider"
            />
          </Box>
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Flight Path Statistics
            </Typography>
            <Box p={2} sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
              <Typography variant="body2">
                Total Waypoints: {activeMission.waypoints.length}
              </Typography>
              <Typography variant="body2">
                Estimated Distance:{" "}
                {(activeMission.estimatedDistance || 0).toFixed(2)} meters
              </Typography>
              <Typography variant="body2">
                Estimated Duration:{" "}
                {(activeMission.estimatedDuration || 0).toFixed(2)} minutes
              </Typography>
              <Typography variant="body2">
                Flight Altitude: {altitude} meters
              </Typography>
              <Typography variant="body2">
                Battery Usage:{" "}
                {(activeMission.estimatedBatteryUsage || 0).toFixed(1)}%
              </Typography>
            </Box>
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRegeneratePath}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#ff7043" },
              }}
            >
              Regenerate Flight Path
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onNext}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#1976d2" },
              }}
            >
              Continue to Parameters
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{ height: "600px", borderRadius: 2, overflow: "hidden" }}
          >
            <MapContainer
              center={getMapCenter()}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              whenReady={() => setMapReady(true)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Survey Area Polygon */}
              <Polyline
                positions={surveyAreaPositions}
                color="red"
                weight={2}
              />

              {/* Flight Path */}
              <Polyline
                positions={waypointPositions}
                color="blue"
                weight={lineWeight}
              />

              {/* Waypoint Markers */}
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
                    Altitude: {waypoint.altitude}m<br />
                    Lat: {(waypoint?.coordinates?.lat ?? 51.505).toFixed(6)}
                    <br />
                    Lng: {(waypoint?.coordinates?.lng ?? -0.09).toFixed(6)}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FlightPathEditor;
