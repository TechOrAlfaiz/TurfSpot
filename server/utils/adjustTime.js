import {
  parseISO,
  addHours,
  addMinutes,
  setYear,
  setMonth,
  setDate,
} from "date-fns";

function adjustTime(timeString, selectedTurfDate) {
  if (!timeString) return new Date();

  let hours = 0;
  let minutes = 0;

  const time12Match = String(timeString).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const time24Match = String(timeString).match(/^(\d{1,2}):(\d{2})$/);

  if (time12Match) {
    let h = parseInt(time12Match[1], 10);
    const m = parseInt(time12Match[2], 10);
    const meridiem = time12Match[3].toUpperCase();
    if (meridiem === "PM" && h < 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    hours = h;
    minutes = m;
  } else if (time24Match) {
    hours = parseInt(time24Match[1], 10);
    minutes = parseInt(time24Match[2], 10);
  } else {
    const parsed = new Date(timeString);
    if (!isNaN(parsed.getTime())) {
      hours = parsed.getHours();
      minutes = parsed.getMinutes();
    }
  }

  let baseDate = new Date();
  if (selectedTurfDate) {
    const parsedDate = new Date(selectedTurfDate);
    if (!isNaN(parsedDate.getTime())) {
      baseDate = parsedDate;
    }
  }

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export default adjustTime;
