"use strict";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const precisePointer = matchMedia("(hover: hover) and (pointer: fine)");
const pad = (number) => String(number).padStart(2, "0");

function clockMinutes(clock) {
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
}

function initHours() {
  const rows = [...document.querySelectorAll("[data-day]")];
  const badge = document.querySelector("[data-open-badge]");
  const label = badge.querySelector("[data-open-label]");
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const schedule = rows.map((row) => ({
    day: row.dataset.day,
    name: row.cells[0].firstChild.textContent.trim().toLocaleLowerCase("it"),
    row,
    opens: row.dataset.opens,
    starts: row.dataset.opens ? clockMinutes(row.dataset.opens) : null,
    ends: row.dataset.closes ? clockMinutes(row.dataset.closes) : null,
  }));

  function update() {
    const parts = Object.fromEntries(formatter.formatToParts().map(({ type, value }) => [type, value]));
    const current = schedule.findIndex(({ day }) => day === parts.weekday);
    const today = schedule[current];
    const previous = schedule[(current + schedule.length - 1) % schedule.length];
    const minute = Number(parts.hour) * 60 + Number(parts.minute);
    const carriesFromYesterday = previous.starts !== null && previous.ends < previous.starts
      && minute < previous.ends;
    const openToday = today.starts !== null && minute >= today.starts
      && (today.ends < today.starts || minute < today.ends);
    const isOpen = carriesFromYesterday || openToday;
    let status = "Aperto ora a Vanchiglia";

    if (!isOpen) {
      for (let offset = 0; offset < schedule.length; offset += 1) {
        const next = schedule[(current + offset) % schedule.length];
        if (next.starts === null || (offset === 0 && next.starts <= minute)) continue;
        const when = offset === 0 ? "oggi" : offset === 1 ? "domani" : next.name;
        status = `Apre ${when} alle ${next.opens}`;
        break;
      }
    }

    badge.dataset.open = String(isOpen);
    if (label.textContent !== status) label.textContent = status;
    for (const { row } of schedule) {
      const active = row === today.row;
      row.classList.toggle("is-today", active);
      row.querySelector(".today-label").hidden = !active;
    }
  }

  update();
  setInterval(() => { if (!document.hidden) update(); }, 10_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) update(); });
}

function initFilters() {
  const filters = document.querySelector("[data-filters]");
  const grid = document.querySelector("[data-bento]");
  const status = document.querySelector("[data-filter-status]");
  const buttons = [...filters.querySelectorAll("[data-filter]")];
  const cards = [...grid.querySelectorAll("[data-category]")];
  let active = "tutto";
  filters.hidden = false;

  function show(category) {
    if (active === category) return;
    active = category;
    let count = 0;
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.filter === active));

    for (const card of cards) {
      const visible = active === "tutto" || card.dataset.category === active;
      card.hidden = !visible;
      if (visible) {
        count += 1;
        if (!reducedMotion.matches && typeof card.animate === "function") {
          card.animate([{ opacity: .2, translate: "0 .65rem" }, { opacity: 1, translate: "0 0" }], {
            duration: 330,
            easing: "ease-out",
          });
        }
      }
    }

    grid.toggleAttribute("data-filtered", active !== "tutto");
    grid.dataset.count = count;
    status.textContent = count === 1 ? "1 proposta visibile" : `${count} proposte visibili`;
  }

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (button) show(button.dataset.filter);
  });
  document.querySelector('a[href="#brunch"]').addEventListener("click", () => {
    if (document.getElementById("brunch").hidden) show("tutto");
  });
  addEventListener("hashchange", () => {
    if (location.hash === "#brunch" && document.getElementById("brunch").hidden) {
      show("tutto");
      document.getElementById("brunch").scrollIntoView();
    }
  });
}

function initCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  const track = carousel.querySelector("[data-slides]");
  const slides = [...track.children];
  const controls = carousel.querySelector("[data-review-controls]");
  const position = controls.querySelector("[data-review-position]");
  let current = 0;

  function show(index, animate = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, number) => {
      slide.hidden = number !== current;
      slide.classList.toggle("is-entering", animate && number === current);
    });
    position.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
  }

  show(0);
  carousel.dataset.ready = "";
  controls.hidden = false;
  controls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-step]");
    if (button) show(current + Number(button.dataset.reviewStep), true);
  });
  controls.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === "ArrowLeft" ? -1 : 1), true);
  });

  let gesture;
  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" && event.isPrimary) {
      gesture = { x: event.clientX, y: event.clientY };
    }
  }, { passive: true });
  track.addEventListener("pointercancel", () => { gesture = undefined; });
  track.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerType !== "touch") return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = undefined;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      show(current + (dx > 0 ? -1 : 1), true);
    }
  });
}

function initMarquee() {
  const marquee = document.querySelector("[data-marquee]");
  const track = marquee.querySelector("[data-marquee-track]");
  const toggle = marquee.querySelector("[data-marquee-toggle]");
  const icon = toggle.querySelector("use");
  track.append(track.firstElementChild.cloneNode(true));

  function syncMotion() {
    marquee.toggleAttribute("data-ready", !reducedMotion.matches);
    toggle.hidden = reducedMotion.matches;
  }

  toggle.addEventListener("click", () => {
    const paused = marquee.toggleAttribute("data-paused");
    toggle.setAttribute("aria-label", paused ? "Riprendi la fascia scorrevole" : "Metti in pausa la fascia scorrevole");
    icon.setAttribute("href", paused ? "#i-play" : "#i-pause");
  });
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      marquee.toggleAttribute("data-offscreen", !entry.isIntersecting);
    });
    observer.observe(marquee);
  }
}

function initReveals() {
  if (!("IntersectionObserver" in window)) return;
  const rating = document.querySelector("[data-rating]");
  const decimal = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (reducedMotion.matches) continue;
      if (target !== rating) {
        target.classList.add("is-revealed");
        continue;
      }

      const final = Number(rating.textContent.replace(",", "."));
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 850, 1);
        const text = decimal.format(final * (1 - (1 - progress) ** 3));
        if (rating.textContent !== text) rating.textContent = text;
        if (progress < 1) requestAnimationFrame(tick);
      }
      rating.textContent = decimal.format(0);
      requestAnimationFrame(tick);
    }
  }, { threshold: .2 });

  for (const element of document.querySelectorAll("[data-reveal], [data-rating]")) observer.observe(element);
}

function initPointerEffects() {
  for (const element of document.querySelectorAll("[data-spotlight], [data-tilt], [data-magnetic]")) {
    let frame = 0;
    let point;
    const tilt = element.hasAttribute("data-tilt");
    const magnetic = element.hasAttribute("data-magnetic");

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      element.classList.remove("has-spotlight");
      for (const property of ["--tilt-x", "--tilt-y", "--magnet-x", "--magnet-y"]) element.style.removeProperty(property);
    }

    element.addEventListener("pointermove", (event) => {
      if (!precisePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const x = (point.x - rect.left) / rect.width;
        const y = (point.y - rect.top) / rect.height;
        if (magnetic) {
          element.style.setProperty("--magnet-x", `${(x - .5) * 10}px`);
          element.style.setProperty("--magnet-y", `${(y - .5) * 10}px`);
        } else {
          element.style.setProperty("--light-x", `${x * 100}%`);
          element.style.setProperty("--light-y", `${y * 100}%`);
          element.classList.add("has-spotlight");
          if (tilt) {
            element.style.setProperty("--tilt-x", `${(.5 - y) * 5}deg`);
            element.style.setProperty("--tilt-y", `${(x - .5) * 5}deg`);
          }
        }
      });
    }, { passive: true });

    element.addEventListener("pointerleave", reset);
    element.addEventListener("pointercancel", reset);
    reducedMotion.addEventListener("change", reset);
    precisePointer.addEventListener("change", reset);
  }
}

initHours();
initFilters();
initCarousel();
initMarquee();
initReveals();
initPointerEffects();
