const burger = document.querySelector(".menu");
const overlay = document.getElementById("overlay");
let locked = false;
const BURGER_TIME = 600;

function toggleMenu() {
  if (!burger || !overlay || locked) return;

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

  overlay.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      toggleMenu();
    }
  });
}

// Lazy logo
const img = document.querySelector(".js-lazy-logo");

if (img) {
  const load = () => {
    const src = img.getAttribute("data-src");

    if (src) {
      img.src = src;
      img.removeAttribute("data-src");
    }
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          load();
          observer.disconnect();
        }
      });
    });

    obs.observe(img);
  } else {
    load();
  }
}

// Scroll progress
(function () {
  const progressBar = document.querySelector(".scroll-progress__bar");
  if (!progressBar) return;

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    progressBar.style.width = `${progress}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  document.addEventListener("DOMContentLoaded", updateScrollProgress);
})();

// Home feature cards: reveal once when each card enters the viewport
const homeFeatureCards = document.querySelectorAll(".features-list .feature-card");

if (homeFeatureCards.length && "IntersectionObserver" in window) {
  const featureRevealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card = entry.target;

        card.classList.add("is-in-view");

        card.addEventListener(
          "animationend",
          () => {
            card.classList.add("has-revealed");
            card.classList.remove("is-in-view");
          },
          { once: true }
        );

        observer.unobserve(card);
      });
    },
    {
      threshold: 0.36,
      rootMargin: "0px 0px -14% 0px",
    }
  );

  homeFeatureCards.forEach((card) => featureRevealObserver.observe(card));
}

// Animated navbar active pill between pages
const desktopNav = document.querySelector(".desktop-nav");

if (desktopNav) {
  const navLinks = Array.from(desktopNav.querySelectorAll("a"));
  const currentPath =
    window.location.pathname === "/index.html" ? "/" : window.location.pathname;

  const normalizeHref = (href) => {
    const url = new URL(href, window.location.origin);
    return url.pathname === "/index.html" ? "/" : url.pathname;
  };

  const currentLink =
    navLinks.find((link) => normalizeHref(link.href) === currentPath) || navLinks[0];

  const shouldAnimateFromPrevious =
    sessionStorage.getItem("navPillShouldAnimate") === "1";

  const previousPath = sessionStorage.getItem("previousNavPath");

  const previousLink = shouldAnimateFromPrevious
    ? navLinks.find((link) => normalizeHref(link.href) === previousPath)
    : null;

  sessionStorage.removeItem("navPillShouldAnimate");
  sessionStorage.removeItem("previousNavPath");

  let hasStartedInitialAnimation = false;

  const setPillToLink = (link) => {
    if (!link) return;

    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    desktopNav.style.setProperty("--nav-pill-width", `${Math.round(linkRect.width)}px`);
    desktopNav.style.setProperty("--nav-pill-height", `${Math.round(linkRect.height)}px`);
    desktopNav.style.setProperty("--nav-pill-x", `${Math.round(linkRect.left - navRect.left)}px`);
    desktopNav.style.setProperty("--nav-pill-y", `${Math.round(linkRect.top - navRect.top)}px`);
  };

  const lockPillToCurrent = () => {
    desktopNav.classList.remove("nav-pill-animate");
    setPillToLink(currentLink);
    desktopNav.classList.add("nav-pill-ready");

    requestAnimationFrame(() => {
      desktopNav.classList.add("nav-pill-animate");
    });
  };

  const startPill = () => {
    desktopNav.classList.remove("nav-pill-animate");
    desktopNav.classList.add("nav-pill-ready");

    if (previousLink && previousLink !== currentLink) {
      setPillToLink(previousLink);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hasStartedInitialAnimation = true;
          desktopNav.classList.add("nav-pill-animate");
          setPillToLink(currentLink);

          window.setTimeout(() => {
            lockPillToCurrent();
          }, 720);
        });
      });
    } else {
      setPillToLink(currentLink);

      requestAnimationFrame(() => {
        desktopNav.classList.add("nav-pill-animate");
      });
    }
  };

  const startAfterLayoutIsStable = () => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startPill);
    } else {
      window.addEventListener("load", startPill, { once: true });
      requestAnimationFrame(startPill);
    }
  };

  startAfterLayoutIsStable();

  window.addEventListener("load", () => {
    if (!hasStartedInitialAnimation) {
      lockPillToCurrent();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const nextPath = normalizeHref(link.href);

      if (nextPath !== currentPath) {
        sessionStorage.setItem("previousNavPath", currentPath);
        sessionStorage.setItem("navPillShouldAnimate", "1");
      }
    });
  });

  window.addEventListener("resize", lockPillToCurrent);
}

// Home feature cards: let the click feedback finish before navigation
const homeFeatureLinks = document.querySelectorAll(".features-list .feature-card");

homeFeatureLinks.forEach((card) => {
  card.addEventListener("click", (event) => {
    const href = card.getAttribute("href");
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (!href || isModifiedClick || card.target === "_blank") return;

    event.preventDefault();
    card.classList.remove("is-clicking");

    requestAnimationFrame(() => {
      card.classList.add("is-clicking");
    });

    let hasNavigated = false;

    const goToPage = () => {
      if (hasNavigated) return;
      hasNavigated = true;
      window.location.href = href;
    };

    card.addEventListener("animationend", goToPage, { once: true });

    window.setTimeout(goToPage, 420);
  });
});

// CTA buttons: shine first, navigate after the effect
const shineCtaLinks = document.querySelectorAll("a.btn-primary, a.activity-btn");

shineCtaLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (!href || isModifiedClick || link.target === "_blank") return;

    event.preventDefault();
    link.classList.remove("is-shining");

    requestAnimationFrame(() => {
      link.classList.add("is-shining");
    });

    let hasNavigated = false;

    const goToPage = () => {
      if (hasNavigated) return;
      hasNavigated = true;
      window.location.href = href;
    };

    link.addEventListener(
      "animationend",
      (animationEvent) => {
        if (animationEvent.animationName === "ctaButtonShineSweep") {
          goToPage();
        }
      },
      { once: true }
    );

    window.setTimeout(goToPage, 680);
  });
});


const mapButton = document.querySelector('.location-map-button');

if (mapButton) {
  mapButton.addEventListener('click', () => {
    const mapSrc = mapButton.getAttribute('data-map-src');
    const mapContainer = mapButton.nextElementSibling;

    if (!mapSrc || !mapContainer) return;

    mapButton.classList.add('is-loading');

    window.setTimeout(() => {
      mapContainer.innerHTML = `
        <iframe
          src="${mapSrc}"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Mappa Palatenda Tavagnasco">
        </iframe>
      `;

      mapContainer.hidden = false;
      mapContainer.classList.add('is-opening');
      mapButton.remove();

      mapContainer.addEventListener('animationend', () => {
        mapContainer.classList.remove('is-opening');
        mapContainer.classList.add('is-open');
      }, { once: true });
    }, 160);
  });
}
