/* Direction A — "Warm & human"
   Type: Plus Jakarta Sans
   Palette: warm off-white, clay terracotta primary, soft earth tones
   Inputs: grouped iOS-style rows, refined */

const A = {
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  bg:        '#FAF7F2',
  surface:   '#FFFFFF',
  raised:    '#F4EFE7',
  primary:   '#B85C3E',
  primaryFg: '#FFFFFF',
  primarySoft:'#F8E5DC',
  text:      '#1B1714',
  textMuted: '#6F6860',
  textFaint: '#A6A096',
  border:    '#ECE4D6',
  borderStrong: '#D8CCB4',
  success:   '#6F8E3F',
  danger:    '#C44A3E',
  // accent palette for avatars/chips
  pal: ['#B85C3E','#6F8E3F','#3F7B8E','#8E5C9C','#C9963D','#5D6E54','#9C5C72','#3F6E8E'],
};

function aAvatar(name, size=44) {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1)||0)) % A.pal.length;
  return A.pal[idx];
}

// ─── primitives ──────────────────────────────────────────────────────────────
function AScreen({ children }) {
  return <div style={{
    background: A.bg, height: '100%', overflow: 'auto',
    fontFamily: A.font, color: A.text,
    fontFeatureSettings: '"ss01","ss02","cv11"',
  }}>{children}</div>;
}

function ANavBar({ title, leading, trailing, large=false }) {
  return (
    <div style={{ padding: large ? '52px 20px 8px' : '52px 12px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
        <div style={{ width: 60, display: 'flex', alignItems: 'center' }}>{leading}</div>
        {!large && <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 16, letterSpacing: -0.2 }}>{title}</div>}
        <div style={{ width: 60, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{trailing}</div>
      </div>
      {large && <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}>{title}</div>}
    </div>
  );
}

function ABackBtn() {
  return <button style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 2, color: A.primary, cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
    <I.back width={24} height={24}/> Back
  </button>;
}

function APill({ children, onClose }) {
  return <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 10px 6px 12px', borderRadius: 999,
    background: A.raised, color: A.text, fontSize: 13, fontWeight: 500,
    border: `1px solid ${A.border}`,
  }}>
    {children}
    {onClose && <I.close width={14} height={14} style={{ color: A.textMuted }}/>}
  </span>;
}

function AAvatar({ name, size=44, color }) {
  const bg = color || aAvatar(name);
  return <div style={{
    width: size, height: size, borderRadius: size/2, background: bg, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: size*0.38, letterSpacing: -0.2, flexShrink: 0,
  }}>{name}</div>;
}

function ASectionLabel({ children, action }) {
  return <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '20px 24px 8px',
  }}>
    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: A.textMuted }}>{children}</div>
    {action}
  </div>;
}

function AFieldGroup({ children }) {
  return <div style={{
    margin: '0 16px', background: A.surface, borderRadius: 16,
    overflow: 'hidden', border: `1px solid ${A.border}`,
  }}>{children}</div>;
}

function AField({ label, value, placeholder, last, multi }) {
  return <div style={{
    padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${A.border}`,
    display: 'flex', flexDirection: multi ? 'column' : 'row', alignItems: multi ? 'stretch' : 'center', gap: multi ? 4 : 12,
  }}>
    <div style={{ width: multi ? 'auto' : 112, fontSize: 13, color: A.textMuted, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1, fontSize: 16, color: value ? A.text : A.textFaint, letterSpacing: -0.1 }}>{value || placeholder}</div>
  </div>;
}

function ASelectField({ label, value, last }) {
  return <div style={{
    padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${A.border}`,
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ width: 112, fontSize: 13, color: A.textMuted, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1, fontSize: 16, color: A.text }}>{value}</div>
    <I.chevD width={16} height={16} style={{ color: A.textFaint }}/>
  </div>;
}

function ACard({ children, style }) {
  return <div style={{
    background: A.surface, borderRadius: 16, border: `1px solid ${A.border}`,
    padding: '14px 16px', ...style,
  }}>{children}</div>;
}

function APrimaryBtn({ children, full }) {
  return <button style={{
    all: 'unset', textAlign: 'center', cursor: 'pointer',
    background: A.primary, color: A.primaryFg, borderRadius: 14,
    padding: '14px 20px', fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
    width: full ? '100%' : 'auto', boxSizing: 'border-box',
    boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 6px 16px rgba(184,92,62,0.18)',
  }}>{children}</button>;
}

// ─── ARTBOARD: Home (list) ───────────────────────────────────────────────────
function AHome() {
  return (
    <IOSDevice width={402} height={874}>
      <AScreen>
        <ANavBar title="People" large
          trailing={<button style={{ all:'unset', width:34, height:34, borderRadius:17, background: A.raised, display:'flex', alignItems:'center', justifyContent:'center', color:A.text, cursor:'pointer' }}>
            <I.plus width={20} height={20}/>
          </button>}
        />
        {/* Search */}
        <div style={{ padding: '4px 16px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: A.raised, borderRadius: 12, padding: '11px 14px',
            color: A.textMuted, fontSize: 16,
          }}>
            <I.search width={18} height={18}/>
            <span>Search people, interests, places</span>
          </div>
        </div>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 4px', overflow: 'auto' }}>
          {['All 24', 'Family', 'Friends', 'Work', 'Need to reach out 3'].map((t, i) => (
            <span key={t} style={{
              padding: '7px 12px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: i===0 ? A.text : A.surface, color: i===0 ? '#FFF' : A.text,
              border: `1px solid ${i===0 ? A.text : A.border}`,
              whiteSpace: 'nowrap',
            }}>{t}</span>
          ))}
        </div>
        {/* Section: Reach out today */}
        <ASectionLabel>Reach out today</ASectionLabel>
        <div style={{ margin: '0 16px' }}>
          <ACard style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <AAvatar name="CW" size={48} color={A.pal[3]}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>Chen Wei</div>
              <div style={{ fontSize: 13, color: A.textMuted, marginTop: 2 }}>It's been 4 weeks · birthday next week</div>
            </div>
            <I.chevR width={16} height={16} style={{ color: A.textFaint }}/>
          </ACard>
        </div>
        {/* Section: All people */}
        <ASectionLabel action={<span style={{ fontSize: 13, color: A.primary, fontWeight: 500 }}>Sort: Recent</span>}>All people · 24</ASectionLabel>
        <div style={{ margin: '0 16px', background: A.surface, borderRadius: 16, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
          {SAMPLE_PEOPLE.slice(0,6).map((p, i, arr) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px',
              borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${A.border}`,
            }}>
              <AAvatar name={initials(p.firstName, p.lastName)} size={40}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.1 }}>{p.firstName} {p.lastName}</div>
                <div style={{ fontSize: 13, color: A.textMuted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.relationship} · {p.city}
                </div>
              </div>
              <div style={{ fontSize: 12, color: A.textFaint }}>{p.last}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 80 }}/>
      </AScreen>
    </IOSDevice>
  );
}

// ─── ARTBOARD: Person form (edit, filled) ────────────────────────────────────
function APersonForm() {
  const p = SAMPLE_PERSON;
  return (
    <IOSDevice width={402} height={874}>
      <AScreen>
        <ANavBar
          title="Edit"
          leading={<ABackBtn/>}
          trailing={<span style={{ color: A.primary, fontWeight: 600, fontSize: 15 }}>Save</span>}
        />
        {/* Header card with avatar */}
        <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <AAvatar name={initials(p.firstName, p.lastName)} size={84}/>
          <button style={{ all: 'unset', cursor: 'pointer', color: A.primary, fontSize: 14, fontWeight: 500 }}>Change photo</button>
        </div>

        <ASectionLabel>Name</ASectionLabel>
        <AFieldGroup>
          <AField label="First" value={p.firstName}/>
          <AField label="Last" value={p.lastName} last/>
        </AFieldGroup>

        <ASectionLabel>Details</ASectionLabel>
        <AFieldGroup>
          <AField label="City" value={p.city}/>
          <AField label="Employer" value={p.employer}/>
          <AField label="Role" value={p.workRole}/>
          <ASelectField label="Relationship" value="Sister" last/>
        </AFieldGroup>

        <ASectionLabel>Personal</ASectionLabel>
        <AFieldGroup>
          <ASelectField label="Birthday" value={p.birthDate}/>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 13, color: A.textMuted, fontWeight: 500, marginBottom: 8 }}>Interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.interests.map(i => <APill key={i} onClose>{i}</APill>)}
              <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, color: A.textFaint, border: `1px dashed ${A.borderStrong}` }}>+ add</span>
            </div>
          </div>
        </AFieldGroup>

        <ASectionLabel>What's going on</ASectionLabel>
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.currentEvents.map(e => (
            <ACard key={e} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: A.success }}/>
              <div style={{ flex: 1, fontSize: 15 }}>{e}</div>
              <I.pencil width={16} height={16} style={{ color: A.textFaint }}/>
            </ACard>
          ))}
          <button style={{ all: 'unset', cursor: 'pointer', alignSelf: 'flex-start', color: A.primary, fontSize: 14, fontWeight: 500, padding: '6px 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <I.plus width={16} height={16}/> Add current event
          </button>
        </div>

        <ASectionLabel>Upcoming</ASectionLabel>
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.upcomingEvents.map(e => (
            <ACard key={e.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: A.primarySoft, color: A.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.cake width={20} height={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{e.title}</div>
                <div style={{ fontSize: 13, color: A.textMuted, marginTop: 1 }}>{e.date} · {e.notes}</div>
              </div>
              <I.chevR width={16} height={16} style={{ color: A.textFaint }}/>
            </ACard>
          ))}
        </div>

        <ASectionLabel>Gift ideas · 2</ASectionLabel>
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.giftIdeas.map(g => (
            <ACard key={g.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F2E9D9', color: '#8E6A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.gift width={20} height={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: A.textMuted, marginTop: 1 }}>{g.occasion} · {g.status} · P{g.priority}</div>
              </div>
              <I.chevR width={16} height={16} style={{ color: A.textFaint }}/>
            </ACard>
          ))}
        </div>

        <ASectionLabel>Recent moments · 2</ASectionLabel>
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {p.interactions.map(it => (
            <ACard key={it.summary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <div style={{ fontSize: 13, color: A.textMuted, fontWeight: 500, textTransform: 'capitalize' }}>{it.channel} · {it.date}</div>
                <I.pencil width={14} height={14} style={{ color: A.textFaint }}/>
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.35 }}>{it.summary}</div>
            </ACard>
          ))}
        </div>

        <div style={{ padding: '32px 16px 60px' }}>
          <APrimaryBtn full>Save changes</APrimaryBtn>
          <button style={{ all: 'unset', cursor:'pointer', display: 'block', textAlign:'center', width:'100%', marginTop: 12, padding: '12px', color: A.danger, fontWeight: 500, fontSize: 15 }}>Delete person</button>
        </div>
      </AScreen>
    </IOSDevice>
  );
}

// ─── ARTBOARD: Create (empty) form with keyboard ─────────────────────────────
function ACreateForm() {
  return (
    <IOSDevice width={402} height={874} keyboard>
      <AScreen>
        <ANavBar
          title="New person"
          leading={<span style={{ color: A.primary, fontWeight: 500, fontSize: 15 }}>Cancel</span>}
          trailing={<span style={{ color: A.textFaint, fontWeight: 600, fontSize: 15 }}>Save</span>}
        />
        <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 84, height: 84, borderRadius: 42, background: A.raised,
            border: `1px dashed ${A.borderStrong}`, color: A.textFaint,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.user width={32} height={32}/>
          </div>
          <button style={{ all: 'unset', cursor: 'pointer', color: A.primary, fontSize: 14, fontWeight: 500 }}>Add photo</button>
        </div>

        <ASectionLabel>Name</ASectionLabel>
        <AFieldGroup>
          {/* Focused field */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 12, background: '#FFFBF5' }}>
            <div style={{ width: 112, fontSize: 13, color: A.primary, fontWeight: 600 }}>First *</div>
            <div style={{ flex: 1, fontSize: 16, color: A.text, position: 'relative' }}>
              Maya<span style={{ display: 'inline-block', width: 2, height: 18, background: A.primary, marginLeft: 2, verticalAlign: 'middle' }}/>
            </div>
          </div>
          <AField label="Last *" value="" placeholder="Required" last/>
        </AFieldGroup>

        <ASectionLabel>Details</ASectionLabel>
        <AFieldGroup>
          <AField label="City" value="" placeholder="Optional"/>
          <AField label="Employer" value="" placeholder="Optional"/>
          <AField label="Role" value="" placeholder="Optional"/>
          <ASelectField label="Relationship" value="" last/>
        </AFieldGroup>

        <ASectionLabel>Personal</ASectionLabel>
        <AFieldGroup>
          <ASelectField label="Birthday"/>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 13, color: A.textMuted, fontWeight: 500, marginBottom: 6 }}>Interests</div>
            <div style={{ fontSize: 15, color: A.textFaint }}>Add interests, separated by commas</div>
          </div>
        </AFieldGroup>

        <div style={{ padding: '24px 16px 16px', fontSize: 13, color: A.textMuted, textAlign: 'center' }}>
          Only first and last name are required. You can add events, gifts, and moments after saving.
        </div>
      </AScreen>
    </IOSDevice>
  );
}

// ─── ARTBOARD: Modal (gift idea) ─────────────────────────────────────────────
function AGiftModal() {
  return (
    <IOSDevice width={402} height={874}>
      <div style={{ position: 'relative', height: '100%' }}>
        {/* dim background showing form */}
        <div style={{ position: 'absolute', inset: 0, background: A.bg, fontFamily: A.font }}>
          <ANavBar title="Edit" leading={<ABackBtn/>} trailing={<span style={{ color: A.primary, fontWeight: 600, fontSize: 15 }}>Save</span>}/>
          <ASectionLabel>Gift ideas · 2</ASectionLabel>
        </div>
        {/* dim */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,10,0.32)' }}/>
        {/* sheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: A.bg, borderRadius: '24px 24px 0 0',
          padding: '14px 0 32px',
          fontFamily: A.font, color: A.text,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        }}>
          <div style={{ width: 36, height: 5, borderRadius: 3, background: '#D8CCB4', margin: '0 auto 16px' }}/>
          <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 14, color: A.primary, fontWeight: 500 }}>Cancel</span>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>New gift idea</span>
            <span style={{ fontSize: 14, color: A.primary, fontWeight: 600 }}>Save</span>
          </div>
          <AFieldGroup>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${A.border}`, background: '#FFFBF5' }}>
              <div style={{ fontSize: 13, color: A.primary, fontWeight: 600, marginBottom: 4 }}>Title *</div>
              <div style={{ fontSize: 16 }}>Ceramics workshop voucher<span style={{ display: 'inline-block', width: 2, height: 18, background: A.primary, marginLeft: 2, verticalAlign: 'middle' }}/></div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${A.border}` }}>
              <div style={{ fontSize: 13, color: A.textMuted, fontWeight: 500, marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: 15, color: A.textFaint }}>The Crucible — Oakland. Saturday classes.</div>
            </div>
          </AFieldGroup>
          <div style={{ height: 18 }}/>
          <ASectionLabel>Occasion</ASectionLabel>
          <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['birthday','holiday','anniversary','other'].map((o,i) => (
              <span key={o} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 500,
                background: i===0 ? A.primary : A.surface, color: i===0 ? '#FFF' : A.text,
                border: `1px solid ${i===0 ? A.primary : A.border}`,
              }}>{o}</span>
            ))}
          </div>
          <ASectionLabel>Status</ASectionLabel>
          <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['idea','shortlist','purchased','gifted'].map((o,i) => (
              <span key={o} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 500,
                background: i===1 ? A.primary : A.surface, color: i===1 ? '#FFF' : A.text,
                border: `1px solid ${i===1 ? A.primary : A.border}`,
              }}>{o}</span>
            ))}
          </div>
          <ASectionLabel>Priority</ASectionLabel>
          <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
            {[1,2,3].map((n) => (
              <div key={n} style={{
                flex: 1, padding: '12px 0', textAlign: 'center', borderRadius: 12,
                background: n===1 ? A.primary : A.surface, color: n===1 ? '#FFF' : A.text,
                border: `1px solid ${n===1 ? A.primary : A.border}`, fontWeight: 600, fontSize: 16,
              }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── ARTBOARD: Empty state ───────────────────────────────────────────────────
function AEmpty() {
  return (
    <IOSDevice width={402} height={874}>
      <AScreen>
        <ANavBar title="People" large
          trailing={<button style={{ all:'unset', width:34, height:34, borderRadius:17, background: A.raised, display:'flex', alignItems:'center', justifyContent:'center', color:A.text, cursor:'pointer' }}>
            <I.plus width={20} height={20}/>
          </button>}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px 0', textAlign: 'center' }}>
          <div style={{
            width: 120, height: 120, borderRadius: 60,
            background: A.primarySoft, color: A.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <I.users width={56} height={56}/>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>Your people, in one place</div>
          <div style={{ fontSize: 15, color: A.textMuted, lineHeight: 1.45, maxWidth: 300, marginBottom: 28 }}>
            Add someone you care about. Track birthdays, gift ideas, and the moments worth remembering.
          </div>
          <APrimaryBtn>Add your first person</APrimaryBtn>
          <button style={{ all: 'unset', cursor: 'pointer', marginTop: 16, fontSize: 14, color: A.textMuted, fontWeight: 500 }}>Import from Contacts</button>
        </div>
      </AScreen>
    </IOSDevice>
  );
}

window.AHome = AHome;
window.APersonForm = APersonForm;
window.ACreateForm = ACreateForm;
window.AGiftModal = AGiftModal;
window.AEmpty = AEmpty;
window.A_TOKENS = A;
