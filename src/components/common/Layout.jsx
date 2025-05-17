import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import DevicesIcon from "@mui/icons-material/Devices";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AssessmentIcon from "@mui/icons-material/Assessment";

const drawerWidth = 240;

const menuItems = [
  {
    text: "Mission Planning",
    icon: <MapIcon />,
    path: "/mission-planning",
  },
  {
    text: "Fleet Management",
    icon: <DevicesIcon />,
    path: "/fleet-management",
  },
  {
    text: "Mission Monitoring",
    icon: <FlightTakeoffIcon />,
    path: "/monitoring",
  },
  {
    text: "Reporting",
    icon: <AssessmentIcon />,
    path: "/reporting",
  },
];

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #1e3c72, #2a5298)",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
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

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#f4f4f4",
            borderRight: "1px solid #ddd",
            transition: "background 0.3s ease-in-out",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  "&:hover": {
                    backgroundColor: "#e0f7fa",
                    transition: "background 0.3s ease-in-out",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#b2ebf2",
                    "&:hover": {
                      backgroundColor: "#80deea",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? "#00796b" : "#555",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: location.pathname === item.path ? "#00796b" : "#555",
                    fontWeight:
                      location.pathname === item.path ? "bold" : "normal",
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: "#f9f9f9",
          minHeight: "100vh",
          transition: "background 0.3s ease-in-out",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
