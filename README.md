<div align="center">

# 🎓 CareerCove

**A Placement & Internship Management System** 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

</div>

---

## 📖 About The Project

**CareerCove** is a fully-featured, job-centric application pipeline designed specifically for Training and Placement (T&P) coordinators and students. The platform streamlines the entire placement process, making it incredibly intuitive for coordinators to manage applicants per job, while providing an enriching and highly transparent experience for students to track their applications, view eligibility criteria, and explore detailed company profiles.

Designed with a focus on modern user experience, CareerCove provides premium UI/UX, responsive layouts, data visualizations, and robust authentication.

---

## 🚀 Key Features

* **🧑‍🎓 Student Portal**: Detailed job discovery, real-time application status tracking, profile management, and notification alerts.
* **👨‍💼 T&P Coordinator Dashboard**: Create and post job drives, manage student eligibility, track applications via robust reporting.
* **🏢 Company Management**: Detailed company profiles to help students research recruiters.
* **🔐 Role-Based Access Control (RBAC)**: Secure routes ensuring Admins, Companies, and Students only access what they are authorized to see.
* **📊 Analytics & PDF Reports**: Generate structured PDF reports and export placement analytics directly from the Admin dashboard.
* **📱 Responsive Design**: A dynamic UI built to be fully functional on both desktops and mobile devices, including engaging aesthetic micro-animations.

---

## 🛠️ Technology Stack

### Frontend
- **React.js (Vite)**
- **CSS3** (Custom Global & Component CSS, responsive layouts)
- **React Router** for seamless routing
- **Context API** for global state and auth management

### Backend
- **Node.js** & **Express.js**
- **Prisma ORM** for fully-typed database access
- **PostgreSQL / Supabase** for relational database connectivity
- **JSON Web Tokens (JWT)** for robust authentication & security

---

## 📂 Architecture & Folder Structure

```bash
CareerCove/
├── backend/                  # Node.js + Express backend
│   ├── prisma/               # Prisma schemas and migrations
│   ├── src/
│   │   ├── controllers/      # Route controllers (logic)
│   │   ├── middlewares/      # Auth, Role, Upload guards
│   │   ├── routes/           # Express API endpoints
│   │   └── services/         # Core business logic processing
│   └── package.json
└── frontend/client/          # React Vite frontend
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # React Contexts (Auth, Notifications)
    │   ├── pages/            # View pages (Admin, Student, Auth)
    │   ├── services/         # API hooks & API communication
    │   └── styles/           # CSS design systems (Vars, Globals)
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v16 or higher)
* PostgreSQL database (or Supabase instance)
* Git

### Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vortex077/CareerCove.git
   cd CareerCove
   ```

2. **Setup the Backend**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Configure Environment Variables: Rename `.env.example` to `.env` and fill in your database credentials and JWT secret.
   - Run Prisma Migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Setup the Frontend**
   - Open a new terminal and navigate to the frontend directory:
     ```bash
     cd frontend/client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

4. **Open your browser** to `http://localhost:5173` to explore CareerCove!

---

<div align="center">
  <i>Built with ❤️ for modern placement management.</i>
</div>
