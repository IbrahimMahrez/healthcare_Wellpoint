🏥 Wellpoint — Healthcare Super App

Wellpoint is a full-stack healthcare Super App MVP built with the MERN Stack.
The platform connects patients with doctors, laboratories, and pharmacies through a single responsive healthcare experience.

The project focuses on simplifying healthcare access by providing doctor discovery, appointment booking, prescriptions, laboratory requests, pharmacy search, and an AI-powered triage assistant.

🚀 MERN Stack | AI-Powered | Responsive | REST API | Role-Based Authentication

⸻

📌 Overview

Wellpoint is designed as a centralized digital healthcare platform where users can access multiple healthcare services from one application.

Patients can:

* 👨‍⚕️ Search for doctors
* 🔎 Filter doctors by specialty and city
* 📅 Book medical appointments
* 💬 Chat with an AI triage assistant
* 💊 View prescriptions
* 🧪 Request laboratory tests
* 💳 Create payment records
* 📊 Manage appointments through a personal dashboard

Healthcare providers can manage their respective workflows through role-based access.

The application is fully responsive and optimized for:

* 📱 Mobile
* 💻 Desktop
* 📟 Tablet

⸻

✨ Features

🔐 Authentication & Authorization

Wellpoint provides authentication for multiple healthcare roles:

* 👤 Patient
* 👨‍⚕️ Doctor
* 🧪 Laboratory
* 💊 Pharmacy

Authentication includes:

* User registration
* User login
* JWT authentication
* Protected API routes
* Role-based authorization
* Secure password handling

⸻

👨‍⚕️ Doctor Discovery

Patients can easily discover doctors based on different criteria.

Search & Filtering

* Specialty
* City
* Rating
* Consultation fee

Each doctor has a dedicated details page containing relevant information before booking an appointment.

⸻

📅 Appointment Booking

Patients can book appointments with available doctors.

Appointment workflow

Patient
   ↓
Search Doctor
   ↓
View Doctor Details
   ↓
Book Appointment
   ↓
Doctor Confirms
   ↓
Appointment Completed

Appointments can have different statuses:

* Pending
* Confirmed
* Cancelled
* Completed

Doctors and patients can manage appointments according to their permissions.

⸻

🤖 AI Triage Assistant

Wellpoint includes an AI-powered healthcare assistant designed for initial symptom guidance and triage.

Users can describe their symptoms and receive AI-generated guidance.

Example

Patient:
"I have a headache and fever."
        ↓
AI Triage Assistant
        ↓
Provides general guidance
and recommends an appropriate
level of care.

⚠️ The AI assistant is intended for initial guidance only and does not replace a qualified healthcare professional, diagnosis, or emergency medical care.

The AI functionality requires an OPENAI_API_KEY.

⸻

💊 Prescriptions

Doctors can issue prescriptions for patients.

Patients can access their prescriptions through their dashboard.

Prescription flow

Doctor
   ↓
Create Prescription
   ↓
Patient Account
   ↓
View Prescription

⸻

🧪 Laboratory Tests

Patients can request laboratory tests through the platform.

The system provides the foundation for connecting patients with laboratory services.

⸻

💊 Pharmacy & Medicine Search

The application includes pharmacy and medicine search functionality.

Users can search for:

* Pharmacies
* Medicines

This feature is designed to provide the foundation for future pharmacy ordering and delivery functionality.

⸻

💳 Payments

Wellpoint includes a payment record system.

The current implementation provides a payment placeholder that can be connected to a real payment provider.

Supported integrations can be added in the future, such as:

* Stripe
* PayPal
* Fawry

⸻

📊 Dashboards

Wellpoint provides role-based dashboards.

👤 Patient Dashboard

Patients can manage:

* Appointments
* Prescriptions
* Laboratory requests
* Profile information
* Healthcare interactions

👨‍⚕️ Doctor Dashboard

Doctors can manage:

* Appointments
* Appointment status
* Patient interactions
* Prescriptions

The architecture is designed to support additional dashboards for laboratories and pharmacies.

⸻

🏗️ Technology Stack

Frontend

* React.js
* Vite
* Tailwind CSS
* Responsive UI
* REST API integration

Backend

* Node.js
* Express.js
* RESTful API
* JWT Authentication
* Role-Based Authorization

Database

* MongoDB
* MongoDB Atlas
* Mongoose

AI

* OpenAI API

Development Tools

* npm
* Git
* GitHub
* Environment Variables

⸻

📁 Project Structure

healthcare-superapp/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── seed/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   ├── package.json
│   └── .env.example
│
└── README.md

⸻

🔌 API Endpoints

Authentication

Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login for any supported role

⸻

Doctors

Method	Endpoint	Description
GET	/api/doctors	Search and filter doctors
GET	/api/doctors/:id	Get doctor details

Supported filters include:

specialty
city
rating
fee

⸻

Appointments

Method	Endpoint	Description
POST	/api/appointments	Book an appointment
PATCH	/api/appointments/:id	Update appointment status
GET	/api/appointments/my	Get user’s appointments

⸻

AI Assistant

Method	Endpoint	Description
POST	/api/ai/query	Send a query to the AI triage assistant

Requires:

OPENAI_API_KEY=your_api_key

⸻

Prescriptions

Method	Endpoint	Description
POST	/api/prescriptions	Create a prescription
GET	/api/prescriptions/my	Get patient’s prescriptions

⸻

Laboratory Tests

Method	Endpoint	Description
POST	/api/tests	Request a laboratory test

⸻

Pharmacies

Method	Endpoint	Description
GET	/api/pharmacies/search	Search pharmacies and medicines

⸻

Payments

Method	Endpoint	Description
POST	/api/payments/create	Create a payment record

Payment processing is currently implemented as a placeholder and can be connected to a production payment gateway.

⸻

⚙️ Installation & Setup

1. Clone the repository

git clone <YOUR_REPOSITORY_URL>
cd healthcare-superapp

⸻

🖥️ Backend Setup

Navigate to the backend:

cd backend

Install dependencies:

npm install

Create your environment file:

cp .env.example .env

Configure your environment variables:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

MongoDB

You can use either a local MongoDB instance:

MONGO_URI=mongodb://localhost:27017/healthcare_superapp

or MongoDB Atlas:

MONGO_URI=your_mongodb_atlas_connection_string

⸻

🌱 Seed Demo Data

To add demo doctors:

npm run seed

The seed script adds sample doctor accounts for development and testing.

⸻

🚀 Start Backend

Development mode:

npm run dev

The backend will run by default on:

http://localhost:5000

API base URL:

http://localhost:5000/api

⸻

🎨 Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create:

.env

Add:

VITE_API_URL=http://localhost:5000/api

For a deployed backend:

VITE_API_URL=https://your-backend-url/api

Start the development server:

npm run dev

The frontend will run by default on:

http://localhost:5173

⸻

🔄 Application Architecture

The application follows a modern client-server architecture:

                    ┌─────────────────────┐
                    │      React App      │
                    │     + Tailwind      │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Express / Node.js │
                    │                     │
                    │ Authentication      │
                    │ Authorization       │
                    │ Business Logic      │
                    │ API Routes          │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │     MongoDB     │        │    OpenAI API   │
        │                 │        │                 │
        │ Users           │        │ AI Triage       │
        │ Doctors         │        │ Assistant       │
        │ Appointments    │        └─────────────────┘
        │ Prescriptions   │
        │ Tests           │
        │ Payments        │
        └─────────────────┘

⸻

🔐 Security

The backend implements several security concepts, including:

* JWT-based authentication
* Protected routes
* Role-based authorization
* Password hashing
* Environment variables for sensitive credentials
* API-level access control

Sensitive credentials should never be committed to GitHub.

Make sure .env is included in .gitignore.

⸻

📱 Responsive Design

Wellpoint is designed with a responsive-first approach.

The interface adapts to:

📱 Mobile
     ↓
📟 Tablet
     ↓
💻 Desktop

The goal is to provide a consistent healthcare experience regardless of the device being used.

⸻

🧪 Demo Data

The project includes a seed script that can generate demo doctors for development and testing.

Run:

npm run seed

This creates 3 demo doctors.

⸻

🚧 Current MVP Scope

The current version focuses on the core healthcare workflow:

* ✅ Authentication
* ✅ Multiple user roles
* ✅ Doctor search
* ✅ Specialty filtering
* ✅ City filtering
* ✅ Doctor details
* ✅ Appointment booking
* ✅ Appointment management
* ✅ AI triage assistant
* ✅ Prescriptions
* ✅ Laboratory test requests
* ✅ Pharmacy search
* ✅ Payment records
* ✅ Patient dashboard
* ✅ Doctor dashboard
* ✅ Responsive UI

⸻

🔮 Future Improvements

The architecture allows Wellpoint to grow into a complete healthcare ecosystem.

Possible future features include:

🏥 Healthcare

* Video consultations
* Real-time doctor/patient chat
* Medical records
* Health history
* Lab result uploads
* Medical report management

💊 Pharmacy

* Online medicine ordering
* Prescription-based ordering
* Pharmacy delivery
* Medicine availability tracking

🧪 Laboratories

* Lab booking
* Home sample collection
* Digital test results
* Medical report history

💳 Payments

Production payment integrations such as:

* Stripe
* PayPal
* Fawry

🤖 AI

* AI symptom analysis
* Personalized health guidance
* Medical document summarization
* Appointment recommendations
* Health reminders

📱 Mobile

A dedicated mobile application can be added using:

React Native

while continuing to use the same Node.js/Express backend.

⸻

🌍 Deployment

The application can be deployed using modern cloud platforms.

Frontend

Possible platforms:

* Vercel
* Netlify
* Cloudflare Pages

Backend

Possible platforms:

* Render
* Railway
* Fly.io
* VPS

Database

* MongoDB Atlas

⸻

🛠️ Environment Variables

Backend

MONGO_URI=
JWT_SECRET=
OPENAI_API_KEY=

Frontend

VITE_API_URL=

Never expose backend secrets inside the frontend environment.

⸻

👨‍💻 Development

Run the backend and frontend separately:

Terminal 1

cd backend
npm run dev

Terminal 2

cd frontend
npm run dev

Then open:

http://localhost:5173

⸻

📌 Project Goals

Wellpoint was built to demonstrate how a modern full-stack application can combine:

* Modern React frontend development
* RESTful backend architecture
* MongoDB database design
* Authentication & authorization
* Role-based systems
* API integration
* AI integration
* Responsive UI development
* Healthcare-focused workflows

⸻

📄 License

This project is currently intended for educational, portfolio, and MVP purposes.

Before using Wellpoint in a real healthcare environment, the system would require additional security, privacy, compliance, medical validation, infrastructure, and production-grade monitoring.

⸻

⭐ Wellpoint

One platform. Multiple healthcare services.

Connecting patients, doctors, laboratories, and pharmacies through one modern digital healthcare experience.

If you find this project useful, consider giving the repository a ⭐ on GitHub.