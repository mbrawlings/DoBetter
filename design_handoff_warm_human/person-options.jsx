/* Person HUB system — fleshed-out Option 2 (overview hub + drill-down).
   Read-only hub → dedicated list screens; add/edit via the app's existing
   DRY bottom-sheet (FormModal pattern). Built on Warm & Human, light + dark.
   Heavy-data person so overflow is real. */

// ─── themes ──────────────────────────────────────────────────────────────────
const LIGHT = {
  dark:false, font:"'Plus Jakarta Sans', system-ui, sans-serif",
  bg:'#FAF7F2', barBg:'rgba(250,247,242,0.86)', surface:'#FFFFFF', raised:'#F4EFE7',
  primary:'#B85C3E', primaryFg:'#FFFFFF', primarySoft:'#F8E5DC',
  text:'#1B1714', textMuted:'#6F6860', textFaint:'#A6A096',
  border:'#ECE4D6', borderStrong:'#D8CCB4', success:'#6F8E3F', danger:'#C44A3E',
  giftBg:'#F2E9D9', giftFg:'#8E6A2A',
  pal:['#B85C3E','#6F8E3F','#3F7B8E','#8E5C9C','#C9963D','#5D6E54','#9C5C72','#3F6E8E'],
  status:{ idea:{bg:'#F4EFE7',fg:'#6F6860'}, shortlist:{bg:'#F8E5DC',fg:'#B85C3E'},
           purchased:{bg:'#E7EEDB',fg:'#5C7A2E'}, gifted:{bg:'#E5EBEE',fg:'#3F7B8E'} },
};
const DARK = {
  dark:true, font:"'Plus Jakarta Sans', system-ui, sans-serif",
  bg:'#1A1614', barBg:'rgba(26,22,20,0.86)', surface:'#211C18', raised:'#2A2520',
  primary:'#D17A5C', primaryFg:'#FFFFFF', primarySoft:'#3A1F16',
  text:'#F8F4ED', textMuted:'#9C958A', textFaint:'#5F594F',
  border:'#2F2925', borderStrong:'#3F3833', success:'#8FAE5A', danger:'#D86A5E',
  giftBg:'#3A3328', giftFg:'#D9B66E',
  pal:['#B85C3E','#6F8E3F','#3F7B8E','#8E5C9C','#C9963D','#5D6E54','#9C5C72','#3F6E8E'],
  status:{ idea:{bg:'#2A2520',fg:'#9C958A'}, shortlist:{bg:'#3A1F16',fg:'#D17A5C'},
           purchased:{bg:'#26301E',fg:'#8FAE5A'}, gifted:{bg:'#222E33',fg:'#6FA0B5'} },
};
const ThemeCtx = React.createContext(LIGHT);
const useT = () => React.useContext(ThemeCtx);

// ─── heavy sample person ───────────────────────────────────────────────────────
const MAYA = {
  firstName:'Maya', lastName:'Patel', relationship:'Sister', city:'San Francisco',
  employer:'Stripe', role:'Engineering Manager', birthday:'Apr 12', lastContact:'2d ago',
  interests:['rock climbing','pottery','ambient music','mezcal','trail running'],
  current:[
    'Started a new role at Stripe',
    'Training for the SF half-marathon',
    'Apartment hunting in the Mission',
  ],
  upcoming:[
    { title:'Birthday',            when:'Apr 12', rel:'in 9 days',   note:'Turning 37 · loves orchids', icon:'cake',      soon:true },
    { title:'Half-marathon',       when:'Apr 27', rel:'in 24 days',  note:'Golden Gate Park',           icon:'star' },
    { title:'Wedding anniversary', when:'Jun 3',  rel:'in 2 months', note:'5 yrs with Sam',             icon:'heart' },
    { title:'Work offsite',        when:'Jul 15', rel:'in 3 months', note:'Lisbon',                     icon:'briefcase' },
  ],
  gifts:[
    { title:'Ceramics workshop voucher', occasion:'Birthday',    status:'shortlist', priority:1 },
    { title:'Trail running vest',        occasion:'Birthday',    status:'shortlist', priority:1 },
    { title:'Vintage Polaroid SX-70',    occasion:'Holiday',     status:'idea',      priority:2 },
    { title:'Noise-cancelling earbuds',  occasion:'Holiday',     status:'idea',      priority:2 },
    { title:'Mezcal tasting set',        occasion:'Anniversary', status:'idea',      priority:3 },
    { title:'Climbing gym membership',   occasion:'Birthday',    status:'idea',      priority:3 },
    { title:'Orchid subscription',       occasion:'Birthday',    status:'purchased', priority:1 },
    { title:'Pottery tool kit',          occasion:'Just because',status:'gifted',    priority:2 },
  ],
  moments:[
    { summary:'Dinner at Nopa — caught up about the promotion', when:'2d',  channel:'In person', loc:'Nopa, SF' },
    { summary:'Called to check in after her climbing trip',     when:'1w',  channel:'Call' },
    { summary:'Texted about the weekend pottery class',         when:'1w',  channel:'Text' },
    { summary:'Coffee before her flight to Vancouver',          when:'2w',  channel:'In person', loc:'Sightglass' },
    { summary:'Video call with the whole family',               when:'3w',  channel:'Video' },
    { summary:'Sent her the trail map for Marin',               when:'3w',  channel:'Text' },
    { summary:'Helped her move a few boxes',                    when:'1mo', channel:'In person' },
    { summary:'Birthday planning call with Sam',                when:'1mo', channel:'Call' },
    { summary:'Ran into her at the climbing gym',               when:'2mo', channel:'In person', loc:'Dogpatch Boulders' },
    { summary:'Long catch-up walk at Crissy Field',             when:'2mo', channel:'In person' },
    { summary:'Recommended the ambient playlist',               when:'3mo', channel:'Text' },
    { summary:'Toast at her housewarming',                      when:'3mo', channel:'In person', loc:'Mission' },
  ],
};

// ─── primitives (theme-aware) ────────────────────────────────────────────────
function Avatar({ name, size=44, color }) {
  const T = useT();
  const bg = color || T.pal[(name.charCodeAt(0)+(name.charCodeAt(1)||0)) % T.pal.length];
  return <div style={{ width:size, height:size, borderRadius:size/2, background:bg, color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:size*0.38, flexShrink:0 }}>{name}</div>;
}
function Label({ children, action }) {
  const T = useT();
  return <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px 8px' }}>
    <div style={{ fontSize:12, fontWeight:600, letterSpacing:1.2, textTransform:'uppercase', color:T.textMuted }}>{children}</div>
    {action}
  </div>;
}
function Card({ children, style, onClick }) {
  const T = useT();
  return <div onClick={onClick} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
    padding:'14px 16px', cursor:onClick?'pointer':'default',
    boxShadow:T.dark?'none':'0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(28,20,12,0.04)', ...style }}>{children}</div>;
}
function IconBlock({ icon, bg, fg, size=40 }) {
  const Glyph = I[icon] || I.star;
  return <div style={{ width:size, height:size, borderRadius:10, background:bg, color:fg,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <Glyph width={size*0.5} height={size*0.5}/></div>;
}
function AddLink({ label, onClick }) {
  const T = useT();
  return <button onClick={onClick} style={{ all:'unset', cursor:'pointer', alignSelf:'flex-start',
    color:T.primary, fontSize:14, fontWeight:500, padding:'8px 4px', display:'flex', alignItems:'center', gap:5 }}>
    <I.plus width={16} height={16}/> {label}</button>;
}
function Stack({ children, style }) {
  return <div style={{ margin:'0 16px', display:'flex', flexDirection:'column', gap:8, ...style }}>{children}</div>;
}
function SortBtn({ label }) {
  const T = useT();
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, color:T.primary, fontWeight:500, cursor:'pointer' }}>
    <I.sortAlpha width={15} height={15}/> {label}</span>;
}

function Device({ children, overlay, theme=LIGHT }) {
  return (
    <ThemeCtx.Provider value={theme}>
      <IOSDevice width={402} height={874} dark={theme.dark}>
        <div style={{ position:'relative', height:'100%', background:theme.bg, fontFamily:theme.font, color:theme.text,
          fontFeatureSettings:'"ss01","cv11"' }}>
          <div style={{ height:'100%', overflow:'auto' }}>{children}</div>
          {overlay}
        </div>
      </IOSDevice>
    </ThemeCtx.Provider>
  );
}
function TopBar({ title, onBack, trailing }) {
  const T = useT();
  return (
    <div style={{ padding:'52px 12px 8px', position:'sticky', top:0, zIndex:5,
      background:T.barBg, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', borderBottom:`1px solid ${T.border}` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:32 }}>
        <div style={{ width:80, display:'flex', alignItems:'center' }}>
          {onBack ? <button onClick={onBack} style={{ all:'unset', display:'flex', alignItems:'center', gap:1, color:T.primary, cursor:'pointer', fontSize:15, fontWeight:500 }}><I.back width={22} height={22}/> People</button> : null}
        </div>
        <div style={{ flex:1, textAlign:'center', fontWeight:600, fontSize:16, letterSpacing:-0.2 }}>{title}</div>
        <div style={{ width:80, display:'flex', justifyContent:'flex-end', alignItems:'center' }}>{trailing}</div>
      </div>
    </div>
  );
}
function Fact({ icon, label, tint, onClick }) {
  const T = useT();
  const Glyph = I[icon] || I.star;
  return <span onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:999,
    whiteSpace:'nowrap', fontSize:13, fontWeight:500, cursor:onClick?'pointer':'default',
    background: tint?T.primarySoft:T.surface, color: tint?T.primary:T.text, border:`1px solid ${tint?T.primarySoft:T.border}` }}>
    <Glyph width={14} height={14}/> {label}</span>;
}
function CurrentEvents({ onEdit }) {
  const T = useT();
  return MAYA.current.map((e,i) => (
    <Card key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px' }} onClick={onEdit}>
      <span style={{ width:7, height:7, borderRadius:4, background:T.success, flexShrink:0 }}/>
      <div style={{ flex:1, fontSize:15 }}>{e}</div>
      {onEdit && <I.pencil width={15} height={15} style={{ color:T.textFaint }}/>}
    </Card>
  ));
}
function EventCard({ e, onClick }) {
  const T = useT();
  return (
    <Card style={{ display:'flex', alignItems:'center', gap:12 }} onClick={onClick}>
      <IconBlock icon={e.icon} bg={e.soon?T.primarySoft:T.raised} fg={e.soon?T.primary:T.textMuted}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:15, fontWeight:600 }}>{e.title}</span>
          {e.soon && <span style={{ fontSize:11, fontWeight:600, color:T.primary, background:T.primarySoft, padding:'2px 7px', borderRadius:999 }}>{e.rel}</span>}
        </div>
        <div style={{ fontSize:13, color:T.textMuted, marginTop:2 }}>{e.when} · {e.note}</div>
      </div>
      {onClick && <I.chevR width={16} height={16} style={{ color:T.textFaint }}/>}
    </Card>
  );
}
function GiftCard({ g, onClick }) {
  const T = useT();
  const sc = T.status[g.status] || T.status.idea;
  return (
    <Card style={{ display:'flex', alignItems:'center', gap:12 }} onClick={onClick}>
      <IconBlock icon="gift" bg={T.giftBg} fg={T.giftFg}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:600 }}>{g.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
          <span style={{ fontSize:11, fontWeight:600, textTransform:'capitalize', color:sc.fg, background:sc.bg, padding:'2px 8px', borderRadius:999 }}>{g.status}</span>
          <span style={{ fontSize:12.5, color:T.textMuted }}>{g.occasion} · P{g.priority}</span>
        </div>
      </div>
      {onClick && <I.chevR width={16} height={16} style={{ color:T.textFaint }}/>}
    </Card>
  );
}
function MomentCard({ m, onClick }) {
  const T = useT();
  return (
    <Card onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:600, letterSpacing:0.6, textTransform:'uppercase', color:T.primary }}>{m.channel}</span>
        <span style={{ fontSize:12.5, color:T.textFaint }}>{m.when}</span>
      </div>
      <div style={{ fontSize:15, lineHeight:1.4 }}>{m.summary}</div>
      {m.loc && <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6, fontSize:12.5, color:T.textMuted }}>
        <I.pin width={13} height={13}/> {m.loc}</div>}
    </Card>
  );
}

// ─── DRY bottom-sheet (mirrors src/FormModal) ───────────────────────────────────
function Sheet({ title, onClose, children }) {
  const T = useT();
  return (
    <div style={{ position:'absolute', inset:0, zIndex:40 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(15,12,10,0.4)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, background:T.bg, borderRadius:'20px 20px 0 0',
        padding:'14px 0 36px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)', maxHeight:'90%', overflow:'auto' }}>
        <div style={{ width:36, height:5, borderRadius:3, background:T.borderStrong, margin:'0 auto 16px' }}/>
        <div style={{ padding:'0 20px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <span onClick={onClose} style={{ fontSize:15, color:T.primary, fontWeight:500, cursor:'pointer', minWidth:60 }}>Cancel</span>
          <span style={{ fontSize:17, fontWeight:700, letterSpacing:-0.2 }}>{title}</span>
          <span onClick={onClose} style={{ fontSize:15, color:T.primary, fontWeight:600, cursor:'pointer', minWidth:60, textAlign:'right' }}>Save</span>
        </div>
        {children}
      </div>
    </div>
  );
}
function FieldGroup({ children }) {
  const T = useT();
  return <div style={{ margin:'0 16px', background:T.surface, borderRadius:16, overflow:'hidden', border:`1px solid ${T.border}` }}>{children}</div>;
}
function Field({ label, value, placeholder, focus, last, multi }) {
  const T = useT();
  return <div style={{ padding:'12px 16px', borderBottom:last?'none':`1px solid ${T.border}`,
    display:'flex', flexDirection:multi?'column':'row', alignItems:multi?'stretch':'center', gap:multi?5:12,
    background:focus?(T.dark?'#2D2723':'#FFFBF5'):'transparent' }}>
    <div style={{ width:multi?'auto':96, fontSize:13, color:focus?T.primary:T.textMuted, fontWeight:focus?600:500 }}>{label}</div>
    <div style={{ flex:1, fontSize:16, color:value?T.text:T.textFaint }}>
      {value || placeholder}
      {focus && <span style={{ display:'inline-block', width:2, height:18, background:T.primary, marginLeft:2, verticalAlign:'middle' }}/>}
    </div>
  </div>;
}
function ChipRow({ options, selected }) {
  const T = useT();
  return <div style={{ padding:'0 16px', display:'flex', flexWrap:'wrap', gap:8 }}>
    {options.map(o => { const on=o===selected; return <span key={o} style={{ padding:'8px 14px', borderRadius:999, fontSize:14, fontWeight:500, textTransform:'capitalize',
      background:on?T.primary:T.surface, color:on?'#fff':T.text, border:`1px solid ${on?T.primary:T.border}` }}>{o}</span>; })}
  </div>;
}
function GiftSheetBody() {
  const T = useT();
  return <div>
    <FieldGroup>
      <Field label="Title" value="Ceramics workshop voucher" focus/>
      <Field label="Notes" value="The Crucible — Oakland. Sat classes." last multi/>
    </FieldGroup>
    <Label>Occasion</Label><ChipRow options={['birthday','holiday','anniversary','other']} selected="birthday"/>
    <Label>Status</Label><ChipRow options={['idea','shortlist','purchased','gifted']} selected="shortlist"/>
    <Label>Priority</Label>
    <div style={{ padding:'0 16px', display:'flex', gap:8 }}>
      {[1,2,3].map(n => <div key={n} style={{ flex:1, padding:'12px 0', textAlign:'center', borderRadius:12, fontWeight:600, fontSize:16,
        background:n===1?T.primary:T.surface, color:n===1?'#fff':T.text, border:`1px solid ${n===1?T.primary:T.border}` }}>{n}</div>)}
    </div>
  </div>;
}
function MomentSheetBody() {
  return <div>
    <FieldGroup>
      <Field label="Summary" value="Dinner at Nopa — caught up about the promotion" focus multi/>
      <Field label="Date" value="Apr 30, 2026"/>
      <Field label="Where" value="Nopa, SF" last/>
    </FieldGroup>
    <Label>Channel</Label><ChipRow options={['in person','call','text','video','other']} selected="in person"/>
  </div>;
}
function EventSheetBody() {
  return <div>
    <FieldGroup>
      <Field label="Title" value="Birthday" focus/>
      <Field label="Date" value="Apr 12, 2026"/>
      <Field label="Notes" value="Turning 37 · loves orchids" last multi/>
    </FieldGroup>
  </div>;
}
function CurrentSheetBody() {
  return <FieldGroup><Field label="Event" value="Started a new role at Stripe" focus last multi/></FieldGroup>;
}
const SHEETS = {
  gift:    { title:'Edit gift idea', body:GiftSheetBody },
  giftNew: { title:'New gift idea',  body:GiftSheetBody },
  moment:  { title:'Edit moment',    body:MomentSheetBody },
  momentNew:{title:'New moment',     body:MomentSheetBody },
  event:   { title:'Edit event',     body:EventSheetBody },
  eventNew:{ title:'New event',      body:EventSheetBody },
  current: { title:'Edit current event', body:CurrentSheetBody },
  currentNew:{ title:'New current event', body:CurrentSheetBody },
};

// ─── shared hub body (so light + dark reuse it) ─────────────────────────────────
function ProfileBlock({ onOpenDetails }) {
  const T = useT();
  const p = MAYA;
  const clickable = Boolean(onOpenDetails);
  return (
    <div style={{ padding:'14px 20px 4px' }}>
      <div onClick={onOpenDetails} style={{ display:'flex', alignItems:'center', gap:14, cursor:clickable?'pointer':'default' }}>
        <Avatar name={initials(p.firstName,p.lastName)} size={68}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.6, lineHeight:1.1 }}>{p.firstName} {p.lastName}</div>
          <div style={{ fontSize:14, color:T.textMuted, marginTop:3 }}>{p.relationship} · {p.city}</div>
        </div>
        {clickable && <I.chevR width={18} height={18} style={{ color:T.textFaint }}/>}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:14, overflow:'auto' }}>
        <Fact icon="cake" label={`Birthday ${p.birthday}`} tint/>
        <Fact icon="briefcase" label={p.employer}/>
        <Fact icon="chat" label={`Last contact ${p.lastContact}`}/>
      </div>
    </div>
  );
}
function SummaryRow({ icon, bg, fg, title, count, preview, onClick }) {
  const T = useT();
  return (
    <Card style={{ display:'flex', alignItems:'center', gap:14 }} onClick={onClick}>
      <IconBlock icon={icon} bg={bg} fg={fg} size={44}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
          <span style={{ fontSize:16, fontWeight:600 }}>{title}</span>
          <span style={{ fontSize:13, color:T.textFaint, fontWeight:600 }}>{count}</span>
        </div>
        <div style={{ fontSize:13, color:T.textMuted, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{preview}</div>
      </div>
      <I.chevR width={18} height={18} style={{ color:T.textFaint }}/>
    </Card>
  );
}
function HubBody({ go, openSheet }) {
  const T = useT();
  return (
    <>
      <ProfileBlock onOpenDetails={()=>go('edit')}/>
      <Label action={<AddLink label="Add" onClick={()=>openSheet('currentNew')}/>}>What's going on</Label>
      <Stack>{CurrentEvents({ onEdit:()=>openSheet('current') })}</Stack>
      <Label>Sections</Label>
      <Stack style={{ gap:10, paddingBottom:40 }}>
        <SummaryRow icon="cake" bg={T.primarySoft} fg={T.primary} title="Events" count="7"
          preview="Birthday in 9 days · half-marathon Apr 27" onClick={()=>go('events')}/>
        <SummaryRow icon="chat" bg={T.dark?'#22323A':'#E5EBEE'} fg="#3F7B8E" title="Moments" count="12"
          preview="Dinner at Nopa — about the promotion · 2d" onClick={()=>go('moments')}/>
        <SummaryRow icon="gift" bg={T.giftBg} fg={T.giftFg} title="Gift ideas" count="8"
          preview="2 shortlisted · Ceramics workshop voucher" onClick={()=>go('gifts')}/>
      </Stack>
    </>
  );
}

// ─── MAIN: interactive hub + drill-downs + sheets ───────────────────────────────
function PersonHub({ theme=LIGHT }) {
  const [screen, setScreen] = React.useState('hub');
  const [sheet, setSheet] = React.useState(null);
  const [giftFilter, setGiftFilter] = React.useState('All');
  const go = setScreen;
  const openSheet = setSheet;
  const closeSheet = () => setSheet(null);

  const sheetDef = sheet ? SHEETS[sheet] : null;
  const overlay = sheetDef ? <Sheet title={sheetDef.title} onClose={closeSheet}>{React.createElement(sheetDef.body)}</Sheet> : null;

  const editTrailing = <span onClick={()=>go('edit')} style={{ color:theme.primary, fontWeight:600, fontSize:15, cursor:'pointer' }}>Edit</span>;
  const addTrailing = (type) => <button onClick={()=>openSheet(type)} style={{ all:'unset', cursor:'pointer', color:theme.primary }}><I.plus width={22} height={22}/></button>;

  let content;
  if (screen === 'hub') {
    content = <><TopBar title={`${MAYA.firstName} ${MAYA.lastName}`} onBack={()=>{}} trailing={editTrailing}/><HubBody go={go} openSheet={openSheet}/></>;
  } else if (screen === 'events') {
    content = <>
      <TopBar title="Events" onBack={()=>go('hub')} trailing={addTrailing('eventNew')}/>
      <Label action={<AddLink label="Add" onClick={()=>openSheet('currentNew')}/>}>What's going on</Label>
      <Stack>{CurrentEvents({ onEdit:()=>openSheet('current') })}</Stack>
      <Label action={<SortBtn label="By date"/>}>Upcoming · 4</Label>
      <Stack style={{ paddingBottom:40 }}>
        {MAYA.upcoming.map((e,i)=><EventCard key={i} e={e} onClick={()=>openSheet('event')}/>)}
      </Stack>
    </>;
  } else if (screen === 'moments') {
    content = <>
      <TopBar title="Moments" onBack={()=>go('hub')} trailing={addTrailing('momentNew')}/>
      <Label action={<SortBtn label="Recent"/>}>{`${MAYA.moments.length} moments`}</Label>
      <Stack style={{ paddingBottom:40 }}>
        {MAYA.moments.map((m,i)=><MomentCard key={i} m={m} onClick={()=>openSheet('moment')}/>)}
      </Stack>
    </>;
  } else if (screen === 'gifts') {
    const filters = [['All',8],['Shortlist',2],['Idea',4],['Purchased',1],['Gifted',1]];
    const list = giftFilter==='All' ? MAYA.gifts : MAYA.gifts.filter(g=>g.status===giftFilter.toLowerCase());
    content = <>
      <TopBar title="Gift ideas" onBack={()=>go('hub')} trailing={addTrailing('giftNew')}/>
      <div style={{ display:'flex', gap:8, padding:'10px 16px 4px', overflow:'auto' }}>
        {filters.map(([f,n])=>{ const on=giftFilter===f; return <span key={f} onClick={()=>setGiftFilter(f)} style={{ padding:'7px 12px', borderRadius:999, fontSize:13, fontWeight:500, whiteSpace:'nowrap', cursor:'pointer',
          background:on?theme.text:theme.surface, color:on?theme.bg:theme.text, border:`1px solid ${on?theme.text:theme.border}` }}>{f} {n}</span>; })}
      </div>
      <Label action={<SortBtn label="Priority"/>}>{giftFilter==='All'?'All ideas':giftFilter}</Label>
      <Stack style={{ paddingBottom:40 }}>
        {list.map((g,i)=><GiftCard key={i} g={g} onClick={()=>openSheet('gift')}/>)}
      </Stack>
    </>;
  } else if (screen === 'edit') {
    content = <EditPersonContent onBack={()=>go('hub')}/>;
  }

  return <Device overlay={overlay} theme={theme}>{content}</Device>;
}

// bio editor (the only "form" left — short, no sections)
function EditPersonContent({ onBack }) {
  const T = useT();
  const p = MAYA;
  return <>
    <TopBar title="Edit" onBack={onBack} trailing={<span style={{ color:T.primary, fontWeight:600, fontSize:15 }}>Save</span>}/>
    <div style={{ padding:'8px 16px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      <Avatar name={initials(p.firstName,p.lastName)} size={84}/>
      <span style={{ color:T.primary, fontSize:14, fontWeight:500, cursor:'pointer' }}>Change photo</span>
    </div>
    <Label>Name</Label>
    <FieldGroup><Field label="First" value={p.firstName}/><Field label="Last" value={p.lastName} last/></FieldGroup>
    <Label>Details</Label>
    <FieldGroup>
      <Field label="City" value={p.city}/>
      <Field label="Employer" value={p.employer}/>
      <Field label="Role" value={p.role}/>
      <Field label="Relationship" value={p.relationship} last/>
    </FieldGroup>
    <Label>Personal</Label>
    <FieldGroup>
      <Field label="Birthday" value="Apr 12, 1989"/>
      <div style={{ padding:'12px 16px' }}>
        <div style={{ fontSize:13, color:T.textMuted, fontWeight:500, marginBottom:8 }}>Interests</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {p.interests.map(i=><span key={i} style={{ padding:'6px 10px 6px 12px', borderRadius:999, fontSize:13, fontWeight:500, background:T.raised, border:`1px solid ${T.border}`, display:'inline-flex', alignItems:'center', gap:6 }}>{i} <I.close width={13} height={13} style={{ color:T.textMuted }}/></span>)}
          <span style={{ padding:'6px 12px', borderRadius:999, fontSize:13, color:T.textFaint, border:`1px dashed ${T.borderStrong}` }}>+ add</span>
        </div>
      </div>
    </FieldGroup>
    <div style={{ padding:'28px 16px 60px' }}>
      <button style={{ all:'unset', cursor:'pointer', display:'block', textAlign:'center', width:'100%', padding:'12px', color:T.danger, fontWeight:500, fontSize:15 }}>Delete person</button>
    </div>
  </>;
}

// ─── exported interactive artboards ─────────────────────────────────────────────
function HubLight() { return <PersonHub theme={LIGHT}/>; }
function HubDark()  { return <PersonHub theme={DARK}/>; }

// ─── empty hub (freshly created person) ─────────────────────────────────────────
function HubEmpty() {
  const T = LIGHT;
  const emptyRow = (icon,bg,fg,title,hint) => (
    <Card style={{ display:'flex', alignItems:'center', gap:14 }}>
      <IconBlock icon={icon} bg={bg} fg={fg} size={44}/>
      <div style={{ flex:1 }}><div style={{ fontSize:16, fontWeight:600 }}>{title}</div>
        <div style={{ fontSize:13, color:T.textFaint, marginTop:2 }}>{hint}</div></div>
      <I.plus width={18} height={18} style={{ color:T.primary }}/>
    </Card>
  );
  return (
    <Device theme={LIGHT}>
      <TopBar title="Maya Patel" onBack={()=>{}} trailing={<span style={{ color:T.primary, fontWeight:600, fontSize:15 }}>Edit</span>}/>
      <div style={{ padding:'14px 20px 4px', display:'flex', alignItems:'center', gap:14 }}>
        <Avatar name="MP" size={68}/>
        <div><div style={{ fontSize:24, fontWeight:700, letterSpacing:-0.6 }}>Maya Patel</div>
          <div style={{ fontSize:14, color:T.textMuted, marginTop:3 }}>Sister · San Francisco</div></div>
      </div>
      <div style={{ margin:'18px 16px 0', padding:'16px', borderRadius:14, background:T.raised, border:`1px dashed ${T.borderStrong}`, textAlign:'center' }}>
        <div style={{ fontSize:14, color:T.textMuted, lineHeight:1.5 }}>Nothing logged yet. Add what's going on, an upcoming event, or your first gift idea — it'll show up here as a quick refresher next time.</div>
      </div>
      <Label>Start adding</Label>
      <Stack style={{ gap:10, paddingBottom:40 }}>
        {emptyRow('cake', T.primarySoft, T.primary, 'Events', 'Birthdays, plans, milestones')}
        {emptyRow('chat', '#E5EBEE', '#3F7B8E', 'Moments', 'Log when you connect')}
        {emptyRow('gift', T.giftBg, T.giftFg, 'Gift ideas', 'Capture ideas as they come')}
      </Stack>
    </Device>
  );
}

// ─── new person (create, with keyboard) ────────────────────────────────────────
function NewPerson() {
  const T = LIGHT;
  return (
    <ThemeCtx.Provider value={LIGHT}>
      <IOSDevice width={402} height={874} keyboard>
        <div style={{ height:'100%', background:T.bg, fontFamily:T.font, color:T.text }}>
          <TopBar title="New person" onBack={null}
            trailing={<span style={{ color:T.textFaint, fontWeight:600, fontSize:15 }}>Save</span>}/>
          <div style={{ padding:'8px 16px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:84, height:84, borderRadius:42, background:T.raised, border:`1px dashed ${T.borderStrong}`, color:T.textFaint, display:'flex', alignItems:'center', justifyContent:'center' }}><I.user width={32} height={32}/></div>
            <span style={{ color:T.primary, fontSize:14, fontWeight:500 }}>Add photo</span>
          </div>
          <Label>Name</Label>
          <FieldGroup><Field label="First" value="Maya" focus/><Field label="Last" value="" placeholder="Required" last/></FieldGroup>
          <Label>Details</Label>
          <FieldGroup>
            <Field label="City" value="" placeholder="Optional"/>
            <Field label="Employer" value="" placeholder="Optional"/>
            <Field label="Relationship" value="" placeholder="Optional" last/>
          </FieldGroup>
          <div style={{ padding:'20px 24px 8px', fontSize:13, color:T.textMuted, textAlign:'center', lineHeight:1.5 }}>
            Just a name to start. Add events, gifts, and moments from their page once saved.
          </div>
        </div>
      </IOSDevice>
    </ThemeCtx.Provider>
  );
}

// ─── note cards ────────────────────────────────────────────────────────────────
const lt = LIGHT;
function noteCard(kicker, title, paras, meta, w=400, h=560) {
  return (
    <div style={{ width:w, minHeight:h, background:'#FBFAF7', borderRadius:18, padding:32, boxSizing:'border-box',
      fontFamily:lt.font, color:lt.text, border:`1px solid ${lt.border}` }}>
      <div style={{ fontFamily:"'Geist Mono', ui-monospace, monospace", fontSize:11, letterSpacing:1, textTransform:'uppercase', color:lt.textMuted }}>{kicker}</div>
      <div style={{ fontSize:26, fontWeight:700, letterSpacing:-0.6, marginTop:10, lineHeight:1.12 }}>{title}</div>
      {paras.map((p,i)=><p key={i} style={{ fontSize:14, lineHeight:1.55, color:'#3A352F', marginTop:14 }} dangerouslySetInnerHTML={{__html:p}}/>)}
      {meta && <div style={{ marginTop:18, paddingTop:16, borderTop:`1px solid ${lt.border}`, display:'flex', flexDirection:'column', gap:9 }}>
        {meta.map(([k,v],i)=><div key={i} style={{ display:'flex', gap:10, fontSize:12.5 }}>
          <span style={{ width:92, flexShrink:0, color:lt.textMuted, fontWeight:600 }}>{k}</span>
          <span style={{ color:lt.text, lineHeight:1.4 }} dangerouslySetInnerHTML={{__html:v}}/></div>)}
      </div>}
    </div>
  );
}
function HubSystemIntro() {
  return noteCard('Option 2 · the system', 'Overview hub + drill-down', [
    'Tapping a person now opens a calm, read-only <b>hub</b> built for the pre-meetup refresher: who they are, what\u2019s going on, and one tappable row per section with a count + the latest item. Deep lists live on their own screens.',
    '<b>Nav model.</b> Today the person screen <i>is</i> an editable form (create &amp; edit in one). This splits it: People \u2192 <b>Hub</b> (read) \u2192 list screens, with bio behind <b>Edit</b>. The old stacked form shrinks to just the bio.',
    '<b>Edit model.</b> Reuses your shipped DRY bottom sheets (<code>FormModal</code> + <code>GiftIdeaModal</code>/<code>InteractionModal</code>) \u2014 one component for add &amp; edit. <i>Open Moments or Gifts and tap a card to see it.</i>',
  ], [
    ['Hub', 'Identity · what\u2019s going on · section rows'],
    ['Lists', 'Events · Moments · Gifts \u2014 own sort/filter + add'],
    ['Sort', 'Recency now; built to extend (createdAt, status, priority\u2026)'],
    ['Scope', 'Light + dark · empty states · new-person'],
  ], 440, 640);
}

/* ════════════════════════ DELETE UX ════════════════════════ */
// shared confirmation surface — mirrors src/components/modals/ConfirmSheet.tsx
function ConfirmSheet({ title, message, confirmLabel='Delete', onClose }) {
  const T = useT();
  return (
    <div style={{ position:'absolute', inset:0, zIndex:50 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(15,12,10,0.4)' }}/>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, background:T.bg, borderRadius:'20px 20px 0 0', padding:'14px 20px 36px', boxShadow:'0 -8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ width:36, height:5, borderRadius:3, background:T.borderStrong, margin:'0 auto 16px' }}/>
        <div style={{ fontSize:17, fontWeight:700, letterSpacing:-0.2, textAlign:'center' }}>{title}</div>
        {message && <div style={{ fontSize:14, color:T.textMuted, textAlign:'center', marginTop:8, lineHeight:1.45 }}>{message}</div>}
        <div onClick={onClose} style={{ marginTop:24, borderRadius:14, padding:'14px', textAlign:'center', background:T.danger, color:'#fff', fontWeight:600, fontSize:16, cursor:'pointer' }}>{confirmLabel}</div>
        <div onClick={onClose} style={{ marginTop:8, borderRadius:14, padding:'14px', textAlign:'center', color:T.text, fontWeight:600, fontSize:16, cursor:'pointer' }}>Cancel</div>
      </div>
    </div>
  );
}

// ─── A · swipe-to-delete (interactive) ──────────────────────────────────────────
function SwipeRow({ children, revealed, onToggle, onDelete }) {
  const T = useT();
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden' }}>
      <div onClick={onDelete} style={{ position:'absolute', top:0, right:0, bottom:0, width:92, background:T.danger,
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <div style={{ color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
          <I.trash width={20} height={20}/><span style={{ fontSize:12, fontWeight:600 }}>Delete</span></div>
      </div>
      <div onClick={onToggle} style={{ transform:`translateX(${revealed?-100:0}px)`, transition:'transform .22s cubic-bezier(.2,.7,.2,1)', cursor:'pointer' }}>
        {children}
      </div>
    </div>
  );
}
function DeleteSwipe() {
  const [revealed, setRevealed] = React.useState(1);
  const [confirm, setConfirm] = React.useState(false);
  const overlay = confirm ? <ConfirmSheet title="Delete moment?"
    message={'\u201cTexted about the weekend pottery class\u201d will be removed. This can\u2019t be undone.'}
    onClose={()=>setConfirm(false)}/> : null;
  return (
    <Device overlay={overlay} theme={LIGHT}>
      <TopBar title="Moments" onBack={()=>{}} trailing={<I.plus width={22} height={22} style={{ color:LIGHT.primary }}/>}/>
      <div style={{ padding:'10px 20px 2px', fontSize:12.5, color:LIGHT.textFaint }}>Swipe a row left to reveal Delete — tap one to demo.</div>
      <Stack style={{ paddingBottom:40 }}>
        {MAYA.moments.slice(0,6).map((m,i)=>(
          <SwipeRow key={i} revealed={revealed===i} onToggle={()=>setRevealed(revealed===i?-1:i)} onDelete={()=>setConfirm(true)}>
            <MomentCard m={m}/>
          </SwipeRow>
        ))}
      </Stack>
    </Device>
  );
}

// ─── B · delete inside the edit sheet (interactive) ─────────────────────────────
function DeleteInSheet() {
  const [confirm, setConfirm] = React.useState(false);
  const T = LIGHT;
  const body = <>
    <GiftSheetBody/>
    <div style={{ padding:'14px 16px 0' }}>
      <button onClick={()=>setConfirm(true)} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', boxSizing:'border-box', padding:'13px', borderRadius:14, color:T.danger, fontWeight:600, fontSize:15, border:`1px solid ${T.border}` }}>
        <I.trash width={16} height={16}/> Delete gift idea
      </button>
    </div>
  </>;
  const overlay = <>
    <Sheet title="Edit gift idea" onClose={()=>{}}>{body}</Sheet>
    {confirm && <ConfirmSheet title="Delete gift idea?"
      message={'\u201cCeramics workshop voucher\u201d will be removed from Maya\u2019s gift ideas.'}
      onClose={()=>setConfirm(false)}/>}
  </>;
  return (
    <Device overlay={overlay} theme={LIGHT}>
      <TopBar title="Gift ideas" onBack={()=>{}} trailing={<I.plus width={22} height={22} style={{ color:T.primary }}/>}/>
      <Label>All ideas</Label>
      <Stack>{MAYA.gifts.slice(0,3).map((g,i)=><GiftCard key={i} g={g}/>)}</Stack>
    </Device>
  );
}

function DeleteNote() {
  return noteCard('Design system · deleting items', 'Deleting events, moments & gifts', [
    'Delete is destructive, so it should be <b>both easy to reach and hard to do by accident</b>. Two surfaces cover that, and both confirm through your existing <code>ConfirmSheet</code>.',
    '<b>A · Swipe-to-delete</b> (my primary) \u2014 the iOS-standard gesture on any list row. Fast for clearing items. <i>Tap a row in the demo to reveal it.</i>',
    '<b>B · Delete in the edit sheet</b> \u2014 a destructive link at the bottom of the same sheet you already open to edit (mirrors \u201cDelete person\u201d). The discoverable path for anyone who doesn\u2019t know the swipe.',
    '<b>C · Select mode</b> (considered, parked) \u2014 a \u201cDone/Select\u201d toggle for bulk-clearing several at once. Revisit only if backlogs get messy.',
  ], [
    ['Adopted', 'A + B \u2014 both confirm via ConfirmSheet. Bulk-select parked.'],
    ['Confirm', 'Reuse ConfirmSheet (destructive) \u2014 single tap to confirm'],
    ['Data', 'Gifts/moments \u2192 existing delete mutations; events \u2192 updatePerson w/ item removed'],
  ], 460, 660);
}

Object.assign(window, {
  HubLight, HubDark, HubEmpty, NewPerson,
  HubSystemIntro,
  DeleteSwipe, DeleteInSheet, DeleteNote,
});
