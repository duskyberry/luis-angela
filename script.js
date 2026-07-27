// ==========================================================================
// Luis & Ángela — Pool Party Invitation · script.js
// ==========================================================================

(() => {
  "use strict";

  const EVENT = {
    title: "Pool Party — Luis & Ángela",
    // Local time America/Monterrey (UTC-6), no DST in Aug 2026
    start: new Date("2026-08-14T13:00:00-06:00"),
    end: new Date("2026-08-14T18:00:00-06:00"),
    location:
      "Palapa Luzuane, Nuez de La India 300, Los Nogales II, 25057 Saltillo, Coah.",
    description:
      "¡Te invitamos a celebrar el cumpleaños de Luis y Ángela! Trae tu traje de baño.",
  };

  const WHATSAPP_NUMBER = "528442322541"; // 844 23 22 541 with MX country code

  /* ------------------------------------------------------------------ */
  /* Entry screen → reveal invitation                                    */
  /* ------------------------------------------------------------------ */

  const entryScreen = document.getElementById("entry");
  const discoverBtn = document.getElementById("discoverBtn");
  const invitation = document.getElementById("invitation");
  const canvas = document.getElementById("confettiCanvas");

  function openInvitation() {
    launchConfetti();
    entryScreen.classList.add("is-leaving");
    invitation.hidden = false;
    document.body.style.overflow = "";

    window.setTimeout(() => {
      entryScreen.remove();
      invitation.scrollIntoView({ behavior: "instant", block: "start" });
      initReveal();
    }, 850);
  }

  if (discoverBtn) {
    discoverBtn.addEventListener("click", openInvitation, { once: true });
  }

  // Lock scroll while on entry screen
  document.body.style.overflow = "hidden";

  /* ------------------------------------------------------------------ */
  /* Confetti burst (lightweight canvas, no deps)                        */
  /* ------------------------------------------------------------------ */

  function launchConfetti() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colors = ["#22C3C0", "#C6F24E", "#A88CF0", "#FFD24C", "#FF9AA2"];
    const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 140;
    const particles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 14,
      shape: Math.random() > 0.5 ? "rect" : "circle",
      gravity: 0.35 + Math.random() * 0.15,
      life: 0,
    }));

    let frame = 0;
    const maxFrames = 220;

    function tick() {
      frame++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.spin;
        p.life++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (frame < maxFrames && count > 0) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    if (count > 0) requestAnimationFrame(tick);
    window.addEventListener("resize", resize, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */

  function initReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Countdown                                                            */
  /* ------------------------------------------------------------------ */

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, "0");
  }

  function updateCountdown() {
    const now = new Date();
    let diff = EVENT.start.getTime() - now.getTime();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-min");
    const sEl = document.getElementById("cd-sec");
    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ------------------------------------------------------------------ */
  /* Add to calendar (Google Calendar link + downloadable .ics fallback) */
  /* ------------------------------------------------------------------ */

  function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  function addToCalendar() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) {
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: EVENT.title,
        dates: `${formatICSDate(EVENT.start)}/${formatICSDate(EVENT.end)}`,
        details: EVENT.description,
        location: EVENT.location,
      });
      window.open(
        `https://calendar.google.com/calendar/render?${params.toString()}`,
        "_blank",
        "noopener"
      );
      return;
    }

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(EVENT.start)}`,
      `DTEND:${formatICSDate(EVENT.end)}`,
      `SUMMARY:${EVENT.title}`,
      `DESCRIPTION:${EVENT.description}`,
      `LOCATION:${EVENT.location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pool-party-luis-angela.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const calendarBtn = document.getElementById("calendarBtn");
  if (calendarBtn) calendarBtn.addEventListener("click", addToCalendar);

  /* ------------------------------------------------------------------ */
  /* RSVP → WhatsApp                                                     */
  /* ------------------------------------------------------------------ */

  const rsvpForm = document.getElementById("rsvpForm");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("rsvpName").value.trim();
      const guests = document.getElementById("rsvpGuests").value.trim();
      const message = document.getElementById("rsvpMessage").value.trim();

      const lines = [
        "¡Hola! Confirmo mi asistencia a la Pool Party de Luis y Ángela 🎉",
        `Nombre: ${name}`,
        `Acompañantes: ${guests}`,
      ];
      if (message) lines.push(`Mensaje: ${message}`);

      const text = encodeURIComponent(lines.join("\n"));
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
        "_blank",
        "noopener"
      );
    });
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic tap feedback for pill buttons                              */
  /* ------------------------------------------------------------------ */

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill-btn, .discover-btn");
    if (!btn) return;
    btn.style.transform = "scale(0.96)";
    window.setTimeout(() => {
      btn.style.transform = "";
    }, 140);
  });
})();
