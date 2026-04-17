# ⚔️ WarForge

A full-stack online shop web application for **Warhammer 40K miniatures**, built with **Node.js + Express** on the backend and **vanilla HTML/CSS/JS** on the frontend, using **SQLite** (via sql.js) as the database. Features a dark, grimdark theme fitting the 41st Millennium.

---

## Features

- **Miniature catalogue** with search and faction filtering
- **Miniature detail** page
- **Shopping cart** (add, update quantity, remove, clear)
- **Checkout** with shipping details and atomic order placement
- **Order history** ("Requisitions") for logged-in customers
- **User authentication** (register, login, logout, session-based)
- **Command Centre** (admin panel) with:
  - Dashboard (stats + recent orders)
  - Product management (create, edit, delete miniatures)
  - Order management (view all orders, update status)
  - User management (view users, promote/demote to admin)
  - Faction management (create, delete factions)

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js, Express                  |
| Database   | SQLite via [sql.js](https://sql.js.org) (no native build required) |
| Auth       | express-session, bcrypt           |
| Frontend   | HTML5, plain CSS, vanilla JS      |
| Testing    | Playwright (E2E), Selenium (E2E)  |
| CI/CD      | GitHub Actions                    |
| Versioning | Semantic Versioning (automated)   |

---

## Project Structure

```
Cartify/
├── backend/
│   ├── server.js          # Express entry point
│   ├── db.js              # Database init & query helpers
│   ├── seed.js            # Seeds sample products & users
│   └── routes/
│       ├── auth.js        # POST /api/auth/register|login|logout, GET /api/auth/me
│       ├── products.js    # GET|POST /api/products, PUT|DELETE /api/products/:id
│       ├── cart.js        # GET|POST /api/cart, DELETE /api/cart/:productId
│       ├── orders.js      # POST /api/orders, GET /api/orders/my|/
│       └── admin.js       # GET /api/admin/stats|users|categories
├── frontend/
│   ├── index.html         # Product listing
│   ├── product.html       # Product detail
│   ├── cart.html          # Shopping cart
│   ├── checkout.html      # Checkout form
│   ├── orders.html        # My orders
│   ├── login.html
│   ├── register.html
│   ├── admin.html         # Admin panel
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── auth-common.js # Session check + cart badge (runs on all pages)
│       ├── index.js
│       ├── product.js
│       ├── cart.js
│       ├── checkout.js
│       ├── orders.js
│       ├── login.js
│       ├── register.js
│       └── admin.js
├── tests/
│   ├── playwright/
│   └── selenium/
│       ├── auth.test.js # User authentication tests
│       └── helpers.js # Helper functions for tests implemented with Selenium
├── .github/
│   ├── branch-lint.config
│   └── workflows/
│       ├── ci.yml             # Lint + test pipeline
│       └── version-bump.yml   # Semantic version bump on merge
├── commitlint.config.js
├── playwright.config.js
├── shop.db                    # SQLite database file (auto-created on first run)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or newer

### VS Code Setup

This project includes recommended extensions in `.vscode/extensions.json`.  
When you open the project in VS Code, you'll be prompted to install them.

| Extension | Purpose |
|-----------|---------|
| Jest | Unit test explorer integration |
| Jest / Vitest Runner | Inline test run/debug buttons |
| Mocha for VS Code | Selenium test explorer integration |
| Playwright Test | E2E test explorer integration |
| ESLint | JavaScript linting |
| REST Client | Test API endpoints from `.http` files |
| DotENV | `.env` file syntax highlighting |
| Prettier | Code formatting |

### 1. Install dependencies

```bash
npm install
```

### 2. Seed the database

Populates the database with sample factions (Space Marines, Chaos, Aeldari, Orks, Necrons, etc.), Warhammer 40K miniature products, an admin account, and a demo customer account.

```bash
npm run seed
```

### 3. Start the server

```bash
npm start
```

The app will be available at **http://localhost:3000**.

To stop the server press **Ctrl+C** in the terminal.

### Development (auto-restart on file changes)

```bash
npm run dev
```

---

## Default Accounts

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | `admin@warforge.com`   | `admin123`    |
| Customer | `cassius@example.com`  | `customer123` |

> ⚠️ Change these credentials before deploying to production.

---

## API Reference

### Auth
| Method | Endpoint              | Description          | Auth required |
|--------|-----------------------|----------------------|---------------|
| POST   | `/api/auth/register`  | Register new user    | No            |
| POST   | `/api/auth/login`     | Login                | No            |
| POST   | `/api/auth/logout`    | Logout               | Yes           |
| GET    | `/api/auth/me`        | Get current user     | Yes           |

### Products
| Method | Endpoint                       | Description                        | Auth required |
|--------|--------------------------------|------------------------------------|---------------|
| GET    | `/api/products`                | List all (supports `?search=&category=`) | No      |
| GET    | `/api/products/:id`            | Get single product                 | No            |
| GET    | `/api/products/meta/categories`| List all categories                | No            |
| POST   | `/api/products`                | Create product                     | Admin         |
| PUT    | `/api/products/:id`            | Update product                     | Admin         |
| DELETE | `/api/products/:id`            | Delete product                     | Admin         |

### Cart
| Method | Endpoint              | Description                   | Auth required |
|--------|-----------------------|-------------------------------|---------------|
| GET    | `/api/cart`           | Get current user's cart       | Yes           |
| POST   | `/api/cart`           | Add / update item             | Yes           |
| DELETE | `/api/cart/:productId`| Remove item                   | Yes           |
| DELETE | `/api/cart`           | Clear entire cart             | Yes           |

### Orders
| Method | Endpoint              | Description                   | Auth required |
|--------|-----------------------|-------------------------------|---------------|
| POST   | `/api/orders`         | Place order (checkout)        | Yes           |
| GET    | `/api/orders/my`      | Get current user's orders     | Yes           |
| GET    | `/api/orders`         | Get all orders                | Admin         |
| PATCH  | `/api/orders/:id/status` | Update order status        | Admin         |

### Admin
| Method | Endpoint                    | Description              | Auth required |
|--------|-----------------------------|--------------------------|---------------|
| GET    | `/api/admin/stats`          | Dashboard statistics     | Admin         |
| GET    | `/api/admin/users`          | List all users           | Admin         |
| PATCH  | `/api/admin/users/:id/role` | Promote / demote user    | Admin         |
| GET    | `/api/admin/categories`     | List categories          | Admin         |
| POST   | `/api/admin/categories`     | Create category          | Admin         |
| DELETE | `/api/admin/categories/:id` | Delete category          | Admin         |

---

## Order Statuses

`pending` → `processing` → `shipped` → `delivered` / `cancelled`

---

## Testing

The project uses **Playwright** and **Selenium WebDriver** for end-to-end tests. The server must be running before executing tests.

### Run all tests

```bash
npm test
```

### Run Playwright only

```bash
npm run test:playwright
```

An HTML report is generated at `playwright-report/index.html` after the run.

### Run Selenium only

```bash
npm run test:selenium
```

### Test suites

| Suite | Playwright | Selenium |
|-------|-----------|----------|
| Home / product listing | `tests/playwright/home.spec.js` | `tests/selenium/home.test.js` |
| Authentication | `tests/playwright/auth.spec.js` | `tests/selenium/auth.test.js` |
| Shopping cart | `tests/playwright/cart.spec.js` | `tests/selenium/cart.test.js` |
| Admin panel | `tests/playwright/admin.spec.js` | — |

> **Note:** Chrome / Chromium must be installed. In CI this is handled automatically.
> Locally, run `npx playwright install chromium` once before running Playwright tests.

---

## CI/CD Pipeline

The project uses **GitHub Actions** with three workflows:

### `ci.yml` — runs on every push and pull request

| Job | Trigger | Description |
|-----|---------|-------------|
| 🌿 **branch-lint** | push / PR | Validates branch name format |
| 📝 **commit-lint** | push / PR | Validates commit messages |
| 🧪 **test** | push / PR (after lint passes) | Runs Playwright + Selenium suites |

### `version-bump.yml` — runs only when a PR is **merged into `main`**

1. Analyses commit messages since the last tag to determine the bump level
2. Updates `package.json` version
3. Prepends an entry to `CHANGELOG.md`
4. Commits, tags, and pushes back to `main`
5. Creates a GitHub Release with generated notes

### Branch naming rules

Branch names must follow one of these patterns:

```
Special : main | master | develop | dev | staging
          release/<name> | hotfix/<name>

Feature : <verb>-<word>[-<word>...]   (segments: lowercase letters + digits)
```

Valid examples: `feat-user-authentication`, `fix-cart-bug-42`, `add-oauth2-login`, `refactor-order-service-v2`

### Commit message rules

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <subject>
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `release`
- **Subject:** uppercase start, numbers and punctuation are all allowed
- **Breaking change:** add `!` after the type or include `BREAKING CHANGE:` in the footer → triggers a **major** version bump

Examples:
```
feat: Add OAuth2 login
fix(cart): Resolve quantity not updating after removal
feat!: Redesign checkout API — breaks existing clients
docs: Update README with CI/CD section
```

### Semantic versioning logic

| Commit type | Version bump |
|-------------|-------------|
| `BREAKING CHANGE` / `!` | **Major** (X.0.0) |
| `feat` | **Minor** (0.X.0) |
| Everything else | **Patch** (0.0.X) |

---

## Contributing

1. Fork the repository and create a branch following the naming rules above
2. Make your changes with commits following the Conventional Commits format
3. Ensure all tests pass locally: `npm test`
4. Open a Pull Request targeting `main` or `develop`
5. CI will automatically lint your branch name and commits, then run the test suite
6. Once merged into `main`, the version bump workflow runs automatically

---

## Notes

- The SQLite database is stored as `shop.db` in the project root and is automatically created on first startup.
- Sessions are stored in memory; they are lost when the server restarts.
- `sql.js` is used instead of `better-sqlite3` to avoid requiring native C++ build tools on Windows.
