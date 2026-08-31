# Wellpoint — Healthcare Super App (MERN MVP)

A full-stack MVP for a healthcare "super app": patients, doctors, labs, pharmacies,
appointment booking, and an AI triage assistant — built with MongoDB, Express, React, and Node
(MERN), and fully responsive across phone, tablet, and desktop screens.

This implements the MVP scope from the project plan: authentication, doctor search
(by specialty & city), appointment booking, AI chat, prescriptions, and patient/doctor dashboards.

## Structure

```
healthcare-superapp/
├── backend/     # Node.js + Express + MongoDB API
└── frontend/    # React (Vite) + Tailwind, responsive UI
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env     # then fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run seed              # optional: adds 3 demo doctors
npm run dev                # starts on http://localhost:5000
```

Requires a MongoDB connection string in `.env` — either a local MongoDB instance
(`mongodb://localhost:27017/healthcare_superapp`) or a free MongoDB Atlas cluster.

### Key API routes
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register patient/doctor/lab/pharmacy |
| POST | /api/auth/login | Login (any role) |
| GET  | /api/doctors | Search doctors (specialty, city, rating, fee) |
| GET  | /api/doctors/:id | Doctor details |
| POST | /api/appointments | Book appointment (patient) |
| PATCH| /api/appointments/:id | Confirm/cancel/complete (doctor/patient) |
| GET  | /api/appointments/my | My appointments |
| POST | /api/ai/query | AI triage chat (requires OPENAI_API_KEY) |
| POST | /api/prescriptions | Doctor issues a prescription |
| GET  | /api/prescriptions/my | Patient's prescriptions |
| POST | /api/tests | Request a lab test |
| GET  | /api/pharmacies/search | Search pharmacies/medicines |
| POST | /api/payments/create | Create a payment record (placeholder — wire up Stripe/PayPal/Fawry) |

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

The frontend talks to the backend at `http://localhost:5000/api` by default.
To point elsewhere, create `frontend/.env` with:
```
VITE_API_URL=http://your-backend-url/api
```

## 3. Responsive design

- Mobile-first Tailwind layout: top navbar collapses into a hamburger menu on
  small screens, plus a bottom tab bar (Home / Search / AI / Profile) that only
  shows on mobile, mirroring common health-app navigation.
- Grids and forms reflow from single-column (phone) to multi-column (tablet/desktop).
- Tested breakpoints: `sm` (≥640px), `md` (≥768px) — covers phones, tablets, and
  laptop/desktop screens.

## 4. What's implemented vs. what's stubbed

Implemented: auth (JWT, 4 roles), doctor search & booking, appointment
status flow, AI chat endpoint (OpenAI), prescriptions, pharmacy search, patient &
doctor dashboards, responsive UI.

Stubbed for you to finish (per the original plan, sections 10 & 14):
- **Payments**: `paymentController.js` creates a DB record only — plug in real
  Stripe/PayPal/Fawry/Vodafone Cash SDKs.
- **Video calls**: appointment has a `meetingLink` field — wire up Twilio/Jitsi/WebRTC
  and set the link when a doctor confirms.
- **Maps**: doctor/lab/pharmacy documents already store `coordinates` — add
  Google Maps/Leaflet on the frontend to render them.
- **File uploads** (lab results, avatars): add Multer + S3/Cloudinary.
- **Notifications**: Email/SMS/Push — add a `services/notifications.js` using
  SendGrid/Twilio/Firebase.

## 5. Roadmap reference

Follows the 12-week roadmap from the original plan: this scaffold covers weeks 1-8
(auth, search, booking, AI chat) plus prescriptions and pharmacy search from weeks 9-11.
Payments, labs results upload, and full pharmacy ordering are stubbed as noted above.
