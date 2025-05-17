// src/components/reporting/ReportingPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useInitializedMissionStore } from "../../store/missionStore";

// Tab Panel Component
const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

const ReportingPage = () => {
  const { missions } = useInitializedMissionStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState("week");

  const calculateArea = (polygon) => {
    if (!polygon || polygon.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i].lat * polygon[j].lng;
      area -= polygon[j].lat * polygon[i].lng;
    }
    return (Math.abs(area) * 111000 * 111000) / 2;
  };

  const calculateOverallStats = () => {
    const completedMissions = missions.filter((m) => m.status === "completed");
    return {
      totalMissions: missions.length,
      completedMissions: completedMissions.length,
      averageDuration:
        completedMissions.reduce(
          (acc, m) => acc + (m.estimatedDuration || 0),
          0
        ) / completedMissions.length || 0,
      averageDistance:
        completedMissions.reduce(
          (acc, m) => acc + (m.estimatedDistance || 0),
          0
        ) / completedMissions.length || 0,
      totalArea: completedMissions.reduce(
        (acc, m) => acc + calculateArea(m.surveyAreaPolygon),
        0
      ),
    };
  };

  const prepareChartData = () => {
    const groupedMissions = missions.reduce((acc, mission) => {
      const date = new Date(mission.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(mission);
      return acc;
    }, {});

    return Object.entries(groupedMissions).map(([date, missions]) => ({
      date,
      count: missions.length,
      totalDistance: missions.reduce(
        (acc, m) => acc + (m.estimatedDistance || 0),
        0
      ),
      averageDuration:
        missions.reduce((acc, m) => acc + (m.estimatedDuration || 0), 0) /
        missions.length,
    }));
  };

  const stats = calculateOverallStats();
  const chartData = prepareChartData();

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Survey Analytics & Reporting
      </Typography>

      <Box mb={3}>
        <FormControl size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} mb={3}>
        {[
          { label: "Total Missions", value: stats.totalMissions },
          { label: "Completed Missions", value: stats.completedMissions },
          {
            label: "Avg. Duration",
            value: `${stats.averageDuration.toFixed(1)} min`,
          },
          {
            label: "Avg. Distance",
            value: `${stats.averageDistance.toFixed(0)} m`,
          },
          {
            label: "Total Area Covered",
            value: `${(stats.totalArea / 1000000).toFixed(2)} km²`,
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="Mission Overview" />
          <Tab label="Flight Statistics" />
          <Tab label="Mission Details" />
        </Tabs>

        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Missions Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Mission Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: stats.completedMissions },
                      {
                        name: "Pending",
                        value: stats.totalMissions - stats.completedMissions,
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Average Flight Duration
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="averageDuration"
                    fill="#82ca9d"
                    name="Duration (min)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Total Distance Covered
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalDistance"
                    fill="#8884d8"
                    name="Distance (m)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Paper elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mission Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Distance</TableCell>
                  <TableCell>Area Covered</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell>{mission.name}</TableCell>
                    <TableCell>{mission.status}</TableCell>
                    <TableCell>
                      {mission.estimatedDuration?.toFixed(1)} min
                    </TableCell>
                    <TableCell>
                      {mission.estimatedDistance?.toFixed(0)} m
                    </TableCell>
                    <TableCell>
                      {(
                        calculateArea(mission.surveyAreaPolygon) / 1000000
                      ).toFixed(2)}{" "}
                      km²
                    </TableCell>
                    <TableCell>
                      {new Date(mission.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ReportingPage;
