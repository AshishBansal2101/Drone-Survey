import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import Dexie from "dexie";
import { useEffect } from "react";
import { useDroneStore } from "./droneStore";

// Initialize Dexie database
const db = new Dexie("DroneSurveyDB");
db.version(1).stores({
  missions: "++id, name, status, createdAt, location",
});

const initialState = {
  missions: [],
  activeMission: null,
  initialized: false,
};

// Zustand store for managing missions
export const useMissionStore = create((set, get) => ({
  missions: initialState.missions,
  activeMission: initialState.activeMission,
  initialized: initialState.initialized,

  initialize: async () => {
    // Check if already initialized
    if (get().initialized) return;

    try {
      const missions = await db.missions.toArray();
      set({ missions, initialized: true });
    } catch (error) {
      console.error("Error loading missions:", error);
      set({ initialized: true });
    }
  },

  fetchMissions: async () => {
    try {
      const missions = await db.missions.toArray();
      console.log("Fetched missions:", missions); // Log fetched missions
      set({ missions });
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  },

  fetchMissionsByLocation: async (location) => {
    try {
      const missions = await db.missions
        .where("location")
        .equals(location)
        .toArray();
      set({ missions });
    } catch (error) {
      console.error("Error fetching missions by location:", error);
    }
  },

  // Rest of your store methods remain the same
  createNewMission: (name, description, location) => {
    const droneStore = useDroneStore.getState();
    const assignedDrone = droneStore.assignDroneToMission();
    const newMission = {
      id: uuidv4(),
      name,
      description,
      location, // Add location to mission
      status: assignedDrone ? "assigned" : "pending",
      droneId: assignedDrone?.id || null,
      droneName: assignedDrone?.name || null,
      createdAt: new Date(),
      progress: 0, // Ensure progress is initialized
      surveyAreaPolygon: [],
      waypoints: [],
      surveyPattern: "grid",
      parameters: {
        captureFrequency: 5,
        sensors: ["rgb"],
        altitudeMeters: 50,
        overlapPercentage: 70,
        speed: 5,
      },
    };

    // Save to IndexedDB and update state
    db.missions
      .put(newMission)
      .then(() => console.log("Mission created:", newMission))
      .catch((error) => console.error("Error saving mission:", error));

    set((state) => ({
      missions: [...state.missions, newMission],
      activeMission: newMission,
    }));
  },
  cancelMission: (missionId) => {
    const mission = get().missions.find((m) => m.id === missionId);
    if (mission?.droneId) {
      const droneStore = useDroneStore.getState();
      droneStore.releaseDrone(mission.droneId);
    }

    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId
          ? {
              ...mission,
              status: "cancelled",
              completedAt: new Date().toISOString(),
            }
          : mission
      ),
    }));
  },

  updateMissionProgress: (missionId, progress) => {
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId ? { ...mission, progress } : mission
      ),
    }));
  },
  updateSurveyArea: (missionId, polygon) => {
    set((state) => {
      const updatedMissions = state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, surveyAreaPolygon: polygon }
          : mission
      );

      const updatedMission = updatedMissions.find((m) => m.id === missionId);
      if (updatedMission) {
        db.missions
          .put(updatedMission)
          .catch((error) => console.error("Error updating mission:", error));
      }

      return {
        missions: updatedMissions,
        activeMission:
          state.activeMission?.id === missionId
            ? { ...state.activeMission, surveyAreaPolygon: polygon }
            : state.activeMission,
      };
    });
  },

  setSurveyPattern: (missionId, pattern) => {
    set((state) => {
      const updatedMissions = state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, surveyPattern: pattern }
          : mission
      );

      const updatedMission = updatedMissions.find((m) => m.id === missionId);
      if (updatedMission) {
        db.missions
          .put(updatedMission)
          .catch((error) => console.error("Error updating mission:", error));
      }

      return {
        missions: updatedMissions,
        activeMission:
          state.activeMission?.id === missionId
            ? { ...state.activeMission, surveyPattern: pattern }
            : state.activeMission,
      };
    });

    get().generateWaypoints(missionId);
  },

  generateWaypoints: (missionId) => {
    const mission = get().missions.find((m) => m.id === missionId);
    if (!mission || mission.surveyAreaPolygon.length < 3) return;

    const waypoints = [];
    const bounds = getBounds(mission.surveyAreaPolygon);
    const altitude = mission.parameters.altitudeMeters;
    const spacing = mission.parameters.captureFrequency;

    // Generate waypoints based on survey pattern
    if (mission.surveyPattern === "grid") {
      const orderedPolygon = orderPolygonPoints(mission.surveyAreaPolygon);
      for (let i = 0; i < orderedPolygon.length - 1; i++) {
        const start = orderedPolygon[i];
        const end = orderedPolygon[i + 1];
        waypoints.push(...generatePointsAlongLine(start, end, spacing));
      }
    }

    const totalDistance = calculatePathDistance(
      waypoints.map((wp) => wp.coordinates || wp)
    );
    const speed = mission.parameters.speed;
    const duration = totalDistance / speed / 60;
    const batteryUsage = Math.min(100, (duration / 30) * 100);

    set((state) => {
      const updatedMissions = state.missions.map((m) =>
        m.id === missionId
          ? {
              ...m,
              waypoints,
              estimatedDistance: totalDistance,
              estimatedDuration: duration,
              estimatedBatteryUsage: batteryUsage,
            }
          : m
      );

      const updatedMission = updatedMissions.find((m) => m.id === missionId);
      if (updatedMission) {
        db.missions
          .put(updatedMission)
          .catch((error) => console.error("Error updating mission:", error));
      }

      return {
        missions: updatedMissions,
        activeMission:
          state.activeMission?.id === missionId
            ? updatedMissions.find((m) => m.id === missionId)
            : state.activeMission,
      };
    });
  },

  updateMissionParameters: (missionId, parameters) => {
    set((state) => {
      const updatedMissions = state.missions.map((mission) =>
        mission.id === missionId
          ? { ...mission, parameters: { ...mission.parameters, ...parameters } }
          : mission
      );

      const updatedMission = updatedMissions.find((m) => m.id === missionId);
      if (updatedMission) {
        db.missions
          .put(updatedMission)
          .catch((error) => console.error("Error updating mission:", error));
      }

      return {
        missions: updatedMissions,
        activeMission:
          state.activeMission?.id === missionId
            ? {
                ...state.activeMission,
                parameters: {
                  ...state.activeMission.parameters,
                  ...parameters,
                },
              }
            : state.activeMission,
      };
    });

    get().generateWaypoints(missionId);
  },

  saveMission: (mission) => {
    set((state) => {
      const updatedMissions = state.missions.map((m) =>
        m.id === mission.id ? mission : m
      );

      // Save to IndexedDB
      db.missions
        .put(mission)
        .catch((error) => console.error("Error saving mission:", error));

      return {
        missions: updatedMissions,
        activeMission:
          state.activeMission?.id === mission.id
            ? mission
            : state.activeMission,
      };
    });
  },

  deleteMission: (missionId) => {
    set((state) => {
      // Delete from IndexedDB
      db.missions
        .delete(missionId)
        .catch((error) => console.error("Error deleting mission:", error));

      return {
        missions: state.missions.filter((m) => m.id !== missionId),
        activeMission:
          state.activeMission?.id === missionId ? null : state.activeMission,
      };
    });
  },

  setActiveMission: (missionId) => {
    const mission = get().missions.find((m) => m.id === missionId);
    set({ activeMission: mission || null });
  },

  cleanupOldMissions: (location) => {
    set((state) => {
      const filteredMissions = state.missions.filter(
        (m) => m.location === location
      );
      const sortedMissions = [...filteredMissions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const missionsToKeep = sortedMissions.slice(0, 20);

      sortedMissions
        .slice(20)
        .forEach((mission) =>
          db.missions
            .delete(mission.id)
            .catch((error) => console.error("Error deleting mission:", error))
        );

      return {
        missions: state.missions.filter((m) =>
          missionsToKeep.some((keep) => keep.id === m.id)
        ),
        activeMission:
          state.activeMission &&
          missionsToKeep.find((m) => m.id === state.activeMission.id)
            ? state.activeMission
            : null,
      };
    });
  },
}));

// Initialize the store with data from IndexedDB
useMissionStore.getState().initialize();

// Helper functions
function getBounds(polygon) {
  let north = -90,
    south = 90,
    east = -180,
    west = 180;

  polygon.forEach((point) => {
    north = Math.max(north, point.lat);
    south = Math.min(south, point.lat);
    east = Math.max(east, point.lng);
    west = Math.min(west, point.lng);
  });

  return { north, south, east, west };
}

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

function getDistance(lng1, lat1, lng2, lat2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generatePointsAlongLine(start, end, spacing) {
  const points = [start];
  const distance = getDistance(start.lng, start.lat, end.lng, end.lat);

  if (distance <= spacing) {
    points.push(end);
    return points;
  }

  const segments = Math.floor(distance / spacing);

  for (let i = 1; i <= segments; i++) {
    const fraction = i / segments;
    points.push({
      lat: start.lat + fraction * (end.lat - start.lat),
      lng: start.lng + fraction * (end.lng - start.lng),
    });
  }

  return points;
}

function calculatePathDistance(coordinates) {
  let distance = 0;

  for (let i = 1; i < coordinates.length; i++) {
    distance += getDistance(
      coordinates[i - 1].lng,
      coordinates[i - 1].lat,
      coordinates[i].lng,
      coordinates[i].lat
    );
  }

  return distance;
}

function orderPolygonPoints(polygon) {
  const sumLat = polygon.reduce((sum, point) => sum + point.lat, 0);
  const sumLng = polygon.reduce((sum, point) => sum + point.lng, 0);
  const centroid = {
    lat: sumLat / polygon.length,
    lng: sumLng / polygon.length,
  };

  return [...polygon].sort((a, b) => {
    const angleA = Math.atan2(a.lat - centroid.lat, a.lng - centroid.lng);
    const angleB = Math.atan2(b.lat - centroid.lat, b.lng - centroid.lng);
    return angleA - angleB;
  });
}

export const useInitializedMissionStore = () => {
  const store = useMissionStore();

  useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized]);

  return store;
};
