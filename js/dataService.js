import { fallbackPhoto } from './config.js';

class DataService {
  constructor() {
    this.schedules = {};
    this.isLoaded = false;
  }

  async loadData() {
    try {
      const schedulesResponse = await fetch("schedules.json");

      this.schedules = await schedulesResponse.json();
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error("Failed to load data:", error);
      return false;
    }
  }

  getSchedules() {
    return this.schedules;
  }

  getScheduleNames() {
    return Object.keys(this.schedules);
  }

  getScheduleByName(name) {
    return this.schedules[name];
  }

  getPhotoSrc(name) {
    const pid = this.schedules[name]?.pid;
    return pid
    ? `./images/WantedPhotos/${encodeURIComponent(pid)}.png`
    : fallbackPhoto;
         
  
  }
}

export default new DataService();