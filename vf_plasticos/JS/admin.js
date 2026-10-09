/* Área do administrador: login, faturamento, estoque e pedidos */
const pg = document.body.dataset.pagina, A = $('#app');
let filtro = 'Todos';
const somaPago = f => pedidos.filter(o => o.status === 'Pago' && f(o)).reduce((s, o) => s + o.total, 0);

function resumo(){
  const hoje = dia(new Date()), mes = hoje.slice(0, 7), s7 = new Date(); s7.setDate(s7.getDate() - 6); const lim = dia(s7);
  const pend = pedidos.filter(o => o.status === 'Pendente');
  const dias = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = dia(d); return {rot:k.slice(8) + '/' + k.slice(5, 7), v:somaPago(o => dia(o.data) === k)}; });
  const max = Math.max(...dias.map(d => d.v), 1), baixos = produtos.filter(p => p.estoque <= CFG.BAIXO), rank = vendidos().slice(0, 5);
  A.innerHTML = `<h1>Faturamento</h1><div class="metricas" style="margin-top:1rem">
    <div class="met dest"><span>Hoje</span><strong>${brl(somaPago(o => dia(o.data) === hoje))}</strong></div>
    <div class="met"><span>Últimos 7 dias</span><strong>${brl(somaPago(o => dia(o.data) >= lim))}</strong></div>
    <div class="met"><span>Este mês</span><strong>${brl(somaPago(o => dia(o.data).startsWith(mes)))}</strong></div>
    <div class="met"><span>Total geral</span><strong>${brl(somaPago(() => true))}</strong></div>
    <div class="met"><span>Pedidos pendentes</span><strong>${pend.length} (${brl(pend.reduce((s, o) => s + o.total, 0))})</strong></div>
    <div class="met"><span>Valor em estoque</span><strong>${brl(produtos.reduce((s, p) => s + p.preco * p.estoque, 0))}</strong></div></div>
  <div class="painel"><h3>Últimos 7 dias (pedidos pagos)</h3><div class="barras">${dias.map(d => `<div><small>${d.v ? brl(d.v) : ''}</small><i style="height:${Math.round(d.v / max * 100)}%"></i><span>${d.rot}</span></div>`).join('')}</div></div>
  <div class="painel"><h3>Mais vendidos</h3>${rank.length ? '<ol>' + rank.map(([n, q]) => `<li>${esc(n)}: <b>${q}</b> un.</li>`).join('') + '</ol>' : '<p>Ainda não há vendas pagas.</p>'}</div>
  <div class="painel"><h3>Estoque baixo</h3>${baixos.length ? '<ul>' + baixos.map(p => `<li>${esc(p.nome)}: <b>${p.estoque}</b> un.</li>`).join('') + '</ul>' : '<p>Nenhum produto com estoque baixo.</p>'}</div>`;
}
function estoque(){
  A.innerHTML = `<h1>Estoque</h1><div class="painel" style="margin-top:1rem"><h3>Cadastrar produto</h3><div class="form">
    <label>Nome<input id="nNome"></label><label>Categoria<input id="nCat" list="cats"></label>
    <datalist id="cats">${[...new Set(produtos.map(p => p.cat))].map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <label>Preço (R$)<input id="nPreco" type="number" step="0.01" min="0"></label><label>Estoque<input id="nEstoque" type="number" min="0"></label>
    <label>Emoji<input id="nEmoji" maxlength="4" placeholder="🛍️"></label><label>Imagem (opcional)<input id="nImg" placeholder="IMG/produto.jpg"></label>
    <button class="btn-or" data-act="novo">Cadastrar</button></div></div>
  <div class="painel tabela"><table><thead><tr><th>Produto</th><th>Preço (R$)</th><th>Estoque</th><th>Ajustar</th><th></th></tr></thead><tbody>
  ${produtos.map(p => `<tr class="${p.estoque <= CFG.BAIXO ? 'baixo' : ''}"><td>${esc(p.emoji || '')} ${esc(p.nome)}<br><small>${esc(p.cat)}</small></td>
    <td><input type="number" step="0.01" min="0" value="${p.preco}" data-preco="${p.id}" aria-label="Preço de ${esc(p.nome)}"></td>
    <td><input type="number" min="0" value="${p.estoque}" data-est="${p.id}" aria-label="Estoque de ${esc(p.nome)}"></td>
    <td><button class="btn-ghost" data-aj="${p.id}:-1">−1</button> <button class="btn-ghost" data-aj="${p.id}:1">+1</button> <button class="btn-ghost" data-aj="${p.id}:10">+10</button></td>
    <td><button class="perigo" data-del="${p.id}">Excluir</button></td></tr>`).join('')}</tbody></table></div>`;
}
function listaPedidos(){
  const l = [...pedidos].reverse().filter(o => filtro === 'Todos' || o.status === filtro);
  A.innerHTML = `<h1>Pedidos</h1><div class="abas" style="margin-top:1rem"><select id="filtro" class="st" style="width:auto" aria-label="Filtrar por situação">${['Todos','Pendente','Pago','Cancelado'].map(s => `<option ${s === filtro ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <button class="btn-ghost" data-act="csv">Exportar CSV</button></div>` +
  (l.length ? l.map(o => `<div class="pedido"><header><span>#${String(o.id).slice(-6)} · ${esc(o.cliente)}</span><span>${brl(o.total)}</span></header>
    <small>${new Date(o.data).toLocaleString('pt-BR')} · WhatsApp ${esc(o.tel)} · ${esc(o.entrega || 'Retirar na loja')}${o.endereco ? ': ' + esc(o.endereco) : ''}</small>
    <div>${o.itens.map(i => `${i.qtd}x ${esc(i.nome)}`).join(' · ')}</div>
    <label>Situação: <select class="st" style="width:auto" data-status="${o.id}">${['Pendente','Pago','Cancelado'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>`).join('') : '<p class="vazio">Nenhum pedido encontrado.</p>');
}
function mudarStatus(id, novo){
  const o = pedidos.find(x => x.id === Number(id)); if(!o || o.status === novo) return;
  if(o.status === 'Cancelado'){
    if(o.itens.some(i => (achar(i.id)?.estoque ?? 0) < i.qtd)){ aviso('Estoque insuficiente para reativar este pedido.'); return render(); }
    o.itens.forEach(i => achar(i.id).estoque -= i.qtd);
  } else if(novo === 'Cancelado') o.itens.forEach(i => { const p = achar(i.id); if(p) p.estoque += i.qtd; });
  o.status = novo; salvar(); render();
}
function csv(){
  const l = [['Pedido','Data','Cliente','WhatsApp','Recebimento','Itens','Total','Situação']];
  pedidos.forEach(o => l.push([o.id, new Date(o.data).toLocaleString('pt-BR'), o.cliente, o.tel, (o.entrega || '') + (o.endereco ? ' - ' + o.endereco : ''), o.itens.map(i => i.qtd + 'x ' + i.nome).join(' | '), o.total.toFixed(2).replace('.', ','), o.status]));
  const txt = '\ufeff' + l.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type:'text/csv'})); a.download = 'pedidos-vfplasticos.csv'; a.click();
}
const render = () => ({resumo, estoque, pedidos:listaPedidos})[pg]?.();

if(pg === 'login'){
  $('#fLogin').onsubmit = e => { e.preventDefault(); if($('#senha').value === CFG.SENHA){ sessionStorage.setItem('vf_adm', '1'); location.href = 'admin.html'; } else aviso('Senha incorreta.'); };
} else {
  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if(!t) return; const d = t.dataset;
    if(d.act === 'novo'){
      const nome = $('#nNome').value.trim(), cat = $('#nCat').value.trim(), preco = parseFloat($('#nPreco').value), est = parseInt($('#nEstoque').value, 10);
      if(!nome || !cat || isNaN(preco) || isNaN(est)) return aviso('Preencha nome, categoria, preço e estoque.');
      produtos.push({id:Date.now(), nome, cat, preco, estoque:est, emoji:$('#nEmoji').value.trim() || '🛍️', img:$('#nImg').value.trim()});
      salvar(); render(); aviso('Produto cadastrado.');
    }
    else if(d.act === 'csv') csv();
    else if(d.aj){ const [id, n] = d.aj.split(':'); const p = achar(id); p.estoque = Math.max(0, p.estoque + Number(n)); salvar(); render(); }
    else if(d.del && confirm('Excluir este produto?')){ produtos = produtos.filter(p => p.id !== Number(d.del)); delete carrinho[d.del]; salvar(); render(); }
  });
  document.addEventListener('change', e => {
    const t = e.target, d = t.dataset;
    if(d.preco){ const v = parseFloat(t.value); if(v >= 0){ achar(d.preco).preco = v; salvar(); aviso('Preço atualizado.'); } }
    else if(d.est){ const v = parseInt(t.value, 10); if(v >= 0){ achar(d.est).estoque = v; salvar(); aviso('Estoque atualizado.'); } }
    else if(d.status) mudarStatus(d.status, t.value);
    else if(t.id === 'filtro'){ filtro = t.value; render(); }
  });
  render();
}
