(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* WhatsApp: lê js/config.js e atualiza todos os links [data-wa] */
  function waLink() {
    var s = window.SITE || {};
    return 'https://wa.me/' + (s.whatsapp || '') + '?text=' + encodeURIComponent(s.mensagemInicial || '');
  }
  function setWA(scope) {
    $$('[data-wa]', scope).forEach(function (a) {
      a.href = waLink(); a.target = '_blank'; a.rel = 'noopener noreferrer';
    });
    $$('[data-wa-text]', scope).forEach(function (n) { n.textContent = (window.SITE || {}).whatsappExibicao || ''; });
  }
  setWA(d);

  /* Cabeçalho */
  var hd = $('.hd');
  function onScroll() { hd.classList.toggle('solid', window.scrollY > 12 || d.body.classList.contains('lock')); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  var burger = $('.burger'), drawer = $('.drawer');
  function menu(open) {
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    drawer.classList.toggle('open', open); d.body.classList.toggle('lock', open);
    drawer.toggleAttribute('inert', !open); onScroll();
  }
  if (burger) {
    drawer.setAttribute('inert', '');
    burger.addEventListener('click', function () { menu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
    window.matchMedia('(min-width:960px)').addEventListener('change', function (e) { if (e.matches) menu(false); });
  }

  /* Revelações */
  var rv = $$('.rv, .rv-clip');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (n) { io.observe(n); });
  } else { rv.forEach(function (n) { n.classList.add('in'); }); }

  /* WhatsApp flutuante: pulso ocasional */
  var fl = $('.wa-float');
  if (fl && !reduce) {
    setInterval(function () {
      fl.classList.add('pulse'); setTimeout(function () { fl.classList.remove('pulse'); }, 3800);
    }, 11000);
  }


  /* Carrossel em leque (home) */
  var flow = $('[data-flow]');
  if (flow) {
    var fc = $$('.fcard', flow), n = fc.length, act = 0, cnt = $('[data-count]');
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    function layout() {
      fc.forEach(function (c, i) {
        var o = ((i - act + n + 3) % n) - 3, ao = Math.abs(o);
        c.style.setProperty('--o', o); c.style.setProperty('--ao', ao);
        c.style.zIndex = 10 - ao;
        c.toggleAttribute('data-c', o === 0); c.toggleAttribute('data-hide', ao > 2);
        c.tabIndex = o === 0 ? 0 : -1; c.setAttribute('aria-hidden', ao > 2 ? 'true' : 'false');
      });
      cnt.textContent = pad(act + 1) + ' / ' + pad(n);
    }
    function go(d) { act = (act + d + n) % n; layout(); }
    layout();
    $('[data-prev]').addEventListener('click', function () { go(-1); });
    $('[data-next]').addEventListener('click', function () { go(1); });
    fc.forEach(function (c, i) {
      c.addEventListener('click', function (e) { if (!c.hasAttribute('data-c')) { e.preventDefault(); act = i; layout(); } });
    });
    flow.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); });
    var sx = null, moved = false;
    flow.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    flow.addEventListener('pointerup', function (e) {
      if (sx === null) return; var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 45) { moved = true; go(dx < 0 ? 1 : -1); }
    });
    flow.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    if ('IntersectionObserver' in window && !reduce) {
      var fo = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { flow.classList.add('in'); fo.disconnect(); } }); }, { threshold: .35 });
      fo.observe(flow);
    } else { flow.classList.add('in'); }
  }

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* Deck de tratamentos */
  var deck = $('[data-deck]');
  if (deck) {
    var cards = $$('.card', deck), panel = $('.panel-inner', deck), hint = $('.deck-hint', deck);
    var stage = $('.stage', deck), lastType = 'mouse', current = null, wasStack = false;
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)');
    function setHint() { if (hint) hint.textContent = fine.matches ? 'Passe o mouse sobre as cartas e clique em uma delas.' : 'Toque nas cartas para abri-las e escolha uma.'; }
    setHint(); fine.addEventListener('change', setHint);
    function state(s) { deck.dataset.state = s; }
    function reset() {
      state('stack');
      cards.forEach(function (c) { c.classList.remove('is-open'); });
      if (current) { current.querySelector('.card-face').setAttribute('aria-expanded', 'false'); }
      current = null;
    }
    function open(card) {
      current = card; card.classList.add('is-open');
      var body = $('.card-body', card);
      panel.innerHTML = '<h3 id="deck-title"></h3>';
      $('#deck-title', panel).textContent = $('h3', body).textContent;
      $$('p', body).forEach(function (p) { panel.appendChild(p.cloneNode(true)); });
      var row = d.createElement('div'); row.className = 'btn-row';
      row.innerHTML = $('.btn', body).outerHTML + '<button type="button" class="close">Voltar aos tratamentos</button>';
      panel.appendChild(row); setWA(panel);
      $('.close', panel).addEventListener('click', function () { var c = current; state('fan'); cards.forEach(function (x) { x.classList.remove('is-open'); }); current = null; c.querySelector('.card-face').focus(); });
      card.querySelector('.card-face').setAttribute('aria-expanded', 'true');
      state('open');
    }
    reset();
    stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && deck.dataset.state === 'stack') state('fan'); });
    deck.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') reset(); });
    stage.addEventListener('pointerdown', function (e) { lastType = e.pointerType; wasStack = deck.dataset.state === 'stack'; }, true);
    cards.forEach(function (card) {
      var face = $('.card-face', card);
      face.setAttribute('aria-expanded', 'false');
      face.addEventListener('click', function () {
        if (wasStack && lastType !== 'mouse') { wasStack = false; state('fan'); return; }
        open(card);
      });
      face.addEventListener('focus', function () { if (deck.dataset.state === 'stack') state('fan'); });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && deck.dataset.state !== 'stack') { reset(); } });
    d.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !deck.contains(e.target)) reset(); });
  }
})();
