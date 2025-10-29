// Mobile nav toggle
const hamb = document.getElementById("hamb");
const navlinks = document.getElementById("navlinks");
if (hamb) {
  hamb.addEventListener("click", () => {
    const showing = getComputedStyle(navlinks).display !== "none";
    navlinks.style.display = showing ? "none" : "flex";
  });
}

// Update active section in navigation
function updateActiveSection() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll(".nav .link");

  let currentSectionId = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;
    if (
      window.pageYOffset >= sectionTop &&
      window.pageYOffset < sectionTop + sectionHeight
    ) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSectionId}`) {
      link.classList.add("active");
    }
  });
}

// Add scroll event listener
window.addEventListener("scroll", updateActiveSection);
updateActiveSection(); // Run once on page load

// FAQ accordion
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  const btn = q.querySelector("button[aria-label='toggle']");

  // initialize ARIA
  if (btn) btn.setAttribute("aria-expanded", "false");
  if (a) a.setAttribute("aria-hidden", "true");

  q.addEventListener("click", () => {
    const isOpen = item.classList.toggle("open");
    // update aria and icon
    if (btn) {
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      btn.textContent = isOpen ? "-" : "+";
    }
    if (a) a.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });
});

// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Small scroll-reveal effect
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 600,
            easing: "cubic-bezier(.2,.6,.2,1)",
            fill: "forwards",
          }
        );
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);

document
  .querySelectorAll(".card, .feature, .step, .price-card, .testis article")
  .forEach((el) => io.observe(el));

// --- Gallery slider ---
// Image list discovered in the project img/ folder. If you add/remove images,
// update this list or add images to the img/ folder; the slider will adapt.
const galleryImages = [
  "img/IMG-20251010-WA0021.jpg",
  "img/IMG-20251010-WA0020.jpg",
  "img/IMG-20251010-WA0019.jpg",
  "img/IMG-20251010-WA0018.jpg",
  "img/IMG-20251010-WA0017.jpg",
  "img/IMG-20251010-WA0016.jpg",
  "img/IMG-20251010-WA0015.jpg",
  "img/IMG-20251010-WA0014.jpg",
  "img/IMG-20251010-WA0013.jpg",
  "img/IMG-20251010-WA0012.jpg",
  "img/IMG-20251010-WA0011.jpg",
  "img/IMG-20251010-WA0010.jpg",
  "img/IMG-20251010-WA0009.jpg",
  "img/IMG-20251010-WA0008.jpg",
  "img/IMG-20251010-WA0006.jpg",
  "img/IMG-20251010-WA0005.jpg",
  "img/IMG-20251010-WA0004.jpg",
];

function initGallery() {
  const track = document.getElementById("gTrack");
  const dotsWrap = document.getElementById("gDots");
  const prev = document.getElementById("gPrev");
  const next = document.getElementById("gNext");
  if (!track) return;

  // build a g-list wrapper inside track to allow transform-based sliding
  const list = document.createElement("div");
  list.className = "g-list";
  track.appendChild(list);

  galleryImages.forEach((src, i) => {
    const it = document.createElement("div");
    it.className = "g-item";
    it.setAttribute("data-index", i);
    const im = document.createElement("img");
    im.src = src;
    im.alt = `Galery ${i + 1}`;
    it.appendChild(im);
    list.appendChild(it);
  });

  // clone items to both ends to create an infinite loop
  const originals = Array.from(list.children);
  const realCount = originals.length;
  // append clones of originals at the end
  originals.forEach((n) => list.appendChild(n.cloneNode(true)));
  // prepend clones of originals at the start (use reversed to keep order)
  originals
    .slice()
    .reverse()
    .forEach((n) => list.insertBefore(n.cloneNode(true), list.firstChild));

  const items = Array.from(list.children);
  // start index in the middle (pointing to the first original)
  let index = realCount;
  let itemWidth = 0; // px width of each item
  let perView = 2; // visual items per view (used to compute width)
  const GAP = 10; // gap in px (matches CSS)

  function recalc() {
    // recalc item width based on container
    const trackW = track.clientWidth;
    if (window.innerWidth <= 640) {
      perView = 1;
      // do not set widths inline; CSS controls card width on small screens
      // measure after a short delay to allow layout
      itemWidth = items[0]
        ? Math.round(items[0].getBoundingClientRect().width)
        : trackW;
    } else {
      // CSS gives cards a clamp() width (e.g. 62%); measure actual width
      itemWidth = items[0]
        ? Math.round(items[0].getBoundingClientRect().width)
        : Math.floor(trackW * 0.62);
      perView = 1;
    }
    // reposition to current index after resize (without extra animation)
    jumpToIndex(index);
  }

  function clampIndex(i) {
    const n = items.length;
    return ((i % n) + n) % n;
  }

  // compute absolute translate so specified index is centered in track
  function computeTranslateForIndex(i) {
    const item = items[i];
    if (!item) return 0;
    const itemOffset = item.offsetLeft; // relative to list
    const iw = item.getBoundingClientRect().width;
    const trackW = track.clientWidth;
    // translate such that item center aligns with track center
    const translate = trackW / 2 - (itemOffset + iw / 2);
    return translate;
  }

  function applyTransform() {
    const translate = computeTranslateForIndex(index);
    list.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)";
    list.style.transform = `translateX(${translate}px)`;
  }

  // jump to index without animation (used after resize or when jumping from clone to real)
  function jumpToIndex(i) {
    const translate = computeTranslateForIndex(i);
    // disable transition
    list.style.transition = "none";
    list.style.transform = `translateX(${translate}px)`;
    // force reflow then re-enable transition
    // eslint-disable-next-line no-unused-expressions
    list.offsetHeight;
    list.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)";
  }

  function goTo(i) {
    index = i; // allow index beyond 0..n so we can detect clones
    applyTransform();
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));

  // when transition ends, if we're on a clone area, jump to the corresponding real item
  list.addEventListener("transitionend", () => {
    // if index is in the left clones (less than realCount), move forward by realCount
    if (index < realCount) {
      index = index + realCount;
      jumpToIndex(index);
    }
    // if index is in the right clones (>= realCount*2), move back by realCount
    if (index >= realCount * 2) {
      index = index - realCount;
      jumpToIndex(index);
    }
  });

  // keyboard
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  // touch / swipe support (basic)
  let startX = 0,
    dx = 0;
  list.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      dx = 0;
    },
    { passive: true }
  );
  list.addEventListener(
    "touchmove",
    (e) => {
      dx = e.touches[0].clientX - startX;
    },
    { passive: true }
  );
  list.addEventListener("touchend", () => {
    if (Math.abs(dx) > 40) {
      dx > 0 ? goTo(index - 1) : goTo(index + 1);
    }
  });

  // init: place on the first original item (index = realCount)
  window.addEventListener("resize", recalc);
  recalc();
  // ensure first original visible (no animation)
  setTimeout(() => jumpToIndex(index), 30);
}

// initialize when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGallery);
} else {
  initGallery();
}
