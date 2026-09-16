import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import Logo from './Logo.jsx';
import WelcomeScreen from './WelcomeScreen.jsx';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import { routeMessage } from '../lib/router.js';
import { generalFallback } from '../lib/claude.js';

function ChatbotPage({presenceMap, sessions, setSessions, currentId, setCurrentId, onOpenReception, live}){
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const current = sessions.find(s=>s.id===currentId) || sessions[0];
  const scrollRef = useRef(null);

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [current && current.messages.length, current && current.messages[current.messages.length-1]]);

  function updateCurrentMessages(updater){
    setSessions(prev => prev.map(s => s.id === current.id ? {...s, messages: updater(s.messages)} : s));
  }

  async function handleSend(text){
    if(!current) return;
    const userMsg = { role:'user', text };
    updateCurrentMessages(msgs => [...msgs, userMsg]);
    if(current.title === 'New Chat' && text) {
      setSessions(prev => prev.map(s => s.id === current.id ? {...s, title: text.slice(0,32)} : s));
    }

    const placeholderIdx = { current: null };
    updateCurrentMessages(msgs => { placeholderIdx.current = msgs.length; return [...msgs, {role:'assistant', processing:'Searching hospital data…'}]; });

    // slight delay so local answers still feel considered, not jarring
    await new Promise(r=>setTimeout(r, 260));
    const now = new Date();
    let result;
    try{
      result = await routeMessage(text, presenceMap.current, now, current.messages);
    }catch(e){
      result = { fallback:true };
    }

    if(result.fallback){
      updateCurrentMessages(msgs => msgs.map((m,i)=> i===placeholderIdx.current ? {...m, processing:'Generating response…'} : m));
      const ans = await generalFallback(text);
      updateCurrentMessages(msgs => msgs.map((m,i)=> i===placeholderIdx.current ? {role:'assistant', text: ans} : m));
      return;
    }

    updateCurrentMessages(msgs => msgs.map((m,i)=> i===placeholderIdx.current ? {role:'assistant', text: result.text, card: result.card, cards: result.cards} : m));
  }

  return (
    <div className="chat-page" style={{display:'flex',height:'100%',overflow:'hidden'}}>
      <Sidebar
        sessions={sessions} currentId={current && current.id}
        onNew={()=>{
          const id = 's-' + Date.now();
          setSessions(prev => [{id, title:'New Chat', messages:[]}, ...prev]);
          setCurrentId(id); setSidebarOpen(false);
        }}
        onSelect={(id)=>{ setCurrentId(id); setSidebarOpen(false); }}
        onDelete={(id)=>{
          setSessions(prev => {
            const next = prev.filter(s=>s.id!==id);
            if(id===current.id && next.length) setCurrentId(next[0].id);
            return next.length ? next : [{id:'s-'+Date.now(), title:'New Chat', messages:[]}];
          });
        }}
        onOpenReception={onOpenReception}
        live={live}
        open={sidebarOpen} setOpen={setSidebarOpen}
      />
       <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,minHeight:0}}>
        <div style={{padding:'10px 14px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:10,background:'var(--panel)'}} className="only-mobile-flex">
          <button onClick={()=>setSidebarOpen(true)} style={{background:'transparent',border:'1px solid var(--line)',borderRadius:8,width:34,height:34,fontSize:16}}>☰</button>
          <Logo size={26}/>
        </div>
        {(!current || current.messages.length===0) ? (
          <WelcomeScreen onSuggest={(s)=>handleSend(s, null)} />
        ) : (
            <div ref={scrollRef} className="chat-scroll" style={{flex:1,minHeight:0,overflowY:'auto',padding:'18px 16px'}}>
             <div className="chat-message-column" style={{maxWidth:720,margin:'0 auto'}}>
              {current.messages.map((m,i)=><MessageBubble key={i} m={m}/>)}
            </div>
          </div>
        )}
         <div className="chat-width" style={{maxWidth:720,width:'100%',margin:'0 auto'}}>
          <ChatInput onSend={handleSend} disabled={false}/>
        </div>
      </div>
    </div>
  );
}
export default ChatbotPage;
