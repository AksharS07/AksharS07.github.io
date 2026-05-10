// Module 1 - Canvas Particle Network
(function particleNetwork() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const nodes = [];
  const nodeCount = 80;
  const mouse = { x: -9999, y: -9999 };

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

    requestAnimationFrame(updateAndDraw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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
        : "radial-gradient(circle, rgba(167,139,250,0.5), transparent)";

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
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
  });

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
    { threshold: 0.45 }
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
