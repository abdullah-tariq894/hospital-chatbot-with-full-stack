import React from 'react';

function StatusPill({status}){
  const map = {
    present: {bg:'#E6F6EC', fg:'var(--present)', label:'Present', dot:true},
    present_not_hours: {bg:'#FFF6E0', fg:'var(--leave)', label:'Present (outside hours)', dot:false},
    absent: {bg:'#FCEAEA', fg:'var(--absent)', label:'Absent', dot:false},
    on_leave: {bg:'#F3EEE0', fg:'var(--leave)', label:'On Leave', dot:false},
    scheduled_future: {bg:'#EAF3F8', fg:'var(--brand-navy-2)', label:'Scheduled', dot:false},
  };
  const s = map[status] || map.absent;
  return (
    <span style={{background:s.bg,color:s.fg,fontWeight:700,fontSize:12,padding:'3px 10px',borderRadius:999,display:'inline-flex',alignItems:'center',gap:6}}>
      <span className={s.dot?'pulse-present':''} style={{width:7,height:7,borderRadius:99,background:s.fg,display:'inline-block'}}></span>
      {s.label}
    </span>
  );
}


export default StatusPill;
