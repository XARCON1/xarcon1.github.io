const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const themeToggleButton = document.querySelector('.theme-toggle');
const THEME_KEY = 'xarcon-theme';

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
  });
}

const updateThemeButton = (theme) => {
  if (!themeToggleButton) return;
  const isDark = theme === 'dark-mode';
  themeToggleButton.textContent = isDark ? '🌙' : '☀️';
  themeToggleButton.setAttribute('aria-label', isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  themeToggleButton.setAttribute('title', isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
};

const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark-mode' || savedTheme === 'light-mode') return savedTheme;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark-mode' : 'light-mode';
};

const applyTheme = (theme) => {
  document.body.classList.remove('dark-mode', 'light-mode');
  document.body.classList.add(theme);
  updateThemeButton(theme);
  updateChartColors();
};

const counters = document.querySelectorAll('[data-counter]');
if (counters.length) {
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.counter) || 0;
    const suffix = counter.dataset.suffix || '';
    const duration = 1400;
    let start = null;

    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = `${value.toLocaleString('es-NI')}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach((counter) => observer.observe(counter));
}

const filterButtons = document.querySelectorAll('[data-filter]');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterButtons.length && galleryItems.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      galleryItems.forEach((item) => {
        const visible = filter === 'all' || item.dataset.category === filter;
        item.style.display = visible ? 'block' : 'none';
      });
    });
  });
}

const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('figcaption');
  const closeButton = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-card img').forEach((image) => {
    image.addEventListener('click', () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = image.dataset.caption || image.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  closeButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}

const getChartTheme = () => {
  const styles = getComputedStyle(document.body);
  return {
    textColor: styles.getPropertyValue('--text').trim() || '#eef4ff',
    mutedColor: styles.getPropertyValue('--muted').trim() || '#b9c8df',
    gridColor: styles.getPropertyValue('--chart-grid').trim() || 'rgba(255,255,255,0.08)',
    cardColor: styles.getPropertyValue('--bg-card').trim() || '#111a2c'
  };
};

const charts = [];

const updateChartColors = () => {
  if (!charts.length) return;
  const theme = getChartTheme();
  charts.forEach((chart) => {
    if (chart.options?.plugins?.legend?.labels) {
      chart.options.plugins.legend.labels.color = theme.textColor;
    }

    if (chart.options?.scales) {
      Object.values(chart.options.scales).forEach((scale) => {
        if (scale.ticks) scale.ticks.color = theme.mutedColor;
        if (scale.grid) scale.grid.color = theme.gridColor;
      });
    }

    chart.data.datasets.forEach((dataset) => {
      if (dataset.borderColor === '#111a2c' || dataset.borderColor === '#eef3ff') {
        dataset.borderColor = theme.cardColor;
      }
    });

    chart.update();
  });
};

if (typeof window.Chart !== 'undefined') {
  const annualCtx = document.getElementById('annualGrowthChart');
  const theme = getChartTheme();
  if (annualCtx) {
    const annualChart = new Chart(annualCtx, {
      type: 'bar',
      data: {
        labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [{
          label: 'Proyectos ejecutados',
          data: [8, 11, 15, 18, 22, 27],
          borderRadius: 8,
          backgroundColor: '#2dc0ff'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: theme.textColor } } },
        scales: {
          x: { ticks: { color: theme.mutedColor }, grid: { color: theme.gridColor } },
          y: { beginAtZero: true, ticks: { color: theme.mutedColor }, grid: { color: theme.gridColor } }
        }
      }
    });
    charts.push(annualChart);
  }

  const servicesCtx = document.getElementById('serviceDistributionChart');
  if (servicesCtx) {
    const serviceChart = new Chart(servicesCtx, {
      type: 'doughnut',
      data: {
        labels: ['Arquitectura', 'Ingeniería', 'Construcción', 'Presupuesto'],
        datasets: [{
          data: [30, 25, 30, 15],
          backgroundColor: ['#2dc0ff', '#f7b733', '#49de9f', '#7f8cff'],
          borderColor: theme.cardColor,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: theme.textColor }
          }
        }
      }
    });
    charts.push(serviceChart);
  }
}


if (themeToggleButton) {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  themeToggleButton.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

window.calc = (type) => {
  const length = parseFloat(document.getElementById(`l${type}`)?.value) || 0;
  const width = parseFloat(document.getElementById(`a${type}`)?.value) || 0;
  const height = parseFloat(document.getElementById(`h${type}`)?.value) || 0;
  const result = length * width * height;
  const resultNode = document.getElementById(`r${type}`);

  if (resultNode) {
    resultNode.textContent = result > 0
      ? `Volumen estimado: ${result.toFixed(2)} m³`
      : 'Ingresa valores válidos para calcular.';
  }
};
