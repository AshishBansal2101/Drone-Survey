// src/db/database.js
import Dexie from "dexie";

export const db = new Dexie("DroneSurveyDB");

db.version(1).stores({
  missions: "++id, name, status, createdAt",
  waypoints: "[missionId+index], missionId",
  surveyAreas: "missionId",
});

db.version(2).stores({
  missions: "++id, name, status, createdAt, location", // Add location index
  waypoints: "[missionId+index], missionId",
  surveyAreas: "missionId",
});

// Helper functions for database operations
export const dbOperations = {
  // Mission operations
  saveMission: async (mission) => {
    try {
      // Separate waypoints and survey area to different tables for better performance
      const { waypoints, surveyAreaPolygon, ...missionData } = mission;

      // Save mission data
      const missionId = await db.missions.put(missionData);

      // Save waypoints
      if (waypoints?.length) {
        await db.waypoints.bulkPut(
          waypoints.map((wp, index) => ({
            ...wp,
            missionId,
            index,
          }))
        );
      }

      // Save survey area
      if (surveyAreaPolygon?.length) {
        await db.surveyAreas.put({
          missionId,
          polygon: surveyAreaPolygon,
        });
      }

      return missionId;
    } catch (error) {
      console.error("Error saving mission:", error);
      throw error;
    }
  },

  getMission: async (id) => {
    try {
      const mission = await db.missions.get(id);
      if (!mission) return null;

      // Get associated waypoints
      const waypoints = await db.waypoints
        .where("missionId")
        .equals(id)
        .sortBy("index");

      // Get survey area
      const surveyArea = await db.surveyAreas.get(id);

      return {
        ...mission,
        waypoints: waypoints || [],
        surveyAreaPolygon: surveyArea?.polygon || [],
      };
    } catch (error) {
      console.error("Error getting mission:", error);
      throw error;
    }
  },

  getAllMissions: async () => {
    try {
      const missions = await db.missions.toArray();
      const fullMissions = await Promise.all(
        missions.map(async (mission) => {
          const waypoints = await db.waypoints
            .where("missionId")
            .equals(mission.id)
            .sortBy("index");

          const surveyArea = await db.surveyAreas.get(mission.id);

          return {
            ...mission,
            waypoints: waypoints || [],
            surveyAreaPolygon: surveyArea?.polygon || [],
          };
        })
      );
      return fullMissions;
    } catch (error) {
      console.error("Error getting all missions:", error);
      throw error;
    }
  },

  getMissionsByLocation: async (location) => {
    try {
      const missions = await db.missions.where("location").equals(location).toArray();
      const fullMissions = await Promise.all(
        missions.map(async (mission) => {
          const waypoints = await db.waypoints
            .where("missionId")
            .equals(mission.id)
            .sortBy("index");

          const surveyArea = await db.surveyAreas.get(mission.id);

          return {
            ...mission,
            waypoints: waypoints || [],
            surveyAreaPolygon: surveyArea?.polygon || [],
          };
        })
      );
      return fullMissions;
    } catch (error) {
      console.error("Error getting missions by location:", error);
      throw error;
    }
  },

  deleteMission: async (id) => {
    try {
      await db.transaction(
        "rw",
        [db.missions, db.waypoints, db.surveyAreas],
        async () => {
          await db.missions.delete(id);
          await db.waypoints.where("missionId").equals(id).delete();
          await db.surveyAreas.delete(id);
        }
      );
    } catch (error) {
      console.error("Error deleting mission:", error);
      throw error;
    }
  },

  updateMissionStatus: async (id, status) => {
    try {
      await db.missions.update(id, { status });
    } catch (error) {
      console.error("Error updating mission status:", error);
      throw error;
    }
  },

  cleanup: async () => {
    try {
      // Keep only the last 20 missions
      const missions = await db.missions
        .orderBy("createdAt")
        .reverse()
        .offset(20)
        .primaryKeys();

      if (missions.length > 0) {
        await db.transaction(
          "rw",
          [db.missions, db.waypoints, db.surveyAreas],
          async () => {
            await Promise.all(
              missions.map((id) => dbOperations.deleteMission(id))
            );
          }
        );
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      throw error;
    }
  },
};
