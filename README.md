# 🏥 Doctors Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> A full-stack healthcare management web application built with the MERN stack. It provides a patient-facing portal to browse doctors, a feature-rich admin dashboard to manage the entire platform, and a secure RESTful backend API — all protected with JWT authentication and role-based access control.

📂 **GitHub:** [github.com/TejeshMannala/Doctors-Management-System](https://github.com/TejeshMannala/Doctors-Management-System)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Author](#author)

---

## 🧾 Overview

The **Doctors Management System** is a complete, production-style healthcare platform designed to digitalize the management of doctors, patients, and clinic administration. Instead of relying on paper records or disconnected spreadsheets, this system brings all core operations into one unified, secure web application.

The platform is split into **three independent layers**:

| App | Purpose |
|-----|---------|
| `frontend` | Patient portal — browse doctors, manage profile |
| `admin` | Admin dashboard — full platform control |
| `backend` | REST API — shared by both frontends |

This architecture mirrors how real-world healthcare platforms are built — a single trusted backend serving multiple client applications with different access levels.

---

## ✨ Features

### 👤 Patient Portal (`/frontend`)
- Register and log in securely with JWT
- Browse the full directory of available doctors
- Filter doctors by specialization or availability
- View detailed doctor profiles — qualifications, experience, schedule
- Manage personal profile and account details
- Fully responsive UI — works on mobile, tablet, and desktop

### 🛠️ Admin Dashboard (`/admin`)
- Separate, role-protected admin application
- Add new doctors with full profile details (name, specialization, qualifications, schedule, contact)
- Edit and update existing doctor records in real time
- Delete inactive or incorrect doctor profiles
- View and manage all registered patients
- Oversee appointment data and platform activity
- Admin-only routes enforced at both UI and API level

### 🔐 Security & Access Control
- **JWT Authentication** — stateless, token-based sessions for all users
- **Role-Based Access Control (RBAC)** — `patient` vs `admin` roles with strictly enforced permissions
- **Protected API routes** — middleware rejects any request without a valid, role-appropriate token
- **Secure password handling** — passwords are hashed before storage, never stored in plain text
- Environment secrets managed via `.env` — never hardcoded

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Patient Frontend** | React.js, CSS3, JavaScript |
| **Admin Frontend** | React.js, CSS3, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Architecture** | MVC (Model-View-Controller) |
| **API Testing** | Postman |
| **Version Control** | Git, GitHub |

---

## 📁 Project Structure

```
Doctors-Management-System/
│
├── frontend/                  # Patient-facing React application
│   ├── src/
│   │   ├── components/        # Reusable UI components (Navbar, DoctorCard, etc.)
│   │   ├── pages/             # Pages (Home, Doctors, Login, Register, Profile)
│   │   ├── context/ or redux/ # Auth state management
│   │   └── App.jsx
│   └── package.json
│
├── admin/                     # Admin dashboard React application
│   ├── src/
│   │   ├── components/        # Admin UI components
│   │   ├── pages/             # Pages (Dashboard, Doctors, Patients, Orders)
│   │   └── App.jsx
│   └── package.json
│
├── backend/                   # Node.js + Express.js REST API
│   ├── controllers/           # Business logic (authController, doctorController, etc.)
│   ├── models/                # Mongoose schemas (User, Doctor, Appointment)
│   ├── routes/                # API route definitions
│   ├── middleware/            # JWT verification + role-check middleware
│   ├── server.js              # App entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/TejeshMannala/Doctors-Management-System.git
cd Doctors-Management-System
```

---

### 2. Setup and Run the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` (see [Environment Variables](#environment-variables) section), then:

```bash
npm start
```

Backend API runs at → `http://localhost:5000`

---

### 3. Setup and Run the Patient Frontend

```bash
cd ../frontend
npm install
npm start
```

Patient portal runs at → `http://localhost:3000`

---

### 4. Setup and Run the Admin Panel

```bash
cd ../admin
npm install
npm start
```

Admin dashboard runs at → `http://localhost:3001`

---

## 🔐 Environment Variables

Create a `.env` file inside the `/backend` folder with the following keys:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

> ⚠️ Never push your `.env` file. It is already listed in `.gitignore`.

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login and receive JWT token | Public |

### Doctor Routes — `/api/doctors`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all doctors | Public |
| GET | `/:id` | Get a single doctor's profile | Public |
| POST | `/` | Add a new doctor | Admin only |
| PUT | `/:id` | Update doctor details | Admin only |
| DELETE | `/:id` | Remove a doctor | Admin only |

### Patient / User Routes — `/api/users`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get logged-in user's profile | Authenticated |
| PUT | `/profile` | Update user profile | Authenticated |
| GET | `/` | Get all users/patients | Admin only |

### Appointment Routes — `/api/appointments`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Book an appointment | Authenticated |
| GET | `/my` | Get user's appointments | Authenticated |
| GET | `/` | Get all appointments | Admin only |
| PUT | `/:id/status` | Update appointment status | Admin only |

> 🔒 All protected routes require the header: `Authorization: Bearer <your_token>`

---

## 🏗️ Key Implementation Highlights

### JWT Authentication Flow
1. User submits credentials → backend validates → issues a signed JWT token
2. Token is stored on the client and sent with every subsequent protected request
3. Backend middleware verifies the token's signature and expiry on each request
4. If invalid or expired, the request is rejected with a `401 Unauthorized` response

### Role-Based Access Control
```
Role: "patient"  →  Can: browse doctors, book appointments, manage own profile
Role: "admin"    →  Can: everything above + add/edit/delete doctors, manage all users
```

### MVC Architecture (Backend)
```
Routes       →  Define the URL and HTTP method
Controllers  →  Handle the business logic for each route
Models       →  Define the MongoDB schema and data structure
Middleware   →  Intercept requests to verify JWT and check user role
```

---

## 👨‍💻 Author

**Mannala Tejesh**

- 📧 Email: [mannalatejesh2004@gmail.com](mailto:mannalatejesh2004@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/mannalatejesh-293926358](https://www.linkedin.com/in/mannalatejesh-293926358)
- 🐙 GitHub: [github.com/TejeshMannala](https://github.com/TejeshMannala)
- 📞 Phone: +91 9390835485

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> 💡 Built with ❤️ using the MERN Stack — bringing digital efficiency to healthcare management.
