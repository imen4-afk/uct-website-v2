document.addEventListener('DOMContentLoaded', function() {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hidePreloader = function() {
      preloader.classList.add('loaded');
      setTimeout(function() { if (preloader.parentNode) preloader.remove(); }, 700);
    };
    if (reducedMotion) {
      setTimeout(hidePreloader, 200);
    } else {
      window.addEventListener('load', function() { setTimeout(hidePreloader, 650); });
      setTimeout(hidePreloader, 2200); 
    }
  }

 
  const toggle = document.getElementById('themeToggle');
  const knob = document.getElementById('themeKnob');
  const html = document.documentElement;

  function syncKnob() {
    
  }
  syncKnob();

  toggle.addEventListener('click', function() {
    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const oldBg = getComputedStyle(html).getPropertyValue('--bg').trim();

    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    syncKnob();

    if (reducedMotion) return;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const overlay = document.createElement('div');
    overlay.className = 'theme-wipe';
    overlay.style.background = oldBg;
    overlay.style.clipPath = 'circle(' + maxRadius + 'px at ' + x + 'px ' + y + 'px)';
    document.body.appendChild(overlay);

    requestAnimationFrame(function() {
      overlay.style.transition = 'clip-path .65s cubic-bezier(.65,0,.2,1)';
      overlay.style.clipPath = 'circle(0px at ' + x + 'px ' + y + 'px)';
    });
    overlay.addEventListener('transitionend', function() { overlay.remove(); });
    setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 900);
  });

 
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  const overlay = document.getElementById('sheetOverlay');

  function openSheet() {
    mob.classList.add('open');
    overlay.classList.add('open');
    ham.classList.add('open');
    ham.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet() {
    mob.classList.remove('open');
    overlay.classList.remove('open');
    ham.classList.remove('open');
    ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  ham.addEventListener('click', function() {
    if (mob.classList.contains('open')) closeSheet(); else openSheet();
  });
  overlay.addEventListener('click', closeSheet);
  document.querySelectorAll('.mobile-menu a').forEach(function(link) {
    link.addEventListener('click', closeSheet);
  });

 
  const nav = document.getElementById('navbar');
  const navLinksDesktop = document.querySelectorAll('.nav-links a');
  const indicator = document.getElementById('navIndicator');
  const sections = document.querySelectorAll('main > section[id]');

  function moveIndicatorTo(link) {
    if (!link || !indicator) return;
    const listRect = document.querySelector('.nav-links').getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    indicator.style.left = (linkRect.left - listRect.left) + 'px';
    indicator.style.width = linkRect.width + 'px';
    indicator.classList.add('active');
  }

  function setActiveLink(id) {
    let matched = null;
    navLinksDesktop.forEach(function(link) {
      const isMatch = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isMatch);
      if (isMatch) matched = link;
    });
    if (matched) {
      moveIndicatorTo(matched);
    } else if (indicator) {
      indicator.classList.remove('active');
    }
  }

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(function(entries) {
      let best = null;
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) setActiveLink(best.target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, .1, .25, .5, .75, 1] });

    sections.forEach(function(s) { spy.observe(s); });
  }

  navLinksDesktop.forEach(function(link) {
    link.addEventListener('mouseenter', function() { moveIndicatorTo(this); });
  });
  document.querySelector('.nav-links').addEventListener('mouseleave', function() {
    const active = document.querySelector('.nav-links a.active');
    if (active) moveIndicatorTo(active); else if (indicator) indicator.classList.remove('active');
  });
  window.addEventListener('resize', function() {
    const active = document.querySelector('.nav-links a.active');
    if (active) moveIndicatorTo(active);
  });

 
  const progressBar = document.getElementById('scrollProgressBar');
  const backToTop = document.getElementById('backToTop');
  const navShell = document.querySelector('.nav-shell');
  const heroContent = document.querySelector('.hero-content');
  let lastScrollY = window.scrollY || 0;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('scrolled', y > 12);

    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    if (progressBar) progressBar.style.width = Math.min(100, (y / max) * 100) + '%';

    if (backToTop) backToTop.classList.toggle('visible', y > window.innerHeight * .6);

    lastScrollY = y;

    if (heroContent && !reducedMotion) {
      const progress = Math.min(1, y / (window.innerHeight * .7));
      heroContent.style.opacity = String(1 - progress);
      heroContent.style.transform = 'translateY(' + (progress * 34).toFixed(1) + 'px)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

 
  const revealTargets = document.querySelectorAll('.reveal, h2.section-title, .divider');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        const el = entry.target;
        if (entry.isIntersecting) {
          const delay = el.getAttribute('data-reveal-delay');
          if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
          el.classList.add('is-visible');
        } else {
          el.classList.remove('is-visible');
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function(el) { revealer.observe(el); });

    document.querySelectorAll('.ctf-grid, .speakers-grid, .ambassadors-grid, .features-grid, .partners-grid').forEach(function(grid) {
      Array.from(grid.children).forEach(function(card, i) {
        card.style.setProperty('--reveal-delay', Math.min(i * 70, 350) + 'ms');
      });
    });
    document.querySelectorAll('.training-timeline').forEach(function(tl) {
      Array.from(tl.children).forEach(function(item, i) {
        item.style.setProperty('--reveal-delay', Math.min(i * 55, 400) + 'ms');
      });
    });
  } else {
    revealTargets.forEach(function(el) { el.classList.add('is-visible'); });
  }

 
  const dayTabs = document.getElementById('dayTabs');
  const dayThumb = document.getElementById('dayTabsThumb');

  function moveThumbTo(tab) {
    if (!dayThumb || !tab) return;
    const n = tab.getAttribute('data-day');
    dayThumb.style.transform = n === '2' ? 'translateX(100%)' : 'translateX(0)';
  }

  document.querySelectorAll('.day-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const parent = this.closest('.page-section');
      parent.querySelectorAll('.day-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      moveThumbTo(this);
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

 
  const targetDate = new Date('2025-09-26T09:00:00').getTime();
  const cdEls = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };
  let lastVals = { days: null, hours: null, mins: null, secs: null };

  function tickAnimate(el) {
    if (reducedMotion) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function setField(el, key, val) {
    const str = String(val).padStart(2, '0');
    if (lastVals[key] !== str) {
      el.textContent = str;
      tickAnimate(el);
      lastVals[key] = str;
    }
  }

  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff <= 0) {
      setField(cdEls.days, 'days', 0);
      setField(cdEls.hours, 'hours', 0);
      setField(cdEls.mins, 'mins', 0);
      setField(cdEls.secs, 'secs', 0);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    setField(cdEls.days, 'days', d);
    setField(cdEls.hours, 'hours', h);
    setField(cdEls.mins, 'mins', m);
    setField(cdEls.secs, 'secs', s);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

 
  document.querySelectorAll('.about-visual .terminal-line').forEach(function(line, i) {
    line.style.setProperty('--line-delay', Math.min(i * 70, 700) + 'ms');
  });

 
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function() { toast.classList.remove('show'); }, 2400);
  }

 
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      const email = link.getAttribute('href').replace('mailto:', '').split('?')[0];
      if (navigator.clipboard && email) {
        navigator.clipboard.writeText(email).then(function() {
          showToast('Copied ' + email);
        }).catch(function() {});
      }
    });
  });

 
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let gx = 0, gy = 0, cx = 0, cy = 0, active = false;

    window.addEventListener('mousemove', function(e) {
      gx = e.clientX; gy = e.clientY;
      if (!active) { active = true; glow.style.opacity = '1'; }
    });
    document.addEventListener('mouseleave', function() { glow.style.opacity = '0'; active = false; });

    (function loop() {
      cx += (gx - cx) * .12;
      cy += (gy - cy) * .12;
      glow.style.transform = 'translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

 
  function addTilt(el, maxTilt) {
    if (!el || !finePointer || reducedMotion) return;
    el.addEventListener('mousemove', function(e) {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = 'transform .12s ease-out';
      el.style.transform = 'perspective(700px) rotateX(' + (-py * maxTilt).toFixed(2) + 'deg) rotateY(' + (px * maxTilt).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('mouseleave', function() {
      el.style.transition = 'transform .6s var(--spring-soft)';
      el.style.transform = '';
    });
  }
  document.querySelectorAll('.feature-card').forEach(function(el) { addTilt(el, 7); });
  addTilt(document.querySelector('.about-visual'), 3.5);

 
  function addMagnetic(el, strength, max) {
    if (!el || !finePointer || reducedMotion) return;
    el.addEventListener('mousemove', function(e) {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      const cx = Math.max(-max, Math.min(max, dx));
      const cy = Math.max(-max, Math.min(max, dy));
      el.style.transition = 'transform .12s ease-out';
      el.style.transform = 'translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px)';
    });
    el.addEventListener('mouseleave', function() {
      el.style.transition = 'transform .55s var(--spring)';
      el.style.transform = '';
    });
  }
  document.querySelectorAll('.btn-primary, .btn-outline, .social-btn').forEach(function(el) { addMagnetic(el, .3, 8); });
  addMagnetic(backToTop, .35, 10);

 
  const heroWrapper = document.querySelector('.hero-wrapper');
  const parallaxEls = document.querySelectorAll('.hero-wrapper [data-parallax]');
  if (heroWrapper && parallaxEls.length && finePointer && !reducedMotion) {
    heroWrapper.addEventListener('mousemove', function(e) {
      const rect = heroWrapper.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxEls.forEach(function(el) {
        const depth = parseFloat(el.getAttribute('data-parallax')) || 10;
        el.style.setProperty('--px', (nx * depth).toFixed(2));
        el.style.setProperty('--py', (ny * depth).toFixed(2));
      });
    });
    heroWrapper.addEventListener('mouseleave', function() {
      parallaxEls.forEach(function(el) {
        el.style.setProperty('--px', 0);
        el.style.setProperty('--py', 0);
      });
    });
  }

 
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length) {
    const animateCount = function(el) {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (reducedMotion) { el.textContent = target; return; }
      const duration = 1100;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const statObs = new IntersectionObserver(function(entries, obs) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: .6 });
      statNums.forEach(function(el) { statObs.observe(el); });
    } else {
      statNums.forEach(animateCount);
    }
  }

 
  const sideNav = document.getElementById('sideNav');
  if (sideNav) {
    const sideButtons = sideNav.querySelectorAll('button');
    sideButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      });
    });
    if ('IntersectionObserver' in window) {
      const allTracked = document.querySelectorAll('main > section[id], .hero-wrapper[id]');
      const sideSpy = new IntersectionObserver(function(entries) {
        let best = null;
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
          }
        });
        if (best) {
          sideButtons.forEach(function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-target') === best.target.id);
          });
        }
      }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, .1, .25, .5, .75, 1] });
      allTracked.forEach(function(s) { sideSpy.observe(s); });
    }
  }

 
  const timeline = document.getElementById('trainingTimeline');
  const timelineFill = document.getElementById('timelineFill');
  if (timeline && timelineFill) {
    function updateTimelineFill() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      let progressed = (vh * .75) - rect.top;
      progressed = Math.max(0, Math.min(total, progressed));
      timelineFill.style.height = progressed + 'px';
    }
    window.addEventListener('scroll', updateTimelineFill, { passive: true });
    window.addEventListener('resize', updateTimelineFill);
    updateTimelineFill();
  }

});