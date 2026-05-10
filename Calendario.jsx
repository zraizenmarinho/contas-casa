const { useMemo: useMemo2, useState: useState2 } = React;

function CalendarioView({ contas, mesRef, onEdit, onStatusChange }) {
  const [y, m] = mesRef.split('-').map(Number);
  const contasMes = useMemo2(() => contas.filter(c => c.mesRef === mesRef), [contas, mesRef]);

  const diasNoMes  = new Date(y, m, 0).getDate();
  const primeiroDia = new Date(y, m - 1, 1).getDay();
  const hoje = new Date();
  const isHojeMes = hoje.getFullYear() === y && hoje.getMonth() + 1 === m;
  const diaHoje   = isHojeMes ? hoje.getDate() : -1;

  const porDia = useMemo2(() => {
    const map = {};
    contasMes.forEach(c => { if (!map[c.vencimentoDia]) map[c.vencimentoDia] = []; map[c.vencimentoDia].push(c); });
    return map;
  }, [contasMes]);

  const [selectedDia, setSelectedDia] = useState2(null);
  const selectedContas = selectedDia ? (porDia[selectedDia] || []) : [];

  const STATUS_CYCLE = { pendente: 'pago', pago: 'atrasado', atrasado: 'pendente' };
  const statusLabel  = { pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado' };
  const statusCor    = { pago: '#2D9D6B', pendente: '#D4900A', atrasado: '#D94F3D' };
  const statusBg     = { pago: '#EBF7F2', pendente: '#FEF7E8', atrasado: '#FEF0EF' };
  const dotCor       = (s) => s === 'pago' ? '#2D9D6B' : s === 'atrasado' ? '#D94F3D' : '#D4900A';

  const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
      {/* Calendário */}
      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Cabeçalho dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((dia, i) => {
            if (dia === null) return (
              <div key={`e${i}`} style={{ borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '80px', opacity: .3 }}></div>
            );
            const contasDia  = porDia[dia] || [];
            const isHoje     = dia === diaHoje;
            const isSelected = dia === selectedDia;
            const isPast     = isHojeMes && dia < diaHoje;
            return (
              <div key={dia}
                onClick={() => setSelectedDia(isSelected ? null : dia)}
                style={{
                  borderBottom: '1px solid var(--border)',
                  borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--border)',
                  minHeight: '80px', padding: '8px',
                  cursor: contasDia.length > 0 ? 'pointer' : 'default',
                  background: isSelected ? 'var(--accent-lt)' : 'transparent',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (!isSelected && contasDia.length > 0) e.currentTarget.style.background = 'var(--subtle)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: isHoje ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px',
                }}>
                  <span style={{
                    fontSize: '13px', fontWeight: isHoje ? 700 : 400,
                    color: isHoje ? '#FFF' : isPast ? 'var(--text-muted)' : 'var(--text)',
                  }}>{dia}</span>
                </div>
                {contasDia.slice(0, 2).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: dotCor(c.status) }}></div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>{c.nome}</span>
                  </div>
                ))}
                {contasDia.length > 2 && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{contasDia.length - 2}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel lateral */}
      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
        {selectedDia ? (
          <>
            <p style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
              Dia {selectedDia} — {selectedContas.length} conta{selectedContas.length !== 1 ? 's' : ''}
            </p>
            {selectedContas.map(c => {
              const cat = window.getCat(c.categoria);
              return (
                <div key={c.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.cor }}></div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', flex: 1 }}>{c.nome}</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(c.valor)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.nome}</span>
                    <button onClick={() => onStatusChange(c.id, STATUS_CYCLE[c.status])} style={{
                      padding: '4px 10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                      background: statusBg[c.status], color: statusCor[c.status],
                      fontWeight: 700, fontSize: '11px', fontFamily: 'inherit',
                    }}>{statusLabel[c.status]}</button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
            <p style={{ margin: 0, fontSize: '13px' }}>Clique em um dia<br />para ver as contas</p>
          </div>
        )}

        {/* Legenda */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Legenda</p>
          {[['#2D9D6B', 'Pago'], ['#D4900A', 'Pendente'], ['#D94F3D', 'Atrasado']].map(([cor, lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cor }}></div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CalendarioView });
