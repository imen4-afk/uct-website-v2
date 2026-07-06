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

 
  const targetDate = new Date('2026-09-26T12:00:00').getTime();
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


  const chatWidget = document.getElementById('chatWidget');
  if (chatWidget) {
    const chatFab = document.getElementById('chatFab');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    function openChat() {
      chatWidget.classList.add('chat-open');
      chatFab.setAttribute('aria-expanded', 'true');
      chatWindow.setAttribute('aria-hidden', 'false');
      setTimeout(function() { chatInput && chatInput.focus(); }, 320);
    }
    function closeChat() {
      chatWidget.classList.remove('chat-open');
      chatFab.setAttribute('aria-expanded', 'false');
      chatWindow.setAttribute('aria-hidden', 'true');
    }

    chatFab.addEventListener('click', function() {
      chatWidget.classList.contains('chat-open') ? closeChat() : openChat();
    });
    chatClose.addEventListener('click', closeChat);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && chatWidget.classList.contains('chat-open')) closeChat();
    });
    document.addEventListener('click', function(e) {
      if (chatWidget.classList.contains('chat-open') && !chatWidget.contains(e.target)) closeChat();
    });

    function addMessage(text, who) {
      const row = document.createElement('div');
      row.className = 'chat-msg chat-msg-' + who;
      const p = document.createElement('p');
      p.textContent = text;
      row.appendChild(p);
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return row;
    }

    function showTyping() {
      const row = document.createElement('div');
      row.className = 'chat-msg chat-msg-bot chat-msg-typing';
      row.innerHTML = '<p><i></i><i></i><i></i></p>';
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return row;
    }

    /*
     * getAssistantReply() is a placeholder brain for Touhemi. It answers
     * from a knowledge base mirroring this site's own content, entirely
     * client-side, WITHOUT calling any external API from the browser.
     *
     * Do NOT put a real API key in this file (or anywhere under src/): this
     * is a static site with no server, so anything here ships to every
     * visitor's browser and is trivially readable via view-source, and it
     * would also sit in the public git history forever once committed.
     *
     * To wire up a real AI backend later: stand up a small serverless
     * function (Cloudflare Worker / Vercel / Netlify function, etc.) that
     * holds the API key (and, if you want live web lookups, a search API
     * key) server-side. Have this function fetch() that endpoint with the
     * user's message plus the SYSTEM_ROLE prompt below, and return its
     * reply here instead of matching against KNOWLEDGE. A real model can
     * absolutely fold search results into a natural answer without
     * narrating "I searched for X" — that's just normal prompt design, not
     * something this mock can fake, since it has no search capability at
     * all client-side (no backend, and browsers can't cross-origin-fetch
     * arbitrary sites anyway).
     */
    var SYSTEM_ROLE =
      "You are Touhemi, the official assistant for UCT 2.0 (Unmasking Cyber Threats), " +
      "a cybersecurity congress organized by the IEEE Computer Science Chapter at ISIMA " +
      "(Mahdia, Tunisia). You only discuss: this event (program, CTF, training, venue, " +
      "speakers, partners, ambassadors, registration), the organizing team (IEEE CS Chapter " +
      "ISIMA), and Tunisia's IEEE / cybersecurity scene. Politely decline anything else and " +
      "redirect back to those topics.";

    var KNOWLEDGE = [
      {
        test: /\b(hi|hello|hey|salut|yo)\b/,
        reply: "Hey! I'm Touhemi 🐧 — ask me anything about UCT 2.0: the program, the CTF, workshops, the venue, or how to get involved."
      },
      {
        test: /who am i|my name/,
        reply: "Ha, that one's on you — I only keep track of UCT 2.0! Speaking of which, want to know about the program, the CTF, or how to get involved?"
      },
      {
        test: /who (are|r) you|what are you|your (role|name|job)|about (you|yourself)/,
        reply: SYSTEM_ROLE.replace('You are', "I'm") + " Think of me as your guide to the event."
      },
      {
        test: /what is uct|what('?s| is) (this|the) event|tell me about uct|uct 2\.?0/,
        topic: 'about',
        reply: "UCT — Unmasking Cyber Threats — is a national cybersecurity congress organized by the IEEE Computer Science Chapter at ISIMA. Now in its 2nd edition, it runs 26–27 September 2026 in Mahdia, Tunisia: two days of technical talks, an overnight CTF, a Technical Challenge, and a round table, built for students and industry experts to learn and network."
      },
      {
        test: /\b(ieee|isima)\b.*(who|what|organiz|behind|chapter)|who organi[sz]es|organiz(er|ing team)/,
        topic: 'organizer',
        reply: "UCT 2.0 is organized by the IEEE Computer Science Chapter at ISIMA (Institut Supérieur d'Informatique de Mahdia). It's a student-run branch of IEEE Computer Society, active in Tunisia's cybersecurity and tech community."
      },
      {
        test: /\b(when|date)\b/,
        topic: 'about',
        reply: "UCT 2.0 runs 26–27 September 2026 in Mahdia, Tunisia. The countdown at the top of the page is ticking down to opening day."
      },
      {
        test: /where|venue|mahdia|location|address/,
        topic: 'venue',
        reply: "UCT 2.0 takes place in Mahdia — a coastal city on Tunisia's central-eastern coast known for its historic medina. The exact venue will be shared with registered participants; check the Venue section for the map."
      },
      {
        test: /day ?1|first day/,
        topic: 'program',
        reply: "Day 1: Check In (12:00) → Opening Ceremony (13:30) → Conference (15:00) → Workshops (17:00) → Dinner (19:00) → Party (20:00) → overnight CTF start + karaoke (22:00) → Movie (23:00)."
      },
      {
        test: /day ?2|second day|closing/,
        topic: 'program',
        reply: "Day 2: End of CTF & breakfast (09:00) → Tour of Mahdia / Murder Game (09:30, pick one) → Lunch (12:00) → Technical Challenge pitching (13:00) → Break (15:00) → Closing Ceremony (15:30)."
      },
      {
        test: /program|schedule|agenda/,
        topic: 'program',
        reply: "UCT 2.0 runs two packed days — technical talks, workshops, an overnight CTF, a party, a Mahdia tour, and the Technical Challenge pitch, closing with the awards ceremony. See the Program section for the full Day 1 / Day 2 breakdown."
      },
      {
        test: /web exploitation|\bsqli\b|\bxss\b/,
        topic: 'ctf',
        reply: "Web Exploitation is one of the CTF categories: SQLi, XSS, SSRF, auth bypasses and more — jeopardy-style flags scored live all night. Beginner-friendly."
      },
      {
        test: /reverse engineering|\brev\b|disassembl/,
        topic: 'ctf',
        reply: "Reverse Engineering is a CTF category where you disassemble binaries and crack obfuscated code to find hidden flags. Bring a disassembler!"
      },
      {
        test: /crypto(graphy)?|cipher/,
        topic: 'ctf',
        reply: "Cryptography is a CTF category — from classic ciphers to broken RSA. Math is your lockpick."
      },
      {
        test: /osint|open.source intelligence/,
        topic: 'ctf',
        reply: "OSINT is a CTF category about open-source intelligence gathering — public records, metadata, social traces. Nothing stays hidden."
      },
      {
        test: /forensics|memory dump|packet capture/,
        topic: 'ctf',
        reply: "Forensics is a CTF category — memory dumps, packet captures, steganography, and file carving."
      },
      {
        test: /technical challenge|\bt\.?c\b|pitch/,
        topic: 'ctf',
        reply: "The Technical Challenge is a separate track: teams solve a real-world scenario, then pitch and defend it live in front of a jury on Day 2."
      },
      {
        test: /ctf|capture the flag|\bflag\b/,
        topic: 'ctf',
        reply: "The CTF is an overnight Capture The Flag running in parallel with the Technical Challenge, across Web Exploitation, Reverse Engineering, Cryptography, OSINT, and Forensics — skewed beginner-friendly, and the pre-event workshops help you prepare. Hover a category in the CTF section to see its format."
      },
      {
        test: /training|workshop/,
        topic: 'training',
        reply: "Ahead of UCT, there's a free 14-part workshop series on Cybersecurity Basics & CTF Methodology running July–September, open to all Tunisian university students — from \"Introduction to Cybersecurity\" (July 25) to \"Scripting for CTFs\" (September 8). See the Training section for the full list and dates."
      },
      {
        test: /speaker|guest/,
        topic: 'speakers',
        reply: "The speaker and guest lineup for UCT 2.0 is being finalized — check the Speakers section for updates as they're announced."
      },
      {
        test: /partner|sponsor/,
        topic: 'partners',
        reply: "The partner lineup is being finalized too. If you or your company want to support UCT 2.0, reach out at ieee.cs.isima@gmail.com."
      },
      {
        test: /ambassador/,
        topic: 'ambassador',
        reply: "UCT ambassadors represent the congress at their university and help drive registrations. Applications are open now, until July 13 — there's a link in the Ambassadors section (\"Become an ambassador before July 13\")."
      },
      {
        test: /regist(er|ration)|sign ?up|ticket/,
        topic: 'registration',
        reply: "Registration isn't open yet — follow @ieee.uct and this site will announce it the moment it goes live."
      },
      {
        test: /how (do|can|to) i (apply|join|participate|get involved|enroll)|how to apply|how to join/,
        reply: function() {
          if (lastTopic === 'ambassador') {
            return "Ambassador applications are open now, until July 13 — there's a form linked in the Ambassadors section (\"Become an ambassador before July 13\"). Don't wait too long!";
          }
          if (lastTopic === 'training') {
            return "The workshops are free and open to all Tunisian university students — no application needed, just show up. Follow @ieee.uct so you don't miss a date.";
          }
          if (lastTopic === 'ctf' || lastTopic === 'registration') {
            return "General registration for UCT 2.0 (CTF included) isn't open yet — follow @ieee.uct and this site will announce it here first.";
          }
          return "Depends what you're after: general event registration isn't open yet (follow @ieee.uct for the announcement), but ambassador applications ARE open now until July 13. Which one did you mean?";
        }
      },
      {
        test: /team|solo|alone/,
        topic: 'ctf',
        reply: "Teams of 2–4 are recommended for the CTF, but you can register solo and the organizers will help you find teammates."
      },
      {
        test: /beginner|difficulty|skill level|experience/,
        topic: 'ctf',
        reply: "Yes, UCT's CTF is designed to be beginner-friendly, with difficulty ramping up per category — plus the pre-event training program helps you get ready."
      },
      {
        test: /contact|email|reach|social|instagram|facebook|linkedin/,
        topic: 'contact',
        reply: "You can reach the organizing team at ieee.cs.isima@gmail.com or @ieee.uct on Instagram — see the Contact section for everything."
      },
      {
        test: /thank/,
        reply: "Anytime! Good luck, and see you at UCT 2.0 in Mahdia. 🐧"
      }
    ];

    // A light guard so replies stay scoped to the event / IEEE / Tunisia / organizers,
    // as the assistant is meant to (rather than answering arbitrary questions).
    var OFF_TOPIC_HINTS = /\b(weather|joke|recipe|homework|write (me )?(a |some )?code|movie recommend|football|stock|crypto ?currency price|bitcoin price|translate|poem|song lyrics)\b/;

    var FALLBACK_REPLIES = [
      "I don't have an answer for that one, but I know UCT inside out — try the program, the CTF, workshops, the venue, or how to get involved.",
      "Not sure about that — happy to help with anything UCT-related though: schedule, CTF categories, training, ambassadors, or registration.",
      "That one's outside what I've got. Ask me about the event itself — program, CTF, venue, speakers, partners, or the organizing team."
    ];
    var lastTopic = null;
    var fallbackIndex = 0;

    function getAssistantReply(message) {
      var q = message.toLowerCase();
      for (var i = 0; i < KNOWLEDGE.length; i++) {
        if (KNOWLEDGE[i].test.test(q)) {
          if (KNOWLEDGE[i].topic) lastTopic = KNOWLEDGE[i].topic;
          var reply = KNOWLEDGE[i].reply;
          return typeof reply === 'function' ? reply() : reply;
        }
      }
      if (OFF_TOPIC_HINTS.test(q)) {
        return "That's outside what I can help with — I only talk about UCT 2.0, IEEE CS ISIMA, and Tunisia's cybersecurity scene. Ask me about the program, the CTF, workshops, the venue, or the organizing team!";
      }
      var msg = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length];
      fallbackIndex++;
      return msg;
    }

    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      chatInput.value = '';
      const typingRow = showTyping();
      setTimeout(function() {
        typingRow.remove();
        addMessage(getAssistantReply(text), 'bot');
      }, 550 + Math.random() * 500);
    });
  }

});