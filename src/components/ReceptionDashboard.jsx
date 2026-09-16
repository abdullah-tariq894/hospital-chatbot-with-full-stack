import React, { useState } from 'react';
import { HOSPITAL_DATA } from '../data/hospitalData.js';
import { computeDoctorStatus, fmtRange } from '../lib/schedule.js';
import { norm } from '../lib/search.js';
import Logo from './Logo.jsx';
import StatusPill from './StatusPill.jsx';
import AddDoctorModal from './AddDoctorModal.jsx';

function ReceptionDashboard({presenceMap, onSetStatus, onAddDoctor, onDeleteDoctor, onRefresh, live, onBack, onLogout}){
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [toastErr, setToastErr] = useState(false);
  const [lastUpdated, setLastUpdated] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const now = new Date();

  const doctors = HOSPITAL_DATA.doctors;
  const presentCount = doctors.filter(d=>!d.onLeave && presenceMap[d.id]==='present').length;
  const absentCount = doctors.length - presentCount;
  const availableNowCount = doctors.filter(d => computeDoctorStatus(d, presenceMap, now).currentlyAvailable).length;

  function showToast(msg, isErr){
    setToast(msg); setToastErr(!!isErr);
    setTimeout(()=>setToast(null), 2600);
  }

  const filtered = doctors.filter(d => {
    if(deptFilter!=='all' && d.department!==deptFilter) return false;
    if(filter==='present' && presenceMap[d.id]!=='present') return false;
    if(filter==='absent' && presenceMap[d.id]==='present') return false;
    if(query && !norm(d.name).includes(norm(query)) && !norm(d.department).includes(norm(query))) return false;
    return true;
  });

  // === YAHI SE CHATBOT KA STATUS BADALTA HAI ===
  // Button dabate hi PATCH /api/doctors/:id/status chalta hai -> MongoDB update
  // -> chatbot agli baar poochne par doctor ko "Present" dikhata hai.
  async function toggle(d){
    const next = presenceMap[d.id]==='present' ? 'absent' : 'present';
    setBusyId(d.id);
    try{
      await onSetStatus(d.id, next);
      setLastUpdated(prev => ({...prev, [d.id]: new Date()}));
      showToast(`${d.name} marked as ${next==='present'?'Present':'Absent'} — chatbot par live ho gaya.`);
    }catch(e){
      showToast('Update fail: ' + (e.message || 'backend se connect nahi hua'), true);
    }finally{
      setBusyId(null);
    }
  }

  async function refresh(){
    setRefreshing(true);
    try{ await onRefresh(); showToast('Database se refresh ho gaya.'); }
    catch(e){ showToast('Refresh fail: ' + (e.message||''), true); }
    finally{ setRefreshing(false); }
  }

  async function removeDoctor(d){
    if(!window.confirm(`${d.name} ko database se delete karein?`)) return;
    setBusyId(d.id);
    try{
      await onDeleteDoctor(d.id);
      showToast(`${d.name} delete ho gaya.`);
    }catch(e){
      showToast('Delete fail: ' + (e.message||''), true);
    }finally{ setBusyId(null); }
  }

  const StatCard = ({label, value, color}) => (
    <div className="stat-card" style={{background:'#fff',borderRadius:'var(--radius)',padding:'16px 18px',boxShadow:'var(--shadow)',flex:'1 1 140px',minWidth:140}}>
      <div style={{fontSize:12.5,color:'var(--text-dim)',fontWeight:600}}>{label}</div>
      <div className="font-display stat-value" style={{fontSize:26,fontWeight:800, color: color||'var(--brand-navy)', marginTop:4}}>{value}</div>
    </div>
  );

  return (
    <div style={{height:'100dvh',minHeight:0,background:'var(--bg)',display:'flex',flexDirection:'column'}}>
      <div className="reception-header" style={{background:'var(--brand-navy)',color:'#fff',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <Logo size={30}/>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={refresh} disabled={refreshing}
            style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',padding:'8px 14px',borderRadius:10,fontSize:13}}>
            {refreshing ? '⟳ …' : '⟳ Refresh'}
          </button>
          <button onClick={onBack} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',padding:'8px 14px',borderRadius:10,fontSize:13}}>← Chatbot</button>
          <button onClick={onLogout} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.3)',color:'#fff',padding:'8px 14px',borderRadius:10,fontSize:13}}>Logout</button>
        </div>
      </div>

      <div className="reception-content" style={{padding:20, flex:1, minHeight:0, overflowY:'auto'}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h2 className="font-display" style={{fontSize:20,fontWeight:800,color:'var(--brand-navy)'}}>Reception Dashboard</h2>
          <button onClick={()=>setShowAdd(true)}
            style={{padding:'9px 16px',borderRadius:10,border:'none',background:'var(--brand-navy)',color:'#fff',fontWeight:700,fontSize:13}}>
            + Add Doctor
          </button>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5,marginBottom:16,
          color: live.status==='connected' ? 'var(--present)' : 'var(--absent)'}}>
          <span style={{width:8,height:8,borderRadius:'50%',
            background: live.status==='connected' ? 'var(--present)' : 'var(--absent)'}}></span>
          {live.status==='connected'
            ? `MongoDB connected${live.lastSync ? ' · last sync ' + live.lastSync.toLocaleTimeString() : ''}`
            : `Backend offline — changes save nahi honge. ${live.error || ''}`}
        </div>

        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:20}}>
          <StatCard label="Total Doctors" value={doctors.length} />
          <StatCard label="Present Today" value={presentCount} color="var(--present)"/>
          <StatCard label="Absent Today" value={absentCount} color="var(--absent)"/>
          <StatCard label="Currently Available" value={availableNowCount} color="var(--brand-teal)"/>
        </div>

        <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16,alignItems:'center'}}>
          <input placeholder="Search doctor…" value={query} onChange={e=>setQuery(e.target.value)}
            style={{flex:'1 1 220px',padding:'9px 12px',border:'1px solid var(--line)',borderRadius:10,fontSize:13.5}}/>
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} style={{padding:'9px 10px',border:'1px solid var(--line)',borderRadius:10,fontSize:13}}>
            <option value="all">All Departments</option>
            {HOSPITAL_DATA.departments.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <div style={{display:'flex',gap:6}}>
            {['all','present','absent'].map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:'8px 14px',borderRadius:10,border:'1px solid var(--line)',fontSize:12.5,fontWeight:600,
                  background: filter===f ? 'var(--brand-navy)' : '#fff', color: filter===f ? '#fff':'var(--text)'}}
              >{f[0].toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:'var(--radius)',boxShadow:'var(--shadow)',overflow:'hidden'}}>
          <div className="only-desktop" style={{display:'grid',gridTemplateColumns:'2fr 1.4fr 1.5fr 1fr 1.1fr 1.5fr',gap:8,padding:'10px 16px',fontSize:12,fontWeight:700,color:'var(--text-dim)',borderBottom:'1px solid var(--line)'}}>
            <div>Doctor</div><div>Department</div><div>Today's Timing</div><div>Status</div><div>Last Updated</div><div>Action</div>
          </div>
          {filtered.map(d => {
            const s = computeDoctorStatus(d, presenceMap, now);
            const status = d.onLeave ? 'on_leave' : (presenceMap[d.id]==='present' ? 'present' : 'absent');
            const lu = lastUpdated[d.id];
            const busy = busyId === d.id;
            return (
              <div key={d.id} className="reception-row" style={{padding:'12px 16px',borderBottom:'1px solid var(--line)'}}>
                <div className="only-desktop-grid" style={{display:'grid',gridTemplateColumns:'2fr 1.4fr 1.5fr 1fr 1.1fr 1.5fr',gap:8,alignItems:'center'}}>
                  <div style={{fontWeight:700,fontSize:13.5}}>{d.name}</div>
                  <div style={{fontSize:12.5,color:'var(--text-dim)'}}>{d.department}</div>
                  <div style={{fontSize:12.5}}>{s.todaysSlots.length ? s.todaysSlots.map(fmtRange).join(', ') : '—'}</div>
                  <div><StatusPill status={status}/></div>
                  <div style={{fontSize:11.5,color:'var(--text-dim)'}}>{lu ? lu.toLocaleTimeString() : '—'}</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {!d.onLeave && (
                      <button onClick={()=>toggle(d)} disabled={busy}
                        style={{padding:'7px 12px',borderRadius:9,border:'none',fontSize:12,fontWeight:700,color:'#fff',opacity:busy?0.6:1,
                          background: status==='present' ? 'var(--absent)' : 'var(--present)'}}
                      >{busy ? '…' : (status==='present' ? 'Mark Absent' : 'Mark Present')}</button>
                    )}
                    <button onClick={()=>removeDoctor(d)} disabled={busy}
                      style={{padding:'7px 10px',borderRadius:9,border:'1px solid var(--line)',fontSize:12,fontWeight:600,background:'#fff',color:'var(--text-dim)'}}
                    >Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{padding:20,textAlign:'center',color:'var(--text-dim)',fontSize:13}}>No doctors match this search/filter.</div>}
        </div>
      </div>

      {showAdd && <AddDoctorModal onClose={()=>setShowAdd(false)} onSave={onAddDoctor}/>}

      {toast && (
        <div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',
          background: toastErr ? 'var(--absent)' : 'var(--brand-navy)',
          color:'#fff',padding:'10px 18px',borderRadius:12,fontSize:13.5,boxShadow:'var(--shadow)',zIndex:50,maxWidth:'90vw',textAlign:'center'}}>
          {toastErr ? '⚠ ' : '✓ '}{toast}
        </div>
      )}
      <style>{`
        @media (max-width: 760px){
          .only-desktop{display:none;}
          .only-desktop-grid{display:flex !important; flex-direction:column; align-items:flex-start !important; gap:6px;}
        }
        @media (min-width: 761px){
          .reception-row:hover{background:#FAFBFD;}
        }
      `}</style>
    </div>
  );
}

/* =========================================================================
   9. ROOT APP
   ========================================================================= */

export default ReceptionDashboard;
