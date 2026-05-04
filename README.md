# 🏥 MedCare — Doctors Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> **MedCare** is a full-stack healthcare management web application built with the MERN stack. It provides a patient-facing portal to connect with top doctors, manage prescriptions, and track health journeys — alongside a feature-rich admin dashboard and a secure RESTful backend API protected with JWT authentication and role-based access control.

🔗 **Live Demo:** [medicare-n719.onrender.com](https://medicare-n719.onrender.com)
📂 **GitHub:** [github.com/TejeshMannala/Doctors-Management-System](https://github.com/TejeshMannala/Doctors-Management-System)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Interface Screenshots](#interface-screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Author](#author)

---

## 🧾 Overview

**MedCare** is a complete, production-style healthcare platform designed to digitalize the management of doctors, patients, and clinic administration. The tagline — *"Your Health, Simplified"* — captures the mission: connect patients with the right doctors, manage prescriptions, and track health journeys in one beautiful platform.

The system is built across **three independent layers**:

| App | Purpose |
|-----|---------|
| `frontend` | Patient portal — browse doctors, book appointments, manage prescriptions |
| `admin` | Admin dashboard — full platform control |
| `backend` | REST API — shared by both frontends |

---

## 🖥️ Interface Screenshots

### 🏠 Hero — Modern Care for Modern Life
> Patient portal home page with role-based navbar, language selector, and quick action buttons.

![MedCare Hero](screenshot1.png)

---

### 🩺 Platform Services
> Eight core healthcare services offered on the platform including Digital Health Records, Home Sample Collection, Medicine Delivery, Emergency Ambulance, Affordable Health Packages, Health Insurance Assistance, Live Bed Availability, and Blood Donor Finder.

![MedCare Services](screenshot2.png)

---

### ⚡ Quick Access — Continue Your Journey
> Patient dashboard quick-access cards for Explore Doctors, My Appointments, Prescription, Help, and About — each with a direct CTA button.

![MedCare Quick Access](screenshot3.png)

---

## ✨ Features

### 👤 Patient Portal (`/frontend`)
- Register and log in securely with JWT
- Browse the full directory of available doctors
- Filter doctors by specialization or availability
- Book appointments and track booking ID & status
- Access and manage prescriptions anytime
- Digital Health Records — view reports and medical history
- Quick access dashboard — Explore Doctors, My Appointments, Prescription, Help
- Multi-language support (English selector in navbar)
- Fully responsive UI — works on mobile, tablet, and desktop

### 🛠️ Admin Dashboard (`/admin`)
- Separate, role-protected admin application
- Add new doctors with full profile details
- Edit and update existing doctor records in real time
- Delete inactive or incorrect doctor profiles
- View and manage all registered patients
- Oversee appointment data and platform activity
- Admin-only routes enforced at both UI and API level

### 🔐 Security & Access Control
- **JWT Authentication** — stateless, token-based sessions for all users
- **Role-Based Access Control (RBAC)** — `patient` vs `admin` roles with strictly enforced permissions
- **Protected API routes** — middleware rejects any request without a valid, role-appropriate token
- **Secure password handling** — passwords are hashed before storage, never in plain text
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
| **Deployment** | Render |
| **Version Control** | Git, GitHub |

---

## 📁 Project Structure

```
Doctors-Management-System/
│
├── frontend/                  # Patient-facing React application (MedCare)
│   ├── src/
│   │   ├── components/        # Navbar, DoctorCard, ServiceCard, etc.
│   │   ├── pages/             # Home, Doctors, Appointments, Prescription, Help, About
│   │   ├── context/           # Auth state management
│   │   └── App.jsx
│   └── package.json
│
├── admin/                     # Admin dashboard React application
│   ├── src/
│   │   ├── components/        # Admin UI components
│   │   ├── pages/             # Dashboard, Doctors, Patients, Appointments
│   │   └── App.jsx
│   └── package.json
│
├── backend/                   # Node.js + Express.js REST API
│   ├── controllers/           # authController, doctorController, appointmentController
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

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/TejeshMannala/Doctors-Management-System.git
cd Doctors-Management-System
```

### 2. Setup and Run the Backend

```bash
cd backend
npm install
# Create your .env file (see Environment Variables section)
npm start
```

Backend API runs at → `http://localhost:5000`

### 3. Setup and Run the Patient Frontend

```bash
cd ../frontend
npm install
npm start
```

Patient portal (MedCare) runs at → `http://localhost:3000`

### 4. Setup and Run the Admin Panel

```bash
cd ../admin
npm install
npm start
```

Admin dashboard runs at → `http://localhost:3001`

---

## 🔐 Environment Variables

Create a `.env` file inside the `/backend` folder:

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

> 🔒 All protected routes require: `Authorization: Bearer <your_token>`

---

## 🏗️ Key Implementation Highlights

### JWT Authentication Flow
1. User submits credentials → backend validates → issues a signed JWT token
2. Token is stored on the client and sent with every subsequent protected request
3. Backend middleware verifies the token's signature and expiry on each request
4. If invalid or expired → request is rejected with `401 Unauthorized`

### Role-Based Access Control
```
Role: "patient"  →  Can: browse doctors, book appointments, access prescriptions
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

> 💡 Built with ❤️ using the MERN Stack — **MedCare**: *Your Health, Simplified.*
