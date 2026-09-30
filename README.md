# CampusShare: Community Resource Borrowing & Lending Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](file:///c:/Community%20Resource%20Exchange%20Platform/package.json)
[![Status](https://img.shields.io/badge/status-active%20development-emerald.svg)](file:///c:/Community%20Resource%20Exchange%20Platform/BUILD_STATE.md)
[![License](https://img.shields.io/badge/license-ISC-lightgrey.svg)](file:///c:/Community%20Resource%20Exchange%20Platform/package.json)

**CampusShare** is a full-stack, non-commercial resource-sharing platform designed specifically for educational institutions (universities, colleges, and research institutes). It enables verified students, faculty members, and club coordinators to lend and borrow academic textbooks, laboratory equipment, digital production electronics, project kits, and sports gear in a secure, accountable, and transparent circular commons.

---

## 🏛️ System Philosophy & Highlights

- **Zero E-Commerce Overhead**: No shopping carts, payment gateways, or monetary rentals. Exchanges are non-monetary academic loans between verified campus members.
- **Institutional Trust & Verification**: Accounts are tied to verified educational domains. Badges identify faculty, student researchers, and club stewards.
- **Accountability & Trust Scores**: Completed handoffs and prompt returns build a dynamic user trust score.
- **Academic Exchange Design System**: Direct implementation of the **Academic Exchange** Stitch UI system, featuring deep collegiate blue (`#1E3A8A`), active emerald (`#0D9488`), and Plus Jakarta Sans / Inter typography.

---

## 🧱 Architectural Overview

The application follows an **Incremental Process Model** with a decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 React.js Frontend (Vite)                   │
│  - Tailwind CSS with Academic Exchange Design System        │
│  - Catalog Dashboard, Add Resource Wizard, Hand-off Flow    │
│  - Admin Governance & User Trust Profiles                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                 Node.js / Express Backend                   │
│  - Authentication & RBAC (Student, Faculty, Club, Admin)    │
│  - Borrowing Workflow & Concurrency Guards                  │
│  - Notifications, Trust Score Engine & Audit Logging        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────▼──────────────────────────────┐
│                    MongoDB Database                         │
│  - Users, Resources, BorrowRequests, Ratings, Notifications │
│  - Embedded Memory Server support for portable dev/testing  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v25.x verified)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (default `mongodb://localhost:27017/campusshare`), remote MongoDB Atlas URI, or built-in test memory runner.

### 1. Installation
Install all root, backend, and frontend dependencies:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` in both backend and frontend directories:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Seed Sample Academic Resources & Demo Accounts
Populate the database with realistic sample resources (Rigol Oscilloscope, Campbell Biology, Sony Alpha 7 IV Kit, Arduino Mega Kits) and demo users across all roles:
```bash
npm run seed
```

### 4. Running the Development Environment
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Alternatively, run each service independently:
- **Backend API Server**:
  ```bash
  npm run server
  ```
- **Frontend Client**:
  ```bash
  npm run client
  ```

---

## 👥 Demo Credentials

The seeder provides pre-configured verified accounts for testing all system workflows:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Student (Steward)** | `elena.rostova@campus.edu` | `Password123!` | List resources, approve loans, borrow items |
| **Student (Borrower)** | `marcus.vance@campus.edu` | `Password123!` | Search, submit borrow requests, return items |
| **Faculty Member** | `dr.chen@campus.edu` | `Password123!` | Institutional lab gear steward |
| **Club Coordinator** | `robotics.club@campus.edu` | `Password123!` | Shared student club inventory manager |
| **System Administrator**| `admin@campus.edu` | `AdminPass123!` | User verification, listing moderation, audit logs |

---

## 📂 Project Directory Structure

```
├── .gitignore                         # Complete ignore rules (env, secrets, logs, builds)
├── .env.example                       # Root environment variables template
├── package.json                       # Root workspace orchestration
├── README.md                          # Main project guide (this document)
├── BUILD_STATE.md                     # Current build status, milestones & progress
├── PROJECT_HANDOFF.md                 # Handoff notes for future developers & AI accounts
├── SRS_Community_Resource_Platform_Final.docx # IEEE SRS Specification Document
├── docs/
│   ├── MODULE_GUIDE.md                # Functional breakdown of all system modules
│   ├── API_DOCUMENTATION.md           # REST API endpoints, schemas, and error codes
│   └── TESTING.md                     # Test strategy, execution guide, and test matrix
├── designs/
│   └── stitch_campusshare_resource_platform/ # Visual mockups & Design tokens
│       ├── academic_exchange/         # Design token manifest (DESIGN.md)
│       ├── campusshare_logo/          # Official SVG Logo and brand assets
│       ├── campusshare_main_dashboard_resource_catalog/ # Catalog UI mockup
│       ├── campusshare_add_resource_to_directory/       # Add Resource UI mockup
│       └── campusshare_resource_details_borrow_request/ # Details & Request mockup
├── backend/                           # Node.js / Express API
│   ├── src/
│   │   ├── config/                    # Database & environment configurations
│   │   ├── controllers/               # Route business logic handlers
│   │   ├── middleware/                # JWT auth, RBAC, validator, error handler
│   │   ├── models/                    # Mongoose schemas (User, Resource, Request, etc.)
│   │   ├── routes/                    # API route definitions
│   │   ├── utils/                     # Trust score math, seeders, helpers
│   │   └── server.js                  # Express app entrypoint
│   ├── tests/                         # Automated integration & unit tests
│   └── package.json                   # Backend dependencies
└── frontend/                          # React + Vite application
    ├── src/
    │   ├── assets/                    # SVG assets and branding
    │   ├── components/                # Reusable UI components matching Stitch system
    │   ├── context/                   # Auth & Notification contexts
    │   ├── pages/                     # Catalog, Add Resource, Details, MyLoans, Admin
    │   ├── services/                  # Axios API client integrations
    │   ├── styles/                    # Tailwind CSS configuration & tokens
    │   └── App.jsx                    # Route switch & layout shell
    └── package.json                   # Frontend dependencies
```

---

## 🧪 Testing

To execute the backend automated test suite:
```bash
npm test
```
See [docs/TESTING.md](file:///c:/Community%20Resource%20Exchange%20Platform/docs/TESTING.md) for details on test coverage, mocking, and end-to-end verification.

---

## 📄 License & Attribution
Prepared for the Community Resource Exchange Platform project under IEEE SRS guidelines.
Licensed under ISC.
