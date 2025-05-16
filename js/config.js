export const slotMeta = [
    { letter: "A", start: "08:10", end: "09:00" },
    { letter: "B", start: "09:10", end: "10:00" },
    { letter: "C", start: "10:10", end: "11:00" },
    { letter: "D", start: "11:10", end: "12:00" },
    { letter: "E", start: "13:10", end: "14:00" },
    { letter: "F", start: "14:10", end: "15:00" },
    { letter: "G", start: "15:10", end: "16:00" },
    { letter: "H", start: "16:10", end: "17:00" },
    { letter: "Z", start: "17:10", end: "18:00" },
    { letter: "X", start: "18:00", end: "23:59" }
  ];
  
  export const extraBusy = {
    Leo: [
      { weekday: 0, start: "18:00", end: "20:30" },
      { weekday: 1, start: "18:00", end: "20:30" },
      { weekday: 4, start: "19:00", end: "21:30" }
    ],
    "卍霸氣a文山區新垣結衣aka想改名舒華的人乂": Array.from({ length: 7 }, (_, w) => ({ weekday: w, start: "20:30", end: "23:59" })),
    "總共五個字": [
      { weekday: 5, start: "00:00", end: "23:59" },
      { weekday: 6, start: "00:00", end: "23:59" }
    ]
  };
  
export const fallbackPhoto = "./images/WantedPhotos/HideAndSeekLogo.jpg";
