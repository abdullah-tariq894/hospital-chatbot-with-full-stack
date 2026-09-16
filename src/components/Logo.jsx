import React from 'react';

function Logo({size=34}){
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{
        width:size,height:size,borderRadius:10,background:'var(--brand-red)',
        display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',
        fontFamily:'Poppins',fontWeight:800,fontSize:size*0.5,flexShrink:0
      }}>+</div>
      <div style={{lineHeight:1.05}}>
        <div className="font-display" style={{fontWeight:800,fontSize:15,color:'var(--brand-red)'}}>MY CITY</div>
        <div className="font-display" style={{fontWeight:700,fontSize:10,color:'var(--brand-navy)',letterSpacing:1}}>HOSPITAL AI</div>
      </div>
    </div>
  );
}


export default Logo;
