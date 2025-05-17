import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = () => {
  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(90deg, #1e3c72, #2a5298)",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        transition: "background 0.3s ease-in-out",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Drone Survey Management System
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
