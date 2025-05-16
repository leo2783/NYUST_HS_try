// main.js
const fallbackPhoto =
  "./images/WantedPhotos/HideAndSeekLogo.jpg";

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
  { letter: "X", start: "18:00", end: "23:59" },
];

const extraBusy = {
  Leo: [
    { weekday: 0, start: "18:00", end: "20:30" },
    { weekday: 1, start: "18:00", end: "20:30" },
    { weekday: 4, start: "19:00", end: "21:30" },
  ],
  卍霸氣a文山區新垣結衣aka想改名舒華的人乂: Array.from(
    { length: 7 },
    (_, w) => ({ weekday: w, start: "20:30", end: "23:59" })
  ),
  總共五個字: [
    { weekday: 5, start: "00:00", end: "23:59" },
    { weekday: 6, start: "00:00", end: "23:59" },
  ],
};

let schedules = {},
  photoMap = {};
const $ = (id) => document.getElementById(id);

// bootstrap
(async () => {
  try {
    [schedules, photoMap] = await Promise.all([
      fetch("schedules.json").then((r) => r.json()),
      fetch("WantedPhotos.json").then((r) => r.json()),
    ]);
  } catch (_) {}
  init();
})();

// build UI + events
function init() {
  const dom = {
    select: $("scheduleSelect"),
    slot: $("timeSlotSelect"),
    week: $("weekdaySelect"),
    res: $("result"),
    img: $("memberPhoto"),
    marq: document.querySelector("#freeMarquee span"),
  };

  Object.keys(schedules).forEach((n) =>
    dom.select.insertAdjacentHTML("beforeend", `<option>${n}</option>`)
  );

  $("searchBtn").addEventListener("click", () => search(dom));
  updateMarquee(dom);
  setInterval(() => updateMarquee(dom), 60_000);
}

const getSlotIdx = (d = new Date()) => {
  const t = d.toTimeString().slice(0, 5);
  return slotMeta.findIndex(({ start, end }) => start <= t && t < end);
};

const isBusy = (name, w, t) =>
  (extraBusy[name] || []).some(
    ({ weekday, start, end }) => weekday === w && start <= t && t < end
  );
function photoSrc(name) {
  const pid = schedules[name]?.pid; // ← 讀剛才塞進 schedules 的 pid
  return pid && photoMap[pid] ? encodeURI(photoMap[pid]) : fallbackPhoto;
}

function freeList(w, s, t) {
  return Object.entries(schedules)
    .filter(([n, { data }]) => {
      const row = data?.[s];
      return row && row[w] === "0" && !isBusy(n, w, t);
    })
    .map(([n]) => n);
}

function search({ select, slot, week, res, img }) {
  const name = select.value.trim();
  const sIdx = +slot.value,
    wIdx = +week.value;
  img.src = photoSrc(name);
  img.alt = name;
  const sch = schedules[name];
  if (!sch) {
    res.textContent = "查無此課表";
    return;
  }

  const [sTime, eTime] = [slotMeta[sIdx].start, slotMeta[sIdx].end];
  const clash = (extraBusy[name] || []).find(
    ({ weekday, start, end }) =>
      weekday === wIdx && !(end <= sTime || start >= eTime)
  );

  if (!sch.data?.length) {
    res.textContent = clash
      ? `不能被侵犯：${clash.start}～${clash.end}`
      : "神秘兮兮的沒有課表，非常欠抓";
    return;
  }

  const course = sch.data[sIdx]?.[wIdx];
  res.textContent =
    course && course !== "0"
      ? `該時段有課：${course}`
      : clash
      ? `不能被侵犯：${clash.start}～${clash.end}`
      : "這個時間我很閒，我很欠抓！";
}

function updateMarquee({ marq }) {
  if (!Object.keys(schedules).length) {
    marq.textContent = "載入課表中…";
    return;
  }
  const now = new Date(),
    wIdx = now.getDay() - 1,
    sIdx = getSlotIdx(now),
    t = now.toTimeString().slice(0, 5);
  if (wIdx < 0 || wIdx > 4) {
    marq.textContent = "週末愉快～大家都放假！";
    return;
  }
  if (sIdx === -1) {
    marq.textContent = "目前不在排課節次";
    return;
  }
  const list = freeList(wIdx, sIdx, t);
  marq.textContent = list.length
    ? `現在 ${slotMeta[sIdx].letter} 節有空：${list.join("、")}`
    : `現在 ${slotMeta[sIdx].letter} 節大家都沒空喔！`;
}
