const progressFill = document.querySelector("#progress-fill");
const sections = [...document.querySelectorAll(".chapter")];
const chapterLinks = [...document.querySelectorAll("[data-chapter]")];
const revealItems = [...document.querySelectorAll(".reveal")];

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));

const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    chapterLinks.forEach((link) => {
      link.classList.toggle("is-current", link.dataset.chapter === entry.target.id);
    });
  });
}, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

sections.forEach((section) => chapterObserver.observe(section));

let ticking = false;
const updateProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  ticking = false;
};

window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateProgress);
}, { passive: true });

updateProgress();
