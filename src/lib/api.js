// src/lib/api.js
// Backend (MongoDB <- Vercel serverless API) se baat karne wali saari functions
import { HOSPITAL_DATA } from '../data/hospitalData.js';

const API_BASE = String(
  import.meta.env.VITE_HOSPITAL_API_BASE ||
  (typeof window !== 'undefined' && window.HOSPITAL_API_BASE) ||
  "https://hospital-backend-beryl.vercel.app"
).replace(/\/+$/, '');

// live connection ki state (UI badge ke liye)
const LIVE = { status:'loading', lastSync:null, error:null, source:'offline' };

// array ko JAGAH PAR replace karte hain (naya array nahi banate) taake
// DIAGNOSTIC_GROUPS jaisi purani references bhi live data hi dekhein
function replaceArray(target, items){
  target.length = 0;
  items.forEach(i => target.push(i));
  return target;
}

async function apiGet(path){
  const r = await fetch(API_BASE + path, { headers:{ 'Accept':'application/json' } });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.details || data.error || ('API ' + r.status));
  return data;
}
async function apiSend(path, method, body){
  const r = await fetch(API_BASE + path, {
    method,
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify(body || {})
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.details || data.error || ('API ' + r.status));
  return data;
}

function normalizeDoctor(d){
  return {
    id: String(d.id || d._id),
    name: d.name || 'Unknown',
    degrees: Array.isArray(d.degrees) ? d.degrees : (d.degrees ? String(d.degrees).split(',').map(s=>s.trim()) : []),
    specialization: d.specialization || '',
    department: d.department || 'General Physician & Diabetologist',
    fee: typeof d.fee === 'number' ? d.fee : 1000,
    schedule: d.schedule || {},
    onLeave: !!d.onLeave,
    notes: d.notes || null,
    status: d.status === 'present' ? 'present' : 'absent'
  };
}

// GET /api/doctors  -> HOSPITAL_DATA.doctors
async function loadDoctorsFromApi(){
  const data = await apiGet('/api/doctors');
  const docs = (data.doctors || []).map(normalizeDoctor);
  if(docs.length){
    replaceArray(HOSPITAL_DATA.doctors, docs);
    // naye departments (reception ne add kiye ho) list mein add kar do
    docs.forEach(d => {
      if(d.department && !HOSPITAL_DATA.departments.includes(d.department)){
        HOSPITAL_DATA.departments.push(d.department);
      }
    });
    LIVE.source = 'mongodb';
  }
  return docs;
}

// GET /api/diagnostics -> HOSPITAL_DATA.diagnostics
async function loadDiagnosticsFromApi(){
  const g = await apiGet('/api/diagnostics');
  if(Array.isArray(g.xray) && g.xray.length){
    replaceArray(HOSPITAL_DATA.diagnostics.xray, g.xray);
  }
  if(Array.isArray(g.ultrasound) && g.ultrasound.length){
    replaceArray(HOSPITAL_DATA.diagnostics.ultrasound,
      g.ultrasound.map(t => ({...t, category: t.category || 'Routine', sampleReporting: t.sampleReporting || 'Same day'})));
  }
  if(Array.isArray(g.labTests) && g.labTests.length){
    replaceArray(HOSPITAL_DATA.diagnostics.labTests, g.labTests);
  }
  return g;
}

// har doctor ka live status -> { id: 'present' | 'absent' }
function presenceFromDoctors(){
  const map = {};
  HOSPITAL_DATA.doctors.forEach(d => { map[d.id] = d.status === 'present' ? 'present' : 'absent'; });
  return map;
}

// dono cheezein ek saath load karo; doctors fail ho to offline fallback chalta rahega
async function loadAllData(){
  const [docRes, diagRes] = await Promise.allSettled([loadDoctorsFromApi(), loadDiagnosticsFromApi()]);
  if(docRes.status === 'fulfilled'){
    LIVE.status = 'connected';
    LIVE.error = null;
    LIVE.lastSync = new Date();
  }else{
    LIVE.status = 'offline';
    LIVE.error = (docRes.reason && docRes.reason.message) || 'Backend se connect nahi ho saka';
  }
  return presenceFromDoctors();
}

// PATCH /api/doctors/:id/status   (reception panel ka Mark Present / Absent)
async function setDoctorStatusApi(id, status){
  const data = await apiSend('/api/doctors/' + encodeURIComponent(id) + '/status', 'PATCH', { status });
  const local = HOSPITAL_DATA.doctors.find(d => d.id === id);
  if(local) local.status = status;   // chatbot turant naya status dekhega
  LIVE.lastSync = new Date();
  return data;
}

// POST /api/doctors  (reception panel se naya doctor add)
async function addDoctorApi(payload){
  const data = await apiSend('/api/doctors', 'POST', payload);
  await loadDoctorsFromApi();
  LIVE.lastSync = new Date();
  return data;
}

// DELETE /api/doctors/:id
async function deleteDoctorApi(id){
  const data = await apiSend('/api/doctors/' + encodeURIComponent(id), 'DELETE', {});
  await loadDoctorsFromApi();
  LIVE.lastSync = new Date();
  return data;
}

/* =========================================================================
   2. TIME / SCHEDULE HELPERS
   ========================================================================= */

export {
  API_BASE, LIVE, apiGet, apiSend, normalizeDoctor,
  loadDoctorsFromApi, loadDiagnosticsFromApi, presenceFromDoctors,
  loadAllData, setDoctorStatusApi, addDoctorApi, deleteDoctorApi,
};
