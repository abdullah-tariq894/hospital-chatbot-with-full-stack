// src/data/hospitalData.js
// Offline fallback data — agar backend down ho to bhi app chalta rahe.
// Live data hamesha backend (MongoDB) se aata hai; ye sirf backup hai.

function sched(days, start, end){
  const o = {};
  days.forEach(d => { o[d] = (o[d]||[]).concat([{start,end}]); });
  return o;
}
function mergeSched(...objs){
  const out = {};
  objs.forEach(o => Object.keys(o).forEach(d => { out[d] = (out[d]||[]).concat(o[d]); }));
  return out;
}
let _id = 0;
function doc(name, degrees, specialization, department, scheduleObj, notes){
  _id++;
  return {
    id: 'doc-' + String(_id).padStart(3,'0'),
    name, degrees, specialization, department,
    fee: 1000,
    schedule: scheduleObj,
    onLeave: !!(notes && notes.onLeave),
    notes: notes && notes.text ? notes.text : null
  };
}

const HOSPITAL_DATA = {
  hospital: {
    name: "My City Hospital",
    description: "A multi-specialty outpatient & diagnostic hospital in Karachi offering consultant OPD services, 24-hour laboratory, X-ray and emergency care, ultrasound, ECHO, physiotherapy and more.",
    address: "B174, near Ideal Bakery, Karachi Administration Employees Housing Society (KAECHS) Block 5, Karachi.",
    phones: ["+92 331 3329111"],
    website: "mycityhospital.pk",
    social: { facebook: "mycityhospital", instagram: "mycityhospitals" },
    generalTimings: "Laboratory, X-Ray and Emergency are open 24 hours. Consultant OPD timings vary by doctor (see individual schedules).",
    scheduleValidMonth: "August 2026"
  },

  departments: [
    "General Physician & Diabetologist","Orthopaedic Surgeon","Dermatologist","Gynaecologist",
    "General Surgeon","Psychiatrist","Dental Surgeon","ENT Surgeon","Urologist","Burns Specialist",
    "Speech Therapist","Neurophysician","Plastic Surgeon","Gastroenterologist","Nephrologist",
    "Paediatrician","Chest Specialist","Cardiologist","Ultrasound","Female Hijama"
  ],

  doctors: [
    // GENERAL PHYSICIAN & DIABETOLOGIST
    doc("Dr. Musarrat Ayaz", ["MBBS","FCPS (Family Medicine)"], "Family Medicine", "General Physician & Diabetologist",
      mergeSched(sched(['mon','wed'],'15:00','17:00'), sched(['fri'],'17:00','19:00'), sched(['sun'],'18:00','19:00'))),
    doc("Dr. Jetender Maheshwari", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
      sched(['sun'],'16:00','18:00')),
    doc("Dr. Hina Murad", ["MBBS","FCPS (Internal Medicine)"], "Internal Medicine", "General Physician & Diabetologist",
      sched(['mon','wed','sat'],'17:00','19:00')),
    doc("Dr. Riazuddin Khanzada", ["MBBS","FCPS (Family Medicine)","D.Diabetology (CFHP)"], "Family Medicine & Diabetology", "General Physician & Diabetologist",
      sched(['mon','thu'],'18:00','19:00')),
    doc("Dr. Arshia Arif", ["MBBS","MRCGP(int)","MCPS (Family Medicine)"], "Family Medicine", "General Physician & Diabetologist",
      sched(['tue','sat'],'17:00','19:00')),
    doc("Dr. Mamoon Zubair", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
      {}, {onLeave:true, text:"Currently on leave."}),
    doc("Dr. Sandeep Kumar", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
      mergeSched(sched(['mon','wed'],'09:00','10:00'), sched(['tue','sat'],'20:00','22:00'))),
    doc("Dr. Hamid Ali Syed", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
      sched(['mon','wed','fri'],'20:00','22:00')),
    doc("Prof. Dr. Kamal Ahmed", ["MBBS","FCPS"], "General Medicine", "General Physician & Diabetologist",
      mergeSched(sched(['wed'],'21:00','23:00'), sched(['sat'],'22:00','23:59')), {text:"By pre-appointment only."}),

    // ORTHOPAEDIC SURGEON
    doc("Dr. Kashif Murtaza", ["MBBS","FCPS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
      sched(['mon','wed','fri'],'16:00','17:30')),
    doc("Dr. Shahzaib Soomro", ["MBBS","FCPS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
      sched(['tue','thu','sat'],'17:00','19:00')),
    doc("Dr. Saddam Mazar", ["MBBS","MS","MD"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
      mergeSched(sched(['mon'],'19:00','21:00'), sched(['sat'],'19:00','20:00'))),
    doc("Dr. Muhammad Asif Aziz", ["MBBS","MS"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
      mergeSched(sched(['mon'],'21:00','22:00'), sched(['wed'],'19:00','21:00'))),
    doc("Dr. Masroor Usmani", ["MBBS","Dip. Ortho"], "Orthopaedic Surgery", "Orthopaedic Surgeon",
      sched(['tue','thu','fri','sat'],'19:30','21:00')),

    // DERMATOLOGIST
    doc("Dr. Hajira Mukarram", ["MBBS","MCPS"], "Dermatology", "Dermatologist",
      mergeSched(sched(['mon','wed'],'16:30','17:30'), sched(['tue'],'12:00','13:00'))),
    doc("Dr. Shayana Rukhsar", ["MBBS","FCPS (Dermatology)"], "Dermatology", "Dermatologist",
      mergeSched(sched(['tue'],'15:00','17:00'), sched(['fri'],'15:00','16:30'))),
    doc("Dr. Junaid Rabbani", ["MBBS","D.Derm"], "Dermatology", "Dermatologist",
      sched(['tue','thu','sat'],'17:00','18:00')),

    // GYNAECOLOGIST
    doc("Dr. Uneza", ["MBBS","MCPS"], "Gynaecology (ER Department)", "Gynaecologist",
      sched(['sun','mon','tue','wed','thu','fri'],'11:00','13:00')),
    doc("Dr. Hina Memon", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
      sched(['wed','thu','sat'],'14:00','16:00')),
    doc("Dr. Tahira Jabeen", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
      sched(['mon','thu','sat'],'16:30','17:30')),
    doc("Dr. Reeta Mukesh", ["MBBS","MCPS"], "Gynaecology", "Gynaecologist",
      sched(['fri'],'16:30','18:00')),
    doc("Dr. Sheema Izzat", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
      sched(['tue','thu'],'17:30','18:30'), {text:"By pre-appointment only."}),
    doc("Dr. Ghulam Sughra Bhellar", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
      sched(['wed','fri'],'19:30','21:30')),
    doc("Dr. Ambreen Naz Khan", ["MBBS","CHPE"], "Gynaecology", "Gynaecologist",
      sched(['mon','sat'],'20:00','21:00')),
    doc("Dr. Sumaiya Aziz", ["MBBS","FCPS"], "Gynaecology", "Gynaecologist",
      sched(['tue','thu'],'20:30','22:00')),

    // GENERAL SURGEON
    doc("Dr. Abdul Muqeet", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
      mergeSched(sched(['tue'],'16:00','17:30'), sched(['fri'],'21:00','22:00'))),
    doc("Dr. Syed Ali Haider Rizvi", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
      sched(['thu','sat'],'15:00','16:30')),
    doc("Dr. Javeria Munir", ["MBBS","FCPS"], "General Surgery", "General Surgeon",
      sched(['thu'],'17:30','19:30'), {text:"By pre-appointment only."}),
    doc("Dr. Muhammad Ali Edhi", ["MBBS","MRCS (Surg)","MRAH"], "General Surgery", "General Surgeon",
      mergeSched(sched(['wed'],'21:30','23:00'), sched(['fri'],'22:00','23:59'))),

    // PSYCHIATRIST
    doc("Dr. Azaan Abdullah Qureshi", ["MBBS","MCPS"], "Psychiatry", "Psychiatrist",
      sched(['tue','thu'],'15:00','17:00')),

    // DENTAL SURGEON
    doc("Dr. Nida Amir", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
      sched(['mon','wed','thu'],'10:00','12:00')),
    doc("Dr. Iqra Shehzad", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
      mergeSched(sched(['tue','thu','sat'],'12:30','14:30'), sched(['sun'],'17:00','20:00'))),
    doc("Dr. Aisha Waseem", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
      sched(['mon','wed','thu','fri'],'16:00','18:30')),
    doc("Dr. Huma Azmat", ["BDS","RDS","MPH","CHPE"], "Dental Surgery", "Dental Surgeon",
      mergeSched(sched(['tue'],'16:00','18:00'), sched(['sat'],'15:00','18:00'), sched(['sun'],'18:00','22:00'))),
    doc("Dr. Hassan Bin Tariq", ["BDS","RDS (Dow University)"], "Dental Surgery", "Dental Surgeon",
      mergeSched(sched(['mon','wed','fri'],'18:30','21:30'), sched(['sat'],'10:30','12:30'))),
    doc("Dr. Ayesha Khurram", ["BDS","RDS"], "Dental Surgery", "Dental Surgeon",
      sched(['tue','thu','sat'],'19:00','22:00')),

    // ENT SURGEON
    doc("Dr. Hira Zaidi", ["MBBS","FCPS (Dow University)"], "ENT Surgery", "ENT Surgeon",
      sched(['mon','wed','fri'],'17:00','18:00')),
    doc("Dr. Nand Lal", ["MBBS","DLO"], "ENT Surgery", "ENT Surgeon",
      sched(['tue','fri'],'17:00','19:00')),
    doc("Dr. Komal Shamim", ["MBBS","FCPS"], "ENT Surgery", "ENT Surgeon",
      sched(['sun','mon','thu'],'18:00','20:00')),

    // UROLOGIST
    doc("Dr. Arsala Mushtaq", ["FCPS","MBBS"], "Urology", "Urologist",
      sched(['mon','wed','fri'],'17:00','19:00')),

    // BURNS SPECIALIST
    doc("Dr. Gulnaz Azam", ["DHMS","RHMP"], "Burns & Wound Care", "Burns Specialist",
      sched(['mon','wed','fri'],'19:00','20:30')),

    // SPEECH THERAPIST
    doc("Dr. Syeda Sabika Zehra Zaidi", ["Master in Audiology & Speech Therapy"], "Speech Therapy", "Speech Therapist",
      sched(['tue','thu','sat'],'16:00','18:00')),

    // NEUROPHYSICIAN
    doc("Dr. Ali Jaan", ["MBBS","DCN","FCPS"], "Neurophysiology", "Neurophysician",
      sched(['mon','wed','fri'],'16:30','18:00')),
    doc("Dr. Muhammad Nawaz", ["MBBS","FCPS"], "Neurophysiology", "Neurophysician",
      sched(['tue','thu','sat'],'16:00','18:00')),

    // PLASTIC SURGEON
    doc("Dr. Syed Fahad Zahoor", ["MBBS","FCPS"], "Plastic Surgery", "Plastic Surgeon",
      sched(['tue','thu'],'17:00','18:00'), {text:"By pre-appointment only."}),

    // GASTROENTEROLOGIST
    doc("Dr. Sabir Ali", ["MBBS","FCPS (Gastro)"], "Gastroenterology", "Gastroenterologist",
      sched(['mon','wed','fri','sat'],'20:30','21:30')),

    // NEPHROLOGIST
    doc("Dr. Farah Anum Jameel", ["MBBS","FCPS"], "Nephrology", "Nephrologist",
      sched(['thu'],'19:00','20:00')),

    // PAEDIATRICIAN
    doc("Dr. Abdul Saleem", ["MBBS","DCH","MCPS"], "Paediatrics", "Paediatrician",
      sched(['mon','tue','wed','thu','fri','sat'],'20:00','22:00')),
    doc("Dr. Lachman Das", ["MBBS","DCH"], "Paediatrics (ER Department)", "Paediatrician",
      mergeSched(sched(['tue','thu','fri'],'10:00','12:00'), sched(['sun'],'15:00','17:00'))),

    // CHEST SPECIALIST
    doc("Dr. Roshu Mal", ["MBBS","DTCD"], "Pulmonology", "Chest Specialist",
      mergeSched(sched(['tue'],'19:30','21:00'), sched(['fri'],'09:30','11:30'))),

    // CARDIOLOGIST
    doc("Dr. Sher Muhammad", ["MBBS","FCPS"], "Cardiology", "Cardiologist",
      sched(['tue','thu'],'19:00','21:00'), {text:"By pre-appointment only."}),

    // ULTRASOUND
    doc("Dr. Shazia Khan", ["MBBS","ARDMS (USA)"], "Diagnostic Ultrasound", "Ultrasound",
      mergeSched(sched(['mon','wed','sat'],'10:00','13:00'), sched(['fri'],'16:00','19:00'))),
    doc("Dr. Ayesha Faisal", ["MBBS","BSc (Physiology)","U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
      sched(['mon','tue','wed','thu','sat'],'16:00','19:00')),
    doc("Dr. Junaid Azhar", ["U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
      sched(['mon','tue','wed','thu','fri','sat'],'19:00','21:00')),
    doc("Dr. Aisha Farooq", ["MBBS","U/S Course"], "Diagnostic Ultrasound", "Ultrasound",
      mergeSched(sched(['mon','wed','sat'],'20:30','22:30'), sched(['tue','thu','fri'],'19:30','21:00'))),

    // FEMALE HIJAMA
    doc("Dr. Asma Khushnood", ["MBBS","Hijama Specialist"], "Hijama Therapy", "Female Hijama",
      sched(['mon','thu','sat'],'14:00','16:00')),
  ],

  otherServices: [
    { name: "ECHO", timings: [{days:"Mon, Wed & Sat", time:"5:30 PM – 7:30 PM"}, {days:"Tue, Thu & Fri", time:"3:30 PM – 4:30 PM"}] },
    { name: "Physiotherapy (Female)", timings: [{days:"Mon–Sat", time:"10:00 AM – 8:00 PM"}] },
    { name: "Physiotherapy (Male)", timings: [{days:"Mon–Sat", time:"6:00 PM – 10:00 PM"}] },
    { name: "Fitness Gym (Female)", timings: [{days:"Mon–Sat", time:"10:00 AM – 4:00 PM"}] },
    { name: "Fitness Gym (Male)", timings: [{days:"Mon–Sat", time:"8:00 PM – 10:00 PM"}] },
    { name: "Paeds Vaccination", timings: [{days:"Mon & Wed", time:"10:30 AM – 12:30 PM"}] },
    { name: "Laboratory", timings: [{days:"Every day", time:"24 Hours"}] },
    { name: "X-Ray", timings: [{days:"Every day", time:"24 Hours"}] },
    { name: "Emergency", timings: [{days:"Every day", time:"24 Hours"}] },
  ],

  diagnostics: {
    xray: [
      {id:"xr-01", name:"Hand X-Ray", price:750},
      {id:"xr-02", name:"Wrist X-Ray", price:750},
      {id:"xr-03", name:"Knee Joint X-Ray (1 View)", price:1000},
      {id:"xr-04", name:"Knee Joint X-Ray (Both)", price:1500},
      {id:"xr-05", name:"Pelvic X-Ray", price:750},
      {id:"xr-06", name:"Foot X-Ray", price:750},
      {id:"xr-07", name:"Ankle X-Ray", price:750},
      {id:"xr-08", name:"Leg (Tib/Fib) Oblique X-Ray", price:1000},
      {id:"xr-09", name:"Hip Joint X-Ray", price:1000},
      {id:"xr-10", name:"Shoulder X-Ray (1 View)", price:1000},
      {id:"xr-11", name:"Chest X-Ray (PA View)", price:750},
      {id:"xr-12", name:"Chest X-Ray (AP Lateral)", price:1000},
      {id:"xr-13", name:"OPG (Orthopantomogram)", price:750},
      {id:"xr-14", name:"Arm X-Ray", price:750},
      {id:"xr-15", name:"Elbow X-Ray", price:750},
      {id:"xr-16", name:"Abdomen / Spine X-Ray", price:750},
      {id:"xr-17", name:"Erect Abdomen X-Ray", price:750},
    ],
    ultrasound: [
      {id:"us-01", name:"Appendix / RIF (Right Iliac Fossa) U/S", price:1000},
      {id:"us-02", name:"Follicular Study", price:1000},
      {id:"us-03", name:"FWB U/S", price:750},
      {id:"us-04", name:"Gall Bladder U/S", price:700},
      {id:"us-05", name:"Urinary Bladder U/S", price:700},
      {id:"us-06", name:"Urinary Bladder (Pre & Post Void) Residual", price:1250},
      {id:"us-07", name:"KUB + (Pre & Post Void) Residual", price:1300},
      {id:"us-08", name:"KUB + Pelvis", price:1500},
      {id:"us-09", name:"Liver U/S (Grey Scale)", price:700},
      {id:"us-10", name:"Liver + Gall Bladder U/S", price:1250},
      {id:"us-11", name:"Lower Abdomen / Pelvis U/S", price:700},
      {id:"us-12", name:"Chest U/S for Effusion", price:1300},
      {id:"us-13", name:"Pancreas & Spleen U/S", price:1250},
      {id:"us-14", name:"Prostate + Pre & Post Void U/S", price:1500},
      {id:"us-15", name:"TVS Pelvis", price:1500},
      {id:"us-16", name:"Pelvis U/S", price:750},
      {id:"us-17", name:"Whole Abdomen U/S", price:1050},
      {id:"us-18", name:"Abdomen + Pelvis U/S", price:1500},
      {id:"us-19", name:"Thyroid Scan (Doppler)", price:1500, category:"Special"},
      {id:"us-20", name:"FWB Anomaly Scan", price:1500, category:"Special"},
      {id:"us-21", name:"Pancreas U/S", price:700},
      {id:"us-22", name:"Spleen U/S", price:700},
      {id:"us-23", name:"Breast (Both) U/S", price:1300, category:"Special"},
      {id:"us-24", name:"Brain U/S", price:2500},
      {id:"us-25", name:"Breast (Single) U/S", price:700},
      {id:"us-26", name:"Abdomen for Collection U/S", price:1200},
      {id:"us-27", name:"Guided Biopsy U/S", price:4000},
      {id:"us-28", name:"Guided Therapeutic Tap U/S", price:5000},
      {id:"us-29", name:"Joint U/S for Effusion", price:1500},
      {id:"us-30", name:"Kidney (KUB) U/S", price:1300},
      {id:"us-31", name:"Prostate Trans-Rectal (TRUS) U/S", price:2000},
      {id:"us-32", name:"Prostate + Residual Urine U/S", price:1250},
      {id:"us-33", name:"Portable U/S", price:2000},
      {id:"us-34", name:"Single Organ U/S (Grey Scale)", price:700},
      {id:"us-35", name:"Swelling U/S (Any Body Organ)", price:1500},
      {id:"us-36", name:"Thyroid U/S (Grey Scale)", price:1000},
      {id:"us-37", name:"Upper Abdomen U/S", price:700},
      {id:"us-38", name:"Doppler (Single Organ)", price:1500},
      {id:"us-39", name:"Doppler Left Upper Limb Artery", price:2050},
      {id:"us-40", name:"Doppler Left Lower Limb Artery", price:2050},
      {id:"us-41", name:"Doppler Right Upper Limb Artery", price:2050},
      {id:"us-42", name:"Doppler Right Lower Limb Artery", price:2050},
      {id:"us-43", name:"Doppler Right Upper Limb Vein", price:2050},
      {id:"us-44", name:"Doppler Right Lower Limb Vein", price:2050},
      {id:"us-45", name:"Doppler Left Upper Limb Vein", price:2050},
      {id:"us-46", name:"Doppler Left Lower Limb Vein", price:2050},
      {id:"us-47", name:"Doppler Both Lower Limb Arteries", price:4050},
      {id:"us-48", name:"Doppler Both Upper Limb Arteries", price:4050},
      {id:"us-49", name:"Doppler Carotid Arteries", price:3000},
      {id:"us-50", name:"Doppler FWB / OBS Bio-Physical Profile", price:2000},
      {id:"us-51", name:"Doppler FWB for IUGR / Placenta", price:2350},
      {id:"us-52", name:"Doppler Penis (Without Caverject Inj.)", price:2350},
      {id:"us-53", name:"Doppler Renal Arteries", price:1500},
      {id:"us-54", name:"Varicocele Doppler U/S", price:4050},
      {id:"us-55", name:"Kidney (Single) U/S", price:2000},
      {id:"us-56", name:"Kidney (Both) U/S", price:700},
      {id:"us-57", name:"Doppler Portal Veins", price:1300},
      {id:"us-58", name:"Single Eye B-Scan", price:2000},
    ].map(t => ({...t, category: t.category || "Routine", sampleReporting:"Same day", available:true})),
    labTests: [
      {id:"lb-01", name:"CBC (Complete Blood Count)", price:295, discountPrice:250, onOffer:true},
      {id:"lb-02", name:"CBC + ESR", price:500, discountPrice:350, onOffer:true},
      {id:"lb-03", name:"Creatinine", price:295, discountPrice:200, onOffer:true},
      {id:"lb-04", name:"Electrolytes", price:475, discountPrice:250, onOffer:true},
      {id:"lb-05", name:"Uric Acid", price:350, discountPrice:200, onOffer:true},
      {id:"lb-06", name:"Serum Urea", price:370, discountPrice:250, onOffer:true},
    ].map(t => ({...t, available:true})),
  },

  faqs: [
    {q:"What are the hospital's general timings?", a:"Laboratory, X-Ray and Emergency are open 24 hours. Consultant OPD doctors each have their own scheduled timings — ask about a specific doctor or department for exact hours."},
    {q:"Does the hospital do MRI?", a:"MRI is not currently listed in My City Hospital's verified service list."},
  ]
};

export { HOSPITAL_DATA };
