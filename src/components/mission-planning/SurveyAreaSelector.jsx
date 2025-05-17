// src/components/mission-planning/SurveyAreaSelector.jsx
import React, { useRef, useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useMissionStore } from "../../store/missionStore";
import { useInitializedMissionStore } from "../../store/missionStore";
// Fixing Leaflet icon issues
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const SurveyAreaSelector = ({ onNext }) => {
  const { activeMission, updateSurveyArea, generateWaypoints } =
    useInitializedMissionStore();
  const featureGroupRef = useRef(null);

  useEffect(() => {
    // Initialize the map with any existing survey area if editing an existing mission
    if (
      activeMission?.surveyAreaPolygon &&
      activeMission.surveyAreaPolygon.length > 0 &&
      featureGroupRef.current
    ) {
      // This would require additional work to convert coordinates to Leaflet layers
      // For now, we'll just let the user redraw if needed
    }
  }, [activeMission]);

  const handleCreated = (e) => {
    const { layer } = e;

    // Get coordinates from the drawn polygon
    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map((latlng) => ({
      lat: latlng.lat,
      lng: latlng.lng,
    }));

    if (activeMission) {
      updateSurveyArea(activeMission.id, coordinates);
    }
  };

  const handleEdited = (e) => {
    const { layers } = e;

    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0];
      const coordinates = latlngs.map((latlng) => ({
        lat: latlng.lat,
        lng: latlng.lng,
      }));

      if (activeMission) {
        updateSurveyArea(activeMission.id, coordinates);
      }
    });
  };

  const handleDeleted = () => {
    if (activeMission) {
      updateSurveyArea(activeMission.id, []);
    }
  };

  const calculateEstimates = () => {
    if (activeMission && activeMission.surveyAreaPolygon.length >= 3) {
      // Generate initial waypoints based on the survey area
      generateWaypoints(activeMission.id);

      // Show success message
      alert(
        "Area measurements calculated. You can now proceed to flight path configuration."
      );
    }
  };

  return (
    <Box>
      <Box p={3} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Define Survey Area
        </Typography>
        <Typography paragraph sx={{ color: "#555" }}>
          Draw a polygon on the map to define the area that will be surveyed by
          the drone.
        </Typography>

        <Paper
          elevation={2}
          sx={{ height: 500, mb: 3, borderRadius: 2, overflow: "hidden" }}
        >
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: true,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </Paper>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography sx={{ color: "#777" }}>
            {activeMission?.surveyAreaPolygon &&
            activeMission.surveyAreaPolygon.length > 0
              ? `Survey area defined with ${activeMission.surveyAreaPolygon.length} points`
              : "No survey area defined yet"}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="secondary"
              disabled={
                !activeMission || activeMission.surveyAreaPolygon.length < 3
              }
              onClick={calculateEstimates}
              sx={{
                mr: 2,
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#ff7043" },
              }}
            >
              Calculate Estimates
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={
                !activeMission || activeMission.surveyAreaPolygon.length < 3
              }
              onClick={onNext}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#1976d2" },
              }}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SurveyAreaSelector;
