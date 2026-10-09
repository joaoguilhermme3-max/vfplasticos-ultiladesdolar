/* Vitrine: início, catálogo e carrinho */
const pg = document.body.dataset.pagina, R = document.body.dataset.raiz || '';
let cat = 'Todos', q = '';
const src = u => /^(https?:|\/)/.test(u) ? u : R + u;
const vazio = '<p class="vazio">Nenhum produto encontrado.</p>';
function card(p){
  const no = carrinho[p.id] || 0, fim = p.estoque <= 0, max = no >= p.estoque;
  return `<article class="card"><div class="img" aria-hidden="true">${p.img ? `<img src="${esc(src(p.img))}" alt="">` : esc(p.emoji || '🛍️')}</div>
  <div class="corpo"><span class="cat">${esc(p.cat)}</span><h3>${esc(p.nome)}</h3><span class="preco">${brl(p.preco)}</span>
  ${fim ? '<span class="aviso zero">Esgotado</span>' : p.estoque <= CFG.BAIXO ? `<span class="aviso">Restam só ${p.estoque}</span>` : ''}
  <button class="btn" data-add="${p.id}" ${fim || max ? 'disabled' : ''}>${fim ? 'Indisponível' : max ? 'Máximo no carrinho' : 'Adicionar ao carrinho'}</button></div></article>`;
}
function rHome(){
  const v = Object.fromEntries(vendidos());
  const l = produtos.filter(p => p.estoque > 0).sort((a, b) => (v[b.nome] || 0) - (v[a.nome] || 0)).slice(0, 4);
  $('#grade').innerHTML = l.length ? l.map(card).join('') : vazio;
}
function rCat(){
  $('#chips').innerHTML = ['Todos', ...new Set(produtos.map(p => p.cat))].map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  const l = produtos.filter(p => (cat === 'Todos' || p.cat === cat) && p.nome.toLowerCase().includes(q));
  $('#grade').innerHTML = l.length ? l.map(card).join('') : vazio;
}
function rCar(){
  const ids = Object.keys(carrinho); let t = 0;
  $('#itens').innerHTML = ids.length ? ids.map(id => {
    const p = achar(id), n = carrinho[id]; t += p.preco * n;
    return `<div class="item"><span>${esc(p.emoji || '🛍️')}</span><div class="nome">${esc(p.nome)}<br><small>${brl(p.preco)}</small></div>
    <div class="qtd"><button data-menos="${id}" aria-label="Diminuir">−</button><b>${n}</b><button data-mais="${id}" aria-label="Aumentar" ${n >= p.estoque ? 'disabled' : ''}>+</button></div></div>`;
  }).join('') : `<p class="vazio">Seu carrinho está vazio. <a href="${R}PAGES/catalogo.html">Ver o catálogo</a></p>`;
  $('#total').textContent = brl(t); $('#btnFinalizar').disabled = !ids.length;
}
const refresh = () => { atualizarBadge(); ({home:rHome, catalogo:rCat, carrinho:rCar})[pg]?.(); };
function finalizar(){
  const nome = $('#cNome').value.trim(), tel = $('#cTel').value.replace(/\D/g, ''), ent = $('#cEntrega').value, end = $('#cEnd').value.trim();
  if(!nome) return aviso('Informe seu nome.');
  if(tel.length < 10) return aviso('Informe um WhatsApp com DDD.');
  if(ent === 'Entrega' && !end) return aviso('Informe o endereço de entrega.');
  const itens = Object.entries(carrinho).map(([id, n]) => ({...achar(id), qtd:n}));
  const sem = itens.find(i => i.qtd > i.estoque); if(sem) return aviso(`Estoque insuficiente para "${sem.nome}".`);
  const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const o = {id:Date.now(), data:new Date().toISOString(), cliente:nome, tel, entrega:ent, endereco:end, total, status:'Pendente',
    itens:itens.map(i => ({id:i.id, nome:i.nome, preco:i.preco, qtd:i.qtd}))};
  itens.forEach(i => achar(i.id).estoque -= i.qtd);
  pedidos.push(o); carrinho = {}; salvar();
  const msg = `Olá! Sou ${nome}. Pedido #${String(o.id).slice(-6)}:\n` + itens.map(i => `• ${i.qtd}x ${i.nome} — ${brl(i.preco * i.qtd)}`).join('\n') +
    `\n\nTotal: ${brl(total)}\nRecebimento: ${ent}${end ? ' — ' + end : ''}`;
  window.open(`https://wa.me/${CFG.WHATS}?text=${encodeURIComponent(msg)}`, '_blank');
  refresh(); aviso('Pedido registrado! Continue a conversa no WhatsApp.');
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if(!t) return; const d = t.dataset;
  if(d.cat){ cat = d.cat; refresh(); }
  else if(d.add){ const p = achar(d.add); if((carrinho[p.id] || 0) < p.estoque){ carrinho[p.id] = (carrinho[p.id] || 0) + 1; salvar(); aviso(`${p.nome} no carrinho`); refresh(); } }
  else if(d.mais){ if(carrinho[d.mais] < achar(d.mais).estoque) carrinho[d.mais]++; salvar(); refresh(); }
  else if(d.menos){ if(--carrinho[d.menos] <= 0) delete carrinho[d.menos]; salvar(); refresh(); }
});
if($('#busca')) $('#busca').oninput = e => { q = e.target.value.toLowerCase(); rCat(); };
if($('#btnFinalizar')){
  $('#btnFinalizar').onclick = finalizar;
  $('#cEntrega').onchange = e => $('#cEnd').classList.toggle('oculto', e.target.value !== 'Entrega');
}
refresh();
