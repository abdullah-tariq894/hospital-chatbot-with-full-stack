import React from 'react';
import DoctorCard from './DoctorCard.jsx';
import TestCard from './TestCard.jsx';
import TypingIndicator from './TypingIndicator.jsx';

function MessageBubble({m}){
  const isUser = m.role === 'user';
  return (
    <div className="msg-in" style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:14}}>
      <div style={{maxWidth:'86%'}}>
        {!isUser && <div style={{fontSize:11,fontWeight:700,color:'var(--brand-red)',marginBottom:4}}>My City Hospital AI</div>}
        {m.text && (
          <div style={{
            background:isUser?'var(--brand-navy)':'var(--panel)',
            color:isUser?'#fff':'var(--text)',
            border:isUser?'none':'1px solid var(--line)',
            padding:'10px 14px',borderRadius: isUser? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            fontSize:14.5, lineHeight:1.55, whiteSpace:'pre-wrap',
            boxShadow: isUser? 'none':'var(--shadow)'
          }}>
            {m.text}
          </div>
        )}
        {m.card && m.card.type === 'doctor' && <DoctorCard d={m.card} />}
        {m.card && m.card.type === 'test' && <TestCard t={m.card} />}
        {m.cards && (
          <div style={{display:'flex',flexDirection:'column'}}>
            {m.cards.map((c,i) => c.type==='doctor' ? <DoctorCard key={i} d={c}/> : <TestCard key={i} t={c}/>)}
          </div>
        )}
        {m.processing && <TypingIndicator label={m.processing} />}
      </div>
    </div>
  );
}


export default MessageBubble;
