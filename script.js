/* ==========================================================
   Verdana Energy - interactions (vanilla JS, no libraries)
   ========================================================== */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  revealEls.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty("--delay", `${el.dataset.delay}ms`);
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Animated counters ---------- */
  const formatNumber = (n) => n.toLocaleString("en-US");
  const animateCounter = (el) => {
    const target = Number(el.dataset.target);
    if (reduceMotion) { el.textContent = formatNumber(target); return; }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  $$(".counter").forEach((el) => counterObserver.observe(el));

  /* ---------- Header, progress bar, back-to-top, timeline ---------- */
  const header = $(".header");
  const progress = $(".scroll-progress");
  const toTop = $("#toTop");
  const timeline = $(".timeline");

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 20);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle("show", y > 700);

    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const visible = window.innerHeight * 0.6 - rect.top;
      const pct = Math.max(0, Math.min(1, visible / rect.height));
      timeline.style.setProperty("--line-progress", `${pct * 100}%`);
    }
  };
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".nav-links a[href^='#']:not(.btn)");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#navLinks");
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Hero word rotator ---------- */
  const rotator = $("#rotator");
  const words = ["sun", "wind", "future", "planet"];
  let wordIndex = 0;
  if (!reduceMotion) {
    setInterval(() => {
      rotator.classList.add("swap");
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        rotator.textContent = words[wordIndex];
        rotator.classList.remove("swap");
      }, 350);
    }, 2600);
  }

  /* ---------- Live kW ticker in hero card ---------- */
  const liveKw = $("#liveKw");
  setInterval(() => {
    const value = 5.8 + Math.random() * 1.4;
    liveKw.textContent = value.toFixed(1);
  }, 1800);

  /* ---------- Parallax blobs + hero scene ---------- */
  const heroVisual = $(".hero-visual");
  const blobs = $$(".blob");
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 18;
        b.style.translate = `${x * depth}px ${y * depth}px`;
      });
      if (heroVisual.classList.contains("visible")) {
        heroVisual.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      }
    });
  }

  /* ---------- 3D tilt + spotlight on cards ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        card.style.transform = `perspective(800px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Savings calculator ---------- */
  const bill = $("#bill");
  const sunHours = $("#sunHours");
  const tabs = $$(".tab");
  let factor = 0.75;

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const setFill = (input) => {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--fill", `${pct}%`);
  };
  const setText = (id, text) => {
    const el = $(id);
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove("bump");
    void el.offsetWidth; // restart animation
    el.classList.add("bump");
  };

  const updateCalc = () => {
    const monthly = Number(bill.value);
    const hours = Number(sunHours.value);
    // Coverage grows with sunshine; capped by system type.
    const coverage = Math.min(factor, factor * (0.55 + hours * 0.09));
    const yearly = monthly * 12 * coverage;
    const kwhYear = (monthly / 0.16) * 12 * coverage; // assume $0.16 per kWh
    const co2 = (kwhYear * 0.4) / 1000;               // ~0.4 kg CO2 per kWh
    const trees = Math.round((co2 * 1000) / 21);      // ~21 kg CO2 per tree per year

    $("#billOut").textContent = money(monthly);
    $("#sunOut").textContent = `${hours} h`;
    setText("#yearSave", money(yearly));
    setText("#lifeSave", money(yearly * 25 * 1.3)); // includes ~2.5% yearly price growth
    setText("#co2Save", `${co2.toFixed(1)} t`);
    setText("#trees", trees.toLocaleString("en-US"));
    $("#meterFill").style.width = `${Math.round(coverage * 100)}%`;
    $("#coverage").textContent = `${Math.round(coverage * 100)}%`;
    setFill(bill);
    setFill(sunHours);
  };

  [bill, sunHours].forEach((input) => input.addEventListener("input", updateCalc));
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      factor = Number(tab.dataset.factor);
      updateCalc();
    });
  });
  updateCalc();

  /* ---------- Project filter ---------- */
  const filters = $$(".filter");
  const projects = $$(".project");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      projects.forEach((p) => {
        const show = cat === "all" || p.dataset.cat === cat;
        p.classList.toggle("hide", !show);
        if (show) {
          p.classList.add("visible");
          p.classList.remove("pop");
          void p.offsetWidth;
          p.classList.add("pop");
        }
      });
    });
  });

  /* ---------- Testimonial slider ---------- */
  const slidesEl = $("#slides");
  const slideCount = slidesEl.children.length;
  const dotsEl = $("#dots");
  let current = 0;
  let autoplay;

  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsEl.appendChild(dot);
  }
  const goTo = (i) => {
    current = (i + slideCount) % slideCount;
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
    $$("button", dotsEl).forEach((d, idx) => d.classList.toggle("active", idx === current));
  };
  const restart = () => {
    clearInterval(autoplay);
    if (!reduceMotion) autoplay = setInterval(() => goTo(current + 1), 6000);
  };
  $("#prev").addEventListener("click", () => { goTo(current - 1); restart(); });
  $("#next").addEventListener("click", () => { goTo(current + 1); restart(); });

  // Swipe on touch devices
  let touchX = null;
  slidesEl.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slidesEl.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { goTo(current + (dx < 0 ? 1 : -1)); restart(); }
    touchX = null;
  });
  goTo(0);
  restart();

  /* ---------- FAQ accordion ---------- */
  $$(".acc-item").forEach((item) => {
    const head = $(".acc-head", item);
    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      $$(".acc-item.open").forEach((other) => {
        other.classList.remove("open");
        $(".acc-head", other).setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Quote form validation ---------- */
  const form = $("#quoteForm");
  const select = $("#interest");
  const success = $(".form-success", form);
  select.addEventListener("change", () => select.classList.toggle("filled", !!select.value));

  const validators = {
    name: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    interest: (v) => v !== "",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    Object.entries(validators).forEach(([name, check]) => {
      const field = form.elements[name];
      const wrap = field.closest(".field");
      const ok = check(field.value);
      wrap.classList.remove("invalid");
      if (!ok) {
        void wrap.offsetWidth;
        wrap.classList.add("invalid");
        valid = false;
      }
    });
    if (!valid) { success.textContent = ""; return; }

    const btn = $("button[type='submit']", form);
    btn.classList.add("loading");
    btn.textContent = "Sending";
    setTimeout(() => {
      btn.classList.remove("loading");
      btn.textContent = "Request my free audit";
      success.textContent = `Thanks, ${form.elements.name.value.trim().split(" ")[0]}! We'll be in touch within 48 hours. 🌱`;
      form.reset();
      select.classList.remove("filled");
    }, 1200);
  });
  $$("input, select", form).forEach((el) =>
    el.addEventListener("input", () => el.closest(".field").classList.remove("invalid"))
  );

  /* ---------- Newsletter ---------- */
  const newsletter = $("#newsletter");
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", newsletter);
    if (!validators.email(input.value)) { input.focus(); return; }
    input.value = "";
    input.placeholder = "Subscribed! 🌿";
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
