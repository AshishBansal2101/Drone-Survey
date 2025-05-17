// src/components/mission-planning/MissionPlanningPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
} from "@mui/material";
import SurveyAreaSelector from "./SurveyAreaSelector";
import FlightPathEditor from "./FlightPathEditor";
import MissionParametersForm from "./MissionParametersForm";
import MissionPreview from "./MissionPreview";
import CreateMissionForm from "./CreateMissionForm";
import { useMissionStore } from "../../store/missionStore";
import { useInitializedMissionStore } from "../../store/missionStore";
const steps = [
  "Create Mission",
  "Define Survey Area",
  "Configure Flight Path",
  "Set Parameters",
  "Review",
];

const MissionPlanningPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { activeMission, generateWaypoints } = useInitializedMissionStore();

  // Ensure we have a valid mission to work with
  useEffect(() => {
    if (activeStep > 0 && !activeMission) {
      // If we're beyond step 0 but no active mission, go back to step 0
      setActiveStep(0);
    }
  }, [activeStep, activeMission]);

  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0 && !activeMission) {
      return; // Don't proceed if no mission created
    }

    if (
      activeStep === 1 &&
      (!activeMission.surveyAreaPolygon ||
        activeMission.surveyAreaPolygon.length < 3)
    ) {
      alert("Please define a valid survey area with at least 3 points");
      return;
    }

    // If we're moving from step 2 (flight path) to step 3 (parameters)
    if (activeStep === 2) {
      // Ensure we have waypoints generated
      if (!activeMission.waypoints || activeMission.waypoints.length === 0) {
        generateWaypoints(activeMission.id);
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <CreateMissionForm onMissionCreated={handleNext} />;
      case 1:
        return <SurveyAreaSelector onNext={handleNext} />;
      case 2:
        return <FlightPathEditor onNext={handleNext} />;
      case 3:
        return <MissionParametersForm onNext={handleNext} />;
      case 4:
        return (
          <MissionPreview
            onFinish={() => alert("Mission planning complete!")}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mission Planning
      </Typography>

      <Stepper
        activeStep={activeStep}
        sx={{ mb: 4, backgroundColor: "#f5f5f5", borderRadius: 2, p: 2 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  color:
                    activeStep >= steps.indexOf(label) ? "#1976d2" : "#aaa",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper
        elevation={3}
        sx={{ p: 3, borderRadius: 2, backgroundColor: "#fff" }}
      >
        {getStepContent(activeStep)}

        <Box p={3} display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{
              transition: "all 0.3s ease",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? undefined : handleNext}
            disabled={!activeMission}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": { backgroundColor: "#1976d2" },
            }}
          >
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MissionPlanningPage;
