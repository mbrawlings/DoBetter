/* Style guide artboards — one per direction, plus dark mode.
   These are documentation surfaces (not framed), 760 × 1240. */

function SGSwatch({ name, hex, fg = '#000', size = 64 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        width: '100%', height: size, borderRadius: 8, background: hex,
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'flex-end', padding: 8,
      }}>
        <span style={{ fontSize: 10, fontFamily: "'Geist Mono', ui-monospace, monospace", color: fg, opacity: 0.7 }}>{hex}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#000' }}>{name}</div>
    </div>
  );
}

function SGTypeRow({ font, size, weight, label, sample, color = '#111', style }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 100px 1fr',
      gap: 16, padding: '12px 0',
      borderBottom: '1px solid #EEE',
      alignItems: 'baseline',
    }}>
      <div style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 11, color: '#666', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 11, color: '#999' }}>{size}/{weight}</div>
      <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, letterSpacing: size > 32 ? -1 : size > 20 ? -0.4 : -0.1, ...style }}>{sample}</div>
    </div>
  );
}

function SGSectionTitle({ children, num }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 40, marginBottom: 18 }}>
    <span style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 12, color: '#999' }}>{num}</span>
    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.4, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{children}</h3>
    <div style={{ flex: 1, height: 1, background: '#EEE' }}/>
  </div>;
}

// ─── Foundation card factory ─────────────────────────────────────────────────
function FoundationCard({ direction, tokens: T, width = 760, height = 1240, dark = false }) {
  const fontMap = {
    A: { display: T.font, body: T.font, mono: "'Geist Mono', ui-monospace, monospace" },
    B: { display: T.font, body: T.font, mono: T.mono },
    C: { display: T.serif, body: T.sans, mono: T.mono },
  };
  const fonts = fontMap[direction];
  const bg = dark ? '#0F0F10' : '#FCFCFC';
  const ink = dark ? '#FAFAFA' : '#0A0A0A';
  const muted = dark ? '#8E8E93' : '#666';
  const border = dark ? '#222226' : '#E8E8E8';
  const cardBg = dark ? '#19191B' : '#FFFFFF';

  // direction-specific palette samples
  const colors = {
    A: [
      { name: 'Primary',      hex: T.primary, fg: '#fff' },
      { name: 'Primary soft', hex: T.primarySoft, fg: T.text },
      { name: 'Background',   hex: T.bg, fg: T.text },
      { name: 'Surface',      hex: T.surface, fg: T.text },
      { name: 'Raised',       hex: T.raised, fg: T.text },
      { name: 'Border',       hex: T.border, fg: T.text },
      { name: 'Text',         hex: T.text, fg: '#fff' },
      { name: 'Muted',        hex: T.textMuted, fg: '#fff' },
    ],
    B: [
      { name: 'Ink',          hex: T.ink, fg: '#fff' },
      { name: 'Accent',       hex: T.accent, fg: '#fff' },
      { name: 'Accent soft',  hex: T.accentSoft, fg: T.text },
      { name: 'Background',   hex: T.bg, fg: T.text },
      { name: 'Surface',      hex: T.surface, fg: T.text },
      { name: 'Raised',       hex: T.raised, fg: T.text },
      { name: 'Border',       hex: T.border, fg: T.text },
      { name: 'Muted',        hex: T.textMuted, fg: '#fff' },
    ],
    C: [
      { name: 'Ink',          hex: T.ink, fg: T.bg },
      { name: 'Accent',       hex: T.accent, fg: '#fff' },
      { name: 'Accent soft',  hex: T.accentSoft, fg: T.text },
      { name: 'Background',   hex: T.bg, fg: T.text },
      { name: 'Surface',      hex: T.surface, fg: T.text },
      { name: 'Raised',       hex: T.raised, fg: T.text },
      { name: 'Border',       hex: T.border, fg: T.text },
      { name: 'Muted',        hex: T.textMuted, fg: '#fff' },
    ],
  }[direction];

  const directionMeta = {
    A: { name: 'Direction A', sub: 'Warm & human', desc: 'A refined version of the current iOS pattern. Warm off-white background, clay terracotta primary, soft earth-toned avatars. Grouped row inputs.' },
    B: { name: 'Direction B', sub: 'Clean & minimal', desc: 'Pure paper, near-monochrome ink, cobalt accent only for actions. Underlined floating-label inputs. Mono metadata for a precise, technical feel.' },
    C: { name: 'Direction C', sub: 'Editorial bold', desc: 'Cream paper, deep ink, italic serif headlines. Treats each person as the headline. Persimmon accent. Numbered sections. The bold idea.' },
  }[direction];

  return (
    <div style={{
      width, height, background: bg, color: ink, fontFamily: fonts.body,
      padding: 56, boxSizing: 'border-box', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 1, textTransform: 'uppercase' }}>{directionMeta.name} {dark && '— DARK'}</div>
          <div style={{ fontFamily: fonts.display, fontSize: direction==='C' ? 52 : 44, fontWeight: direction==='C' ? 400 : 600, fontStyle: direction==='C' ? 'italic' : 'normal', letterSpacing: -1.4, marginTop: 8 }}>{directionMeta.sub}</div>
          <div style={{ fontSize: 14, color: muted, marginTop: 8, maxWidth: 480, lineHeight: 1.5 }}>{directionMeta.desc}</div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: fonts.mono, fontSize: 11, padding: '6px 10px', borderRadius: 4,
          background: T.primary || T.ink, color: dark ? bg : '#fff',
          letterSpacing: 1, textTransform: 'uppercase',
        }}>DoBetter / iOS</div>
      </div>

      {/* Palette */}
      <SGSectionTitle num="01">Palette</SGSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
        {colors.map(c => <SGSwatch key={c.name} {...c}/>)}
      </div>
      <div style={{ marginTop: 14, fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.3 }}>
        Avatar palette
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10, marginTop: 8 }}>
        {T.pal.map((p, i) => (
          <div key={p+i} style={{
            height: 40, borderRadius: 8, background: p,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: fonts.display,
            fontSize: 18, fontWeight: 500,
            fontStyle: direction==='C' ? 'italic' : 'normal',
          }}>{String.fromCharCode(65 + i)}{String.fromCharCode(75 + i % 8)}</div>
        ))}
      </div>

      {/* Type */}
      <SGSectionTitle num="02">Type scale</SGSectionTitle>
      <div>
        {direction === 'A' && <>
          <SGTypeRow font={fonts.display} size={34} weight={700} label="Display"      sample="Your people" color={ink}/>
          <SGTypeRow font={fonts.display} size={22} weight={600} label="Title"        sample="Maya Patel"  color={ink}/>
          <SGTypeRow font={fonts.display} size={16} weight={500} label="Body"         sample="Engineering Manager at Stripe" color={ink}/>
          <SGTypeRow font={fonts.display} size={13} weight={500} label="Caption"      sample="Sister · San Francisco" color={muted}/>
          <SGTypeRow font={fonts.display} size={12} weight={600} label="Eyebrow"      sample="DETAILS" color={muted} style={{ letterSpacing: 1.2 }}/>
        </>}
        {direction === 'B' && <>
          <SGTypeRow font={fonts.display} size={32} weight={600} label="Display"      sample="Your people" color={ink}/>
          <SGTypeRow font={fonts.display} size={24} weight={600} label="Title"        sample="Maya Patel"  color={ink}/>
          <SGTypeRow font={fonts.display} size={17} weight={500} label="Body large"   sample="Engineering Manager" color={ink}/>
          <SGTypeRow font={fonts.display} size={15} weight={400} label="Body"         sample="2d ago — Dinner at Nopa" color={ink}/>
          <SGTypeRow font={fonts.display} size={13} weight={400} label="Caption"      sample="Sister · San Francisco" color={muted}/>
          <SGTypeRow font={fonts.mono}    size={11} weight={500} label="Mono / label" sample="LAST CONTACT" color={muted} style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}/>
        </>}
        {direction === 'C' && <>
          <SGTypeRow font={fonts.display} size={56} weight={400} label="Display"      sample="Maya Patel" color={ink} style={{ fontStyle: 'italic', letterSpacing: -2 }}/>
          <SGTypeRow font={fonts.display} size={28} weight={400} label="Title"        sample="What lights them up" color={ink} style={{ fontStyle: 'italic' }}/>
          <SGTypeRow font={fonts.display} size={19} weight={400} label="Lead"         sample="Dinner at Nopa — promotion." color={ink} style={{ fontStyle: 'italic' }}/>
          <SGTypeRow font={fonts.body}    size={14} weight={500} label="Body"         sample="Engineering Manager at Stripe" color={ink}/>
          <SGTypeRow font={fonts.mono}    size={11} weight={500} label="Mono / label" sample="01 · IDENTITY" color={muted} style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}/>
        </>}
      </div>

      {/* Components */}
      <SGSectionTitle num="03">Components</SGSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Buttons */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Buttons</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <SGBtnPrimary direction={direction} tokens={T} dark={dark}>Save</SGBtnPrimary>
              <SGBtnGhost   direction={direction} tokens={T} dark={dark}>Cancel</SGBtnGhost>
            </div>
            <SGBtnPrimary direction={direction} tokens={T} dark={dark} full>Add your first person</SGBtnPrimary>
          </div>
        </div>
        {/* Chips */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Chips & tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <SGChip direction={direction} tokens={T} dark={dark} selected>All 24</SGChip>
            <SGChip direction={direction} tokens={T} dark={dark}>Family</SGChip>
            <SGChip direction={direction} tokens={T} dark={dark} onClose>rock climbing</SGChip>
            <SGChip direction={direction} tokens={T} dark={dark} onClose>pottery</SGChip>
          </div>
        </div>
        {/* Inputs */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Inputs · the {direction === 'A' ? 'grouped row' : direction === 'B' ? 'underlined floating-label' : 'filled card with mono label'} pattern</div>
          <SGInputPattern direction={direction} tokens={T} dark={dark}/>
        </div>
        {/* List row */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Person list row</div>
          <SGListRow direction={direction} tokens={T} dark={dark}/>
        </div>
      </div>

      {/* Spacing & radius */}
      <SGSectionTitle num="04">Spacing & radius</SGSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Spacing scale (4pt grid)</div>
          {[['xs',4],['sm',8],['md',12],['lg',16],['xl',24],['xxl',32]].map(([k,v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0' }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, width: 32 }}>{k}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: ink, width: 24 }}>{v}</span>
              <div style={{ height: 8, width: v*3, background: T.primary || T.ink, borderRadius: 2 }}/>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Radius</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {direction === 'A' && [['sm',8],['md',12],['lg',16],['pill',999]].map(([k,v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: T.raised, border: `1px solid ${T.border}`, borderRadius: v }}/>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: muted, marginTop: 6 }}>{k} {v}</div>
              </div>
            ))}
            {direction === 'B' && [['sm',6],['md',10],['lg',12],['pill',999]].map(([k,v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: T.raised, border: `1px solid ${T.border}`, borderRadius: v }}/>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: muted, marginTop: 6 }}>{k} {v}</div>
              </div>
            ))}
            {direction === 'C' && [['xs',2],['sm',4],['md',6],['pill',999]].map(([k,v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: T.raised, border: `1px solid ${T.border}`, borderRadius: v }}/>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: muted, marginTop: 6 }}>{k} {v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny component samplers ─────────────────────────────────────────────────
function SGBtnPrimary({ direction, tokens: T, dark, children, full }) {
  if (direction === 'A') return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: T.primary, color: '#fff', borderRadius: 14, padding: '12px 18px', fontWeight: 600, fontSize: 15, fontFamily: T.font, width: full ? '100%' : 'auto', boxSizing: 'border-box', boxShadow: '0 6px 16px rgba(184,92,62,0.18)' }}>{children}</button>;
  if (direction === 'B') return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: T.ink, color: '#fff', borderRadius: 10, padding: '12px 18px', fontWeight: 500, fontSize: 14, fontFamily: T.font, width: full ? '100%' : 'auto', boxSizing: 'border-box' }}>{children}</button>;
  return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: T.ink, color: T.bg, borderRadius: 6, padding: '14px 18px', fontFamily: T.mono, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', width: full ? '100%' : 'auto', boxSizing: 'border-box' }}>{children}</button>;
}

function SGBtnGhost({ direction, tokens: T, dark, children }) {
  const bg = dark ? '#19191B' : '#fff';
  if (direction === 'A') return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: bg, color: T.text, borderRadius: 14, padding: '11px 18px', fontWeight: 500, fontSize: 15, fontFamily: T.font, border: `1px solid ${T.border}` }}>{children}</button>;
  if (direction === 'B') return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: bg, color: T.text, borderRadius: 10, padding: '11px 18px', fontWeight: 500, fontSize: 14, fontFamily: T.font, border: `1px solid ${T.border}` }}>{children}</button>;
  return <button style={{ all:'unset', textAlign:'center', cursor:'pointer', background: 'transparent', color: T.ink, borderRadius: 6, padding: '13px 18px', fontFamily: T.mono, fontSize: 11, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', border: `1px solid ${T.ink}` }}>{children}</button>;
}

function SGChip({ direction, tokens: T, dark, selected, onClose, children }) {
  if (direction === 'A') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: selected ? T.text : T.raised, color: selected ? '#fff' : T.text, fontSize: 13, fontWeight: 500, fontFamily: T.font, border: `1px solid ${selected ? T.text : T.border}` }}>{children}{onClose && <I.close width={12} height={12} style={{ opacity: 0.6 }}/>}</span>;
  if (direction === 'B') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 8, background: selected ? T.ink : 'transparent', color: selected ? '#fff' : T.text, fontSize: 13, fontWeight: 500, fontFamily: T.font, border: `1px solid ${selected ? T.ink : T.border}` }}>{children}{onClose && <I.close width={12} height={12} style={{ opacity: 0.6 }}/>}</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 4, background: selected ? T.ink : 'transparent', color: selected ? T.bg : T.text, fontFamily: T.mono, fontSize: 11, fontWeight: 500, letterSpacing: 0.5, textTransform: 'uppercase', border: `1px solid ${selected ? T.ink : T.borderStrong}` }}>{children}{onClose && <I.close width={11} height={11}/>}</span>;
}

function SGInputPattern({ direction, tokens: T, dark }) {
  if (direction === 'A') return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', maxWidth: 520 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, background: '#FFFBF5' }}>
        <div style={{ width: 112, fontSize: 13, color: T.primary, fontWeight: 600, fontFamily: T.font }}>First *</div>
        <div style={{ flex: 1, fontSize: 16, color: T.text, fontFamily: T.font }}>Maya<span style={{ display: 'inline-block', width: 2, height: 18, background: T.primary, marginLeft: 2, verticalAlign: 'middle' }}/></div>
      </div>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 112, fontSize: 13, color: T.textMuted, fontWeight: 500, fontFamily: T.font }}>City</div>
        <div style={{ flex: 1, fontSize: 16, color: T.text, fontFamily: T.font }}>San Francisco</div>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 112, fontSize: 13, color: T.textMuted, fontWeight: 500, fontFamily: T.font }}>Relationship</div>
        <div style={{ flex: 1, fontSize: 16, color: T.text, fontFamily: T.font }}>Sister</div>
        <I.chevD width={16} height={16} style={{ color: T.textFaint }}/>
      </div>
    </div>
  );
  if (direction === 'B') return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ padding: '14px 0 10px', borderBottom: `1px solid ${T.ink}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>First name <span style={{ color: T.accent }}>*</span></div>
        <div style={{ fontSize: 17, color: T.text, fontFamily: T.font }}>Maya<span style={{ display: 'inline-block', width: 1.5, height: 20, background: T.ink, marginLeft: 2, verticalAlign: 'middle' }}/></div>
      </div>
      <div style={{ padding: '14px 0 10px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>City</div>
        <div style={{ fontSize: 17, color: T.text, fontFamily: T.font }}>San Francisco</div>
      </div>
      <div style={{ padding: '14px 0 10px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Relationship</div>
        <div style={{ fontSize: 17, color: T.text, fontFamily: T.font }}>Sister</div>
      </div>
    </div>
  );
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 6, overflow: 'hidden', maxWidth: 520 }}>
      <div style={{ padding: '14px 18px', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>First name *</div>
        <div style={{ fontFamily: T.serif, fontSize: 24, fontStyle: 'italic', letterSpacing: -0.5, color: T.text }}>Maya<span style={{ display: 'inline-block', width: 1.5, height: 24, background: T.accent, marginLeft: 2, verticalAlign: 'middle' }}/></div>
      </div>
      <div style={{ padding: '14px 18px', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>City</div>
        <div style={{ fontSize: 16, color: T.text, fontFamily: T.sans, fontWeight: 500 }}>San Francisco</div>
      </div>
      <div style={{ padding: '14px 18px', background: T.surface }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Relationship</div>
        <div style={{ fontSize: 16, color: T.text, fontFamily: T.sans, fontWeight: 500 }}>Sister</div>
      </div>
    </div>
  );
}

function SGListRow({ direction, tokens: T, dark }) {
  const surface = dark ? '#19191B' : (T.surface || '#fff');
  if (direction === 'A') return (
    <div style={{ background: surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 520 }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: T.pal[0], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontFamily: T.font, fontSize: 15 }}>MP</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: T.font, color: T.text }}>Maya Patel</div>
        <div style={{ fontSize: 13, color: T.textMuted, fontFamily: T.font, marginTop: 1 }}>sister · San Francisco</div>
      </div>
      <div style={{ fontSize: 12, color: T.textFaint, fontFamily: T.font }}>2d</div>
    </div>
  );
  if (direction === 'B') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${T.border}`, maxWidth: 520 }}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: T.pal[1], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontWeight: 500, fontSize: 12 }}>MP</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, fontFamily: T.font, color: T.text }}>Maya Patel</div>
        <div style={{ fontSize: 13, color: T.textMuted, fontFamily: T.font, marginTop: 1 }}><span style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint, textTransform: 'uppercase' }}>SISTER</span> · San Francisco</div>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textFaint }}>2d</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: `1px solid ${T.border}`, maxWidth: 520 }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: T.pal[0], color: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, letterSpacing: -0.5 }}>M</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.serif, fontSize: 22, fontStyle: 'italic', letterSpacing: -0.5, color: T.text, lineHeight: 1.1 }}>Maya Patel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' }}>sister</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: T.textFaint }}/>
          <span style={{ fontSize: 12, color: T.textMuted }}>San Francisco</span>
        </div>
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' }}>2d</span>
    </div>
  );
}

// ─── Top-level artboards ─────────────────────────────────────────────────────
function FoundationA() { return <FoundationCard direction="A" tokens={A_TOKENS}/>; }

// Dark token variant for A (warm dark).
const A_DARK = { ...A_TOKENS, bg: '#1A1614', surface: '#211C18', raised: '#2A2520', text: '#F8F4ED', textMuted: '#9C958A', textFaint: '#5F594F', border: '#2F2925', borderStrong: '#3F3833' };
function FoundationADark() { return <FoundationCard direction="A" tokens={A_DARK} dark/>; }

window.FoundationA = FoundationA;
window.FoundationADark = FoundationADark;
