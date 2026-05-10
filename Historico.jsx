const { useMemo: useMemo3 } = React;

function BarChart({ bars, height = 110 }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const bw = 36, gap = 10;
  const w = bars.length * (bw + gap) - gap;
  return (
    <svg width={w} height={height + 36} style={{ overflow: 'visible' }}>
      {bars.map((b, i) => {
        const bh = Math.max((b.value / max) * height, b.value > 0 ? 4 : 0);
        const x  = i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={height - bh} width={bw} height={bh} rx={5}
              fill={b.active ? 'var(--accent)' : 'var(--subtle)'} />
            <text x={x + bw / 2} y={height + 16} textAnchor="middle"
              fontSize="11" fill="var(--text-muted)" fontFamily="inherit">{b.label}</text>
            {b.value > 0 && (
              <text x={x + bw / 2} y={height - bh - 5} textAnchor="middle"
                fontSize="10" fontWeight="600" fontFamily="inherit"
                fill={b.active ? 'var(--accent)' : 'var(--text-muted)'}>
                {b.value >= 1000 ? `${(b.value / 1000).toFixed(1)}k` : b.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function HistoricoView({ contas, mesRef }) {
  const meses = useMemo3(() => {
    const list = [];
    let cur = mesRef;
    for (let i = 0; i < 6; i++) { list.unshift(cur); cur = window.prevMes(cur); }
    return list;
  }, [mesRef]);

  const resumoPorMes = useMemo3(() =>
    meses.map(mes => {
      const c    = contas.filter(x => x.mesRef === mes);
      const total = c.reduce((s, x) => s + x.valor, 0);
      const pago  = c.filter(x => x.status === 'pago').reduce((s, x) => s + x.valor, 0);
      return { mes, total, pago, qtd: c.length };
    }), [contas, meses]);

  const porCat = useMemo3(() => {
    const cs  = contas.filter(c => c.mesRef === mesRef);
    const map = {};
    cs.forEach(c => { map[c.categoria] = (map[c.categoria] || 0) + c.valor; });
    return Object.entries(map).map(([id, val]) => ({ id, val, ...window.getCat(id) })).sort((a, b) => b.val - a.val);
  }, [contas, mesRef]);

  const totalMesAtivo = porCat.reduce((s, c) => s + c.val, 0);

  const bars = resumoPorMes.map(r => ({
    label:  window.fmtMesCurto(r.mes).charAt(0).toUpperCase() + window.fmtMesCurto(r.mes).slice(1),
    value:  Math.round(r.total),
    active: r.mes === mesRef,
  }));

  const card = { background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' };

  return (
    <div>
      {/* Gráfico barras */}
      <div style={{ ...card, padding: '22px', marginBottom: '20px', overflow: 'visible' }}>
        <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Evolução mensal</p>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-muted)' }}>Total de despesas dos últimos 6 meses</p>
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <BarChart bars={bars} height={110} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Resumo por mês */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Resumo por mês</p>
          </div>
          {[...resumoPorMes].reverse().map((r, i) => {
            const isActive = r.mes === mesRef;
            return (
              <div key={r.mes} style={{
                padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: i < resumoPorMes.length - 1 ? '1px solid var(--border)' : 'none',
                background: isActive ? 'var(--accent-lt)' : 'transparent',
              }}>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: isActive ? 700 : 500, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {window.fmtMes(r.mes)}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{r.qtd} conta{r.qtd !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                    {window.fmtBRL(r.total)}
                  </p>
                  {r.total > 0 && (
                    <p style={{ margin: 0, fontSize: '11px', color: '#2D9D6B' }}>
                      {Math.round((r.pago / r.total) * 100)}% pago
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Por categoria */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              Por categoria — <span style={{ textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-muted)' }}>{window.fmtMes(mesRef)}</span>
            </p>
          </div>
          {porCat.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Sem dados neste mês</div>
          ) : porCat.map((c, i) => {
            const pct = totalMesAtivo > 0 ? (c.val / totalMesAtivo) * 100 : 0;
            return (
              <div key={c.id} style={{ padding: '12px 20px', borderBottom: i < porCat.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: c.cor }}></div>
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{c.nome}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(c.val)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '5px', background: 'var(--subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c.cor, borderRadius: '99px' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HistoricoView });
