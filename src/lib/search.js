// src/lib/search.js
// Text normalize karna, doctor/department/test dhoondna (EN / Urdu / Roman Urdu)
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { computeDoctorStatus, DAY_KEYS, DAY_LABELS, fmtRange } from './schedule.js';

function norm(s){
  return (s||'').toLowerCase()
    .replace(/ڈاکٹرز?/g,' doctor ')
    .replace(/پیشاب/g,' peshab ')
    .replace(/سینے/g,' seene ')
    .replace(/سینہ/g,' seena ')
    .replace(/گردے?/g,' gurda ')
    .replace(/کون/g,' kon ')
    .replace(/کون سے/g,' kon se ')
    .replace(/کیا/g,' kya ')
    .replace(/کہاں/g,' kahan ')
    .replace(/کب/g,' kab ')
    .replace(/ہے/g,' hai ')
    .replace(/ہیں/g,' hain ')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function tokens(s){ return norm(s).split(' ').filter(Boolean); }

function isRomanUrduQuery(qn){
  return /\b(kya|kon|kaun|se|sey|ki|ke|ka|hai|hain|kab|kahan|kitne|kitni|kitna|batao|bata dein|peshab|gurda|gurday|seena|doctor)\b/.test(qn)
    || /[\u0600-\u06FF]/.test(qn);
}

function romanFallback(question){
  if(isRomanUrduQuery(norm(question))){
    return "Maazrat, is sawal ka jawab abhi tayyar nahi ho saka. Meharbani karke dobara koshish karein.";
  }
  return "I'm unable to process that request right now. Please try again in a moment.";
}

function scoreOverlap(queryTokens, targetTokens){
  if(!targetTokens.length) return 0;
  let hits = 0;
  targetTokens.forEach(t => { if(queryTokens.some(q => q===t || (q.length>2 && t.length>3 && (q.includes(t)||t.includes(q))))) hits++; });
  return hits / targetTokens.length;
}

function findBestDoctor(query){
  const qn = norm(query).replace(/\b(prof|professor|doctor|dr)\b/g,' ').replace(/riyaz/g,'riaz').replace(/\s+/g,' ').trim();
  const qTokens = tokens(qn);
  let best = null, bestScore = 0;
  HOSPITAL_DATA.doctors.forEach(d => {
    const cleanName = norm(d.name).replace(/\b(prof|professor|doctor|dr)\b/g,' ').replace(/riyaz/g,'riaz').replace(/\s+/g,' ').trim();
    const nameTokens = tokens(cleanName);
    let s = scoreOverlap(qTokens, nameTokens);
    if(qn.includes(cleanName) || cleanName.includes(qn)) s = 1;
    if(s > bestScore){ bestScore = s; best = d; }
  });
  return bestScore >= 0.5 ? best : null;
}

function findDoctorsByDepartment(query){
  const dept = findDeptFromAliases(query);
  if(!dept) return [];
  return HOSPITAL_DATA.doctors.filter(d => d.department === dept);
}

const DEPT_ALIASES = [
  {dept:"Cardiologist", words:["cardio","cardiologist","dil","dil ka doctor","dil ke doctor","heart","heart doctor","heart ka doctor"]},
  {dept:"Gynaecologist", words:["gynae","gynaecologist","gynecologist","lady doctor","lady specialist","khawateen","aurton","women doctor","pregnancy","hamal","prasooti"]},
  {dept:"Dermatologist", words:["skin","dermatologist","derma","jild","jild ka doctor"]},
  {dept:"Dental Surgeon", words:["dental","dentist","teeth","daant","dant","daanton ka doctor","danton ka doctor"]},
  {dept:"ENT Surgeon", words:["ent","throat","nose","ear","gala","kaan","naak","kaan naak gala","kaan naak galay","ear nose throat"]},
  {dept:"Orthopaedic Surgeon", words:["ortho","orthopaedic","orthopedic","bone","haddi","haddi ka doctor","joints","joint ka doctor","haddi aur joints"]},
  {dept:"Paediatrician", words:["paed","pediatrician","child specialist","children doctor","bachon","bachay","bache","bachon ka doctor","bache ka doctor"]},
  {dept:"Urologist", words:["urologist","urologists","urology","peshab","peshab ka doctor","kidney stone"]},
  {dept:"Psychiatrist", words:["psychiatrist","mental","mental health","zehni","zehni sehat"]},
  {dept:"General Surgeon", words:["surgeon","surgery","operation","operation ka doctor"]},
  {dept:"Neurophysician", words:["neuro","neurologist","dimagh","dimagh ka doctor","brain doctor"]},
  {dept:"Gastroenterologist", words:["gastro","gastroenterologist","stomach","maida","miday","maiday ka doctor","liver doctor","jigar","jigar ka doctor"]},
  {dept:"Nephrologist", words:["nephrologist","gurda","gurday","gurday ka doctor","kidney","kidney doctor","kidney ka doctor"]},
  {dept:"Chest Specialist", words:["chest","chest specialist","pulmonologist","pulmonology","seena","seene","seene ka doctor","saans","saans ka doctor","lungs","lungs doctor"]},
  {dept:"Ophthalmologist", words:["ophthalmologist","ophthalmology","eye doctor","eyes doctor","aankh","aankhon","aankh ka doctor","aankhon ka doctor"]},
  {dept:"Hematologist", words:["hematologist","hematology","blood doctor","khoon","khoon ka doctor"]},
  {dept:"Endocrinologist", words:["endocrinologist","endocrinology","hormone doctor","hormones","hormones ka doctor"]},
  {dept:"Oncologist", words:["oncologist","oncology","cancer doctor","cancer ka doctor"]},
  {dept:"Radiologist", words:["radiologist","radiology"]},
  {dept:"Plastic Surgeon", words:["plastic surgeon","cosmetic surgeon"]},
  {dept:"Burns Specialist", words:["burns","jalna","jalne ka doctor","wound"]},
  {dept:"General Physician & Diabetologist", words:["general physician","general doctor","general checkup","checkup","diabetologist","sugar doctor","physician","diabetes","sugar"]},
  {dept:"Ultrasound", words:["ultrasound doctor","ultrasound doctors","ultrasound specialist","ultrasound","sonologist","sonography doctor"]},
  {dept:"Female Hijama", words:["hijama","hijamah"]},
];
function findDeptFromAliases(query){
  const qn = norm(query);
  const paddedQuery = ` ${qn} `;
  const hit = DEPT_ALIASES
    .slice()
    .sort((a,b)=>Math.max(...b.words.map(w=>w.length))-Math.max(...a.words.map(w=>w.length)))
    .find(a => a.words.some(w => paddedQuery.includes(` ${norm(w)} `)));
  if(hit) return hit.dept;

  // Also recognize the hospital's actual department/specialization names so
  // newly added doctors continue to work without another hardcoded alias.
  const knownDepartments = [...new Set([
    ...HOSPITAL_DATA.departments,
    ...HOSPITAL_DATA.doctors.map(d => d.department)
  ])].sort((a,b)=>norm(b).length-norm(a).length);
  const directDept = knownDepartments.find(dept => paddedQuery.includes(` ${norm(dept)} `));
  if(directDept) return directDept;
  const matchingDoctor = HOSPITAL_DATA.doctors.find(d =>
    d.specialization && paddedQuery.includes(` ${norm(d.specialization)} `)
  );
  return matchingDoctor ? matchingDoctor.department : null;
}

function availableDays(schedule){
  return DAY_KEYS.filter(day => (schedule[day]||[]).length).map(day => DAY_LABELS[day]).join(', ') || 'Not currently scheduled';
}

function isDoctorListQuery(qn){
  return /\b(doctor|doctors|specialist|specialists|physician|physicians|urology|urologist|urologists|cardiologist|cardiologists|gynecologist|gynaecologist|dermatologist|radiologist|sonologist)\b/.test(qn)
    || /\b(kon kon|kon se|konse|kaun kaun|kaun se|who are|list of|all doctors|tamam doctors|sab doctors|kitne doctors|kitnay doctors)\b/.test(qn);
}

function isCountQuery(qn){
  return /\b(how many|number of|kitne|kitnay|kitni tadaad|taadaad|ginti)\b/.test(qn);
}

function findDiagnostic(query, list){
  const qTokens = tokens(query);
  let best=null, bestScore=0;
  list.forEach(item => {
    const s = scoreOverlap(qTokens, tokens(item.name));
    if(s>bestScore){ bestScore=s; best=item; }
  });
  return bestScore >= 0.4 ? best : null;
}

/* =========================================================================
   4. INTENT KEYWORD SETS (English / Urdu / Roman Urdu)
   ========================================================================= */
const KW = {
  AVAILABLE_NOW: ["available now","available right now","abhi available","abhi kaun","kon available","available hain abhi","bethay hain","baithe hain","abhi bethy","abhi bethe","abhi mojood","sitting today","abhi kon","right now"],
  AVAILABLE_TODAY: ["available today","today doctors","aaj kaun","aaj konse","aaj available","doctor list dikhao","show all doctors","today ka doctor"],
  AVAILABLE_TOMORROW: ["tomorrow","kal","kal kaun","kal available"],
  PRESENT_LIST: ["currently present","present doctors","kon present","present hain"],
  ABSENT_LIST: ["currently absent","absent doctors","kon absent","absent hain","leave par"],
  TIMING: ["timing","time kya","kab bethte","kab aatay","kab available","schedule","kab bethay","working hours"],
  FEE: ["fee","fees","charges","consultation fee","kitne paise","kitni fee"],
  DAYS: ["available days","which days","what days","kon se din","kis din","kin din"],
  DEGREE: ["degree","qualification","mbbs","fcps","kya degree"],
  SPECIALIZATION: ["specialization","specialist in","kis cheez ke","kya specialist"],
  IS_PRESENT: ["is dr","kya dr","present hain kya","available hain kya","hospital mein hain"],
  HOSPITAL_INFO: ["hospital timing","address","location","phone number","contact number","hospital ka number","hospital number","hospital ka phone","kahan hai","kidhar hai","general timing","website"],
  APPOINTMENT: ["appointment","appoint","booking","book doctor","appointment lena","appointment leni","appointment kaise","appointment cancel","cancel appointment","appointment reschedule","reschedule appointment","booking karna"],
  PHARMACY: ["pharmacy","medical store","medicine","dawai mil","dawai ki dukaan","raat ko medicine"],
  LAB_HOURS: ["lab kis time","lab timing","lab timings","lab open","lab 24 hours","laboratory timing","laboratory open"],
  EMERGENCY: ["emergency","emergency 24","emergency timing"],
  REPORTS: ["report kab","reports kab","report timing","online report","report check"],
  MRI: ["mri","magnetic resonance"],
  CT_SCAN: ["ct scan","ct-scan","computed tomography"],
  AMBULANCE: ["ambulance"],
  PARKING: ["parking"],
  ADMISSION: ["admission","admit","room","ward","icu"],
  VISITING: ["visiting hours","mulaqat ka waqt","milne ka waqt"],
  INSURANCE: ["insurance","health card","sehat card"],
  PAYMENT: ["card se payment","cash payment","payment card","credit card","debit card"],
  DEPARTMENTS: ["departments","department list","kon kon se department"],
  XRAY: ["x-ray","xray","x ray"],
  ULTRASOUND: ["ultrasound","u/s","u s","us scan","doppler","echo test","sonography"],
  LAB: ["lab test","laboratory","cbc","lft","rft","blood test","urine test","thyroid test","lipid profile","blood sugar"],
  SERVICES: ["services","what services","kya kya services","facilities"],
  REPORT_FOLLOWUP: ["is report","is mein","us report","report mein","cbc wala","sabse zyada abnormal","explain report","samjhao report"],
  MEDICAL_ADVICE: ["diagnose","kya bimari","what disease do i have","am i sick","should i take medicine","dawai batao"],
};
function matchAny(qn, list){ return list.some(k => qn.includes(k)); }

/* =========================================================================
   5. RESPONSE BUILDERS
   ========================================================================= */
function doctorCardData(doctor, status){
  return {
    type:"doctor",
    name: doctor.name,
    department: doctor.department,
    degrees: doctor.degrees.join(', '),
    specialization: doctor.specialization,
    availableDays: availableDays(doctor.schedule),
    todaysTiming: status.todaysSlots.length ? status.todaysSlots.map(fmtRange).join(', ') : "Not scheduled today",
    status: doctor.onLeave ? 'on_leave' : (status.currentlyAvailable ? 'present' : (status.liveStatus === 'present' ? 'present_not_hours' : 'absent')),
    next: status.next,
    notes: doctor.notes,
    fee: doctor.fee || 1000
  };
}
function testCardData(item, kind){
  return {
    type:"test", kind,
    name:item.name, price:item.price,
    discountPrice: item.discountPrice, onOffer: item.onOffer,
    category:item.category, sampleReporting:item.sampleReporting
  };
}

function buildAvailableNow(presenceMap, now, deptFilter){
  let list = HOSPITAL_DATA.doctors;
  if(deptFilter) list = list.filter(d => d.department === deptFilter);
  const results = list
    .map(d => ({d, s: computeDoctorStatus(d, presenceMap, now)}))
    .filter(x => x.s.currentlyAvailable);
  return results;
}

function buildScheduledToday(presenceMap, now, deptFilter){
  let list = HOSPITAL_DATA.doctors;
  if(deptFilter) list = list.filter(d => d.department === deptFilter);
  return list
    .map(d => ({d, s: computeDoctorStatus(d, presenceMap, now)}))
    .filter(x => x.s.scheduledToday && !x.d.onLeave);
}

function buildScheduledOnDay(dayKey, deptFilter){
  let list = HOSPITAL_DATA.doctors;
  if(deptFilter) list = list.filter(d => d.department === deptFilter);
  return list.filter(d => (d.schedule[dayKey]||[]).length && !d.onLeave)
    .map(d => ({d, slots: d.schedule[dayKey]}));
}

export {
  norm, tokens, isRomanUrduQuery, romanFallback, scoreOverlap,
  findBestDoctor, findDoctorsByDepartment, findDeptFromAliases,
  availableDays, isDoctorListQuery, isCountQuery, findDiagnostic,
  KW, matchAny, doctorCardData, testCardData,
  buildAvailableNow, buildScheduledToday, buildScheduledOnDay,
};
