# E-commerce Products API

Northline Market is a Next.js App Router storefront with a MongoDB product API, credentials-based accounts, a persistent browser cart, and server-priced orders.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to a reachable MongoDB database.
3. Set `ADMIN_EMAILS` to a comma-separated allowlist of administrator email addresses. Never accept roles from registration form data.
4. Set `PRODUCTS_ADMIN_API_KEY` to a randomly generated secret with at least 32 characters for server integrations; never expose it to a browser.
5. Generate `AUTH_SECRET` with `openssl rand -base64 32`; do not use the example placeholder.
6. Install dependencies with `npm install`.

## Commands

- `npm run dev` starts the development server.
- `npm run typecheck` checks TypeScript.
- `npm run lint` runs ESLint.
- `npm test` runs input-validation tests.
- `npm run seed` inserts or updates the 31 curated sample products by SKU. It requires a reachable `MONGODB_URI`.
- `npm test` checks product, account, and checkout validation.

## Product endpoints

- `GET /api/products` supports `page`, `limit`, `search`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `availability`, and `sort` query parameters.
- `GET /api/products/:id` retrieves one product.
- `POST /api/products` creates a product.
- `PUT /api/products/:id` updates a product.
- `DELETE /api/products/:id` deletes a product.
- `POST /api/auth/register` creates an account; Auth.js handles credential sign-in and sign-out.
- `GET /api/admin/settings` reads store settings; `PUT /api/admin/settings` updates them for administrators.
- `GET /api/orders` lists the signed-in user's recent orders.
- `POST /api/orders` validates a checkout, reserves stock, recalculates prices from MongoDB, and creates an idempotent order.

Write requests require the `x-admin-api-key` header. List and detail responses use a consistent JSON envelope; list responses also include pagination metadata. Category filters accept either a MongoDB ObjectId or a category slug.

Checkout records orders as `pending` with `unpaid` payment status. No payment details are collected; connect a payment provider and configure its secrets/webhooks before accepting live payments. Credentials accounts currently do not include email verification or password recovery; use an edge/WAF rate limit for additional protection against distributed login attempts. Cart data is stored in browser local storage, while the order API revalidates current database prices, selected variants, and stock before reserving inventory.

## Admin

The `/admin` dashboard, product/category managers, order fulfillment controls, and store settings require a signed-in email in `ADMIN_EMAILS`. Open `/admin/settings` to change store contact data, HTTPS/site-path logo, brand colors, display currency (without converting prices), flat shipping rate, optional free-shipping threshold, and flat tax percentage. Each settings section has its own save action and only updates that section. Shipping and tax settings apply to new orders, not orders already placed. Product and category managers support editing and deletion; a category with products must be emptied before it can be deleted. The order console can update fulfillment status and open a WhatsApp chat with the customer using their international phone number; only a verified payment webhook should change payment status. Seed the category documents along with sample products using `npm run seed`.
