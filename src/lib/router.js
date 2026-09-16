// src/lib/router.js
// Main routing: pehle local hospital data mein dhoondo, na mile to Claude fallback (caller ke andar)
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { DAY_LABELS, computeDoctorStatus, todayKey, fmtRange } from './schedule.js';
import {
  norm, KW, matchAny, findBestDoctor, findDeptFromAliases, findDoctorsByDepartment,
  availableDays, isDoctorListQuery, isCountQuery, findDiagnostic, isRomanUrduQuery,
  doctorCardData, testCardData, buildAvailableNow, buildScheduledToday, buildScheduledOnDay,
} from './search.js';

async function routeMessage(rawQuery, presenceMap, now, previousMessages=[]){
  const qn = norm(rawQuery);
  const deptFilter = findDeptFromAliases(rawQuery);

  // --- Medical-advice guardrail ---
  if(matchAny(qn, KW.MEDICAL_ADVICE)){
    return { text: "I can share general information, but I can't diagnose conditions or recommend treatment — that needs an in-person consultation with one of our doctors. Would you like me to show you which specialists are available for this?" };
  }

  // --- Additional hospital information requested by the hospital requirements ---
  if(matchAny(qn, KW.APPOINTMENT) && !deptFilter && !findBestDoctor(rawQuery)){
    return { text: `Appointment booking, cancellation or rescheduling ke liye hospital reception se rabta karein: ${HOSPITAL_DATA.hospital.phones.join(' / ')}. Specific doctor ki timing aur fee bhi yahin se verify ki ja sakti hai.` };
  }
  if(matchAny(qn, KW.PHARMACY)){
    return { text: "Hospital pharmacy 24 hours available hai. Raat ko bhi medicine mil sakti hai." };
  }
  if(matchAny(qn, KW.LAB_HOURS)){
    return { text: "Hospital laboratory 24 hours available hai." };
  }
  if(matchAny(qn, KW.EMERGENCY)){
    return { text: "Hospital emergency 24 hours open hai." };
  }
  if(matchAny(qn, KW.REPORTS)){
    return { text: "Hospital laboratory 24 hours available hai. Reports milne ka exact time ya online report-checking ka tareeqa verified hospital data mein listed nahi hai; reception se confirm karein." };
  }
  if(matchAny(qn, KW.MRI)){
    return { text: "MRI is not currently listed in My City Hospital's verified service list." };
  }
  if(matchAny(qn, KW.CT_SCAN)){
    return { text: "CT Scan is not currently listed in My City Hospital's verified service list." };
  }
  if(matchAny(qn, KW.AMBULANCE)){
    return { text: "Ambulance ki availability ya dedicated number verified hospital data mein listed nahi hai. Meharbani karke hospital reception se confirm karein." };
  }
  if(matchAny(qn, KW.PARKING)){
    return { text: "Hospital parking ki information verified hospital data mein listed nahi hai. Reception se confirm karein." };
  }
  if(matchAny(qn, KW.ADMISSION)){
    return { text: "Admission, room/ward aur ICU availability ki details verified hospital data mein listed nahi hain. Hospital reception se current availability confirm karein." };
  }
  if(matchAny(qn, KW.VISITING)){
    return { text: "Visiting hours verified hospital data mein listed nahi hain. Hospital reception se confirm karein." };
  }
  if(matchAny(qn, KW.INSURANCE)){
    return { text: "Insurance ya health-card acceptance ki information verified hospital data mein listed nahi hai. Payment se pehle hospital reception se confirm karein." };
  }
  if(matchAny(qn, KW.PAYMENT)){
    return { text: "Card ya cash payment ki specific details verified hospital data mein listed nahi hain. Hospital reception se confirm karein." };
  }
  if(matchAny(qn, KW.DEPARTMENTS)){
    return { text: `My City Hospital ke departments: ${HOSPITAL_DATA.departments.join(', ')}.` };
  }
  if(matchAny(qn, KW.FEE) && /\b(doctor|doctors|consultation|opd)\b/.test(qn) && !deptFilter && !findBestDoctor(rawQuery)){
    return { text: "Hospital ke verified data mein consultant OPD fee Rs. 1,000 hai. Specific doctor ki fee aur timing ke liye doctor ka naam ya specialty likhein." };
  }
  if(/\b(female|male|lady|woman|women|aurat|khatoon)\b/.test(qn) && /\b(doctor|doctors|specialist)\b/.test(qn) && !deptFilter && !findBestDoctor(rawQuery)){
    return { text: "Female/male doctor availability ka separate verified record available nahi hai. Meharbani karke specialty ya doctor ka naam likhein, ya reception se current availability confirm karein." };
  }

  // --- Hospital info ---
  if(matchAny(qn, KW.HOSPITAL_INFO)){
    const h = HOSPITAL_DATA.hospital;
    return { text: `**${h.name}**\n${h.address}\n\nPhone: ${h.phones.join(' / ')}\nWebsite: ${h.website}\n\n${h.generalTimings}` };
  }

  // --- Services list ---
  if(matchAny(qn, KW.SERVICES)){
    const svc = HOSPITAL_DATA.otherServices.map(s=>s.name).join(', ');
    return { text: `My City Hospital offers: Consultant OPD across ${HOSPITAL_DATA.departments.length} departments, Laboratory, X-Ray, Ultrasound, and ${svc}.` };
  }
  if(matchAny(qn, KW.TIMING) && /\b(doctor|doctors|consultant|opd)\b/.test(qn) && !deptFilter && !findBestDoctor(rawQuery)){
    return { text: "All listed consultant OPD timings:", cards: HOSPITAL_DATA.doctors.map(d => doctorCardData(d, computeDoctorStatus(d, presenceMap, now))) };
  }

  // --- Department lists, counts and group timings ---
  // This runs before the diagnostic lookup so "ultrasound doctors" can never
  // accidentally return an ultrasound test card.
  if(deptFilter && (isDoctorListQuery(qn) || isCountQuery(qn))){
    const list = HOSPITAL_DATA.doctors.filter(d => d.department === deptFilter);
    if(isCountQuery(qn)){
      return { text: list.length
        ? `There ${list.length===1?'is':'are'} **${list.length} ${deptFilter}${list.length===1?'':'s'}** in the hospital's verified doctor data.`
        : `No doctors are listed for **${deptFilter}** in the hospital's verified doctor data.` };
    }
    if(!list.length){
      return { text: `No doctors are currently listed under **${deptFilter}** in the hospital's verified doctor data. I won't substitute doctors from another specialty.` };
    }
    const wantsDetails = matchAny(qn, KW.FEE) || matchAny(qn, KW.TIMING) ||
      matchAny(qn, KW.DAYS) || matchAny(qn, KW.APPOINTMENT) ||
      qn.includes('available') || qn.includes('present') || qn.includes('absent');
    const cards = list.map(d => doctorCardData(d, computeDoctorStatus(d, presenceMap, now)));
    if(wantsDetails){
      const detailLabel = matchAny(qn, KW.FEE)
        ? `**${deptFilter} consultation fees and timings**:`
        : matchAny(qn, KW.APPOINTMENT)
          ? `**${deptFilter} appointment information**:`
          : `**${deptFilter} doctor information**:`;
      return { text: detailLabel, cards };
    }
    return { text: `**${deptFilter} doctors** (${list.length}):`, cards };
  }

  // Follow-up questions such as "show me their timings" use the last
  // department/doctor cards in this chat as context.
  if((matchAny(qn, KW.TIMING) || matchAny(qn, KW.FEE) || matchAny(qn, KW.DAYS)) && !findBestDoctor(rawQuery) && previousMessages.length){
    const lastWithCards = [...previousMessages].reverse().find(m => m.role==='assistant' && (m.cards || m.card));
    const priorCards = lastWithCards ? (lastWithCards.cards || [lastWithCards.card]).filter(c=>c && c.type==='doctor') : [];
    if(priorCards.length){
      const label = matchAny(qn, KW.FEE) ? "OPD fees from the doctors shown above:" :
        (matchAny(qn, KW.DAYS) ? "Available days from the doctors shown above:" : "OPD timings from the doctors shown above:");
      return { text:label, cards: priorCards.map(c=>({...c})) };
    }
  }

  // --- Diagnostic price / availability lookups ---
  const wantsXray = matchAny(qn, KW.XRAY);
  const wantsUltrasound = matchAny(qn, KW.ULTRASOUND);
  const wantsLab = matchAny(qn, KW.LAB);

  if(wantsXray){
    const item = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.xray);
    if(item) return { text:null, card: testCardData(item, "X-Ray") };
    if(qn.replace(/x[\s-]?ray/,'').trim().length < 3 ||
      /\b(price|prices|rate|rates|fee|fees|kitne|kitni|kitna)\b/.test(qn)){
      return { text: `We offer ${HOSPITAL_DATA.diagnostics.xray.length} types of X-rays, 24 hours a day, for example: ${HOSPITAL_DATA.diagnostics.xray.slice(0,6).map(t=>t.name).join(', ')}, and more. Ask about a specific X-ray for its price.` };
    }
  }
  if(wantsUltrasound){
    const item = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.ultrasound);
    if(item) return { text:null, card: testCardData(item, "Ultrasound") };
     if(qn.replace(/ultrasound|u\/s|u s|sonography|doppler/,'').trim().length < 3 ||
       /\b(price|prices|rate|rates|fee|fees|kitne|kitni|kitna)\b/.test(qn)){
      return { text: `We offer a wide range of ultrasound and Doppler studies — for example Whole Abdomen U/S, Pelvis U/S, TVS Pelvis, and various Doppler studies. Ask about a specific scan for its price.` };
    }
  }
  if(wantsLab){
    const item = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.labTests);
    if(item) return { text:null, card: testCardData(item, "Lab Test") };
    if(qn.replace(/lab test|laboratory|blood test/,'').trim().length < 4 ||
      /\b(price|prices|rate|rates|fee|fees|kitne|kitni|kitna)\b/.test(qn)){
      return { text: `Our laboratory is open 24 hours. We currently have a special discount running on: ${HOSPITAL_DATA.diagnostics.labTests.map(t=>t.name).join(', ')}. Ask about a specific test for its price.` };
    }
  }
  // generic diagnostic name match even without keyword (e.g. "CBC price", "whole abdomen kitne ka hai")
  {
    const labHit = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.labTests);
    if(labHit && (qn.includes('price') || qn.includes('rate') || qn.includes('kitne') || qn.includes('kitni') || qn.includes('kitna'))) {
      return { text:null, card: testCardData(labHit, "Lab Test") };
    }
    const usHit = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.ultrasound);
    if(usHit && (qn.includes('price') || qn.includes('rate') || qn.includes('kitne') || qn.includes('kitni') || qn.includes('kitna'))) {
      return { text:null, card: testCardData(usHit, "Ultrasound") };
    }
    const xrHit = findDiagnostic(rawQuery, HOSPITAL_DATA.diagnostics.xray);
    if(xrHit && (qn.includes('price') || qn.includes('rate') || qn.includes('kitne') || qn.includes('kitni') || qn.includes('kitna'))) {
      return { text:null, card: testCardData(xrHit, "X-Ray") };
    }
  }

  // --- Doctor availability, list-style ---
  if(matchAny(qn, KW.AVAILABLE_TOMORROW)){
    const tmr = new Date(now); tmr.setDate(tmr.getDate()+1);
    const dayKey = todayKey(tmr);
    const results = buildScheduledOnDay(dayKey, deptFilter);
    if(!results.length) return { text: `No doctors${deptFilter ? ' in '+deptFilter : ''} are scheduled for ${DAY_LABELS[dayKey]} in the current OPD schedule.` };
     return { text: `Scheduled for **${DAY_LABELS[dayKey]}** (tomorrow)${deptFilter?` — ${deptFilter}`:''}:`, cards: results.map(({d,slots}) => ({ type:"doctor", name:d.name, department:d.department, specialization:d.specialization, availableDays:availableDays(d.schedule), degrees:d.degrees.join(', '), todaysTiming: slots.map(fmtRange).join(', '), fee:d.fee || 1000, status:"scheduled_future" })) };
  }

  if(matchAny(qn, KW.AVAILABLE_NOW)){
    const results = buildAvailableNow(presenceMap, now, deptFilter);
    if(!results.length) return { text: `No doctors${deptFilter?' in '+deptFilter:''} are currently marked present and within their scheduled hours right now.` };
    return { text: `Available **right now**${deptFilter?` — ${deptFilter}`:''}:`, cards: results.map(({d,s}) => doctorCardData(d,s)) };
  }

  if(matchAny(qn, KW.PRESENT_LIST)){
    const results = HOSPITAL_DATA.doctors
      .map(d => ({d, s: computeDoctorStatus(d, presenceMap, now)}))
      .filter(x => !x.d.onLeave && x.s.liveStatus === 'present');
    if(!results.length) return { text: "No doctors are currently marked present by reception." };
    return { text: "Currently marked **present** by reception:", cards: results.map(({d,s}) => doctorCardData(d,s)) };
  }

  if(matchAny(qn, KW.ABSENT_LIST)){
    const results = HOSPITAL_DATA.doctors.filter(d => d.onLeave || presenceMap[d.id] !== 'present');
    if(!results.length) return { text: "All doctors are currently marked present." };
    return { text: "Currently **absent / on leave**:", cards: results.map(d => doctorCardData(d, computeDoctorStatus(d, presenceMap, now))) };
  }

  if(matchAny(qn, KW.AVAILABLE_TODAY) || (deptFilter && qn.includes('doctor'))){
    const results = buildScheduledToday(presenceMap, now, deptFilter);
    if(!results.length) return { text: `No doctors${deptFilter?' in '+deptFilter:''} are scheduled today (${DAY_LABELS[todayKey(now)]}) in the current OPD schedule.` };
    return { text: `Scheduled **today** (${DAY_LABELS[todayKey(now)]})${deptFilter?` — ${deptFilter}`:''}:`, cards: results.map(({d,s}) => doctorCardData(d,s)) };
  }

  if(qn.includes('show all doctor') || qn.includes('doctor list') || qn.includes('all doctors') || qn.includes('tamam doctors') || qn === 'doctors'){
    return { text: `My City Hospital has ${HOSPITAL_DATA.doctors.length} consultants across ${HOSPITAL_DATA.departments.length} departments. Ask about a specific doctor, department, or "who's available now" to narrow it down.` };
  }

  // --- Specific doctor lookups ---
  const doctor = findBestDoctor(rawQuery);
  if(doctor){
    const status = computeDoctorStatus(doctor, presenceMap, now);

    if(matchAny(qn, KW.FEE)){
      return { text: `${doctor.name}'s consultation / OPD fee is Rs. ${doctor.fee || 1000}.` };
    }
    if(matchAny(qn, KW.APPOINTMENT)){
      return { text: `To book, cancel or reschedule an appointment with ${doctor.name}, please contact hospital reception: ${HOSPITAL_DATA.hospital.phones.join(' / ')}.` };
    }
    if(matchAny(qn, KW.DEGREE)){
      return { text: `${doctor.name} holds: ${doctor.degrees.join(', ')}.` };
    }
    if(matchAny(qn, KW.SPECIALIZATION)){
      return { text: `${doctor.name} specializes in ${doctor.specialization} (${doctor.department}).` };
    }
    if(matchAny(qn, KW.DAYS)){
      return { text: `${doctor.name} is scheduled on: ${availableDays(doctor.schedule)}.` };
    }
    if(matchAny(qn, KW.TIMING)){
      if(!status.scheduledToday && status.next){
        return { text: `${doctor.name} is not scheduled today. Next scheduled day: ${status.next.dayLabel}, ${status.next.times}.` };
      }
      return { text: `${doctor.name}'s timing today (${DAY_LABELS[status.dayKey]}): ${status.todaysSlots.length ? status.todaysSlots.map(fmtRange).join(', ') : 'Not scheduled today'}.` };
    }
    if(matchAny(qn, KW.IS_PRESENT) || qn.includes('available') || qn.includes('present') || qn.includes('absent')){
      return { text:null, card: doctorCardData(doctor, status) };
    }
    // default: full card
    return { text:null, card: doctorCardData(doctor, status) };
  }

  // --- Department-only query without "available"/"today" keyword ---
  if(deptFilter){
    const list = HOSPITAL_DATA.doctors.filter(d => d.department === deptFilter);
    if(!list.length) return { text: `No doctors are currently listed under **${deptFilter}** in the hospital's verified doctor data. I won't guess or mix another specialty.` };
    return { text: `${deptFilter} consultants at My City Hospital:`, cards: list.map(d => doctorCardData(d, computeDoctorStatus(d, presenceMap, now))) };
  }

  // Short follow-ups such as "name" or "naam" refer to the last doctor
  // card shown in this chat instead of being sent to the external fallback.
  if(/^(name|naam|unka naam|doctor ka naam|doctor name|what is the name|naam kya hai)$/.test(qn)
    || /\b(naam|name)\b/.test(qn) && qn.length < 28){
    const lastWithCards = [...previousMessages].reverse().find(m => m.role==='assistant' && (m.cards || m.card));
    const priorCards = lastWithCards ? (lastWithCards.cards || [lastWithCards.card]).filter(c=>c && c.type==='doctor') : [];
    if(priorCards.length){
      const names = priorCards.map(c=>c.name).join(', ');
      return { text: isRomanUrduQuery(qn) ? `Doctor ka naam: ${names}.` : `Doctor name: ${names}.` };
    }
  }

  // --- Report follow-up without new attachment ---
  if(matchAny(qn, KW.REPORT_FOLLOWUP)){
    return { text: "Is chat mein report upload karke analysis karne ka option available nahi hai. Hospital ke doctor se report zaroor check karwayein." };
  }

  // --- Nothing local matched: fallback ---
  return { fallback: true };
}

/* =========================================================================
   8. UI COMPONENTS
   ========================================================================= */

export { routeMessage };
