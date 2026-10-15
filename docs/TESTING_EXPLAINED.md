# CampusShare: Testing Concepts & Viva Preparation Guide

This guide explains the testing concepts, terminology, and test architecture of CampusShare in clear, academic language suitable for undergraduate software engineering viva examinations and project evaluations.

---

## 1. Fundamental Testing Concepts Explained

### What is a Test Case?
A **Test Case** is a formalized, documented specification containing:
1. A unique identifier (e.g., `TC-01`).
2. An **Objective** describing what feature is being evaluated.
3. **Preconditions** that must be true before the test starts (e.g., user is logged in, item is listed).
4. **Test Data** (e.g., email address, password, loan duration).
5. Numbered **Execution Steps** to guide the tester or test runner.
6. An **Expected Result** defining the correct behavior.
7. An **Actual Result** recording what occurred during execution.
8. A final **Status** (`Pass` or `Fail`).

### Expected Result vs. Actual Result
- **Expected Result**: What the system *should* do according to the Software Requirements Specification (SRS) and design specifications.
- **Actual Result**: The real, observed behavior of the software when the test steps are executed.

### What Does Pass vs. Fail Mean?
- **Pass**: The actual result exactly matches the expected result. The system conforms to requirements.
- **Fail**: A discrepancy exists between expected and actual behavior. This identifies a software defect, broken logic, or regression.

---

## 2. Black-Box vs. White-Box-Derived Testing

### Black-Box Testing
In **Black-Box Testing**, the software is tested strictly from the user's external perspective without examining internal source code, database structures, or server architecture.
- *CampusShare Example*: A student opens the home page, types `"Chemistry"` into the search bar, and verifies that the Chemistry textbook appears. The tester does not need to know whether the search uses MongoDB regex or full-text indexing.

### White-Box-Derived Testing
In **White-Box Testing** (or white-box-derived specification testing), the tester uses knowledge of the internal code, data models, state machines, and business logic to design test scenarios that stress specific internal pathways and boundary conditions.
- *CampusShare Example*: Knowing that `BorrowRequest.js` has a status state machine (`pending -> approved -> borrowed -> return_requested -> returned`), a white-box test verifies that a user cannot jump directly from `pending` to `returned` via an unauthorized API call, and verifies that approving one request automatically marks competing requests as `rejected`.

---

## 3. The Testing Pyramid: Manual vs. Automated Testing

| Level | Type | Tool Used | Purpose |
|---|---|---|---|
| **Manual UI Testing** | Functional / Acceptance | Web Browser + `docs/MANUAL_TEST_CASES.md` | Demonstrating user journeys, validating visual UI, and exploratory testing. |
| **Automated UI Testing** | End-to-End (E2E) | Selenium IDE (`.side` project) | Replaying browser interactions, regression testing user flows without manual clicking. |
| **Automated API & Unit Testing** | Integration / Unit | Jest + Supertest (`npm test` in backend) | Fast, deterministic verification of HTTP endpoints, business rule invariants, and database state transitions. |

### How Selenium IDE Executes UI Tests
Selenium IDE is a browser automation tool that interacts with the Document Object Model (DOM) of the web application:
1. It opens the web application URL (`open /`).
2. It locates visual elements using stable attributes (e.g., `css=[data-testid="login-email"]`).
3. It triggers real browser events (`click`, `type`).
4. It pauses or waits for asynchronous network requests and animations to complete (`waitForElementVisible`).
5. It inspects DOM text and elements to verify outcomes (`assertText`, `assertElementPresent`).

---

## 4. Why Mock Email Delivery is Used in Automated Tests

When testing email notifications, sending real emails over external SMTP servers during test execution is problematic:
1. **Flakiness & Network Latency**: External SMTP servers can be slow or temporarily unreachable, causing tests to fail randomly even when the code is correct.
2. **Rate Limits & Spam Flags**: Running a test suite with 37 tests repeatedly can trigger Gmail or provider rate limits or ban the test account for spamming.
3. **External Dependencies**: Tests should run reliably offline without requiring an active internet connection or paid cloud services.
4. **No Exposure of Credentials**: Storing live email passwords in automated test runners is a security risk.

### The Solution: In-Memory Mock Transport
CampusShare uses an in-memory test transport in `backend/src/services/emailService.js`. When `NODE_ENV === 'test'`:
- Outgoing emails are intercepted and stored in an in-memory array (`sentEmails`).
- The test suite inspects `emailService.getSentEmails()` to verify:
  - Did the email trigger?
  - Was it addressed to the correct recipient (`to: steward.email`)?
  - Did the subject line contain the resource name?
- In live development, developers configure standard SMTP variables in `.env` to send real emails to real inboxes.

---

## 5. Viva Defense: Selected Test Cases & Why They Matter

When asked to explain a test case to your examiner, use this concise 4-part structure:
1. **The Scenario**: What action was performed?
2. **The Requirement**: Which SRS functional requirement or business rule was verified?
3. **The Result**: What did the system do?
4. **Why It Matters**: How does this protect campus community trust?

### Review of Core Scenarios:

#### Scenario A: Submit Borrow Request & Verify Notifications (TC-04)
- **Requirement Verified**: FR-15 (Borrow Request Submission) & Teacher Improvement #1 (External Email Notifications).
- **Why It Matters**: Resource sharing fails if owners do not know someone needs their equipment. Email notifications ensure that busy faculty and students receive immediate alerts on their personal devices even when they are not actively logged into CampusShare.

#### Scenario B: Separation of Ongoing vs. Completed Transactions (TC-06 & TC-07)
- **Requirement Verified**: Teacher Improvement #2 (Transaction Lifecycle Separation).
- **Why It Matters**: A transaction is not finished merely because an item was checked out. By separating **Ongoing Transactions** (active holds, loans in custody, returns awaiting confirmation) from **Completed Transactions** (verified physical returns), students and stewards always know who currently holds an item, what action is needed next, and when ratings can legitimately be submitted.

#### Scenario C: Business Rule Invariant — Prevent Self-Borrowing (TC-08)
- **Requirement Verified**: SRS Business Rule 5.5.
- **Why It Matters**: Prevents users from artificially inflating their completed transaction counts or gaming the community trust score by repeatedly borrowing their own items.

#### Scenario D: Business Rule Invariant — Prevent Withdrawal with Active Requests (TC-08)
- **Requirement Verified**: SRS Business Rule 5.5 (Catalog Integrity).
- **Why It Matters**: If a student is on their way to pick up an approved lab kit, the steward must not be allowed to withdraw or delete the listing out from under them.

---

## 6. How to Run the Tests for Your Teacher

### 1. Run Automated Backend Tests (Jest & Supertest)
```bash
cd backend
npm test
```
*Expected: 6 test suites pass, 37 automated tests pass (100% green).*

### 2. Run Simplified Selenium IDE Suite
1. Launch **Selenium IDE**.
2. Open `selenium/campusshare-viva-suite.side`.
3. Click the double-play icon (**"Run all tests"**).
4. Watch the automated browser execute login, search, ongoing/completed transaction separation, and unverified user blocks.
