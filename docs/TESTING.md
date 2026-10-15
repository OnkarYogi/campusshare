# CampusShare: Testing & Quality Assurance Guide

This document outlines the testing strategy, test harness configuration, test cases, and instructions for running automated and manual validation for CampusShare.

---

## 🧪 Testing Pyramid & Strategy

1. **Unit & Logic Tests**:
   - Institutional domain validation.
   - Trust score calculation engine.
   - Resource status state transitions.
2. **Integration / API Tests**:
   - Full REST endpoints tested using Supertest and Jest.
   - In-memory database via `mongodb-memory-server` to guarantee isolated, fast, zero-dependency testing without requiring an active external MongoDB daemon.
3. **Business Rule Invariant Tests**:
   - Enforce max 3 active borrowings per user.
   - Prevent self-borrowing.
   - Guard against deleting resources with active requests.
   - Ensure only owners can confirm return.
   - Ensure ratings only occur on returned items.
4. **Frontend Build & Component Validation**:
   - Vite production build verification.
   - Component rendering tests.

---

## 🏃 Running Automated Tests

### Run All Backend Tests
```bash
npm test
```
Or directly in the backend directory:
```bash
cd backend
npm test
```

### Run Tests with Coverage Report
```bash
cd backend
npm test -- --coverage
```

---

## 📊 Test Suites Matrix

| Test Suite File | Coverage Target | Key Scenarios Tested |
|---|---|---|
| `tests/emailAndTransaction.test.js` | Email Alerts & Transaction Separation | Borrow/approve/reject/return email triggers, SMTP fault tolerance, in-app notifications, ongoing vs completed separation, state tampering guards. |
| `tests/auth.test.js` | Auth & Profile Engine | Registration, domain checks, password hashing, JWT login, profile update. |
| `tests/resource.test.js` | Resource Catalog | Listing creation, query filtering, search by keyword, ownership update guard. |
| `tests/borrow.test.js` | Borrowing Lifecycle | Request submission, self-borrowing rejection, 3-borrow quota, approval, collection, return. |
| `tests/rating.test.js` | Ratings & Trust Score | Post-return rating submission, unreturned block, trust score recalculation. |
| `tests/admin.test.js` | Governance & RBAC | Admin route protection, user verification, suspension, resource moderation. |

---

## 📖 Viva & Demonstration Documents

- **Step-by-step Manual Test Cases**: [`docs/MANUAL_TEST_CASES.md`](MANUAL_TEST_CASES.md)
- **Testing Concepts Explained**: [`docs/TESTING_EXPLAINED.md`](TESTING_EXPLAINED.md)
- **Selenium IDE Guide**: [`selenium/SELENIUM_IDE_GUIDE.md`](../selenium/SELENIUM_IDE_GUIDE.md)

---

## 🔍 Manual Verification Checklist

Before completing each increment:
- [ ] User can register and sign in with demo accounts.
- [ ] Catalog filters respond immediately to search query, category, and department pills.
- [ ] User can click "Borrow Resource" and open the details/request modal.
- [ ] Date validation prevents negative durations or invalid dates.
- [ ] Incoming requests show in Steward's dashboard with "Approve" and "Reject" buttons.
- [ ] Approved items can be marked "Borrowed" and subsequently "Returned".
- [ ] Ratings submitted reflect on user's public trust score.
- [ ] Admin portal allows toggling verification and suspension flags.
