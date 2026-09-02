/**
 * Malo Garments — Home Page Logic
 * Hero slider, featured products rendering, and home page interactions.
 */

document.addEventListener('DOMContentLoaded', async () => {
  MaloApp.initPage();
  initHeroSlider();
  await renderCategoryHighlights();
  await renderNewArrivals();
  await renderOnSaleProducts();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('main-navbar');
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});

// ─── Hero Slider ───
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(i);
      startAutoPlay();
    });
  });

  startAutoPlay();
}

// ─── Category Highlights ───
async function renderCategoryHighlights() {
  const container = document.getElementById('categoryGrid');
  if (!container) return;

  const categories = await MaloStore.getCategories();
  container.innerHTML = categories.map(cat => `
    <a href="./pages/shop.html?category=${cat.id}" class="category-card animate-on-scroll">
      <img src="${cat.image}" alt="${cat.name}" class="category-card-image" loading="lazy" />
      <div class="category-card-overlay">
        <h3 class="category-card-name">${cat.name}</h3>
        <span class="category-card-cta">Shop Now →</span>
      </div>
    </a>
  `).join('');

  MaloApp.initScrollAnimations();
}

// ─── New Arrivals ───
async function renderNewArrivals() {
  const container = document.getElementById('newArrivalsGrid');
  if (!container) return;

  const products = (await MaloStore.filterProducts({ sort: 'newest' })).slice(0, 8);
  container.innerHTML = products.map(p => MaloApp.createProductCard(p)).join('');

  MaloApp.initScrollAnimations();
}

// ─── On Sale Products (for sale banner section) ───
async function renderOnSaleProducts() {
  const container = document.getElementById('saleProductsGrid');
  if (!container) return;

  const products = (await MaloStore.filterProducts({ onSale: true })).slice(0, 4);
  container.innerHTML = products.map(p => MaloApp.createProductCard(p)).join('');
}
