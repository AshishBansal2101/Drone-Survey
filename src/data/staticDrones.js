// Delete this file if `staticDrones` is not used elsewhere in the project.
export const staticDrones = [
  {
    id: "drone-001",
    name: "Phantom Pro",
    model: "DJI Phantom 4 Pro",
    status: "available", // available, in-mission, maintenance
    batteryLevel: 92,
    lastMission: null,
    totalFlights: 48,
    location: "Main Hangar",
    maxFlightTime: 30, // minutes
    maxSpeed: 45, // km/h
  },
  {
    id: "drone-002",
    name: "Mavic Surveyor",
    model: "DJI Mavic 3",
    status: "available",
    batteryLevel: 85,
    lastMission: null,
    totalFlights: 32,
    location: "Main Hangar",
    maxFlightTime: 25,
    maxSpeed: 40,
  },
  {
    id: "drone-003",
    name: "Scout 1",
    model: "Autel EVO II",
    status: "available",
    batteryLevel: 78,
    lastMission: null,
    totalFlights: 61,
    location: "Main Hangar",
    maxFlightTime: 35,
    maxSpeed: 50,
  },
];
