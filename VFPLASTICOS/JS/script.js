/* ==========================================================
   VFPlásticos & Utilidades do Lar — script.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Ano automático no rodapé ---------- */
  const anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const aberto = nav.classList.toggle('aberto');
      navToggle.classList.toggle('ativo', aberto);
      navToggle.setAttribute('aria-expanded', aberto);
    });

    // Fecha o menu ao clicar em um link (mobile)
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('aberto');
        navToggle.classList.remove('ativo');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Animação de revelação ao rolar a página ---------- */
  const elementosReveal = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && elementosReveal.length) {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('ativo');
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elementosReveal.forEach((el) => observer.observe(el));
  } else {
    // Fallback: sem suporte a IntersectionObserver, mostra tudo direto
    elementosReveal.forEach((el) => el.classList.add('ativo'));
  }

  /* ---------- Botão voltar ao topo ---------- */
  const voltarTopo = document.getElementById('voltarTopo');
  const btnTopo = document.getElementById('btnTopo');

  if (voltarTopo && btnTopo) {
    window.addEventListener('scroll', () => {
      voltarTopo.classList.toggle('visivel', window.scrollY > 500);
    });

    btnTopo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Header muda de aparência ao rolar (opcional) ---------- */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(13, 44, 84, 0.08)'
        : 'none';
    });
  }

});