/* Dados, configuração e utilidades compartilhadas por todas as páginas */
const CFG = {WHATS:'5588999999999', SENHA:'vf1234', BAIXO:5}; // TROQUE o número e a senha
const $ = (s, r = document) => r.querySelector(s);
const brl = n => Number(n).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const esc = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dia = d => new Date(d).toLocaleDateString('sv');
const DB = {
  ler(k, p){ try{ return JSON.parse(localStorage.getItem(k)) ?? p; }catch(e){ return p; } },
  gravar(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ aviso('Não foi possível salvar os dados.'); } }
};
const SEMENTE = [
  {id:1,nome:'Balde plástico 12 L',cat:'Baldes e bacias',preco:14.9,estoque:30,emoji:'🪣'},
  {id:2,nome:'Bacia redonda 30 cm',cat:'Baldes e bacias',preco:11.5,estoque:25,emoji:'🥣'},
  {id:3,nome:'Pote hermético 1,5 L',cat:'Cozinha',preco:9.9,estoque:40,emoji:'🍱'},
  {id:4,nome:'Jarra com tampa 2 L',cat:'Cozinha',preco:17.9,estoque:4,emoji:'🫗'},
  {id:5,nome:'Cesto organizador',cat:'Organização',preco:19.9,estoque:18,emoji:'🧺'},
  {id:6,nome:'Caixa organizadora 20 L',cat:'Organização',preco:34.9,estoque:12,emoji:'📦'},
  {id:7,nome:'Vassoura de cerdas',cat:'Limpeza',preco:16.5,estoque:20,emoji:'🧹'},
  {id:8,nome:'Lixeira com pedal 10 L',cat:'Limpeza',preco:39.9,estoque:0,emoji:'🗑️'}
];
let produtos = DB.ler('vf_produtos', SEMENTE), pedidos = DB.ler('vf_pedidos', []), carrinho = DB.ler('vf_carrinho', {});
const salvar = () => { DB.gravar('vf_produtos', produtos); DB.gravar('vf_pedidos', pedidos); DB.gravar('vf_carrinho', carrinho); };
const achar = id => produtos.find(p => p.id === Number(id));
Object.keys(carrinho).forEach(id => { const p = achar(id); if(!p || p.estoque <= 0) delete carrinho[id]; else carrinho[id] = Math.min(carrinho[id], p.estoque); });
const atualizarBadge = () => { const e = $('#qtdCar'); if(e) e.textContent = Object.values(carrinho).reduce((a, b) => a + b, 0); };
function aviso(msg){
  let a = $('#aviso'); if(!a){ a = document.createElement('div'); a.id = 'aviso'; a.setAttribute('role','status'); document.body.appendChild(a); }
  a.textContent = msg; a.style.display = 'block'; clearTimeout(aviso.t); aviso.t = setTimeout(() => a.style.display = 'none', 2800);
}
function vendidos(){ const m = {}; pedidos.filter(o => o.status === 'Pago').forEach(o => o.itens.forEach(i => m[i.nome] = (m[i.nome] || 0) + i.qtd)); return Object.entries(m).sort((a, b) => b[1] - a[1]); }
