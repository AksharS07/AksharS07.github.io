// Module 1 - Canvas Particle Network
(function particleNetwork() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  // Disable expensive particle network on mobile/touch devices for performance
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || window.innerWidth <= 768) return;

  const ctx = canvas.getContext("2d");
  const nodes = [];
  const nodeCount = 80;
  const mouse = { x: -9999, y: -9999 };
  const ripples = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i += 1) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15
      });
    }
  }

  function updateAndDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = performance.now() * 0.00025;

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];

      const mdx = node.x - mouse.x;
      const mdy = node.y - mouse.y;
      const mouseDist = Math.hypot(mdx, mdy);

      if (mouseDist < 150) {
        node.vx += (node.x - mouse.x) * 0.00012;
        node.vy += (node.y - mouse.y) * 0.00012;
      }

      // Keep background alive with a very slow flow field.
      node.vx += Math.cos(time + i * 0.35) * 0.003;
      node.vy += Math.sin(time + i * 0.31) * 0.003;

      node.vx *= 0.995;
      node.vy *= 0.995;

      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
      if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

      node.x = Math.max(0, Math.min(canvas.width, node.x));
      node.y = Math.max(0, Math.min(canvas.height, node.y));
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          ctx.strokeStyle = `rgba(79,142,247,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(79,142,247,0.5)";
    for (let i = 0; i < nodes.length; i += 1) {
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw mouse glow halo
    if (mouse.x > 0 && mouse.x < canvas.width) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
      g.addColorStop(0, "rgba(79,142,247,0.07)");
      g.addColorStop(1, "rgba(79,142,247,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw and decay ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rpl = ripples[i];
      rpl.r += 4;
      rpl.alpha -= 0.013;
      if (rpl.alpha <= 0 || rpl.r > rpl.maxR) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(79,142,247,${rpl.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rpl.x, rpl.y, rpl.r, 0, Math.PI * 2);
      ctx.stroke();
      // Inner trailing ring (accent2 color)
      if (rpl.r > 22) {
        ctx.strokeStyle = `rgba(129,140,248,${rpl.alpha * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(rpl.x, rpl.y, rpl.r - 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(updateAndDraw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener("click", (e) => {
    // Spawn ripple
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 190, alpha: 0.55 });
    // Shockwave: push particles outward
    nodes.forEach((node) => {
      const dx = node.x - e.clientX;
      const dy = node.y - e.clientY;
      const dist = Math.hypot(dx, dy);
      if (dist < 230 && dist > 0) {
        const force = (1 - dist / 230) * 2.8;
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }
    });
  });

  resize();
  initNodes();
  updateAndDraw();
})();

// Module 2 - Custom Cursor
(function customCursor() {
  const cursor = document.getElementById("cursor");
  const trail = document.getElementById("trail");
  if (!cursor || !trail) return;

  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    document.body.classList.add("no-custom-cursor");
    return;
  }

  cursor.style.display = "block";
  trail.style.display = "block";

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let trailX = mouseX;
  let trailY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });

  const nameElement = document.querySelector(".name");
  document.querySelectorAll(".char-wrap").forEach((wrap) => {
    wrap.addEventListener("mouseenter", () => {
      wrap.classList.add("hovered");
      nameElement?.classList.add("hover-active");
    });
    wrap.addEventListener("mouseleave", () => {
      wrap.classList.remove("hovered");
      nameElement?.classList.remove("hover-active");
    });
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;
    trail.style.transform = `translate(${trailX}px, ${trailY}px)`;
    requestAnimationFrame(animateTrail);
  }

  animateTrail();
})();

window.addEventListener("DOMContentLoaded", () => {
  // Module 6 - Floating Orbs
  (function createOrbs() {
    const orbsContainer = document.querySelector(".orbs");
    if (!orbsContainer) return;

    for (let i = 0; i < 5; i += 1) {
      const orb = document.createElement("div");
      orb.className = "orb";

      const size = Math.floor(Math.random() * 301) + 200;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const opacity = (Math.random() * (0.07 - 0.03) + 0.03).toFixed(3);
      const duration = (Math.random() * (22 - 12) + 12).toFixed(2);
      const delay = (Math.random() * 8).toFixed(2);
      const useAccent = i % 2 === 0;

      orb.style.width = `${size}px`;
      orb.style.height = `${size}px`;
      orb.style.top = `${top}%`;
      orb.style.left = `${left}%`;
      orb.style.opacity = opacity;
      orb.style.animationDuration = `${duration}s`;
      orb.style.animationDelay = `${delay}s`;
      orb.style.background = useAccent
        ? "radial-gradient(circle, rgba(79,142,247,0.5), transparent)"
        : "radial-gradient(circle, rgba(129,140,248,0.5), transparent)";

      orbsContainer.appendChild(orb);
    }
  })();

  if (typeof gsap === "undefined") return;

  // Module 3 - Lenis Smooth Scroll
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  // Module 5 - ScrollTrigger setup
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Module 4 - Hero reveal
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  gsap.set(["#bg-canvas", ".orbs"], { opacity: 0 });
  gsap.set(".intro", { opacity: 0, y: 20 });
  gsap.set(".hero .char", { y: "110%", opacity: 0 });
  gsap.set(".hero .word", { y: "110%", opacity: 0 });

  tl.to(["#bg-canvas", ".orbs"], { opacity: 1, duration: 1 })
    .to(".intro", { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }, "-=0.6")
    .to(".hero .char", {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.035,
      ease: "power4.out",
      delay: 0.5
    })
    .to(".hero .word", {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.06,
      ease: "power4.out",
      delay: 0.1
    });

  // Scroll progress bar
  const progressBar = document.getElementById("scroll-progress-bar");
  let progressTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (progressTicking) return;
      progressTicking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = `${progress}%`;
        progressTicking = false;
      });
    },
    { passive: true }
  );

  // Active nav link observer
  const links = [...document.querySelectorAll(".nav-links a")];
  const sectionMap = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  // Improve top-nav transitions with Lenis-powered section scroll.
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, {
          offset: -70,
          duration: 1.15
        });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-30% 0px -50% 0px" }
  );

  sectionMap.forEach((section) => observer.observe(section));

  // Magnetic hover effect for interactive elements.
  document.querySelectorAll(".magnetic, .nav-links a").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const strength = 0.2;
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    element.addEventListener("mouseleave", () => {
      element.style.transform = "";
    });
  });

  // Hero micro interaction with cursor proximity.
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  if (hero && heroContent) {
    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      heroContent.style.transform = `translate(${px * 10}px, ${py * 8}px)`;
    });

    hero.addEventListener("mouseleave", () => {
      heroContent.style.transform = "";
    });
  }

  // Module 5 - Scroll reveal animations
  if (typeof ScrollTrigger !== "undefined") {
    gsap.utils.toArray(".section-label").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        }
      );
    });

    gsap.utils.toArray(".section-title").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" }
        }
      );
    });

    gsap.utils.toArray(".about-text").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%" }
        }
      );
    });

    gsap.utils.toArray(".skills-grid").forEach((grid) => {
      const pills = grid.querySelectorAll(".skill-pill");
      gsap.fromTo(
        pills,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: "power3.out",
          scrollTrigger: { trigger: grid, start: "top 82%" }
        }
      );
    });

    gsap.utils.toArray(".projects-grid").forEach((grid) => {
      const cards = grid.querySelectorAll(".project-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: grid, start: "top 82%" }
        }
      );
    });

    // Modern scroll motion: subtle 3D drift on cards.
    gsap.utils.toArray(".project-card").forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 24, rotateX: 4, rotateY: index % 2 ? -2 : 2 },
        {
          y: -16,
          rotateX: -3,
          rotateY: index % 2 ? 2 : -2,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1
          }
        }
      );
    });

    gsap.utils.toArray(".contact-links").forEach((group) => {
      const linksInGroup = group.querySelectorAll(".contact-link");
      gsap.fromTo(
        linksInGroup,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 85%" }
        }
      );
    });

    // Extra depth: subtle parallax on section titles
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.fromTo(
        title,
        { y: 30, opacity: 0.65 },
        {
          y: -20,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: title.closest("section"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });

    // Section containers float lightly while scrolling.
    gsap.utils.toArray(".about-section, .skills-section, .projects-section, .contact-section").forEach((section) => {
      gsap.fromTo(
        section,
        { y: 28 },
        {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8
          }
        }
      );
    });

    // Lightweight modern scroll mood without expensive blur filters.
    gsap.utils.toArray(".about-section, .skills-section, .projects-section, .contact-section").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0.78, y: 20, scale: 0.992 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 92%",
            end: "top 35%",
            scrub: 0.9
          }
        }
      );
    });
  }
});

// ── Module 7 – GitHub Repos ────────────────────────────────────────────────
(function githubRepos() {
  const GITHUB_USER = "AksharS07";
  const CONFIG_KEY = "portfolio_repos_config";
  const IS_LOCAL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

  // ── Featured project metadata ─────────────────────────────────────────────
  // Add an entry here to render a richer featured card instead of a plain repo card.
  const FEATURED_PROJECTS = {
    "dynamic-island-browser": {
      displayName: "Dynamic Island for Web",
      subtitle: "Chrome Extension & Vivaldi Mod",
      role: "Lead Architect & QA",
      shortDesc:
        "A beautifully animated, Apple-style Dynamic Island that lives natively in your browser. " +
        "It syncs with media tabs, extracts album colors, displays live time-synced lyrics, " +
        "and adds global Picture-in-Picture controls.",
      tech: ["Vanilla JavaScript", "CSS", "Chrome Extension API", "Browser Modding", "LRCLib API", "Apple Music API"],
      storeUrl: null,   // set to the Edge Add-ons URL once Microsoft approves the submission
      features: [
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
          name: "Live Time-Synced Lyrics",
          desc: "Integrates with LRCLib to display beautifully animated, time-synced lyrics in their original language. Click any lyric to instantly seek the background track to that exact timestamp."
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
          name: "High-Res Artwork & Vibrant Theming",
          desc: "Cross-references tracks with the Apple Music API to pull crisp artwork, then uses a custom color-extraction algorithm to theme the Island's glow and UI elements in real time."
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
          name: "Browser Architecture Hacking",
          desc: "Engineered a 'Teleportation Hack' to bypass Chromium's strict security protocols, enabling global Picture-in-Picture controls seamlessly across background tabs in Vivaldi."
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
          name: "AI Pair-Programming",
          desc: "Built entirely via Agentic AI pair-programming. Defined the product architecture, navigated undocumented browser APIs, and performed rigorous QA to catch edge-case Chromium bugs the AI missed."
        }
      ]
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Fetch repos.json — the source of truth for all visitors. */
  async function fetchReposJson() {
    try {
      const res = await fetch("repos.json?v=" + Date.now());
      if (!res.ok) return null;
      const list = await res.json();
      return Array.isArray(list) ? list : null;
    } catch (_) {
      return null;
    }
  }

  /** Convert a flat name array into the internal {name:{enabled}} map. */
  function listToCfg(list) {
    const cfg = {};
    list.forEach((name) => { cfg[name] = { enabled: true }; });
    return cfg;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveConfig(cfg) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } catch (_) {}
  }

  /** Fetch a single repo; returns null on failure. */
  async function fetchRepo(name) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${name}`);
      if (!res.ok) return null;
      return res.json();
    } catch (_) {
      return null;
    }
  }

  /** Fetch languages for a single repo; returns [] on failure. */
  async function fetchLanguages(name) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${name}/languages`);
      if (!res.ok) return [];
      const obj = await res.json();
      return Object.keys(obj);
    } catch (_) {
      return [];
    }
  }

  /** Fetch all public repos for the user (up to 100, sorted by updated). */
  async function fetchAllPublicRepos() {
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) return [];
      return res.json();
    } catch (_) {
      return [];
    }
  }

  // ── Card rendering ────────────────────────────────────────────────────────

  function buildRepoCard(repo, langs) {
    const name = repo.name;
    const desc = repo.description || "No description provided.";
    const url  = repo.html_url;

    const langPills = langs
      .slice(0, 4)
      .map((l) => `<span class="lang-pill">${l}</span>`)
      .join("");

    return `
      <article class="repo-card" aria-label="${name}">
        <div class="repo-card-front">
          <div class="repo-card-tag">// repo</div>
          <div class="repo-card-top">
            <span class="repo-card-name">${name}</span>
            <a class="repo-card-link" href="${url}" target="_blank" rel="noopener noreferrer"
               aria-label="Open ${name} on GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
        <!-- Hover overlay -->
        <div class="repo-card-overlay" aria-hidden="true">
          <p class="repo-overlay-desc">${desc}</p>
          ${langs.length ? `<div class="repo-overlay-langs">${langPills}</div>` : ""}
          <div class="repo-overlay-actions">
            <a class="repo-overlay-btn" href="${url}" target="_blank" rel="noopener noreferrer">
              View on GitHub →
            </a>
          </div>
        </div>
      </article>`;
  }

  function buildNextCard() {
    return `
      <article class="repo-card next-card" aria-label="Next project — coming soon">
        <div class="repo-card-tag">// next</div>

        <div class="next-card-inner">
          <div class="next-card-left">
            <div class="next-glitch-wrap">
              <span class="next-glitch-name" data-text="???">???</span>
            </div>
          </div>
          <div class="next-card-right">
            <div class="next-redacted" aria-hidden="true">
              <span class="next-redact-bar" style="width:100%"></span>
              <span class="next-redact-bar" style="width:62%"></span>
              <span class="next-redact-bar" style="width:80%"></span>
            </div>
            <div class="next-progress-track" aria-hidden="true">
              <div class="next-progress-fill"></div>
            </div>
            <div class="next-status-line">
              building<span class="next-blink">_</span>
            </div>
          </div>
        </div>

        <div class="next-hover-hint" aria-hidden="true">Something is cooking...</div>
      </article>`;
  }

  function buildFeaturedCard(repo, langs, meta) {
    const url = repo.html_url;

    const techPills = meta.tech
      .map((t) => `<span class="featured-tech-pill">${t}</span>`)
      .join("");

    const featureItems = meta.features
      .map((f) => `
        <div class="featured-feature">
          <div class="featured-feature-icon">${f.icon}</div>
          <div class="featured-feature-body">
            <div class="featured-feature-name">${f.name}</div>
            <div class="featured-feature-desc">${f.desc}</div>
          </div>
        </div>`)
      .join("");

    const storeBtn = meta.storeUrl
      ? `<a class="featured-link-btn secondary" href="${meta.storeUrl}" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Edge Add-ons
        </a>`
      : `<span class="featured-link-btn featured-link-wip" title="Microsoft Edge Add-ons submission currently in review">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Edge Add-ons <span class="featured-wip-badge">In Review</span>
        </span>`;

    return `
      <article class="featured-card" aria-label="${meta.displayName} — featured project">
        <div class="featured-card-inner">

          <div class="featured-card-left">
            <div class="featured-badge">
              <span class="featured-badge-dot"></span>
              Featured Project
            </div>
            <h3 class="featured-title">${meta.displayName}</h3>
            <div class="featured-subtitle">${meta.subtitle}</div>
            <div class="featured-role">// ${meta.role}</div>
            <p class="featured-desc">${meta.shortDesc}</p>
            <div class="featured-tech">${techPills}</div>
            <div class="featured-links">
              <a class="featured-link-btn primary" href="${url}" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </a>
              ${storeBtn}
            </div>
          </div>

          <div class="featured-card-right">
            <div class="featured-features-label">// Key Features</div>
            <div class="featured-features">
              ${featureItems}
            </div>
          </div>

        </div>
      </article>`;
  }

  function buildSkeletons(count) {
    return Array.from({ length: count }, () => `<div class="repo-skeleton"></div>`).join("");
  }

  // ── Animate new cards (called after injection) ────────────────────────────

  function animateNewCards(cards) {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          delay: index * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" }
        }
      );

      gsap.fromTo(
        card,
        { y: 20, rotateX: 3 },
        {
          y: -14,
          rotateX: -2,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1
          }
        }
      );
    });
  }

  // ── Render grid ───────────────────────────────────────────────────────────

  async function renderGrid(cfg) {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const enabledNames = Object.keys(cfg).filter((k) => cfg[k].enabled);

    if (enabledNames.length === 0) {
      grid.innerHTML = `
        <p style="font-family:var(--mono);font-size:0.8rem;color:var(--fg-muted);letter-spacing:0.05em;padding:2rem 0;">
          No repos selected &mdash; click &ldquo;Manage Repos&rdquo; to choose some.
        </p>`;
      return;
    }

    // Show skeletons while loading.
    grid.innerHTML = buildSkeletons(enabledNames.length);

    // Fetch all repos in parallel.
    const results = await Promise.all(
      enabledNames.map(async (name) => {
        const [repo, langs] = await Promise.all([fetchRepo(name), fetchLanguages(name)]);
        return { name, repo, langs };
      })
    );

    // Featured cards (rich layout) render first; regular repo cards follow.
    const featuredHtml = results
      .filter((r) => r.repo !== null && FEATURED_PROJECTS[r.name])
      .map((r) => buildFeaturedCard(r.repo, r.langs, FEATURED_PROJECTS[r.name]))
      .join("");

    const regularHtml = results
      .filter((r) => r.repo !== null && !FEATURED_PROJECTS[r.name])
      .map((r) => buildRepoCard(r.repo, r.langs))
      .join("");

    grid.innerHTML = featuredHtml + regularHtml + buildNextCard();

    // Bind hover cursor class to new cards.
    const cursor = document.getElementById("cursor");
    grid.querySelectorAll(".repo-card:not(.next-card) a, .repo-card:not(.next-card) button, .featured-card a").forEach((el) => {
      if (!cursor) return;
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });

    // Double-click any real repo card to open GitHub in a new tab.
    grid.querySelectorAll(".repo-card:not(.next-card)").forEach((card) => {
      const url = card.querySelector(".repo-card-link")?.href;
      if (!url) return;
      card.addEventListener("dblclick", () => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });

    // Animate featured and regular cards together.
    const newCards = [...grid.querySelectorAll(".repo-card, .featured-card")];
    animateNewCards(newCards);
  }

  // ── Selector panel ────────────────────────────────────────────────────────

  function buildSelectorPanel(allRepos, cfg) {
    // Remove old panel if it exists.
    document.getElementById("repo-selector-panel")?.remove();
    document.getElementById("repo-selector-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "selector-overlay";
    overlay.id = "repo-selector-overlay";

    const panel = document.createElement("div");
    panel.className = "selector-panel";
    panel.id = "repo-selector-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Repository selector");

    const listHtml = allRepos
      .map((repo) => {
        const isChecked = cfg[repo.name]?.enabled ?? false;
        const checkedClass = isChecked ? "checked" : "";
        const desc = repo.description
          ? repo.description.slice(0, 60) + (repo.description.length > 60 ? "…" : "")
          : "";
        return `
          <div class="selector-item ${checkedClass}" data-repo="${repo.name}" role="checkbox" aria-checked="${isChecked}" tabindex="0">
            <div class="selector-checkbox">
              <span class="selector-checkbox-tick">✓</span>
            </div>
            <div class="selector-item-info">
              <div class="selector-item-name">${repo.name}</div>
              ${desc ? `<div class="selector-item-desc">${desc}</div>` : ""}
            </div>
          </div>`;
      })
      .join("");

    panel.innerHTML = `
      <div class="selector-panel-header">
        <span class="selector-panel-title">// Manage Repos</span>
        <button class="selector-panel-close" aria-label="Close" id="selector-panel-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <p class="selector-panel-subtitle">
        Check the repositories you want displayed in the Projects section.
        Your selection is saved locally.
      </p>
      <div class="selector-list" id="selector-list">
        ${listHtml}
      </div>
      <div class="selector-panel-footer">
        <button class="selector-btn selector-btn-cancel" id="selector-btn-cancel">Cancel</button>
        <button class="selector-btn selector-btn-apply" id="selector-btn-apply">Apply</button>
      </div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Checkbox toggle logic.
    panel.querySelectorAll(".selector-item").forEach((item) => {
      function toggle() {
        item.classList.toggle("checked");
        item.setAttribute("aria-checked", item.classList.contains("checked").toString());
      }
      item.addEventListener("click", toggle);
      item.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); }
      });
    });

    function closePanel() {
      panel.classList.remove("open");
      overlay.classList.remove("open");
      document.getElementById("selector-toggle")?.classList.remove("open");
    }

    document.getElementById("selector-panel-close").addEventListener("click", closePanel);
    document.getElementById("selector-btn-cancel").addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    document.getElementById("selector-btn-apply").addEventListener("click", async () => {
      // Build new config from checked state.
      const newCfg = {};
      panel.querySelectorAll(".selector-item").forEach((item) => {
        newCfg[item.dataset.repo] = { enabled: item.classList.contains("checked") };
      });
      saveConfig(newCfg);
      closePanel();
      await renderGrid(newCfg);

      // Dev toast: show what to put in repos.json to make this permanent.
      if (IS_LOCAL) {
        const enabledList = Object.keys(newCfg).filter((k) => newCfg[k].enabled);
        showDevToast(JSON.stringify(enabledList, null, 2));
      }
    });

    return { panel, overlay };
  }

  // ── Dev toast (localhost only) ────────────────────────────────────────────

  function showDevToast(json) {
    document.getElementById("dev-toast")?.remove();
    const toast = document.createElement("div");
    toast.id = "dev-toast";
    toast.innerHTML = `
      <div class="dev-toast-header">
        <span class="dev-toast-title">// repos.json</span>
        <button class="dev-toast-close" aria-label="Close">×</button>
      </div>
      <p class="dev-toast-sub">Paste this into <code>repos.json</code> and push to update all visitors.</p>
      <pre class="dev-toast-code">${json}</pre>
      <button class="dev-toast-copy">Copy JSON</button>`;
    document.body.appendChild(toast);

    toast.querySelector(".dev-toast-close").addEventListener("click", () => toast.remove());
    toast.querySelector(".dev-toast-copy").addEventListener("click", () => {
      navigator.clipboard.writeText(json).then(() => {
        const btn = toast.querySelector(".dev-toast-copy");
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy JSON"; }, 2000);
      });
    });

    // Auto-dismiss after 20 seconds.
    setTimeout(() => toast?.remove(), 20000);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    // repos.json is the source of truth for what everyone sees.
    const reposFromJson = await fetchReposJson();

    let cfg;
    if (IS_LOCAL) {
      // On localhost: use localStorage preview if it exists, else seed from repos.json.
      const stored = loadConfig();
      if (stored) {
        cfg = stored;
      } else if (reposFromJson) {
        cfg = listToCfg(reposFromJson);
        saveConfig(cfg);
      } else {
        cfg = {};
      }
    } else {
      // On live site: always use repos.json, ignore localStorage.
      cfg = reposFromJson ? listToCfg(reposFromJson) : {};
    }

    // Render the grid immediately.
    await renderGrid(cfg);

    // Wire up the toggle button.
    const toggleBtn = document.getElementById("selector-toggle");
    if (!toggleBtn) return;

    // Hide Manage Repos on live site. Use Konami code to unlock: ↑↑↓↓←→←→ba
    if (!IS_LOCAL) {
      toggleBtn.style.display = "none";
      const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
      let ki = 0;
      document.addEventListener("keydown", (e) => {
        if (e.key === KONAMI[ki]) { ki++; } else { ki = e.key === KONAMI[0] ? 1 : 0; }
        if (ki === KONAMI.length) { ki = 0; toggleBtn.click(); }
      });
    }

    toggleBtn.addEventListener("click", async () => {
      const isOpen = document.getElementById("repo-selector-panel")?.classList.contains("open");
      if (isOpen) {
        document.getElementById("repo-selector-panel")?.classList.remove("open");
        document.getElementById("repo-selector-overlay")?.classList.remove("open");
        toggleBtn.classList.remove("open");
        return;
      }

      // Load all public repos to populate the selector.
      const allPublic = await fetchAllPublicRepos();

      // Merge with config: known repos keep their enabled state; new ones default to disabled.
      const freshCfg = loadConfig() || cfg;
      allPublic.forEach((r) => {
        if (!(r.name in freshCfg)) freshCfg[r.name] = { enabled: false };
      });
      saveConfig(freshCfg);

      const { panel, overlay } = buildSelectorPanel(allPublic, freshCfg);

      // Force a reflow then open.
      requestAnimationFrame(() => {
        panel.classList.add("open");
        overlay.classList.add("open");
        toggleBtn.classList.add("open");
      });
    });
  }

  // Kick off after the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
