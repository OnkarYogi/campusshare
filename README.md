# CampusShare: Community Resource Borrowing & Lending Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![Tests Passing](https://img.shields.io/badge/tests-29%20passed-success.svg)](docs/TESTING.md)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61DAFB.svg)](frontend/package.json)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20MongoDB-green.svg)](backend/package.json)

**CampusShare** is a full-stack, non-commercial resource-sharing platform designed specifically for educational institutions (universities, colleges, and research institutes). It enables verified students, faculty members, and club coordinators to lend and borrow academic textbooks, laboratory equipment, digital production electronics, project kits, and sports gear in a secure, accountable, and transparent circular commons.

> **Academic Project Note**: Developed as an academic software engineering capstone and research project in an educational setting at **MIT World Peace University (MIT-WPU), Pune**. This project is an independent academic artifact and is not officially affiliated with or endorsed by MIT-WPU.

---

## 📑 Table of Contents

- [The Problem](#-the-problem)
- [Major Features](#-major-features)
- [User Roles & Access Control](#-user-roles--access-control)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Repository Directory Structure](#-repository-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Database Startup, Seeding & In-Memory Fallback](#-database-startup-seeding--in-memory-fallback)
- [Running the Application](#-running-the-application)
- [Automated Testing](#-automated-testing)
- [Selenium IDE Test Automation Suite](#-selenium-ide-test-automation-suite)
- [Demo Credentials](#-demo-credentials)
- [Troubleshooting & Common Issues](#-troubleshooting--common-issues)
- [Known Limitations & Future Roadmap](#-known-limitations--future-roadmap)
- [Security & Contributing](#-security--contributing)
- [License](#-license)

---

## 🎯 The Problem

In college campuses, valuable academic resources—such as oscilloscopes, 3D printers, specialized lenses, lab apparatus, and expensive reference textbooks—frequently sit idle in departmental lockers or student dorms. Meanwhile, other students face significant financial barriers or bureaucratic delays when attempting to access the same equipment for short-term projects. 

Existing solutions (e-commerce platforms, classified boards) fail in academic environments because:
1. **Commercial Focus**: They mandate monetary transactions, rental fees, or security deposits.
2. **Lack of Identity Verification**: Strangers cannot be trusted with delicate lab apparatus or cameras.
3. **Absence of Accountability**: No mechanism tracks on-time returns, item care, or peer reputation within institutional boundaries.

**CampusShare** solves this through a zero-cost, non-commercial circular exchange model backed by institutional email verification, transparent loan states, and peer trust metrics.

---

## ✨ Major Features

- **Institutional Domain Authentication**: Mandatory validation of educational email domains (`.edu`, `.ac.in`, `campus.edu`).
- **Academic Resource Catalog**: Live search, category filtering (Lab Equipment, Books, Electronics, Project Kits, Creative Gear, Sports), and department-based tagging.
- **Resource Lifecycle Engine**: Complete state machine handling listings:
  `available` ➔ `requested` ➔ `approved` ➔ `borrowed` ➔ `returned`.
- **Withdrawal & Custodial Safety**: Stewards can edit or withdraw listings; deletion is strictly guarded against resources with active requests or ongoing loans.
- **Quota & Anti-Hoarding Protection**: Borrowers are capped at a maximum of 3 concurrent active loans.
- **Anti-Self-Borrowing Rule**: Stewards cannot submit borrow requests for their own listings.
- **Peer Ratings & Trust Scoring**: Reciprocal 1–5 star reviews and feedback unlocked exclusively after return confirmation, calculating a weighted dynamic trust score.
- **Administrative Governance Portal**: System KPIs, institutional user verification, disciplinary suspension controls, and immutable audit logs.
- **In-App Notification Center**: Real-time alerts for request submissions, approvals, handoff collections, and return receipts.

---

## 👥 User Roles & Access Control

| Role | Permissions & Capabilities |
| :--- | :--- |
| **Student (Steward / Borrower)** | Browse catalog, create listings, approve/reject incoming requests, borrow up to 3 items, rate completed loans. |
| **Faculty Member** | Steward departmental lab equipment, review research equipment requests, verify laboratory handoffs. |
| **Club Coordinator** | Manage shared student organization inventory (robotics kits, cameras, event electronics). |
| **Administrator** | Institutional compliance, verify new user accounts, toggle account suspensions, moderate listings, inspect audit logs. |

---

## 💻 Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Design System**: *Academic Exchange* UI tokens (Collegiate Navy `#1E3A8A`, Emerald `#0D9488`, Slate `#0F172A`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) (v18+) + [Express.js 4](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/)
- **In-Memory Database**: [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) (automated testing & offline fallback)
- **Authentication**: JSON Web Tokens ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Validation & Logging**: [express-validator](https://express-validator.github.io/) + [Morgan](https://github.com/expressjs/morgan)

---

## 🧱 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React.js Frontend (Vite)                    │
│  - Port 5173                                                │
│  - Academic Exchange UI System                              │
│  - Catalog Dashboard, Add Resource Wizard, Hand-off Flow    │
│  - Admin Governance & User Trust Profiles                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / Bearer JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                 Node.js / Express Backend                   │
│  - Port 5000                                                │
│  - Authentication & RBAC (Student, Faculty, Club, Admin)    │
│  - State Machine & Concurrency Guards                       │
│  - Trust Score Calculation Engine & Audit Logging           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────▼──────────────────────────────┐
│                    MongoDB Database                         │
│  - Primary: Local mongod (mongodb://localhost:27017)        │
│  - Cloud: MongoDB Atlas cluster                             │
│  - Fallback / Test: MongoMemoryServer (Zero-config)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Directory Structure

```
├── .gitignore                         # Complete ignore rules for env, builds, logs, dependencies
├── .env.example                       # Root environment variables configuration template
├── package.json                       # Root workspace orchestrator
├── package-lock.json                  # Root lockfile
├── README.md                          # Main repository documentation (this file)
├── CONTRIBUTING.md                    # Guidelines for contributors
├── LICENSE                            # MIT License
├── BUILD_STATE.md                     # Build milestones and verification dashboard
├── PROJECT_HANDOFF.md                 # Technical orientation and invariant rules
├── SRS_Community_Resource_Platform_Final.docx # IEEE SRS Specification Document
├── docs/
│   ├── MODULE_GUIDE.md                # Architectural breakdown of all system modules
│   ├── API_DOCUMENTATION.md           # REST API endpoints, schemas, and status codes
│   ├── TESTING.md                     # QA strategy, test matrices, and execution steps
│   └── diagrams/                      # System diagrams (Activity, Class, DFDs, Sequence, Use Case)
├── designs/
│   └── stitch_campusshare_resource_platform/
│       ├── academic_exchange/DESIGN.md# Design tokens, color palette, typography specs
│       ├── campusshare_logo/          # Official SVG brand assets
│       ├── campusshare_main_dashboard_resource_catalog/
│       ├── campusshare_add_resource_to_directory/
│       └── campusshare_resource_details_borrow_request/
├── selenium/
│   ├── community-resource-exchange.side # Selenium IDE 4.0.1 test suite (10 test cases)
│   └── SELENIUM_IDE_GUIDE.md          # Comprehensive runner guide for automated browser tests
├── backend/                           # Node.js / Express REST API
│   ├── .env.example                   # Backend environment template
│   ├── package.json                   # Backend dependencies & test scripts
│   ├── src/
│   │   ├── config/db.js               # Dual-mode DB connector (Local MongoDB + In-Memory fallback)
│   │   ├── controllers/               # Auth, Borrow, Resource, Rating, Admin handlers
│   │   ├── middleware/                # JWT auth, verification checks, RBAC, error handling
│   │   ├── models/                    # User, Resource, BorrowRequest, Rating, AuditLog, Notification
│   │   ├── routes/                    # Express routing definitions
│   │   ├── utils/                     # Trust score math, database seeder
│   │   └── server.js                  # Express app entrypoint & health check
│   └── tests/                         # Jest test suites (auth, admin, borrow, rating, resource)
└── frontend/                          # React + Vite client
    ├── .env.example                   # Frontend environment template
    ├── package.json                   # Frontend dependencies & build scripts
    ├── index.html                     # HTML root template with fonts
    ├── vite.config.js                 # Vite bundler configuration
    ├── tailwind.config.js             # Tailwind CSS tokens & theme setup
    └── src/
        ├── components/                # Modular UI components matching Stitch design
        ├── context/                   # Global AuthContext & state management
        ├── services/api.js            # Axios client with JWT interceptor
        └── App.jsx                    # Core routing and view manager
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.0.0` or higher (tested and verified on Node.js v20.x and v25.x).
- **npm**: `v9.0.0` or higher.
- **MongoDB** *(Optional for local dev)*:
  - Local MongoDB Community Server running on `mongodb://localhost:27017`, **OR**
  - MongoDB Atlas connection string.
  - *If MongoDB is not installed locally, CampusShare automatically falls back to an embedded in-memory MongoDB runner during development and testing.*

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd "Community Resource Exchange Platform"
   ```

2. **Install Dependencies**:
   Install root orchestration, backend, and frontend packages with a single command:
   ```bash
   npm run install:all
   ```

---

## 🔐 Environment Configuration

CampusShare provides template `.env.example` files. Create local `.env` files for both backend and frontend:

### 1. Root / Backend Environment (`backend/.env`)
Copy the template:
```bash
cp backend/.env.example backend/.env
```
Default configuration values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusshare
JWT_SECRET=super_secret_campusshare_jwt_key_academic_exchange
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
ALLOWED_EMAIL_DOMAINS=.edu,.ac.in,.org,campus.edu
```

> **Security Note**: In a production environment, generate a cryptographically strong 32-byte secret using Node.js:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2. Frontend Environment (`frontend/.env`)
Copy the template:
```bash
cp frontend/.env.example frontend/.env
```
Content:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🗄️ Database Startup, Seeding & In-Memory Fallback

### Persistent MongoDB Setup
If you have MongoDB running locally, ensure the service is active:
```bash
# Verify MongoDB service status (Windows)
net start MongoDB
```

### Automatic In-Memory Fallback
If no local MongoDB daemon is detected on port 27017, the backend automatically boots a portable **`MongoMemoryServer`** instance in development mode.
- **Advantage**: Zero external dependencies required to immediately explore, run, and test the platform.
- **Behavior Note**: In-memory data persists during the running process. Restarting the backend process initializes a fresh in-memory database and automatically seeds it.

### Seeding Demo Data
To populate the database with realistic academic resources (Rigol Oscilloscope, Campbell Biology, Sony Alpha 7 IV Kit, Arduino Mega Kits) and verified institutional accounts:
```bash
npm run seed
```

---

## 🖥️ Running the Application

### Option A: Concurrent Development (Recommended)
Launch both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

### Option B: Separate Terminal Windows
1. **Terminal 1 - Backend Server**:
   ```bash
   npm run server
   ```
   *Health Check*: Open [http://localhost:5000/api/health](http://localhost:5000/api/health) to confirm the server status.

2. **Terminal 2 - Frontend Client**:
   ```bash
   npm run client
   ```
   *Access Client*: Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🧪 Automated Testing

CampusShare includes an automated test suite powered by **Jest**, **Supertest**, and **mongodb-memory-server**.

To execute the test suite:
```bash
npm test
```

### Test Suite Summary (29 Tests Passing)
| Test Suite | Coverage Area | Status |
| :--- | :--- | :--- |
| `tests/auth.test.js` | Domain validation, registration, password hashing, JWT authentication, user profile updates | 7 Passed |
| `tests/resource.test.js` | Resource listing creation, keyword/department filtering, updates, withdrawal flow, deletion safety | 7 Passed |
| `tests/borrow.test.js` | Anti-self-borrowing, verification guard, 3-loan quota, lifecycle handoffs, competing request resolution | 7 Passed |
| `tests/rating.test.js` | Post-return review requirement, trust score recalculation engine, duplicate rating prevention | 3 Passed |
| `tests/admin.test.js` | Admin RBAC protection, platform metrics, user verification, suspension guards, audit trail logging | 5 Passed |

To run backend tests with coverage report:
```bash
npm --prefix backend test -- --coverage
```

To run frontend production build verification:
```bash
npm run build
```

---

## 🤖 Selenium IDE Test Automation Suite

CampusShare includes an end-to-end browser automation suite created in **Selenium IDE 4.0.1-beta.14**.

### Deliverables:
- **Project File**: `selenium/community-resource-exchange.side`
- **Execution Guide**: [`selenium/SELENIUM_IDE_GUIDE.md`](selenium/SELENIUM_IDE_GUIDE.md)

### Included Selenium Test Cases:
1. **BB-01**: User Login & Session Persistence
2. **BB-02**: Catalog Search & Filter Functionality
3. **BB-03**: Create New Resource Listing
4. **BB-04**: Borrow Request Submission Lifecycle
5. **BB-05**: Steward Request Approval & Collection
6. **WB-01**: Unverified Account Access Barrier (Negative)
7. **WB-02**: Self-Borrowing Invariant Prevention (Negative)
8. **WB-03**: Maximum Active Loan Quota Rejection (Negative)
9. **WB-04**: Unreturned Transaction Rating Block (Negative)
10. **WB-05**: Active Loan Resource Deletion Guard (Negative)

### Running Selenium IDE Tests:
1. Ensure both backend and frontend servers are running (`npm run dev`).
2. Reset seed state: `npm run seed`.
3. Open Google Chrome with the **Selenium IDE** extension installed.
4. Open `selenium/community-resource-exchange.side`.
5. Set test execution speed to *Normal* and run the `CampusShare Master Test Suite`.
6. Consult [selenium/SELENIUM_IDE_GUIDE.md](selenium/SELENIUM_IDE_GUIDE.md) for full troubleshooting steps and locator details.

---

## 🔑 Demo Credentials

All seeded accounts belong to the academic domain `campus.edu`:

| Role / Persona | Name | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Steward** | Ananya Kulkarni | `elena.rostova@campus.edu` | `Password123!` | Manages lab equipment, approves loan requests, confirms returns. |
| **Demo Borrower** | Rohan Deshmukh | `marcus.vance@campus.edu` | `Password123!` | Borrows items, tracks active loans, submits ratings. |
| **Faculty Member** | Dr. Priya Joshi | `dr.chen@campus.edu` | `Password123!` | Chemistry/Applied Sciences lab resource steward. |
| **Club Coordinator**| MIT-WPU Robotics Club| `robotics.club@campus.edu` | `Password123!` | Prototyping kits, camera equipment, shared maker tools. |
| **Administrator** | System Administrator | `admin@campus.edu` | `AdminPass123!` | System KPIs, user verification, suspensions, moderation. |
| **Unverified Student**| Aarav Sharma | `aarav.sharma@campus.edu` | `Password123!` | Demonstrates unverified access barriers (WB-01). |
| **Max Quota Student**| Aditya Patil | `aditya.patil@campus.edu` | `Password123!` | Demonstrates 3-loan active quota enforcement (WB-03). |

---

## 🛠️ Troubleshooting & Common Issues

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| `connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB daemon is offline. | The backend will automatically fall back to `MongoMemoryServer`. If persistent local data is required, start MongoDB via `net start MongoDB` or configure `MONGODB_URI` in `backend/.env`. |
| Port `5000` or `5173` already in use | Previous Node.js process still running. | Terminate the process using the port (`netstat -ano \| findstr :5000`) or edit `PORT` in `backend/.env`. |
| `Registration requires a valid institutional email` | Attempting to sign up with public email domains (e.g., `@gmail.com`). | Use an approved educational domain suffix (e.g. `@campus.edu`, `.edu`, `.ac.in`), or add your domain to `ALLOWED_EMAIL_DOMAINS` in `backend/.env`. |
| `Cannot borrow own resource` error | Attempting to borrow an item listed by the logged-in user. | This is intentional (SRS Section 5.5). Switch to a borrower account (`marcus.vance@campus.edu`) to request items. |
| `Borrowing limit exceeded` error | User currently has 3 active loans (`approved` or `borrowed`). | Return an existing item before requesting new equipment (SRS Section 5.5). |

---

## 🔮 Known Limitations & Future Roadmap

- **Multi-Campus Federation**: Current deployment models assume a single institution campus. Multi-tenant partitioning by campus subdomain is slated for a future release.
- **Physical QR Code Handoffs**: Currently, physical collection and returns are confirmed via dashboard button controls. Future updates plan to integrate mobile camera QR code scanning for instantaneous physical verification.
- **Push Notification Service**: In-app notifications are currently database-polled; integration with WebSockets (Socket.io) or Web Push is planned.
- **Automated Email Transports**: Email domain verification uses token generation. SMTP integration (e.g., Nodemailer with institutional SMTP relays) can be connected via environment variables.

---

## 🛡️ Security & Contributing

- **Security Audits**: The repository is audited for sensitive information. No real credentials, production API keys, or private database dumps are tracked.
- **Secret Management**: Always keep actual `.env` files out of Git tracking.
- **Contributions**: Please read [CONTRIBUTING.md](CONTRIBUTING.md) for pull request workflows, coding standards, and testing procedures.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
