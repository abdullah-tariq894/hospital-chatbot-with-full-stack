// src/lib/schedule.js
// Din/waqt ke hisaab se doctor ka live status compute karna

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_LABELS = {sun:"Sunday",mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday"};

function todayKey(date){ return DAY_KEYS[date.getDay()]; }
function toMinutes(hhmm){ const [h,m] = hhmm.split(':').map(Number); return h*60+m; }
function fmtTime(hhmm){
  const [h,m] = hhmm.split(':').map(Number);
  const period = h>=12 ? 'PM' : 'AM';
  let hr = h % 12; if(hr===0) hr = 12;
  return `${hr}:${String(m).padStart(2,'0')} ${period}`;
}
function fmtRange(r){ return `${fmtTime(r.start)} – ${fmtTime(r.end)}`; }

function doctorSlotsForDay(doctorSchedule, dayKey){
  return doctorSchedule[dayKey] || [];
}
function isWithinAnySlot(slots, minutesNow){
  return slots.some(s => minutesNow >= toMinutes(s.start) && minutesNow <= toMinutes(s.end));
}
function nextScheduledDay(doctorSchedule, fromDayIndex){
  for(let i=1;i<=7;i++){
    const idx = (fromDayIndex+i) % 7;
    const key = DAY_KEYS[idx];
    const slots = doctorSchedule[key] || [];
    if(slots.length) return {dayKey:key, slots};
  }
  return null;
}

// Master computation combining static schedule + live presence
function computeDoctorStatus(doctor, presenceMap, now){
  const dayKey = todayKey(now);
  const minutesNow = now.getHours()*60 + now.getMinutes();
  const todaysSlots = doctorSlotsForDay(doctor.schedule, dayKey);
  const scheduledToday = todaysSlots.length > 0;
  const withinHoursNow = isWithinAnySlot(todaysSlots, minutesNow);
  const liveStatus = doctor.onLeave ? 'on_leave' : (presenceMap[doctor.id] || 'absent');
  const currentlyAvailable = !doctor.onLeave && scheduledToday && withinHoursNow && liveStatus === 'present';

  let next = null;
  if(!scheduledToday || !withinHoursNow){
    const n = nextScheduledDay(doctor.schedule, now.getDay());
    if(n) next = { dayLabel: DAY_LABELS[n.dayKey], times: n.slots.map(fmtRange).join(', ') };
  }

  return {
    dayKey, scheduledToday, todaysSlots, withinHoursNow, liveStatus,
    currentlyAvailable, next
  };
}

/* =========================================================================
   3. TEXT NORMALIZATION + FUZZY-ISH MATCHING (EN / Urdu / Roman Urdu)
   ========================================================================= */

export {
  DAY_KEYS, DAY_LABELS, todayKey, toMinutes, fmtTime, fmtRange,
  doctorSlotsForDay, isWithinAnySlot, nextScheduledDay, computeDoctorStatus,
};
