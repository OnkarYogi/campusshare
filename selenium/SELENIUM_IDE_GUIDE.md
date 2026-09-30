# Selenium IDE 4.0.1-beta.14 Test Automation Guide
**Project:** Community Resource Exchange Platform (MIT World Peace University, Pune)  
**Artifact:** `selenium/community-resource-exchange.side`  
**Test Runner Target:** Selenium IDE 4.0.1-beta.14 (Windows)  

---

## 1. System URLs & Pre-Flight Prerequisites

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:5173` | React.js + Vite Web Application |
| **Backend REST API** | `http://localhost:5000` | Node.js + Express + Mongoose API server |
| **API Base Endpoint** | `http://localhost:5000/api` | REST endpoints for auth, resources, borrow, ratings |
| **Selenium IDE Base URL** | `http://localhost:5173` | Configured directly in `community-resource-exchange.side` |

### Step 1: Start Backend API Server
Open PowerShell in the project directory:
```powershell
cd "c:\Community Resource Exchange Platform\backend"
npm run dev
```
*Verify: The console should print `[Server] Running in development mode on port 5000` and `[MongoDB] Connected: ...`.*

### Step 2: Start Frontend Application
Open a second PowerShell window:
```powershell
cd "c:\Community Resource Exchange Platform\frontend"
npm run dev
```
*Verify: Vite should output `Local: http://localhost:5173/`.*

### Step 3: Seed / Reset Database State (Crucial)
Before running the automated test suite, ensure the database is reset to the deterministic seed state:
```powershell
cd "c:\Community Resource Exchange Platform\backend"
npm run seed
```
This populates all 7 student/faculty/club accounts, initial resource listings, and specific test conditions (such as unverified user status, active borrowing quotas, and unreturned item holds).

---

## 2. Seeded Institutional Test Accounts

All accounts belong to **MIT World Peace University (MIT-WPU), Pune**:

| Role / Test Persona | Full Name | Institutional Email | Password | Primary Purpose in Test Suite |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Borrower** | Rohan Deshmukh | `marcus.vance@campus.edu` | `Password123!` | **BB-01**, **BB-02**, **BB-04**, **WB-05** |
| **Demo Steward** | Ananya Kulkarni | `elena.rostova@campus.edu` | `Password123!` | **BB-05**, **WB-02**, **WB-04** |
| **Unverified Student** | Aarav Sharma | `aarav.sharma@campus.edu` | `Password123!` | **WB-01** (Verification enforcement) |
| **Max Quota Borrower** | Aditya Patil | `aditya.patil@campus.edu` | `Password123!` | **WB-03** (3-active-loan quota limit) |
| **Faculty Member** | Dr. Priya Joshi | `dr.chen@campus.edu` | `Password123!` | Resource owner (Chemistry Lab) |
| **Club Coordinator** | MIT-WPU Robotics Club | `robotics.club@campus.edu` | `Password123!` | Resource owner (Sony Camera, Prototyping) |
| **Administrator** | System Administrator | `admin@campus.edu` | `AdminPass123!` | Platform governance & verification |

---

## 3. How to Open & Run the Project in Selenium IDE

1. **Launch Selenium IDE**: Open the **Selenium IDE 4.0.1-beta.14** application on your Windows machine.
2. **Open Project**:
   - In the welcome dialog, click **"Open an existing project"** (or click the folder icon / File menu).
   - Browse to:
     `c:\Community Resource Exchange Platform\selenium\community-resource-exchange.side`
   - Click **Open**.
3. **Inspect Suite**:
   - In the left sidebar, you will see the **10 Tests** and the suite **"Community Resource Exchange - All 10 Tests"**.
4. **Execution Options**:
   - **Run Entire Suite**: Click the double-play icon (**"Run all tests"**) at the top of the Selenium IDE window.
   - **Run Individual Test**: Click any individual test in the left navigation panel, then click the single-play icon (**"Run current test"**).
5. **Adjust Execution Speed (Recommended)**:
   - Set the execution delay slider in Selenium IDE to **Slow** or **Medium** (around 500ms delay between steps) to allow transitions and animations to complete smoothly.

---

## 4. Recommended Test Execution Order

Because certain tests mutate state (such as submitting requests or withdrawing an available item), execute the tests in the following order:

```
Step 1: npm run seed (Reset database)
Step 2: Run BB-01 (Valid Login)
Step 3: Run BB-02 (Invalid Login)
Step 4: Run BB-03 (Resource Search)
Step 5: Run WB-01 (Unverified User Borrow)
Step 6: Run WB-02 (Self Borrow)
Step 7: Run WB-03 (Maximum Active Borrowings)
Step 8: Run WB-04 (Withdrawal With Active Request)
Step 9: Run WB-05 (Rating Before Return)
Step 10: Run BB-04 (Borrow Available Resource)
Step 11: Run BB-05 (Resource Withdrawal)
```

> **Note on Reseeding**: If you re-run the tests repeatedly, simply run `npm run seed` in `backend/` to immediately restore the catalog and user balances to their starting states.

---

## 5. Specification of the 10 Test Cases

### Black-Box Tests

#### `BB-01 Valid Login`
- **Objective**: Verify that a verified user with valid credentials logs in successfully and receives an active session.
- **Actor**: Rohan Deshmukh (`marcus.vance@campus.edu` / `Password123!`)
- **Actions**:
  1. Open homepage (`/`).
  2. Click `css=[data-testid="navbar-signin"]`.
  3. Enter email and password in `css=[data-testid="login-email"]` and `css=[data-testid="login-password"]`.
  4. Click `css=[data-testid="login-submit"]`.
- **Expected Assertion**:
  - `css=[data-testid="navbar-user-name"]` displays text `"Rohan Deshmukh"`.
  - Sign-out button is accessible.

#### `BB-02 Invalid Login`
- **Objective**: Verify that incorrect credentials fail gracefully with an explicit error message and do not authenticate.
- **Actor**: `marcus.vance@campus.edu` with invalid password `WrongPassword999!`.
- **Actions**:
  1. Open `/` and open Sign-In modal.
  2. Enter valid email and incorrect password.
  3. Click `css=[data-testid="login-submit"]`.
- **Expected Assertion**:
  - `css=[data-testid="auth-error"]` is visible with text `"Invalid institutional credentials."`.
  - User remains unauthenticated.

#### `BB-03 Resource Search`
- **Objective**: Verify that catalog keyword filtering accurately displays matching campus equipment.
- **Actor**: Guest / Campus visitor.
- **Actions**:
  1. Open `/`.
  2. Enter `"Oscilloscope"` into `css=[data-testid="catalog-search-input"]`.
- **Expected Assertion**:
  - `css=[data-testid="resource-title"]` displays `"Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope with 4 Probes & Calibration Cert"`.

#### `BB-04 Borrow Available Resource`
- **Objective**: Verify that a verified borrower can submit a valid borrow request for an available resource.
- **Actor**: Rohan Deshmukh (`marcus.vance@campus.edu` / `Password123!`).
- **Actions**:
  1. Login as Rohan Deshmukh.
  2. Search for `"Physical Chemistry"` (Atkins textbook).
  3. Click `css=[data-testid="resource-card-action"]` to open Resource Details modal.
  4. Enter purpose note into `css=[data-testid="borrow-purpose"]`.
  5. Click `css=[data-testid="borrow-submit-btn"]`.
- **Expected Assertion**:
  - `css=[data-testid="borrow-success"]` displays `"Borrow request submitted successfully."`.

#### `BB-05 Resource Withdrawal`
- **Objective**: Verify that a resource steward can withdraw their own listing when there are no active requests.
- **Actor**: Ananya Kulkarni (`elena.rostova@campus.edu` / `Password123!`).
- **Target Item**: `Mitutoyo 500-196-30 Advanced Digital Vernier Caliper` (has 0 active requests).
- **Actions**:
  1. Login as Ananya Kulkarni.
  2. Search and open the Mitutoyo Vernier Caliper listing.
  3. Click `css=[data-testid="steward-withdraw-trigger"]`.
  4. Click `css=[data-testid="confirm-withdraw-btn"]`.
- **Expected Assertion**:
  - The resource is withdrawn from catalog; details modal closes and listing is archived.

---

### White-Box Derived Tests (Business Rules & Invariants)

#### `WB-01 Unverified User Borrow`
- **Rule Enforced**: SRS Rule 5.5 — Only institutionally verified members may submit borrowing requests.
- **Actor**: Aarav Sharma (`aarav.sharma@campus.edu` / `Password123!`, `isVerified: false`).
- **Actions**:
  1. Login as Aarav Sharma.
  2. Open any available resource (e.g. Rigol Oscilloscope).
  3. Enter academic purpose and click `css=[data-testid="borrow-submit-btn"]`.
- **Expected Assertion**:
  - `css=[data-testid="borrow-error"]` displays `"Institutional verification required to perform this action."`.
  - Request is blocked at both client and server boundaries.

#### `WB-02 Self Borrow`
- **Rule Enforced**: SRS Rule 5.5 — Users cannot borrow resources for which they are the designated steward.
- **Actor**: Ananya Kulkarni (`elena.rostova@campus.edu` / `Password123!`).
- **Target Item**: Rigol Oscilloscope (stewarded by Ananya).
- **Actions**:
  1. Login as Ananya Kulkarni.
  2. Open the Rigol Oscilloscope details modal.
- **Expected Assertion**:
  - `css=[data-testid="steward-notice"]` is visible with steward management controls.
  - `css=[data-testid="borrow-submit-btn"]` is **NOT present** in the DOM.

#### `WB-03 Maximum Active Borrowings`
- **Rule Enforced**: SRS Rule 5.5 — A user cannot hold more than 3 active borrowings concurrently.
- **Actor**: Aditya Patil (`aditya.patil@campus.edu` / `Password123!`, holds 3 active items).
- **Actions**:
  1. Login as Aditya Patil.
  2. Open Rigol Oscilloscope and submit borrow request.
- **Expected Assertion**:
  - `css=[data-testid="borrow-error"]` displays `"Business Rule Violation: Maximum limit of 3 active borrowings reached. Return an item before borrowing more."`.

#### `WB-04 Withdrawal With Active Request`
- **Rule Enforced**: SRS Rule 5.5 & FR-11 — A steward cannot withdraw or delete a listing that has pending, approved, or active borrow requests.
- **Actor**: Ananya Kulkarni (`elena.rostova@campus.edu` / `Password123!`).
- **Target Item**: `Arduino Mega 2560 R3` (has pending borrow request from Rohan).
- **Actions**:
  1. Login as Ananya Kulkarni.
  2. Open Arduino Mega details modal.
  3. Click `css=[data-testid="steward-withdraw-trigger"]`.
  4. Click `css=[data-testid="confirm-withdraw-btn"]`.
- **Expected Assertion**:
  - `css=[data-testid="withdraw-error"]` displays `"Cannot delete, withdraw, or archive resource while there are pending, approved, or active borrow requests."`.
  - Item remains listed and active.

#### `WB-05 Rating Before Return`
- **Rule Enforced**: SRS Rule 5.5 & FR-23 — Ratings can only be submitted AFTER an item has been returned and confirmed by the steward.
- **Actor**: Rohan Deshmukh (`marcus.vance@campus.edu` / `Password123!`).
- **Target Item**: `Sony Alpha 7 IV Camera` (currently in custody, status: `borrowed`).
- **Actions**:
  1. Login as Rohan Deshmukh.
  2. Navigate to `css=[data-testid="navbar-tab-loans"]` and switch to `css=[data-testid="tab-outgoing"]`.
  3. Locate the loan card for the Sony Alpha 7 IV.
- **Expected Assertion**:
  - `css=[data-testid="loan-status-badge"]` displays text `"In Custody / Checked Out"`.
  - `css=[data-testid="rate-steward-btn"]` is **NOT present** in the DOM (unreturned items cannot be rated).

---

## 6. Frontend Selector Reference (`data-testid`)

All automated test targets use standardized `data-testid` attributes:

| Element / Component | Locator | Description |
| :--- | :--- | :--- |
| **Sign-In Trigger** | `css=[data-testid="navbar-signin"]` | Opens Auth Modal |
| **Login Email Input** | `css=[data-testid="login-email"]` | Institutional email input |
| **Login Password Input** | `css=[data-testid="login-password"]` | Password input |
| **Login Submit Button** | `css=[data-testid="login-submit"]` | Form submit button |
| **Auth Error Box** | `css=[data-testid="auth-error"]` | Login / registration error notice |
| **User Name Display** | `css=[data-testid="navbar-user-name"]` | Active user name badge in navbar |
| **User Dropdown Trigger** | `css=[data-testid="navbar-user-menu"]` | User profile / session dropdown |
| **Sign Out Button** | `css=[data-testid="navbar-signout"]` | Clears JWT session |
| **Catalog Search Input** | `css=[data-testid="catalog-search-input"]` | Full-text catalog filter |
| **Resource Card Action** | `css=[data-testid="resource-card-action"]` | "Borrow / Details" button on card |
| **Resource Title** | `css=[data-testid="resource-title"]` | Title on card or modal |
| **Modal Close Button** | `css=[data-testid="modal-close-btn"]` | Closes details modal |
| **Borrow Purpose Area** | `css=[data-testid="borrow-purpose"]` | Academic purpose `<textarea>` |
| **Borrow Submit Button** | `css=[data-testid="borrow-submit-btn"]` | Request button |
| **Borrow Error Box** | `css=[data-testid="borrow-error"]` | Validation error message |
| **Borrow Success Box** | `css=[data-testid="borrow-success"]` | Success message |
| **Steward Notice** | `css=[data-testid="steward-notice"]` | Banner shown to owner of listing |
| **Steward Withdraw Trigger** | `css=[data-testid="steward-withdraw-trigger"]` | "Withdraw Listing" button |
| **Confirm Withdraw Button** | `css=[data-testid="confirm-withdraw-btn"]` | Modal confirmation button |
| **Withdraw Error Box** | `css=[data-testid="withdraw-error"]` | Error message when withdrawal blocked |
| **Loans Tab** | `css=[data-testid="navbar-tab-loans"]` | "My Loans" navbar link |
| **Outgoing Requests Tab** | `css=[data-testid="tab-outgoing"]` | "My Borrow Requests" sub-tab |
| **Loan Status Badge** | `css=[data-testid="loan-status-badge"]` | Status indicator pill on loan card |
| **Rate Steward Button** | `css=[data-testid="rate-steward-btn"]` | Rating trigger for returned loans |

---

## 7. Troubleshooting & Frequently Asked Questions

1. **Why did a test fail with "Element not found"?**
   - Verify that both the backend (`localhost:5000`) and frontend (`localhost:5173`) are running.
   - Run `npm run seed` in `backend/` to guarantee deterministic state.
   - In Selenium IDE, slow down the test execution slider to allow React UI state transitions to finish.
2. **Can I run tests in parallel?**
   - The suite is configured with `parallel: false` because tests share demo accounts and state. Sequential execution is recommended.
3. **How do I reset after manual exploratory testing?**
   - Execute:
     ```powershell
     cd "c:\Community Resource Exchange Platform\backend"
     npm run seed
     ```
   - This resets all MongoDB documents to the canonical testing baseline.
