
import { slotMeta, extraBusy } from './config.js';
import dataService from './dataService.js';
import { getCurrentStatus, checkTimeConflict } from './utils/scheduleUtils.js';

class UIController {
  constructor() {
    this.elements = {
      select: null,
      slot: null,
      week: null,
      result: null,
      img: null,
      marquee: null,
      searchBtn: null
    };
    this.initialized = false;
  }

  init() {
    // Get DOM elements
    this.elements = {
      select: document.getElementById("scheduleSelect"),
      slot: document.getElementById("timeSlotSelect"),
      week: document.getElementById("weekdaySelect"),
      result: document.getElementById("result"),
      img: document.getElementById("memberPhoto"),
      marquee: document.querySelector("#freeMarquee span"),
      searchBtn: document.getElementById("searchBtn")
    };

    // Populate the schedule select dropdown
    this.populateScheduleSelect();

    // Add event listeners
    this.elements.searchBtn.addEventListener("click", () => this.handleSearch());

    // Initialize the marquee
    this.updateMarquee();
    setInterval(() => this.updateMarquee(), 60000); // Update every minute

    this.initialized = true;
  }

  populateScheduleSelect() {
    const names = dataService.getScheduleNames();
    if (!names || !names.length) {
      console.error("No schedule names available");
      return;
    }
    
    names.forEach(name => {
      this.elements.select.insertAdjacentHTML("beforeend", `<option>${name}</option>`);
    });
  }

  handleSearch() {
    const name = this.elements.select.value.trim();
    const slotIndex = +this.elements.slot.value;
    const weekdayIndex = +this.elements.week.value;
    
    // Update the photo
    if (dataService.getPhotoSrc) {
      this.elements.img.src = dataService.getPhotoSrc(name);
      this.elements.img.alt = name;
    }
    
    // Get the schedule
    const schedule = dataService.getScheduleByName(name);
    
    if (!schedule) {
      this.elements.result.textContent = "查無此課表";
      return;
    }

    const slotInfo = slotMeta[slotIndex];
    if (!slotInfo) {
      this.elements.result.textContent = "時間段無效";
      return;
    }
    
    const [slotStart, slotEnd] = [slotInfo.start, slotInfo.end];
    const personBusy = extraBusy[name] || [];
    const clash = checkTimeConflict(
      personBusy.filter(item => item.weekday === weekdayIndex),
      slotStart,
      slotEnd
    );

    // Handle no schedule data
    if (!schedule.data || !schedule.data.length) {
      this.elements.result.textContent = clash 
        ? `不能被侵犯：${clash.start}～${clash.end}` 
        : "神秘兮兮的沒有課表，非常欠抓";
      return;
    }

    // Check course data - ensure slot and day index are within bounds
    const courseRow = schedule.data[slotIndex];
    const course = courseRow && weekdayIndex < courseRow.length ? courseRow[weekdayIndex] : null;
    
    if (course && course !== "0") {
      this.elements.result.textContent = `該時段有課：${course}`;
    } else if (clash) {
      this.elements.result.textContent = `不能被侵犯：${clash.start}～${clash.end}`;
    } else {
      this.elements.result.textContent = "這個時間我很閒，我很欠抓！";
    }
  }

  updateMarquee() {
    if (!dataService || !dataService.isLoaded) {
      this.elements.marquee.textContent = "載入課表中…";
      return;
    }

    try {
      const status = getCurrentStatus();
      this.elements.marquee.textContent = status.message;
    } catch (error) {
      console.error("Error updating marquee:", error);
      this.elements.marquee.textContent = "狀態更新失敗";
    }
  }
}

export default new UIController();