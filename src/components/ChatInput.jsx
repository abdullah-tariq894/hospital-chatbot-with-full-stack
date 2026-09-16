import React, { useState, useRef } from 'react';
import { getAutocompleteSuggestions } from '../lib/suggestions.js';

function ChatInput({onSend, disabled}){
  const [text, setText] = useState("");
  const taRef = useRef(null);
  const suggestions = getAutocompleteSuggestions(text);

  const handleSend = () => {
    if(disabled) return;
    if(!text.trim()) return;
    onSend(text.trim());
    setText("");
    if(taRef.current) taRef.current.style.height = 'auto';
  };

  const onKeyDown = (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-composer" style={{padding:'10px 14px calc(10px + env(safe-area-inset-bottom)) 14px', borderTop:'1px solid var(--line)', background:'var(--panel)',flexShrink:0}}>
      <div className="chat-input-row" style={{display:'flex',alignItems:'flex-end',gap:8, position:'relative'}}>
        <div style={{flex:1,position:'relative',minWidth:0}}>
          {suggestions.length>0 && (
            <div role="listbox" style={{position:'absolute',left:0,right:0,bottom:'calc(100% + 8px)',background:'#fff',border:'1px solid var(--line)',borderRadius:12,boxShadow:'var(--shadow)',overflow:'hidden',zIndex:15,maxHeight:220,overflowY:'auto'}}>
              {suggestions.map(s=>(
                <button key={s.label} role="option" className="autocomplete-option" onMouseDown={e=>e.preventDefault()} onClick={()=>{
                  setText(s.question);
                  if(taRef.current){ taRef.current.focus(); taRef.current.style.height='auto'; }
                }} style={{display:'block',width:'100%',textAlign:'left',padding:'10px 12px',border:'none',borderBottom:'1px solid var(--line)',background:'#fff',color:'var(--text)',fontSize:13}}>
                  <span style={{fontWeight:600}}>{s.label}</span>
                  <span style={{display:'block',fontSize:11.5,color:'var(--text-dim)',marginTop:2}}>{s.question}</span>
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={taRef}
            value={text}
            onChange={e=>{ setText(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'; }}
            onKeyDown={onKeyDown}
            placeholder="Write your message... (Urdu, Roman Urdu or English)"
            rows={1}
            style={{width:'100%',resize:'none',border:'1px solid var(--line)',borderRadius:14,padding:'9px 12px',fontSize:14.5,maxHeight:120,outline:'none',display:'block'}}
          />
        </div>
        <button className="send-button" onClick={handleSend} disabled={disabled}
          style={{height:38,padding:'0 16px',borderRadius:12,border:'none',background:'var(--brand-red)',color:'#fff',fontWeight:700,fontSize:13.5,opacity:disabled?0.6:1}}
        >Send</button>
      </div>
    </div>
  );
}


export default ChatInput;
