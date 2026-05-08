(function () {
  const KEY = 'mv_residencia_v1';

  window.CATEGORIAS = [
    { id: 'aluguel',    nome: 'Aluguel / Financiamento', cor: '#4CAF82' },
    { id: 'condominio', nome: 'Condomínio',               cor: '#7CB8D6' },
    { id: 'luz',        nome: 'Luz / Energia',            cor: '#F0A500' },
    { id: 'agua',       nome: 'Água',                     cor: '#5B8FD4' },
    { id: 'gas',        nome: 'Gás',                      cor: '#E8774D' },
    { id: 'internet',   nome: 'Internet',                 cor: '#7B6CF6' },
    { id: 'mercado',    nome: 'Mercado / Alimentação',    cor: '#5EAD6E' },
    { id: 'escola',     nome: 'Escola / Educação',        cor: '#C97BD4' },
    { id: 'saude',      nome: 'Saúde / Plano de Saúde',  cor: '#E06891' },
    { id: 'streaming',       nome: 'Streaming / Assinaturas', cor: '#9C6CF7' },
    { id: 'eletrodomestico', nome: 'Eletrodoméstico',       cor: '#D4785A' },
    { id: 'melhorias',       nome: 'Melhorias da Casa',     cor: '#6B9E8C' },
    { id: 'outros',          nome: 'Outros',                cor: '#AAAAAA' },
  ];

  const SEED = [
    // Abril 2026
    { id:'a1', nome:'Aluguel',         categoria:'aluguel',    valor:2800, vencimentoDia:5,  mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a2', nome:'Condomínio',      categoria:'condominio', valor:450,  vencimentoDia:10, mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a3', nome:'Conta de Luz',    categoria:'luz',        valor:187,  vencimentoDia:29, mesRef:'2026-04', status:'pendente', recorrente:true,  observacao:'' },
    { id:'a4', nome:'Conta de Água',   categoria:'agua',       valor:95,   vencimentoDia:30, mesRef:'2026-04', status:'pendente', recorrente:true,  observacao:'' },
    { id:'a5', nome:'Internet',        categoria:'internet',   valor:119,  vencimentoDia:10, mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a6', nome:'Gás',             categoria:'gas',        valor:68,   vencimentoDia:18, mesRef:'2026-04', status:'atrasado', recorrente:true,  observacao:'' },
    { id:'a7', nome:'Escola',          categoria:'escola',     valor:620,  vencimentoDia:5,  mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a8', nome:'Plano de Saúde',  categoria:'saude',      valor:540,  vencimentoDia:12, mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a9', nome:'Streaming',       categoria:'streaming',  valor:75,   vencimentoDia:15, mesRef:'2026-04', status:'pago',     recorrente:true,  observacao:'' },
    { id:'a10',nome:'Mercado',         categoria:'mercado',    valor:380,  vencimentoDia:7,  mesRef:'2026-04', status:'pago',     recorrente:false, observacao:'' },
    // Março 2026
    { id:'b1', nome:'Aluguel',         categoria:'aluguel',    valor:2800, vencimentoDia:5,  mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b2', nome:'Condomínio',      categoria:'condominio', valor:450,  vencimentoDia:10, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b3', nome:'Conta de Luz',    categoria:'luz',        valor:165,  vencimentoDia:15, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b4', nome:'Conta de Água',   categoria:'agua',       valor:88,   vencimentoDia:20, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b5', nome:'Internet',        categoria:'internet',   valor:119,  vencimentoDia:10, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b6', nome:'Gás',             categoria:'gas',        valor:72,   vencimentoDia:18, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b7', nome:'Escola',          categoria:'escola',     valor:620,  vencimentoDia:5,  mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b8', nome:'Plano de Saúde',  categoria:'saude',      valor:540,  vencimentoDia:12, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b9', nome:'Streaming',       categoria:'streaming',  valor:75,   vencimentoDia:15, mesRef:'2026-03', status:'pago', recorrente:true, observacao:'' },
    { id:'b10',nome:'Mercado',         categoria:'mercado',    valor:420,  vencimentoDia:8,  mesRef:'2026-03', status:'pago', recorrente:false, observacao:'' },
    // Fevereiro 2026
    { id:'c1', nome:'Aluguel',         categoria:'aluguel',    valor:2800, vencimentoDia:5,  mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c2', nome:'Condomínio',      categoria:'condominio', valor:450,  vencimentoDia:10, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c3', nome:'Conta de Luz',    categoria:'luz',        valor:142,  vencimentoDia:15, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c4', nome:'Conta de Água',   categoria:'agua',       valor:91,   vencimentoDia:20, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c5', nome:'Internet',        categoria:'internet',   valor:119,  vencimentoDia:10, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c6', nome:'Gás',             categoria:'gas',        valor:58,   vencimentoDia:18, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c7', nome:'Escola',          categoria:'escola',     valor:620,  vencimentoDia:5,  mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c8', nome:'Plano de Saúde',  categoria:'saude',      valor:540,  vencimentoDia:12, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    { id:'c9', nome:'Streaming',       categoria:'streaming',  valor:75,   vencimentoDia:15, mesRef:'2026-02', status:'pago', recorrente:true, observacao:'' },
    // Janeiro 2026
    { id:'d1', nome:'Aluguel',         categoria:'aluguel',    valor:2800, vencimentoDia:5,  mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d2', nome:'Condomínio',      categoria:'condominio', valor:450,  vencimentoDia:10, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d3', nome:'Conta de Luz',    categoria:'luz',        valor:198,  vencimentoDia:15, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d4', nome:'Conta de Água',   categoria:'agua',       valor:87,   vencimentoDia:20, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d5', nome:'Internet',        categoria:'internet',   valor:119,  vencimentoDia:10, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d6', nome:'Gás',             categoria:'gas',        valor:82,   vencimentoDia:18, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d7', nome:'Escola',          categoria:'escola',     valor:620,  vencimentoDia:5,  mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d8', nome:'Plano de Saúde',  categoria:'saude',      valor:540,  vencimentoDia:12, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
    { id:'d9', nome:'Streaming',       categoria:'streaming',  valor:75,   vencimentoDia:15, mesRef:'2026-01', status:'pago', recorrente:true, observacao:'' },
  ];

  window.loadData = function () {
    try {
      const s = localStorage.getItem(KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return SEED.map(x => ({ ...x }));
  };

  window.saveData = function (data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  };

  window.genId = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  window.fmtBRL = function (val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  window.fmtMes = function (mesRef) {
    const [y, m] = mesRef.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  window.fmtMesCurto = function (mesRef) {
    const [y, m] = mesRef.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  };

  window.getCat = function (id) {
    return window.CATEGORIAS.find(c => c.id === id) || { nome: id, cor: '#AAA' };
  };

  window.prevMes = function (mesRef) {
    const [y, m] = mesRef.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  window.nextMes = function (mesRef) {
    const [y, m] = mesRef.split('-').map(Number);
    const d = new Date(y, m, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  window.todayMes = function () {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };
})();
