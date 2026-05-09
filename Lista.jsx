const { useState, useMemo } = React;

function ListaView({ contas, mesRef, onAdd, onEdit, onDelete, onDeleteMany, onStatusChange, onDuplicarMes }) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCat, setFiltroCat]       = useState('todas');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [modoSelecao, setModoSelecao]   = useState(false);
  const [selecionados, setSelecionados] = useState(new Set());
  const [confirmApagarTudo, setConfirmApagarTudo] = useState(false);
  const [confirmApagarSel, setConfirmApagarSel]   = useState(false);

  const contasMes = useMemo(() => contas.filter(c => c.mesRef === mesRef), [contas, mesRef]);

  const filtered = useMemo(() =>
    contasMes
      .filter(c => filtroStatus === 'todos' || c.status === filtroStatus)
      .filter(c => filtroCat === 'todas' || c.categoria === filtroCat)
      .sort((a, b) => a.vencimentoDia - b.vencimentoDia),
    [contasMes, filtroStatus, filtroCat]);

  const catsUsadas = useMemo(() => {
    const ids = [...new Set(contasMes.map(c => c.categoria))];
    return ids.map(id => window.getCat(id));
  }, [contasMes]);

  const STATUS_CYCLE = { pendente: 'pago', pago: 'atrasado', atrasado: 'pendente' };
  const statusInfo = {
    pago:     { cor: '#2D9D6B', bg: '#EBF7F2', label: 'Pago'     },
    pendente: { cor: '#D4900A', bg: '#FEF7E8', label: 'Pendente' },
    atrasado: { cor: '#D94F3D', bg: '#FEF0EF', label: 'Atrasado' },
  };

  const pill = (label, active, onClick, cor) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: '13px', fontWeight: active ? 700 : 500,
      background: active ? (cor || 'var(--accent)') : 'var(--subtle)',
      color: active ? '#FFF' : 'var(--text-muted)',
      transition: 'all .15s',
    }}>{label}</button>
  );

  const hasMesAnterior  = contas.some(c => c.recorrente && c.mesRef < mesRef);
  const jaTemRecorrentes = contasMes.some(c => c.recorrente);

  const toggleSelecao = (id) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selecionados.size === filtered.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(filtered.map(c => c.id)));
    }
  };

  const sairSelecao = () => {
    setModoSelecao(false);
    setSelecionados(new Set());
    setConfirmApagarSel(false);
  };

  const btnBase = {
    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', border: 'none',
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {!modoSelecao && pill('Todos',    filtroStatus === 'todos',    () => setFiltroStatus('todos'),    '#18181A')}
          {!modoSelecao && pill('Pendente', filtroStatus === 'pendente', () => setFiltroStatus('pendente'), '#D4900A')}
          {!modoSelecao && pill('Pago',     filtroStatus === 'pago',     () => setFiltroStatus('pago'),     '#2D9D6B')}
          {!modoSelecao && pill('Atrasado', filtroStatus === 'atrasado', () => setFiltroStatus('atrasado'), '#D94F3D')}
          {modoSelecao && (
            <button onClick={toggleTodos} style={{
              ...btnBase, background: 'var(--subtle)', color: 'var(--text-muted)',
            }}>
              {selecionados.size === filtered.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasMesAnterior && !jaTemRecorrentes && !modoSelecao && (
            <button onClick={onDuplicarMes} style={{
              ...btnBase, border: '1.5px solid var(--accent)',
              background: 'var(--accent-lt)', color: 'var(--accent)',
            }}>Copiar do mês anterior</button>
          )}

          {/* Botão Selecionar / Cancelar */}
          {contasMes.length > 0 && (
            <button onClick={modoSelecao ? sairSelecao : () => setModoSelecao(true)} style={{
              ...btnBase,
              border: '1.5px solid var(--border)',
              background: modoSelecao ? 'var(--subtle)' : 'var(--surface)',
              color: modoSelecao ? 'var(--text)' : 'var(--text-muted)',
            }}>{modoSelecao ? 'Cancelar' : 'Selecionar'}</button>
          )}

          {/* Apagar selecionados */}
          {modoSelecao && selecionados.size > 0 && !confirmApagarSel && (
            <button onClick={() => setConfirmApagarSel(true)} style={{
              ...btnBase, background: '#FEF0EF', color: '#D94F3D',
            }}>Apagar {selecionados.size} selecionada{selecionados.size > 1 ? 's' : ''}</button>
          )}
          {modoSelecao && confirmApagarSel && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { onDeleteMany([...selecionados]); sairSelecao(); }} style={{
                ...btnBase, background: '#D94F3D', color: '#FFF',
              }}>Confirmar exclusão</button>
              <button onClick={() => setConfirmApagarSel(false)} style={{
                ...btnBase, background: 'var(--subtle)', color: 'var(--text-muted)',
              }}>Cancelar</button>
            </div>
          )}

          {/* Apagar tudo do mês */}
          {!modoSelecao && contasMes.length > 0 && !confirmApagarTudo && (
            <button onClick={() => setConfirmApagarTudo(true)} style={{
              ...btnBase, background: 'var(--subtle)', color: '#D94F3D',
            }}>Apagar tudo</button>
          )}
          {!modoSelecao && confirmApagarTudo && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { onDeleteMany(contasMes.map(c => c.id)); setConfirmApagarTudo(false); }} style={{
                ...btnBase, background: '#D94F3D', color: '#FFF',
              }}>Confirmar</button>
              <button onClick={() => setConfirmApagarTudo(false)} style={{
                ...btnBase, background: 'var(--subtle)', color: 'var(--text-muted)',
              }}>Cancelar</button>
            </div>
          )}

          {!modoSelecao && (
            <button onClick={onAdd} style={{
              ...btnBase, background: 'var(--accent)', color: '#FFF', fontWeight: 700,
              padding: '8px 18px',
            }}>+ Nova Conta</button>
          )}
        </div>
      </div>

      {/* Filtro categoria */}
      {!modoSelecao && catsUsadas.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setFiltroCat('todas')} style={{
            padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '12px', fontWeight: filtroCat === 'todas' ? 700 : 400,
            background: filtroCat === 'todas' ? 'var(--text)' : 'var(--subtle)',
            color: filtroCat === 'todas' ? 'var(--bg)' : 'var(--text-muted)',
          }}>Todas</button>
          {catsUsadas.map(c => (
            <button key={c.id} onClick={() => setFiltroCat(c.id)} style={{
              padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '12px', fontWeight: filtroCat === c.id ? 700 : 400,
              background: filtroCat === c.id ? c.cor : 'var(--subtle)',
              color: filtroCat === c.id ? '#FFF' : 'var(--text-muted)',
            }}>{c.nome}</button>
          ))}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)',
          padding: '48px', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
            {contasMes.length === 0 ? 'Nenhuma conta neste mês' : 'Nenhuma conta com esses filtros'}
          </p>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {contasMes.length === 0 ? 'Adicione uma conta para começar.' : 'Tente ajustar os filtros.'}
          </p>
          {contasMes.length === 0 && (
            <button onClick={onAdd} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: 'var(--accent)', color: '#FFF', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700, fontFamily: 'inherit',
            }}>+ Adicionar primeira conta</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(c => {
            const cat   = window.getCat(c.categoria);
            const si    = statusInfo[c.status] || statusInfo.pendente;
            const isDel = confirmDelete === c.id;
            const isSel = selecionados.has(c.id);

            return (
              <div key={c.id}
                onClick={modoSelecao ? () => toggleSelecao(c.id) : undefined}
                style={{
                  background: isSel ? 'var(--accent-lt)' : 'var(--surface)',
                  borderRadius: '12px',
                  border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'box-shadow .15s, border-color .15s',
                  cursor: modoSelecao ? 'pointer' : 'default',
                }}
                onMouseEnter={e => { if (!modoSelecao) e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Checkbox em modo seleção */}
                {modoSelecao && (
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                    border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSel ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSel && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                )}

                <div style={{ width: '4px', height: '40px', borderRadius: '4px', background: cat.cor, flexShrink: 0 }}></div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</span>
                    {c.recorrente && <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--subtle)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>recorrente</span>}
                    {c.parcelado && <span style={{ fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-lt)', padding: '2px 7px', borderRadius: '4px', flexShrink: 0, fontWeight: 700 }}>{c.parcelaAtual}/{c.totalParcelas}</span>}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.nome} · Vence dia {c.vencimentoDia}</span>
                  {c.observacao && <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{c.observacao}</p>}
                </div>

                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>{window.fmtBRL(c.valor)}</span>

                {!modoSelecao && (
                  <>
                    <button title="Clique para alterar status" onClick={() => onStatusChange(c.id, STATUS_CYCLE[c.status])} style={{
                      padding: '5px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      background: si.bg, color: si.cor, fontWeight: 700, fontSize: '12px',
                      fontFamily: 'inherit', flexShrink: 0, transition: 'opacity .15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >{si.label}</button>

                    {isDel ? (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => { onDelete(c.id); setConfirmDelete(null); }} style={{
                          padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                          background: '#D94F3D', color: '#FFF', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                        }}>Excluir</button>
                        <button onClick={() => setConfirmDelete(null)} style={{
                          padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer',
                          background: 'var(--surface)', color: 'var(--text)', fontSize: '12px', fontFamily: 'inherit',
                        }}>Não</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button onClick={() => onEdit(c)} title="Editar" style={{
                          width: '30px', height: '30px', borderRadius: '6px', border: 'none',
                          background: 'var(--subtle)', cursor: 'pointer', fontSize: '14px',
                        }}>✏️</button>
                        <button onClick={() => setConfirmDelete(c.id)} title="Excluir" style={{
                          width: '30px', height: '30px', borderRadius: '6px', border: 'none',
                          background: 'var(--subtle)', cursor: 'pointer', fontSize: '14px',
                        }}>🗑</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{
          marginTop: '16px', padding: '14px 16px', background: 'var(--surface-2)',
          borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {modoSelecao
              ? `${selecionados.size} de ${filtered.length} selecionada${selecionados.size !== 1 ? 's' : ''}`
              : `${filtered.length} conta${filtered.length > 1 ? 's' : ''}`}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
            Total: {window.fmtBRL(filtered.reduce((s, c) => s + c.valor, 0))}
          </span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ListaView });
