import React from 'react';

function TestCard({t}){
  const showOffer = t.onOffer && t.discountPrice;
  return (
    <div className="test-card" style={{background:'var(--panel)',border:'1px solid var(--line)',borderRadius:'var(--radius)',padding:14,boxShadow:'var(--shadow)',marginTop:8,maxWidth:380}}>
      <div className="test-card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <div style={{fontWeight:700,fontSize:14.5}}>{t.name}</div>
        <span style={{fontSize:11,fontWeight:700,color:'var(--brand-teal)',background:'#E7F5F6',padding:'2px 8px',borderRadius:999}}>{t.kind}</span>
      </div>
      <div style={{marginTop:8, display:'flex', alignItems:'baseline', gap:8}}>
        {showOffer ? (
          <>
            <span className="font-mono" style={{fontSize:12,color:'var(--text-dim)',textDecoration:'line-through'}}>Rs. {t.price}</span>
            <span className="font-mono" style={{fontSize:18,fontWeight:700,color:'var(--brand-red)'}}>Rs. {t.discountPrice}</span>
            <span style={{fontSize:11,color:'var(--present)',fontWeight:700}}>Special Offer</span>
          </>
        ) : (
          <span className="font-mono" style={{fontSize:18,fontWeight:700,color:'var(--brand-navy)'}}>Rs. {t.price}</span>
        )}
      </div>
      {t.sampleReporting && <div style={{fontSize:12,color:'var(--text-dim)',marginTop:6}}>Reporting: {t.sampleReporting}{t.category?` · ${t.category}`:''}</div>}
    </div>
  );
}


export default TestCard;
