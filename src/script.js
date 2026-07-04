document.addEventListener('DOMContentLoaded', function() {

  
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  toggle.addEventListener('click', function() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    toggle.textContent = isDark ? '[ DARK ]' : '[ LIGHT ]';
  });

  
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  ham.addEventListener('click', function() {
    mob.classList.toggle('open');
    ham.classList.toggle('open');
    ham.setAttribute('aria-expanded', mob.classList.contains('open'));
  });

  
  document.querySelectorAll('.mobile-menu a').forEach(function(link) {
    link.addEventListener('click', function() {
      mob.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    });
  });

  
  const panels = document.querySelectorAll('.panel');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a, .nav-logo');
  const indicator = document.getElementById('navIndicator');

  function switchPanel(panelId) {
    
    panels.forEach(function(p) {
      p.classList.remove('active');
    });
    
    const target = document.getElementById('panel-' + panelId);
    if (target) {
      target.classList.add('active');
      
      target.scrollTop = 0;
    }

    
    navLinks.forEach(function(link) {
      const dataPanel = link.getAttribute('data-panel');
      link.classList.toggle('active', dataPanel === panelId);
    });

    
    const activeNavLink = document.querySelector('.nav-links a.active');
    if (activeNavLink && indicator) {
      const listRect = document.querySelector('.nav-links').getBoundingClientRect();
      const linkRect = activeNavLink.getBoundingClientRect();
      indicator.style.left = (linkRect.left - listRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.classList.add('active');
    } else if (indicator) {
      indicator.classList.remove('active');
    }
  }

  
  document.querySelectorAll('[data-panel]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      const panelId = this.getAttribute('data-panel');
      switchPanel(panelId);
      
      mob.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    });
  });

  
  switchPanel('home');

  
  const targetDate = new Date('2025-09-26T09:00:00').getTime();
  const cdEls = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };
  let lastSecs = null;

  function tickAnimate(el) {
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) {
      cdEls.days.textContent = '00';
      cdEls.hours.textContent = '00';
      cdEls.mins.textContent = '00';
      cdEls.secs.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    cdEls.days.textContent = String(d).padStart(2, '0');
    cdEls.hours.textContent = String(h).padStart(2, '0');
    cdEls.mins.textContent = String(m).padStart(2, '0');

    if (s !== lastSecs) {
      cdEls.secs.textContent = String(s).padStart(2, '0');
      tickAnimate(cdEls.secs);
      lastSecs = s;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  
  document.querySelectorAll('.day-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const parent = this.closest('.panel');
      parent.querySelectorAll('.day-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      const n = this.getAttribute('data-day');
      parent.querySelectorAll('.schedule-block').forEach(function(b) { b.classList.remove('active'); });
      const block = parent.querySelector('#day' + n);
      if (block) block.classList.add('active');
    });
  });

  
  document.querySelectorAll('.faq-list').forEach(function(list) {
    list.addEventListener('click', function(e) {
      const btn = e.target.closest('.faq-q');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      
      list.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  
  const navLinksDesktop = document.querySelectorAll('.nav-links a');
  navLinksDesktop.forEach(function(link) {
    link.addEventListener('mouseenter', function() {
      const listRect = document.querySelector('.nav-links').getBoundingClientRect();
      const linkRect = this.getBoundingClientRect();
      indicator.style.left = (linkRect.left - listRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.classList.add('active');
    });
  });

  document.querySelector('.nav-links').addEventListener('mouseleave', function() {
    const active = document.querySelector('.nav-links a.active');
    if (active) {
      const listRect = this.getBoundingClientRect();
      const linkRect = active.getBoundingClientRect();
      indicator.style.left = (linkRect.left - listRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });

  
  window.addEventListener('resize', function() {
    const active = document.querySelector('.nav-links a.active');
    if (active) {
      const listRect = document.querySelector('.nav-links').getBoundingClientRect();
      const linkRect = active.getBoundingClientRect();
      indicator.style.left = (linkRect.left - listRect.left) + 'px';
      indicator.style.width = linkRect.width + 'px';
      indicator.classList.add('active');
    }
  });

});