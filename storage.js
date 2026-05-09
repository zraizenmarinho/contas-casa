(function () {
  const KEY = 'mv_residencia_v2';

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

  const SEED = [];

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
