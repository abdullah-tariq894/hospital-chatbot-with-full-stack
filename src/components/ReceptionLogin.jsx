import React, { useState } from 'react';
import Logo from './Logo.jsx';

function ReceptionLogin({onLogin, onBack}){
  const [u,setU] = useState(''); const [p,setP] = useState(''); const [err,setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if(u==='reception' && p==='reception123'){ setErr(''); onLogin(); }
    else setErr('Incorrect username or password.');
  };
  return (
    <div style={{height:'100dvh',minHeight:0,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}>
      <form onSubmit={submit} style={{background:'#fff',padding:28,borderRadius:'var(--radius)',boxShadow:'var(--shadow)',width:'100%',maxWidth:360}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:18}}><Logo size={44}/></div>
        <h2 className="font-display" style={{textAlign:'center',fontSize:18,fontWeight:700,color:'var(--brand-navy)',marginBottom:18}}>Reception Login</h2>
        <label style={{fontSize:12.5,color:'var(--text-dim)',fontWeight:600}}>Username</label>
        <input value={u} onChange={e=>setU(e.target.value)} style={{width:'100%',padding:'9px 12px',border:'1px solid var(--line)',borderRadius:10,marginTop:4,marginBottom:14,fontSize:14}}/>
        <label style={{fontSize:12.5,color:'var(--text-dim)',fontWeight:600}}>Password</label>
        <input type="password" value={p} onChange={e=>setP(e.target.value)} style={{width:'100%',padding:'9px 12px',border:'1px solid var(--line)',borderRadius:10,marginTop:4,marginBottom:14,fontSize:14}}/>
        {err && <div style={{color:'var(--absent)',fontSize:12.5,marginBottom:10}}>{err}</div>}
        <button type="submit" style={{width:'100%',padding:'10px',borderRadius:10,border:'none',background:'var(--brand-red)',color:'#fff',fontWeight:700,fontSize:14}}>Log In</button>
        <button type="button" onClick={onBack} style={{width:'100%',padding:'10px',marginTop:8,borderRadius:10,border:'1px solid var(--line)',background:'#fff',color:'var(--text-dim)',fontSize:13}}>← Back to Chatbot</button>
        <div style={{fontSize:11,color:'var(--text-dim)',marginTop:14,textAlign:'center'}}>Dev credentials: reception / reception123</div>
      </form>
    </div>
  );
}

export default ReceptionLogin;
