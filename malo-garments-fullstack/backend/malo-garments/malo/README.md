# Malo Garments — E-Commerce Website

A complete, fully functional e-commerce website for **Malo Garments**, a women's
fashion & intimate apparel brand. Built with pure **HTML, CSS, and vanilla
JavaScript** — no frameworks, no build step. All data (products, cart, users,
orders, categories) is stored in the browser's **localStorage**, acting as a
mock database.

---

## 🚀 How to Run the Project

This is a static site, so no server-side setup is required.

**Option 1 — Just open it**
Double-click `index.html` to open it directly in your browser.
*(Note: some browsers restrict `fetch`/localStorage on the `file://`
protocol. If anything looks broken, use Option 2 instead.)*

**Option 2 — Local server (recommended)**
From the project's root folder, run one of:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# VS Code
Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

On first load, the site automatically seeds `localStorage` with 24 demo
products, 3 categories, and admin credentials (see `js/data.js`).

---

## 🔑 Demo Credentials

| Panel | Username / Email | Password |
|---|---|---|
| **Admin Panel** (`/admin`) | `admin` | `admin123` |
| **Customer Account** | *Sign up first* — no pre-seeded customer accounts exist. Use the Sign Up tab on the Login page. | — |

---

## 📁 Folder Structure

```
malo-garments/
├── index.html                  # Home page
├── README.md
│
├── css/
│   ├── style.css                # Global variables, navbar, footer, buttons, forms, product cards
│   ├── home.css                 # Home page (hero slider, categories, sale banner, testimonials)
│   ├── shop.css                 # Shop/listing page (filters sidebar, toolbar)
│   ├── product.css              # Product detail page (gallery, options, tabs)
│   ├── cart.css                 # Cart, checkout & order confirmation
│   ├── auth.css                 # Login, signup & account page
│   └── pages.css                # About Us & Contact Us pages
│
├── js/
│   ├── data.js                   # Seed data: products, categories, admin credentials
│   ├── store.js                  # MaloStore — the data layer (all localStorage CRUD)
│   ├── app.js                    # MaloApp — shared navbar/footer/toast/product-card logic
│   ├── home.js                   # Home page logic (hero slider, featured products)
│   ├── shop.js                   # Shop page logic (filter, sort, search, pagination)
│   ├── product.js                # Product detail page logic
│   ├── cart.js                   # Cart page logic
│   ├── checkout.js               # Checkout page logic + validation
│   ├── login.js                  # Login/signup logic + validation
│   ├── account.js                # Account page (orders, addresses, profile)
│   └── contact.js                # Contact form validation
│
├── pages/
│   ├── shop.html                 # Shop / product listing (also used for category & sale pages
│   │                              #   via ?category=cat-1 / ?category=cat-2 / ?sale=true)
│   ├── product.html               # Product detail page (?id=prod-001)
│   ├── cart.html
│   ├── checkout.html
│   ├── order-confirmation.html   # (?id=ORD-xxxx)
│   ├── login.html                 # Login + Sign Up (tabbed)
│   ├── account.html               # Order history, addresses, profile
│   ├── about.html
│   └── contact.html
│
├── admin/
│   ├── index.html                 # Admin login
│   ├── dashboard.html             # Stats + charts (Chart.js) + recent orders
│   ├── products.html              # Product CRUD (table + modal form)
│   ├── categories.html            # Category CRUD
│   ├── orders.html                # Order list, status updates, detail modal
│   ├── customers.html             # Registered customers + order history
│   ├── css/admin.css
│   └── js/
│       ├── admin-common.js        # Auth guard + sidebar/topbar rendering
│       ├── dashboard.js
│       ├── products.js
│       ├── categories.js
│       ├── orders.js
│       └── customers.js
│
└── images/                        # (empty — all images are hotlinked from Unsplash)
```

---

## ✨ Features

### Customer-Facing Store
- **Home page** — auto-playing hero slider, category highlights, new arrivals,
  sale banner, testimonials, newsletter signup.
- **Shop page** — grid listing with sidebar filters (category, subcategory,
  price range, size, color, on-sale), sorting (price, newest, name, rating),
  and a "Load More" button. Category pages ("Ladies Garments" /
  "Undergarments") and the Sale page are just filtered views of this same
  page via URL parameters, so filters and links always stay in sync.
- **Product detail page** — image gallery with thumbnails, size/color
  selection, quantity stepper, live stock status, Add to Cart / Buy Now,
  tabbed Description / Size Chart / Shipping / Reviews, and related products.
- **Cart page** — update quantity, remove items, live subtotal/shipping/total,
  empty-cart state.
- **Checkout page** — shipping details form, Cash on Delivery or Card (demo)
  payment method, live order summary, full client-side validation.
- **Order confirmation page** — order ID, itemized summary, shipping & payment
  recap.
- **Login / Signup** — tabbed auth form, email format validation, password
  strength meter, duplicate-email detection.
- **Account page** — order history with status badges, saved addresses
  (add new), editable profile, logout.
- **About Us** — brand story, values, stats.
- **Contact Us** — contact form with validation, store info, embedded map.
- **Sticky navbar** with live cart item-count badge, mobile menu, and a
  search overlay that searches product name & description.
- **Toast notifications** for every cart/account/admin action.
- **Fully responsive** across mobile, tablet, and desktop breakpoints.

### Admin Panel (`/admin`)
- **Login** — separate auth from customer accounts, session persisted via
  `localStorage`; every admin page is guarded and redirects to the login
  page if not authenticated.
- **Dashboard** — total revenue / orders / products / customers stat cards,
  a 6-month revenue line chart and a category-breakdown doughnut chart
  (both via Chart.js, loaded from CDN), and a recent-orders table.
- **Product management** — searchable/filterable table; a modal form to
  add or edit a product's name, price, original price (for sale badges),
  category/subcategory, description, sizes, multiple colors (name + hex
  swatch), multiple image URLs, stock, featured flag, and on-sale flag.
  Deleting a product asks for confirmation.
- **Category management** — add/edit/delete categories with an image and a
  comma-separated list of subcategories. A category in use by products
  can't be deleted until those products are reassigned.
- **Order management** — searchable/filterable table, inline status dropdown
  (Pending → Processing → Shipped → Delivered / Cancelled) that updates
  instantly, and a detail modal with the full customer, shipping, and
  itemized breakdown.
- **Customer management** — table of everyone who has signed up, with
  order count and lifetime spend, and a detail modal showing their full
  order history and saved addresses.

---

## 🗄️ Where the Data Lives

Everything is stored client-side in **`localStorage`**, under these keys
(see `js/store.js` → `KEYS`):

| Key | Contents |
|---|---|
| `malo_products` | All product records (seeded from `js/data.js`, then editable via the admin panel) |
| `malo_categories` | All categories & subcategories |
| `malo_cart` | The current visitor's cart |
| `malo_users` | Registered customer accounts (passwords stored in plain text — **demo only**, see note below) |
| `malo_orders` | All placed orders |
| `malo_current_user` | The logged-in customer's session (no password) |
| `malo_admin_auth` | `"true"` while an admin session is active |
| `malo_newsletter` | Newsletter signup emails |
| `malo_initialized` | Flag so seed data is only written once |

Because this is `localStorage`, data is:
- **Per-browser** — clearing browser data or opening the site in a different
  browser/incognito window starts fresh.
- **Not synced** between customer and admin views unless they're the *same*
  browser (this is expected for a demo without a real backend).

To wipe everything and reseed, run `MaloStore.resetAll()` in the browser
console, or clear the site's storage from DevTools.

---

## ⚠️ Demo / Production Notes

This project fulfills the brief's request to use **localStorage as a mock
database** for a fully client-side demo. Before using it as a real store,
you would want to:

- Replace `localStorage` with a real backend (e.g. Node/Express + a database)
  and move `store.js`'s logic into API calls.
- **Hash passwords** — they're currently stored in plain text for demo
  simplicity.
- Move the hardcoded admin credentials out of client-side JS.
- Integrate a real payment gateway (the current "Card" option is a visual
  demo only — no transaction is processed).
- Replace the Unsplash-hotlinked product images with your own hosted photos.

---

## 🎨 Design System

- **Fonts:** Playfair Display (headings) + Poppins (body) via Google Fonts.
- **Colors:** blush pink, cream, beige, rose, and dark charcoal — defined as
  CSS custom properties in `css/style.css` (`:root`), so the whole site's
  palette can be restyled from one place.
- **Components:** buttons, form fields, product cards, toasts, and the
  breadcrumb/page-header are shared across every page via `style.css`.

---

Built step by step: home → shop → product detail → cart → checkout →
order confirmation → login/signup → account → about/contact → admin panel.
