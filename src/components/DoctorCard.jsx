import React from 'react';
import StatusPill from './StatusPill.jsx';

function DoctorCard({d}){
  return (
    <div className="doctor-card" style={{background:'var(--panel)',border:'1px solid var(--line)',borderRadius:'var(--radius)',padding:14,boxShadow:'var(--shadow)',marginTop:8,maxWidth:420}}>
      <div className="doctor-card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>{d.name}</div>
          <div style={{fontSize:12.5,color:'var(--text-dim)'}}>{d.department}</div>
        </div>
        <StatusPill status={d.status} />
      </div>
      <div style={{fontSize:12.5,color:'var(--text-dim)',marginTop:8}}>{d.degrees}</div>
      <div style={{fontSize:12.5,marginTop:7}}>Specialty: <strong>{d.specialization || d.department}</strong></div>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:8,fontSize:12.5}}>
        <span>🕒 OPD timing: {d.todaysTiming}</span>
        <span>📅 Available days: {d.availableDays || 'See hospital schedule'}</span>
        <span>💳 OPD fee: <strong>Rs. {d.fee || 1000}</strong></span>
      </div>
      {d.notes && <div style={{fontSize:12,color:'var(--text-dim)',marginTop:6,fontStyle:'italic'}}>{d.notes}</div>}
      {d.next && (d.status==='absent'||d.status==='on_leave'||d.status==='present_not_hours') && (
        <div style={{fontSize:12.5,marginTop:6,color:'var(--brand-navy-2)'}}>Next scheduled: {d.next.dayLabel}, {d.next.times}</div>
      )}
    </div>
  );
}


export default DoctorCard;
