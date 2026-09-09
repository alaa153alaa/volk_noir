/* ============================================================
   VOLK NOIR // 9999 — UI interactions
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });
    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => siteNav.classList.remove("open"));
    });
  }

  /* ---------- fake HUD clock ---------- */
  const hudClock = document.getElementById("hudClock");
  if (hudClock) {
    setInterval(() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      hudClock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }, 1000);
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll(".counter");
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        let current = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => {
          current += step;
          if (current >= target) {
            el.textContent = target;
          } else {
            el.textContent = current;
            requestAnimationFrame(tick);
          }
        };
        tick();
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ---------- 3D tilt on dossier cards ---------- */
  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0) rotateY(0) translateY(0)";
    });
  });

  /* ---------- membership form (front-end only) ---------- */
  const form = document.getElementById("joinForm");
  const success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // No backend connected yet — this just confirms the UI flow.
      // Wire this up to an email service or API endpoint to go live.
      if (success) {
        success.classList.add("show");
        form.reset();
      }
    });
  }

  /* ---------- background ambience ---------- */
  const bgAudio = document.getElementById("bgAudio");
  const soundToggle = document.getElementById("soundToggle");
  let soundOn = false;
  if (bgAudio) bgAudio.volume = 0.35;

  function updateToggleIcon() {
    if (soundToggle) soundToggle.textContent = soundOn ? "🔊" : "🔇";
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      if (!bgAudio) return;
      soundOn = !soundOn;
      if (soundOn) {
        bgAudio.play().catch(() => {
          soundOn = false;
          updateToggleIcon();
        });
      } else {
        bgAudio.pause();
      }
      updateToggleIcon();
    });
  }

  /* ---------- entry gate: this click is what lets audio start ---------- */
  const gate = document.getElementById("gate");
  const gateEnter = document.getElementById("gateEnter");
  if (gate && gateEnter) {
    gateEnter.addEventListener("click", () => {
      if (bgAudio) {
        bgAudio.play()
          .then(() => {
            soundOn = true;
            updateToggleIcon();
          })
          .catch(() => {
            // file missing or blocked — gate still opens, sound stays off
            soundOn = false;
            updateToggleIcon();
          });
      }
      gate.classList.add("hidden");
    });
  }

});
