# Project Handoff Documentation

This document serves as the primary technical orientation and transfer document for developers and AI assistants taking over or continuing development on the **Community Resource Exchange Platform (CampusShare)**.

---

## 🧭 Project Identity & Context

- **Project Title**: Community Resource Borrowing and Lending Platform for Educational Institutions
- **Branding**: CampusShare ("Academic Resource Exchange")
- **Origin Specification**: IEEE Std SRS Version 1.0 (`SRS_Community_Resource_Platform_Final.docx`)
- **Visual Design Identity**: Stitch Design System — "Academic Exchange" (`designs/stitch_campusshare_resource_platform/academic_exchange/DESIGN.md`)

---

## 🛠️ Technology Stack Summary

| Layer | Primary Technology | Key Libraries / Frameworks |
|---|---|---|
| **Frontend** | React 18 / Vite | Tailwind CSS, Lucide Icons, Material Symbols, Axios |
| **Backend** | Node.js (v25+) / Express | Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator, Morgan |
| **Database** | MongoDB | Mongoose ODM, MongoDB-Memory-Server (for automated tests / standalone fallback) |
| **Architecture** | REST API + Single Page App | Role-Based Access Control (RBAC), Incremental Modules |

---

## 🔑 Critical Business Rules & Invariants (SRS Section 5.5)

Any developer or AI agent modifying the codebase must strictly preserve the following business rules:

1. **Institutional Verification Requirement**:
   - Only users with an institutional email (`@*.edu`, `@*.ac.in`, `@campus.edu`, etc.) or explicitly verified accounts (`isVerified: true`) can create listings or submit borrow requests.
2. **Anti-Self-Borrowing Rule**:
   - A user cannot submit a borrow request for a resource that they personally listed (`borrower_id !== steward_id`).
3. **Active Borrowing Quota**:
   - A single borrower may hold at most **three (3)** active borrowings concurrently. An active borrowing is any request in `approved` or `borrowed` state that has not yet reached `returned`.
4. **Transaction-Locked Ratings**:
   - Ratings and reviews can **only** be submitted for completed transactions (`status === 'returned'`). Both the steward and the borrower may rate each other once per transaction.
5. **Steward Custodial Return Authority**:
   - Only the resource owner (steward) possesses the authorization to confirm the successful return of a resource and revert its state to `available`.
6. **Deletion Guard on Active Resources**:
   - A resource listing cannot be deleted or archived if there are pending, approved, or currently borrowed requests associated with it.
7. **Zero Monetization Principle**:
   - The platform strictly rejects any shopping cart, monetary pricing, deposits, or commercial transactions. All handoffs are mutual academic loans.

---

## 🎨 Design Tokens & Visual Guide

Reference: `designs/stitch_campusshare_resource_platform/academic_exchange/DESIGN.md`

- **Collegiate Navy (Primary)**: `#1E3A8A` (Header, primary actions, branding)
- **Sustainability Teal / Emerald (Secondary)**: `#0D9488` / `#10B981` (Availability tags, verification badges, positive states)
- **Background / Canvas**: `#F8F9FF` or `#F8FAFC`
- **Surface Cards**: `#FFFFFF` with `1px solid #E2E8F0` border and `0.5rem` to `1rem` radius.
- **Typography**:
  - Headings & Branding: **Plus Jakarta Sans** (SemiBold / Bold)
  - Body & Metadata: **Inter** (Regular / Medium / SemiBold)
- **Status Indicator Badges**:
  - `Available`: Green pill (`bg-[#F0FDF4]`, `text-[#15803D]`, 6px dot `#10B981`)
  - `Reserved / Requested`: Amber pill (`bg-[#FEF3C7]`, `text-[#B45309]`, 6px dot `#F59E0B`)
  - `On Loan / Borrowed`: Slate pill (`bg-[#F1F5F9]`, `text-[#475569]`, 6px dot `#94A3B8`)

---

## ⚙️ How to Resume Development

1. **Verify Environment**:
   ```bash
   node -v # Ensure >= 18.x
   npm -v  # Ensure >= 9.x
   ```
2. **Review Build State**:
   Inspect [BUILD_STATE.md](file:///c:/Community%20Resource%20Exchange%20Platform/BUILD_STATE.md) to identify the latest completed milestone and the active milestone.
3. **Execute Backend Tests**:
   ```bash
   npm test
   ```
4. **Run Dev Environment**:
   ```bash
   npm run dev
   ```
5. **Check API and Module References**:
   - Modules: [docs/MODULE_GUIDE.md](file:///c:/Community%20Resource%20Exchange%20Platform/docs/MODULE_GUIDE.md)
   - Endpoints: [docs/API_DOCUMENTATION.md](file:///c:/Community%20Resource%20Exchange%20Platform/docs/API_DOCUMENTATION.md)
   - Testing: [docs/TESTING.md](file:///c:/Community%20Resource%20Exchange%20Platform/docs/TESTING.md)

---

## 🗃️ Data Seeding & Default Credentials

Run the database seeder:
```bash
npm run seed
```
Demo accounts:
- Student: `elena.rostova@campus.edu` / `Password123!`
- Borrower: `marcus.vance@campus.edu` / `Password123!`
- Faculty: `dr.chen@campus.edu` / `Password123!`
- Club Coordinator: `robotics.club@campus.edu` / `Password123!`
- Admin: `admin@campus.edu` / `AdminPass123!`
