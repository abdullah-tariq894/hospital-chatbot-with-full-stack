import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatbotPage from './components/ChatbotPage.jsx';
import ReceptionLogin from './components/ReceptionLogin.jsx';
import ReceptionDashboard from './components/ReceptionDashboard.jsx';
import {
  LIVE, loadAllData, loadDoctorsFromApi, presenceFromDoctors,
  setDoctorStatusApi, addDoctorApi, deleteDoctorApi,
} from './lib/api.js';

function App(){
  const [view, setView] = useState('chat'); // chat | receptionLogin | receptionDashboard
  const [presence, setPresence] = useState(() => presenceFromDoctors());
  const [live, setLive] = useState({status:'loading', lastSync:null, error:null});
  const [, forceRender] = useState(0);
  const presenceRef = useRef(presence);
  useEffect(()=>{ presenceRef.current = presence; }, [presence]);

  const [sessions, setSessions] = useState([{id:'s-init', title:'New Chat', messages:[]}]);
  const [currentId, setCurrentId] = useState('s-init');

  // MongoDB se doctors + diagnostics laao aur live status set karo
  const syncFromBackend = useCallback(async () => {
    const map = await loadAllData();
    setPresence(map);
    setLive({status: LIVE.status, lastSync: LIVE.lastSync, error: LIVE.error});
    forceRender(n => n + 1);
    return map;
  }, []);

  useEffect(()=>{ syncFromBackend(); }, [syncFromBackend]);

  // har 20 second: backend se latest presence (reception ne kuch badla ho to
  // chatbot ko turant pata chal jaye — dusre device par bhi)
  useEffect(()=>{
    const t = setInterval(()=>{
      loadDoctorsFromApi()
        .then(()=>{
          LIVE.status = 'connected'; LIVE.lastSync = new Date(); LIVE.error = null;
          setPresence(presenceFromDoctors());
          setLive({status:'connected', lastSync:LIVE.lastSync, error:null});
        })
        .catch(err => {
          LIVE.status = 'offline'; LIVE.error = err.message;
          setLive({status:'offline', lastSync:LIVE.lastSync, error:err.message});
        });
    }, 20000);
    return ()=>clearInterval(t);
  }, []);

  // reception ka Mark Present / Absent
  const handleSetStatus = useCallback(async (id, status) => {
    await setDoctorStatusApi(id, status);
    setPresence(prev => ({...prev, [id]: status}));
    setLive({status:'connected', lastSync:LIVE.lastSync, error:null});
  }, []);

  const handleAddDoctor = useCallback(async (payload) => {
    await addDoctorApi(payload);
    setPresence(presenceFromDoctors());
    forceRender(n => n + 1);
  }, []);

  const handleDeleteDoctor = useCallback(async (id) => {
    await deleteDoctorApi(id);
    setPresence(presenceFromDoctors());
    forceRender(n => n + 1);
  }, []);

  return (
    <div style={{height:'100%'}}>
      <style>{`
        .only-mobile{display:none;}
        .only-mobile-flex{display:none;}
        @media (max-width: 820px){
          #sidebar{ box-shadow: 0 0 0 100vw rgba(0,0,0,0) ; }
        }
        @media (max-width: 820px){
          .only-mobile{display:inline-block !important;}
          .only-mobile-flex{display:flex !important;}
          #sidebar{ transform: translateX(-100%); }
        }
      `}</style>
      {view === 'chat' && (
        <ChatbotPage
          presenceMap={presenceRef}
          sessions={sessions} setSessions={setSessions}
          currentId={currentId} setCurrentId={setCurrentId}
          onOpenReception={()=>setView('receptionLogin')}
          live={live}
        />
      )}
      {view === 'receptionLogin' && (
        <ReceptionLogin onLogin={()=>setView('receptionDashboard')} onBack={()=>setView('chat')} />
      )}
      {view === 'receptionDashboard' && (
        <ReceptionDashboard
          presenceMap={presence}
          onSetStatus={handleSetStatus}
          onAddDoctor={handleAddDoctor}
          onDeleteDoctor={handleDeleteDoctor}
          onRefresh={syncFromBackend}
          live={live}
          onBack={()=>setView('chat')}
          onLogout={()=>setView('chat')}
        />
      )}
    </div>
  );
}

export default App;
