import { slotMeta, extraBusy } from '../config.js';
import dataService from '../dataService.js';

export function getSlotIdx(date = new Date()) {
  const timeString = date.toTimeString().slice(0, 5);
  return slotMeta.findIndex(({ start, end }) => start <= timeString && timeString < end);
}

export function isBusy(name, weekday, time) {
  const personBusy = extraBusy[name] || [];
  return personBusy.some(({ weekday: busyDay, start, end }) => 
    busyDay === weekday && start <= time && time < end
  );
}

export function getFreeList(weekday, slotIndex, time) {
  const schedules = dataService.getSchedules();
  
  return Object.entries(schedules)
    .filter(([name, { data }]) => {
      const row = data?.[slotIndex];
      return row && row[weekday] === "0" && !isBusy(name, weekday, time);
    })
    .map(([name]) => name);
}

export function checkTimeConflict(busy, slotStart, slotEnd) {
  return busy.find(({ start, end }) => !(end <= slotStart || start >= slotEnd));
}

export function getCurrentStatus() {
  const now = new Date();
  const weekday = now.getDay() - 1;
  const slotIndex = getSlotIdx(now);
  const time = now.toTimeString().slice(0, 5);
  
  // Weekend check
  if (weekday < 0 || weekday > 4) {
    return { message: "週末愉快～大家都放假！" };
  }
  
  // Not in class period
  if (slotIndex === -1) {
    return { message: "目前不在排課節次" };
  }
  
  const freePersons = getFreeList(weekday, slotIndex, time);
  const slotLetter = slotMeta[slotIndex].letter;
  
  if (freePersons.length) {
    return { 
      message: `現在 ${slotLetter} 節有空：${freePersons.join("、")}`,
      freePersons,
      slotLetter
    };
  } else {
    return { 
      message: `現在 ${slotLetter} 節大家都沒空喔！`,
      freePersons: [],
      slotLetter
    };
  }
}