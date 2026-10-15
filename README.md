# CampusShare: Community Resource Borrowing & Lending Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![Tests Passing](https://img.shields.io/badge/tests-37%20passed-success.svg)](docs/TESTING.md)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61DAFB.svg)](frontend/package.json)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20MongoDB-green.svg)](backend/package.json)

**CampusShare** is a full-stack, non-commercial resource-sharing platform designed specifically for educational institutions (universities, colleges, and research institutes). It enables verified students, faculty members, and club coordinators to lend and borrow academic textbooks, laboratory equipment, digital production electronics, project kits, and sports gear in a secure, accountable, and transparent circular commons.

> **Academic Project Note**: Developed as an academic software engineering capstone and research project in an educational setting at **MIT World Peace University (MIT-WPU), Pune**. This project is an independent academic artifact and is not officially affiliated with or endorsed by MIT-WPU.

---

## 📑 Table of Contents

- [The Problem](#-the-problem)
- [Major Features](#-major-features)
- [Email Notification System & SMTP Setup](#-email-notification-system--smtp-setup)
- [Ongoing vs. Completed Transactions Separation](#-ongoing-vs-completed-transactions-separation)
- [User Roles & Access Control](#-user-roles--access-control)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Database Startup, Seeding & In-Memory Fallback](#-database-startup-seeding--in-memory-fallback)
- [Running the Application](#-running-the-application)
- [Automated Testing (37 Tests Passing)](#-automated-testing-37-tests-passing)
- [Manual Test Cases & Viva Guide](#-manual-test-cases--viva-guide)
- [Selenium IDE Test Automation Suites](#-selenium-ide-test-automation-suites)
- [Demo Credentials](#-demo-credentials)
- [Troubleshooting & Common Issues](#-troubleshooting--common-issues)
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
  `available` ➔ `requested` ➔ `approved` ➔ `borrowed` ➔ `return_requested` ➔ `returned`.
- **External Email Notifications**: Real emails dispatched to registered academic accounts via Nodemailer & SMTP for all critical loan milestones.
- **Transaction Separation**: Visual and functional segregation of active **Ongoing Transactions** from verified **Completed Transactions**.
- **Withdrawal & Custodial Safety**: Stewards can edit or withdraw listings; deletion is strictly guarded against resources with active requests or ongoing loans.
- **Quota & Anti-Hoarding Protection**: Borrowers are capped at a maximum of 3 concurrent active loans.
- **Anti-Self-Borrowing Rule**: Stewards cannot submit borrow requests for their own listings.
- **Peer Ratings & Trust Scoring**: Reciprocal 1–5 star reviews and feedback unlocked exclusively after return confirmation, calculating a weighted dynamic trust score.
- **Administrative Governance Portal**: System KPIs, institutional user verification, disciplinary suspension controls, and immutable audit logs.
- **In-App Notification Center**: Real-time alerts for request submissions, approvals, handoff collections, cancellations, and return receipts.

---

## 📧 Email Notification System & SMTP Setup

CampusShare features a dual notification architecture:
1. **In-App Notifications**: Real-time bell alerts inside the web navigation bar, marked read/unread.
2. **External Email Notifications**: Automated branded HTML and plain-text emails sent to the recipient's institutional email address.

### Supported Workflow Events:
| Event | Trigger | Recipient | Email Subject Line |
|---|---|---|---|
| **Borrow Request** | Borrower submits a request | Resource Owner (Steward) | `[CampusShare] New Borrow Request: <Resource Title>` |
| **Request Approved** | Steward approves the loan | Borrower | `[CampusShare] Request Approved: <Resource Title>` |
| **Request Declined** | Steward declines or competing request approved | Borrower | `[CampusShare] Request Update: <Resource Title>` |
| **Request Cancelled**| Borrower cancels pending request | Resource Owner (Steward) | `[CampusShare] Borrow Request Cancelled: <Resource Title>` |
| **Item Handover** | Steward marks item collected | Borrower | `[CampusShare] Resource Handed Over: <Resource Title>` |
| **Return Initiated** | Borrower initiates return handback | Resource Owner (Steward) | `[CampusShare] Return Initiated: <Resource Title>` |
| **Return Confirmed** | Steward confirms receipt and completes loan | Borrower | `[CampusShare] Return Confirmed — Transaction Completed: <Resource Title>` |

### How to Configure SMTP for a Live Demonstration:
In `backend/.env`, configure your SMTP credentials:

```env
# Enable email sending (set 'false' to use in-app notifications only)
EMAIL_ENABLED=true

# SMTP Server Details (Example: Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Your sender account credentials
SMTP_USER=your_email@gmail.com

# For Gmail: Generate a 16-character App Password at:
# https://myaccount.google.com/apppasswords
SMTP_PASS=your_16_char_app_password

# Sender display name
EMAIL_FROM="CampusShare Notifications <no-reply@campusshare.edu>"
```

> **Testing Without Live SMTP**: When SMTP credentials are not supplied or `EMAIL_ENABLED=false`, CampusShare runs in safe local mode: it logs clear console messages (`[Email Service] (SMTP not configured) Skipped real email...`), delivers all in-app notifications, and guarantees that database transactions are never interrupted or rolled back. In automated test mode (`NODE_ENV=test`), emails are captured in an in-memory test collector without making external network calls.

---

## 🔄 Ongoing vs. Completed Transactions Separation

CampusShare cleanly separates transactions in both the backend database and the frontend UI (`MyLoansView.jsx`):

### 1. Ongoing Transactions (Active)
Includes transactions that still require an action or are currently in physical custody:
- **Pending Requests**: Awaiting steward approval or decline.
- **Approved Requests**: Ready for pickup at the campus location.
- **Currently Borrowed**: In borrower custody with due return dates.
- **Return Initiated**: Handed back by borrower, awaiting steward condition inspection and confirmation.

### 2. Completed Transactions (Finalized)
Includes transactions strictly after the owner confirms the return:
- Verified physical return of the item.
- Resource catalog availability automatically restored.
- Total completed loan counts incremented for both participants.
- Reciprocal peer ratings and reviews unlocked.

### 3. Cancelled & Declined Archive
Cancelled and declined requests are archived in a separate closed history view, ensuring they are never conflated with successfully completed exchanges.

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

- **Frontend**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS 3.4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) + [Axios](https://axios-http.com/)
- **Backend**: [Node.js](https://nodejs.org/) (v18+) + [Express.js 4](https://expressjs.com/) + [Mongoose 8](https://mongoosejs.com/)
- **Email Engine**: [Nodemailer](https://nodemailer.com/) (Configurable SMTP with non-blocking async dispatch)
- **Database**: [MongoDB](https://www.mongodb.com/) + [MongoMemoryServer](https://github.com/nodkz/mongodb-memory-server) (offline fallback)
- **Security**: JWT authentication + bcryptjs password hashing + express-validator
- **Testing**: Jest + Supertest + Selenium IDE

---

## 🚀 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/OnkarYogi/campusshare.git
   cd campusshare
   ```

2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Seed Database State**:
   ```bash
   npm run seed
   ```

---

## 🔐 Environment Configuration

CampusShare provides `.env.example` templates in the root and `backend/` directories. Copy the template:
```bash
cp backend/.env.example backend/.env
```

Key environment variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campusshare
JWT_SECRET=replace_with_secure_random_key_32_bytes
JWT_EXPIRES_IN=7d
ALLOWED_EMAIL_DOMAINS=.edu,.ac.in,.org,campus.edu
CORS_ORIGIN=http://localhost:5173

# Email / SMTP Settings
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="CampusShare Notifications <no-reply@campusshare.edu>"
```

---

## 🗄️ Database Startup, Seeding & In-Memory Fallback

- **Automatic In-Memory Runner**: If no local MongoDB is running on port 27017, the application automatically boots an embedded portable in-memory MongoDB instance. No external database installation is required to run the project.
- **Persistent MongoDB**: If a local daemon is running, it connects to `mongodb://localhost:27017/campusshare`.
- **Reset Database**: Run `npm run seed` at any time to restore realistic demo accounts, active loan states, and catalog equipment.

---

## 🖥️ Running the Application

Launch both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing (37 Tests Passing)

To execute all backend test suites:
```bash
npm test
```
Or directly inside `backend/`:
```bash
cd backend
npm test
```

### Test Suites Breakdown (6 Suites, 37 Tests):
| Test Suite File | Coverage Target | Tests |
| :--- | :--- | :--- |
| `tests/emailAndTransaction.test.js` | Borrow email triggers, approval/rejection emails, SMTP fault tolerance, in-app notifications, ongoing vs completed separation, state tampering guards | 8 Passed |
| `tests/borrow.test.js` | Complete borrow lifecycle, 3-loan quota, self-borrowing block, race-condition approval guard, competing request rejection | 7 Passed |
| `tests/resource.test.js` | Catalog creation, keyword search, category filters, withdrawal flow, active request deletion safety | 7 Passed |
| `tests/auth.test.js` | Institutional domain verification, registration, password hashing, JWT login, profile updates | 7 Passed |
| `tests/admin.test.js` | Role-based access control, metrics dashboard, user verification, suspension guards, audit logging | 5 Passed |
| `tests/rating.test.js` | Post-return rating requirement, trust score calculation, duplicate review prevention | 3 Passed |

---

## 📖 Manual Test Cases & Viva Guide

For project defense and viva demonstrations:
- **Manual Test Cases**: [`docs/MANUAL_TEST_CASES.md`](docs/MANUAL_TEST_CASES.md) (8 structured test cases with preconditions, test data, steps, expected and actual results).
- **Testing Concepts Explained**: [`docs/TESTING_EXPLAINED.md`](docs/TESTING_EXPLAINED.md) (Plain-language explanations of test cases, pass/fail criteria, black-box vs. white-box testing, Selenium execution, and mock email rationale).

---

## 🤖 Selenium IDE Test Automation Suites

Two Selenium IDE project files are provided in `selenium/`:

1. **`selenium/campusshare-viva-suite.side` (Recommended for Viva)**:
   - Streamlined, rapid 6-test suite designed for live presentation.
   - Tests: Valid Login, Invalid Login, Real-time Search, Ongoing Transactions Separation, Completed Transactions Separation, and Unverified User Guard.
2. **`selenium/community-resource-exchange.side` (Comprehensive Backup)**:
   - Complete 10-test suite covering full boundary and invariant tests.

*Detailed execution instructions and locator references are in [`selenium/SELENIUM_IDE_GUIDE.md`](selenium/SELENIUM_IDE_GUIDE.md).*

---

## 🔑 Demo Credentials

All seeded accounts belong to the academic domain `campus.edu`:

| Role | Name | Email | Password | Primary Demo Use |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Borrower** | Rohan Deshmukh | `marcus.vance@campus.edu` | `Password123!` | Submitting borrow requests, ongoing loans, ratings |
| **Demo Steward** | Ananya Kulkarni | `elena.rostova@campus.edu` | `Password123!` | Approving requests, confirming collections & returns |
| **Faculty Member** | Dr. Priya Joshi | `dr.chen@campus.edu` | `Password123!` | Chemistry lab equipment steward |
| **Club Coordinator** | MIT-WPU Robotics Club | `robotics.club@campus.edu` | `Password123!` | Shared maker tools, camera kit |
| **Unverified Student** | Aarav Sharma | `aarav.sharma@campus.edu` | `Password123!` | Demonstrating unverified borrowing barrier |
| **Max Quota Borrower** | Aditya Patil | `aditya.patil@campus.edu` | `Password123!` | Demonstrating 3-loan maximum quota limit |
| **Administrator** | System Administrator | `admin@campus.edu` | `AdminPass123!` | Governance portal, user verification, moderation |

---

## 🛠️ Troubleshooting & Common Issues

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| `[Email Service] (SMTP not configured) Skipped real email...` | SMTP credentials not set in `.env`. | This is normal during local dev. In-app notifications still work. To send real emails, set `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` in `backend/.env`. |
| `connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is offline. | The backend automatically boots in-memory MongoDB. For persistent data, start MongoDB service or update `MONGODB_URI`. |
| `Registration requires a valid institutional email` | Public email domain used (e.g. `@gmail.com`). | Use `.edu`, `.ac.in`, `.org`, or `campus.edu`, or add your domain to `ALLOWED_EMAIL_DOMAINS`. |
| `Business Rule Violation: Cannot borrow your own resource` | Steward attempted to borrow own listing. | Intentional SRS 5.5 rule. Log in as a different user (e.g., `marcus.vance@campus.edu`) to borrow. |

---

## 🛡️ Security & Contributing

- No production credentials, real email passwords, or private database keys are tracked in Git.
- Always keep actual `.env` files out of Git tracking.
- Contributions and PR standards are documented in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
