# Wellpoint — Healthcare Super App

A modern full-stack healthcare platform built with the **MERN stack**, designed to connect patients, doctors, laboratories, pharmacies, and administrators in one unified application.

Wellpoint combines doctor discovery and appointment booking with medical records, prescriptions, laboratory and radiology services, pharmacy workflows, AI-powered health guidance, notifications, and online consultation features.

---

## ✨ Main Features

### 👤 Authentication & User Roles

The platform supports multiple account types with JWT-based authentication:

* Patient
* Doctor
* Laboratory
* Pharmacy
* Administrator

Features include:

* Registration and login
* JWT authentication
* Protected routes
* Role-based authorization
* Account status management
* Doctor verification by administrators

---

### 🩺 Doctor Discovery & Appointments

Patients can discover doctors and manage appointments.

* Search doctors
* Filter by specialty
* Filter by city
* Filter by rating
* Filter by consultation fee
* View doctor profiles
* Book appointments
* Manage appointment status
* Doctor patient management
* Doctor availability/profile management

---

### 🤖 AI Health Assistant

Wellpoint includes an AI-powered health guidance assistant using the **Google Gemini API**.

The assistant is designed for preliminary health guidance and:

* Answers general health-related questions
* Uses conversation history
* Suggests appropriate medical specialties
* Provides safety guidance
* Detects potentially urgent symptoms and recommends emergency medical care
* Clearly communicates that it does not replace a licensed physician

> **Important:** The AI assistant provides general health information only. It is not a medical diagnostic tool and should not be used as a replacement for professional medical care.

---

### 📋 Medical Records

Patients can manage their health information through their personal medical record.

Supported functionality includes:

* Personal health information
* Medical history
* Patient health records
* Doctor access to authorized patient information

---

### 💊 Prescriptions

Doctors can create prescriptions for patients.

Patients can:

* View prescriptions
* Review prescription details
* Send prescriptions to pharmacies

---

### 🧪 Laboratory Services

The platform includes laboratory discovery and test workflows.

* Search laboratories
* Request laboratory tests
* Doctor-requested tests
* Patient test history
* Laboratory test queue
* Laboratory result submission

---

### 🩻 Radiology

Radiology workflows are included for patients, doctors, and laboratories.

* Request radiology scans
* Doctors can request scans for patients
* View requested scans
* Laboratory/radiology queue management
* Upload radiology reports

---

### 💊 Pharmacy

Pharmacy functionality includes:

* Search pharmacies
* Pharmacy accounts
* Pharmacy order management
* Prescription-to-pharmacy workflow
* Order status management

---

### 🏥 Admission Permits

Patients can access their admission permits through the application.

---

### 🧑‍⚕️ Online Consultation

Wellpoint includes an online consultation environment connected to appointments.

Features include:

* Consultation rooms
* Patient/doctor participant authorization
* Appointment-based access
* Consultation chat
* Message history
* WebRTC signaling
* Offer / answer / ICE candidate signaling
* Call notifications

The consultation system provides the foundation for browser-based real-time consultations.

---

### 🔔 Notifications

The application includes an in-app notification system.

Users can:

* View notifications
* Mark individual notifications as read
* Mark all notifications as read
* Receive appointment and consultation-related notifications

---

### ⭐ Reviews

Patients can submit reviews for supported healthcare providers and view existing reviews.

---

### 🚨 Emergency

A dedicated emergency experience is included in the frontend to provide users with quick access to emergency-related functionality.

---

### 📊 Admin Dashboard

Administrators have access to management and analytics functionality.

The admin dashboard provides:

* Platform statistics
* Doctor management
* Doctor verification
* Patient management
* Appointment management
* Payment records
* Healthcare provider management
* Account status management

---

## 🛠️ Technology Stack

### Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Axios
* React Leaflet
* Leaflet
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Express Validator
* Helmet
* Express Rate Limit
* Morgan
* Multer
* Google Gemini API

### Architecture

```text
React + Vite + Tailwind
          │
          │ REST API
          ▼
Node.js + Express
          │
          ▼
      MongoDB
```

---

## 📁 Project Structure

```text
healthcare-superapp/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# 🚀 Installation

## Requirements

Before running the project, make sure you have:

* Node.js 18+
* npm
* MongoDB or MongoDB Atlas
* Google Gemini API key

---

## 1. Clone / Extract the Project

```bash
cd healthcare-superapp
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell you can simply copy the example file manually:

```powershell
Copy-Item .env.example .env
```

Configure the `.env` file:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/healthcare_superapp

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173
```

Start the backend in development mode:

```bash
npm run dev
```

Or run it normally:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

---

# 🌱 Seed Demo Data

The project includes a seed script for creating demo data.

Run:

```bash
npm run seed
```

---

# 👑 Create an Administrator

To create an administrator account:

```bash
npm run create-admin
```

Follow the prompts shown in the terminal.

---

# 🎨 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

To create a production frontend build:

```bash
cd frontend
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

For production deployment, configure the frontend API URL to point to your deployed backend.

---

# 🔐 Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=

CLIENT_URL=http://localhost:5173
```

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

### Security

**Never commit real API keys, JWT secrets, database credentials, or other private environment variables to Git or include them in a distributed source-code package.**

Use `.env.example` files when distributing the project.

---

# 🔌 API Overview

The backend exposes REST API endpoints under:

```text
/api
```

Main API modules include:

| Module           | Base Route            | Purpose                                |
| ---------------- | --------------------- | -------------------------------------- |
| Authentication   | `/api/auth`           | Registration, login, current user      |
| Doctors          | `/api/doctors`        | Doctor discovery and profiles          |
| Appointments     | `/api/appointments`   | Booking and appointment management     |
| AI               | `/api/ai`             | Gemini-powered health assistant        |
| Prescriptions    | `/api/prescriptions`  | Prescription management                |
| Laboratory Tests | `/api/tests`          | Laboratory test workflows              |
| Laboratories     | `/api/labs`           | Laboratory discovery                   |
| Radiology        | `/api/radiology`      | Radiology requests and reports         |
| Pharmacies       | `/api/pharmacies`     | Pharmacy search and orders             |
| Health Records   | `/api/health-records` | Patient health records                 |
| Medical Cases    | `/api/medical-cases`  | Medical case management                |
| Consultations    | `/api/consultations`  | Consultation rooms, chat and signaling |
| Notifications    | `/api/notifications`  | User notifications                     |
| Reviews          | `/api/reviews`        | Provider reviews                       |
| Payments         | `/api/payments`       | Payment records                        |
| Admissions       | `/api/admissions`     | Admission permits                      |
| Admin            | `/api/admin`          | Administration and platform statistics |

---

# 🤖 Gemini AI Configuration

The AI assistant requires a Google Gemini API key.

Set:

```env
GEMINI_API_KEY=your_api_key
```

If the key is missing, the AI service will return a configuration error instead of attempting to process requests.

The AI assistant is intentionally configured as a **health guidance / triage assistant**, not as a diagnostic system.

---

# 💳 Payments

The project includes a payment record workflow and payment management endpoints.

The current implementation creates and manages payment records but does **not** provide a complete third-party payment gateway integration.

For production deployments, a payment provider such as Stripe, PayPal, Fawry, or another locally supported gateway can be integrated according to the target market.

---

# 🗺️ Maps

Doctor, laboratory, and pharmacy data can include geographical coordinates.

The frontend includes:

* Leaflet
* React Leaflet

These can be used to display healthcare providers and locations on interactive maps.

---

# 📱 Responsive Design

The frontend is designed to work across:

* Mobile phones
* Tablets
* Laptops
* Desktop screens

The interface uses a mobile-first responsive layout with:

* Responsive navigation
* Mobile bottom navigation
* Responsive cards and grids
* Adaptive forms
* Desktop and mobile layouts

---

# 🧪 Development Commands

## Backend

```bash
npm install
npm run dev
npm start
npm run seed
npm run create-admin
```

## Frontend

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

# 📦 Included in This Source Code

The project includes:

* Complete frontend source code
* Complete backend source code
* MongoDB/Mongoose models
* REST API
* Authentication and authorization
* Multiple user roles
* Admin dashboard
* Patient dashboard
* Doctor dashboard
* Laboratory dashboard
* Pharmacy dashboard
* Appointment system
* Medical records
* Prescriptions
* Laboratory workflows
* Radiology workflows
* Pharmacy workflows
* AI health assistant
* Consultation system
* Consultation messaging
* WebRTC signaling layer
* Notifications
* Reviews
* Payment record management
* Responsive UI
* Database seed utilities

---

# ⚠️ Important Production Notes

This source code is intended as a customizable healthcare platform and starting point for production applications.

Before deploying in a real healthcare environment, the buyer/development team should perform a complete security, privacy, compliance, infrastructure, and medical-risk review appropriate to the target country and regulations.

Recommended production work includes:

* HTTPS
* Secure production secrets
* Production MongoDB configuration
* Database backups
* Monitoring and logging
* File/object storage configuration
* Email/SMS/push notification providers
* Production payment gateway
* Production video infrastructure if required
* Additional security testing
* Privacy and regulatory compliance review

---

# 📄 License

This project is distributed under the license included with your purchase.

The purchaser is responsible for reviewing the applicable license terms before using, modifying, redistributing, or deploying the source code.

---

# 📞 Support

For installation issues, configuration questions, or customization requirements, please refer to the documentation and project structure first.

When requesting technical support, provide:

* Node.js version
* npm version
* Operating system
* Backend error message
* Frontend error message
* Relevant console/log output

---

# 🚀 Customization Potential

Wellpoint can be extended for:

* Clinics
* Hospitals
* Healthcare startups
* Telemedicine platforms
* Laboratory networks
* Pharmacy networks
* Doctor booking platforms
* Multi-provider healthcare marketplaces
* Country-specific healthcare workflows

The modular MERN architecture makes it suitable as a foundation for building customized healthcare applications.

---

## Version

**Wellpoint Healthcare Super App — v1.0.0**

Built with:

**React • Node.js • Express • MongoDB • Tailwind CSS • Google Gemini**
