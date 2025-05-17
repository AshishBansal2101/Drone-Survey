import { create } from "zustand";
import { staticDrones } from "../data/staticDrones";
const initialState = {
  drones: [...staticDrones],
  initialized: false,
};

export const useDroneStore = create((set, get) => ({
  ...initialState,

  initialize: () => {
    // Check if already initialized
    if (get().initialized) return;

    // Load any saved drone states from localStorage
    const savedDrones = localStorage.getItem("drones");
    if (savedDrones) {
      set({ drones: JSON.parse(savedDrones), initialized: true });
    } else {
      // If no saved state, use static drones
      set({ drones: [...staticDrones], initialized: true });
    }
  },

  getAvailableDrone: () => {
    const { drones } = get();
    return drones.find((drone) => drone.status === "available");
  },

  getAvailableDroneByLocation: (location) => {
    const { drones } = get();
    return drones.find(
      (drone) => drone.status === "available" && drone.location === location
    );
  },

  assignDroneToMission: (missionId, location) => {
    const availableDrone = get().getAvailableDroneByLocation(location);
    if (!availableDrone) return null;

    set((state) => {
      const updatedDrones = state.drones.map((drone) =>
        drone.id === availableDrone.id
          ? {
              ...drone,
              status: "in-mission",
              lastMission: new Date().toISOString(),
              currentMissionId: missionId,
              totalFlights: drone.totalFlights + 1,
            }
          : drone
      );

      // Save to localStorage
      localStorage.setItem("drones", JSON.stringify(updatedDrones));

      return { drones: updatedDrones };
    });

    return availableDrone;
  },

  releaseDrone: (droneId) => {
    set((state) => {
      const updatedDrones = state.drones.map((drone) =>
        drone.id === droneId
          ? {
              ...drone,
              status: "available",
              currentMissionId: null,
              batteryLevel: Math.max(drone.batteryLevel - 10, 0), // Reduce battery level after mission
            }
          : drone
      );

      localStorage.setItem("drones", JSON.stringify(updatedDrones));

      return { drones: updatedDrones };
    });
  },

  updateDroneStatus: (droneId, newStatus) => {
    set((state) => {
      const updatedDrones = state.drones.map((drone) =>
        drone.id === droneId ? { ...drone, status: newStatus } : drone
      );

      localStorage.setItem("drones", JSON.stringify(updatedDrones));

      return { drones: updatedDrones };
    });
  },

  updateDroneBattery: (droneId, batteryLevel) => {
    set((state) => {
      const updatedDrones = state.drones.map((drone) =>
        drone.id === droneId ? { ...drone, batteryLevel } : drone
      );

      localStorage.setItem("drones", JSON.stringify(updatedDrones));

      return { drones: updatedDrones };
    });
  },

  getDroneById: (droneId) => {
    return get().drones.find((drone) => drone.id === droneId);
  },

  getFleetStats: () => {
    const { drones } = get();
    return {
      total: drones.length,
      available: drones.filter((d) => d.status === "available").length,
      inMission: drones.filter((d) => d.status === "in-mission").length,
      maintenance: drones.filter((d) => d.status === "maintenance").length,
      charging: drones.filter((d) => d.status === "charging").length,
    };
  },
}));

// Custom hook for initialization
export const useInitializedDroneStore = () => {
  const store = useDroneStore();

  React.useEffect(() => {
    if (!store.initialized) {
      store.initialize();
    }
  }, [store.initialized]);

  return store;
};
