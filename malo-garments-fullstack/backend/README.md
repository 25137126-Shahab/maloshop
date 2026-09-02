# Malo Garments — Backend (Node.js + Express + MySQL)

Yeh backend aapki `malo` frontend site ke liye hai. Pehle sab kuch `localStorage`
me tha, ab yeh real MySQL database ke sath REST API provide karta hai.

## 1. Install requirements

- Node.js (v18+ recommended)
- MySQL server (locally installed, ya XAMPP/WAMP wala MySQL bhi chalega)

## 2. Setup

```bash
cd backend
npm install
```

`.env.example` ko copy kar ke `.env` banayein aur apni MySQL details daalein:

```bash
cp .env.example .env
```

`.env` file open kar ke `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_JWT_SECRET`
apne hisaab se set karein.

## 3. Database create karein

```bash
mysql -u root -p < db/schema.sql
```

Yeh `malo_garments` database aur saari tables (products, categories, users,
orders, admin_users, waghera) bana dega.

## 4. Demo data seed karein (optional but recommended)

Aapki purani `js/data.js` wali 24 demo products, 3 categories aur admin
account (`admin` / `admin123`) ko database me daalne ke liye:

```bash
npm run seed
```

## 5. Server start karein

```bash
npm start
```

Ya development ke dauran auto-restart k liye:

```bash
npm run dev
```

Server `http://localhost:5000` par chalega. Check karein:
`http://localhost:5000/api/health` → `{ "status": "ok" }`

## 6. API Overview

| Method | Route | Kaam |
|---|---|---|
| GET | `/api/products` | List/filter/search products (`?category=&sort=&q=` etc.) |
| GET | `/api/products/:id` | Single product |
| POST/PUT/DELETE | `/api/products/:id` | Admin: create/update/delete (needs admin token) |
| GET | `/api/categories` | List categories + subcategories |
| POST/PUT/DELETE | `/api/categories/:id` | Admin: category CRUD |
| POST | `/api/auth/register` | Customer signup |
| POST | `/api/auth/login` | Customer login → returns JWT `token` |
| GET/PUT | `/api/auth/me` | Logged-in customer profile (`Authorization: Bearer <token>`) |
| POST | `/api/auth/me/addresses` | Add saved address |
| POST | `/api/orders` | Place order / checkout (works for guest or logged-in) |
| GET | `/api/orders/mine` | Logged-in customer's own orders |
| GET | `/api/orders/:id` | Order confirmation lookup |
| PATCH | `/api/orders/:id/status` | Admin: update order status |
| POST | `/api/admin/login` | Admin login → returns admin JWT |
| GET | `/api/admin/customers` | Admin: customer list with order stats |
| GET | `/api/admin/stats` | Admin: dashboard numbers/charts data |
| POST | `/api/newsletter` | Newsletter signup |

Admin routes `Authorization: Bearer <admin_token>` header maangte hain, jo
`/api/admin/login` se milta hai. Customer routes `/api/auth/login` wala token
use karte hain.

## 7. Frontend ko backend se connect karna (agla step)

Abhi frontend ki `js/store.js` file `localStorage` use karti hai. Ise API
calls (`fetch('http://localhost:5000/api/...')`) me convert karna hoga —
har function (getProducts, saveProduct, loginUser, placeOrder, waghera) ko
corresponding endpoint call karna hoga aur customer/admin token ko
localStorage me save kar ke har request ke sath bhejna hoga.

Agar chahein to yeh agla step bhi kara sakta hoon — `store.js` ko poora
rewrite kar ke isi backend se live connect kar dena, taake pura site
(shop, cart, checkout, admin panel) real MySQL data ke sath kaam kare.
