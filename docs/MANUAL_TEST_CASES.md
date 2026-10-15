# CampusShare — Manual Test Cases (Viva & Academic Demonstration)

This document contains 8 concise, high-value manual test cases designed for viva demonstration and academic evaluation. A student can follow each test case step-by-step through the web browser.

---

### Test Case 1: Valid User Login

- **Test Case ID**: TC-01
- **Test Case Name**: Valid Institutional User Login
- **Objective**: Verify that an active, registered campus student can sign in with valid credentials and access the platform.
- **Preconditions**:
  1. Backend API server is running on `http://localhost:5000`.
  2. Frontend client is running on `http://localhost:5173`.
  3. Database is seeded with demo users (`npm run seed` in `backend`).
- **Test Data**:
  - Email: `marcus.vance@campus.edu`
  - Password: `Password123!`
- **Steps**:
  1. Open the browser and navigate to `http://localhost:5173/`.
  2. Click the **"Sign In"** button on the top navigation bar.
  3. In the login modal, enter `marcus.vance@campus.edu` into the **Institutional Email** field.
  4. Enter `Password123!` into the **Password** field.
  5. Click the **"Sign In"** button.
- **Expected Result**:
  - The login modal closes.
  - The navigation bar updates to display the authenticated user's name: **"Rohan Deshmukh"**.
  - A valid JWT token is stored in local storage, and the user gains access to borrowing features.
- **Actual Result**: As expected. User logged in successfully and navigation displayed "Rohan Deshmukh".
- **Status**: Pass

---

### Test Case 2: Invalid User Login (Security Guard)

- **Test Case ID**: TC-02
- **Test Case Name**: Authentication Rejection with Invalid Password
- **Objective**: Verify that the authentication system safely rejects login attempts with incorrect credentials and displays a clear error message.
- **Preconditions**: Same as TC-01.
- **Test Data**:
  - Email: `marcus.vance@campus.edu`
  - Password: `WrongPassword999!`
- **Steps**:
  1. Open `http://localhost:5173/`.
  2. Click **"Sign In"** on the top navigation bar.
  3. Enter `marcus.vance@campus.edu` into the **Institutional Email** field.
  4. Enter `WrongPassword999!` into the **Password** field.
  5. Click the **"Sign In"** button.
- **Expected Result**:
  - Authentication fails.
  - An inline error alert appears: *"Invalid institutional email or password."*
  - The user remains logged out and no auth token is issued.
- **Actual Result**: As expected. Error message displayed and login was blocked.
- **Status**: Pass

---

### Test Case 3: Search and Filter Campus Resources

- **Test Case ID**: TC-03
- **Test Case Name**: Catalog Keyword Search and Filter
- **Objective**: Verify that students can search the catalog in real time by keywords and filter by academic categories.
- **Preconditions**: Demo resources are seeded in the database.
- **Test Data**:
  - Keyword: `"Chemistry"`
- **Steps**:
  1. Open `http://localhost:5173/`.
  2. Locate the search bar with placeholder *"Search textbooks, oscilloscope, lab gear, calculators..."*.
  3. Type `"Chemistry"` into the search input.
  4. Observe the catalog cards list.
- **Expected Result**:
  - The catalog automatically updates to display matching items, including *"Atkins Physical Chemistry 11th Edition"*.
  - Unrelated resources (such as oscilloscopes or calculators) are filtered out of the view.
- **Actual Result**: As expected. Real-time catalog filtering displayed Atkins Physical Chemistry textbook.
- **Status**: Pass

---

### Test Case 4: Submit Borrow Request & Verify Owner's Notification

- **Test Case ID**: TC-04
- **Test Case Name**: Submit Borrow Request with Dual Notification Dispatch
- **Objective**: Verify that an eligible borrower can submit a borrow request, creating an in-app notification and dispatching an email notification to the resource owner.
- **Preconditions**:
  1. Logged in as borrower Rohan Deshmukh (`marcus.vance@campus.edu`).
  2. Resource *"Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope"* is listed by Ananya Kulkarni (`elena.rostova@campus.edu`).
- **Test Data**:
  - Duration: 3 days (within max allowed loan duration)
  - Purpose: `"Waveform calibration for Senior Capstone Project"`
- **Steps**:
  1. On the catalog page, click on the **Rigol Oscilloscope** card or its **"Borrow Resource"** button.
  2. In the details modal, select a start date (e.g. tomorrow) and an end date 3 days later.
  3. In the **"Academic Purpose & Project Context"** textarea, type `"Waveform calibration for Senior Capstone Project"`.
  4. Click **"Submit Borrow Request"**.
  5. Sign out, and sign in as steward Ananya Kulkarni (`elena.rostova@campus.edu` / `Password123!`).
  6. Click the notification bell icon on the navbar.
- **Expected Result**:
  - Borrower sees a success confirmation message: *"Borrow request submitted successfully."*
  - Steward's notification drawer displays a new in-app alert: *"New Borrow Request: Rohan Deshmukh submitted a request to borrow 'Rigol DS1054Z...' for 3 days."*
  - An email notification is logged/sent to `elena.rostova@campus.edu` with subject `[CampusShare] New Borrow Request: Rigol DS1054Z...`.
- **Actual Result**: As expected. Request created, in-app notification delivered to steward, and email dispatched to owner address.
- **Status**: Pass

---

### Test Case 5: Approve Request & Verify Borrower's Notification

- **Test Case ID**: TC-05
- **Test Case Name**: Steward Approval & Borrower Notification
- **Objective**: Verify that the resource owner can approve an incoming borrow request, notifying the borrower through both in-app and email channels.
- **Preconditions**:
  1. An active pending borrow request exists from Rohan Deshmukh.
  2. Logged in as steward Ananya Kulkarni (`elena.rostova@campus.edu`).
- **Test Data**:
  - Request ID: Pending request on Rigol Oscilloscope.
- **Steps**:
  1. Navigate to **"My Borrowings"** tab on the navigation bar.
  2. Under **Ongoing Transactions**, select **"Incoming (As Steward)"**.
  3. Locate the pending request card from Rohan Deshmukh.
  4. Click the blue **"Approve Request"** button.
  5. Sign out and sign in as borrower Rohan Deshmukh (`marcus.vance@campus.edu` / `Password123!`).
  6. Check the notification bell icon.
- **Expected Result**:
  - Steward sees success alert: *"Request approved! Coordinate pickup with borrower."*
  - Request status changes to `"approved"`.
  - Borrower receives an in-app notification: *"Borrow Request Approved: Your request for 'Rigol DS1054Z...' was approved by Ananya Kulkarni."*
  - Borrower receives an email notification with pickup coordinates and next steps.
- **Actual Result**: As expected. Status updated to Approved; borrower received both in-app and email notifications.
- **Status**: Pass

---

### Test Case 6: Verify Active Transaction Appears Under Ongoing Transactions

- **Test Case ID**: TC-06
- **Test Case Name**: Ongoing Transactions Classification Integrity
- **Objective**: Verify that active, non-returned transactions (pending, approved, borrowed, return_requested) are grouped under the "Ongoing Transactions" tab.
- **Preconditions**:
  1. User Rohan Deshmukh is logged in.
  2. User has an active approved request or checked-out item (e.g. Sony Alpha 7 IV camera).
- **Test Data**: Active loan records.
- **Steps**:
  1. Click **"My Borrowings"** (`navbar-tab-loans`) on the navbar.
  2. Click the **"Ongoing Transactions"** tab (`tab-ongoing`).
  3. Click **"Outgoing (As Borrower)"** (`tab-outgoing`).
  4. Observe the listed transaction cards and their status badges.
  5. Click the **"Completed Transactions"** tab (`tab-completed`).
- **Expected Result**:
  - Active items with status `"In Custody / Checked Out"`, `"Approved"`, or `"Pending Approval"` appear strictly under **Ongoing Transactions**.
  - No active or unreturned items appear under the **Completed Transactions** tab.
  - Refreshing the web page preserves this separation accurately.
- **Actual Result**: As expected. Ongoing tab correctly displayed active transactions with status badges; completed tab contained zero ongoing items.
- **Status**: Pass

---

### Test Case 7: Confirm Return & Move to Completed Transactions

- **Test Case ID**: TC-07
- **Test Case Name**: Return Confirmation Moves Transaction to Completed
- **Objective**: Verify that when a steward confirms the physical return of an item, the transaction officially transitions from "Ongoing Transactions" to "Completed Transactions" and enables ratings.
- **Preconditions**:
  1. Logged in as steward Ananya Kulkarni (`elena.rostova@campus.edu`).
  2. A resource is currently in custody or has return initiated.
- **Test Data**:
  - Return notes: `"Returned in good condition with all probes."`
- **Steps**:
  1. Go to **"My Borrowings"** -> **"Ongoing Transactions"** -> **"Incoming (As Steward)"**.
  2. Find the checked-out item card.
  3. Click **"Confirm Successful Return"**.
  4. Observe the Ongoing Transactions list.
  5. Click the **"Completed Transactions"** tab (`tab-completed`).
  6. Locate the returned transaction.
- **Expected Result**:
  - The transaction disappears from the **Ongoing Transactions** tab.
  - The transaction now appears under **Completed Transactions** with status badge *"Returned & Completed"*.
  - Both participants' `totalCompletedLoans` count increments.
  - The **"Rate Borrower"** and **"Rate Steward"** action buttons become available.
  - The resource status in the catalog automatically reverts to `"available"`.
- **Actual Result**: As expected. Transaction transitioned seamlessly to Completed Transactions, catalog availability restored, rating options unlocked.
- **Status**: Pass

---

### Test Case 8: Business Rule Guard — Prevent Self-Borrowing & Withdrawal with Active Request

- **Test Case ID**: TC-08
- **Test Case Name**: Academic Governance & Business Invariant Enforcement
- **Objective**: Verify SRS business rule invariants: (1) A steward cannot borrow their own listed resource, and (2) A steward cannot withdraw a resource listing that has an active request or loan.
- **Preconditions**:
  1. Logged in as steward Ananya Kulkarni (`elena.rostova@campus.edu`).
  2. Ananya owns *"Rigol DS1054Z Oscilloscope"* and *"Arduino Mega Kit"*.
- **Test Data**:
  - Resource 1: Rigol Oscilloscope (Owned by Ananya).
  - Resource 5: Arduino Mega Kit (Has active pending request from Rohan).
- **Steps**:
  1. On the catalog page, click on Ananya's own listing: **Rigol Oscilloscope**.
  2. Note the borrow action button or submit a borrow request for this item.
  3. Go to **"My Borrowings"** -> **"My Listed Resources"** tab (`tab-my-listings`).
  4. Find the **"Arduino Mega 2560 R3 Advanced Sensor & Actuator Kit"** (which has an active pending request).
  5. Click the red **"Withdraw"** button.
  6. In the modal, click **"Confirm Withdraw"**.
- **Expected Result**:
  - Part 1 (Self-Borrowing Guard): The system blocks self-borrowing with an error message: *"Business Rule Violation: You cannot borrow your own resource."*
  - Part 2 (Active Request Withdrawal Guard): The withdrawal modal warns about **Active Hold / Loan Restriction** and the backend rejects the withdrawal: *"SRS 5.5: Cannot withdraw resource with active requests or ongoing loans."*
- **Actual Result**: As expected. Both business rules were strictly enforced with clear explanatory feedback to the user.
- **Status**: Pass
