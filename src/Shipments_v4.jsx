import { useState, useEffect, useRef } from "react";

const TWEAK_DEFAULTS = { panelWidth: 520, compactRows: false };

const CARRIER_RATES = [
  { id:'r1', carrier:'UPS',  service:'2nd Day Air A.M.®',  desc:'Delivery by 10:30 a.m. or 12:00 noon on the second business day.', price:74.95 },
  { id:'r2', carrier:'USPS', service:'Ground Advantage',    desc:'Delivery in 2 to 5 days.', price:5.77, recommended:true },
  { id:'r3', carrier:'UPS',  service:'Ground',              desc:'Delivery times vary. Delivered usually in 1–5 business days.', price:24.65 },
  { id:'r4', carrier:'UPS',  service:'3 Day Select®',       desc:'Delivery by the end of the third business day.', price:58.45 },
  { id:'r5', carrier:'UPS',  service:'2nd Day Air®',        desc:'Delivery by the end of the second business day.', price:67.20 },
  { id:'r6', carrier:'FedEx',service:'Home Delivery',       desc:'Delivery in 1–5 business days.', price:14.20 },
];

const INIT_ORDERS = [
  {
    id:'3000000025', date:'Apr 17, 2026', channel:'ebay',
    buyer:'Robert Mitchell', total:290.00,
    items:[{ id:'i1', name:'2024 Donruss Baseball Hobby Box Sealed', sku:'TS-123', qty:1, weight:0.4, price:290.00 }],
    shipTo:{ name:'Robert Mitchell', addr:'1023 Windley Dr', city:'Saint Augustine', state:'FL', zip:'32092-0122', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'unlabeled', shipments:[], subOrders:null,
    addressError: 'City, State and ZIP Code are valid, but street address is not a match.',
  },
  {
    id:'3000000024', date:'Apr 17, 2026', channel:'ebay',
    buyer:'Luis Orta Jr', total:72.46,
    items:[
      { id:'i1', name:'1997–98 Upper Deck Basketball Set',    sku:'UD-97',  qty:1, weight:0.6, price:32.46 },
      { id:'i2', name:'2003 Topps Chrome Refractor LeBron',   sku:'TC-LBJ', qty:1, weight:0.2, price:20.00 },
      { id:'i3', name:'2004 Bowman Chrome Draft Picks Auto',  sku:'BC-DPA', qty:1, weight:0.2, price:20.00 },
    ],
    shipTo:{ name:'Luis Orta Jr', addr:'500 Ocean Blvd', city:'Miami Beach', state:'FL', zip:'33139', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'unlabeled', shipments:[],
    subOrders:[
      { subId:'3000000024-S1', label:'Shipment 1 of 2', itemIds:['i1'],       shipStatus:'unlabeled', shipments:[] },
      { subId:'3000000024-S2', label:'Shipment 2 of 2', itemIds:['i2','i3'], shipStatus:'unlabeled', shipments:[] },
    ],
  },
  {
    id:'3000000022', date:'Apr 15, 2026', channel:'ebay',
    buyer:'Stephen Buckley', total:39.07,
    items:[{ id:'i1', name:'2025 Super Break Pieces of the Past', sku:'SB-25', qty:1, weight:0.5, price:39.07 }],
    shipTo:{ name:'Stephen Buckley', addr:'88 Maple Ave', city:'Burlington', state:'VT', zip:'05401', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'unlabeled', shipments:[], subOrders:null,
  },
  {
    id:'3000000021', date:'Apr 14, 2026', channel:'ebay',
    buyer:'Marcus Webb', total:138.50,
    items:[
      { id:'i1', name:'2024 Topps Chrome Shohei Ohtani Auto', sku:'TC-OHT', qty:1, weight:0.2, price:45.00 },
      { id:'i2', name:'2023 Panini Prizm Wembanyama RC',       sku:'PP-WEM', qty:1, weight:0.2, price:38.50 },
      { id:'i3', name:'1986 Fleer Michael Jordan Rookie',      sku:'FL-MJ',  qty:1, weight:0.2, price:30.00 },
      { id:'i4', name:'2022 Bowman Chrome Julio Rodriguez',    sku:'BC-JR',  qty:1, weight:0.2, price:15.00 },
      { id:'i5', name:'2021 Select Kevin Durant Silver Prizm', sku:'SL-KD',  qty:1, weight:0.2, price:10.00 },
    ],
    shipTo:{ name:'Marcus Webb', addr:'301 Pine Street', city:'Seattle', state:'WA', zip:'98101', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'unlabeled', shipments:[], subOrders:null,
  },
  {
    id:'3000000020', date:'Apr 12, 2026', channel:'ebay',
    buyer:'Zach Davidos', total:58.64,
    items:[{ id:'i1', name:'2025 Topps Now #8 Cristiano Ronaldo', sku:'TN-CR7', qty:1, weight:0.2, price:58.64 }],
    shipTo:{ name:'Zach Davidos', addr:'14 Harbor View', city:'Portland', state:'ME', zip:'04101', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'label_purchased', subOrders:null,
    shipments:[{ shipmentId:'SHP-001', itemIds:['i1'], carrier:'USPS', service:'Ground Advantage', price:5.77, trackingNumber:'9400111899223461196807', shippedAt:'Apr 12, 2026, 5:30 PM', status:'In transit', channelSynced:false, syncedFromChannel:false, trackingEvents:null }],
  },
  {
    id:'3000000019', date:'Apr 12, 2026', channel:'ebay',
    buyer:'Ryan Lauren', total:85.09,
    items:[{ id:'i1', name:'2025 Panini Prizm The Rolling Stones', sku:'PR-RS', qty:1, weight:0.3, price:85.09 }],
    shipTo:{ name:'Ryan Lauren', addr:'221 Baker Street', city:'Nashville', state:'TN', zip:'37201', country:'US' },
    shipFrom:{ name:'Carolina Coast Cards', addr:'1551 Oak Lawn Ave', city:'Dallas', state:'TX', zip:'75207-3619' },
    shipStatus:'shipped', subOrders:null,
    shipments:[{ shipmentId:'SHP-002', itemIds:['i1'], carrier:'USPS', service:'First-Class Package', price:4.20, trackingNumber:'9400111899223461196234', shippedAt:'Apr 12, 2026, 2:00 PM', status:'Out for Delivery', channelSynced:true, syncedFromChannel:true,
      trackingEvents:[
        { date:'Apr 17, 2026 9:41 AM',  status:'Out for Delivery',      location:'Nashville, TN' },
        { date:'Apr 17, 2026 6:02 AM',  status:'Arrived at Post Office', location:'Nashville, TN 37201' },
        { date:'Apr 16, 2026 11:14 PM', status:'In Transit',             location:'Memphis, TN' },
        { date:'Apr 15, 2026 3:30 PM',  status:'Accepted',               location:'Burlington, VT' },
      ],
    }],
  },
];

/* ── Date helpers ──────────────────────────────────────────────────────────── */
function todayStr() {
  const d = new Date();
  return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW    = ['S','M','T','W','T','F','S'];

function CalendarPicker({ value, onChange }) {
  /* value is "MM/DD/YYYY" */
  const parse = v => { const [m,d,y] = (v||todayStr()).split('/').map(Number); return new Date(y,m-1,d); };
  const [cur, setCur] = useState(() => { const d = parse(value); return { y:d.getFullYear(), m:d.getMonth() }; });
  const selected = parse(value);

  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m+1, 0).getDate();
  const cells = [];
  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);

  function select(d) {
    const mm = String(cur.m+1).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    onChange(`${mm}/${dd}/${cur.y}`);
  }
  function isSelected(d) { return selected.getFullYear()===cur.y && selected.getMonth()===cur.m && selected.getDate()===d; }
  function isPast(d) { const t=new Date(); t.setHours(0,0,0,0); return new Date(cur.y,cur.m,d)<t; }

  return (
    <div style={{ marginTop:10, padding:'12px 14px 14px', borderTop:'1px solid #EEEEEE' }}>
      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:14, fontWeight:600 }}>{MONTHS[cur.m]} {cur.y}</span>
          <span style={{ fontSize:12, color:'rgba(0,0,0,0.4)', cursor:'pointer' }}>▾</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>setCur(c=>{ const d=new Date(c.y,c.m-1,1); return {y:d.getFullYear(),m:d.getMonth()}; })}
            style={{ background:'none',border:'none',cursor:'pointer',fontSize:16,color:'rgba(0,0,0,0.5)',padding:'0 4px',lineHeight:1 }}>‹</button>
          <button onClick={()=>setCur(c=>{ const d=new Date(c.y,c.m+1,1); return {y:d.getFullYear(),m:d.getMonth()}; })}
            style={{ background:'none',border:'none',cursor:'pointer',fontSize:16,color:'rgba(0,0,0,0.5)',padding:'0 4px',lineHeight:1 }}>›</button>
        </div>
      </div>
      {/* Day-of-week headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
        {DOW.map((d,i)=><div key={i} style={{ textAlign:'center',fontSize:11,fontWeight:600,color:'rgba(0,0,0,0.45)',padding:'2px 0' }}>{d}</div>)}
      </div>
      {/* Cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((d,i)=>{
          if (!d) return <div key={i}/>;
          const sel = isSelected(d);
          const past = isPast(d);
          return (
            <div key={i} onClick={()=>!past&&select(d)}
              style={{ textAlign:'center', fontSize:13, padding:'5px 0', borderRadius:'50%', cursor:past?'default':'pointer',
                background:sel?'#1976D2':'transparent', color:sel?'#fff':past?'rgba(0,0,0,0.25)':'rgba(0,0,0,0.75)',
                fontWeight:sel?600:400, aspectRatio:'1' }}>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Primitives ────────────────────────────────────────────────────────────── */
function Chip({ status, small }) {
  const cfg = {
    unlabeled:       { label:'Unlabeled',       bg:'#F5F5F5', color:'rgba(0,0,0,0.55)', border:'#E0E0E0' },
    label_purchased: { label:'Label Purchased', bg:'#E5F6FD', color:'#0288D1',          border:'#B3E5FC' },
    shipped:         { label:'Shipped',         bg:'#E3F2FD', color:'#1976D2',          border:'#BBDEFB' },
    refund_requested:{ label:'Refund Requested',bg:'#FFF3E0', color:'#E65100',          border:'#FFE0B2' },
    refunded:        { label:'Refunded',        bg:'#EEEEEE', color:'#616161',          border:'#E0E0E0' },
  };
  const { label, bg, color, border } = cfg[status] || cfg.unlabeled;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:small?'1px 6px':'1px 8px', borderRadius:9999, background:bg, border:`1px solid ${border}`, fontSize:small?10:11, fontWeight:500, color, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function CarrierBadge({ carrier }) {
  const map = { UPS:{bg:'#FFB500'}, USPS:{bg:'#004B87'}, FedEx:{bg:'#4D148C'} };
  const {bg} = map[carrier]||{bg:'#9E9E9E'};
  return (
    <div style={{ width:38,height:38,borderRadius:7,background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <span style={{ color:'#fff',fontSize:8.5,fontWeight:700 }}>{carrier}</span>
    </div>
  );
}

function SectionCard({ title, right, children, actionBtn, defaultOpen=true, error }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hoverErr, setHoverErr] = useState(false);
  return (
    <div style={{ border:`1px solid ${error ? '#FFCDD2' : '#E5E5E5'}`, borderRadius:8, marginBottom:12, overflow:'hidden' }}>
      <div
        onClick={e=>{ if(e.target.closest('[data-no-collapse]')) return; setOpen(o=>!o); }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', background: error ? '#FFF8F8' : '#FAFAFA', borderBottom: open ? `1px solid ${error ? '#FFCDD2' : '#EEEEEE'}` : 'none', cursor:'pointer', userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:12, fontWeight:700, color: error ? '#C62828' : 'rgba(0,0,0,0.75)' }}>{title}</span>
          {error && (
            <span style={{ position:'relative', display:'inline-flex' }}
              onMouseEnter={()=>setHoverErr(true)} onMouseLeave={()=>setHoverErr(false)}>
              <span style={{ fontSize:14, color:'#C62828', lineHeight:1, cursor:'default' }}>⚠</span>
              {hoverErr && (
                <div style={{ position:'absolute', left:0, top:'calc(100% + 6px)', background:'#323232', color:'#fff', fontSize:11, lineHeight:1.5, padding:'7px 11px', borderRadius:5, zIndex:200, whiteSpace:'nowrap', boxShadow:'0 3px 10px rgba(0,0,0,0.22)', pointerEvents:'none', minWidth:160 }}>
                  {error}
                  <div style={{ position:'absolute', top:-4, left:8, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderBottom:'4px solid #323232' }} />
                </div>
              )}
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {right && <span style={{ fontSize:11.5, color:'rgba(0,0,0,0.4)' }}>{right}</span>}
          {actionBtn && <span data-no-collapse onClick={e=>e.stopPropagation()}>{actionBtn}</span>}
          <span style={{ fontSize:11, color:'rgba(0,0,0,0.35)', lineHeight:1 }}>{open ? '▲' : '▽'}</span>
        </div>
      </div>
      {open && <div style={{ padding:'12px 14px' }}>{children}</div>}
    </div>
  );
}

function FieldInput({ label, value, onChange, style={}, error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:3, ...style }}>
      {label && <label style={{ fontSize:10.5, fontWeight:600, color:error?'#C62828':'rgba(0,0,0,0.45)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>}
      <input value={value} onChange={onChange}
        style={{ padding:'7px 10px', fontSize:13, border:`1px solid ${error?'#EF9A9A':'#E0E0E0'}`, borderRadius:4, fontFamily:'inherit', outline:'none', background:'#fff', width:'100%' }} />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
      {label && <label style={{ fontSize:10.5, fontWeight:600, color:'rgba(0,0,0,0.45)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:'7px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:4, background:'#fff', fontFamily:'inherit' }}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ── Alert ───────────────────────────────────────────────────────────────────
   Mirrors MUI v5 <Alert severity=...> (standard variant) with the same API so it
   renders in the in-chat preview. In the LitCommerce project, replace this with the
   real MUI Alert import (from the mui material package) and delete this component.
----------------------------------------------------------------------------- */
function Alert({ severity = 'info', variant = 'standard', children, sx, style }) {
  const tokens = {
    error:   { bg:'#FDEDED', color:'#5F2120', icon:'#EF5350' },
    warning: { bg:'#FFF4E5', color:'#663C00', icon:'#FF9800' },
    info:    { bg:'#E5F6FD', color:'#014361', icon:'#0288D1' },
    success: { bg:'#EDF7ED', color:'#1E4620', icon:'#4CAF50' },
  }[severity] || { bg:'#E5F6FD', color:'#014361', icon:'#0288D1' };
  const icons = {
    error:   'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    info:    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    success: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  };
  return (
    <div role="alert" style={{
      display:'flex', alignItems:'center', gap:12, padding:'6px 16px', borderRadius:4,
      background: tokens.bg, color: tokens.color,
      fontSize:14, lineHeight:1.43, fontFamily:'"Inter","Roboto","Helvetica","Arial",sans-serif',
      ...(style||{}),
    }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill={tokens.icon} aria-hidden="true" style={{ flexShrink:0, marginRight:0 }}>
        <path d={icons[severity] || icons.info} />
      </svg>
      <div style={{ padding:'8px 0' }}>{children}</div>
    </div>
  );
}

/* ── Split Order Modal ─────────────────────────────────────────────────────── */
function SplitOrderModal({ order, onSave, onClose, initialGroups=null }) {
  const isEditing = !!(initialGroups && initialGroups.length);
  const initQty = () => {
    /* Edit mode: rebuild the quantity layout from the existing split shipments */
    if (initialGroups && initialGroups.length) {
      return initialGroups.map(g => {
        const slot = {};
        order.items.forEach(i => { slot[i.id] = g.itemIds.includes(i.id) ? i.qty : 0; });
        return slot;
      });
    }
    const q=[{}]; order.items.forEach(i=>{q[0][i.id]=i.qty;}); return q;
  };
  const [quantities, setQuantities] = useState(initQty);

  function addShipment() {
    setQuantities(prev=>{const next=prev.map(s=>({...s}));const ns={};order.items.forEach(i=>{ns[i.id]=0;});next.push(ns);return next;});
  }
  function removeShipment(si) {
    setQuantities(prev=>{const next=prev.map(s=>({...s}));order.items.forEach(i=>{next[0][i.id]=(next[0][i.id]||0)+(next[si][i.id]||0);});next.splice(si,1);return next;});
  }
  function changeQty(si,itemId,delta) {
    setQuantities(prev=>{
      const next=prev.map(s=>({...s}));
      const cur=next[si][itemId]||0;
      /* No upper cap — each shipment can hold any quantity. The only rule is that
         the per-item total across shipments must add up to the order quantity,
         which is enforced by validation, not by clamping. */
      next[si]={...next[si],[itemId]:Math.max(0,cur+delta)};
      return next;
    });
  }
  function setQty(si,itemId,val) {
    setQuantities(prev=>{
      const next=prev.map(s=>({...s}));
      const digits=(''+val).replace(/[^0-9]/g,'');
      const n=digits===''?0:parseInt(digits,10);
      next[si]={...next[si],[itemId]:n};
      return next;
    });
  }
  function weightFor(si){return order.items.reduce((s,i)=>s+(quantities[si][i.id]||0)*i.weight,0);}
  function handleSave(){
    if (hasError) return;
    const groups=quantities.map((qmap,si)=>({shipmentIdx:si,itemIds:order.items.filter(i=>(qmap[i.id]||0)>0).map(i=>i.id)})).filter(g=>g.itemIds.length>0);
    onSave(groups);
  }

  /* Validation: for each item, the quantities across all shipments must add up to the order total. */
  const sumFor = (itemId) => quantities.reduce((s,slot)=>s+(slot[itemId]||0),0);
  const itemErrors = {};
  order.items.forEach(i => { itemErrors[i.id] = sumFor(i.id) !== i.qty; });
  const hasError = Object.values(itemErrors).some(Boolean);

  /* Can't split a single unit: disable Add shipment when there's exactly one item with qty 1. */
  const addDisabled = order.items.length === 1 && (order.items[0].qty || 0) <= 1;

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#fff',borderRadius:12,width:820,maxWidth:'95vw',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #F0F0F0' }}>
          <span style={{ fontSize:18,fontWeight:700 }}>{isEditing ? 'Edit split shipment' : 'Split order'}</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:22,color:'rgba(0,0,0,0.4)',lineHeight:1 }}>×</button>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
          <div style={{ display:'grid',gridTemplateColumns:`1fr repeat(${quantities.length},200px) 60px`,marginBottom:8 }}>
            <div style={{ fontSize:11,fontWeight:700,color:'rgba(0,0,0,0.45)',textTransform:'uppercase',letterSpacing:'0.5px',paddingBottom:8,borderBottom:'2px solid #F0F0F0' }}>Items</div>
            <div style={{ fontSize:11,fontWeight:700,color:'rgba(0,0,0,0.45)',textTransform:'uppercase',letterSpacing:'0.5px',paddingBottom:8,borderBottom:'2px solid #F0F0F0',textAlign:'center',gridColumn:`2 / span ${quantities.length+1}` }}>Quantity</div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:`1fr repeat(${quantities.length},200px) 60px`,alignItems:'center',marginBottom:12 }}>
            <div style={{ fontSize:13,fontWeight:600 }}>Line item</div>
            {quantities.map((_,si)=>(
              <div key={si} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingLeft:12 }}>
                <span style={{ fontSize:13,fontWeight:600 }}>Shipment {si+1}</span>
                {si>0 && <button onClick={()=>removeShipment(si)} style={{ background:'none',border:'none',cursor:'pointer',color:'#D32F2F',fontSize:16,padding:'0 4px' }}>🗑</button>}
              </div>
            ))}
            <div style={{ fontSize:13,fontWeight:600,textAlign:'right' }}>Total</div>
          </div>
          {order.items.map(item=>(
            <div key={item.id} style={{ display:'grid',gridTemplateColumns:`1fr repeat(${quantities.length},200px) 60px`,alignItems:'center',borderTop:'1px solid #F5F5F5',padding:'14px 0' }}>
              <div>
                <div style={{ fontSize:13,fontWeight:500,color:'rgba(0,0,0,0.8)',paddingRight:12 }}>{item.name}</div>
              </div>
              {quantities.map((qmap,si)=>(
                <div key={si} style={{ paddingLeft:12 }}>
                  <div style={{ fontSize:10.5,fontWeight:600,color:'rgba(0,0,0,0.45)',textTransform:'uppercase',letterSpacing:'0.4px',marginBottom:4 }}>Quantity</div>
                  <div style={{ display:'flex',alignItems:'center',border:`1px solid ${itemErrors[item.id]?'#EF5350':'#E0E0E0'}`,borderRadius:4,overflow:'hidden',width:140,background:itemErrors[item.id]?'#FFF5F5':'#fff' }}>
                    <input
                      type="text" inputMode="numeric"
                      value={qmap[item.id]||0}
                      onFocus={e=>e.target.select()}
                      onChange={e=>setQty(si,item.id,e.target.value)}
                      style={{ flex:1,minWidth:0,width:'100%',padding:'6px 10px',fontSize:13,border:'none',outline:'none',background:'transparent',color:itemErrors[item.id]?'#C62828':'inherit' }} />
                    <div style={{ display:'flex',flexDirection:'column',borderLeft:'1px solid #E0E0E0' }}>
                      <button onClick={()=>changeQty(si,item.id,1)} style={{ background:'none',border:'none',cursor:'pointer',padding:'2px 8px',fontSize:12,color:'rgba(0,0,0,0.5)',lineHeight:1.2 }}>▲</button>
                      <button onClick={()=>changeQty(si,item.id,-1)} style={{ background:'none',border:'none',cursor:'pointer',padding:'2px 8px',fontSize:12,color:'rgba(0,0,0,0.5)',lineHeight:1.2 }}>▼</button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize:13,color:'rgba(0,0,0,0.5)',textAlign:'right' }}>of {item.qty}</div>
            </div>
          ))}
          <div style={{ display:'grid',gridTemplateColumns:`1fr repeat(${quantities.length},200px) 60px`,alignItems:'center',borderTop:'2px solid #F0F0F0',paddingTop:12,marginTop:4 }}>
            <div style={{ fontSize:13,fontWeight:600 }}>Weight (lb)</div>
            {quantities.map((_,si)=><div key={si} style={{ paddingLeft:12,fontSize:13,color:'rgba(0,0,0,0.6)' }}>{weightFor(si).toFixed(1)}</div>)}
            <div style={{ fontSize:13,color:'rgba(0,0,0,0.5)',textAlign:'right' }}>{order.items.reduce((s,i)=>s+i.weight*i.qty,0).toFixed(1)}</div>
          </div>
        </div>
        {hasError && (
          <div style={{ padding:'12px 24px 0' }}>
            <Alert severity="error" variant="standard">Quantities must add up to total</Alert>
          </div>
        )}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderTop:'1px solid #F0F0F0' }}>
          <button onClick={()=>setQuantities(initQty())} style={{ background:'none',border:'none',cursor:'pointer',fontSize:14,fontWeight:500,color:'#1976D2' }}>Reset</button>
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={addDisabled?undefined:addShipment} disabled={addDisabled}
              title={addDisabled?'A single item with quantity 1 cannot be split across shipments':undefined}
              style={{ padding:'9px 20px',fontSize:13,fontWeight:600,background:'transparent',color:addDisabled?'rgba(0,0,0,0.3)':'#1976D2',border:`1px solid ${addDisabled?'#E0E0E0':'#1976D2'}`,borderRadius:6,cursor:addDisabled?'not-allowed':'pointer' }}>Add shipment</button>
            <button onClick={handleSave} disabled={hasError}
              title={hasError?'Quantities must add up to total':undefined}
              style={{ padding:'9px 24px',fontSize:13,fontWeight:600,background:hasError?'#BBDEFB':'#1976D2',color:'#fff',border:'none',borderRadius:6,cursor:hasError?'not-allowed':'pointer' }}>{isEditing ? 'Save changes' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Request Refund Modal ──────────────────────────────────────────────────── */
function RefundModal({ count, onConfirm, onClose }) {
  const n = count || 1;
  const cta = `Request ${n} refund${n>1?'s':''}`;
  const bullets = [
    <>Refunds may take up to <strong style={{ fontWeight:600 }}>14 days</strong> to credit into your account. <span style={{ color:'#1976D2', textDecoration:'underline', cursor:'pointer' }}>Learn more</span></>,
    <>Any insurance purchased with a carrier or through Shippo Total Protection will be voided and refunded to you.</>,
    <>You will <strong style={{ fontWeight:600 }}>immediately be unable to use labels</strong> for postage.</>,
    <>Refunds cannot be undone, but you can create a new label by buying a new label.</>,
  ];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:'#fff', borderRadius:12, width:560, maxWidth:'92vw', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px 14px' }}>
          <span style={{ fontSize:18, fontWeight:700 }}>Request {n>1?'refunds':'refund'}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'rgba(0,0,0,0.4)', lineHeight:1 }}>×</button>
        </div>
        <div style={{ height:1, background:'#F0F0F0' }} />
        {/* Body */}
        <div style={{ padding:'18px 24px 22px' }}>
          <ul style={{ margin:0, paddingLeft:20, display:'flex', flexDirection:'column', gap:14 }}>
            {bullets.map((b,i)=>(
              <li key={i} style={{ fontSize:14, lineHeight:1.55, color:'rgba(0,0,0,0.75)' }}>{b}</li>
            ))}
          </ul>
        </div>
        <div style={{ height:1, background:'#F0F0F0' }} />
        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px' }}>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:'rgba(0,0,0,0.7)' }}>Cancel</button>
          <button onClick={onConfirm}
            style={{ padding:'10px 22px', fontSize:14, fontWeight:700, background:'#C62828', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background='#B71C1C'}
            onMouseLeave={e=>e.currentTarget.style.background='#C62828'}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MoreActionsMenu ─────────────────────────────────────────────────────── */
function MoreActionsMenu({ order, subOrder, onOpenPanel, onOpenSplit, onRequestRefund, isFulfilled, isRefunded }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const orderIsSplit = !!(order.subOrders && order.subOrders.length > 1);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const items = [
    { label: 'View order',          icon: '👁',  action: () => { onOpenPanel(); setOpen(false); } },
    !subOrder && { label: orderIsSplit ? 'Edit split' : 'Split order', icon: orderIsSplit ? '✏' : '✂', action: () => { onOpenSplit(); setOpen(false); } },
    { label: 'Download packing slip', icon: '📄', action: () => setOpen(false) },
    isFulfilled && { label: 'Download shipping label', icon: '🏷', action: () => setOpen(false) },
    isFulfilled && !isRefunded && { label: 'Request a refund', icon: '↩', danger: true, action: () => { onRequestRefund && onRequestRefund(); setOpen(false); } },
  ].filter(Boolean);

  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button
        onClick={e=>{ e.stopPropagation(); setOpen(o=>!o); }}
        style={{ width:28, height:28, borderRadius:4, border:'1px solid #E0E0E0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(0,0,0,0.55)', fontSize:16, lineHeight:1, flexShrink:0 }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='#1976D2'; e.currentTarget.style.color='#1976D2'; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='#E0E0E0'; e.currentTarget.style.color='rgba(0,0,0,0.55)'; }}>
        ⋮
      </button>
      {open && (
        <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:'#fff', border:'1px solid #E5E5E5', borderRadius:8, boxShadow:'0 8px 24px rgba(0,0,0,0.13)', zIndex:600, minWidth:200, overflow:'hidden' }}>
          {items.map((item, i) => (
            <button key={i} onClick={e=>{ e.stopPropagation(); item.action(); }}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 16px', fontSize:13, fontWeight:400, color:item.danger?'#C62828':'rgba(0,0,0,0.78)', background:'none', border:'none', cursor:'pointer', textAlign:'left', borderBottom: i < items.length-1 ? '1px solid #F5F5F5' : 'none' }}
              onMouseEnter={e=>e.currentTarget.style.background=item.danger?'#FEECEC':'#F5F5F5'}
              onMouseLeave={e=>e.currentTarget.style.background='none'}>
              <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/* ── ItemsCell — max 3 lines + "+N more" tooltip for overflow ─────────────── */
function ItemsCell({ items }) {
  const [hover, setHover] = useState(false);
  const visible  = items.slice(0, 3);
  const overflow = items.slice(3);
  return (
    <div>
      {visible.map((item) => (
        <div key={item.id} style={{ fontSize:12, color:'rgba(0,0,0,0.65)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.6 }}>
          <span style={{ fontWeight:500, color:'rgba(0,0,0,0.4)', marginRight:3 }}>{item.qty}×</span>
          {item.name}
        </div>
      ))}
      {overflow.length > 0 && (
        <span style={{ position:'relative', display:'inline-flex', marginTop:2 }}
          onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
          <span style={{ fontSize:10.5, fontWeight:600, color:'#1976D2', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:9999, padding:'1px 8px', cursor:'default' }}>
            +{overflow.length} more
          </span>
          {hover && (
            <div style={{ position:'absolute', left:0, top:'calc(100% + 5px)', background:'#323232', color:'#fff', fontSize:11.5, lineHeight:1.7, padding:'8px 12px', borderRadius:6, zIndex:300, boxShadow:'0 4px 14px rgba(0,0,0,0.2)', pointerEvents:'none', whiteSpace:'nowrap', minWidth:180 }}>
              {overflow.map((item, i) => (
                <div key={i}><span style={{ opacity:0.6, marginRight:4 }}>{item.qty}×</span>{item.name}</div>
              ))}
              <div style={{ position:'absolute', top:-4, left:10, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderBottom:'4px solid #323232' }} />
            </div>
          )}
        </span>
      )}
    </div>
  );
}

/* ── TrackingCell — carrier name + truncated number, copy icon on hover ──── */
function TrackingCell({ shipment }) {
  const [hover,  setHover]  = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy(e) {
    e.stopPropagation();
    navigator.clipboard?.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(()=>setCopied(false), 1500);
  }

  if (!shipment?.carrier) return <span style={{ fontSize:11, color:'rgba(0,0,0,0.28)' }}>—</span>;

  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div style={{ fontSize:12, fontWeight:500, color:'rgba(0,0,0,0.7)', marginBottom:2 }}>
        {shipment.carrier}
        <span style={{ fontWeight:400, color:'rgba(0,0,0,0.4)', marginLeft:4, fontSize:11 }}>{shipment.service}</span>
      </div>
      {shipment.trackingNumber && (
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:11, fontFamily:'monospace', color:'rgba(0,0,0,0.5)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>
            {shipment.trackingNumber.substring(0, 16)}…
          </span>
          {hover && (
            <button onClick={handleCopy}
              style={{ flexShrink:0, background:'none', border:'none', cursor:'pointer', padding:'1px 3px', fontSize:12, color:copied?'#2E7D32':'rgba(0,0,0,0.4)', lineHeight:1, borderRadius:3 }}
              title={copied?'Copied!':'Copy tracking number'}>
              {copied ? '✓' : '⧉'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DestinationCell({ order }) {
  const [hover, setHover] = useState(false);
  const err = order.addressError;
  return (
    <div>
      <div style={{ fontSize:11, color:'rgba(0,0,0,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{order.buyer}</div>
      {/* Address line — icon + text inline */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:6, position:'relative' }}>
        {err && (
          <span
            onMouseEnter={()=>setHover(true)}
            onMouseLeave={()=>setHover(false)}
            style={{ flexShrink:0, marginTop:1, position:'relative', cursor:'default' }}>
            {/* Red circle icon */}
            <span style={{ width:18, height:18, borderRadius:'50%', background:'#D32F2F', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#fff', fontSize:11, fontWeight:700, lineHeight:1 }}>!</span>
            </span>
            {/* Tooltip — appears below the icon */}
            {hover && (
              <div style={{ position:'absolute', left:0, top:'calc(100% + 6px)', background:'#fff', color:'rgba(0,0,0,0.75)', fontSize:11.5, lineHeight:1.5, padding:'8px 12px', borderRadius:6, zIndex:500, boxShadow:'0 4px 16px rgba(0,0,0,0.18)', pointerEvents:'none', width:280, whiteSpace:'normal', border:'1px solid #E0E0E0' }}>
                {err}
                <div style={{ position:'absolute', top:-5, left:6, width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderBottom:'5px solid #fff', filter:'drop-shadow(0 -1px 0 #E0E0E0)' }} />
              </div>
            )}
          </span>
        )}
        <div>
          <div style={{ fontSize:12, color:'rgba(0,0,0,0.7)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {order.shipTo.addr}
          </div>
          <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', whiteSpace:'nowrap' }}>
            {order.shipTo.city}, {order.shipTo.state} {order.shipTo.zip}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar nav ───────────────────────────────────────────────────────────── */
function Sidebar() {
  const items = [
    { icon:'⊞',  label:'Dashboard' },
    { icon:'📦', label:'All Products',    children:['Product Change Log','Custom Attributes'] },
    { icon:'🏪', label:'Sales Channels',  children:['Carolina Coast Cards','eBay','Amazon'] },
    { icon:'☰',  label:'Automated Listings' },
    { icon:'🛒', label:'Orders',          active:true, children:['Shipments','Sales Reports'] },
    { icon:'📄', label:'Templates & Rules' },
    { icon:'⭐', label:'Subscription Plan', children:['Billing'] },
  ];
  return (
    <div style={{ width:188,flexShrink:0,background:'#1a2638',display:'flex',flexDirection:'column',height:'100%',overflow:'hidden' }}>
      <div style={{ padding:'14px 14px 12px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:10 }}>
        <div style={{ width:30,height:30,borderRadius:6,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden' }}>
          <img src="/static/images/markets/litcommerce.png" alt="LitCommerce" style={{ width:'100%',height:'100%',objectFit:'contain' }} />
        </div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:'#fff',letterSpacing:'-0.3px',lineHeight:1.2 }}>LitCommerce</div>
          <div style={{ fontSize:10.5,color:'rgba(255,255,255,0.45)',marginTop:1 }}>Carolina Coast Cards</div>
        </div>
      </div>
      <nav style={{ flex:1,overflowY:'auto',padding:'6px 0' }}>
        {items.map(item=>(
          <div key={item.label}>
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 14px',cursor:'pointer',color:item.active?'#fff':'rgba(255,255,255,0.6)',fontSize:13,fontWeight:item.active?500:400,background:item.active?'rgba(255,255,255,0.07)':'transparent',borderLeft:item.active?'3px solid #1976D2':'3px solid transparent' }}>
              <span style={{ fontSize:14 }}>{item.icon}</span>{item.label}
            </div>
            {item.active && item.children && item.children.map(c=>(
              <div key={c} style={{ padding:'5px 14px 5px 42px',fontSize:12,color:c==='Shipments'?'#64B5F6':'rgba(255,255,255,0.42)',cursor:'pointer',fontWeight:c==='Shipments'?500:400,background:c==='Shipments'?'rgba(100,181,246,0.08)':'transparent' }}>{c}</div>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.07)',fontSize:12,color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:8,cursor:'pointer' }}>❓ Help & Request</div>
    </div>
  );
}

/* ── AddressesSection ──────────────────────────────────────────────────────── */

/* 
  Shippo gives back EITHER:
    - errors   → { field: 'message' }  (address error case)
    - suggestion → { ...corrected fields }  (unvalidated / suggestion case)
  Never both at the same time.
*/
const MOCK_SHIPPO = {
  sender:    { type: null },   /* no issues */
  recipient: {
    type: 'suggestion',        /* 'error' | 'suggestion' | null */
    errors: { street: 'Invalid street number — could not be verified by USPS.' },
    suggestion: { name:'Luis Orta Jr', company:'', email:'', phone:'', street:'500 Ocean Blvd Apt 4B', street2:'', city:'Miami Beach', state:'FL', zip:'33139', country:'United States', residential:true },
  },
};

const COUNTRIES = ['United States','Canada','United Kingdom','Australia','Germany','France','Japan','Mexico','Other'];

/* ── Edit form ── */
function AddressEditForm({ which, draft, setDraft, fieldErrors, suggestion, onUseSuggestion, onSave, onCancel }) {
  function fld(field, label, required, type='text') {
    const err = fieldErrors?.[field];
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <label style={{ fontSize:11, fontWeight:600, color: err ? '#C62828' : 'rgba(0,0,0,0.55)', letterSpacing:'0.1px' }}>
          {label}{required && <span style={{ color:'#C62828', marginLeft:1 }}>*</span>}
        </label>
        <input
          type={type}
          value={draft[field]||''}
          onChange={e=>setDraft(d=>({...d,[field]:e.target.value}))}
          style={{ padding:'7px 10px', fontSize:13, width:'100%', border:`1.5px solid ${err?'#EF9A9A':'#D8D8D8'}`, borderRadius:5, fontFamily:'inherit', outline:'none', background: err?'#FFF8F8':'#fff', boxSizing:'border-box' }}
        />
        {/* Error message below field — NO tooltip */}
        {err && <span style={{ fontSize:11, color:'#C62828', marginTop:1 }}>{err}</span>}
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
      {/* Contact Info */}
      <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.6px' }}>Contact Info</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {fld('name',    'Name',    true)}
        {fld('company', 'Company', false)}
      </div>
      {which === 'sender' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {fld('email', 'Email', true, 'email')}
          {fld('phone', 'Phone', true, 'tel')}
        </div>
      )}

      {/* Address */}
      <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', marginTop:2 }}>Address</div>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.55)' }}>Country<span style={{ color:'#C62828', marginLeft:1 }}>*</span></label>
        <select value={draft.country||'United States'} onChange={e=>setDraft(d=>({...d,country:e.target.value}))}
          style={{ padding:'7px 10px', fontSize:13, border:'1.5px solid #D8D8D8', borderRadius:5, background:'#fff', fontFamily:'inherit', width:'55%' }}>
          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {fld('street',  'Street',          true)}
        {fld('street2', 'Street (line 2)', false)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {fld('city',  'City',  true)}
        {fld('state', 'State', true)}
      </div>
      {fld('zip', 'Postal Code/Zip', true)}

      {/* Residential — recipient only */}
      {which === 'recipient' && (
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'rgba(0,0,0,0.7)', marginTop:2 }}>
          <input type="checkbox" checked={!!draft.residential} onChange={e=>setDraft(d=>({...d,residential:e.target.checked}))} style={{ width:15, height:15, accentColor:'#1976D2' }} />
          This is a residential address
        </label>
      )}

      {/* Shippo suggestion shown inline in edit state */}
      {suggestion && (
        <div style={{ border:'1px solid #FFE082', borderRadius:6, overflow:'hidden', marginTop:4 }}>
          <div style={{ background:'#FFFDE7', padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:13 }}>⚠</span>
            <span style={{ fontSize:12, fontWeight:600, color:'#7B5800' }}>Shippo suggested address</span>
          </div>
          <div style={{ padding:'10px 12px', background:'#FAFAFA', borderTop:'1px solid #FFE082' }}>
            {[suggestion.name, suggestion.street, `${suggestion.city}, ${suggestion.state} ${suggestion.zip}`]
              .map((l,j)=><div key={j} style={{ fontSize:12, color:'rgba(0,0,0,0.75)', lineHeight:1.65 }}>{l}</div>)}
            <button onClick={onUseSuggestion}
              style={{ marginTop:8, padding:'5px 14px', fontSize:12, fontWeight:600, background:'#1976D2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}>
              Use this address
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
        <button onClick={onCancel} style={{ padding:'7px 14px', fontSize:12, fontWeight:500, background:'transparent', border:'1px solid #E0E0E0', borderRadius:5, cursor:'pointer', color:'rgba(0,0,0,0.55)' }}>Cancel</button>
        <button onClick={onSave}   style={{ padding:'7px 16px', fontSize:12, fontWeight:700, background:'#1976D2', border:'none', borderRadius:5, cursor:'pointer', color:'#fff' }}>Save</button>
      </div>
    </div>
  );
}

/* ── Address block (one of: Recipient / Return) ── */
function AddressBlock({ which, label, addr, isLast, shippo, onChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saved,     setSaved]     = useState({ ...addr });
  const [dismissed, setDismissed] = useState(false);
  const [hovering,  setHovering]  = useState(false);

  const shippoType = shippo?.type || null;
  const activeType = dismissed ? null : shippoType;

  const lines = [
    saved.name, saved.company, saved.street, saved.street2,
    `${saved.city}, ${saved.state} ${saved.zip}`, saved.country,
  ].filter(Boolean);

  function handleSave(draft, _extra) {
    const required = ['name','street','city','state','zip'];
    if (required.some(f=>!(draft[f]||'').trim())) return;
    setSaved({ ...draft });
    setModalOpen(false);
    onChange && onChange({ ...draft });
  }

  function handleUseSuggestion() {
    setSaved({ ...shippo.suggestion });
    setDismissed(true);
    setModalOpen(false);
    onChange && onChange({ ...shippo.suggestion });
  }

  const modalTitle = which === 'recipient' ? 'Edit Recipient Address' : 'Edit Return Address';

  return (
    <div style={{ paddingBottom:isLast?0:12, marginBottom:isLast?0:12, borderBottom:isLast?'none':'1px solid #F0F0F0' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.55)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{label}</span>
          {activeType === 'error' && (
            <span style={{ position:'relative', display:'inline-flex', cursor:'default' }}
              onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
              <span style={{ fontSize:14, color:'#C62828', lineHeight:1 }}>⚠</span>
              {hovering && (
                <div style={{ position:'absolute', left:0, top:'calc(100% + 5px)', background:'#323232', color:'#fff', fontSize:11, lineHeight:1.5, padding:'7px 11px', borderRadius:5, zIndex:100, whiteSpace:'nowrap', boxShadow:'0 3px 10px rgba(0,0,0,0.2)', pointerEvents:'none', minWidth:200 }}>
                  {Object.values(shippo.errors).join(' ')}
                  <div style={{ position:'absolute', top:-4, left:8, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderBottom:'4px solid #323232' }} />
                </div>
              )}
            </span>
          )}
          {activeType === 'suggestion' && (
            <span style={{ position:'relative', display:'inline-flex', cursor:'default' }}
              onMouseEnter={()=>setHovering(true)} onMouseLeave={()=>setHovering(false)}>
              <span style={{ fontSize:14, color:'#ED6C02', lineHeight:1 }}>⚠</span>
              {hovering && (
                <div style={{ position:'absolute', left:0, top:'calc(100% + 5px)', background:'#323232', color:'#fff', fontSize:11, lineHeight:1.5, padding:'7px 11px', borderRadius:5, zIndex:100, whiteSpace:'nowrap', boxShadow:'0 3px 10px rgba(0,0,0,0.2)', pointerEvents:'none', maxWidth:260 }}>
                  Unvalidated address. Packages may be lost, delayed, or incur surcharges.
                  <div style={{ position:'absolute', top:-4, left:8, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderBottom:'4px solid #323232' }} />
                </div>
              )}
            </span>
          )}
        </div>
        <button onClick={()=>setModalOpen(true)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'3px 5px', color:'rgba(0,0,0,0.35)', fontSize:14, lineHeight:1, borderRadius:3 }}
          onMouseEnter={e=>e.currentTarget.style.color='#1976D2'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(0,0,0,0.35)'}
          title={`Edit ${label} address`}>
          ✏
        </button>
      </div>

      {/* Read-only display */}
      {lines.map((l,j)=><div key={j} style={{ fontSize:13, color:'rgba(0,0,0,0.72)', lineHeight:1.7 }}>{l}</div>)}
      {saved.residential && which==='recipient' && (
        <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
          🏠 Residential address
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AddressModal
          title={modalTitle}
          initial={saved}
          onSave={handleSave}
          onCancel={()=>setModalOpen(false)}
          extraCheckboxLabel={null}
          suggestion={activeType==='suggestion' ? shippo?.suggestion : null}
          onUseSuggestion={handleUseSuggestion}
          fieldErrors={activeType==='error' ? shippo?.errors : null}
          which={which}
        />
      )}
    </div>
  );
}

/* ── Saved Addresses (mock settings data) ────────────────────────────────── */
const MOCK_SAVED_ADDRESSES = [
  { id:'addr-1', name:'Carolina Coast Cards', company:'Carolina Coast Cards', email:'hello@carolinacoast.com', phone:'9041234567', street:'1551 Oak Lawn Ave', street2:'', city:'Dallas', state:'TX', zip:'75207-3619', country:'United States', isDefault:true },
  { id:'addr-2', name:'Warehouse North', company:'', email:'wh@carolinacoast.com', phone:'9042345678', street:'88 Industrial Pkwy', street2:'Suite 200', city:'Charlotte', state:'NC', zip:'28201', country:'United States', isDefault:false },
  { id:'addr-3', name:'Pop-up Store', company:'', email:'', phone:'', street:'14 Market St', street2:'', city:'Raleigh', state:'NC', zip:'27601', country:'United States', isDefault:false },
];

/* ── Address Edit Modal (shared for all address types) ───────────────────── */
function AddressModal({ title, initial, onSave, onCancel, extraCheckboxLabel, extraCheckboxKey, which, fieldErrors, suggestion, onUseSuggestion }) {
  const [draft, setDraft] = useState({ ...initial });
  const [extraChecked, setExtraChecked] = useState(false);

  function fld(field, label, required, type='text') {
    const err = fieldErrors?.[field];
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <label style={{ fontSize:11, fontWeight:600, color: err ? '#C62828' : 'rgba(0,0,0,0.55)' }}>
          {label}{required && <span style={{ color:'#C62828', marginLeft:1 }}>*</span>}
        </label>
        <input type={type} value={draft[field]||''} onChange={e=>setDraft(d=>({...d,[field]:e.target.value}))}
          style={{ padding:'7px 10px', fontSize:13, border:`1.5px solid ${err?'#EF9A9A':'#D8D8D8'}`, borderRadius:5, fontFamily:'inherit', outline:'none', background: err?'#FFF8F8':'#fff', width:'100%', boxSizing:'border-box' }} />
        {err && <span style={{ fontSize:11, color:'#C62828', marginTop:1 }}>{err}</span>}
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:10, width:560, maxWidth:'95vw', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.22)' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #F0F0F0' }}>
          <span style={{ fontSize:16, fontWeight:700 }}>{title}</span>
          <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'rgba(0,0,0,0.4)', lineHeight:1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.6px' }}>Contact Info</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {fld('name',    'Name',    true)}
            {fld('company', 'Company', false)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {fld('email', 'Email', false, 'email')}
            {fld('phone', 'Phone', false, 'tel')}
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', marginTop:4 }}>Address</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.55)' }}>Country<span style={{ color:'#C62828', marginLeft:1 }}>*</span></label>
            <select value={draft.country||'United States'} onChange={e=>setDraft(d=>({...d,country:e.target.value}))}
              style={{ padding:'7px 10px', fontSize:13, border:'1.5px solid #D8D8D8', borderRadius:5, background:'#fff', fontFamily:'inherit', width:'60%' }}>
              {COUNTRIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {fld('street',  'Street *',         true)}
            {fld('street2', 'Street (line 2)',   false)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px', gap:10 }}>
            {fld('city',  'City *',           true)}
            {fld('state', 'State *',          true)}
            {fld('zip',   'Postal Code/Zip *',true)}
          </div>

          {/* Residential checkbox for recipient */}
          {which === 'recipient' && (
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'rgba(0,0,0,0.7)' }}>
              <input type="checkbox" checked={!!draft.residential} onChange={e=>setDraft(d=>({...d,residential:e.target.checked}))} style={{ width:14, height:14, accentColor:'#1976D2' }} />
              This is a residential address
            </label>
          )}

          {/* Shippo suggestion card */}
          {suggestion && (
            <div style={{ border:'1px solid #FFE082', borderRadius:6, overflow:'hidden' }}>
              <div style={{ background:'#FFFDE7', padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:13 }}>⚠</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#7B5800' }}>Shippo suggested address</span>
              </div>
              <div style={{ padding:'10px 12px', background:'#FAFAFA', borderTop:'1px solid #FFE082' }}>
                {[suggestion.name, suggestion.street, `${suggestion.city}, ${suggestion.state} ${suggestion.zip}`]
                  .map((l,j)=><div key={j} style={{ fontSize:12, color:'rgba(0,0,0,0.75)', lineHeight:1.65 }}>{l}</div>)}
                <button onClick={onUseSuggestion}
                  style={{ marginTop:8, padding:'5px 14px', fontSize:12, fontWeight:600, background:'#1976D2', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }}>
                  Use this address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid #F0F0F0' }}>
          {extraCheckboxLabel && (
            <label style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', fontSize:13, color:'rgba(0,0,0,0.7)', marginBottom:14 }}>
              <span style={{ width:20, height:20, borderRadius:4, background: extraChecked ? '#1976D2' : '#fff', border:`2px solid ${extraChecked ? '#1976D2' : '#BDBDBD'}`, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}
                onClick={()=>setExtraChecked(c=>!c)}>
                {extraChecked && <span style={{ color:'#fff', fontSize:13, lineHeight:1 }}>✓</span>}
              </span>
              {extraCheckboxLabel}
            </label>
          )}
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button onClick={onCancel}
              style={{ padding:'8px 18px', fontSize:13, fontWeight:500, background:'transparent', border:'1px solid #E0E0E0', borderRadius:5, cursor:'pointer', color:'rgba(0,0,0,0.55)' }}>
              Cancel
            </button>
            <button onClick={()=>onSave(draft, extraChecked)}
              style={{ padding:'8px 22px', fontSize:13, fontWeight:700, background:'#1976D2', color:'#fff', border:'none', borderRadius:5, cursor:'pointer' }}>
              Update Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sender Address Selector ──────────────────────────────────────────────── */
function SenderAddressSelector({ onSelect }) {
  const [addresses, setAddresses] = useState(MOCK_SAVED_ADDRESSES);
  const [selectedId, setSelectedId] = useState(MOCK_SAVED_ADDRESSES.find(a=>a.isDefault)?.id || MOCK_SAVED_ADDRESSES[0]?.id);
  const [editingAddr, setEditingAddr] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const selectedAddr = addresses.find(a=>a.id===selectedId);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(()=>{
    const addr = addresses.find(a=>a.id===selectedId);
    if(addr) onSelectRef.current(addr);
  }, [selectedId, addresses]);

  function handleEditSave(draft, applyToSaved) {
    if (applyToSaved) {
      setAddresses(prev => prev.map(a => a.id===editingAddr.id ? {...a,...draft} : a));
    }
    setEditingAddr(null);
  }

  function handleNewSave(draft, saveToBook) {
    if (saveToBook) {
      const newAddr = { ...draft, id:'addr-'+Date.now(), isDefault:false };
      setAddresses(prev=>[...prev, newAddr]);
      setSelectedId(newAddr.id);
    } else {
      /* Use inline only — create a temporary non-persisted entry */
      const tempAddr = { ...draft, id:'temp-'+Date.now(), isDefault:false, _temp:true };
      setAddresses(prev=>[...prev.filter(a=>!a._temp), tempAddr]);
      setSelectedId(tempAddr.id);
    }
    setShowNewModal(false);
  }


  return (
    <div>
      {/* Dropdown row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ flex:1, position:'relative', border:'1.5px solid #D8D8D8', borderRadius:6, background:'#fff', display:'flex', alignItems:'center', overflow:'hidden' }}>
          <select
            value={selectedId}
            onChange={e=>setSelectedId(e.target.value)}
            style={{ flex:1, padding:'8px 32px 8px 12px', fontSize:13, fontWeight:500, border:'none', outline:'none', background:'transparent', fontFamily:'inherit', color:'rgba(0,0,0,0.85)', cursor:'pointer', appearance:'none' }}>
            {addresses.map(addr=>(
              <option key={addr.id} value={addr.id}>
                {addr.name}{addr.isDefault ? ' (Default)' : ''}{addr._temp ? ' (One-time)' : ''}
              </option>
            ))}
          </select>
          <span style={{ position:'absolute', right:10, pointerEvents:'none', fontSize:13, color:'rgba(0,0,0,0.4)' }}>▾</span>
        </div>
        {/* Edit pencil for selected address */}
        <button
          onClick={()=>setEditingAddr(selectedAddr)}
          style={{ flexShrink:0, background:'none', border:'1px solid #E0E0E0', cursor:'pointer', fontSize:14, color:'rgba(0,0,0,0.4)', padding:'7px 10px', borderRadius:6, lineHeight:1 }}
          onMouseEnter={e=>{ e.currentTarget.style.color='#1976D2'; e.currentTarget.style.borderColor='#1976D2'; }}
          onMouseLeave={e=>{ e.currentTarget.style.color='rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor='#E0E0E0'; }}
          title="Edit address">
          ✏
        </button>
      </div>

      {/* Selected address preview */}
      {selectedAddr && (
        <div style={{ padding:'10px 12px', background:'#F8F8F8', borderRadius:6, marginBottom:10, fontSize:12.5, lineHeight:1.7, color:'rgba(0,0,0,0.65)' }}>
          {selectedAddr.isDefault && (
            <span style={{ fontSize:10, fontWeight:600, color:'#1976D2', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:9999, padding:'1px 7px', marginRight:6, verticalAlign:'middle' }}>Default</span>
          )}
          <span style={{ fontWeight:600, color:'rgba(0,0,0,0.82)' }}>{selectedAddr.name}</span>
          {selectedAddr.company && selectedAddr.company !== selectedAddr.name && (
            <span style={{ color:'rgba(0,0,0,0.5)', marginLeft:4 }}>· {selectedAddr.company}</span>
          )}
          <br />
          {[selectedAddr.email, selectedAddr.phone].filter(Boolean).join(' | ')}
          {([selectedAddr.email, selectedAddr.phone].filter(Boolean).length > 0) && <br />}
          {selectedAddr.street}{selectedAddr.street2 ? `, ${selectedAddr.street2}` : ''}<br />
          {selectedAddr.city}, {selectedAddr.state} {selectedAddr.zip}
        </div>
      )}

      {/* Use a new address button */}
      <button onClick={()=>setShowNewModal(true)}
        style={{ width:'100%', padding:'8px 0', fontSize:12.5, fontWeight:500, color:'#1976D2', background:'transparent', border:'1.5px dashed #BBDEFB', borderRadius:6, cursor:'pointer' }}>
        + Use a new address
      </button>

      {/* Edit existing address modal */}
      {editingAddr && (
        <AddressModal
          title="Edit Sender Address"
          initial={editingAddr}
          onSave={handleEditSave}
          onCancel={()=>setEditingAddr(null)}
          extraCheckboxLabel="Apply changes to the saved address"
          extraCheckboxKey="applyToSaved"
        />
      )}

      {/* New address modal */}
      {showNewModal && (
        <AddressModal
          title="Add a New Sender Address"
          initial={{ name:'', company:'', email:'', phone:'', street:'', street2:'', city:'', state:'', zip:'', country:'United States' }}
          onSave={handleNewSave}
          onCancel={()=>setShowNewModal(false)}
          extraCheckboxLabel="Save to address book"
          extraCheckboxKey="saveToBook"
        />
      )}
    </div>
  );
}

function AddressesSection({ order, addrEdits, setAddrEdits, error, onRecipientChange }) {
  const [useReturnAsSender, setUseReturnAsSender] = useState(true);
  const [returnAddr, setReturnAddr] = useState({ ...addrEdits.sender });
  const [editingReturn, setEditingReturn] = useState(false);
  const [returnDraft, setReturnDraft] = useState({ ...addrEdits.sender });

  const recipientRight = `To: ${addrEdits.recipient.city}, ${addrEdits.recipient.country||order.shipTo.country} ${addrEdits.recipient.zip}`;
  const returnLines = [returnAddr.name, returnAddr.addr||returnAddr.street, `${returnAddr.city}, ${returnAddr.state} ${returnAddr.zip}`].filter(Boolean);

  function saveReturn() { setReturnAddr({ ...returnDraft }); setEditingReturn(false); }

  const inlineInput = (field, label, style={}) => (
    <div style={{ display:'flex', flexDirection:'column', gap:3, ...style }}>
      <label style={{ fontSize:10, fontWeight:600, color:'rgba(0,0,0,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</label>
      <input value={returnDraft[field]||''} onChange={e=>setReturnDraft(d=>({...d,[field]:e.target.value}))}
        style={{ padding:'6px 8px', fontSize:13, border:'1px solid #D0D0D0', borderRadius:4, fontFamily:'inherit', outline:'none', background:'#fff', width:'100%' }} />
    </div>
  );

  return (
    <SectionCard title="Addresses" right={recipientRight} error={error}>
      {/* Sender — card selector */}
      <div style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid #F0F0F0' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.55)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>Sender</div>
        <SenderAddressSelector onSelect={addr=>setAddrEdits(prev=>({...prev, sender:addr}))} />
      </div>

      {/* Return */}
      <div style={{ paddingBottom:12, marginBottom:12, borderBottom:'1px solid #F0F0F0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'rgba(0,0,0,0.55)', textTransform:'uppercase', letterSpacing:'0.4px' }}>Return</span>
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'rgba(0,0,0,0.7)', marginBottom: useReturnAsSender ? 0 : 10 }}>
          <input type="checkbox" checked={useReturnAsSender} onChange={e=>{
            setUseReturnAsSender(e.target.checked);
            if(!e.target.checked) setReturnAddr({...addrEdits.sender});
          }} style={{ width:14, height:14, accentColor:'#1976D2' }} />
          Use Sender as Return Address
        </label>
        {!useReturnAsSender && (
          <AddressBlock which="return" label="" addr={returnAddr} isLast={true} shippo={{ type:null }} />
        )}
      </div>

      <AddressBlock which="recipient" label="Recipient" addr={addrEdits.recipient} isLast={true} shippo={MOCK_SHIPPO.recipient}
        onChange={newAddr => {
          setAddrEdits(prev => ({ ...prev, recipient: { ...prev.recipient, ...newAddr } }));
          onRecipientChange && onRecipientChange(newAddr);
        }} />
    </SectionCard>
  );
}

/* ── CustomOptionsSection ──────────────────────────────────────────────────── */
const INCOTERMS = [
  { value:'DDU', label:'DDU (customs billed to recipient)' },
  { value:'DDP', label:'DDP (customs billed to sender)' },
  { value:'FCA', label:'FCA (free carrier)' },
];

const SHIPMENT_PURPOSES = [
  'Merchandise','Documents','Gift','Sample','Return merchandise','Humanitarian donation','Other',
];

const TAX_ID_TYPES = [
  { value:'',     label:'Tax ID type' },
  { value:'EIN',  label:'EIN' },
  { value:'IOSS', label:'IOSS' },
  { value:'VAT',  label:'VAT' },
  { value:'EORI', label:'EORI' },
  { value:'ABN',  label:'ABN' },
  { value:'Other',label:'Other' },
];

function FloatField({ label, value, onChange, required, placeholder }) {
  return (
    <div style={{ position:'relative', border:'1px solid #E0E0E0', borderRadius:6, padding:'10px 14px' }}>
      <label style={{ position:'absolute', top:-8, left:10, background:'#fff', padding:'0 4px', fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)' }}>
        {label}{required && <span style={{ color:'#C62828' }}>*</span>}
      </label>
      <input value={value||''} onChange={onChange} placeholder={placeholder||''}
        style={{ width:'100%', border:'none', outline:'none', fontSize:14, fontWeight:500, background:'transparent', fontFamily:'inherit', color:'rgba(0,0,0,0.85)' }} />
    </div>
  );
}

function FloatSelect({ label, value, onChange, options, required }) {
  return (
    <div style={{ position:'relative', border:'1px solid #E0E0E0', borderRadius:6, padding:'10px 14px' }}>
      <label style={{ position:'absolute', top:-8, left:10, background:'#fff', padding:'0 4px', fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)' }}>
        {label}{required && <span style={{ color:'#C62828' }}>*</span>}
      </label>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <select value={value} onChange={onChange}
          style={{ flex:1, border:'none', outline:'none', fontSize:14, fontWeight:500, background:'transparent', fontFamily:'inherit', color:'rgba(0,0,0,0.85)', cursor:'pointer', appearance:'none' }}>
          {options.map(o=>(
            <option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>
              {typeof o==='string'?o:o.label}
            </option>
          ))}
        </select>
        <span style={{ color:'rgba(0,0,0,0.4)', fontSize:13, pointerEvents:'none', flexShrink:0 }}>▾</span>
      </div>
    </div>
  );
}

function CustomOptionsSection({ customOpts, setCustomOpts, error }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function upd(patch) { setCustomOpts(o=>({...o,...patch})); }

  return (
    <SectionCard title="Customs options" error={error}>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {/* Exempt */}
        <label style={{ display:'flex', alignItems:'flex-start', gap:9, cursor:'pointer', fontSize:13, color:'rgba(0,0,0,0.75)', lineHeight:1.5, padding:'8px 10px', background:'#F8F8F8', borderRadius:6, border:'1px solid #EEEEEE' }}>
          <input type="checkbox" checked={!!customOpts.exempt} onChange={e=>upd({exempt:e.target.checked})}
            style={{ width:15, height:15, accentColor:'#1976D2', marginTop:2, flexShrink:0 }} />
          <span>This shipment qualifies to be exempt from customs.{' '}
            <span style={{ color:'#1976D2', cursor:'pointer', textDecoration:'underline' }}>Learn more</span>
          </span>
        </label>

        {!customOpts.exempt && (
          <>
            <FloatSelect label="Incoterm" value={customOpts.incoterm} onChange={e=>upd({incoterm:e.target.value})} options={INCOTERMS} required />

            <FloatSelect label="Purpose of shipment" value={customOpts.purposeOfShipment} onChange={e=>upd({purposeOfShipment:e.target.value})} options={SHIPMENT_PURPOSES} required />
            {customOpts.purposeOfShipment === 'Other' && (
              <FloatField label="Content explanation" value={customOpts.contentExplanation} onChange={e=>upd({contentExplanation:e.target.value})} placeholder="Describe shipment contents…" />
            )}

            <FloatField label="Name of authorized person" value={customOpts.authorizedPerson} onChange={e=>upd({authorizedPerson:e.target.value})} required />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <FloatSelect label="Tax ID type" value={customOpts.taxIdType||''} onChange={e=>upd({taxIdType:e.target.value})} options={TAX_ID_TYPES} />
              <FloatField label="Tax ID number" value={customOpts.taxIdNumber} onChange={e=>upd({taxIdNumber:e.target.value})} placeholder={customOpts.taxIdType||'—'} />
            </div>
            <p style={{ fontSize:11.5, color:'rgba(0,0,0,0.4)', lineHeight:1.6, margin:0 }}>
              Tax ID may be required if shipment contains goods purchased by the recipient.{' '}
              <span style={{ color:'#1976D2', cursor:'pointer', textDecoration:'underline' }}>Learn more</span>
            </p>

            {/* Advanced Options */}
            <div style={{ border:'1px solid #E0E0E0', borderRadius:6, overflow:'hidden' }}>
              <div onClick={()=>setAdvancedOpen(o=>!o)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', cursor:'pointer', background:'#FAFAFA' }}>
                <span style={{ fontSize:13, fontWeight:600, color:'rgba(0,0,0,0.65)' }}>Advanced options</span>
                <span style={{ fontSize:13, color:'rgba(0,0,0,0.4)' }}>{advancedOpen ? '▲' : '▽'}</span>
              </div>
              {advancedOpen && (
                <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid #EEEEEE' }}>
                  <FloatSelect label="Non-delivery handling" value={customOpts.nonDelivery||'Return to sender'}
                    onChange={e=>upd({nonDelivery:e.target.value})} options={['Return to sender','Abandon']} />
                  <div>
                    <FloatField label="EORI number" value={customOpts.eoriNumber} onChange={e=>upd({eoriNumber:e.target.value})} />
                    <p style={{ fontSize:11.5, color:'rgba(0,0,0,0.4)', lineHeight:1.5, margin:'6px 0 0' }}>
                      Required for shipments in and out of the EU / UK for business.{' '}
                      <span style={{ color:'#1976D2', cursor:'pointer', textDecoration:'underline' }}>Learn more</span>
                    </p>
                  </div>
                  <FloatField label="Exporter reference"  value={customOpts.exporterRef}  onChange={e=>upd({exporterRef:e.target.value})} />
                  <FloatField label="Importer reference"  value={customOpts.importerRef}  onChange={e=>upd({importerRef:e.target.value})} />
                  <FloatField label="Invoice number"      value={customOpts.invoiceNumber} onChange={e=>upd({invoiceNumber:e.target.value})} />
                  <FloatField label="License"             value={customOpts.license}       onChange={e=>upd({license:e.target.value})} />
                  <FloatField label="Certificate"         value={customOpts.certificate}   onChange={e=>upd({certificate:e.target.value})} />
                  <FloatField label="Notes"               value={customOpts.notes}         onChange={e=>upd({notes:e.target.value})} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

/* ── Collapsible Date Section ──────────────────────────────────────────────── */
function CollapsibleDateSection({ shipDate, setShipDate, showCal, setShowCal }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border:'1px solid #E5E5E5', borderRadius:8, marginBottom:12, overflow:'hidden' }}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', background:'#FAFAFA', borderBottom: open ? '1px solid #EEEEEE' : 'none', cursor:'pointer', userSelect:'none' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(0,0,0,0.75)' }}>Shipment Date</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div onClick={e=>{ e.stopPropagation(); if(!open) setOpen(true); setShowCal(c=>!c); }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', border: showCal ? '2px solid #1976D2' : '1px solid #E0E0E0', borderRadius:6, cursor:'pointer', background:'#fff' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#1976D2', fontFamily:'monospace' }}>{shipDate}</span>
            <span style={{ fontSize:14 }}>📅</span>
          </div>
          <span style={{ fontSize:11, color:'rgba(0,0,0,0.35)', lineHeight:1 }}>{open ? '▲' : '▽'}</span>
        </div>
      </div>
      {open && showCal && (
        <CalendarPicker value={shipDate} onChange={d=>{ setShipDate(d); setShowCal(false); }} />
      )}
    </div>
  );
}

/* ── Collapsible Rates Section ─────────────────────────────────────────────── */
function CollapsibleRatesSection({ addrOk, pkgOk, missingReasons, selectedRate, setSelectedRate, inputsKey }) {
  const [open,      setOpen]      = useState(true);
  const [status,    setStatus]    = useState('idle');   // 'idle' | 'loading' | 'loaded' | 'stale'
  const [loadedKey, setLoadedKey] = useState(null);     // inputsKey snapshot at load time

  /* Detect upstream changes AFTER rates were loaded */
  useEffect(() => {
    if (status === 'loaded' && loadedKey !== null && inputsKey !== loadedKey) {
      setStatus('stale');
    }
  }, [inputsKey, status, loadedKey]);

  function handleGetRates() {
    if (!addrOk || !pkgOk) return; /* guard — button disabled but safety check */
    setStatus('loading');
    setSelectedRate(null);
    setTimeout(() => {
      setStatus('loaded');
      setLoadedKey(inputsKey);
    }, 1400);
  }

  function handleReload() {
    setStatus('loading');
    setSelectedRate(null);
    setTimeout(() => {
      setStatus('loaded');
      setLoadedKey(inputsKey);
    }, 1400);
  }

  const canFetch = addrOk && pkgOk;

  return (
    <div style={{ border:'1px solid #E5E5E5', borderRadius:8, marginBottom:12, overflow:'hidden' }}>
      {/* Header */}
      <div onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', background:'#FAFAFA', borderBottom: open ? '1px solid #EEEEEE' : 'none', cursor:'pointer', userSelect:'none' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(0,0,0,0.75)' }}>Carrier Rates</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {selectedRate && status === 'loaded' && (
            <span style={{ fontSize:11, color:'#1976D2', fontWeight:600 }}>${selectedRate.price.toFixed(2)}</span>
          )}
          {status === 'stale' && (
            <span style={{ fontSize:10.5, color:'#ED6C02', fontWeight:500 }}>Outdated</span>
          )}
          <span style={{ fontSize:11, color:'rgba(0,0,0,0.35)', lineHeight:1 }}>{open ? '▲' : '▽'}</span>
        </div>
      </div>

      {open && (
        <div>
          {/* ── IDLE: not yet fetched ── */}
          {status === 'idle' && (
            <div style={{ padding:'16px 14px' }}>
              {!canFetch ? (
                /* Missing info */
                <>
                  <div style={{ fontSize:13, color:'rgba(0,0,0,0.45)', marginBottom:10 }}>
                    Fill in the required information to get shipping rates.
                  </div>
                  {missingReasons.map(r => (
                    <div key={r} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'rgba(0,0,0,0.4)', marginBottom:4 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'rgba(0,0,0,0.3)', flexShrink:0, display:'inline-block' }} />
                      {r}
                    </div>
                  ))}
                  <button disabled
                    style={{ marginTop:12, width:'100%', padding:'9px 0', fontSize:13, fontWeight:600, background:'#E0E0E0', color:'rgba(0,0,0,0.38)', border:'none', borderRadius:6, cursor:'not-allowed' }}>
                    Get Rates
                  </button>
                </>
              ) : (
                /* Ready to fetch */
                <>
                  <div style={{ fontSize:13, color:'rgba(0,0,0,0.5)', marginBottom:12 }}>
                    All required info is filled. Click to fetch carrier rates.
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); handleGetRates(); }}
                    style={{ width:'100%', padding:'9px 0', fontSize:13, fontWeight:600, background:'#1976D2', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>
                    Get Rates
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── LOADING ── */}
          {status === 'loading' && (
            <div style={{ padding:'24px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:'rgba(0,0,0,0.45)' }}>
              <div style={{ width:26, height:26, border:'3px solid #E0E0E0', borderTop:'3px solid #1976D2', borderRadius:'50%', animation:'lc-spin 0.8s linear infinite' }} />
              <span style={{ fontSize:12 }}>Fetching rates…</span>
            </div>
          )}

          {/* ── STALE: inputs changed after load ── */}
          {status === 'stale' && (
            <div style={{ padding:'14px' }}>
              <div style={{ padding:'10px 12px', background:'#FFF3E0', border:'1px solid #FFE0B2', borderRadius:6, display:'flex', alignItems:'flex-start', gap:8, marginBottom:12 }}>
                <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>⚠</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#E65100', marginBottom:2 }}>Rates are outdated</div>
                  <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.55)', lineHeight:1.5 }}>
                    Some information above has changed. Reload to get accurate rates for the current package and address.
                  </div>
                </div>
              </div>
              <button onClick={e=>{ e.stopPropagation(); handleReload(); }}
                style={{ width:'100%', padding:'9px 0', fontSize:13, fontWeight:600, background:'#1976D2', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                ↻ Reload Rates
              </button>
            </div>
          )}

          {/* ── LOADED: show rate list ── */}
          {status === 'loaded' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px 6px', borderBottom:'1px solid #F5F5F5' }}>
                <span style={{ fontSize:11, color:'rgba(0,0,0,0.4)' }}>Select a carrier rate</span>
                <button onClick={e=>{ e.stopPropagation(); handleReload(); }}
                  style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#1976D2', fontWeight:500, display:'flex', alignItems:'center', gap:4, padding:0 }}>
                  ↻ Reload
                </button>
              </div>
              {CARRIER_RATES.map((rate, i) => {
                const active = selectedRate?.id === rate.id;
                return (
                  <div key={rate.id} onClick={()=>setSelectedRate(active ? null : rate)}
                    style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px', cursor:'pointer', background:active?'#F0FFF4':'#fff', borderBottom:i<CARRIER_RATES.length-1?'1px solid #F8F8F8':'none', borderLeft:active?'3px solid #1976D2':'3px solid transparent' }}>
                    <input type="radio" readOnly checked={active} style={{ accentColor:'#1976D2', flexShrink:0, marginTop:2 }} />
                    <CarrierBadge carrier={rate.carrier} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', marginBottom:2 }}>{rate.carrier}</div>
                      <div style={{ fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                        {rate.service}
                        {rate.recommended && <span style={{ fontSize:10, fontWeight:500, color:'#1976D2', background:'#E3F2FD', padding:'1px 6px', borderRadius:9999, border:'1px solid #BBDEFB' }}>Best value</span>}
                      </div>
                      <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.5)', marginTop:3, lineHeight:1.45 }}>{rate.desc}</div>
                      <div style={{ fontSize:15, fontWeight:700, marginTop:5 }}>${rate.price.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── CustomsDeclarationModal ───────────────────────────────────────────────── */
const CURRENCIES = ['USD','EUR','GBP','CAD','AUD','JPY','CNY','VND','Other'];
const UNIT_TYPES = ['lb','oz','kg','g'];
const COUNTRIES_FULL = ['United States','China','Vietnam','Germany','Japan','India','Mexico','Canada','United Kingdom','France','South Korea','Other'];

function CustomsDeclarationModal({ order, items: initItems, onSave, onClose }) {
  const [items, setItems] = useState(initItems.map(i=>({...i})));

  function updateItem(id, patch) {
    setItems(prev => prev.map(i => i.id===id ? {...i,...patch} : i));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id!==id));
  }

  function addItem() {
    setItems(prev => [...prev, {
      id: 'custom-' + Date.now(), sourceId: null,
      description:'', sku:'', qty:1, weightPerItem:'', unitType:'lb',
      valuePerItem:'', currency:'USD', countryOfOrigin:'United States',
      hsCode:'', eccn:'', excluded:false,
    }]);
  }

  function handleSave() { onSave(items); onClose(); }

  function ItemRow({ item }) {
    const isFromOrder = !!item.sourceId;
    return (
      <div style={{ border:'1px solid #E5E5E5', borderRadius:8, padding:'16px', marginBottom:12, background:item.excluded?'#FAFAFA':'#fff' }}>
        {/* Trash button for added items — no label */}
        {!isFromOrder && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
            <button onClick={()=>removeItem(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#D32F2F', fontSize:16, lineHeight:1, padding:'0 2px' }}>🗑</button>
          </div>
        )}

        {/* Item name preview (always visible) */}
        <div style={{ fontSize:13, fontWeight:500, color:'rgba(0,0,0,0.75)', marginBottom:10 }}>
          {item.description || <span style={{ color:'rgba(0,0,0,0.3)', fontStyle:'italic' }}>No description</span>}
        </div>

        {/* Exclude checkbox — order items only */}
        {isFromOrder && (
          <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer', fontSize:12.5, color:'rgba(0,0,0,0.65)', lineHeight:1.5, marginBottom: item.excluded ? 0 : 14, padding:'8px 10px', background:'#F8F8F8', borderRadius:6, border:'1px solid #EEEEEE' }}>
            <input type="checkbox" checked={!!item.excluded} onChange={e=>updateItem(item.id,{excluded:e.target.checked})}
              style={{ width:15, height:15, accentColor:'#1976D2', marginTop:2, flexShrink:0 }} />
            This item is not being shipped and does not contain a customs declaration
          </label>
        )}

        {/* ── All declaration fields — hidden when excluded (order items only) ── */}
        {!item.excluded && (
          <>
            {/* Description */}
            <div style={{ marginBottom:10, marginTop: isFromOrder ? 14 : 0 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Description *</label>
              <input value={item.description} onChange={e=>updateItem(item.id,{description:e.target.value})} maxLength={150}
                style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, fontFamily:'inherit', outline:'none', background:'#fff' }} />
              <div style={{ fontSize:11, color:'rgba(0,0,0,0.35)', marginTop:3 }}>Be specific (150 characters max) to avoid delays. <span style={{ color:'#1976D2', cursor:'pointer' }}>Learn more</span></div>
            </div>

            {/* Qty + SKU */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Quantity *</label>
                <input type="number" min="1" value={item.qty} onChange={e=>updateItem(item.id,{qty:+e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, fontFamily:'inherit', outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>SKU</label>
                <input value={item.sku||''} onChange={e=>updateItem(item.id,{sku:e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, fontFamily:'inherit', outline:'none' }} />
              </div>
            </div>

            {/* Weight + Unit type */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Weight per item *</label>
                <input type="number" value={item.weightPerItem} onChange={e=>updateItem(item.id,{weightPerItem:e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, fontFamily:'inherit', outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Unit type</label>
                <select value={item.unitType} onChange={e=>updateItem(item.id,{unitType:e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, background:'#fff', fontFamily:'inherit' }}>
                  {UNIT_TYPES.map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Value + Currency */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Value per item *</label>
                <input type="number" value={item.valuePerItem} onChange={e=>updateItem(item.id,{valuePerItem:e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, fontFamily:'inherit', outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Currency</label>
                <select value={item.currency} onChange={e=>updateItem(item.id,{currency:e.target.value})}
                  style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, background:'#fff', fontFamily:'inherit' }}>
                  {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Country of origin */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.5)', display:'block', marginBottom:4 }}>Country of origin *</label>
              <select value={item.countryOfOrigin} onChange={e=>updateItem(item.id,{countryOfOrigin:e.target.value})}
                style={{ width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:5, background:'#fff', fontFamily:'inherit' }}>
                {COUNTRIES_FULL.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Customs information */}
            <div style={{ fontSize:12, fontWeight:700, color:'rgba(0,0,0,0.55)', marginBottom:8 }}>Customs information</div>
            <div style={{ background:'#F8F8F8', borderRadius:6, padding:'10px 12px', marginBottom:4 }}>
              <input value={item.hsCode||''} onChange={e=>updateItem(item.id,{hsCode:e.target.value})}
                placeholder="HS code (Harmonization/HTS)"
                style={{ width:'100%', border:'none', background:'transparent', fontSize:13, fontFamily:'inherit', outline:'none', color:'rgba(0,0,0,0.8)' }} />
            </div>
            <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', marginBottom:10, lineHeight:1.5 }}>
              Add HS code to avoid delays at customs. <span style={{ color:'#1976D2', cursor:'pointer' }}>Learn more</span> or <span style={{ color:'#1976D2', cursor:'pointer' }}>find a code</span>
            </div>
            <div style={{ background:'#F8F8F8', borderRadius:6, padding:'10px 12px', marginBottom:4 }}>
              <input value={item.eccn||''} onChange={e=>updateItem(item.id,{eccn:e.target.value})}
                placeholder="ECCN/EAR99"
                style={{ width:'100%', border:'none', background:'transparent', fontSize:13, fontFamily:'inherit', outline:'none', color:'rgba(0,0,0,0.8)' }} />
            </div>
            <div style={{ fontSize:11, color:'rgba(0,0,0,0.4)', lineHeight:1.5 }}>
              Advanced: only required for controlled items. <span style={{ color:'#1976D2', cursor:'pointer' }}>Learn more</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:12, width:640, maxWidth:'95vw', maxHeight:'90vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #F0F0F0' }}>
          <span style={{ fontSize:17, fontWeight:700 }}>Edit Customs Declaration</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'rgba(0,0,0,0.4)', lineHeight:1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
          {items.map(item => <ItemRow key={item.id} item={item} />)}

          {/* Add item button */}
          <button onClick={addItem}
            style={{ width:'100%', padding:'10px 0', fontSize:13, fontWeight:600, color:'#1976D2', background:'transparent', border:'2px dashed #BBDEFB', borderRadius:8, cursor:'pointer', marginTop:4 }}>
            + Add item for customs declaration
          </button>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 24px', borderTop:'1px solid #F0F0F0' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', fontSize:13, fontWeight:500, background:'transparent', border:'1px solid #E0E0E0', borderRadius:6, cursor:'pointer', color:'rgba(0,0,0,0.55)' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding:'8px 24px', fontSize:13, fontWeight:700, background:'#1976D2', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── ShipmentPanel — single-page, all-in-one ──────────────────────────────── */
function ShipmentPanel({ order, onClose, onUpdate, onUpdateParent, openRefundModal, showToast }) {
  const updateParent = onUpdateParent || onUpdate;
  const allItems = order.items;
  const totalWeight = allItems.reduce((s,i)=>s+(parseFloat(i.weight)||0)*i.qty, 0);
  const hasShipments = order.shipments && order.shipments.length > 0;
  const isRefunded = order.shipStatus === 'refund_requested' || order.shipStatus === 'refunded';
  /* When the label has been refunded, the user can buy a fresh label — this flips the
     panel from the read-only "Shipment Details" view back to the editable buy-label view. */
  const [buyNewMode, setBuyNewMode] = useState(false);

  /* ─ Form state ─ */
  const [pkg, setPkg] = useState({ type:'box', length:'', width:'', height:'', weightVal:totalWeight.toFixed(2), weightUnit:'lbs', dimUnit:'inches' });
  const [opts, setOpts] = useState({ alcohol:false, alcoholType:'consumer', dryIce:false, dryIceWeight:'', dryIceError:false, returnLabel:false, hazmat:false, hazmatLithium:false, hazmatBiological:false });
  const [shipDate, setShipDate] = useState(todayStr());
  const [showCal, setShowCal] = useState(false);
  const [addrEdits, setAddrEdits] = useState({
    sender:    { name: order.shipFrom.name, company:'', email:'', phone:'', street: order.shipFrom.addr, street2:'', city: order.shipFrom.city, state: order.shipFrom.state, zip: order.shipFrom.zip, country:'United States' },
    recipient: { name: order.shipTo.name,   company:'', email:'', phone:'', street: order.shipTo.addr,   street2:'', city: order.shipTo.city,   state: order.shipTo.state,   zip: order.shipTo.zip,   country:'United States', residential:false },
  });
  const [customOpts, setCustomOpts] = useState({
    exempt: false,
    incoterm: 'DDU',
    purposeOfShipment: 'Merchandise',
    authorizedPerson: '',
    taxIdType: '',
    taxIdNumber: '',
  });
  const [selectedRate, setSelectedRate] = useState(null);
  const [splitModal,   setSplitModal]   = useState(false);
  const [customsModal, setCustomsModal] = useState(false);
  const [purchasing,   setPurchasing]   = useState(false);
  const [activeShipTab,setActiveShipTab]= useState(0);
  /* customsItems: pre-filled from order items + user-added extras */
  const [customsItems, setCustomsItems] = useState(() => {
    return allItems.map((item, idx) => {
      /* Showcase: i1 = declared, i2 = excluded (exempt), i3 = missing (no description/value) */
      if (idx === 0) {
        return {
          id: item.id, sourceId: item.id,
          description: item.name, sku: item.sku,
          qty: item.qty, weightPerItem: item.weight, unitType: 'lb',
          valuePerItem: item.price, currency: 'USD',
          countryOfOrigin: 'United States', hsCode: '9504.50', eccn: 'EAR99',
          excluded: false,
        };
      }
      if (idx === 1) {
        return {
          id: item.id, sourceId: item.id,
          description: item.name, sku: item.sku,
          qty: item.qty, weightPerItem: item.weight, unitType: 'lb',
          valuePerItem: item.price, currency: 'USD',
          countryOfOrigin: 'United States', hsCode: '', eccn: '',
          excluded: true,
        };
      }
      /* idx === 2 and beyond: missing info */
      return {
        id: item.id, sourceId: item.id,
        description: '', sku: item.sku,
        qty: item.qty, weightPerItem: '', unitType: 'lb',
        valuePerItem: '', currency: 'USD',
        countryOfOrigin: '', hsCode: '', eccn: '',
        excluded: false,
      };
    });
  });

  /* Validation checks */
  const addrOk  = !!(addrEdits.sender?.street && addrEdits.recipient?.street);
  const dimOk   = pkg.type==='poly' ? (pkg.length && pkg.width) : (pkg.length && pkg.width && pkg.height);
  const pkgOk   = !!(dimOk && pkg.weightVal);
  const rateOk  = !!selectedRate;
  const ratesAvailable = addrOk && pkgOk;

  /* Per-section error messages shown in section headers */
  const addrError = !addrEdits.sender?.street ? 'Sender address missing'
    : !addrEdits.recipient?.street ? 'Recipient address missing'
    : null;

  const pkgMissing = [];
  if (!pkg.weightVal) pkgMissing.push('weight');
  if (pkg.type === 'poly' ? (!pkg.length || !pkg.width) : (!pkg.length || !pkg.width || !pkg.height))
    pkgMissing.push('dimensions');
  const pkgError = pkgMissing.length ? `Missing ${pkgMissing.join(' & ')}` : null;

  const customsMissingItems = customsItems.filter(c => c.sourceId && !c.excluded && !(c.description && c.valuePerItem && c.countryOfOrigin));
  const itemsError = customsMissingItems.length
    ? `${customsMissingItems.length} item${customsMissingItems.length > 1 ? 's' : ''} missing customs info`
    : null;

  const customsOptError = !customOpts.exempt && (!customOpts.incoterm || !customOpts.purposeOfShipment)
    ? 'Incoterm or purpose missing'
    : null;

  function handleBuyLabel() {
    const errors = [];
    if (!addrOk) errors.push('Addresses required');
    if (!pkgOk)  errors.push('Package required');
    if (!rateOk) errors.push('No carrier selected');
    if (errors.length) { showToast('⚠ ' + errors.join(' · ')); return; }

    setPurchasing(true);
    setTimeout(()=>{
      const newShipment = {
        shipmentId:'SHP-'+Date.now(), itemIds:allItems.map(i=>i.id),
        carrier:selectedRate.carrier, service:selectedRate.service, price:selectedRate.price,
        trackingNumber:'9400111899'+Date.now().toString().slice(-12),
        shippedAt:new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}),
        status:'Label Created', channelSynced:false, trackingEvents:null,
      };
      /* If we're re-buying after a refund, replace the voided label rather than stacking onto it */
      const baseShipments = (buyNewMode || isRefunded) ? [] : (order.shipments||[]);
      onUpdate(order.id, { shipments:[...baseShipments, newShipment], shipStatus:'label_purchased' });
      setBuyNewMode(false);
      setPurchasing(false);
      showToast('✓ Label purchased successfully!');
    },1600);
  }

  function requestRefundForThis() {
    openRefundModal && openRefundModal(1, () => {
      onUpdate(order.id, {
        shipStatus:'refund_requested',
        shipments:(order.shipments||[]).map(s=>({ ...s, refundStatus:'requested' })),
      });
      showToast('↩ Refund requested · credited within 14 days');
    });
  }

  /* Recipient address is shared across every shipment of an order. Editing/validating it
     on one split shipment persists to the order's shipTo, so all sibling shipments update too. */
  const splitShipCount = order._subId ? (order._parentSubOrders?.length || 0) : (order.subOrders?.length || 0);
  const isSplitOrder = splitShipCount > 1;
  function handleRecipientChange(newAddr) {
    const shipTo = {
      name:  newAddr.name,
      addr:  [newAddr.street, newAddr.street2].filter(Boolean).join(', '),
      city:  newAddr.city,
      state: newAddr.state,
      zip:   newAddr.zip,
      country: order.shipTo.country || newAddr.country,
    };
    updateParent(order.id, { shipTo });
    if (isSplitOrder) showToast(`📍 Recipient applied to all ${splitShipCount} shipments`);
    else showToast('📍 Recipient address updated');
  }

  function handleSplitSave(groups) {
    /* Always re-split the parent order (order.id is the parent id, even for a sub-order panel) */
    if (groups.length <= 1) {
      /* Merged back into one shipment → fully un-split the order */
      updateParent(order.id, { subOrders: null });
      setSplitModal(false);
      showToast('✓ Shipments merged back into one order');
      if (order._subId) onClose();
      return;
    }
    const subOrders = groups.map((g,i)=>({ subId:`${order.id}-S${i+1}`, label:`Shipment ${i+1} of ${groups.length}`, itemIds:g.itemIds, shipStatus:'unlabeled', shipments:[] }));
    updateParent(order.id, { subOrders });
    setSplitModal(false);
    if (order._subId) {
      /* Editing from within a shipment: the open sub-order may no longer exist, so close the panel */
      showToast(`✓ Split updated · ${subOrders.length} shipment${subOrders.length>1?'s':''}`);
      onClose();
    } else {
      showToast(`✓ Order split into ${subOrders.length} shipment${subOrders.length>1?'s':''}`);
    }
  }

  /* A panel is part of a split if it IS a split parent, or it's one of the split shipments (_subId) */
  const isSplit = !!order._subId || !!(order.subOrders && order.subOrders.length > 1);

  /* The Split Order modal always operates on the FULL original order.
     For a shipment (sub-order) panel, recover the parent's full item list + current split layout. */
  const splitParentOrder = order._subId
    ? { ...order, items: order._parentItems || order.items, subOrders: order._parentSubOrders || order.subOrders }
    : order;
  const splitInitialGroups = (order._subId ? order._parentSubOrders : order.subOrders) || null;

  /* ─── VIEW SHIPMENT DETAIL (fulfilled) ─── */
  if (hasShipments && !buyNewMode) {
    /* Determine if ALL shipments were synced from channel (no Shippo label) */
    const allSyncedFromChannel = order.shipments.every(s => s.syncedFromChannel);

    return (
      <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'#fff',borderLeft:'1px solid rgba(0,0,0,0.1)' }}>

        {/* Header */}
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid rgba(0,0,0,0.08)',flexShrink:0 }}>
          <span style={{ fontSize:16,fontWeight:700 }}>{isRefunded ? 'Refunded Label' : 'Shipment Details'}</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:22,color:'rgba(0,0,0,0.4)',padding:0,lineHeight:1 }}>×</button>
        </div>

        <div style={{ flex:1,overflowY:'auto',padding:'20px' }}>
          {isRefunded && (
            <div style={{ display:'flex',gap:10,alignItems:'flex-start',background:'#FFF3E0',border:'1px solid #FFE0B2',borderRadius:10,padding:'12px 14px',marginBottom:16 }}>
              <span style={{ fontSize:16,lineHeight:1.2 }}>↩</span>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'#E65100',marginBottom:2 }}>Refund requested</div>
                <div style={{ fontSize:12,color:'rgba(0,0,0,0.6)',lineHeight:1.5 }}>
                  This label has been voided and can no longer be used for postage. Refunds credit to your account within 14 days. To ship this order, buy a new label below.
                </div>
              </div>
            </div>
          )}
          {order.shipments.map((shipment, idx) => {
            const shipItems = allItems.filter(i=>shipment.itemIds.includes(i.id));
            return (
              <div key={shipment.shipmentId}>
                {order.shipments.length > 1 && (
                  <div style={{ fontSize:16,fontWeight:600,color:'rgba(0,0,0,0.7)',marginBottom:12 }}>
                    Shipment Details{idx > 0 ? ` ${idx + 1}` : ''}
                  </div>
                )}

                {/* Details card */}
                <div style={{ background:'#F5F5F5',borderRadius:10,padding:'16px 18px',marginBottom:idx < order.shipments.length-1 ? 24 : 0 }}>

                  {/* Channel-synced badge — shown inside the card at the top */}
                  {shipment.syncedFromChannel && (
                    <div style={{ marginBottom:12 }}>
                      <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:'#6D3B9E',background:'#F3E8FF',border:'1px solid #D8B4FE',borderRadius:9999,padding:'2px 10px' }}>
                        ↔ Synced from {order.channel === 'ebay' ? 'eBay' : order.channel}
                      </span>
                    </div>
                  )}

                  {/* Grid rows */}
                  <div style={{ display:'grid',gridTemplateColumns:'96px 1fr',rowGap:14 }}>
                    <span style={{ fontSize:13,color:'rgba(0,0,0,0.5)' }}>Carrier</span>
                    <span style={{ fontSize:13,fontWeight:500 }}>{shipment.carrier} {shipment.service}</span>

                    <span style={{ fontSize:13,color:'rgba(0,0,0,0.5)' }}>Shipped</span>
                    <span style={{ fontSize:13 }}>{shipment.shippedAt}</span>

                    <span style={{ fontSize:13,color:'rgba(0,0,0,0.5)' }}>Status:</span>
                    <span style={{ fontSize:13, color: shipment.refundStatus==='requested' ? '#E65100' : 'inherit', fontWeight: shipment.refundStatus==='requested' ? 600 : 400 }}>
                      {shipment.refundStatus==='requested' ? 'Voided — refund requested' : shipment.status}
                    </span>

                    <span style={{ fontSize:13,color:'rgba(0,0,0,0.5)' }}>Items:</span>
                    <span style={{ fontSize:13,color:'#1976D2',cursor:'pointer',textDecoration:'underline' }}>
                      {shipItems.length} item{shipItems.length>1?'s':''}
                    </span>
                  </div>

                  {/* Tracking Number */}
                  <div style={{ marginTop:16,paddingTop:14,borderTop:'1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize:13,color:'rgba(0,0,0,0.5)',marginBottom:8 }}>Tracking Number</div>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <span style={{ fontSize:15,fontFamily:'monospace',fontWeight:600,letterSpacing:'0.2px' }}>
                        {shipment.trackingNumber}
                      </span>
                      <button title="Copy" onClick={()=>navigator.clipboard?.writeText(shipment.trackingNumber)}
                        style={{ background:'none',border:'none',cursor:'pointer',fontSize:17,color:'rgba(0,0,0,0.45)',padding:0,lineHeight:1 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#1976D2'}
                        onMouseLeave={e=>e.currentTarget.style.color='rgba(0,0,0,0.45)'}>⧉</button>
                      <button title="Track externally"
                        style={{ background:'none',border:'none',cursor:'pointer',fontSize:17,color:'rgba(0,0,0,0.45)',padding:0,lineHeight:1 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#1976D2'}
                        onMouseLeave={e=>e.currentTarget.style.color='rgba(0,0,0,0.45)'}>↗</button>
                    </div>
                  </div>
                </div>

                {idx < order.shipments.length-1 && (
                  <div style={{ height:1,background:'rgba(0,0,0,0.08)',margin:'24px 0' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        {isRefunded ? (
          <div style={{ padding:'14px 20px',borderTop:'1px solid rgba(0,0,0,0.07)',flexShrink:0,display:'flex',flexDirection:'column',gap:8 }}>
            <button onClick={()=>{ setSelectedRate(null); setBuyNewMode(true); }}
              style={{ width:'100%',padding:'11px 0',fontSize:14,fontWeight:700,background:'#1976D2',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
              🏷 Buy a New Label
            </button>
            <div style={{ fontSize:11.5,color:'rgba(0,0,0,0.45)',textAlign:'center' }}>Refunds cannot be undone. Buying a new label lets you reship this order.</div>
          </div>
        ) : !allSyncedFromChannel && (
          <div style={{ padding:'14px 20px',borderTop:'1px solid rgba(0,0,0,0.07)',flexShrink:0,display:'flex',flexDirection:'column',gap:8 }}>
            <button style={{ width:'100%',padding:'10px 0',fontSize:13,fontWeight:600,background:'#1976D2',color:'#fff',border:'none',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
              🖨 Print Shipping Label
            </button>
            <button style={{ width:'100%',padding:'9px 0',fontSize:13,fontWeight:500,background:'#fff',color:'rgba(0,0,0,0.7)',border:'1px solid #E0E0E0',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
              🧾 Print Packing Slip
            </button>
            <button onClick={requestRefundForThis}
              style={{ width:'100%',padding:'9px 0',fontSize:13,fontWeight:500,background:'#fff',color:'#C62828',border:'1px solid #FFCDD2',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}
              onMouseEnter={e=>e.currentTarget.style.background='#FEECEC'}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
              ↩ Request Refund
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── BUY LABEL VIEW — single page ─── */
  const missingReasons = [];
  if (!addrOk) missingReasons.push('Addresses required');
  if (!pkgOk)  missingReasons.push('Package required');

  return (
    <>
      <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'#fff',borderLeft:'1px solid rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding:'12px 20px 10px',borderBottom:'1px solid rgba(0,0,0,0.07)',flexShrink:0 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
            <div>
              {buyNewMode && (
                <button onClick={()=>setBuyNewMode(false)}
                  style={{ display:'inline-flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',fontSize:12,color:'#1976D2',fontWeight:600,padding:0,marginBottom:4 }}>
                  ‹ Back to refunded label
                </button>
              )}
              <div style={{ fontSize:16,fontWeight:700,color:'rgba(0,0,0,0.85)',marginBottom:2 }}>{buyNewMode ? 'Buy a New Label' : 'Order Detail'}</div>
              <div style={{ fontSize:12,color:'rgba(0,0,0,0.4)' }}>Order #{order.id.slice(-5)} to {order.buyer}</div>
            </div>
            <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:20,color:'rgba(0,0,0,0.4)',padding:2,lineHeight:1 }}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1,overflowY:'auto',padding:'16px 20px' }}>

          {buyNewMode && (
            <div style={{ display:'flex',gap:8,alignItems:'flex-start',background:'#E3F2FD',border:'1px solid #BBDEFB',borderRadius:8,padding:'10px 12px',marginBottom:14 }}>
              <span style={{ fontSize:14,lineHeight:1.3 }}>ℹ️</span>
              <div style={{ fontSize:12,color:'rgba(0,0,0,0.7)',lineHeight:1.5 }}>The previous label was refunded. Confirm the details below and buy a fresh label to ship this order.</div>
            </div>
          )}

          {/* ── Addresses ── */}
          <AddressesSection order={order} addrEdits={addrEdits} setAddrEdits={setAddrEdits} error={addrError} onRecipientChange={handleRecipientChange} />

          {/* ── Items ── */}
          <SectionCard
            title="Items"
            error={itemsError}
            right={`${allItems.length} item${allItems.length>1?'s':''}, ${totalWeight.toFixed(1)} lbs`}
            actionBtn={
              <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setSplitModal(true)}
                  title={isSplit ? 'Edit how items are divided across shipments' : 'Split this order into multiple shipments'}
                  style={{ padding:'3px 10px', fontSize:11.5, fontWeight:600, color:'#1976D2', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:4, cursor:'pointer', whiteSpace:'nowrap' }}>
                  {isSplit ? '✏ Edit Split Ship' : '✂ Split Ship'}
                </button>
                <button onClick={()=>setCustomsModal(true)}
                  style={{ padding:'3px 10px', fontSize:11.5, fontWeight:600, color:'rgba(0,0,0,0.6)', background:'#F5F5F5', border:'1px solid #E0E0E0', borderRadius:4, cursor:'pointer', whiteSpace:'nowrap' }}>
                  📋 Edit Customs
                </button>
              </div>
            }>
            {allItems.map((item, idx) => {
              const decl     = customsItems.find(c => c.sourceId === item.id);
              const isExempt = decl?.excluded === true;
              /* "declared" = has decl, not exempt, and has the required fields filled */
              const isDeclared = decl && !isExempt && !!(decl.description && decl.valuePerItem && decl.countryOfOrigin);
              /* "missing" = has decl but required fields are incomplete */
              const isMissing  = decl && !isExempt && !isDeclared;
              return (
                <div key={item.id} style={{ paddingBottom:idx<allItems.length-1?10:0, marginBottom:idx<allItems.length-1?10:0, borderBottom:idx<allItems.length-1?'1px solid #F5F5F5':'none' }}>
                  <div style={{ fontSize:13, fontWeight:500 }}>{item.qty} × {item.name}</div>
                  <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.45)', marginTop:2 }}>{item.weight} lb per unit | ${item.price.toFixed(2)} per unit</div>
                  <div style={{ fontSize:11, color:'rgba(0,0,0,0.38)', fontWeight:600, marginTop:1 }}>SKU: {item.sku}</div>
                  {/* Customs badge */}
                  <div style={{ marginTop:6 }}>
                    {isExempt ? (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:500, color:'rgba(0,0,0,0.5)', background:'#F5F5F5', border:'1px solid #E0E0E0', borderRadius:9999, padding:'2px 9px' }}>
                        Exempt from customs
                      </span>
                    ) : isDeclared ? (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:500, color:'#1976D2', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:9999, padding:'2px 9px' }}>
                        ✓ Declared for customs
                      </span>
                    ) : (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:500, color:'#C62828', background:'#FEECEC', border:'1px solid #FFCDD2', borderRadius:9999, padding:'2px 9px' }}>
                        ⚠ Missing customs info
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Extra declared items (not from order) */}
            {customsItems.filter(c=>!c.sourceId).map((c,idx)=>(
              <div key={c.id} style={{ paddingTop:10, marginTop:10, borderTop:'1px solid #F5F5F5' }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{c.qty} × {c.description}</div>
                <div style={{ fontSize:11.5, color:'rgba(0,0,0,0.45)', marginTop:2 }}>{c.weightPerItem} {c.unitType} per unit | ${c.valuePerItem} per unit</div>
                <div style={{ marginTop:5 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10.5, fontWeight:500, color:'#1976D2', background:'#E3F2FD', border:'1px solid #BBDEFB', borderRadius:9999, padding:'1px 8px' }}>
                    + Added for customs
                  </span>
                </div>
              </div>
            ))}
          </SectionCard>

          {/* ── Custom Options ── */}
          <CustomOptionsSection customOpts={customOpts} setCustomOpts={setCustomOpts} error={customsOptError} />

          {/* ── Package Details ── */}
          <SectionCard title="Package Details" error={pkgError}>
            {/* Box / Poly toggle */}
            <div style={{ display:'flex',border:'1px solid #E0E0E0',borderRadius:4,overflow:'hidden',marginBottom:16 }}>
              {[['box','Box'],['poly','Poly Mailer']].map(([t,lbl])=>(
                <button key={t} onClick={()=>setPkg(p=>({...p,type:t}))}
                  style={{ flex:1,padding:'8px 0',fontSize:13,fontWeight:500,border:'none',cursor:'pointer',background:pkg.type===t?'#1976D2':'#fff',color:pkg.type===t?'#fff':'rgba(0,0,0,0.55)' }}>
                  {lbl}
                </button>
              ))}
            </div>
            {/* Dimensions */}
            <div style={{ marginBottom:14 }}>
              {pkg.type==='box' ? (
                <div style={{ display:'flex',alignItems:'flex-end',gap:6 }}>
                  <FieldInput label="Length" value={pkg.length} onChange={e=>setPkg(p=>({...p,length:e.target.value}))} style={{ flex:1 }} />
                  <span style={{ fontSize:18,color:'rgba(0,0,0,0.3)',paddingBottom:9 }}>×</span>
                  <FieldInput label="Width"  value={pkg.width}  onChange={e=>setPkg(p=>({...p,width:e.target.value}))}  style={{ flex:1 }} />
                  <span style={{ fontSize:18,color:'rgba(0,0,0,0.3)',paddingBottom:9 }}>×</span>
                  <FieldInput label="Height" value={pkg.height} onChange={e=>setPkg(p=>({...p,height:e.target.value}))} style={{ flex:1 }} />
                </div>
              ) : (
                <div style={{ display:'flex',alignItems:'flex-end',gap:6 }}>
                  <FieldInput label="Length" value={pkg.length} onChange={e=>setPkg(p=>({...p,length:e.target.value}))} style={{ flex:1 }} />
                  <span style={{ fontSize:18,color:'rgba(0,0,0,0.3)',paddingBottom:9 }}>×</span>
                  <FieldInput label="Width"  value={pkg.width}  onChange={e=>setPkg(p=>({...p,width:e.target.value}))}  style={{ flex:1 }} />
                </div>
              )}
            </div>
            <div style={{ marginBottom:14 }}>
              <FieldSelect label="Units" value={pkg.dimUnit} onChange={e=>setPkg(p=>({...p,dimUnit:e.target.value}))}
                options={[{value:'inches',label:'inches'},{value:'cm',label:'cm'}]} />
            </div>
            <div style={{ display:'flex',gap:10,marginBottom:14 }}>
              <div style={{ flex:2 }}>
                <label style={{ fontSize:10.5, fontWeight:600, color:'rgba(0,0,0,0.45)', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:3 }}>Weight</label>
                <input
                  value={pkg.weightVal}
                  onChange={e=>{ if(!pkg.useItemWeight) setPkg(p=>({...p,weightVal:e.target.value})); }}
                  disabled={!!pkg.useItemWeight}
                  style={{ padding:'7px 10px', fontSize:13, border:'1px solid #E0E0E0', borderRadius:4, fontFamily:'inherit', outline:'none', width:'100%',
                    background: pkg.useItemWeight ? '#F5F5F5' : '#fff',
                    color: pkg.useItemWeight ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.87)',
                    cursor: pkg.useItemWeight ? 'not-allowed' : 'text',
                  }}
                />
              </div>
              <FieldSelect label="Units" value={pkg.weightUnit} onChange={e=>setPkg(p=>({...p,weightUnit:e.target.value}))}
                options={[{value:'lbs',label:'lbs'},{value:'oz',label:'oz'},{value:'kg',label:'kg'}]} />
            </div>
            <label style={{ display:'flex',alignItems:'center',gap:9,cursor:'pointer',fontSize:13,color:'rgba(0,0,0,0.7)' }}>
              <input type="checkbox" checked={!!pkg.useItemWeight}
                style={{ width:15,height:15,accentColor:'#1976D2' }}
                onChange={e=>{
                  const checked = e.target.checked;
                  setPkg(p=>({
                    ...p,
                    useItemWeight: checked,
                    weightVal: checked ? totalWeight.toFixed(2) : p.weightVal,
                  }));
                }} />
              Use Weight of Items
            </label>
          </SectionCard>

          {/* ── Options ── */}
          <SectionCard title="Options" right={
            [opts.alcohol,opts.dryIce,opts.returnLabel,opts.hazmat].filter(Boolean).length > 0
              ? `${[opts.alcohol,opts.dryIce,opts.returnLabel,opts.hazmat].filter(Boolean).length} selected`
              : undefined
          }>
            {/* Alcohol */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:500,marginBottom:opts.alcohol?8:0 }}>
                <input type="checkbox" checked={opts.alcohol} onChange={e=>setOpts(o=>({...o,alcohol:e.target.checked}))} style={{ width:16,height:16,accentColor:'#1976D2' }} />
                Shipment contains alcohol
              </label>
              {opts.alcohol && (
                <div style={{ paddingLeft:26 }}>
                  <div style={{ fontSize:12,color:'rgba(0,0,0,0.5)',marginBottom:8 }}>Alcohol recipient type</div>
                  <div style={{ display:'flex',gap:20,marginBottom:8 }}>
                    {['consumer','licensee'].map(v=>(
                      <label key={v} style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,textTransform:'capitalize' }}>
                        <input type="radio" name="alcoholType" value={v} checked={opts.alcoholType===v} onChange={()=>setOpts(o=>({...o,alcoholType:v}))} style={{ accentColor:'#1976D2' }} />
                        {v.charAt(0).toUpperCase()+v.slice(1)}
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize:11.5,color:'rgba(0,0,0,0.5)',lineHeight:1.5 }}>
                    Compliant account with UPS or FedEx is required. For more info, <span style={{ color:'#1976D2',cursor:'pointer',textDecoration:'underline' }}>visit our FAQ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dry ice */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:500,marginBottom:opts.dryIce?10:0 }}>
                <input type="checkbox" checked={opts.dryIce} onChange={e=>setOpts(o=>({...o,dryIce:e.target.checked,dryIceWeight:''}))} style={{ width:16,height:16,accentColor:'#1976D2' }} />
                Shipment contains dry ice
              </label>
              {opts.dryIce && (
                <div style={{ paddingLeft:26 }}>
                  {/* Dry ice weight field */}
                  <div style={{ position:'relative', border:`1.5px solid ${opts.dryIceError?'#EF9A9A':'#D0D0D0'}`, borderRadius:6, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, background:opts.dryIceError?'#FFF8F8':'#fff' }}>
                    <label style={{ position:'absolute', top:-8, left:10, background: opts.dryIceError?'#FFF8F8':'#fff', padding:'0 4px', fontSize:11, fontWeight:600, color: opts.dryIceError?'#C62828':'rgba(0,0,0,0.5)' }}>
                      Dry ice weight
                    </label>
                    <input
                      type="number" min="0" step="0.01"
                      value={opts.dryIceWeight||''}
                      onChange={e=>{
                        const v = e.target.value;
                        const pkgWeight = parseFloat(pkg.weightVal) || 0;
                        const dryWeight = parseFloat(v) || 0;
                        setOpts(o=>({...o, dryIceWeight:v, dryIceError: dryWeight > pkgWeight && v !== '' }));
                      }}
                      placeholder="0"
                      style={{ flex:1, border:'none', outline:'none', fontSize:14, fontWeight:500, background:'transparent', fontFamily:'inherit', color: opts.dryIceError?'#C62828':'rgba(0,0,0,0.85)' }}
                    />
                    <span style={{ fontSize:13, color:'rgba(0,0,0,0.45)', fontWeight:500 }}>lb</span>
                  </div>
                  {opts.dryIceError && (
                    <div style={{ marginTop:6, fontSize:12, color:'#C62828', lineHeight:1.4 }}>
                      Dry Ice weight cannot be greater than Package Weight
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Return label */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:500 }}>
                <input type="checkbox" checked={opts.returnLabel} onChange={e=>setOpts(o=>({...o,returnLabel:e.target.checked}))} style={{ width:16,height:16,accentColor:'#1976D2' }} />
                Create a return label
              </label>
            </div>

            {/* Hazmat */}
            <div>
              <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13,fontWeight:500,marginBottom:opts.hazmat?12:0 }}>
                <input type="checkbox" checked={opts.hazmat}
                  onChange={e=>setOpts(o=>({...o,hazmat:e.target.checked,hazmatLithium:false,hazmatBiological:false}))}
                  style={{ width:16,height:16,accentColor:'#1976D2' }} />
                Shipment contains hazardous materials
              </label>

              {opts.hazmat && (
                <div style={{ paddingLeft:26, display:'flex', flexDirection:'column', gap:10 }}>

                  {/* Sub-declaration: Lithium batteries */}
                  <label style={{ display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer',fontSize:13,color:'rgba(0,0,0,0.75)',padding:'10px 12px',background:opts.hazmatLithium?'#E3F2FD':'#F8F8F8',border:`1px solid ${opts.hazmatLithium?'#BBDEFB':'#E8E8E8'}`,borderRadius:7,lineHeight:1.5 }}>
                    <input type="checkbox" checked={opts.hazmatLithium}
                      onChange={e=>setOpts(o=>({...o,hazmatLithium:e.target.checked}))}
                      style={{ width:15,height:15,accentColor:'#1976D2',marginTop:2,flexShrink:0 }} />
                    <div>
                      <div style={{ fontWeight:500, marginBottom:2 }}>Lithium batteries</div>
                      <div style={{ fontSize:11.5,color:'rgba(0,0,0,0.5)',lineHeight:1.5 }}>
                        Includes devices containing lithium batteries — laptops, phones, power banks, tablets, cameras.
                        Domestic: USPS Ground Advantage only. International: new devices in original packaging only (Class 9).
                      </div>
                    </div>
                  </label>

                  {/* Sub-declaration: Biological material */}
                  <label style={{ display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer',fontSize:13,color:'rgba(0,0,0,0.75)',padding:'10px 12px',background:opts.hazmatBiological?'#E3F2FD':'#F8F8F8',border:`1px solid ${opts.hazmatBiological?'#BBDEFB':'#E8E8E8'}`,borderRadius:7,lineHeight:1.5 }}>
                    <input type="checkbox" checked={opts.hazmatBiological}
                      onChange={e=>setOpts(o=>({...o,hazmatBiological:e.target.checked}))}
                      style={{ width:15,height:15,accentColor:'#1976D2',marginTop:2,flexShrink:0 }} />
                    <div>
                      <div style={{ fontWeight:500, marginBottom:2 }}>Biological material</div>
                      <div style={{ fontSize:11.5,color:'rgba(0,0,0,0.5)',lineHeight:1.5 }}>
                        Biological specimens, diagnostic specimens, or infectious substances.
                        Required for domestic hazmat return labels containing biological materials.
                      </div>
                    </div>
                  </label>

                  {/* Other hazmat category info */}
                  <div style={{ fontSize:11.5,color:'rgba(0,0,0,0.5)',lineHeight:1.6,padding:'8px 12px',background:'#FAFAFA',border:'1px solid #EEEEEE',borderRadius:6 }}>
                    Shipping other hazmat items (aerosols, paint, flammables, etc.)? Just check the top box — no sub-declaration needed. Not sure if your item qualifies?{' '}
                    <span style={{ color:'#1976D2',textDecoration:'underline',cursor:'pointer' }}>Look it up on USPS</span>
                  </div>

                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Shipment Date (image 3 & 4) ── */}
          <CollapsibleDateSection shipDate={shipDate} setShipDate={setShipDate} showCal={showCal} setShowCal={setShowCal} />

          {/* ── Carrier Rates ── */}
          <CollapsibleRatesSection
            addrOk={addrOk}
            pkgOk={pkgOk}
            missingReasons={missingReasons}
            selectedRate={selectedRate}
            setSelectedRate={setSelectedRate}
            inputsKey={[
              addrEdits.sender.street, addrEdits.sender.city, addrEdits.sender.state, addrEdits.sender.zip,
              addrEdits.recipient.street, addrEdits.recipient.city, addrEdits.recipient.state, addrEdits.recipient.zip,
              pkg.type, pkg.length, pkg.width, pkg.height, pkg.weightVal, pkg.weightUnit, pkg.dimUnit,
              shipDate,
            ].join('|')}
          />
        </div>{/* end scrollable body */}

        {/* ── Sticky bottom bar (image 1) ── */}
        <div style={{ flexShrink:0,borderTop:'2px solid rgba(0,0,0,0.08)',background:'#fff',padding:'12px 20px' }}>
          {/* Validation summary */}
          {(!addrOk || !pkgOk || !rateOk) && (
            <div style={{ marginBottom:10 }}>
              {!addrOk && <div style={{ fontSize:12,color:'rgba(0,0,0,0.5)',lineHeight:1.8 }}>Addresses required</div>}
              {!pkgOk  && <div style={{ fontSize:12,color:'rgba(0,0,0,0.5)',lineHeight:1.8 }}>Package required</div>}
              {!rateOk && <div style={{ fontSize:12,color:'rgba(0,0,0,0.5)',lineHeight:1.8 }}>No carrier selected</div>}
            </div>
          )}
          {/* Selected rate summary */}
          {selectedRate && (
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(0,0,0,0.55)',marginBottom:10 }}>
              <span>{selectedRate.carrier} {selectedRate.service}</span>
              <span style={{ fontWeight:700,fontSize:14,color:'rgba(0,0,0,0.87)' }}>${selectedRate.price.toFixed(2)}</span>
            </div>
          )}
          <button onClick={handleBuyLabel} disabled={purchasing}
            style={{ width:'100%',padding:'11px 0',fontSize:14,fontWeight:700,background:purchasing?'#90CAF9':'#1976D2',color:'#fff',border:'none',borderRadius:6,cursor:purchasing?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,letterSpacing:'0.3px',transition:'background 0.2s' }}>
            {purchasing
              ? <><span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.4)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'lc-spin 0.8s linear infinite',display:'inline-block' }} /> Purchasing…</>
              : selectedRate ? `Buy Label · $${selectedRate.price.toFixed(2)}` : 'Buy Label'
            }
          </button>
        </div>
      </div>

      {splitModal   && <SplitOrderModal order={splitParentOrder} initialGroups={splitInitialGroups} onSave={handleSplitSave} onClose={()=>setSplitModal(false)} />}
      {customsModal && <CustomsDeclarationModal order={order} items={customsItems} onSave={setCustomsItems} onClose={()=>setCustomsModal(false)} />}
    </>
  );
}

/* ── App ───────────────────────────────────────────────────────────────────── */
/* ── Date range helpers ───────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '…';
  const [y,m,d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
function isoToObj(iso) {
  if (!iso) return null;
  const [y,m,d] = iso.split('-').map(Number);
  return { y, m: m-1, d };
}
function objToIso({ y, m, d }) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function sameDay(a, b) { return a && b && a.y===b.y && a.m===b.m && a.d===b.d; }
function daysBetween(a, b) {
  return Math.round((new Date(b.y,b.m,b.d) - new Date(a.y,a.m,a.d)) / 86400000);
}

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_SHORT    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const PRESETS = [
  { label:'Today',         fn:()=>{ const t=new Date(); return { start:objToIso({y:t.getFullYear(),m:t.getMonth(),d:t.getDate()}), end:objToIso({y:t.getFullYear(),m:t.getMonth(),d:t.getDate()}) }; } },
  { label:'Yesterday',     fn:()=>{ const t=new Date(Date.now()-864e5); return { start:objToIso({y:t.getFullYear(),m:t.getMonth(),d:t.getDate()}), end:objToIso({y:t.getFullYear(),m:t.getMonth(),d:t.getDate()}) }; } },
  { label:'Last 7 days',   fn:()=>{ const e=new Date(),s=new Date(Date.now()-6*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last 30 days',  fn:()=>{ const e=new Date(),s=new Date(Date.now()-29*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last 90 days',  fn:()=>{ const e=new Date(),s=new Date(Date.now()-89*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last 365 days', fn:()=>{ const e=new Date(),s=new Date(Date.now()-364*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last week',     fn:()=>{ const n=new Date(),dow=n.getDay(),s=new Date(n-((dow+7)*864e5)),e=new Date(s.getTime()+6*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last month',    fn:()=>{ const n=new Date(),s=new Date(n.getFullYear(),n.getMonth()-1,1),e=new Date(n.getFullYear(),n.getMonth(),0); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:e.getFullYear(),m:e.getMonth(),d:e.getDate()}) }; } },
  { label:'Last year',     fn:()=>{ const y=new Date().getFullYear()-1; return { start:`${y}-01-01`, end:`${y}-12-31` }; } },
  { label:'Week to date',  fn:()=>{ const n=new Date(),s=new Date(n-n.getDay()*864e5); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:n.getFullYear(),m:n.getMonth(),d:n.getDate()}) }; } },
  { label:'Month to date', fn:()=>{ const n=new Date(),s=new Date(n.getFullYear(),n.getMonth(),1); return { start:objToIso({y:s.getFullYear(),m:s.getMonth(),d:s.getDate()}), end:objToIso({y:n.getFullYear(),m:n.getMonth(),d:n.getDate()}) }; } },
];

function CalMonth({ year, month, startObj, endObj, hoverObj, onDayClick, onDayHover }) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i=0;i<firstDow;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);

  function inRange(d) {
    if (!d) return false;
    const cur = {y:year,m:month,d};
    const lo = startObj, hi = endObj||hoverObj;
    if (!lo) return false;
    if (sameDay(lo,cur)) return true;
    if (hi) {
      const [a,b] = daysBetween(lo,hi)>=0 ? [lo,hi] : [hi,lo];
      return daysBetween(a,cur)>=0 && daysBetween(cur,b)>=0;
    }
    return false;
  }
  function isStart(d) { return d && sameDay(startObj,{y:year,m:month,d}); }
  function isEnd(d)   { return d && (sameDay(endObj,{y:year,m:month,d}) || (!endObj && sameDay(hoverObj,{y:year,m:month,d}))); }

  return (
    <div style={{ flex:'0 0 auto', minWidth:220 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'rgba(0,0,0,0.6)', marginBottom:8, textAlign:'center' }}>
        {MONTHS_SHORT[month]} {year}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px 0' }}>
        {DOW_SHORT.map(d=>(
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'rgba(0,0,0,0.4)', paddingBottom:4 }}>{d}</div>
        ))}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const sel = isStart(d)||isEnd(d);
          const ran = inRange(d);
          const startD = isStart(d);
          const endD = isEnd(d);
          return (
            <div key={i}
              onClick={()=>onDayClick({y:year,m:month,d})}
              onMouseEnter={()=>onDayHover({y:year,m:month,d})}
              style={{
                textAlign:'center', fontSize:12.5, padding:'4px 0', cursor:'pointer', position:'relative',
                background: ran && !sel ? '#DBEAFE' : 'transparent',
                borderRadius: startD ? '50% 0 0 50%' : endD ? '0 50% 50% 0' : sel ? '50%' : 0,
              }}>
              <span style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:26, height:26, borderRadius:'50%',
                background: sel ? '#1976D2' : 'transparent',
                color: sel ? '#fff' : ran ? '#1565C0' : 'rgba(0,0,0,0.75)',
                fontWeight: sel ? 700 : 400,
                position:'relative', zIndex:1,
              }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ value, onChange, onApply, onClear, hasFilter }) {
  const today = new Date();
  const [leftY,  setLeftY]  = useState(today.getFullYear());
  const [leftM,  setLeftM]  = useState(today.getMonth());
  const [startObj, setStartObj] = useState(isoToObj(value.start));
  const [endObj,   setEndObj]   = useState(isoToObj(value.end));
  const [hoverObj, setHoverObj] = useState(null);
  const [selecting, setSelecting] = useState(false); // false = pick start, true = pick end

  const rightY = leftM===11 ? leftY+1 : leftY;
  const rightM = leftM===11 ? 0 : leftM+1;

  function prevMonth() {
    if(leftM===0){setLeftM(11);setLeftY(y=>y-1);}else setLeftM(m=>m-1);
  }
  function nextMonth() {
    if(leftM===11){setLeftM(0);setLeftY(y=>y+1);}else setLeftM(m=>m+1);
  }

  function handleDayClick(obj) {
    if(!selecting) {
      setStartObj(obj); setEndObj(null); setHoverObj(null);
      setSelecting(true);
    } else {
      const s = startObj;
      const [a,b] = daysBetween(s,obj)>=0 ? [s,obj] : [obj,s];
      setEndObj(b); setStartObj(a); setSelecting(false);
      onChange({ start: objToIso(a), end: objToIso(b) });
    }
  }

  function applyPreset(preset) {
    const r = preset.fn();
    const s = isoToObj(r.start), e = isoToObj(r.end);
    setStartObj(s); setEndObj(e); setSelecting(false);
    onChange(r);
  }

  const displayStart = startObj ? `${MONTHS_SHORT[startObj.m]} ${startObj.d}, ${startObj.y}` : 'Start date';
  const displayEnd   = endObj   ? `${MONTHS_SHORT[endObj.m]} ${endObj.d}, ${endObj.y}`   : (selecting ? '...' : 'End date');

  return (
    <div style={{ display:'flex', boxShadow:'0 8px 32px rgba(0,0,0,0.15)', borderRadius:10, overflow:'hidden', background:'#fff', minWidth:640 }}>
      {/* Presets */}
      <div style={{ width:130, borderRight:'1px solid #EEEEEE', padding:'8px 0', background:'#FAFAFA' }}>
        {PRESETS.map(p=>(
          <button key={p.label} onClick={()=>applyPreset(p)}
            style={{ display:'block', width:'100%', textAlign:'left', padding:'7px 14px', fontSize:12.5, background:'none', border:'none', cursor:'pointer', color:'rgba(0,0,0,0.7)', fontFamily:'inherit' }}
            onMouseEnter={e=>e.currentTarget.style.background='#E3F2FD'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ flex:1, padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
        {/* Selected range inputs */}
        <div style={{ display:'flex', gap:8, marginBottom:4 }}>
          <div style={{ flex:1, border:`1.5px solid ${selecting?'#1976D2':'#D8D8D8'}`, borderRadius:6, padding:'7px 12px', fontSize:13, color: startObj?'rgba(0,0,0,0.8)':'rgba(0,0,0,0.35)', background:'#fff' }}>
            {displayStart}
          </div>
          <div style={{ flex:1, border:`1.5px solid ${selecting&&startObj?'#1976D2':'#D8D8D8'}`, borderRadius:6, padding:'7px 12px', fontSize:13, color: endObj?'rgba(0,0,0,0.8)':'rgba(0,0,0,0.35)', background:'#fff' }}>
            {displayEnd}
          </div>
        </div>

        {/* Month navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <button onClick={prevMonth} style={{ background:'none',border:'none',cursor:'pointer',fontSize:18,color:'rgba(0,0,0,0.45)',padding:'2px 8px',borderRadius:4 }}>‹</button>
          <div style={{ display:'flex', gap:32, fontSize:13, fontWeight:600, color:'rgba(0,0,0,0.65)' }}>
            <span>{MONTHS_FULL[leftM]} {leftY}</span>
            <span>{MONTHS_FULL[rightM]} {rightY}</span>
          </div>
          <button onClick={nextMonth} style={{ background:'none',border:'none',cursor:'pointer',fontSize:18,color:'rgba(0,0,0,0.45)',padding:'2px 8px',borderRadius:4 }}>›</button>
        </div>

        {/* Two months */}
        <div style={{ display:'flex', gap:20 }} onMouseLeave={()=>setHoverObj(null)}>
          <CalMonth year={leftY} month={leftM} startObj={startObj} endObj={endObj} hoverObj={selecting?hoverObj:null} onDayClick={handleDayClick} onDayHover={setHoverObj} />
          <div style={{ width:1, background:'#EEEEEE', flexShrink:0 }} />
          <CalMonth year={rightY} month={rightM} startObj={startObj} endObj={endObj} hoverObj={selecting?hoverObj:null} onDayClick={handleDayClick} onDayHover={setHoverObj} />
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8, borderTop:'1px solid #EEEEEE' }}>
          {hasFilter && (
            <button onClick={onClear} style={{ padding:'6px 14px',fontSize:12,background:'none',border:'1px solid #E0E0E0',borderRadius:5,cursor:'pointer',color:'rgba(0,0,0,0.5)' }}>Clear</button>
          )}
          <button onClick={onApply} disabled={!startObj||!endObj}
            style={{ padding:'6px 18px',fontSize:13,fontWeight:600,background:startObj&&endObj?'#1976D2':'#E0E0E0',color:startObj&&endObj?'#fff':'rgba(0,0,0,0.35)',border:'none',borderRadius:5,cursor:startObj&&endObj?'pointer':'not-allowed' }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SearchFilterRow ─────────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value:'', label:'Fulfillment status' },
  { value:'unlabeled',       label:'Unlabeled' },
  { value:'label_purchased', label:'Label purchased' },
  { value:'shipped',         label:'Shipped' },
];

function FilterPill({ label, active, onClick, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    if(!open) return;
    function h(e){ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[open]);
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 12px',fontSize:13,fontWeight:active?600:400,color:active?'#1976D2':'rgba(0,0,0,0.65)',background:active?'#E3F2FD':'#fff',border:`1px solid ${active?'#1976D2':'#D8D8D8'}`,borderRadius:6,cursor:'pointer',whiteSpace:'nowrap' }}>
        {label}
        <span style={{ fontSize:11,color:active?'#1976D2':'rgba(0,0,0,0.4)' }}>{open?'∧':'∨'}</span>
      </button>
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 6px)',left:0,background:'#fff',border:'1px solid #E0E0E0',borderRadius:8,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',zIndex:400,minWidth:220,padding:'14px 16px' }}>
          {children({ close:()=>setOpen(false) })}
        </div>
      )}
    </div>
  );
}

function SearchFilterRow({ searchQ, setSearchQ, statusFilter, setStatusFilter, dateRange, setDateRange, sortOrder, setSortOrder }) {
  const [localDate, setLocalDate] = useState({ ...dateRange });
  const hasDateFilter = !!(dateRange.start || dateRange.end);
  const hasStatusFilter = !!statusFilter;

  return (
    <div style={{ flexShrink:0, background:'#fff', borderBottom:'1px solid rgba(0,0,0,0.08)', padding:'10px 20px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>

      {/* Search box */}
      <div style={{ display:'flex', alignItems:'center', border:'1px solid #D8D8D8', borderRadius:6, overflow:'hidden', background:'#fff', minWidth:220, flex:'0 0 auto' }}>
        <span style={{ padding:'0 10px', fontSize:14, color:'rgba(0,0,0,0.4)' }}>🔍</span>
        <input
          value={searchQ}
          onChange={e=>setSearchQ(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&e.currentTarget.blur()}
          placeholder="Search by Order ID, Product Name, SKU, Customer Name,..."
          style={{ flex:1, border:'none', outline:'none', fontSize:13, padding:'7px 0', fontFamily:'inherit', color:'rgba(0,0,0,0.8)' }}
        />
        {searchQ && (
          <button onClick={()=>setSearchQ('')} style={{ padding:'0 10px', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'rgba(0,0,0,0.35)' }}>×</button>
        )}
      </div>

      {/* Divider */}
      <div style={{ width:1, height:22, background:'#E0E0E0', flexShrink:0 }} />

      {/* Fulfillment Status filter */}
      <FilterPill label={hasStatusFilter ? STATUS_OPTIONS.find(o=>o.value===statusFilter)?.label : 'Fulfillment status'} active={hasStatusFilter}>
        {({ close }) => (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {STATUS_OPTIONS.map(opt=>(
              <button key={opt.value} onClick={()=>{ setStatusFilter(opt.value); close(); }}
                style={{ textAlign:'left', padding:'8px 10px', fontSize:13, border:'none', borderRadius:5, cursor:'pointer', background:statusFilter===opt.value?'#E3F2FD':'transparent', color:statusFilter===opt.value?'#1976D2':'rgba(0,0,0,0.75)', fontWeight:statusFilter===opt.value?600:400 }}>
                {opt.label || 'All statuses'}
              </button>
            ))}
          </div>
        )}
      </FilterPill>

      {/* Date filter */}
      <FilterPill label={hasDateFilter
        ? (() => {
            const fmt = iso => { if(!iso) return '…'; const [y,m,d] = iso.split('-'); return `${MONTHS_FULL[+m-1]} ${+d}, ${y}`; };
            return `${fmt(dateRange.start)} – ${fmt(dateRange.end)}`;
          })()
        : 'Date'} active={hasDateFilter}>
        {({ close }) => (
          <DateRangePicker
            value={localDate}
            onChange={setLocalDate}
            onApply={()=>{ setDateRange({...localDate}); close(); }}
            onClear={()=>{ setDateRange({start:'',end:''}); setLocalDate({start:'',end:''}); close(); }}
            hasFilter={hasDateFilter}
          />
        )}
      </FilterPill>

      {/* Search button */}
      <button
        style={{ padding:'6px 16px', fontSize:13, fontWeight:600, background:'#1976D2', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
        Search
      </button>

      {/* Clear all filters */}
      {(searchQ || hasStatusFilter || hasDateFilter) && (
        <button onClick={()=>{ setSearchQ(''); setStatusFilter(''); setDateRange({start:'',end:''}); setLocalDate({start:'',end:''}); }}
          style={{ fontSize:12, color:'rgba(0,0,0,0.45)', background:'none', border:'none', cursor:'pointer', marginLeft:4, textDecoration:'underline' }}>
          Clear all
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [tweaks,      setTweaks]      = useState(TWEAK_DEFAULTS);
  const [editMode,    setEditMode]    = useState(false);
  const [orders,      setOrders]      = useState(INIT_ORDERS);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeId,    setActiveId]    = useState(null);
  const [filterTab,   setFilterTab]   = useState('all');
  const [searchQ,     setSearchQ]     = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [dateRange,   setDateRange]   = useState({ start:'', end:'' });
  const [sortOrder,   setSortOrder]   = useState('newest');
  const [toast,       setToast]       = useState(null);
  const [expanded,    setExpanded]    = useState(new Set());
  const [refundModal, setRefundModal] = useState(null); /* { count, onConfirm } */

  function updateOrder(id, patch) { setOrders(prev=>prev.map(o=>o.id===id?{...o,...patch}:o)); }
  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null),3000); }
  function setTweak(k,v) { setTweaks(t=>({...t,[k]:v})); }
  function openRefund(count, onConfirm) { setRefundModal({ count, onConfirm: () => { onConfirm(); setRefundModal(null); } }); }

  const counts = {
    all:       orders.length,
    ready:     orders.filter(o=>o.shipStatus==='unlabeled' && !o.addressError).length,
    errors:    orders.filter(o=>o.shipStatus==='unlabeled' && !!o.addressError).length,
    shipping:  orders.filter(o=>o.shipStatus==='label_purchased').length,
    fulfilled: orders.filter(o=>o.shipStatus==='shipped').length,
  };
  const filtered = (() => {
    let list =
      filterTab==='ready'      ? orders.filter(o=>o.shipStatus==='unlabeled' && !o.addressError)
      : filterTab==='errors'   ? orders.filter(o=>o.shipStatus==='unlabeled' && !!o.addressError)
      : filterTab==='shipping' ? orders.filter(o=>o.shipStatus==='label_purchased')
      : filterTab==='fulfilled'? orders.filter(o=>o.shipStatus==='shipped')
      : [...orders];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(o=>
        o.id.toLowerCase().includes(q) ||
        o.buyer.toLowerCase().includes(q) ||
        o.items.some(i=>i.name.toLowerCase().includes(q))
      );
    }
    if (statusFilter) list = list.filter(o=>o.shipStatus===statusFilter);
    if (sortOrder==='oldest') list = [...list].reverse();
    return list;
  })();

  function toggleAll() { setSelectedIds(prev=>prev.size===filtered.length?new Set():new Set(filtered.map(o=>o.id))); }
  function toggleOne(id,e) { e.stopPropagation(); setSelectedIds(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;}); }
  function toggleExpand(id) { setExpanded(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;}); }

  const rowPy = tweaks.compactRows ? '6px' : '10px';

  /* Resolve active order (may be sub-order) */
  let activeOrder = null;
  let handleUpdateFromPanel = updateOrder;
  if (activeId) {
    if (activeId.includes(':')) {
      const [parentId,subId] = activeId.split(':');
      const parent = orders.find(o=>o.id===parentId);
      const sub    = parent?.subOrders?.find(s=>s.subId===subId);
      if (parent && sub) {
        activeOrder = { ...parent, id:parentId, _subId:subId, _parentItems:parent.items, _parentSubOrders:parent.subOrders, items:parent.items.filter(i=>sub.itemIds.includes(i.id)), shipments:sub.shipments||[], shipStatus:sub.shipStatus||'unlabeled', subOrders:null };
        handleUpdateFromPanel = (id, patch) => {
          setOrders(prev=>prev.map(o=>{
            if(o.id!==parentId) return o;
            const newSubs=(o.subOrders||[]).map(s=>s.subId===subId?{...s,...patch}:s);
            return {...o,subOrders:newSubs};
          }));
        };
      }
    } else {
      activeOrder = orders.find(o=>o.id===activeId)||null;
    }
  }

  const FILTER_TABS = [
    { key:'all',       label:'All',            count:counts.all },
    { key:'ready',     label:'Ready to buy',   count:counts.ready },
    { key:'errors',    label:'Review errors',  count:counts.errors,    accent:'#D32F2F' },
    { key:'shipping',  label:'Shipping',        count:counts.shipping,  accent:'#0288D1' },
    { key:'fulfilled', label:'Fulfilled',       count:counts.fulfilled, accent:'#2E7D32' },
  ];

  return (
    <div style={{ display:'flex',height:'100vh',overflow:'hidden',fontFamily:'system-ui,sans-serif',color:'rgba(0,0,0,0.87)',background:'#f5f5f5' }}>
      <style>{`@keyframes lc-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      <Sidebar />
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0 }}>

        {/* Topbar */}
        <div style={{ height:48,flexShrink:0,background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.1)',display:'flex',alignItems:'center',padding:'0 20px',gap:8,boxShadow:'0 1px 2px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize:12,color:'rgba(0,0,0,0.45)' }}>Orders</span>
          <span style={{ color:'rgba(0,0,0,0.3)' }}>›</span>
          <span style={{ fontSize:13,fontWeight:500 }}>Shipments</span>
          <div style={{ flex:1 }} />
          <span style={{ fontSize:11.5,color:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',gap:4 }}>
            <span style={{ color:'#1976D2' }}>✓</span> Connected to <strong style={{ fontWeight:500,color:'rgba(0,0,0,0.65)',marginLeft:3 }}>Shippo</strong>
          </span>
          <button onClick={()=>setEditMode(!editMode)}
            style={{ marginLeft:8,padding:'4px 10px',fontSize:11.5,background:editMode?'#1976D2':'transparent',color:editMode?'#fff':'rgba(0,0,0,0.45)',border:'1px solid',borderColor:editMode?'#1976D2':'#E0E0E0',borderRadius:4,cursor:'pointer' }}>
            Tweaks
          </button>
        </div>

        {/* Search & Filter row */}
        <SearchFilterRow
          searchQ={searchQ} setSearchQ={setSearchQ}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          dateRange={dateRange} setDateRange={setDateRange}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
        />

        <div style={{ flex:1,display:'flex',overflow:'hidden' }}>
          {/* Orders table */}
          <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0,background:'#fff' }}>
            <div style={{ flexShrink:0,borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ display:'flex',padding:'0 20px' }}>
                {FILTER_TABS.map(t=>{
                  const act=filterTab===t.key; const col=t.accent||'#1976D2';
                  const badgeBg  = act && t.accent ? '#FEECEC' : '#F5F5F5';
                  const badgeCol = act && t.accent ? t.accent   : 'rgba(0,0,0,0.45)';
                  return (
                    <button key={t.key} onClick={()=>setFilterTab(t.key)}
                      style={{ padding:'10px 14px',fontSize:13,fontWeight:act?500:400,color:act?col:'rgba(0,0,0,0.55)',background:'none',border:'none',borderBottom:act?`2px solid ${col}`:'2px solid transparent',cursor:'pointer',display:'flex',alignItems:'center',gap:6 }}>
                      {t.label}
                      <span style={{ fontSize:11,padding:'1px 6px',borderRadius:9999,background:badgeBg,color:badgeCol,fontWeight:500 }}>{t.count}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ padding:'7px 20px',display:'flex',alignItems:'center',gap:8,minHeight:42,borderTop:'1px solid rgba(0,0,0,0.05)' }}>
                {/* Selection count */}
                <span style={{ fontSize:12,color:'rgba(0,0,0,0.45)',minWidth:72 }}>
                  {selectedIds.size>0
                    ? <><strong style={{ fontWeight:500,color:'rgba(0,0,0,0.7)' }}>{selectedIds.size}</strong> selected</>
                    : `${filtered.length} order${filtered.length!==1?'s':''}`}
                </span>

                {(() => {
                  const selectedOrders = filtered.filter(o=>selectedIds.has(o.id));
                  const total = selectedOrders.length;

                  /* Only orders with a purchased label can have a label / packing slip printed. */
                  const printable = selectedOrders.filter(o=>
                    o.shipStatus==='label_purchased'||o.shipStatus==='shipped'
                  ).length;
                  const skipped = total - printable;
                  const noneToPrint = total===0 || printable===0;

                  const labelText = total===0 ? 'Print labels'
                    : printable===0 ? 'No labels to print'
                    : `Print ${printable} label${printable!==1?'s':''}`;
                  const slipText  = total===0 ? 'Print packing slips'
                    : printable===0 ? 'No slips to print'
                    : `Print ${printable} packing slip${printable!==1?'s':''}`;

                  const tip = (noun) => total===0 ? `Select orders to print their ${noun}s`
                    : printable===0 ? `None of the ${total} selected orders have a purchased label yet`
                    : `${printable} ready to print${skipped>0?` · ${skipped} skipped (no label yet)`:''}`;

                  const primaryBtn = { display:'flex',alignItems:'center',padding:'5px 12px',fontSize:12,fontWeight:600,borderRadius:5,whiteSpace:'nowrap',border:'none' };
                  const ghostBtn   = { display:'flex',alignItems:'center',padding:'5px 12px',fontSize:12,fontWeight:500,borderRadius:5,whiteSpace:'nowrap' };

                  return (
                    <>
                      {/* Print Label — primary */}
                      <button
                        disabled={noneToPrint}
                        title={tip('label')}
                        onClick={()=>!noneToPrint&&showToast(`🖨 Printing ${printable} label${printable!==1?'s':''}…`)}
                        style={{ ...primaryBtn, background:noneToPrint?'#E0E0E0':'#1976D2', color:noneToPrint?'rgba(0,0,0,0.28)':'#fff', cursor:noneToPrint?'not-allowed':'pointer' }}>
                        🖨 {labelText}
                      </button>

                      {/* Print Packing Slip */}
                      <button
                        disabled={noneToPrint}
                        title={tip('packing slip')}
                        onClick={()=>!noneToPrint&&showToast(`🧾 Printing ${printable} packing slip${printable!==1?'s':''}…`)}
                        style={{ ...ghostBtn, background:noneToPrint?'#F5F5F5':'transparent', color:noneToPrint?'rgba(0,0,0,0.28)':'rgba(0,0,0,0.65)', border:`1px solid ${noneToPrint?'#E0E0E0':'rgba(0,0,0,0.2)'}`, cursor:noneToPrint?'not-allowed':'pointer' }}>
                        🧾 {slipText}
                      </button>

                      {/* Helper: only appears when some selected orders can't print */}
                      {total>0 && skipped>0 && (
                        <span style={{ fontSize:12, color:'rgba(0,0,0,0.45)', whiteSpace:'nowrap' }}>
                          {skipped} of {total} selected don’t have a label yet
                        </span>
                      )}
                    </>
                  );
                })()}

                {selectedIds.size>0&&(
                  <button onClick={()=>setSelectedIds(new Set())} style={{ marginLeft:'auto',fontSize:12,color:'rgba(0,0,0,0.45)',background:'none',border:'none',cursor:'pointer' }}>Clear</button>
                )}
              </div>
            </div>

            <div style={{ flex:1,overflowY:'auto' }}>
              <table style={{ width:'100%',borderCollapse:'collapse',tableLayout:'fixed' }}>
                <colgroup>
                  <col style={{ width:32 }}/>     {/* checkbox */}
                  <col style={{ width:120 }}/>    {/* Order # */}
                  <col style={{ width:60 }}/>     {/* Channel */}
                  <col style={{ width:160 }}/>    {/* Destination */}
                  <col style={{ width:'auto' }}/> {/* Items */}
                  <col style={{ width:180 }}/>    {/* Carrier + Tracking */}
                  <col style={{ width:140 }}/>    {/* Fulfillment Status */}
                  <col style={{ width:40 }}/>     {/* More actions */}
                </colgroup>
                <thead style={{ position:'sticky',top:0,zIndex:1 }}>
                  <tr style={{ background:'#FAFAFA',borderBottom:'2px solid rgba(0,0,0,0.07)' }}>
                    <th style={{ padding:'10px 12px',height:36,textAlign:'center' }}>
                      <input type="checkbox" checked={selectedIds.size===filtered.length&&filtered.length>0} onChange={toggleAll} />
                    </th>
                    {['Order #','Channel','Destination','Items','Carrier & Tracking','Fulfillment Status',''].map(h=>(
                      <th key={h} style={{ padding:'10px 10px',height:36,textAlign:'left',fontSize:11,fontWeight:500,color:'rgba(0,0,0,0.45)',letterSpacing:'0.5px',textTransform:'uppercase',whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order=>{
                    const isActive   = activeId===order.id;
                    const isSelected = selectedIds.has(order.id);
                    const firstItem  = order.items[0];
                    const hasSubs    = order.subOrders && order.subOrders.length>0;
                    const isExpanded = expanded.has(order.id);
                    const shipment   = order.shipments?.[0];
                    return (
                      <>
                        <tr key={order.id}
                          onClick={()=>hasSubs?toggleExpand(order.id):setActiveId(isActive?null:order.id)}
                          style={{ borderBottom:hasSubs&&isExpanded?'none':'1px solid rgba(0,0,0,0.055)',background:isActive?'#EBF4FF':isSelected?'rgba(25,118,210,0.04)':'#fff',cursor:'pointer' }}>

                          {/* Checkbox */}
                          <td style={{ padding:'10px 12px',textAlign:'center' }} onClick={e=>toggleOne(order.id,e)}>
                            <input type="checkbox" checked={isSelected} readOnly onClick={e=>{e.stopPropagation();toggleOne(order.id,e);}} />
                          </td>

                          {/* Order # */}
                          <td style={{ padding:'10px 10px' }}>
                            <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                              {hasSubs&&<span style={{ fontSize:10,color:'rgba(0,0,0,0.4)',cursor:'pointer',userSelect:'none' }}>{isExpanded?'▲':'▽'}</span>}
                              <div>
                                <div style={{ fontSize:12,fontFamily:'monospace',color:'#1976D2',fontWeight:500 }}>{order.id}</div>
                                <div style={{ fontSize:11,color:'rgba(0,0,0,0.4)',marginTop:1 }}>{order.date}</div>
                              </div>
                            </div>
                          </td>

                          {/* Channel */}
                          <td style={{ padding:'10px 10px' }}>
                            <span style={{ fontSize:10.5,fontWeight:700,color:order.channel==='ebay'?'#E53238':'#1976D2',border:`1px solid ${order.channel==='ebay'?'#E53238':'#1976D2'}`,borderRadius:3,padding:'1px 5px' }}>
                              {order.channel==='ebay'?'eBay':order.channel}
                            </span>
                          </td>

                          {/* Destination */}
                          <td style={{ padding:'10px 10px' }}>
                            <DestinationCell order={order} />
                          </td>

                          {/* Items — empty for the parent (split) order row */}
                          <td style={{ padding:'10px 10px' }}>
                            {!hasSubs && <ItemsCell items={order.items} />}
                          </td>

                          {/* Carrier & Tracking */}
                          <td style={{ padding:'10px 10px' }}>
                            <TrackingCell shipment={shipment} />
                          </td>

                          {/* Fulfillment Status */}
                          <td style={{ padding:'10px 10px' }}>
                            <Chip status={order.shipStatus} />
                          </td>

                          {/* More actions ⋮ */}
                          <td style={{ padding:'10px 6px', textAlign:'center' }} onClick={e=>e.stopPropagation()}>
                            <MoreActionsMenu
                              order={order}
                              subOrder={false}
                              isFulfilled={order.shipStatus==='label_purchased'||order.shipStatus==='shipped'}
                              isRefunded={order.shipStatus==='refund_requested'||order.shipStatus==='refunded'}
                              onOpenPanel={()=>setActiveId(isActive?null:order.id)}
                              onOpenSplit={()=>{ setActiveId(order.id); }}
                              onRequestRefund={()=>openRefund(1, ()=>{
                                updateOrder(order.id,{ shipStatus:'refund_requested', shipments:(order.shipments||[]).map(s=>({...s,refundStatus:'requested'})) });
                                setRefundModal(null);
                                showToast('↩ Refund requested · credited within 14 days');
                              })}
                            />
                          </td>
                        </tr>

                        {/* Sub-order rows */}
                        {hasSubs&&isExpanded&&order.subOrders.map((sub,si)=>{
                          const subKey=`${order.id}:${sub.subId}`;
                          const isSubActive=activeId===subKey;
                          const subItems=order.items.filter(i=>sub.itemIds.includes(i.id));
                          const totalItems=subItems.reduce((s,i)=>s+i.qty,0);
                          const subShipment=sub.shipments?.[0];
                          const isLast=si===order.subOrders.length-1;
                          return (
                            <tr key={sub.subId} onClick={()=>setActiveId(isSubActive?null:subKey)}
                              style={{ borderBottom:isLast?'1px solid rgba(0,0,0,0.055)':'none',background:isSubActive?'#EBF4FF':'#F5F9FF',cursor:'pointer' }}>
                              <td style={{ padding:'10px 12px',textAlign:'center' }} />

                              {/* Order # (sub label) */}
                              <td style={{ padding:'10px 10px 10px 24px' }}>
                                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                                  <span style={{ fontSize:13,color:'rgba(0,0,0,0.3)' }}>↳</span>
                                  <div style={{ fontSize:12,color:'rgba(0,0,0,0.6)',fontWeight:500 }}>{sub.label}</div>
                                </div>
                              </td>

                              {/* Channel */}
                              <td />

                              {/* Destination */}
                              <td style={{ padding:'10px 10px' }}>
                                <div style={{ fontSize:11,color:'rgba(0,0,0,0.45)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{order.buyer}</div>
                                <div style={{ fontSize:11,color:'rgba(0,0,0,0.4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{order.shipTo.city}, {order.shipTo.state}</div>
                              </td>

                              {/* Items */}
                              <td style={{ padding:'10px 10px' }}>
                                <ItemsCell items={subItems} />
                              </td>

                              {/* Carrier & Tracking */}
                              <td style={{ padding:'10px 10px' }}>
                                <TrackingCell shipment={subShipment} />
                              </td>

                              {/* Fulfillment Status */}
                              <td style={{ padding:'10px 10px' }}>
                                <Chip status={sub.shipStatus||'unlabeled'} small />
                              </td>

                              {/* More actions ⋮ */}
                              <td style={{ padding:'10px 6px', textAlign:'center' }} onClick={e=>e.stopPropagation()}>
                                <MoreActionsMenu
                                  order={order}
                                  subOrder={true}
                                  isFulfilled={sub.shipStatus==='label_purchased'||sub.shipStatus==='shipped'}
                                  isRefunded={sub.shipStatus==='refund_requested'||sub.shipStatus==='refunded'}
                                  onOpenPanel={()=>setActiveId(isSubActive?null:subKey)}
                                  onOpenSplit={()=>{}}
                                  onRequestRefund={()=>openRefund(1, ()=>{
                                    setOrders(prev=>prev.map(o=>{
                                      if(o.id!==order.id) return o;
                                      const newSubs=(o.subOrders||[]).map(s=>s.subId===sub.subId
                                        ? {...s, shipStatus:'refund_requested', shipments:(s.shipments||[]).map(sh=>({...sh,refundStatus:'requested'}))}
                                        : s);
                                      return {...o, subOrders:newSubs};
                                    }));
                                    setRefundModal(null);
                                    showToast('↩ Refund requested · credited within 14 days');
                                  })}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ width:activeOrder?tweaks.panelWidth:0,flexShrink:0,overflow:'hidden',transition:'width 0.2s cubic-bezier(0.4,0,0.2,1)',display:'flex',flexDirection:'column' }}>
            {activeOrder&&(
              <ShipmentPanel
                key={activeId}
                order={activeOrder}
                onClose={()=>setActiveId(null)}
                onUpdate={handleUpdateFromPanel}
                onUpdateParent={updateOrder}
                openRefundModal={openRefund}
                showToast={showToast}
              />
            )}
          </div>
        </div>
      </div>

      {/* Request Refund confirmation modal */}
      {refundModal && (
        <RefundModal
          count={refundModal.count}
          onConfirm={refundModal.onConfirm}
          onClose={()=>setRefundModal(null)}
        />
      )}

      {/* Toast */}
      {toast&&(
        <div style={{ position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#323232',color:'#fff',padding:'10px 20px',borderRadius:4,fontSize:13,boxShadow:'0 4px 12px rgba(0,0,0,0.25)',zIndex:9999,whiteSpace:'nowrap' }}>
          {toast}
        </div>
      )}

      {editMode&&(
        <div style={{ position:'fixed',bottom:20,right:20,background:'#fff',border:'1px solid rgba(0,0,0,0.12)',borderRadius:4,boxShadow:'0 8px 24px rgba(0,0,0,0.12)',padding:'16px 20px',width:264,zIndex:9998 }}>
          <div style={{ fontSize:13,fontWeight:600,marginBottom:14 }}>Tweaks</div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10.5,fontWeight:500,color:'rgba(0,0,0,0.45)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:7 }}>Panel width — {tweaks.panelWidth}px</div>
            <input type="range" min={400} max={640} step={20} value={tweaks.panelWidth} onChange={e=>setTweak('panelWidth',+e.target.value)} style={{ width:'100%',accentColor:'#1976D2' }} />
          </div>
          <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12 }}>
            <input type="checkbox" checked={tweaks.compactRows} onChange={e=>setTweak('compactRows',e.target.checked)} /> Compact rows
          </label>
        </div>
      )}
    </div>
  );
}
