// src/lib/claude.js
// Out-of-scope sawaalon ke liye Claude API fallback (window.MY_CITY_HOSPITAL_AI_API_URL se)
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { romanFallback } from './search.js';

function getHospitalContextSummary(){
  return JSON.stringify({
    hospital: HOSPITAL_DATA.hospital,
    departments: HOSPITAL_DATA.departments,
    doctors: HOSPITAL_DATA.doctors.map(d => ({name:d.name, department:d.department, specialization:d.specialization, degrees:d.degrees, status:d.status})),
    xrayTests: HOSPITAL_DATA.diagnostics.xray.map(t=>({name:t.name, price:t.price})),
    ultrasoundTests: HOSPITAL_DATA.diagnostics.ultrasound.map(t=>({name:t.name, price:t.price})),
    labTests: HOSPITAL_DATA.diagnostics.labTests.map(t=>({name:t.name, price:t.price, discountPrice:t.discountPrice})),
  }).slice(0, 12000);
}

async function callClaude(systemPrompt, userContent){
  const endpoint = window.MY_CITY_HOSPITAL_AI_API_URL;
  if(!endpoint) throw new Error("No report/chat service endpoint configured");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }]
    })
  });
  if(!response.ok) throw new Error("API error " + response.status);
  const data = await response.json();
  return (data.content || []).map(b => b.type === "text" ? b.text : "").join("\n").trim();
}

async function generalFallback(question){
  const system = `You are assisting patients of My City Hospital, Karachi. Hospital-specific facts (doctors, departments, degrees, prices, timings) must ONLY come from the verified hospital data JSON supplied below — never invent a doctor, price, degree, schedule, or service that isn't in it. If the person's question is hospital-specific and the answer is not in this data, say plainly that it isn't currently in My City Hospital's database — do not guess. For general knowledge questions unrelated to the hospital, you may answer normally and briefly. Never diagnose a medical condition or prescribe treatment; for medical-advice-seeking questions, give a brief, cautious, general-information answer and note a doctor should be consulted. Keep answers short (2-5 sentences) and in the same language style (English / Urdu / Roman Urdu) the user wrote in.\n\nVERIFIED HOSPITAL DATA:\n${getHospitalContextSummary()}`;
  try{
    return await callClaude(system, question);
  }catch(e){
    return romanFallback(question);
  }
}

export { getHospitalContextSummary, callClaude, generalFallback };
