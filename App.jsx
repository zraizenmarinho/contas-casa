const { useState, useCallback, useEffect } = React;

const ABAS = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'lista',      label: 'Contas'     },
  { id: 'calendario', label: 'Calendário' },
  { id: 'historico',  label: 'Histórico'  },
];

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 100 11 6 6 0 007-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.41 1.41M11.36 11.36l1.41 1.41M3.22 12.78l1.41-1.41M11.36 4.64l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}


function App() {
  const [contas, setContas]   = useState(() => window.loadData());
  const [mesRef, setMesRef]   = useState(() => window.todayMes());
  const [aba, setAba]         = useState('dashboard');
  const [modal, setModal]     = useState(null);
  const [showFamilia, setShowFamilia] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() =>
    window.firebaseSync.getCodigo() ? 'connecting' : 'offline');
  const [isDark, setIsDark]   = useState(() => {
    const saved = localStorage.getItem('mv_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('mv_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Conectar Firebase ao iniciar (se já tem código)
  const conectarFirebase = async () => {
    const ok = await window.firebaseSync.init((contasRemotas) => {
      setContas(contasRemotas);
      setSyncStatus('online');
    });
    if (ok) {
      // Marca como online imediatamente (não espera o snapshot chegar)
      setSyncStatus('online');
      // Sobe contas locais para o Firebase (primeira sincronização do dispositivo).
      // O onSnapshot aguarda esses IDs aparecerem antes de sobrescrever o estado,
      // garantindo que dados locais não sejam perdidos durante o merge inicial.
      const local = window.loadData();
      if (local.length > 0) await window.firebaseSync.saveBatch(local);
      setShowFamilia(false);
    } else {
      setSyncStatus('offline');
    }
    return ok;
  };

  useEffect(() => {
    if (window.firebaseSync.getCodigo()) conectarFirebase();
  }, []);

  // Persist localmente sempre
  useEffect(() => { window.saveData(contas); }, [contas]);

  // Replica recorrentes do mês anterior apenas quando o mês está vazio
  useEffect(() => {
    setContas(prev => {
      if (prev.some(c => c.mesRef === mesRef)) return prev;
      const anterior = window.prevMes(mesRef);
      const recorrentes = prev.filter(c => c.mesRef === anterior && c.recorrente);
      if (recorrentes.length === 0) return prev;
      const novas = recorrentes.map(c => ({ ...c, id: window.genId(), mesRef, status: 'pendente' }));
      // Chama Firebase fora do updater para evitar race condition com onSnapshot
      if (window.firebaseSync.getCodigo()) {
        const copia = [...novas];
        setTimeout(() => window.firebaseSync.saveBatch(copia), 0);
      }
      return [...prev, ...novas];
    });
  }, [mesRef]);

  const handleSave = useCallback((conta, autoGerar) => {
    setContas(prev => {
      const idx = prev.findIndex(c => c.id === conta.id);
      let next = idx >= 0
        ? prev.map(c => c.id === conta.id ? conta : c)
        : [...prev, conta];

      const novas = [conta];
      if (autoGerar && conta.parcelado) {
        const restantes = conta.totalParcelas - conta.parcelaAtual;
        let mes = conta.mesRef;
        for (let i = 1; i <= restantes; i++) {
          mes = window.nextMes(mes);
          const nova = { ...conta, id: window.genId(), mesRef: mes, status: 'pendente', parcelaAtual: conta.parcelaAtual + i };
          next = [...next, nova];
          novas.push(nova);
        }
      }

      // Nova conta recorrente: replica para meses futuros que já têm dados
      if (conta.recorrente && idx < 0) {
        const mesesFuturos = [...new Set(
          next.filter(c => c.mesRef > conta.mesRef).map(c => c.mesRef)
        )].sort();
        for (const mes of mesesFuturos) {
          const jaExiste = next.some(c => c.mesRef === mes && c.nome === conta.nome && c.categoria === conta.categoria);
          if (!jaExiste) {
            const nova = { ...conta, id: window.genId(), mesRef: mes, status: 'pendente' };
            next = [...next, nova];
            novas.push(nova);
          }
        }
      }

      // Chama Firebase fora do updater para evitar race condition com onSnapshot
      if (window.firebaseSync.getCodigo()) {
        const copia = [...novas];
        setTimeout(() => window.firebaseSync.saveBatch(copia), 0);
      }
      return next;
    });
    setModal(null);
  }, []);

  const handleDelete = useCallback((id) => {
    setContas(prev => prev.filter(c => c.id !== id));
    if (window.firebaseSync.getCodigo()) window.firebaseSync.deleteConta(id);
  }, []);

  const handleDeleteMany = useCallback((ids) => {
    const set = new Set(ids);
    setContas(prev => prev.filter(c => !set.has(c.id)));
    if (window.firebaseSync.getCodigo()) window.firebaseSync.deleteContas(ids);
  }, []);

  const handleStatusChange = useCallback((id, novoStatus) => {
    setContas(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, status: novoStatus } : c);
      const conta = updated.find(c => c.id === id);
      // Chama Firebase fora do updater para evitar race condition com onSnapshot
      if (conta && window.firebaseSync.getCodigo()) {
        const contaCopia = { ...conta };
        setTimeout(() => window.firebaseSync.saveConta(contaCopia), 0);
      }
      return updated;
    });
  }, []);

  const handleResetData = useCallback(async () => {
    if (window.firebaseSync.getCodigo()) {
      await window.firebaseSync.clearAllContas(contas);
    }
    localStorage.removeItem('mv_residencia_v1');
    localStorage.removeItem('mv_residencia_v2');
    location.reload();
  }, [contas]);

  const handleDuplicarMes = useCallback(() => {
    const anterior = window.prevMes(mesRef);
    const recorrentes = contas.filter(c => c.mesRef === anterior && c.recorrente);
    const novas = recorrentes.map(c => ({ ...c, id: window.genId(), mesRef, status: 'pendente' }));
    setContas(prev => [...prev, ...novas]);
    if (window.firebaseSync.getCodigo()) window.firebaseSync.saveBatch(novas);
  }, [contas, mesRef]);

  const contasMes = contas.filter(c => c.mesRef === mesRef);
  const totalMes  = contasMes.reduce((s, c) => s + c.valor, 0);
  const atrasados = contasMes.filter(c => c.status === 'atrasado').length;

  const btnIcon = {
    width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'all .15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}>

      {/* ── Header ── */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '16px', height: '60px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="14" height="10" rx="2" stroke="#FFF" strokeWidth="1.5"/>
              <path d="M5 4V3a3 3 0 016 0v1" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 9v2M6 10h4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Residência M&amp;V</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.1 }}>Controle de Contas</p>
          </div>
        </div>

        {/* Navegador mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setMesRef(window.prevMes(mesRef))} style={btnIcon}>‹</button>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', minWidth: '140px', textAlign: 'center', textTransform: 'capitalize' }}>
            {window.fmtMes(mesRef)}
          </span>
          <button onClick={() => setMesRef(window.nextMes(mesRef))} style={btnIcon}>›</button>
          {mesRef !== window.todayMes() && (
            <button onClick={() => setMesRef(window.todayMes())} style={{
              padding: '4px 10px', borderRadius: '6px', border: '1.5px solid var(--accent)',
              background: 'transparent', color: 'var(--accent)', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
            }}>Hoje</button>
          )}
        </div>

        {/* Mini stats + ações */}
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', alignItems: 'center' }}>
          {atrasados > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D94F3D' }}></div>
              <span style={{ fontSize: '12px', color: '#D94F3D', fontWeight: 700 }}>{atrasados} atrasada{atrasados > 1 ? 's' : ''}</span>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Total do mês</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(totalMes)}</p>
          </div>

          {/* Sync indicator */}
          <button onClick={() => setShowFamilia(true)} title="Sincronização da família" style={{
            ...btnIcon, gap:'6px', width:'auto', padding:'0 12px',
          }}>
            <div style={{
              width:'8px', height:'8px', borderRadius:'50%',
              background: syncStatus === 'online' ? '#2D9D6B' : syncStatus === 'connecting' ? '#D4900A' : '#AAA',
            }}></div>
            <span style={{ fontSize:'12px', fontWeight:600, color:'var(--text-muted)' }}>
              {syncStatus === 'online' ? 'Sincronizado' : syncStatus === 'connecting' ? 'Conectando...' : 'Offline'}
            </span>
          </button>

          {/* Dark mode toggle */}
          <button onClick={() => setIsDark(d => !d)} title={isDark ? 'Modo claro' : 'Modo escuro'} style={{
            ...btnIcon, color: isDark ? '#F0C040' : 'var(--text-muted)',
          }}>{isDark ? <SunIcon /> : <MoonIcon />}</button>

          {/* Exportar Excel */}
          <button onClick={() => window.exportarXLSX(contas)} title="Exportar Excel" style={{
            ...btnIcon, gap: '6px', width: 'auto', padding: '0 14px',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', color: '#2D9D6B',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 10v3h11v-3M7.5 1v8M4.5 6l3 3 3-3" stroke="#2D9D6B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Excel
          </button>

          {/* Nova Conta */}
          <button onClick={() => setModal({ mode: 'add' })} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: 'var(--accent)', color: '#FFF', cursor: 'pointer',
            fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
          }}>+ Nova Conta</button>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', display: 'flex',
      }}>
        {ABAS.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{
            padding: '12px 18px', border: 'none', background: 'none',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
            fontWeight: aba === a.id ? 700 : 500,
            color: aba === a.id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: `2px solid ${aba === a.id ? 'var(--accent)' : 'transparent'}`,
            marginBottom: '-1px', transition: 'color .15s',
          }}>{a.label}</button>
        ))}
      </nav>

      {/* ── Content ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px' }}>
        {aba === 'dashboard'  && <DashboardView  contas={contas} mesRef={mesRef} onAddConta={() => setModal({ mode: 'add' })} onStatusChange={handleStatusChange} />}
        {aba === 'lista'      && <ListaView       contas={contas} mesRef={mesRef} onAdd={() => setModal({ mode: 'add' })} onEdit={c => setModal({ mode: 'edit', conta: c })} onDelete={handleDelete} onDeleteMany={handleDeleteMany} onStatusChange={handleStatusChange} onDuplicarMes={handleDuplicarMes} />}
        {aba === 'calendario' && <CalendarioView  contas={contas} mesRef={mesRef} onEdit={c => setModal({ mode: 'edit', conta: c })} onStatusChange={handleStatusChange} />}
        {aba === 'historico'  && <HistoricoView   contas={contas} mesRef={mesRef} />}
      </main>

      {modal && (
        <AddEditModal conta={modal.conta} mesRef={mesRef} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {showFamilia && (
        <FamiliaSetup onConnect={async () => { await conectarFirebase(); return true; }} onReset={handleResetData} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
