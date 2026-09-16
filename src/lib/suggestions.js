// src/lib/suggestions.js
// Chat input ke autocomplete suggestions + welcome screen ke suggestion chips
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { norm, tokens, findBestDoctor, findDeptFromAliases, isDoctorListQuery } from './search.js';

const SUGGESTIONS = [
  // "Who is available right now?",
  // "Show today's doctors",
  // "Doctor timings",
  "Who are the urologists?",
  "Who are the ultrasound doctors?",
  "Ultrasound prices",
  "X-ray prices",
  "Lab test prices",
  "Dil ka doctor kon hai?",
  "Kidney ke doctor ki fee kitni hai?",
  "Gurday ka doctor kab available hai?",
  "Haddi aur joints ka doctor kon hai?",
  "Bachon ka doctor kon hai?",
  "Hospital ka number kya hai?",
  "Hospital ka address kya hai?",
  "Lab 24 hours hai?",
  "Pharmacy raat ko khuli hoti hai?",
];

const DIAGNOSTIC_GROUPS = [
  {kind:"X-Ray", aliases:["x","xr","xray","x ray","x-ray"], items:HOSPITAL_DATA.diagnostics.xray},
  {kind:"Ultrasound", aliases:["u","us","u/s","ul","ult","ultra","ultrasound","sonography","doppler"], items:HOSPITAL_DATA.diagnostics.ultrasound},
  {kind:"Lab Test", aliases:["lab","labs","lab test","laboratory","blood test","urine test"], items:HOSPITAL_DATA.diagnostics.labTests},
];

const DEPT_ROMAN_LABELS = {
  "Cardiologist":"Dil",
  "Gynaecologist":"Khawateen / pregnancy",
  "Dermatologist":"Skin",
  "Dental Surgeon":"Daanton",
  "ENT Surgeon":"Kaan naak galay",
  "Orthopaedic Surgeon":"Haddi aur joints",
  "Paediatrician":"Bachon",
  "Urologist":"Peshab",
  "Psychiatrist":"Mental health",
  "General Surgeon":"Operation",
  "Neurophysician":"Dimagh",
  "Gastroenterologist":"Maiday aur jigar",
  "Nephrologist":"Gurday / kidney",
  "Chest Specialist":"Saans aur seena",
  "Ophthalmologist":"Aankhon",
  "Hematologist":"Khoon",
  "Endocrinologist":"Hormones",
  "Oncologist":"Cancer",
  "Radiologist":"Radiology",
  "Plastic Surgeon":"Plastic surgery",
  "Burns Specialist":"Jalne aur zakhm",
  "General Physician & Diabetologist":"General checkup / sugar",
  "Ultrasound":"Ultrasound",
  "Female Hijama":"Female hijama",
};

function departmentAutocompleteSuggestions(dept){
  const label = DEPT_ROMAN_LABELS[dept] || dept;
  return [
    {label:`${label} ka doctor`, question:`${label} ka doctor kon hai?`},
    {label:`${label} doctor ki fee`, question:`${label} ke doctor ki fee kitni hai?`},
    {label:`${label} doctor ki timing`, question:`${label} ka doctor kab available hai?`},
    {label:`${label} doctors`, question:`${label} ke tamam doctors kon hain?`},
  ];
}

function diagnosticAutocompleteSuggestions(value){
  const qn = norm(value);
  if(!qn) return [];

  const matchedGroup = DIAGNOSTIC_GROUPS.find(group =>
    group.aliases.some(alias => {
      const normalizedAlias = norm(alias);
      return qn === normalizedAlias || qn.startsWith(normalizedAlias + ' ');
    })
  );
  const matchedItemGroup = !matchedGroup && qn.length >= 1
    ? DIAGNOSTIC_GROUPS.find(group => group.items.some(item => norm(item.name).startsWith(qn)))
    : null;
  const activeGroup = matchedGroup || matchedItemGroup;
  let search = qn;

  if(matchedGroup){
    const aliases = matchedGroup.aliases.slice().sort((a,b)=>b.length-a.length);
    const alias = aliases.find(a => {
      const normalizedAlias = norm(a);
      return qn === normalizedAlias || qn.startsWith(normalizedAlias + ' ');
    });
    search = qn.slice(norm(alias).length).trim();
  }

  // One/two-letter category prefixes are useful here ("x", "us", "lab"),
  // while unrelated short words should not open a noisy test list.
  const diagnosticPrefix = /^(x|xr|xray|x ray|ul|ult|ultra|ultrasound|u\/s|son|lab|labs|laboratory|blood|urine|cbc|cre|elect|uric|serum)/.test(qn);
  const searchTokens = tokens(search);
  const groups = activeGroup ? [activeGroup] : DIAGNOSTIC_GROUPS;
  const ranked = [];

  groups.forEach(group => {
    group.items.forEach(item => {
      const name = norm(item.name);
      const nameTokens = tokens(name);
      let score = 0;

      if(!search){
        score = 1;
      }else if(name.startsWith(search)){
        score = 5;
      }else if(searchTokens.length && searchTokens.every(q =>
        nameTokens.some(t => t.startsWith(q)) || name.includes(q)
      )){
        score = 4;
      }else if(name.includes(search)){
        score = 3;
      }

      if(score) ranked.push({item, kind:group.kind, score});
    });
  });

  if(!ranked.length || (!activeGroup && !diagnosticPrefix && qn.length < 3)) return [];

  return ranked
    .sort((a,b)=>b.score-a.score || a.item.name.localeCompare(b.item.name))
    .slice(0,6)
    .map(({item,kind}) => ({
      label:`${item.name} · ${kind}`,
      question:`What is the price of ${item.name}?`
    }));
}

function getAutocompleteSuggestions(value){
  const qn = norm(value);
  if(!qn.length) return [];
  const diagnosticSuggestions = diagnosticAutocompleteSuggestions(value);
  if(qn.length < 2) return diagnosticSuggestions;
  if(diagnosticSuggestions.length) return diagnosticSuggestions;
  const doctor = findBestDoctor(value);
  if(doctor){
    return [
      {label:`${doctor.name} — Specialty`, question:`What is ${doctor.name}'s specialty?`},
      {label:`${doctor.name} — OPD Timing`, question:`What is ${doctor.name}'s timing?`},
      {label:`${doctor.name} — OPD Fee`, question:`What is ${doctor.name}'s OPD fee?`},
      {label:`${doctor.name} — Available Days`, question:`What days is ${doctor.name} available?`}
    ];
  }
  const dept = findDeptFromAliases(value);
  if(dept && (isDoctorListQuery(qn) || qn.length >= 2)){
    return [
      {label:`List of ${dept} doctors`, question:`Who are the ${dept} doctors?`},
      {label:`Number of ${dept} doctors`, question:`How many ${dept} doctors are there?`},
      {label:`${dept} OPD timings`, question:`Show me the ${dept} doctors' timings.`},
      {label:`${dept} OPD fees`, question:`What is the OPD fee for ${dept} doctors?`},
      ...departmentAutocompleteSuggestions(dept)
    ];
  }
  if(/\bhospital\b/.test(qn)){
    return [
      {label:'Hospital Location', question:'Where is the hospital located?'},
      {label:'Hospital Phone Number', question:'What is the hospital phone number?'},
      {label:'Hospital Address', question:'What is the hospital address?'},
      {label:'Hospital Departments', question:'What departments does the hospital have?'},
      {label:'Hospital ka number', question:'Hospital ka number kya hai?'},
      {label:'Hospital ka address', question:'Hospital ka address kya hai?'},
      {label:'Lab 24 hours', question:'Lab 24 hours hai?'},
      {label:'Pharmacy timing', question:'Pharmacy raat ko khuli hoti hai?'}
    ];
  }
  return [];
}


export {
  SUGGESTIONS, DIAGNOSTIC_GROUPS, DEPT_ROMAN_LABELS,
  departmentAutocompleteSuggestions, diagnosticAutocompleteSuggestions, getAutocompleteSuggestions,
};
