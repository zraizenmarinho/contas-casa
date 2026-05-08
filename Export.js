// Export to XLSX using SheetJS
// Generates a workbook with 3 sheets optimized for pivot tables

window.exportarXLSX = function (contas) {
  const XLSX = window.XLSX;
  if (!XLSX) { alert('Biblioteca de exportação não carregada.'); return; }

  /* ── Helpers ─────────────────────────────────── */
  const mesLabel = (mesRef) => {
    const [y, m] = mesRef.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };
  const mesAbrev = (mesRef) => {
    const [y, m] = mesRef.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.','').toUpperCase() + '/' + y;
  };

  /* ═══════════════════════════════════════════════
     SHEET 1 — Transações (base para tabela dinâmica)
  ══════════════════════════════════════════════════ */
  const headerTrans = [
    'Mês Referência', 'Ano', 'Mês Número', 'Mês Abrev',
    'Nome da Conta', 'Categoria', 'Valor (R$)',
    'Dia Vencimento', 'Status', 'Recorrente', 'Observação'
  ];

  const rowsTrans = contas
    .slice()
    .sort((a, b) => {
      if (a.mesRef < b.mesRef) return -1;
      if (a.mesRef > b.mesRef) return 1;
      return a.vencimentoDia - b.vencimentoDia;
    })
    .map(c => {
      const [y, m] = c.mesRef.split('-').map(Number);
      const cat = window.getCat(c.categoria);
      return [
        mesLabel(c.mesRef),
        y,
        m,
        mesAbrev(c.mesRef),
        c.nome,
        cat.nome,
        c.valor,
        c.vencimentoDia,
        c.status.charAt(0).toUpperCase() + c.status.slice(1),
        c.recorrente ? 'Sim' : 'Não',
        c.observacao || '',
      ];
    });

  const wsTrans = XLSX.utils.aoa_to_sheet([headerTrans, ...rowsTrans]);

  // Larguras de coluna
  wsTrans['!cols'] = [
    { wch: 22 }, { wch: 7 }, { wch: 12 }, { wch: 12 },
    { wch: 28 }, { wch: 28 }, { wch: 14 },
    { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ];

  // Formata a coluna Valor como número BRL
  rowsTrans.forEach((_, i) => {
    const cell = wsTrans[XLSX.utils.encode_cell({ r: i + 1, c: 6 })];
    if (cell) { cell.t = 'n'; cell.z = 'R$ #,##0.00'; }
  });

  // Estilo do cabeçalho (negrito via cell comment — SheetJS CE não suporta estilos, mas adiciona freeze)
  wsTrans['!freeze'] = { xSplit: 0, ySplit: 1 };
  wsTrans['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rowsTrans.length, c: headerTrans.length - 1 } }) };

  /* ═══════════════════════════════════════════════
     SHEET 2 — Resumo por Mês
  ══════════════════════════════════════════════════ */
  const meses = [...new Set(contas.map(c => c.mesRef))].sort();

  const headerMes = [
    'Mês Referência', 'Ano', 'Mês Número', 'Mês Abrev',
    'Total (R$)', 'Pago (R$)', 'Pendente (R$)', 'Atrasado (R$)',
    'Qtd Total', 'Qtd Pago', 'Qtd Pendente', 'Qtd Atrasado',
    '% Pago',
  ];

  const rowsMes = meses.map(mes => {
    const cs = contas.filter(c => c.mesRef === mes);
    const [y, m] = mes.split('-').map(Number);
    const total    = cs.reduce((s, c) => s + c.valor, 0);
    const pago     = cs.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
    const pendente = cs.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
    const atrasado = cs.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
    return [
      mesLabel(mes), y, m, mesAbrev(mes),
      total, pago, pendente, atrasado,
      cs.length,
      cs.filter(c => c.status === 'pago').length,
      cs.filter(c => c.status === 'pendente').length,
      cs.filter(c => c.status === 'atrasado').length,
      total > 0 ? +(pago / total * 100).toFixed(1) : 0,
    ];
  });

  const wsMes = XLSX.utils.aoa_to_sheet([headerMes, ...rowsMes]);
  wsMes['!cols'] = [
    { wch: 22 }, { wch: 7 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 10 },
  ];
  // Formata valores numéricos
  rowsMes.forEach((_, i) => {
    [4, 5, 6, 7].forEach(c => {
      const cell = wsMes[XLSX.utils.encode_cell({ r: i + 1, c })];
      if (cell) { cell.t = 'n'; cell.z = 'R$ #,##0.00'; }
    });
    const pctCell = wsMes[XLSX.utils.encode_cell({ r: i + 1, c: 12 })];
    if (pctCell) { pctCell.t = 'n'; pctCell.z = '0.0"%"'; }
  });
  wsMes['!freeze'] = { xSplit: 0, ySplit: 1 };
  wsMes['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rowsMes.length, c: headerMes.length - 1 } }) };

  /* ═══════════════════════════════════════════════
     SHEET 3 — Resumo por Categoria × Mês
  ══════════════════════════════════════════════════ */
  const headerCat = [
    'Categoria', 'Mês Referência', 'Ano', 'Mês Número', 'Mês Abrev',
    'Total (R$)', 'Pago (R$)', 'Pendente (R$)', 'Atrasado (R$)', 'Qtd Contas',
  ];

  const rowsCat = [];
  meses.forEach(mes => {
    const [y, m2] = mes.split('-').map(Number);
    const cs = contas.filter(c => c.mesRef === mes);
    const cats = [...new Set(cs.map(c => c.categoria))];
    cats.forEach(cat => {
      const cc = cs.filter(c => c.categoria === cat);
      const catInfo = window.getCat(cat);
      const total    = cc.reduce((s, c) => s + c.valor, 0);
      const pago     = cc.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
      const pendente = cc.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
      const atrasado = cc.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
      rowsCat.push([
        catInfo.nome, mesLabel(mes), y, m2, mesAbrev(mes),
        total, pago, pendente, atrasado, cc.length,
      ]);
    });
  });

  const wsCat = XLSX.utils.aoa_to_sheet([headerCat, ...rowsCat]);
  wsCat['!cols'] = [
    { wch: 28 }, { wch: 22 }, { wch: 7 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
  ];
  rowsCat.forEach((_, i) => {
    [5, 6, 7, 8].forEach(c => {
      const cell = wsCat[XLSX.utils.encode_cell({ r: i + 1, c })];
      if (cell) { cell.t = 'n'; cell.z = 'R$ #,##0.00'; }
    });
  });
  wsCat['!freeze'] = { xSplit: 0, ySplit: 1 };
  wsCat['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rowsCat.length, c: headerCat.length - 1 } }) };

  /* ── Montar workbook e baixar ──────────────────── */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTrans, 'Transações');
  XLSX.utils.book_append_sheet(wb, wsMes,   'Resumo por Mês');
  XLSX.utils.book_append_sheet(wb, wsCat,   'Por Categoria');

  const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  XLSX.writeFile(wb, `Contas_Residencia_${hoje}.xlsx`);
};
