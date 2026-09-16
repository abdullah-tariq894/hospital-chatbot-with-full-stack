import React from 'react';
import Logo from './Logo.jsx';

function Sidebar({sessions, currentId, onNew, onSelect, onDelete, onOpenReception, open, setOpen, live}){
  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:20}} className="md-hide-overlay"></div>}
      <div style={{
        width:250, background:'var(--brand-navy)', color:'#fff', display:'flex', flexDirection:'column',
         position: open ? 'fixed' : 'relative', top:0, left:0, height:'100dvh', zIndex:21,
         flexShrink:0,
        transform: open ? 'translateX(0)' : undefined,
        transition:'transform .2s ease'
       }} id="sidebar" className="sidebar-drawer">
        <div style={{padding:16, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <Logo size={30}/>
          <button onClick={()=>setOpen(false)} className="only-mobile" style={{background:'transparent',border:'none',color:'#fff',fontSize:18}}>✕</button>
        </div>
        <div style={{padding:'0 12px'}}>
          <button onClick={onNew} style={{width:'100%',padding:'10px 12px',borderRadius:12,border:'1px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.06)',color:'#fff',fontSize:13.5,fontWeight:600,textAlign:'left'}}>+ New Chat</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'12px 8px',marginTop:6}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',padding:'0 8px 6px',fontWeight:700,letterSpacing:0.5}}>CHAT HISTORY</div>
          {sessions.map(s => (
            <div key={s.id} onClick={()=>onSelect(s.id)}
              style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',gap:6,
                padding:'8px 10px',borderRadius:10,cursor:'pointer',marginBottom:2,
                background: s.id===currentId ? 'rgba(255,255,255,0.12)' : 'transparent',
                fontSize:13
              }}>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.title}</span>
              <button onClick={(e)=>{e.stopPropagation(); onDelete(s.id);}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.5)',fontSize:13}}>✕</button>
            </div>
          ))}
        </div>
        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,0.12)'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,fontSize:11.5,color:'rgba(255,255,255,0.65)',marginBottom:9}}>
            <span style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
              background: live && live.status==='connected' ? 'var(--present)' : (live && live.status==='loading' ? '#F0B429' : 'var(--absent)')}}></span>
            <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {live && live.status==='connected' ? 'Live database connected' : (live && live.status==='loading' ? 'Connecting to database…' : 'Offline mode (saved data)')}
            </span>
          </div>
          <button onClick={onOpenReception} style={{width:'100%',padding:'10px 12px',borderRadius:12,border:'none',background:'var(--brand-red)',color:'#fff',fontSize:13,fontWeight:700}}>
            🏥 Reception Panel
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
