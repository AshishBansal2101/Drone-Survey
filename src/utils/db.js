import Dexie from "dexie";

const db = new Dexie("DroneSystemDB");

db.version(1).stores({
  storage: "&key", // `key` is unique identifier
  droneMissions: "++id",
});

export default db;
