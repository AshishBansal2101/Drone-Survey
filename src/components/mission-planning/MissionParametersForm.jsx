// src/components/mission-planning/MissionParametersForm.jsx
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useMissionStore } from "../../store/missionStore";
import { useInitializedMissionStore } from "../../store/missionStore";
const MissionParametersForm = ({ onNext }) => {
  const { activeMission, updateMissionParameters, generateWaypoints } =
    useInitializedMissionStore();

  if (!activeMission) {
    return (
      <Box p={3}>
        <Typography>
          No active mission. Please create a mission first.
        </Typography>
      </Box>
    );
  }

  const handleParameterChange = (parameter, value) => {
    updateMissionParameters(activeMission.id, { [parameter]: value });
  };

  const handleUpdateEstimates = () => {
    // Regenerate waypoints with new parameters to update estimates
    generateWaypoints(activeMission.id);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Mission Parameters
      </Typography>

      <Paper
        elevation={3}
        sx={{ p: 3, borderRadius: 2, backgroundColor: "#fff" }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#555" }}
            >
              Data Collection
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Capture Frequency</InputLabel>
              <Select
                value={activeMission.parameters.captureFrequency}
                onChange={(e) =>
                  handleParameterChange("captureFrequency", e.target.value)
                }
                label="Capture Frequency"
              >
                <MenuItem value={1}>Every second</MenuItem>
                <MenuItem value={2}>Every 2 seconds</MenuItem>
                <MenuItem value={5}>Every 5 seconds</MenuItem>
                <MenuItem value={10}>Every 10 seconds</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Typography gutterBottom>Speed (m/s)</Typography>
              <Slider
                value={activeMission.parameters.speed}
                onChange={(e, value) => handleParameterChange("speed", value)}
                min={1}
                max={15}
                step={0.5}
                marks
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Typography gutterBottom>Overlap Percentage</Typography>
              <Slider
                value={activeMission.parameters.overlapPercentage}
                onChange={(e, value) =>
                  handleParameterChange("overlapPercentage", value)
                }
                min={30}
                max={90}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#555" }}
            >
              Sensors
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={activeMission.parameters.sensors.includes("rgb")}
                  onChange={(e) => {
                    const sensors = e.target.checked
                      ? [...activeMission.parameters.sensors, "rgb"]
                      : activeMission.parameters.sensors.filter(
                          (s) => s !== "rgb"
                        );
                    handleParameterChange("sensors", sensors);
                  }}
                />
              }
              label="RGB Camera"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={activeMission.parameters.sensors.includes("thermal")}
                  onChange={(e) => {
                    const sensors = e.target.checked
                      ? [...activeMission.parameters.sensors, "thermal"]
                      : activeMission.parameters.sensors.filter(
                          (s) => s !== "thermal"
                        );
                    handleParameterChange("sensors", sensors);
                  }}
                />
              }
              label="Thermal Camera"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={activeMission.parameters.sensors.includes("lidar")}
                  onChange={(e) => {
                    const sensors = e.target.checked
                      ? [...activeMission.parameters.sensors, "lidar"]
                      : activeMission.parameters.sensors.filter(
                          (s) => s !== "lidar"
                        );
                    handleParameterChange("sensors", sensors);
                  }}
                />
              }
              label="LiDAR"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#555" }}
            >
              Mission Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Estimated Duration"
                  value={`${(activeMission.estimatedDuration || 0).toFixed(
                    2
                  )} minutes`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Estimated Distance"
                  value={`${(activeMission.estimatedDistance || 0).toFixed(
                    2
                  )} meters`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Battery Usage"
                  value={`${(activeMission.estimatedBatteryUsage || 0).toFixed(
                    2
                  )}%`}
                  disabled
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUpdateEstimates}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": { backgroundColor: "#ff7043" },
            }}
          >
            Update Estimates
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
            Continue to Review
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MissionParametersForm;
