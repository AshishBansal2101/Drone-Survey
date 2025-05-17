// src/components/mission-planning/CreateMissionForm.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useMissionStore } from "../../store/missionStore";
import { useInitializedMissionStore } from "../../store/missionStore";
const CreateMissionForm = ({ onMissionCreated }) => {
  const { createNewMission } = useInitializedMissionStore();
  const [missionData, setMissionData] = useState({
    name: "",
    description: "",
    location: "",
    type: "inspection",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMissionData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!missionData.name.trim()) {
      newErrors.name = "Mission name is required";
    }

    if (!missionData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      createNewMission(missionData.name, missionData.description);
      onMissionCreated();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Mission Name"
              name="name"
              autoFocus
              value={missionData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Mission Description"
              name="description"
              multiline
              rows={3}
              value={missionData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="location"
              label="Location Name"
              name="location"
              value={missionData.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="mission-type-label">Mission Type</InputLabel>
              <Select
                labelId="mission-type-label"
                id="type"
                name="type"
                value={missionData.type}
                label="Mission Type"
                onChange={handleChange}
              >
                <MenuItem value="inspection">Site Inspection</MenuItem>
                <MenuItem value="mapping">Aerial Mapping</MenuItem>
                <MenuItem value="monitoring">Environmental Monitoring</MenuItem>
                <MenuItem value="security">Security Patrol</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              transition: "all 0.3s ease",
              "&:hover": { backgroundColor: "#1976d2" },
            }}
          >
            Create Mission
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Create a new drone survey mission by filling out the basic details
          above. You'll be able to define the survey area and flight parameters
          in the next steps.
        </Typography>
      </Box>
    </Paper>
  );
};

export default CreateMissionForm;
