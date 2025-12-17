const burger = document.querySelector(".menu");
const overlay = document.getElementById("overlay");
let locked = false;
const BURGER_TIME = 600;

function toggleMenu() {
  if (locked) return;
  locked = true;

  const opening = !burger.classList.contains("opened");

  burger.classList.add("glow");
  burger.classList.toggle("opened");
  burger.setAttribute("aria-expanded", opening);

  if (opening) {
    setTimeout(() => {
      overlay.classList.add("active");
      burger.classList.remove("glow");
      locked = false;
    }, BURGER_TIME);
  } else {
    overlay.classList.remove("active");
    setTimeout(() => {
      burger.classList.remove("glow");
      locked = false;
    }, BURGER_TIME);
  }
}

if (burger && overlay) {
  burger.addEventListener("click", toggleMenu);

  overlay.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      toggleMenu();
    }
  });
}

const img = document.querySelector(".js-lazy-logo");
if (img) {
  const load = () => {
    const s = img.getAttribute("data-src");
    if (s) {
      img.src = s;
      img.removeAttribute("data-src");
    }
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries, ob) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          load();
          ob.disconnect();
        }
      });
    });
    obs.observe(img);
  } else {
    load();
  }
}


(function () {
  const progressBar = document.querySelector('.scroll-progress__bar');
  if (!progressBar) return;

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  document.addEventListener('DOMContentLoaded', updateScrollProgress);
})();
