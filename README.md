# Centralized Student Management System (CSMS)

A full-stack web application designed for higher education institutions. CSMS centralizes student academic records, smart attendance calculations with institutional recovery and bunk allowances, examination scorecards, GPA & credit progression rules, Achievers' Q&A peer knowledge platform, and extracurricular club lifecycle management.

---

## 🚀 Quick Start: Opening in VS Code

### Method 1: Using Terminal
Run the following command directly from your terminal in the project directory:
```bash
code /Users/seeratulshaik/csms
```
or if you are already in the project directory:
```bash
code .
```

### Method 2: From VS Code UI
1. Open **Visual Studio Code**.
2. Press `Cmd + O` (or go to **File > Open Folder...**).
3. Navigate to `/Users/seeratulshaik/csms` and click **Open**.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons, Recharts, Axios, React Router v6.
- **Backend**: Node.js, Express.js, JWT Authentication, RBAC Middleware, Mongoose.
- **Database**: MongoDB with automatic In-Memory MongoDB fallback (`mongodb-memory-server`) for zero-configuration local runs.
- **Automated Tests**: Jest test suite covering attendance algorithms, GPA formulas, and progression rules.

---

## 🏃 Running the Application

### 1. Start the Backend API (Port 5000)
Open a terminal in VS Code (`Ctrl + ~` or ``Cmd + Shift + ` ``):
```bash
cd backend
npm install
npm run seed      # Populates realistic demo records, users, and courses
npm start         # Starts server on http://localhost:5000
```

### 2. Start the Frontend Client (Port 3000)
Open a second terminal split in VS Code:
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:3000
```

Now open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Login Credentials

The database seed script provides test accounts with pre-configured roles:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Student** | `student@csms.edu` | `Password123!` | Dashboard, Smart Attendance, Scorecard, Progression, Clubs, Q&A |
| **Student 2** | `student2@csms.edu` | `Password123!` | Peer Q&A, Club Applications, Junior Progression Profile |
| **Faculty** | `faculty@csms.edu` | `Password123!` | Record Attendance, Enter Assessment Marks, Verify Achievers |
| **Administrator** | `admin@csms.edu` | `Password123!` | Manage Users, Configure Promotion Rules, Announcements |
| **Club Coordinator** | `coordinator@csms.edu` | `Password123!` | Review Club Applications, Create Events, Manage Memberships |

*(Tip: The login page includes quick **1-click demo login buttons** for instant sign-in without manual typing).*

---

## 🧪 Running Automated Tests

Run the backend unit and integration test suite:
```bash
cd backend
npm test
```
**Test Coverage Includes:**
- Zero classes conducted / attended edge cases.
- 75% attendance threshold recovery formulas: $x = \lceil \frac{p \cdot T - A}{1 - p} \rceil$.
- Bunk allowance (maximum safe absences): $\lfloor \frac{A - p \cdot T}{p} \rfloor$.
- Future attendance projections: $\frac{A + F}{T + F} \times 100$.
- Component-wise assessment pass verification (internal min + final exam min + total min).
- SGPA & CGPA weighted credit formulas.
- Academic progression & promotion rules (compulsory subject clearance, credit thresholds, backlogs).

---

## 📂 Project Structure

```text
csms/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & fallback
│   │   ├── controllers/     # Auth, Attendance, Results, Clubs, Q&A, Admin
│   │   ├── middleware/      # JWT verify, RBAC role guard, Error handler
│   │   ├── models/          # Mongoose Schemas (User, Subject, Attendance, etc.)
│   │   ├── routes/          # Express REST API endpoints
│   │   └── utils/           # Attendance, GPA & Promotion logic engines
│   ├── tests/               # Jest automated test suites
│   ├── seed.js              # Database seed script
│   ├── server.js            # Express server entrypoint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, StatCard, AttendanceCalculatorModal, etc.
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── pages/           # Dashboard, Attendance, Results, Progression, Clubs, Q&A
│   │   ├── services/        # Axios API client with JWT interceptor
│   │   ├── App.jsx          # Route declarations & role guards
│   │   └── main.jsx
│   ├── vite.config.js       # Vite dev server with proxy to backend
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```
