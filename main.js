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


// Home feature cards: animate each SVG when it enters the viewport
const featureCards = document.querySelectorAll('.features-list .feature-card');

if (featureCards.length && 'IntersectionObserver' in window) {
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const card = entry.target;

      card.classList.remove('is-in-view');

      requestAnimationFrame(() => {
        card.classList.add('is-in-view');
      });
    });
  }, {
    threshold: 0.45,
    rootMargin: '0px 0px -12% 0px'
  });

  featureCards.forEach((card) => featureObserver.observe(card));
}


const homeFeatureCards = document.querySelectorAll('.features-list .feature-card');

if (homeFeatureCards.length && 'IntersectionObserver' in window) {
  const featureRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const card = entry.target;
      card.classList.add('is-in-view');

      card.addEventListener('animationend', () => {
        card.classList.add('has-revealed');
        card.classList.remove('is-in-view');
      }, { once: true });

      observer.unobserve(card);
    });
  }, {
    threshold: 0.36,
    rootMargin: '0px 0px -14% 0px'
  });

  homeFeatureCards.forEach((card) => featureRevealObserver.observe(card));
}




// Animated navbar active pill between pages
const desktopNav = document.querySelector('.desktop-nav');

if (desktopNav) {
  const navLinks = Array.from(desktopNav.querySelectorAll('a'));
  const currentPath = window.location.pathname === '/index.html' ? '/' : window.location.pathname;

  const normalizeHref = (href) => {
    const url = new URL(href, window.location.origin);
    return url.pathname === '/index.html' ? '/' : url.pathname;
  };

  const currentLink =
    navLinks.find((link) => normalizeHref(link.href) === currentPath) || navLinks[0];

  const shouldAnimateFromPrevious = sessionStorage.getItem('navPillShouldAnimate') === '1';
  const previousPath = sessionStorage.getItem('previousNavPath');

  const previousLink = shouldAnimateFromPrevious
    ? navLinks.find((link) => normalizeHref(link.href) === previousPath)
    : null;

  sessionStorage.removeItem('navPillShouldAnimate');
  sessionStorage.removeItem('previousNavPath');

  const setPillToLink = (link) => {
    if (!link) return;

    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    desktopNav.style.setProperty('--nav-pill-width', `${Math.round(linkRect.width)}px`);
    desktopNav.style.setProperty('--nav-pill-height', `${Math.round(linkRect.height)}px`);
    desktopNav.style.setProperty('--nav-pill-x', `${Math.round(linkRect.left - navRect.left)}px`);
    desktopNav.style.setProperty('--nav-pill-y', `${Math.round(linkRect.top - navRect.top)}px`);
  };

  const lockPillToCurrent = () => {
    desktopNav.classList.remove('nav-pill-animate');
    setPillToLink(currentLink);
    desktopNav.classList.add('nav-pill-ready');

    requestAnimationFrame(() => {
      desktopNav.classList.add('nav-pill-animate');
    });
  };

  const startPill = () => {
    desktopNav.classList.remove('nav-pill-animate');
    setPillToLink(previousLink || currentLink);
    desktopNav.classList.add('nav-pill-ready');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (previousLink && previousLink !== currentLink) {
          desktopNav.classList.add('nav-pill-animate');
          setPillToLink(currentLink);
        } else {
          setPillToLink(currentLink);
          desktopNav.classList.add('nav-pill-animate');
        }
      });
    });
  };

  startPill();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lockPillToCurrent);
  }

  window.addEventListener('load', lockPillToCurrent);

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const nextPath = normalizeHref(link.href);

      if (nextPath !== currentPath) {
        sessionStorage.setItem('previousNavPath', currentPath);
        sessionStorage.setItem('navPillShouldAnimate', '1');
      }
    });
  });

  window.addEventListener('resize', lockPillToCurrent);
}


// Home feature cards: let the click feedback finish before navigation
const homeFeatureLinks = document.querySelectorAll('.features-list .feature-card');

homeFeatureLinks.forEach((card) => {
  card.addEventListener('click', (event) => {
    const href = card.getAttribute('href');
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (!href || isModifiedClick || card.target === '_blank') return;

    event.preventDefault();
    card.classList.remove('is-clicking');

    requestAnimationFrame(() => {
      card.classList.add('is-clicking');
    });

    const goToPage = () => {
      window.location.href = href;
    };

    card.addEventListener('animationend', goToPage, { once: true });

    window.setTimeout(goToPage, 360);
  });
});


// CTA buttons: shine first, navigate after the effect
const shineCtaLinks = document.querySelectorAll('a.btn-primary, a.activity-btn');

shineCtaLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;

    if (!href || isModifiedClick || link.target === '_blank') return;

    event.preventDefault();
    link.classList.remove('is-shining');

    requestAnimationFrame(() => {
      link.classList.add('is-shining');
    });

    let hasNavigated = false;

    const goToPage = () => {
      if (hasNavigated) return;
      hasNavigated = true;
      window.location.href = href;
    };

    link.addEventListener(
      'animationend',
      (animationEvent) => {
        if (animationEvent.animationName === 'ctaButtonShineSweep') {
          goToPage();
        }
      },
      { once: true }
    );

    window.setTimeout(goToPage, 680);
  });
});
