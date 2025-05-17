import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MissionSuccess = () => {
  const navigate = useNavigate();

  const handleBackToPlanning = () => {
    navigate("/mission-planning");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
    >
      <Typography variant="h4" gutterBottom>
        Mission Completed Successfully!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your mission has been successfully scheduled or finalized.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleBackToPlanning}
        sx={{ mt: 3 }}
      >
        Back to Mission Planning
      </Button>
    </Box>
  );
};

export default MissionSuccess;
