const { useMemo } = React;

function DonutChart({ segments, size = 168 }) {
  const r = 58, circ = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--subtle)" strokeWidth={24} />
    </svg>
  );
  let cum = 0;
  const slices = segments.filter(d => d.value > 0).map(d => {
    const len = (d.value / total) * circ;
    const s = { color: d.color, len, offset: cum };
    cum += len;
    return s;
  });
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--subtle)" strokeWidth={24} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={22}
          strokeDasharray={`${s.len} ${circ - s.len}`}
          strokeDashoffset={circ - s.offset} />
      ))}
    </svg>
  );
}

const MESES_CURTO = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function BarChartAnual({ contas, mesRef }) {
  const ano = mesRef.slice(0, 4);
  const hoje = window.todayMes();

  const dados = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const key = `${ano}-${String(i + 1).padStart(2, '0')}`;
    const total = contas.filter(c => c.mesRef === key).reduce((s, c) => s + c.valor, 0);
    return { key, total, label: MESES_CURTO[i] };
  }), [contas, ano]);

  const maxVal = Math.max(...dados.map(d => d.total), 1);

  const W = 900, H = 230;
  const pL = 62, pR = 16, pT = 38, pB = 36;
  const cW = W - pL - pR, cH = H - pT - pB;
  const slot = cW / 12;
  const barW = slot * 0.5;

  const fmtK = v => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${Math.round(v)}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="bca-cur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.65 }} />
        </linearGradient>
        <linearGradient id="bca-past" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.28 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.06 }} />
        </linearGradient>
      </defs>

      {/* Grid lines + Y labels */}
      {ticks.map((f, i) => {
        const val = Math.round(maxVal * f);
        const y = pT + cH - f * cH;
        return (
          <g key={i}>
            <line x1={pL} x2={W - pR} y1={y} y2={y}
              stroke="var(--border)"
              strokeWidth={f === 0 ? 1.5 : 0.5}
              strokeDasharray={f === 0 ? '' : '5 4'} />
            <text x={pL - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--text-muted)">
              {f === 0 ? '' : fmtK(val)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {dados.map((d, i) => {
        const cx = pL + i * slot + slot / 2;
        const bh = d.total > 0 ? Math.max((d.total / maxVal) * cH, 6) : 0;
        const by = pT + cH - bh;
        const isCur = d.key === mesRef;
        const isFut = !isCur && d.key > hoje;
        const hasDados = d.total > 0;

        return (
          <g key={d.key}>
            {/* Bar body */}
            {isCur && hasDados && (
              <rect x={cx - barW / 2} y={by} width={barW} height={bh} rx={6} fill="url(#bca-cur)" />
            )}
            {!isCur && hasDados && (
              <rect x={cx - barW / 2} y={by} width={barW} height={bh} rx={6}
                fill="url(#bca-past)"
                stroke="var(--accent)" strokeWidth={1} strokeOpacity={0.2} />
            )}
            {!hasDados && (
              <rect x={cx - barW / 2} y={pT + cH - 3} width={barW} height={3} rx={2} fill="var(--border)" />
            )}

            {/* Value label */}
            {hasDados && isCur && (
              <g>
                <rect x={cx - 24} y={by - 22} width={48} height={17} rx={5} fill="var(--accent)" />
                <text x={cx} y={by - 10} textAnchor="middle" fontSize={9.5} fill="#fff" fontWeight={700}>
                  {fmtK(d.total)}
                </text>
              </g>
            )}
            {hasDados && !isCur && (
              <text x={cx} y={by - 6} textAnchor="middle" fontSize={9} fill={isFut ? 'var(--text-muted)' : 'var(--text-muted)'} fontWeight={500}>
                {fmtK(d.total)}
              </text>
            )}

            {/* X label */}
            <text x={cx} y={pT + cH + 20} textAnchor="middle" fontSize={11}
              fill={isCur ? 'var(--accent)' : 'var(--text-muted)'}
              fontWeight={isCur ? 700 : 400}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DashboardView({ contas, mesRef, onAddConta, onStatusChange }) {
  const contasMes = useMemo(() => contas.filter(c => c.mesRef === mesRef), [contas, mesRef]);

  const total    = contasMes.reduce((s, c) => s + c.valor, 0);
  const pago     = contasMes.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
  const pendente = contasMes.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
  const atrasado = contasMes.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const pctPago  = total > 0 ? Math.round((pago / total) * 100) : 0;

  const porCat = useMemo(() => {
    const map = {};
    contasMes.forEach(c => { map[c.categoria] = (map[c.categoria] || 0) + c.valor; });
    return Object.entries(map).map(([id, val]) => ({ id, val, ...window.getCat(id) })).sort((a, b) => b.val - a.val);
  }, [contasMes]);

  const proximas = useMemo(() => {
    const [y, m] = mesRef.split('-').map(Number);
    return contasMes
      .filter(c => c.status !== 'pago')
      .map(c => ({ ...c, dataVenc: new Date(y, m - 1, c.vencimentoDia) }))
      .sort((a, b) => a.dataVenc - b.dataVenc)
      .slice(0, 5);
  }, [contasMes, mesRef]);

  const summaryCard = (label, value, color, bg) => (
    <div style={{ background: bg, borderRadius: '14px', padding: '18px 20px', flex: 1, minWidth: 0 }}>
      <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{window.fmtBRL(value)}</p>
    </div>
  );

  const statusBadge = (s) => {
    const map = { pago: ['#2D9D6B', '#1a3d2b', '#EBF7F2'], pendente: ['#D4900A', '#3d2e0a', '#FEF7E8'], atrasado: ['#D94F3D', '#3d1a17', '#FEF0EF'] };
    const [c, , bg] = map[s] || ['#AAA', '#333', '#EEE'];
    const lbl = { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' };
    return <span style={{ fontSize: '11px', fontWeight: 700, color: c, background: bg, padding: '3px 8px', borderRadius: '20px' }}>{lbl[s]}</span>;
  };

  const card = { background: 'var(--surface)', borderRadius: '14px', padding: '20px 22px', border: '1px solid var(--border)' };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {summaryCard('Total do Mês',  total,    'var(--accent)',  'var(--accent-lt)')}
        {summaryCard('Pago',          pago,     '#2D9D6B',        'var(--surface-2)')}
        {summaryCard('Pendente',      pendente, '#D4900A',        'var(--surface-2)')}
        {summaryCard('Atrasado',      atrasado, '#D94F3D',        'var(--surface-2)')}
      </div>

      {/* Progress bar */}
      <div style={{ ...card, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Progresso de pagamentos</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#2D9D6B' }}>{pctPago}%</span>
        </div>
        <div style={{ height: '10px', background: 'var(--subtle)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pctPago}%`, background: '#2D9D6B', borderRadius: '99px', transition: 'width .6s ease' }}></div>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          {contasMes.filter(c => c.status === 'pago').length} de {contasMes.length} contas pagas
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
        {/* Donut */}
        <div style={card}>
          <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Por categoria</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flexShrink: 0, position: 'relative', width: 168, height: 168 }}>
              <DonutChart segments={porCat.map(c => ({ color: c.cor, value: c.val }))} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(total)}</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '168px' }}>
              {porCat.slice(0, 7).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: c.cor, flexShrink: 0 }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{window.fmtBRL(c.val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pendências */}
        <div style={card}>
          <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Pendências</p>
          {proximas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>✓</div>
              <p style={{ margin: 0, fontSize: '13px' }}>Tudo em dia!</p>
            </div>
          ) : proximas.map(c => {
            const cat = window.getCat(c.categoria);
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.cor, flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Vence dia {c.vencimentoDia}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(c.valor)}</p>
                  {statusBadge(c.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico anual */}
      <div style={{ ...card }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
          Gastos por mês — {mesRef.slice(0, 4)}
        </p>
        <BarChartAnual contas={contas} mesRef={mesRef} />
        <div style={{ display: 'flex', gap: '18px', marginTop: '4px', paddingLeft: '58px' }}>
          {[
            { fill: 'var(--accent)', label: 'Mês selecionado' },
            { fill: 'var(--accent-lt)', border: 'var(--accent)', label: 'Realizado' },
            { fill: 'var(--subtle)', border: 'var(--border)', dash: true, label: 'Projetado' },
            ].map(({ fill, border, dash, lineColor, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {lineColor ? (
                <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke={lineColor} strokeWidth="1.5" strokeDasharray="5 3" /></svg>
              ) : (
                <div style={{
                  width: '12px', height: '12px', borderRadius: '3px',
                  background: fill,
                  border: border ? `1px solid ${border}` : 'none',
                  borderStyle: dash ? 'dashed' : 'solid',
                  opacity: fill === 'var(--accent-lt)' ? 1 : 1,
                }} />
              )}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView, DonutChart });
