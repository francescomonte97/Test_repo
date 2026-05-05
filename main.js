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

// Google Maps: load iframe only after user interaction
const mapButton = document.querySelector(".location-map-button");

if (mapButton) {
  mapButton.addEventListener("click", () => {
    const mapSrc = mapButton.getAttribute("data-map-src");
    const mapContainer = mapButton.nextElementSibling;

    if (!mapSrc || !mapContainer) return;

    mapButton.classList.add("is-loading");

    window.setTimeout(() => {
      mapContainer.innerHTML = `
        <iframe
          src="${mapSrc}"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Mappa Via Quassolo 6 Tavagnasco">
        </iframe>
      `;

      mapContainer.hidden = false;
      mapContainer.classList.add("is-opening");
      mapButton.remove();

      mapContainer.addEventListener(
        "animationend",
        () => {
          mapContainer.classList.remove("is-opening");
          mapContainer.classList.add("is-open");
        },
        { once: true }
      );
    }, 160);
  });
}

// Final animated navbar underline between pages
(() => {
  const nav = document.querySelector(".desktop-nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll("a"));
  const currentPath = window.location.pathname === "/index.html" ? "/" : window.location.pathname;

  const normalizeHref = (href) => {
    const url = new URL(href, window.location.origin);
    return url.pathname === "/index.html" ? "/" : url.pathname;
  };

  const currentLink = links.find((link) => normalizeHref(link.href) === currentPath) || links[0];
  const previousPath = sessionStorage.getItem("previousNavPath");
  const shouldAnimate = sessionStorage.getItem("navUnderlineShouldAnimate") === "1";
  const previousLink = shouldAnimate
    ? links.find((link) => normalizeHref(link.href) === previousPath)
    : null;

  sessionStorage.removeItem("navUnderlineShouldAnimate");
  sessionStorage.removeItem("navPillShouldAnimate");
  sessionStorage.removeItem("previousNavPath");

  let underlineSequenceRunning = false;

  const setCurrentLink = (activeLink = currentLink) => {
    links.forEach((link) => link.classList.remove("is-current-nav"));
    activeLink.classList.add("is-current-nav");
  };

  const getUnderlineMetrics = (link) => {
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const underlineWidth = Math.max(18, Math.round(linkRect.width * 0.62));
    const underlineX = Math.round(linkRect.left - navRect.left + (linkRect.width - underlineWidth) / 2);
    const dotSize = 7;
    const dotX = Math.round(linkRect.left - navRect.left + linkRect.width / 2 - dotSize / 2);

    return { dotSize, dotX, underlineWidth, underlineX };
  };

  const setUnderlineToLink = (link) => {
    if (!link) return;

    const { underlineWidth, underlineX } = getUnderlineMetrics(link);

    nav.style.setProperty("--nav-underline-width", `${underlineWidth}px`);
    nav.style.setProperty("--nav-underline-x", `${underlineX}px`);
  };

  const setElasticUnderlinePath = (fromLink, toLink) => {
    const from = getUnderlineMetrics(fromLink);
    const to = getUnderlineMetrics(toLink);

    nav.style.setProperty("--nav-prev-underline-width", `${from.underlineWidth}px`);
    nav.style.setProperty("--nav-prev-underline-x", `${from.underlineX}px`);
    nav.style.setProperty("--nav-prev-dot-x", `${from.dotX}px`);
    nav.style.setProperty("--nav-current-underline-width", `${to.underlineWidth}px`);
    nav.style.setProperty("--nav-current-underline-x", `${to.underlineX}px`);
    nav.style.setProperty("--nav-current-dot-x", `${to.dotX}px`);
    nav.style.setProperty("--nav-dot-size", `${to.dotSize}px`);
    nav.style.setProperty("--nav-underline-width", `${to.underlineWidth}px`);
    nav.style.setProperty("--nav-underline-x", `${to.underlineX}px`);
  };

  const enableAnimation = () => {
    nav.classList.add("nav-underline-animate");
  };

  const disableAnimation = () => {
    nav.classList.remove("nav-underline-animate");
  };

  const lockUnderlineToCurrent = (force = false) => {
    if (underlineSequenceRunning && !force) return;

    nav.classList.remove(
      "nav-pill-ready",
      "nav-pill-animate",
      "nav-underline-elastic",
      "nav-underline-dot-start",
      "nav-underline-dot-charge",
      "nav-underline-dot-travel",
      "nav-underline-stretch-final",
      "nav-underline-settle-final"
    );
    disableAnimation();
    setUnderlineToLink(currentLink);
    setCurrentLink();
    nav.classList.add("nav-underline-ready");

    requestAnimationFrame(enableAnimation);
  };

  const animateFromPreviousToCurrent = () => {
    nav.classList.remove(
      "nav-pill-ready",
      "nav-pill-animate",
      "nav-underline-animate",
      "nav-underline-compress",
      "nav-underline-stretch",
      "nav-underline-travel",
      "nav-underline-land",
      "nav-underline-settle",
      "nav-underline-overshoot",
      "nav-underline-elastic",
      "nav-underline-dot-start",
      "nav-underline-dot-charge",
      "nav-underline-dot-travel",
      "nav-underline-stretch-final",
      "nav-underline-settle-final"
    );

    nav.classList.add("nav-underline-ready");

    if (previousLink && previousLink !== currentLink) {
      underlineSequenceRunning = true;
      setCurrentLink(previousLink);
      setElasticUnderlinePath(previousLink, currentLink);
      nav.style.setProperty("--nav-underline-width", "var(--nav-prev-underline-width)");
      nav.style.setProperty("--nav-underline-x", "var(--nav-prev-underline-x)");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          nav.classList.add("nav-underline-dot-start");

          window.setTimeout(() => {
            nav.classList.remove("nav-underline-dot-start");
            nav.classList.add("nav-underline-dot-charge");
          }, 340);

          window.setTimeout(() => {
            nav.classList.remove("nav-underline-dot-charge");
            nav.classList.add("nav-underline-dot-travel");
          }, 620);

          window.setTimeout(() => {
            setCurrentLink(currentLink);
            nav.style.setProperty("--nav-underline-width", "var(--nav-current-underline-width)");
            nav.style.setProperty("--nav-underline-x", "var(--nav-current-underline-x)");
            nav.classList.remove("nav-underline-dot-travel");
            nav.classList.add("nav-underline-stretch-final");
          }, 980);

          window.setTimeout(() => {
            nav.classList.remove("nav-underline-stretch-final");
            nav.classList.add("nav-underline-settle-final");
          }, 1200);

          window.setTimeout(() => {
            nav.style.setProperty("--nav-underline-width", "var(--nav-current-underline-width)");
            nav.style.setProperty("--nav-underline-x", "var(--nav-current-underline-x)");
            nav.classList.remove("nav-underline-settle-final");
            underlineSequenceRunning = false;
            lockUnderlineToCurrent(true);
          }, 1420);
        });
      });

      return;
    }

    setCurrentLink();
    setUnderlineToLink(currentLink);

    requestAnimationFrame(() => {
      nav.classList.add("nav-underline-animate");
    });
  };

  const startWhenLayoutIsStable = () => {
    const start = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(animateFromPreviousToCurrent);
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  };

  startWhenLayoutIsStable();
  window.addEventListener("load", () => {
    window.setTimeout(lockUnderlineToCurrent, 120);
  });
  window.addEventListener("resize", lockUnderlineToCurrent);

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const nextPath = normalizeHref(link.href);

      if (nextPath !== currentPath) {
        sessionStorage.setItem("previousNavPath", currentPath);
        sessionStorage.setItem("navUnderlineShouldAnimate", "1");
      }
    });
  });
})();

// Activity page entrance animation
const activityItems = document.querySelectorAll(".activity-item");

if (activityItems.length) {
  window.addEventListener("load", () => {
    activityItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add("is-visible");
      }, i * 90);
    });
  });
}

(() => {
  const logoMount = document.querySelector(".site-loader__logo-inline");
  if (!logoMount) return;

  const logoSrc = logoMount.getAttribute("data-logo-src");
  if (!logoSrc) return;

  fetch(logoSrc)
    .then((response) => {
      if (!response.ok) throw new Error("Logo SVG not found");
      return response.text();
    })
    .then((svgText) => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = svgDoc.querySelector("svg");

      if (!svg) throw new Error("Invalid SVG");

      svg.classList.add("site-loader__logo-svg");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("width");
      svg.removeAttribute("height");

      const parts = Array.from(svg.querySelectorAll("[id]"));

      parts.forEach((part) => {
        part.classList.add("loader-logo-part");

        const id = part.id;

        if (id === "top-star" || id === "bottom-star") {
          part.classList.add("loader-logo-part--star");
        } else if (id === "triangle" || id === "drop" || id === "diamond") {
          part.classList.add("loader-logo-part--symbol");
        } else if (id === "hand") {
          part.classList.add("loader-logo-part--hand");
        } else if (id === "trophy") {
          part.classList.add("loader-logo-part--trophy");
        } else if (id === "arch") {
          part.classList.add("loader-logo-part--arch");
        } else if (id.startsWith("canavese")) {
          part.classList.add("loader-logo-part--canavese");
        } else if (id.startsWith("comics")) {
          part.classList.add("loader-logo-part--comics");
        } else {
          part.classList.add("loader-logo-part--detail");
        }
      });

      logoMount.innerHTML = "";
      logoMount.appendChild(svg);
      logoMount.classList.add("is-loaded");

      const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scenicPieces = {
        hand: {
          delay: 180,
          duration: 3800,
          origin: "24% 78%",
          frames: [
            { opacity: 0, transform: "translate3d(-390px, -76px, 0) rotate(-34deg) scale(0.54)", offset: 0 },
            { opacity: 1, transform: "translate3d(-286px, -104px, 0) rotate(-15deg) scale(0.76)", offset: 0.12 },
            { opacity: 1, transform: "translate3d(-232px, -118px, 0) rotate(18deg) scale(0.86)", offset: 0.24 },
            { opacity: 1, transform: "translate3d(-214px, -116px, 0) rotate(18deg) scale(0.88)", offset: 0.33 },
            { opacity: 1, transform: "translate3d(-188px, -102px, 0) rotate(-17deg) scale(0.94)", offset: 0.45 },
            { opacity: 1, transform: "translate3d(-156px, -82px, 0) rotate(15deg) scale(1)", offset: 0.57 },
            { opacity: 1, transform: "translate3d(-116px, -56px, 0) rotate(-9deg) scale(1.06)", offset: 0.68 },
            { opacity: 1, transform: "translate3d(-38px, -23px, 0) rotate(5deg) scale(1.04)", offset: 0.8 },
            { opacity: 1, transform: "translate3d(14px, -8px, 0) rotate(-2.5deg) scale(0.99)", offset: 0.9 },
            { opacity: 1, transform: "translate3d(-5px, 3px, 0) rotate(1deg) scale(1.01)", offset: 0.96 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        trophy: {
          delay: 1180,
          duration: 2860,
          origin: "50% 84%",
          frames: [
            { opacity: 0, transform: "translate3d(70px, 420px, 0) rotate(6deg) scale(0.34)", offset: 0 },
            { opacity: 1, transform: "translate3d(76px, 205px, 0) rotate(-7deg) scale(0.86)", offset: 0.22 },
            { opacity: 1, transform: "translate3d(118px, 118px, 0) rotate(10deg) scale(1.04)", offset: 0.36 },
            { opacity: 1, transform: "translate3d(84px, 58px, 0) rotate(-9deg) scale(0.96)", offset: 0.5 },
            { opacity: 1, transform: "translate3d(22px, -34px, 0) rotate(6deg) scale(1.16)", offset: 0.67 },
            { opacity: 1, transform: "translate3d(-9px, 19px, 0) rotate(-3deg) scale(0.95)", offset: 0.82 },
            { opacity: 1, transform: "translate3d(3px, -6px, 0) rotate(1deg) scale(1.022)", offset: 0.93 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        diamond: {
          delay: 1280,
          duration: 2760,
          origin: "50% 55%",
          frames: [
            { opacity: 0, transform: "translate3d(330px, -390px, 0) rotate(-220deg) scale(0.42)", offset: 0 },
            { opacity: 1, transform: "translate3d(242px, -248px, 0) rotate(124deg) scale(0.76)", offset: 0.18 },
            { opacity: 1, transform: "translate3d(152px, -94px, 0) rotate(238deg) scale(1.02)", offset: 0.38 },
            { opacity: 1, transform: "translate3d(82px, 18px, 0) rotate(116deg) scale(0.9)", offset: 0.55 },
            { opacity: 1, transform: "translate3d(34px, -18px, 0) rotate(42deg) scale(1.06)", offset: 0.7 },
            { opacity: 1, transform: "translate3d(10px, 8px, 0) rotate(12deg) scale(0.97)", offset: 0.84 },
            { opacity: 1, transform: "translate3d(-3px, -3px, 0) rotate(-3deg) scale(1.012)", offset: 0.94 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        drop: {
          delay: 760,
          duration: 2400,
          frames: [
            { opacity: 0, transform: "translate3d(176px, -260px, 0) rotate(18deg) scale(0.38, 0.84)", offset: 0 },
            { opacity: 1, transform: "translate3d(116px, -122px, 0) rotate(-10deg) scale(0.72, 1.28)", offset: 0.33 },
            { opacity: 1, transform: "translate3d(34px, 34px, 0) rotate(6deg) scale(1.24, 0.76)", offset: 0.55 },
            { opacity: 1, transform: "translate3d(-10px, -16px, 0) rotate(-2deg) scale(0.92, 1.08)", offset: 0.76 },
            { opacity: 1, transform: "translate3d(3px, 3px, 0) rotate(0.8deg) scale(1.018, 0.98)", offset: 0.91 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        triangle: {
          delay: 1260,
          duration: 2820,
          frames: [
            { opacity: 0, transform: "translate3d(390px, -92px, 0) rotate(76deg) scale(0.42)", offset: 0 },
            { opacity: 1, transform: "translate3d(208px, -60px, 0) rotate(-34deg) scale(0.86)", offset: 0.26 },
            { opacity: 1, transform: "translate3d(72px, 42px, 0) rotate(28deg) scale(1.14)", offset: 0.5 },
            { opacity: 1, transform: "translate3d(-20px, -10px, 0) rotate(-10deg) scale(0.95)", offset: 0.73 },
            { opacity: 1, transform: "translate3d(6px, 3px, 0) rotate(3deg) scale(1.018)", offset: 0.89 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        arch: {
          delay: 1480,
          duration: 2860,
          frames: [
            { opacity: 0, transform: "translate3d(360px, 184px, 0) rotate(44deg) scale(0.5)", offset: 0 },
            { opacity: 1, transform: "translate3d(174px, 92px, 0) rotate(-26deg) scale(0.9)", offset: 0.32 },
            { opacity: 1, transform: "translate3d(38px, -26px, 0) rotate(13deg) scale(1.1)", offset: 0.56 },
            { opacity: 1, transform: "translate3d(-11px, 10px, 0) rotate(-5deg) scale(0.97)", offset: 0.76 },
            { opacity: 1, transform: "translate3d(4px, -3px, 0) rotate(1.5deg) scale(1.014)", offset: 0.9 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        "bottom-star": {
          delay: 1940,
          duration: 2300,
          frames: [
            { opacity: 0, transform: "translate3d(-350px, 270px, 0) rotate(-120deg) scale(0.08)", offset: 0 },
            { opacity: 1, transform: "translate3d(-218px, 164px, 0) rotate(92deg) scale(1.38)", offset: 0.18 },
            { opacity: 1, transform: "translate3d(-76px, 48px, 0) rotate(-42deg) scale(0.72)", offset: 0.44 },
            { opacity: 1, transform: "translate3d(24px, -15px, 0) rotate(22deg) scale(1.22)", offset: 0.66 },
            { opacity: 1, transform: "translate3d(-7px, 5px, 0) rotate(-7deg) scale(0.94)", offset: 0.84 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
        "top-star": {
          delay: 2160,
          duration: 2520,
          frames: [
            { opacity: 0, transform: "translate3d(-300px, -370px, 0) rotate(150deg) scale(0.08)", offset: 0 },
            { opacity: 1, transform: "translate3d(-172px, -210px, 0) rotate(-92deg) scale(1.42)", offset: 0.2 },
            { opacity: 1, transform: "translate3d(-82px, -112px, 0) rotate(42deg) scale(0.76)", offset: 0.42 },
            { opacity: 1, transform: "translate3d(-12px, -18px, 0) rotate(-16deg) scale(1.34)", offset: 0.56 },
            { opacity: 1, transform: "translate3d(-12px, -18px, 0) rotate(12deg) scale(1.42)", offset: 0.64 },
            { opacity: 1, transform: "translate3d(-34px, -42px, 0) rotate(26deg) scale(0.86)", offset: 0.75 },
            { opacity: 1, transform: "translate3d(5px, -8px, 0) rotate(-5deg) scale(1.06)", offset: 0.88 },
            { opacity: 1, transform: "translate3d(-2px, -2px, 0) rotate(1.8deg) scale(0.985)", offset: 0.95 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", offset: 1 },
          ],
        },
      };

      Object.entries(scenicPieces).forEach(([id, scene]) => {
        const part = svg.querySelector(`#${CSS.escape(id)}`);
        if (!part) return;

        part.style.setProperty("animation", "none", "important");
        part.style.setProperty("opacity", "0", "important");
        part.style.setProperty("transform-box", "fill-box", "important");
        part.style.setProperty("transform-origin", scene.origin || "center", "important");
        part.style.setProperty("transform", scene.frames[0].transform, "important");

        if (!motionAllowed) {
          part.style.setProperty("opacity", "1", "important");
          part.style.setProperty("transform", "none", "important");
          return;
        }

        window.setTimeout(() => {
          part.style.removeProperty("transform");
          part.style.setProperty("opacity", "1", "important");

          const animation = part.animate(scene.frames, {
            duration: scene.duration,
            easing: "cubic-bezier(0.18, 0.9, 0.18, 1)",
            fill: "both",
          });

          animation.addEventListener("finish", () => {
            part.style.setProperty("opacity", "1", "important");
            part.style.setProperty(
              "transform",
              "translate3d(0, 0, 0) rotate(0deg) scale(1)",
              "important"
            );
          });
        }, scene.delay);
      });

      const logoTextIds = [
        "canavese-c",
        "canavese-a1",
        "canavese-n",
        "canavese-a2",
        "canavese-v",
        "canavese-e1",
        "canavese-s",
        "canavese-e2",
        "comics-c",
        "comics-o",
        "comics-m",
        "comics-i",
        "comics-c2",
        "comics-s",
      ];

      const logoTextParts = logoTextIds
        .map((id) => svg.querySelector(`#${CSS.escape(id)}`))
        .filter(Boolean);

      logoTextParts.forEach((part) => {
        part.classList.add("loader-logo-letter");
        part.style.setProperty("opacity", "0", "important");
        part.style.setProperty("visibility", "visible", "important");
        part.style.setProperty("filter", "none", "important");
        part.style.setProperty("transform-box", "fill-box", "important");
        part.style.setProperty("transform-origin", "center", "important");
        part.style.setProperty(
          "transform",
          "translate3d(0, 42px, 0) scale(0.76) rotate(-1.5deg)",
          "important"
        );
        part.style.setProperty(
          "transition",
          "opacity 180ms ease, transform 420ms cubic-bezier(0.2, 1.45, 0.32, 1)",
          "important"
        );
        part.style.setProperty("animation", "none", "important");
      });

      window.setTimeout(() => {
        logoTextParts.forEach((part, index) => {
          window.setTimeout(() => {
            part.classList.add("is-letter-visible");
            part.style.setProperty("opacity", "1", "important");
            part.style.setProperty(
              "transform",
              "translate3d(0, 0, 0) scale(1) rotate(0deg)",
              "important"
            );
          }, index * 55);
        });
      }, 4050);
    })
    .catch(() => {
      logoMount.innerHTML = '<img src="assets/vectors/logo.svg" alt="" class="site-loader__logo">';
      logoMount.classList.add("is-loaded");
    });
})();


(() => {
  const loader = document.querySelector(".site-loader");
  if (!loader) return;

  const isHomePage = document.body.classList.contains("page-home");

  const cameFromExternalSite = (() => {
    if (!document.referrer) return true;

    try {
      return new URL(document.referrer).origin !== window.location.origin;
    } catch {
      return true;
    }
  })();

  if (!isHomePage || !cameFromExternalSite) {
    loader.remove();
    return;
  }

  const hideLoader = () => {
    window.setTimeout(() => {
      loader.classList.add("is-hidden");

      const removeLoader = (event) => {
        if (event.target !== loader) return;
        loader.removeEventListener("animationend", removeLoader);
        loader.remove();
      };

      loader.addEventListener("animationend", removeLoader);
    }, 6200);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }
})();
