// Builds the project list from the PROJECTS list defined in projects.js.
// To add/edit a project: edit projects.js, no code knowledge required.
// See README.md for the exact format.
// Single-page site (index.html): About category preview, Work grid + filter
// pills + lightbox — every function checks the DOM elements it needs exist
// before doing anything.

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

initScrollReveal();

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
  card.setAttribute('aria-label', `Preview ${project.title || 'project'}`);

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
    pill.setAttribute('aria-pressed', 'false');
    pill.innerHTML = `${escapeHtml(name)}<span class="count">${count}</span>`;

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
      more.textContent = 'See all in Work ↗';
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
  thumb.setAttribute('aria-label', `Open ${project.title || 'project'}`);

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
  allPill.innerHTML = `All<span class="count">${PROJECTS.length}</span>`;
  wrap.appendChild(allPill);

  const pillsByName = { all: allPill };

  categories.forEach(({ name, count }) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'category-pill';
    pill.dataset.category = name;
    pill.innerHTML = `${escapeHtml(name)}<span class="count">${count}</span>`;
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

function openLightbox(project) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const media = lightbox.querySelector('.lightbox-media');
  const title = lightbox.querySelector('.lightbox-title');
  const category = lightbox.querySelector('.lightbox-category');
  const link = lightbox.querySelector('.lightbox-link');

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

  title.textContent = project.title || 'Untitled';
  category.textContent = project.category || '';

  if (project.link) {
    link.href = project.link;
    link.hidden = false;
  } else {
    link.hidden = true;
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
