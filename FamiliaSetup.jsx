const { useState: useStateFam } = React;

function FamiliaSetup({ onConnect, onReset }) {
  const [codigo, setCodigo] = useStateFam(window.firebaseSync.getCodigo());
  const [erro, setErro] = useStateFam('');
  const [loading, setLoading] = useStateFam(false);
  const [confirmReset, setConfirmReset] = useStateFam(false);

  const handleConnect = async () => {
    if (!codigo.trim()) { setErro('Informe um código'); return; }
    if (!window.firebaseSync.isConfigured()) {
      setErro('Firebase ainda não foi configurado. Edite o arquivo firebase-sync.js e cole as credenciais do seu projeto.');
      return;
    }
    setLoading(true);
    window.firebaseSync.setCodigo(codigo);
    const ok = await onConnect();
    setLoading(false);
    if (!ok) setErro('Falha ao conectar. Verifique sua conexão e o código.');
  };

  const handleDisconnect = () => {
    window.firebaseSync.clearCodigo();
    location.reload();
  };

  const isConnected = !!window.firebaseSync.getCodigo();

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px',
    }}>
      <div style={{
        background:'var(--surface)', borderRadius:'18px', width:'440px', maxWidth:'100%',
        padding:'28px', border:'1px solid var(--border)',
        boxShadow:'0 24px 72px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ margin:'0 0 6px', fontSize:'18px', fontWeight:700, color:'var(--text)' }}>
          {isConnected ? 'Família Conectada' : 'Conectar Família'}
        </h2>
        <p style={{ margin:'0 0 20px', fontSize:'13px', color:'var(--text-muted)', lineHeight:1.5 }}>
          {isConnected
            ? 'Os dados são sincronizados automaticamente entre todos os dispositivos com o mesmo código.'
            : 'Crie um código único e use o mesmo em todos os dispositivos da família para sincronizar as contas em tempo real.'}
        </p>

        <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'var(--text-muted)', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'.04em' }}>Código da família</label>
        <input
          value={codigo}
          onChange={e => { setCodigo(e.target.value); setErro(''); }}
          placeholder="Ex: silva-2026"
          disabled={isConnected}
          style={{
            width:'100%', padding:'10px 12px',
            border:`1.5px solid ${erro ? '#D94F3D' : 'var(--border)'}`,
            borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box',
            fontFamily:'inherit', color:'var(--text)', background:'var(--input-bg)',
          }}
        />
        {erro && <p style={{ margin:'6px 0 0', fontSize:'12px', color:'#D94F3D' }}>{erro}</p>}

        <p style={{ margin:'14px 0 20px', fontSize:'12px', color:'var(--text-muted)', lineHeight:1.5, padding:'10px 12px', background:'var(--subtle)', borderRadius:'8px' }}>
          💡 <strong>Dica:</strong> use letras minúsculas, sem espaços. Ex: <code>familia-souza-2026</code>. Compartilhe esse mesmo código com sua esposa.
        </p>

        <div style={{ display:'flex', gap:'10px' }}>
          {isConnected ? (
            <>
              <button onClick={handleDisconnect} style={{
                flex:1, padding:'12px', border:'1.5px solid #D94F3D', borderRadius:'10px',
                background:'transparent', color:'#D94F3D', cursor:'pointer',
                fontSize:'14px', fontWeight:600, fontFamily:'inherit',
              }}>Desconectar</button>
              <button onClick={onConnect} style={{
                flex:2, padding:'12px', border:'none', borderRadius:'10px',
                background:'var(--accent)', color:'#FFF', cursor:'pointer',
                fontSize:'14px', fontWeight:700, fontFamily:'inherit',
              }}>Continuar</button>
            </>
          ) : (
            <>
              <button onClick={onConnect} style={{
                flex:1, padding:'12px', border:'1.5px solid var(--border)', borderRadius:'10px',
                background:'var(--surface)', cursor:'pointer', fontSize:'14px',
                fontWeight:600, fontFamily:'inherit', color:'var(--text)',
              }}>Usar offline</button>
              <button onClick={handleConnect} disabled={loading} style={{
                flex:2, padding:'12px', border:'none', borderRadius:'10px',
                background:'var(--accent)', color:'#FFF', cursor: loading ? 'wait' : 'pointer',
                fontSize:'14px', fontWeight:700, fontFamily:'inherit', opacity: loading ? 0.6 : 1,
              }}>{loading ? 'Conectando...' : 'Conectar'}</button>
            </>
          )}
        </div>

        {/* Zona de perigo */}
        <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} style={{
              width:'100%', padding:'10px', border:'1px solid var(--border)', borderRadius:'8px',
              background:'transparent', color:'var(--text-muted)', cursor:'pointer',
              fontSize:'13px', fontWeight:500, fontFamily:'inherit',
            }}>Zerar todos os dados</button>
          ) : (
            <div style={{ background:'#FEF0EF', borderRadius:'8px', padding:'12px', border:'1px solid #D94F3D22' }}>
              <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#D94F3D', fontWeight:600 }}>
                Isso apaga TODOS os lançamentos local e do Firebase. Confirma?
              </p>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => setConfirmReset(false)} style={{
                  flex:1, padding:'8px', border:'1px solid var(--border)', borderRadius:'7px',
                  background:'var(--surface)', cursor:'pointer', fontSize:'13px', fontFamily:'inherit',
                }}>Cancelar</button>
                <button onClick={onReset} style={{
                  flex:1, padding:'8px', border:'none', borderRadius:'7px',
                  background:'#D94F3D', color:'#FFF', cursor:'pointer',
                  fontSize:'13px', fontWeight:700, fontFamily:'inherit',
                }}>Sim, apagar tudo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FamiliaSetup });
