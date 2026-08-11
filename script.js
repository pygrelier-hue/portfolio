// Builds the project list from the PROJECTS list defined in projects.js.
// To add/edit a project: edit projects.js, no code knowledge required.
// See README.md for the exact format.
// Single-page site (index.html): About category preview, Work grid + filter
// pills + lightbox — every function checks the DOM elements it needs exist
// before doing anything.

let currentLang = localStorage.getItem('pyg-lang') === 'fr' ? 'fr' : 'en';

if (document.getElementById('project-grid')) {
  renderProjects(PROJECTS);
  initLightbox();
  initWorkFilterPills();
}

if (document.querySelector('.reel')) {
  initReelParallax();
}

if (document.getElementById('category-pills')) {
  initCategoryPreview();
}

if (document.getElementById('contact-form')) {
  initContactForm();
}

initLangToggle();
applyTranslations();

initScrollReveal();

// ---------- Language toggle (EN / FR) ----------
// Translation strings live in i18n.js (I18N.en / I18N.fr). Static markup is
// tagged with data-i18n / data-i18n-placeholder; dynamically-built content
// (category pills, lightbox category, "See all" button) is re-labeled in
// refreshDynamicLabels() since it isn't in the DOM at page-load time.
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function categoryLabel(name) {
  return t(`category.${name}`);
}

function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === currentLang) return;
      currentLang = btn.dataset.lang;
      localStorage.setItem('pyg-lang', currentLang);
      applyTranslations();
    });
  });
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('.lang-toggle').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === currentLang);
  });

  refreshDynamicLabels();
}

function refreshDynamicLabels() {
  document.querySelectorAll('.category-pill').forEach(setPillLabel);

  document.querySelectorAll('.category-preview-more').forEach((btn) => {
    btn.textContent = t('work.seeAll');
  });

  const lightboxCategory = document.querySelector('.lightbox-category');
  if (lightboxCategory && lightboxCategory.dataset.category) {
    lightboxCategory.textContent = categoryLabel(lightboxCategory.dataset.category);
  }

  document.querySelectorAll('.project-card[data-title]').forEach((card) => {
    card.setAttribute('aria-label', `${t('work.previewAria')} ${card.dataset.title}`);
  });
  document.querySelectorAll('.preview-thumb[data-title]').forEach((thumb) => {
    thumb.setAttribute('aria-label', `${t('work.openAria')} ${thumb.dataset.title}`);
  });
}

function setPillLabel(pill) {
  const cat = pill.dataset.category;
  if (cat === undefined) return;
  const label = cat === 'all' ? t('work.all') : categoryLabel(cat);
  pill.innerHTML = `${escapeHtml(label)}<span class="count">${pill.dataset.count || ''}</span>`;
}

// ---------- Contact form (opens the visitor's email app, pre-filled) ----------
// The site is static (no server), so submissions can't be processed directly —
// this builds a mailto: link from the form fields instead.
function initContactForm() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const subject = encodeURIComponent(`New project inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:pygrelier@icloud.com?subject=${subject}&body=${body}`;
  });
}

// ---------- Scroll reveal (About / Work / Contact fade up into view) ----------
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  targets.forEach((el) => observer.observe(el));
}

// ---------- Reel parallax (index.html hero banner) ----------
// The video moves slightly slower than the page scroll, giving it a
// sense of depth instead of scrolling 1:1 with the rest of the content.
// The title lags even more, so it visibly slides down and fades away
// as you start scrolling into the page.
function initReelParallax() {
  const reel = document.querySelector('.reel');
  const video = document.querySelector('.reel-video');
  const overlay = document.querySelector('.reel-overlay');
  if (!reel || !video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const speed = 0.3;
  const titleSpeed = 0.55;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    video.style.transform = `translateY(${y * speed}px)`;
    if (overlay) {
      const shift = y * titleSpeed;
      overlay.style.transform = `translateY(${shift}px)`;
      overlay.style.opacity = Math.max(0, 1 - shift / (reel.offsetHeight * 0.6));
    }
    ticking = false;
  }

  update();

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

// Work grid is one flat mosaic (no category headings) so thumbnails stay
// large and there's no leftover empty space from a half-filled row.
function renderProjects(projects) {
  const grid = document.getElementById('project-grid');
  grid.innerHTML = '';

  const sectionGrid = document.createElement('div');
  sectionGrid.className = 'work-section-grid';
  projects.forEach((project, index) => sectionGrid.appendChild(buildProjectCard(project, index)));
  grid.appendChild(sectionGrid);
}

function buildProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.index = index;
  card.dataset.category = project.category || '';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.title = project.title || 'project';
  card.setAttribute('aria-label', `${t('work.previewAria')} ${card.dataset.title}`);

  const focus = project.focus || '50% 50%';

  if (project.video) {
    const video = document.createElement('video');
    video.src = project.video;
    video.poster = project.image || '';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.objectPosition = focus;
    video.onerror = () => {
      video.remove();
      if (project.image) {
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title || '';
        img.style.objectPosition = focus;
        card.appendChild(img);
      } else {
        card.appendChild(buildPlaceholder());
      }
    };
    card.appendChild(video);

    card.addEventListener('mouseenter', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
    // On touch devices, tap plays/pauses in place.
    card.addEventListener('touchstart', () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    }, { passive: true });
  } else if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title || '';
    img.style.objectPosition = focus;
    img.onerror = () => {
      img.remove();
      card.appendChild(buildPlaceholder(project.image));
    };
    card.appendChild(img);
  } else {
    card.appendChild(buildPlaceholder());
  }

  const overlay = document.createElement('div');
  overlay.className = 'project-overlay';
  overlay.innerHTML = `<div class="p-title">${escapeHtml(project.title || 'Untitled')}</div>`;
  card.appendChild(overlay);

  // Click (or Enter/Space) opens the lightbox preview.
  card.addEventListener('click', () => openLightbox(project));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(project);
    }
  });

  return card;
}

function buildPlaceholder(path) {
  const div = document.createElement('div');
  div.className = 'project-placeholder';
  div.textContent = path
    ? `Missing image: ${path}`
    : 'Add an image in projects.json';
  return div;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getCategories() {
  const counts = new Map();
  PROJECTS.forEach((p) => {
    if (!p.category) return;
    counts.set(p.category, (counts.get(p.category) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}

// ---------- Category preview (About → Filming block) ----------
// Clicking a category pill reveals an animated strip of thumbnails for that
// category right there, no page jump, no dropdown. Clicking a thumbnail
// scrolls down to that project's card in the Work section and opens its
// preview, since About and Work now live on the same page.
function initCategoryPreview() {
  const pillsWrap = document.getElementById('category-pills');
  const preview = document.getElementById('category-preview');
  const track = document.getElementById('category-preview-track');
  if (!pillsWrap || !preview || !track) return;

  const categories = getCategories();
  let activeCategory = null;

  categories.forEach(({ name, count }) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'category-pill';
    pill.dataset.category = name;
    pill.dataset.count = count;
    pill.setAttribute('aria-pressed', 'false');
    setPillLabel(pill);

    pill.addEventListener('click', () => {
      if (activeCategory === name) {
        // Toggle closed.
        activeCategory = null;
        preview.classList.remove('is-open');
        pillsWrap.querySelectorAll('.category-pill').forEach((p) => {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
        });
        return;
      }

      activeCategory = name;
      pillsWrap.querySelectorAll('.category-pill').forEach((p) => {
        p.classList.remove('is-active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-pressed', 'true');

      track.innerHTML = '';
      const matches = PROJECTS
        .map((project, index) => ({ project, index }))
        .filter(({ project }) => project.category === name);

      matches.forEach(({ project, index }) => track.appendChild(buildPreviewThumb(project, index)));

      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'category-preview-more';
      more.textContent = t('work.seeAll');
      more.addEventListener('click', () => {
        const pill = document.querySelector(`#work-filter-pills .category-pill[data-category="${CSS.escape(name)}"]`);
        if (pill) pill.click();
        document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
      });
      track.appendChild(more);

      preview.classList.add('is-open');
    });

    pillsWrap.appendChild(pill);
  });
}

function buildPreviewThumb(project, index) {
  const thumb = document.createElement('div');
  thumb.className = 'preview-thumb';
  thumb.tabIndex = 0;
  thumb.setAttribute('role', 'button');
  thumb.dataset.title = project.title || 'project';
  thumb.setAttribute('aria-label', `${t('work.openAria')} ${thumb.dataset.title}`);

  const openProject = () => {
    const card = document.querySelector(`#project-grid .project-card[data-index="${index}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    openLightbox(project);
  };
  thumb.addEventListener('click', openProject);
  thumb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProject();
    }
  });

  const focus = project.focus || '50% 50%';

  if (project.video) {
    const video = document.createElement('video');
    video.src = project.video;
    video.poster = project.image || '';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.style.objectPosition = focus;
    thumb.appendChild(video);
    thumb.addEventListener('mouseenter', () => { video.currentTime = 0; video.play().catch(() => {}); });
    thumb.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  } else if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title || '';
    img.style.objectPosition = focus;
    thumb.appendChild(img);
  }

  const title = document.createElement('div');
  title.className = 'pt-title';
  title.textContent = project.title || '';
  thumb.appendChild(title);

  return thumb;
}

// ---------- Work filter pills (index.html) ----------
// Same pill styling as the About preview, but here clicking a pill filters
// the Work grid in place (fade transition) instead of opening a strip.
function initWorkFilterPills() {
  const wrap = document.getElementById('work-filter-pills');
  if (!wrap) return;

  const categories = getCategories();
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');

  const allPill = document.createElement('button');
  allPill.type = 'button';
  allPill.className = 'category-pill';
  allPill.dataset.category = 'all';
  allPill.dataset.count = PROJECTS.length;
  setPillLabel(allPill);
  wrap.appendChild(allPill);

  const pillsByName = { all: allPill };

  categories.forEach(({ name, count }) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'category-pill';
    pill.dataset.category = name;
    pill.dataset.count = count;
    setPillLabel(pill);
    pill.addEventListener('click', () => applyWorkFilter(name));
    wrap.appendChild(pill);
    pillsByName[name] = pill;
  });

  allPill.addEventListener('click', () => applyWorkFilter('all'));

  function applyWorkFilter(name) {
    Object.values(pillsByName).forEach((p) => p.classList.remove('is-active'));
    (pillsByName[name] || allPill).classList.add('is-active');

    document.querySelectorAll('#project-grid .project-card').forEach((card) => {
      const match = name === 'all' || card.dataset.category === name;
      card.classList.toggle('is-filtered-out', !match);
    });

    const url = new URL(window.location.href);
    if (name === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', name);
    }
    window.history.replaceState({}, '', url);
  }

  if (initialCategory && pillsByName[initialCategory]) {
    applyWorkFilter(initialCategory);
  } else {
    applyWorkFilter('all');
  }
}

// ---------- Lightbox: enlarges the clicked project on click ----------
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const backdrop = lightbox.querySelector('.lightbox-backdrop');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// Extracts the video ID from a youtube.com/shorts/, youtu.be/ or
// youtube.com/watch?v= URL so it can be embedded instead of linked out to.
function youtubeId(url) {
  const match = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  return match ? match[1] : null;
}

function renderLightboxMashup(project) {
  const media = document.querySelector('.lightbox-media');
  media.innerHTML = '';

  if (project.video) {
    const video = document.createElement('video');
    video.src = project.wideVideo || project.video;
    video.poster = project.image || '';
    video.controls = true;
    video.autoplay = true;
    video.muted = false;
    video.playsInline = true;
    media.appendChild(video);
  } else if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title || '';
    media.appendChild(img);
  }
}

// Sizes the embed as landscape or portrait to match the actual video,
// instead of forcing every embed into one fixed shape. A quick heuristic
// (shorts URLs are vertical) avoids a layout jump while the real
// dimensions load from the oEmbed API, which then corrects it if needed.
function renderLightboxYoutube(id, sourceUrl) {
  const media = document.querySelector('.lightbox-media');
  media.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.className = 'lightbox-youtube';
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.setAttribute('frameborder', '0');

  const looksVertical = sourceUrl && sourceUrl.includes('/shorts/');
  iframe.classList.add(looksVertical ? 'is-portrait' : 'is-landscape');

  media.appendChild(iframe);

  fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`)
    .then((res) => res.json())
    .then((data) => {
      if (!data.width || !data.height || !media.contains(iframe)) return;
      const isPortrait = data.height > data.width;
      iframe.classList.toggle('is-portrait', isPortrait);
      iframe.classList.toggle('is-landscape', !isPortrait);
      iframe.style.aspectRatio = `${data.width} / ${data.height}`;
    })
    .catch(() => {});
}

function openLightbox(project) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const title = lightbox.querySelector('.lightbox-title');
  const category = lightbox.querySelector('.lightbox-category');
  const link = lightbox.querySelector('.lightbox-link');
  const linksList = lightbox.querySelector('.lightbox-links');

  title.textContent = project.title || 'Untitled';
  category.dataset.category = project.category || '';
  category.textContent = project.category ? categoryLabel(project.category) : '';

  if (project.links && project.links.length) {
    link.hidden = true;
    linksList.innerHTML = '';
    linksList.hidden = false;

    const setActive = (btn) => {
      linksList.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    };

    let firstPlayable = null;

    project.links.forEach((entry, i) => {
      const url = entry.url || entry;
      const label = entry.title || url;
      const id = youtubeId(url);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lightbox-link-pill';
      btn.dataset.index = i;

      if (id) {
        const thumb = document.createElement('img');
        thumb.className = 'lightbox-link-thumb';
        thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        thumb.alt = '';
        thumb.loading = 'lazy';
        btn.appendChild(thumb);
      }

      const span = document.createElement('span');
      span.textContent = label;
      btn.appendChild(span);

      btn.addEventListener('click', () => {
        if (id) {
          renderLightboxYoutube(id, url);
        } else {
          window.open(url, '_blank', 'noopener');
          return;
        }
        setActive(btn);
      });
      linksList.appendChild(btn);

      if (!firstPlayable && id) firstPlayable = btn;
    });

    // Play the first video right away instead of showing the local
    // preview clip again — the visitor already saw that on the thumbnail.
    if (firstPlayable) {
      firstPlayable.click();
    } else {
      renderLightboxMashup(project);
    }
  } else if (project.link) {
    linksList.hidden = true;
    linksList.innerHTML = '';
    link.onclick = null;

    const linkId = youtubeId(project.link);
    if (linkId) {
      link.hidden = true;
      renderLightboxYoutube(linkId, project.link);
    } else {
      link.hidden = false;
      link.onclick = () => window.open(project.link, '_blank', 'noopener');
      renderLightboxMashup(project);
    }
  } else {
    linksList.hidden = true;
    linksList.innerHTML = '';
    link.hidden = true;
    link.onclick = null;
    renderLightboxMashup(project);
  }

  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Stop any playing video once the fade-out finishes.
  setTimeout(() => {
    const media = lightbox.querySelector('.lightbox-media');
    media.innerHTML = '';
  }, 250);
}
