(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const darkMq = matchMedia("(prefers-color-scheme: dark)");
  const $ = (s, el = document) => el.querySelector(s);

  /* ---------- theme ---------- */
  const toggle = $("#theme");
  for (let i = 0; i < 8; i++) {
    const r = document.createElement("span");
    r.className = "ray";
    r.style.setProperty("--r", i * 45 + "deg");
    r.style.transform = `rotate(${i * 45}deg) translateY(-16px)`;
    toggle.append(r);
  }
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : darkMq.matches);
  const syncUi = () => {
    root.classList.toggle("dark-ui", isDark());
    toggle.setAttribute("aria-pressed", isDark());
  };
  syncUi();
  darkMq.addEventListener("change", syncUi);

  function switchTheme(x, y) {
    const next = isDark() ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncUi();
    };
    if (!document.startViewTransition || reduce) return apply();
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  }
  toggle.addEventListener("click", () => {
    const b = toggle.getBoundingClientRect();
    switchTheme(b.left + b.width / 2, b.top + b.height / 2);
  });
  addEventListener("keydown", (e) => {
    if ((e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea/i.test(e.target.tagName)) {
      switchTheme(innerWidth / 2, innerHeight / 2);
    }
  });

  /* ---------- pointer spotlight ---------- */
  if (!reduce) {
    let raf = 0;
    addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", e.clientX + "px");
        root.style.setProperty("--my", e.clientY + "px");
      });
    }, { passive: true });
  }

  /* ---------- hero name letters ---------- */
  let i = 0;
  document.querySelectorAll("#name .ln").forEach((ln) => {
    const txt = ln.textContent;
    ln.textContent = "";
    ln.setAttribute("aria-hidden", "true");
    for (const c of txt) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      s.style.setProperty("--i", i++);
      ln.append(s);
    }
  });

  /* ---------- rotating role with scramble ---------- */
  const roles = ["test software", "automate routine with AI", "support people in writing", "ship releases with a team"];
  const what = $("#what");
  const glyphs = "abcdefghijklmnopqrstuvwxyz<>/{}=+*";
  let ri = 0;
  function scrambleTo(target) {
    if (reduce) { what.textContent = target; return; }
    const from = what.textContent, len = Math.max(from.length, target.length);
    let frame = 0;
    const total = 22;
    const tick = () => {
      let out = "";
      for (let k = 0; k < len; k++) {
        const done = k < (frame / total) * len;
        out += done ? (target[k] || "") : (target[k] === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0]);
      }
      what.textContent = out;
      if (frame++ < total) requestAnimationFrame(tick); else what.textContent = target;
    };
    tick();
  }
  setInterval(() => { ri = (ri + 1) % roles.length; scrambleTo(roles[ri]); }, 2800);

  /* ---------- reveal + counters ---------- */
  const counted = new WeakSet();
  function count(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    const dur = reduce ? 0 : 1400, t0 = performance.now();
    const step = (t) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      const v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(count);
      if (en.target.classList.contains("term")) runTests();
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- stack explorer ---------- */
  const P = {
    rent: ["Rental operations system, Vienna", "2026 · 20+ apartments, rating 4.9"],
    crm: ["Logistics SaaS: dispatch CRM and iOS driver app", "2023 to 2026 · developer, QA, PM"],
    fin: ["Finance Telegram bot", "Personal project · webhook, Mini App, PDF reports"],
    asst: ["Personal assistant bot", "Personal project · mail, tasks, voice notes"],
    fuel: ["US fuel tax reporting, freelance", "2024 · unit tests and front-end"],
  };
  const D = [
    ["Testing", "qa", [
      ["Manual testing", ["crm", "rent"]], ["Regression testing", ["crm"]], ["Release testing", ["crm"]],
      ["iOS app testing", ["crm"]], ["TestFlight", ["crm"]], ["Test cases", ["crm"]], ["Bug reports", ["crm"]],
      ["Vitest", ["rent", "fin"]], ["Playwright", ["fin"]], ["Supertest", ["rent"]], ["mongodb-memory-server", ["fin"]],
      ["Unit tests", ["fuel", "rent", "fin"]], ["Postman", ["crm"]], ["Insomnia", ["crm"]],
    ]],
    ["AI automation", "ai", [
      ["Claude API", ["rent"]], ["Claude Code", ["rent", "fin", "asst"]], ["LLM workflows", ["rent"]], ["Groq", ["rent", "asst"]],
      ["OpenAI API", ["fin"]], ["Telegram bots", ["rent", "fin", "asst"]], ["grammY", ["rent", "asst"]], ["Telegraf", ["rent"]],
      ["Process automation", ["rent"]],
    ]],
    ["Support and coordination", "sup", [
      ["Chat and email support", ["rent"]], ["Ticket triage", ["crm"]], ["Escalation", ["rent", "crm"]], ["Knowledge base", ["rent"]],
      ["Hostaway", ["rent"]], ["Jira", ["crm"]], ["GitLab", ["crm"]], ["Notion", ["crm", "fin"]],
      ["Release coordination", ["crm"]], ["Requirements", ["crm"]],
    ]],
    ["Development", "dev", [
      ["TypeScript", ["crm", "rent", "fin", "asst"]], ["Angular", ["crm", "fin"]], ["NgRx", ["crm"]], ["Node.js", ["crm", "rent", "fin", "asst"]],
      ["Express", ["rent"]], ["Fastify", ["fin"]], ["REST APIs", ["crm", "fin"]], ["MongoDB", ["crm", "rent", "fin"]], ["Mongoose", ["rent", "fin"]],
      ["SQLite", ["rent"]], ["SQL (basic)", ["rent"]], ["Zod", ["rent"]], ["Puppeteer", ["asst"]], ["Google APIs", ["rent", "asst"]],
      ["Stripe", ["crm"]], ["Google Maps", ["crm"]], ["Firebase", ["crm"]], ["Sentry", ["crm"]], ["Railway", ["rent", "asst"]], ["Figma", ["crm"]],
    ]],
  ];
  const NAMES = { all: "Everything", qa: "QA", ai: "AI automation", sup: "Support", dev: "Development" };
  const COL = { qa: "var(--qa)", ai: "var(--ai)", sup: "var(--sup)", dev: "var(--dev)" };
  const fe = $("#filters"), ce = $("#cloud"), pe = $("#panel");
  const total = D.reduce((n, g) => n + g[2].length, 0);

  Object.entries(NAMES).forEach(([k, label], idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "f";
    b.dataset.k = k;
    b.setAttribute("aria-pressed", idx === 0);
    const n = k === "all" ? total : D.find((g) => g[1] === k)[2].length;
    b.innerHTML = (k === "all" ? "" : `<i style="background:${COL[k]}"></i>`) + label + `<span class="cnt">${n}</span>`;
    b.addEventListener("click", () => filter(k));
    fe.append(b);
  });

  D.forEach(([title, k, items]) => {
    const g = document.createElement("div");
    g.className = "group";
    g.innerHTML = `<h4>${title}</h4>`;
    const c = document.createElement("div");
    c.className = "chips";
    items.forEach(([name, uses]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "t";
      b.textContent = name;
      b.dataset.k = k;
      b.style.setProperty("--c", COL[k]);
      b.addEventListener("click", () => pick(b, name, k, uses));
      if (!reduce) magnet(b, 6);
      c.append(b);
    });
    g.append(c);
    ce.append(g);
  });

  function filter(k) {
    fe.querySelectorAll(".f").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === k));
    ce.querySelectorAll(".t").forEach((t, n) => {
      const match = k === "all" || t.dataset.k === k;
      t.classList.toggle("dim", !match);
      t.classList.toggle("on", k !== "all" && match);
      if (k !== "all" && match && !reduce) {
        t.classList.remove("pop");
        setTimeout(() => t.classList.add("pop"), n * 12);
      }
    });
  }
  function pick(b, name, k, uses) {
    ce.querySelectorAll(".sel").forEach((x) => x.classList.remove("sel"));
    b.classList.add("sel");
    ce.querySelectorAll(".t").forEach((t) => t.classList.remove("on", "dim"));
    fe.querySelectorAll(".f").forEach((f) => f.setAttribute("aria-pressed", f.dataset.k === "all"));
    pe.innerHTML =
      `<div class="k" style="color:${COL[k]}">// ${NAMES[k]}</div><h3>${name}</h3>` +
      uses.map((p, n) => `<div class="use" style="animation-delay:${n * 70}ms"><b>${P[p][0]}</b><span>${P[p][1]}</span></div>`).join("");
    if (innerWidth < 860) pe.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }

  function magnet(el, strength) {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }

  /* ---------- project cards: tilt + glow ---------- */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--px", x * 100 + "%");
      card.style.setProperty("--py", y * 100 + "%");
      if (!reduce && e.pointerType === "mouse") {
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ---------- timeline progress ---------- */
  const tl = $("#timeline"), fill = $("#timeline .fill");
  const onScroll = () => {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    fill.style.setProperty("--p", p * 100 + "%");
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- test runner ---------- */
  const T = [
    ["qa", "tests a web CRM and an iOS app: functional, regression, release"],
    ["qa", "writes test cases and clear bug reports"],
    ["qa", "checks APIs in Postman and Insomnia"],
    ["ai", "answers standard guest questions in 1 to 5 minutes"],
    ["ai", "keeps a person in the loop for anything unusual"],
    ["support", "holds a 4.9 client communication rating"],
    ["ops", "runs daily work for 20+ apartments"],
    ["team", "linked a client and a 7-person team as PM"],
    ["lang", "Ukrainian, Russian native · English B2"],
  ];
  const out = $("#out");
  let running = false;
  function runTests() {
    if (running) return;
    running = true;
    out.innerHTML = "";
    const add = (html, delay) => setTimeout(() => {
      const d = document.createElement("div");
      d.className = "line";
      d.innerHTML = html;
      out.append(d);
      requestAnimationFrame(() => d.classList.add("show"));
    }, reduce ? 0 : delay);
    add(`<span class="run-badge">RUN</span> <span class="dt">v1.0 ~/mark</span>`, 0);
    add("&nbsp;", 120);
    T.forEach(([g, t], n) => add(`<span class="ok">✓</span> <span class="dt">mark ›</span> ${g} <span class="dt">›</span> ${t} <span class="dt">${(Math.random() * 9 + 1) | 0}ms</span>`, 300 + n * 220));
    const end = 300 + T.length * 220 + 200;
    add("&nbsp;", end);
    add(`<span class="pass-badge">PASS</span> Tests <span class="ok">${T.length} passed</span> <span class="dt">(${T.length})</span>`, end + 120);
    add(`<span class="dt">Ready for a remote role.</span>`, end + 300);
    setTimeout(() => { running = false; }, reduce ? 0 : end + 320);
  }
  $("#run").addEventListener("click", runTests);

  /* ---------- copy email ---------- */
  const toast = $("#toast");
  let tt;
  $("#copy").addEventListener("click", async (e) => {
    const email = e.currentTarget.dataset.email;
    let ok = false;
    try { await navigator.clipboard.writeText(email); ok = true; } catch (err) {}
    if (!ok) { location.href = "mailto:" + email; return; }
    toast.textContent = "Email copied";
    toast.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => toast.classList.remove("show"), 1800);
  });
})();
