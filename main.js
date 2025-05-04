// ===== 1. 額外忙碌時段 (extraBusy) =====
// 0 = 星期一, 1 = 星期二 … 4 = 星期五（與 slot 資料一致）
const extraBusy = {
    "Leo": [
      { weekday: 0, start: "18:00", end: "20:30" }, // 週一
      { weekday: 1, start: "18:00", end: "20:30" }, // 週二
      { weekday: 4, start: "19:00", end: "21:30" }  // 週五
    ],
    "卍霸氣a文山區新垣結衣aka想改名舒華的人乂":[
      { weekday: 0, start: "20:30", end: "23:59" },
      { weekday: 1, start: "20:30", end: "23:59" },
      { weekday: 2, start: "20:30", end: "23:59" },
      { weekday: 3, start: "20:30", end: "23:59" },
      { weekday: 4, start: "20:30", end: "23:59" },
      { weekday: 5, start: "20:30", end: "23:59" },
      { weekday: 6, start: "20:30", end: "23:59" }
    ],
    "總共五個字":[
      { weekday: 5, start: "00:00", end: "23:59" },
      { weekday: 6, start: "00:00", end: "23:59" }
    ]
  };
  
  /*****************************
   * 2. 節次時間對照 (slotMeta)
   *****************************/
  const slotMeta = [
    { letter: "A", start: "08:10", end: "09:00" },
    { letter: "B", start: "09:10", end: "10:00" },
    { letter: "C", start: "10:10", end: "11:00" },
    { letter: "D", start: "11:10", end: "12:00" },
    { letter: "E", start: "13:10", end: "14:00" },
    { letter: "F", start: "14:10", end: "15:00" },
    { letter: "G", start: "15:10", end: "16:00" },
    { letter: "H", start: "16:10", end: "17:00" },
    { letter: "Z", start: "17:10", end: "18:00" },
    // 新增 18:00 之後
    { letter: "X", start: "18:00", end: "23:59" }
  ];
  
  
  /*****************************
   * 3. 公用工具函式            *
   *****************************/
  // 3‑1 取得現在屬於哪一節 (回傳 slotMeta 的索引)
  function getCurrentSlotIndex(date = new Date()) {
    const hhmm = date.toTimeString().slice(0, 5); // "HH:MM"
    return slotMeta.findIndex(({ start, end }) => start <= hhmm && hhmm < end);
  }
  
  // 3‑2 判斷是否在額外忙碌時段
  function isExtraBusy(name, weekdayIdx, hhmm) {
    const list = extraBusy[name];
    if (!list) return false;
    return list.some(({ weekday, start, end }) => weekday === weekdayIdx && start <= hhmm && hhmm < end);
  }
  
  // 3‑3 找出本節有空的人陣列 (傳回姓名)
  function findFreeStudents(schedules, weekdayIdx, slotIdx, hhmmNow) {
    return Object.entries(schedules)
      .filter(([name, { data }]) => {
        const hasScheduleData = Array.isArray(data) && data[slotIdx];
        if (!hasScheduleData) return false;
        const noClass   = data[slotIdx][weekdayIdx] === "0";
        const notBusy   = !isExtraBusy(name, weekdayIdx, hhmmNow);
        return noClass && notBusy;
      })
      .map(([name]) => name);
  }
  
  /*****************************
   * 4. 入口：先載入 schedules.json，再啟動 App
   *****************************/
  let schedules = {};
  fetch("schedules.json")
    .then(res => res.json())
    .then(json => {
      schedules = json;
      initApp();
    })
    .catch(err => {
      console.error("載入 schedules.json 失敗", err);
      initApp(); // 即使失敗，也初始化，以免無互動
    });
  
  /*****************************
   * 5. 初始化 UI 與事件          *
   *****************************/
  function initApp() {
    const scheduleSelect = document.getElementById("scheduleSelect");
    const timeSlotSelect = document.getElementById("timeSlotSelect");
    const weekdaySelect  = document.getElementById("weekdaySelect");
    const resultDiv      = document.getElementById("result");
  
    // 5‑1 動態產生「姓名」下拉選單
    Object.keys(schedules).forEach(name => {
      const opt       = document.createElement("option");
      opt.value       = name;
      opt.textContent = name;
      scheduleSelect.appendChild(opt);
    });
  
    // 5‑2 課表查詢按鈕
    document.getElementById("searchBtn").addEventListener("click", () => {
      const name       = scheduleSelect.value;
      const slotIdx    = Number(timeSlotSelect.value);
      const weekdayIdx = Number(weekdaySelect.value);
    
      // 取出該 slot 的完整時間區間
      const slotStart = slotMeta[slotIdx].start;
      const slotEnd   = slotMeta[slotIdx].end;
    
      const sched = schedules[name];
      if (!sched) {
        resultDiv.textContent = "查無此課表";
        return;
      }
    
      // 判斷整段 slot 與 extraBusy 任一區間是否有交集
      const busySlot = (extraBusy[name] || []).find(({ weekday, start, end }) => {
        if (weekday !== weekdayIdx) return false;
        // 沒交集的兩種情況：extra 結束 ≤ slot 開始，或 extra 開始 ≥ slot 結束
        const noOverlap = (end <= slotStart) || (start >= slotEnd);
        return !noOverlap;
      });
    
      // 如果根本沒 data
      if (!Array.isArray(sched.data) || sched.data.length === 0) {
        if (busySlot) {
          resultDiv.textContent = `不能被侵犯：${busySlot.start} ～ ${busySlot.end}`;
        } else {
          resultDiv.textContent = "神秘兮兮的沒有課表，非常欠抓";
        }
        return;
      }
    
      // 有排課的話先看有無課
      const course = sched.data[slotIdx]
                   ? sched.data[slotIdx][weekdayIdx]
                   : null;
    
      if (course && course !== "0") {
        resultDiv.textContent = `該時段有課：${course}`;
      } else if (busySlot) {
        // 只要交集就當忙碌，顯示完整 extraBusy 範圍
        resultDiv.textContent = `不能被侵犯：${busySlot.start} ～ ${busySlot.end}`;
      } else {
        resultDiv.textContent = "這個時間我很閒，我很欠抓！";
      }
    });
    
  
    // 5‑3 跑馬燈：每分鐘更新一次
    updateFreeMarquee();
    setInterval(updateFreeMarquee, 60 * 1000);
  }
  
  /*****************************
   * 6. 跑馬燈更新邏輯            *
   *****************************/
  function updateFreeMarquee() {
    const span = document.querySelector("#freeMarquee span");
    if (!span) return;
  
    if (!Object.keys(schedules).length) {
      span.textContent = "載入課表中…";
      return;
    }
  
    const now         = new Date();
    const weekdayIdx  = now.getDay() - 1; // 0 = 一 … 4 = 五
    const slotIdx     = getCurrentSlotIndex(now);
    const hhmm        = now.toTimeString().slice(0, 5);
  
    if (weekdayIdx < 0 || weekdayIdx > 4) {
      span.textContent = "週末愉快～大家都放假！";
      return;
    }
    if (slotIdx === -1) {
      span.textContent = "目前不在排課節次";
      return;
    }
  
    const freeList = findFreeStudents(schedules, weekdayIdx, slotIdx, hhmm);
    span.textContent = freeList.length
      ? `現在 ${slotMeta[slotIdx].letter} 節有空：${freeList.join("、")}`
      : `現在 ${slotMeta[slotIdx].letter} 節大家都沒空喔！`;
  }
  