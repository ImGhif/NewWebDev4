// Mobile nav toggle
const hamb = document.getElementById("hamb");
const navlinks = document.getElementById("navlinks");
if (hamb) {
  hamb.addEventListener("click", () => {
    const showing = getComputedStyle(navlinks).display !== "none";
    navlinks.style.display = showing ? "none" : "flex";
  });
}

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
