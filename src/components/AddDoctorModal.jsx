import React, { useState } from 'react';
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { DAY_KEYS, DAY_LABELS } from '../lib/schedule.js';

function AddDoctorModal({onClose, onSave}){
  const [name,setName] = useState('');
  const [degrees,setDegrees] = useState('');
  const [specialization,setSpec] = useState('');
  const [department,setDept] = useState(HOSPITAL_DATA.departments[0] || '');
  const [customDept,setCustomDept] = useState('');
  const [fee,setFee] = useState(1000);
  const [days,setDays] = useState([]);
  const [start,setStart] = useState('17:00');
  const [end,setEnd] = useState('19:00');
  const [notes,setNotes] = useState('');
  const [saving,setSaving] = useState(false);
  const [err,setErr] = useState('');

  function toggleDay(d){
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d]);
  }

  async function save(){
    if(!name.trim()){ setErr('Doctor ka naam zaroori hai.'); return; }
    const finalDept = (department === '__custom__' ? customDept.trim() : department);
    if(!finalDept){ setErr('Department zaroori hai.'); return; }
    const schedule = {};
    days.forEach(d => { schedule[d] = [{start, end}]; });
    setSaving(true); setErr('');
    try{
      await onSave({
        name: name.trim(),
        degrees: degrees.split(',').map(s=>s.trim()).filter(Boolean),
        specialization: specialization.trim(),
        department: finalDept,
        fee: Number(fee) || 1000,
        schedule,
        onLeave: false,
        notes: notes.trim() || null,
        status: 'absent'
      });
      onClose();
    }catch(e){
      setErr(e.message || 'Save nahi ho saka');
    }finally{
      setSaving(false);
    }
  }

  const inp = {width:'100%',padding:'9px 12px',border:'1px solid var(--line)',borderRadius:10,marginTop:4,marginBottom:12,fontSize:13.5};
  const lbl = {fontSize:12.5,color:'var(--text-dim)',fontWeight:600};

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(12,24,45,0.5)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#fff',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',width:'100%',maxWidth:520,maxHeight:'88dvh',overflowY:'auto',padding:24}}>
        <h3 className="font-display" style={{fontSize:18,fontWeight:800,color:'var(--brand-navy)',marginBottom:16}}>Add New Doctor</h3>

        <label style={lbl}>Doctor Name *</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Ahmed Ali" style={inp}/>

        <label style={lbl}>Degrees (comma se alag karein)</label>
        <input value={degrees} onChange={e=>setDegrees(e.target.value)} placeholder="MBBS, FCPS" style={inp}/>

        <label style={lbl}>Specialization</label>
        <input value={specialization} onChange={e=>setSpec(e.target.value)} placeholder="General Medicine" style={inp}/>

        <label style={lbl}>Department *</label>
        <select value={department} onChange={e=>setDept(e.target.value)} style={inp}>
          {HOSPITAL_DATA.departments.map(d => <option key={d} value={d}>{d}</option>)}
          <option value="__custom__">+ Naya department likhein…</option>
        </select>
        {department === '__custom__' && (
          <input value={customDept} onChange={e=>setCustomDept(e.target.value)} placeholder="Naya department ka naam" style={inp}/>
        )}

        <label style={lbl}>OPD Fee (Rs.)</label>
        <input type="number" value={fee} onChange={e=>setFee(e.target.value)} style={inp}/>

        <label style={lbl}>OPD Days</label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6,marginBottom:12}}>
          {DAY_KEYS.map(d => (
            <button key={d} type="button" onClick={()=>toggleDay(d)}
              style={{padding:'7px 12px',borderRadius:9,border:'1px solid var(--line)',fontSize:12.5,fontWeight:600,
                background: days.includes(d) ? 'var(--brand-navy)' : '#fff',
                color: days.includes(d) ? '#fff' : 'var(--text)'}}>
              {DAY_LABELS[d].slice(0,3)}
            </button>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <div style={{flex:1}}>
            <label style={lbl}>From</label>
            <input type="time" value={start} onChange={e=>setStart(e.target.value)} style={inp}/>
          </div>
          <div style={{flex:1}}>
            <label style={lbl}>To</label>
            <input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={inp}/>
          </div>
        </div>

        <label style={lbl}>Notes (optional)</label>
        <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="By pre-appointment only." style={inp}/>

        {err && <div style={{color:'var(--absent)',fontSize:12.5,marginBottom:10}}>{err}</div>}

        <div style={{display:'flex',gap:10,marginTop:6}}>
          <button onClick={save} disabled={saving}
            style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'var(--brand-red)',color:'#fff',fontWeight:700,fontSize:14,opacity:saving?0.6:1}}>
            {saving ? 'Saving…' : 'Save to Database'}
          </button>
          <button onClick={onClose} disabled={saving}
            style={{padding:'11px 18px',borderRadius:10,border:'1px solid var(--line)',background:'#fff',color:'var(--text-dim)',fontSize:13.5}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export default AddDoctorModal;
