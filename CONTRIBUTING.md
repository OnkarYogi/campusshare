# Contributing to CampusShare

Thank you for your interest in contributing to **CampusShare (Community Resource Exchange Platform)**! This project was originated in an educational setting at MIT World Peace University (MIT-WPU), Pune, as an academic resource-sharing initiative.

---

## 📜 Code of Conduct & Academic Integrity

CampusShare is designed for non-monetary resource sharing within academic communities. All contributions should uphold principles of:
- Academic integrity and accountability.
- High-quality, safe, and reproducible code.
- Respectful collaboration.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (verified on Node.js `v20+` and `v25+`).
- **npm**: `v9.0.0` or higher.
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/campusshare`) or MongoDB Atlas.
  - *Note:* The backend also includes a built-in `mongodb-memory-server` fallback for zero-dependency local development and testing.

### 2. Getting Started
```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install all dependencies (root, backend, and frontend)
npm run install:all

# Configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Seed initial academic demo data and accounts
npm run seed

# Start development servers concurrently
npm run dev
```

The services will be available at:
- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure all tests pass and frontend builds cleanly:

```bash
# Run backend test suites (Jest + In-memory MongoDB)
npm test

# Run frontend production build (Vite + Tailwind CSS)
npm run build
```

### Writing Tests
- All backend routes, business rules, and models should have unit or integration tests under `backend/tests/`.
- Ensure tests remain isolated and do not depend on external network services.
- Adhere to the core invariants specified in [PROJECT_HANDOFF.md](file:///c:/Community%20Resource%20Exchange%20Platform/PROJECT_HANDOFF.md):
  1. No self-borrowing (`borrower !== steward`).
  2. Maximum 3 concurrent active borrowings per borrower.
  3. Ratings only allowed after return is confirmed.
  4. Deletion blocked on items with active loans.
  5. Only stewards can confirm returns.

---

## 🎨 Design System

CampusShare implements the **Academic Exchange** Stitch Design System:
- **Primary Color**: Collegiate Navy (`#1E3A8A`)
- **Accent Color**: Sustainability Emerald / Teal (`#0D9488` / `#10B981`)
- **Typography**: Plus Jakarta Sans (Headings) and Inter (Body/UI)
- See `designs/stitch_campusshare_resource_platform/academic_exchange/DESIGN.md` for tokens and guidelines.

---

## 📋 Pull Request Process

1. Fork or branch off `master`.
2. Keep commits atomic, descriptive, and conventional (e.g. `feat:`, `fix:`, `docs:`, `test:`).
3. Do not commit `.env` files, credentials, or generated build directories.
4. Verify tests pass with `npm test` and build succeeds with `npm run build`.
5. Open a Pull Request detailing the changes made, motivation, and verification steps.
