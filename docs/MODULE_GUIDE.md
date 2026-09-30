# CampusShare: Module Guide

This document provides a breakdown of each functional module in CampusShare, mapping each module directly to the IEEE SRS specification increments and detailing database schemas, business logic, and UI interactions.

---

## 📦 Module 1: Authentication & Account Management (SRS Section 4.1)

### Purpose
Provides secure registration, institutional identity verification, login, session issuance via JWT, and profile access.

### Functional Requirements
- **FR-01**: Registration requiring valid institutional email domain (`.edu`, `.ac.*`, or configured institutional suffix).
- **FR-02**: Email verification mechanism before account activation.
- **FR-03**: Secure login with bcrypt password hashing (minimum 10 salt rounds) and JWT issuance.
- **FR-04**: Secure logout / token invalidation handling on client.
- **FR-05**: Password reset workflow with reset token generation.

### Key Components
- **Model**: `User`
  - Fields: `name`, `email`, `passwordHash`, `role` (`student`, `faculty`, `club_coordinator`, `admin`), `department`, `campusId`, `avatarUrl`, `isVerified`, `verificationToken`, `isSuspended`, `trustScore`, `totalReviews`.
- **Controller**: `authController.js`
- **Middleware**: `auth.js` (JWT validation), `requireRole.js` (RBAC authorization).

---

## 👤 Module 2: Profile Management (SRS Section 4.2)

### Purpose
Allows users to manage contact details, campus building/department affiliations, profile imagery, and inspect their borrowing/lending track record.

### Functional Requirements
- **FR-06**: View and update personal profile attributes.
- **FR-07**: View comprehensive history of requested, borrowed, and lent resources.
- **FR-08**: Upload or link profile avatar and contact details.

### Key Components
- **Controller**: `userController.js`
- **Frontend View**: User Profile Modal & Dashboard Steward Card.

---

## 📚 Module 3: Resource Management & Catalog (SRS Section 4.3)

### Purpose
Allows verified resource owners (students, faculty, club coordinators) to list physical academic items, edit equipment details, and enable the campus community to search and filter items.

### Functional Requirements
- **FR-09**: Add a new resource listing (Title, Category, Identifiers, Condition, Location, Max Loan Duration, Photos).
- **FR-10**: Edit existing resource details (restricted to the original steward or administrator).
- **FR-11**: Delete / archive a listing (strictly guarded against deletion if active requests/borrowings exist).
- **FR-12**: Provide multiple photos or photo URLs with primary thumbnail preview.
- **FR-13**: Search and filter resources by keywords, department, category, condition, and availability.
- **FR-14**: View comprehensive resource details, specifications, location, and steward reputation.

### Key Components
- **Model**: `Resource`
  - Fields: `title`, `description`, `category` (`textbooks`, `electronics`, `lab_gear`, `project_kits`, `sports`, `other`), `identifiers`, `condition` (`brand_new`, `like_new`, `good`, `fair`), `department`, `location`, `maxLoanDurationDays`, `images`, `steward` (ref: User), `status` (`available`, `requested`, `borrowed`, `maintenance`, `archived`), `isModerated`.
- **Controller**: `resourceController.js`
- **Frontend Views**:
  - `CatalogDashboard.jsx` (matches `campusshare_main_dashboard_resource_catalog/code.html`)
  - `AddResourceWizard.jsx` (matches `campusshare_add_resource_to_directory/code.html`)
  - `ResourceDetailsModal.jsx` (matches `campusshare_resource_details_borrow_request/code.html`)

---

## 🔄 Module 4: Borrowing Workflow Engine (SRS Section 4.4)

### Purpose
Manages the end-to-end borrowing lifecycle from initial request to return confirmation, enforcing concurrency controls and institutional borrowing quotas.

### Lifecycle State Machine
```
[ Available ]
      │
      │ (Borrower sends request)
      ▼
 [ Requested / Pending ] ──────────(Rejected / Cancelled)──────────► [ Available ]
      │
      │ (Steward approves request)
      ▼
 [ Approved / Ready for Hand-off ]
      │
      │ (Steward confirms hand-off)
      ▼
 [ Borrowed / In Custody ]
      │
      │ (Steward confirms return)
      ▼
  [ Returned ] ─────────────────────────────────────────────────────► [ Available ]
      │
      ▼
(Ratings & Trust Score Recalculation)
```

### Functional Requirements & Business Rules
- **FR-15**: Submit borrow request with date window and academic purpose.
- **FR-16**: Steward approves or rejects request with optional note.
- **FR-17**: Borrower can cancel pending request before approval.
- **FR-18**: Mark item as collected / handed over (`borrowed`).
- **FR-19**: Confirm return of item by steward (`returned`), reverting resource to `available`.
- **FR-20**: Automatic status updates synchronized between Resource and Request documents.
- **SRS Invariants**:
  - Max 3 active borrowings per user.
  - Cannot borrow own items.
  - Non-verified users cannot borrow.

### Key Components
- **Model**: `BorrowRequest`
  - Fields: `resource`, `borrower`, `steward`, `startDate`, `endDate`, `durationDays`, `purpose`, `status`, `handoverNotes`, `returnNotes`, `timestamps`.
- **Controller**: `borrowController.js`
- **Frontend View**: `MyLoansDashboard.jsx`

---

## 🔔 Module 5: Notifications & Trust Scoring (SRS Section 4.5)

### Purpose
Dispatches timely alerts for request status changes and due dates, while calculating an objective institutional trust score from completed transactions.

### Trust Score Formula
The trust score $T$ is computed on a scale from $1.0$ to $5.0$:
$$T = \min\left(5.0, \, \max\left(1.0, \, w_r \cdot \bar{R} + w_c \cdot C + w_o \cdot O\right)\right)$$
Where:
- $\bar{R}$: Average review star rating (1 to 5)
- $C$: Transaction completion bonus ($\min(0.5, 0.05 \times N_{\text{completed}})$)
- $O$: On-time return bonus ($0.5$ if return is on or before due date)
- $w_r, w_c, w_o$: Balanced weighting parameters

### Functional Requirements
- **FR-21**: Real-time / in-app notifications on approval, rejection, hand-off, and return.
- **FR-22**: Due-date reminder notifications.
- **FR-23**: Post-return reciprocal rating and review submission.
- **FR-24**: Dynamic trust score calculation and profile display.

### Key Components
- **Models**: `Notification`, `Rating`
- **Utils**: `trustScoreEngine.js`, `notificationHelper.js`
- **Controller**: `notificationController.js`, `ratingController.js`

---

## 🛡️ Module 6: Administration & Governance (SRS Section 4.6)

### Purpose
Empowers institutional administrators to verify student and faculty accounts, moderate equipment listings, suspend accounts that violate policies, and review audit logs.

### Functional Requirements
- **FR-25**: Manually verify or revoke user institutional credentials.
- **FR-26**: Moderate or hide flagged/inappropriate resource listings.
- **FR-27**: Suspend users involved in disputes or policy violations.
- **FR-28**: View platform analytics, transaction logs, and security audit records.

### Key Components
- **Model**: `AuditLog`
- **Controller**: `adminController.js`
- **Frontend View**: `AdminPortal.jsx`
