import React from 'react';

function TypingIndicator({label}){
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--text-dim)',fontSize:13,marginTop:6}}>
      <span className="typing-dot" style={{width:6,height:6,borderRadius:99,background:'var(--text-dim)',display:'inline-block'}}></span>
      <span className="typing-dot" style={{width:6,height:6,borderRadius:99,background:'var(--text-dim)',display:'inline-block'}}></span>
      <span className="typing-dot" style={{width:6,height:6,borderRadius:99,background:'var(--text-dim)',display:'inline-block'}}></span>
      <span>{label}</span>
    </div>
  );
}


export default TypingIndicator;
