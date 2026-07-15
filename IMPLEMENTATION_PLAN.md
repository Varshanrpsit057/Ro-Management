# RO Water Service Management — Implementation Plan

## 1. Project Overview

A single-shop RO water service management tool for tracking customers, their RO systems, filter replacements, and product inventory. No authentication, no cloud services — runs entirely on localhost.

**Stack:** React 18 + Vite (frontend), Node.js + Express (backend), PostgreSQL (database)

---

## 2. Folder Structure

```
ro-service-management/
├── backend/
│   ├── package.json
│   ├── .env                          # DB credentials, PORT
│   ├── src/
│   │   ├── index.js                  # Express entry point
│   │   ├── db.js                     # pg Pool singleton
│   │   ├── routes/
│   │   │   ├── customers.js
│   │   │   ├── roSystems.js
│   │   │   ├── products.js
│   │   │   ├── filterReplacements.js
│   │   │   ├── notifications.js
│   │   │   └── dashboard.js
│   │   └── schema.sql               # Full DDL
│   └── seed.sql                      # Optional seed data
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js                    # Axios instance + all API wrappers
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Customers.jsx
│       │   ├── CustomerForm.jsx
│       │   ├── ROSystems.jsx
│       │   ├── ROSystemForm.jsx
│       │   ├── Products.jsx
│       │   ├── ProductForm.jsx
│       │   ├── FilterReplacements.jsx
│       │   ├── Notifications.jsx
│       │   └── ServiceHistory.jsx
│       ├── components/
│       │   ├── Layout.jsx            # Sidebar + header shell
│       │   ├── NotificationBadge.jsx
│       │   └── ConfirmDialog.jsx
│       └── styles/
│           └── index.css
└── README.md
```

---

## 3. Database Tables (PostgreSQL)

### 3.1 `customers`
| Column       | Type         | Constraints          |
|-------------|-------------|---------------------|
| id          | SERIAL       | PK                  |
| name        | VARCHAR(100) | NOT NULL            |
| phone       | VARCHAR(15)  | NOT NULL, UNIQUE    |
| address     | TEXT         |                     |
| created_at  | TIMESTAMPTZ  | DEFAULT NOW()       |
| updated_at  | TIMESTAMPTZ  | DEFAULT NOW()       |

### 3.2 `ro_systems`
| Column         | Type         | Constraints                    |
|---------------|-------------|--------------------------------|
| id            | SERIAL       | PK                             |
| customer_id   | INT          | FK → customers(id) ON DELETE CASCADE |
| model_name    | VARCHAR(100) |                                |
| install_date  | DATE         |                                |
| status        | VARCHAR(20)  | DEFAULT 'active', CHECK('active','inactive','removed') |
| notes         | TEXT         |                                |
| created_at    | TIMESTAMPTZ  | DEFAULT NOW()                  |
| updated_at    | TIMESTAMPTZ  | DEFAULT NOW()                  |

### 3.3 `products`
| Column       | Type          | Constraints          |
|-------------|--------------|---------------------|
| id          | SERIAL        | PK                  |
| name        | VARCHAR(150)  | NOT NULL            |
| description | TEXT          |                     |
| price       | DECIMAL(10,2) | NOT NULL            |
| stock_qty   | INT           | DEFAULT 0           |
| image_url   | VARCHAR(300)  |                     |
| created_at  | TIMESTAMPTZ   | DEFAULT NOW()       |
| updated_at  | TIMESTAMPTZ   | DEFAULT NOW()       |

### 3.4 `filter_replacements`
| Column              | Type         | Constraints                              |
|--------------------|-------------|------------------------------------------|
| id                 | SERIAL       | PK                                       |
| ro_system_id       | INT          | FK → ro_systems(id) ON DELETE CASCADE    |
| filter_type        | VARCHAR(50)  | NOT NULL, CHECK('sediment','carbon','RO_membrane','post_carbon','UF','UV','other') |
| replaced_date      | DATE         | NOT NULL                                 |
| next_due_date      | DATE         | NOT NULL                                 |
| cost               | DECIMAL(10,2)|                                          |
| notes              | TEXT         |                                          |
| created_at         | TIMESTAMPTZ  | DEFAULT NOW()                            |

### 3.5 `service_history`
| Column          | Type         | Constraints                            |
|----------------|-------------|----------------------------------------|
| id             | SERIAL       | PK                                     |
| ro_system_id   | INT          | FK → ro_systems(id) ON DELETE CASCADE  |
| service_date   | DATE         | NOT NULL                               |
| description    | TEXT         | NOT NULL                               |
| cost           | DECIMAL(10,2)|                                        |
| created_at     | TIMESTAMPTZ  | DEFAULT NOW()                          |

---

## 4. API Endpoints

### 4.1 Dashboard
| Method | Route              | Description                                      |
|--------|--------------------|--------------------------------------------------|
| GET    | `/api/dashboard`   | Returns counts: customers, roSystems, upcomingReplacements, overdueReplacements, availableProducts |

### 4.2 Customers
| Method | Route                | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/customers`     | List all (supports `?search=`) |
| GET    | `/api/customers/:id` | Get single customer |
| POST   | `/api/customers`     | Create              |
| PUT    | `/api/customers/:id` | Update              |
| DELETE | `/api/customers/:id` | Delete (cascades to ro_systems) |

### 4.3 RO Systems
| Method | Route                            | Description          |
|--------|----------------------------------|----------------------|
| GET    | `/api/customers/:custId/systems` | List for customer    |
| GET    | `/api/systems/:id`               | Get single system    |
| POST   | `/api/customers/:custId/systems` | Create               |
| PUT    | `/api/systems/:id`               | Update               |
| DELETE | `/api/systems/:id`               | Delete (cascades)    |

### 4.4 Products
| Method | Route              | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/products`    | List (supports `?search=`) |
| GET    | `/api/products/:id`| Get single         |
| POST   | `/api/products`    | Create             |
| PUT    | `/api/products/:id`| Update             |
| DELETE | `/api/products/:id`| Delete             |

### 4.5 Filter Replacements
| Method | Route                                        | Description                  |
|--------|----------------------------------------------|------------------------------|
| GET    | `/api/systems/:sysId/filter-replacements`    | List for a system            |
| POST   | `/api/systems/:sysId/filter-replacements`    | Create (auto-sets next_due_date = replaced_date + 6 months) |
| DELETE | `/api/filter-replacements/:id`               | Delete                       |

### 4.6 Service History
| Method | Route                                    | Description        |
|--------|------------------------------------------|--------------------|
| GET    | `/api/systems/:sysId/service-history`   | List for a system  |
| POST   | `/api/systems/:sysId/service-history`   | Create entry       |

### 4.7 Notifications
| Method | Route                  | Description                                    |
|--------|------------------------|------------------------------------------------|
| GET    | `/api/notifications`   | Returns upcoming (next 7 days) + overdue replacements, includes customer name, phone, system model |

---

## 5. UI Pages

| Page                    | Route                       | Purpose                                           |
|-------------------------|-----------------------------|---------------------------------------------------|
| Dashboard               | `/`                         | Summary cards; clickable stats                    |
| Customer List           | `/customers`                | Table with search bar, Add button, row actions     |
| Customer Form           | `/customers/new`, `/customers/:id/edit` | Add/Edit form                         |
| Customer Detail         | `/customers/:id`            | Customer info + list of their RO systems           |
| RO System Form          | `/systems/new?customerId=`, `/systems/:id/edit` | Add/Edit form                     |
| Product List            | `/products`                 | Cards/grid: details above image, search bar       |
| Product Form            | `/products/new`, `/products/:id/edit` | Add/Edit form                             |
| Filter Replacements     | `/filter-replacements`      | All replacements table with filters by system     |
| Notifications           | `/notifications`            | Tabbed: Upcoming / Overdue panels                 |
| Service History         | `/systems/:id/history`      | Timeline table for a single RO system             |

### Layout
- Left sidebar navigation with links to all pages.
- Notification badge on the sidebar "Notifications" link showing count of overdue items.
- Top header bar with app title "RO Service Manager".

---

## 6. Development Order

| Phase | Step | Description                                        |
|-------|------|----------------------------------------------------|
| **P1** | 1.1  | Initialize Node project, install Express + pg + cors + dotenv |
|       | 1.2  | Create [`schema.sql`](backend/src/schema.sql) with all 5 tables      |
|       | 1.3  | Create [`db.js`](backend/src/db.js) — pg Pool                          |
|       | 1.4  | Build all route files (customers, roSystems, products, filterReplacements, serviceHistory, dashboard, notifications) |
|       | 1.5  | Wire everything in [`index.js`](backend/src/index.js) — Express server |
| **P2** | 2.1  | Provision PostgreSQL database, run schema.sql       |
|       | 2.2  | Insert seed data, verify all tables and relations   |
| **P3** | 3.1  | Scaffold Vite + React project, install react-router-dom, axios |
|       | 3.2  | Create [`api.js`](frontend/src/api.js) — all API call wrappers        |
|       | 3.3  | Build Layout + Sidebar + NotificationBadge          |
|       | 3.4  | Build Dashboard page                                |
|       | 3.5  | Build Customer pages (List, Form, Detail)           |
|       | 3.6  | Build RO System pages (Form)                        |
|       | 3.7  | Build Product pages (List, Form)                    |
|       | 3.8  | Build Filter Replacements page                      |
|       | 3.9  | Build Notifications page                            |
|       | 3.10 | Build Service History page                          |
|       | 3.11 | Apply base CSS styling                              |
| **P4** | 4.1  | Wire frontend API layer to backend; configure CORS   |
|       | 4.2  | End-to-end flow testing: customer → system → filter replacement → notification |
| **P5** | 5.1  | Full CRUD testing on every entity                   |
|       | 5.2  | Edge-case handling (empty states, delete confirmations, cascade behavior) |
|       | 5.3  | Polishing (responsive tweaks, loading spinners)     |
