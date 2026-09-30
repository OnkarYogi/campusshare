# CampusShare: REST API Documentation

Base URL: `http://localhost:5000/api`
Format: JSON (Request & Response bodies)
Authentication: HTTP Bearer Token (`Authorization: Bearer <JWT>`)

---

## 🔐 Authentication Endpoints (`/api/auth`)

### 1. Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "Elena Rostova",
    "email": "elena.rostova@campus.edu",
    "password": "Password123!",
    "role": "student",
    "department": "Computer Science & Engineering",
    "campusId": "CS-2024-8492"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful. Please verify your email.",
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "65b...",
      "name": "Elena Rostova",
      "email": "elena.rostova@campus.edu",
      "role": "student",
      "isVerified": true,
      "trustScore": 5.0
    }
  }
  ```

### 2. Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "elena.rostova@campus.edu",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "65b...",
      "name": "Elena Rostova",
      "email": "elena.rostova@campus.edu",
      "role": "student",
      "department": "Computer Science & Engineering",
      "trustScore": 5.0
    }
  }
  ```

### 3. Get Current User
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Access**: Authenticated

---

## 📦 Resource Catalog Endpoints (`/api/resources`)

### 1. List / Search Resources
- **Method**: `GET`
- **Path**: `/api/resources`
- **Access**: Public
- **Query Parameters**:
  - `search` (string): Search text in title, description, or model.
  - `category` (string): `textbooks`, `electronics`, `lab_gear`, `project_kits`, `sports`, `other`.
  - `department` (string): e.g. `Computer Science`, `Biology`, `Mechanical Eng`.
  - `condition` (string): `brand_new`, `like_new`, `good`, `fair`.
  - `availableNow` (boolean): `true` / `false`.
  - `page` (number): Default `1`.
  - `limit` (number): Default `20`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 12,
    "total": 45,
    "resources": [
      {
        "id": "65c...",
        "title": "Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope",
        "category": "electronics",
        "condition": "like_new",
        "department": "Robotics & Mechatronics Lab",
        "location": "North MakerSpace Station • Room 204",
        "status": "available",
        "images": ["https://..."],
        "steward": {
          "id": "65b...",
          "name": "Elena Rostova",
          "trustScore": 4.9,
          "isVerified": true
        }
      }
    ]
  }
  ```

### 2. Get Resource Details
- **Method**: `GET`
- **Path**: `/api/resources/:id`
- **Access**: Public

### 3. Create Resource
- **Method**: `POST`
- **Path**: `/api/resources`
- **Access**: Authenticated (Verified Member)
- **Body**:
  ```json
  {
    "title": "Campbell Biology 11th Edition",
    "description": "Hardcover edition with all full-color reference plates.",
    "category": "textbooks",
    "identifiers": "ISBN 978-0134093413",
    "condition": "like_new",
    "department": "Biology & Chem",
    "location": "Mudd Library Floor 2",
    "maxLoanDurationDays": 14,
    "images": ["https://..."]
  }
  ```

### 4. Update Resource
- **Method**: `PUT`
- **Path**: `/api/resources/:id`
- **Access**: Resource Steward or Admin

### 5. Delete / Archive Resource
- **Method**: `DELETE`
- **Path**: `/api/resources/:id`
- **Access**: Resource Steward or Admin
- **Behavior**: Returns `400 Bad Request` if there are active borrow requests for this resource.

---

## 🤝 Borrowing Workflow Endpoints (`/api/borrow`)

### 1. Submit Borrow Request
- **Method**: `POST`
- **Path**: `/api/borrow`
- **Access**: Authenticated (Verified, non-owner, active borrowings < 3)
- **Body**:
  ```json
  {
    "resourceId": "65c...",
    "startDate": "2026-10-01",
    "endDate": "2026-10-10",
    "purpose": "For Capstone Circuit Analysis experiments."
  }
  ```

### 2. Get My Outgoing Borrow Requests
- **Method**: `GET`
- **Path**: `/api/borrow/my-requests`
- **Access**: Authenticated

### 3. Get Incoming Requests (for items listed by current user)
- **Method**: `GET`
- **Path**: `/api/borrow/incoming`
- **Access**: Authenticated

### 4. Approve Borrow Request
- **Method**: `PATCH`
- **Path**: `/api/borrow/:id/approve`
- **Access**: Resource Steward

### 5. Reject Borrow Request
- **Method**: `PATCH`
- **Path**: `/api/borrow/:id/reject`
- **Access**: Resource Steward

### 6. Cancel Pending Request
- **Method**: `PATCH`
- **Path**: `/api/borrow/:id/cancel`
- **Access**: Borrower

### 7. Confirm Collection / Hand-off
- **Method**: `PATCH`
- **Path**: `/api/borrow/:id/collect`
- **Access**: Resource Steward

### 8. Confirm Return
- **Method**: `PATCH`
- **Path**: `/api/borrow/:id/return`
- **Access**: Resource Steward (SRS Rule: Only owner may confirm return)
- **Behavior**: Updates request to `returned`, changes resource status to `available`, creates rating prompt.

---

## ⭐ Ratings & Trust Endpoints (`/api/ratings`)

### 1. Submit Rating
- **Method**: `POST`
- **Path**: `/api/ratings`
- **Access**: Authenticated (Participant in completed transaction)
- **Body**:
  ```json
  {
    "transactionId": "65d...",
    "rating": 5,
    "reviewText": "Item was in pristine condition and returned right on time!"
  }
  ```

### 2. Get User Ratings and Trust Profile
- **Method**: `GET`
- **Path**: `/api/ratings/user/:id`
- **Access**: Public

---

## 🔔 Notifications Endpoints (`/api/notifications`)

### 1. Get User Notifications
- **Method**: `GET`
- **Path**: `/api/notifications`
- **Access**: Authenticated

### 2. Mark Notification as Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/:id/read`
- **Access**: Authenticated

### 3. Mark All Notifications as Read
- **Method**: `PATCH`
- **Path**: `/api/notifications/read-all`
- **Access**: Authenticated

---

## 🛡️ Admin Endpoints (`/api/admin`)

- `GET /api/admin/metrics` - High-level system statistics (users, listings, active loans).
- `GET /api/admin/users` - List all users with pagination and search.
- `PATCH /api/admin/users/:id/verify` - Manually verify an institutional user.
- `PATCH /api/admin/users/:id/suspend` - Suspend or unsuspend a user account.
- `GET /api/admin/resources` - List all resources (including moderated/archived).
- `PATCH /api/admin/resources/:id/moderate` - Toggle moderation/visibility flag.
- `GET /api/admin/audit-logs` - Retrieve security and administrative audit trail.
