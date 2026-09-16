import React from 'react';
import Logo from './Logo.jsx';
import { SUGGESTIONS } from '../lib/suggestions.js';

function WelcomeScreen({onSuggest}){
  return (
    <div style={{flex:1,minHeight:0,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}>
      <Logo size={52}/>
      <h1 className="font-display welcome-title" style={{fontSize:24,fontWeight:800,color:'var(--brand-navy)',marginTop:18,marginBottom:4}}>How can I help you today?</h1>
      <p className="welcome-copy" style={{color:'var(--text-dim)',fontSize:14,marginBottom:22,maxWidth:420}}>Ask about doctors, timings, fees, X-rays, ultrasounds or lab prices — in English, Urdu, or Roman Urdu.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',maxWidth:520}}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={()=>onSuggest(s)}
            style={{border:'1px solid var(--line)',background:'#fff',padding:'8px 14px',borderRadius:999,fontSize:13,color:'var(--brand-navy)',boxShadow:'var(--shadow)'}}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}


export default WelcomeScreen;
