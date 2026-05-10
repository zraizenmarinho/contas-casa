const { useState } = React;

function AddEditModal({ conta, mesRef, onSave, onClose }) {
  const isEdit = !!conta;
  const [form, setForm] = useState({
    nome:           conta?.nome || '',
    categoria:      conta?.categoria || 'outros',
    valor:          conta?.valor?.toString().replace('.', ',') || '',
    vencimentoDia:  conta?.vencimentoDia?.toString() || '',
    recorrente:     conta?.recorrente ?? false,
    status:         conta?.status || 'pendente',
    observacao:     conta?.observacao || '',
    // Parcelamento
    parcelado:      conta?.parcelado ?? false,
    totalParcelas:  conta?.totalParcelas?.toString() || '12',
    parcelaAtual:   conta?.parcelaAtual?.toString() || '1',
    autoGerar:      false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valorNum       = parseFloat((form.valor || '0').replace(',', '.')) || 0;
  const totalParcelasN = parseInt(form.totalParcelas) || 1;
  const parcelaAtualN  = parseInt(form.parcelaAtual)  || 1;
  const valorTotal     = valorNum * totalParcelasN;
  const parcelasRestantes = totalParcelasN - parcelaAtualN + 1;

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome';
    const v = parseFloat((form.valor || '').replace(',', '.'));
    if (!form.valor || isNaN(v) || v <= 0) e.valor = 'Valor inválido';
    const d = parseInt(form.vencimentoDia);
    if (!form.vencimentoDia || isNaN(d) || d < 1 || d > 31) e.vencimentoDia = 'Dia inválido (1–31)';
    if (form.parcelado) {
      const tp = parseInt(form.totalParcelas);
      if (!form.totalParcelas || isNaN(tp) || tp < 2) e.totalParcelas = 'Mínimo 2 parcelas';
      const pa = parseInt(form.parcelaAtual);
      if (!form.parcelaAtual || isNaN(pa) || pa < 1 || pa > tp) e.parcelaAtual = `Entre 1 e ${tp}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    const base = {
      id:            conta?.id || window.genId(),
      nome:          form.nome.trim(),
      categoria:     form.categoria,
      valor:         parseFloat((form.valor || '').replace(',', '.')),
      vencimentoDia: parseInt(form.vencimentoDia),
      recorrente:    form.parcelado ? false : form.recorrente,
      status:        form.status,
      observacao:    form.observacao.trim(),
      mesRef:        conta?.mesRef || mesRef,
      parcelado:     form.parcelado,
      totalParcelas: form.parcelado ? parseInt(form.totalParcelas) : null,
      parcelaAtual:  form.parcelado ? parseInt(form.parcelaAtual)  : null,
      grupoParcelamento: conta?.grupoParcelamento || (form.parcelado ? window.genId() : null),
    };
    onSave(base, form.parcelado && form.autoGerar && !isEdit);
  };

  const inpStyle = (err) => ({
    width: '100%', padding: '10px 12px',
    border: `1.5px solid ${err ? '#D94F3D' : 'var(--border)'}`,
    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', color: 'var(--text)', background: 'var(--input-bg)',
    transition: 'border-color .15s',
  });
  const lbl = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.04em' };
  const errMsg = (k) => errors[k] ? <span style={{ fontSize: '12px', color: '#D94F3D', marginTop: '3px', display: 'block' }}>{errors[k]}</span> : null;

  const STATUS_OPTS = [
    { val: 'pendente', label: 'Pendente', cor: '#D4900A' },
    { val: 'pago',     label: 'Pago',     cor: '#2D9D6B' },
    { val: 'atrasado', label: 'Atrasado', cor: '#D94F3D' },
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: '18px', width: '500px', maxWidth: '100%',
        maxHeight: '92vh', overflowY: 'auto', padding: '28px 28px 24px',
        boxShadow: '0 24px 72px rgba(0,0,0,0.3)', border: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              {isEdit ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{window.fmtMes(mesRef)}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--subtle)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--text-muted)',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Nome da conta</label>
            <input style={inpStyle(errors.nome)} value={form.nome}
              onChange={e => set('nome', e.target.value)} placeholder="Ex: TV Samsung" />
            {errMsg('nome')}
          </div>

          {/* Categoria */}
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Categoria</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                width: '10px', height: '10px', borderRadius: '50%',
                background: window.getCat(form.categoria).cor, pointerEvents: 'none',
              }}></div>
              <select style={{ ...inpStyle(false), paddingLeft: '30px', appearance: 'none', cursor: 'pointer' }}
                value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {window.CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Valor + Vencimento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>{form.parcelado ? 'Valor da parcela (R$)' : 'Valor (R$)'}</label>
              <input style={inpStyle(errors.valor)} value={form.valor}
                onChange={e => set('valor', e.target.value)} placeholder="0,00" />
              {errMsg('valor')}
            </div>
            <div>
              <label style={lbl}>Dia de Vencimento</label>
              <input style={inpStyle(errors.vencimentoDia)} type="number" min="1" max="31"
                value={form.vencimentoDia} onChange={e => set('vencimentoDia', e.target.value)} placeholder="10" />
              {errMsg('vencimentoDia')}
            </div>
          </div>

          {/* Toggle parcelado */}
          <div style={{
            marginBottom: '16px', padding: '14px', background: 'var(--subtle)',
            borderRadius: '12px', border: `2px solid ${form.parcelado ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'border-color .2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: form.parcelado ? '14px' : '0' }}>
              <input type="checkbox" id="parcelado" checked={form.parcelado}
                onChange={e => set('parcelado', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
              <label htmlFor="parcelado" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', flex: 1 }}>
                Compra parcelada
              </label>
              {form.parcelado && valorNum > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                  Total: {window.fmtBRL(valorTotal)}
                </span>
              )}
            </div>

            {form.parcelado && (
              <div>
                {/* Parcelas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={lbl}>Total de parcelas</label>
                    <input style={inpStyle(errors.totalParcelas)} type="number" min="2" max="120"
                      value={form.totalParcelas} onChange={e => set('totalParcelas', e.target.value)}
                      placeholder="12" />
                    {errMsg('totalParcelas')}
                  </div>
                  <div>
                    <label style={lbl}>Parcela atual (nº)</label>
                    <input style={inpStyle(errors.parcelaAtual)} type="number" min="1"
                      max={form.totalParcelas || 999}
                      value={form.parcelaAtual} onChange={e => set('parcelaAtual', e.target.value)}
                      placeholder="1" />
                    {errMsg('parcelaAtual')}
                  </div>
                </div>

                {/* Preview */}
                {valorNum > 0 && totalParcelasN >= 2 && (
                  <div style={{
                    padding: '10px 12px', background: 'var(--surface)', borderRadius: '8px',
                    border: '1px solid var(--border)', marginBottom: '12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
                  }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Por parcela</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(valorNum)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Total geral</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{window.fmtBRL(valorTotal)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Restam</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{parcelasRestantes}x</p>
                      </div>
                    </div>
                    <span style={{
                      background: 'var(--accent-lt)', color: 'var(--accent)',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                    }}>{parcelaAtualN}/{totalParcelasN}</span>
                  </div>
                )}

                {/* Auto-gerar (só na criação) */}
                {!isEdit && parcelasRestantes > 1 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input type="checkbox" id="autoGerar" checked={form.autoGerar}
                      onChange={e => set('autoGerar', e.target.checked)}
                      style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                    <label htmlFor="autoGerar" style={{ fontSize: '13px', color: 'var(--text)', cursor: 'pointer' }}>
                      Criar automaticamente as próximas <strong>{parcelasRestantes - 1}</strong> parcelas nos meses seguintes
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {STATUS_OPTS.map(({ val, label, cor }) => (
                <button key={val} type="button" onClick={() => set('status', val)} style={{
                  padding: '9px 6px', border: `2px solid ${form.status === val ? cor : 'var(--border)'}`,
                  borderRadius: '8px', background: form.status === val ? cor + '22' : 'var(--surface)',
                  color: form.status === val ? cor : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit', transition: 'all .15s',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Recorrente (só se não parcelado) */}
          {!form.parcelado && (
            <div style={{
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', background: 'var(--subtle)', borderRadius: '10px', border: '1.5px solid var(--border)',
            }}>
              <input type="checkbox" id="rec" checked={form.recorrente}
                onChange={e => set('recorrente', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
              <label htmlFor="rec" style={{ fontSize: '14px', color: 'var(--text)', cursor: 'pointer', flex: 1 }}>
                Conta recorrente <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(se repete todo mês)</span>
              </label>
            </div>
          )}

          {/* Observação */}
          <div style={{ marginBottom: '24px' }}>
            <label style={lbl}>Observação <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
            <textarea style={{ ...inpStyle(false), resize: 'vertical', minHeight: '64px' }}
              value={form.observacao} onChange={e => set('observacao', e.target.value)}
              placeholder="Alguma nota sobre esta conta..." />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '12px', border: '1.5px solid var(--border)', borderRadius: '10px',
              background: 'var(--surface)', cursor: 'pointer', fontSize: '14px',
              fontWeight: 600, fontFamily: 'inherit', color: 'var(--text)',
            }}>Cancelar</button>
            <button type="submit" disabled={submitting} style={{
              flex: 2, padding: '12px', border: 'none', borderRadius: '10px',
              background: submitting ? 'var(--text-muted)' : 'var(--accent)', color: '#FFF',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', transition: 'background .15s',
            }}>
              {submitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : form.parcelado && form.autoGerar ? `Criar ${parcelasRestantes} parcelas` : 'Adicionar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { AddEditModal });
