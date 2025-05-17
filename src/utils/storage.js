// src/utils/storage.js

import LZString from "lz-string";

export const storageUtils = {
  saveToStorage: (key, data) => {
    try {
      const compressedData = LZString.compress(JSON.stringify(data));
      localStorage.setItem(key, compressedData);
      return data;
    } catch (error) {
      console.error("Storage error:", error);
      if (error.name === "QuotaExceededError") {
        try {
          const missions = data.slice(-10);
          const compressedData = LZString.compress(JSON.stringify(missions));
          localStorage.setItem(key, compressedData);
          return missions;
        } catch (e) {
          console.error("Failed to save even after cleanup:", e);
          return data;
        }
      }
      return data;
    }
  },

  loadFromStorage: (key) => {
    try {
      const compressedData = localStorage.getItem(key);
      if (!compressedData) return [];

      const decompressedData = LZString.decompress(compressedData);
      return JSON.parse(decompressedData);
    } catch (error) {
      console.error("Error loading from storage:", error);
      return [];
    }
  },

  clearOldMissions: (missions, keepCount = 10) => {
    return missions.slice(-keepCount);
  },

  checkStorageSpace: () => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += localStorage[x].length;
      }
    }
    return (total / (5 * 1024 * 1024)) * 100;
  },
};
