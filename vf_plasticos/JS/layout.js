/* Cabeçalho, rodapé e proteção das páginas do administrador */
(() => {
  const b = document.body, R = b.dataset.raiz || '', pg = b.dataset.pagina, adm = 'admin' in b.dataset, login = 'login' in b.dataset;
  const logado = sessionStorage.getItem('vf_adm') === '1';
  if(adm && !login && !logado){ location.replace(R + 'PAGES/admin-login.html'); return; }
  if(login && logado){ location.replace(R + 'PAGES/admin.html'); return; }
  const L = (h, t, id) => `<a href="${R}${h}" class="${pg === id ? 'on' : ''}">${t}</a>`;
  const nav = login ? '' : adm
    ? L('PAGES/admin.html','Faturamento','resumo') + L('PAGES/admin-estoque.html','Estoque','estoque') + L('PAGES/admin-pedidos.html','Pedidos','pedidos') + L('index.html','Ver loja','') + '<a href="#" id="sair">Sair</a>'
    : L('index.html','Início','home') + L('PAGES/catalogo.html','Catálogo','catalogo') + L('PAGES/carrinho.html','Carrinho (<span id="qtdCar">0</span>)','carrinho');
  b.insertAdjacentHTML('afterbegin', `<header><div class="topo"><a class="logo" href="${R}index.html">VF<b>Plásticos</b><small>&amp; Utilidades do Lar${adm ? ' · Administração' : ''}</small></a><nav>${nav}</nav></div></header>`);
  if(!adm) b.insertAdjacentHTML('beforeend', `<footer>VFPlásticos &amp; Utilidades do Lar · Palmácia, CE · <a href="${R}PAGES/admin-login.html">Área do administrador</a></footer>`);
  const s = $('#sair'); if(s) s.onclick = e => { e.preventDefault(); sessionStorage.removeItem('vf_adm'); location.href = R + 'PAGES/admin-login.html'; };
  atualizarBadge();
})();
