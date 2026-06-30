# 🏥 MediRoute AI

> **AI-Powered Smart Healthcare Platform for Peshawar, Pakistan**

MediRoute AI helps patients find the right medical specialist, book appointments, get AI-powered symptom analysis, chat with a medical AI assistant, and locate the nearest hospital — all in one platform. Built specifically for the Peshawar healthcare ecosystem.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Map & Location](#-map--location)
- [Authentication & Authorization](#-authentication--authorization)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Symptom Checker
Patients describe their symptoms in plain English (or Roman Urdu), and the AI:
- Analyzes symptoms to identify the likely **medical department** needed
- Assigns **urgency triage level** (LOW / MEDIUM / HIGH / EMERGENCY)
- Recommends the appropriate **specialist type**
- Provides **clinical reasoning** and **actionable next steps**
- Always includes a mandatory **medical disclaimer**

### 💬 MediBot AI Chat
A conversational AI medical assistant that:
- Answers general healthcare questions
- Provides health tips and preventive care advice
- Guides patients on which specialist to see
- Responds in **Roman Urdu** when the user writes in Roman Urdu
- Persists chat history per user in the database

### 🗺️ Nearest Hospitals with GPS
- Detects the user's **current GPS location** via browser geolocation
- Calculates distance using the **Haversine formula** (great-circle distance)
- Displays hospitals on an interactive **OpenStreetMap** (via Leaflet)
- Filters by **medical department**
- Preloaded with **15+ real Peshawar hospitals** (LRH, KTH, HMC, RMI, NWGH, etc.)

### 📅 Appointment Booking
- Patients browse doctors by specialist type and proximity
- Book appointments with **date/time slot** validation
- Supports three consultation types: **In-Person**, **Video**, and **Phone**
- Prevents double-booking for the same time slot
- Sends in-app notifications on booking confirmation

### 👨‍⚕️ Doctor Registration & Admin Approval
- Doctors register with **license number**, qualifications, specialty, and hospital affiliation
- Admin panel for approving/rejecting doctor profiles
- Doctors manage their own **weekly availability schedule**

### 🔔 Notification System
- Real-time notification bell with unread count badge
- Supports notification types: **APPOINTMENT**, **REMINDER**, **ALERT**, **INFO**
- Mark as read individually or all at once
- Polls every 30 seconds for updates

### 🚨 Emergency Button
- Floating emergency button always visible
- **One-tap dial to 1122** (Pakistan emergency services)

### 🔐 Role-Based Access Control
- Three user roles: **PATIENT**, **DOCTOR**, **ADMIN**
- Route protection via custom JWT session middleware
- Admin-only routes for doctor approvals and platform statistics

---

## 🧰 Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | [Next.js](https://nextjs.org/) | 15.1 | Full-stack React framework (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5.7 | Type-safe development |
| **UI Library** | [React](https://react.dev/) | 19.0 | Component-based UI |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first CSS framework |
| **Icons** | [React Icons](https://react-icons.github.io/react-icons/) | 5.4 | Icon library (Font Awesome 6) |
| **ORM** | [Prisma](https://www.prisma.io/) | 7.8 | Type-safe database ORM |
| **Database** | PostgreSQL | — | Relational database |
| **DB Adapter** | `@prisma/adapter-pg` | 7.8 | Direct PostgreSQL connection adapter |
| **AI SDK** | [Groq SDK](https://groq.com/) | 0.15 | AI inference API client |
| **AI Models** | Llama 3.3 70B & Llama 3.1 8B | — | Primary analysis & fast chatbot models |
| **Maps** | [Leaflet](https://leafletjs.com/) | 1.9 | Interactive map library |
| **Map React** | [React Leaflet](https://react-leaflet.js.org/) | 5.0 | React bindings for Leaflet |
| **Auth (JWT)** | [jose](https://github.com/panva/jose) | — | JSON Web Token signing & verification |
| **Password Hash** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2.4 | Password hashing |
| **Validation** | [Zod](https://zod.dev/) | 3.24 | Schema validation |
| **Auth (NextAuth)** | [next-auth](https://authjs.dev/) | 5.0-beta | Authentication library (installed) |

---

## 📁 Project Structure

```
taif-proj/
├── prisma/
│   ├── schema.prisma              # Database schema (8 models, 6 enums)
│   └── seed.ts                    # Database seeder
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root layout (header, footer, nav)
│   │   ├── page.tsx               # Home page (hero, features, stats)
│   │   ├── globals.css            # Global styles + Tailwind directives
│   │   ├── actions/               # Server Actions (API logic)
│   │   │   ├── ai.ts              # Groq AI: symptom analyzer + chatbot
│   │   │   ├── auth.ts            # Registration + login
│   │   │   ├── admin.ts           # Admin: doctor approvals, stats
│   │   │   ├── appointments.ts    # Appointment booking + listing
│   │   │   ├── chat.ts            # Chat history persistence
│   │   │   ├── doctor.ts          # Doctor schedule management
│   │   │   ├── location.ts        # GPS distance + hospital search
│   │   │   └── notifications.ts   # Notification CRUD
│   │   ├── symptoms/              # AI Symptom Checker page
│   │   ├── chatbot/               # MediBot AI Chat page
│   │   ├── hospitals/             # Hospital directory + map
│   │   ├── appointments/          # Patient appointment list
│   │   ├── doctor/                # Doctor panel + schedule management
│   │   ├── admin/                 # Admin dashboard
│   │   ├── login/                 # Login page
│   │   └── register/              # Patient & Doctor registration
│   ├── components/
│   │   ├── ClientLayout.tsx       # Auth provider wrapper
│   │   ├── Map.tsx                # Leaflet map component
│   │   ├── MobileNav.tsx          # Mobile navigation
│   │   ├── NotificationBell.tsx   # Notification bell + dropdown
│   │   └── EmergencyButton.tsx    # Floating 1122 emergency button
│   └── lib/
│       ├── db.ts                  # Prisma client singleton
│       ├── session.ts             # JWT session (create, get, require, destroy)
│       ├── AuthProvider.tsx       # React auth context provider
│       ├── ai-types.ts            # AI response types + Zod schemas
│       └── hospitals.ts           # Preloaded Peshawar hospital data
├── prisma.config.ts               # Prisma configuration
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS theme customization
├── tsconfig.json                  # TypeScript configuration
├── postcss.config.js              # PostCSS configuration
├── package.json                   # Dependencies & scripts
├── approve-doctors.js             # Admin utility: approve doctors via CLI
├── check-appointments.js          # Utility: check appointment status
├── create-admin.js                # Utility: create admin user
├── create-demo-patient.js         # Utility: create demo patient
├── test-db.js                     # Database connection test
└── README.md                      # You are here 📖
```

---

## 🔧 Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+
- **PostgreSQL** 14+ running locally or remotely
- **Groq API Key** — [Get one free at console.groq.com](https://console.groq.com/)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
cd taif-proj
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# Groq AI
GROQ_API_KEY="gsk_your_api_key_here"
GROQ_MODEL_PRIMARY="llama-3.3-70b-versatile"
GROQ_MODEL_FAST="llama-3.1-8b-instant"

# JWT Secret
JWT_SECRET="your-strong-random-secret-here"
```

### 3. Set Up the Database

```bash
# Push schema to database (development)
npm run db:push

# Or use migrations (production)
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### 4. Create an Admin User

```bash
node create-admin.js
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | — | PostgreSQL connection string |
| `GROQ_API_KEY` | ✅ Yes | — | Groq Cloud API key (starts with `gsk_`) |
| `GROQ_MODEL_PRIMARY` | No | `llama-3.3-70b-versatile` | Model for symptom analysis (needs JSON mode) |
| `GROQ_MODEL_FAST` | No | `llama-3.1-8b-instant` | Model for MediBot chatbot (faster responses) |
| `JWT_SECRET` | No | `medi-route-jwt-secret-change-in-production` | Secret key for JWT session signing |
| `NODE_ENV` | No | `development` | Set to `production` for secure cookies |

---

## 🗄️ Database Schema

The database uses **PostgreSQL** with **Prisma ORM** and includes the following models:

### Models Overview

| Model | Table | Description |
|-------|-------|-------------|
| `User` | `users` | Core user with role (PATIENT / DOCTOR / ADMIN) |
| `DoctorProfile` | `doctor_profiles` | Doctor credentials, specialty, hospital affiliation |
| `Hospital` | `hospitals` | Hospital info with GPS coordinates and departments |
| `Appointment` | `appointments` | Patient-doctor bookings with status tracking |
| `DoctorSchedule` | `doctor_schedules` | Weekly availability per doctor |
| `Notification` | `notifications` | In-app notifications for all users |
| `ChatMessage` | `chat_messages` | MediBot AI conversation history |
| `SymptomAnalysis` | `symptom_analyses` | Audit log of AI symptom analyses |

### Enums

- **UserRole**: `PATIENT`, `DOCTOR`, `ADMIN`
- **AppointmentStatus**: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- **UrgencyLevel**: `LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`
- **SpecialistType**: 20 specialist types (CARDIOLOGIST through PATHOLOGIST)
- **Department**: 21 hospital departments (CARDIOLOGY through EMERGENCY)
- **ConsultationType**: `IN_PERSON`, `VIDEO`, `PHONE`

---

## 🧠 AI Integration

### AI Provider: Groq

MediRoute AI uses the **Groq Cloud API** for all AI features. Groq provides ultra-fast inference with open-source LLMs.

### Models Used

| Feature | Model | Temperature | Max Tokens | Why |
|---------|-------|-------------|------------|-----|
| **Symptom Analysis** | Llama 3.3 70B Versatile | 0.3 | 1024 | Large model with JSON mode for structured medical output |
| **MediBot Chat** | Llama 3.1 8B Instant | 0.7 | 512 | Fast model for real-time chat conversations |
| **Specialist Recommendation** | Llama 3.1 8B Instant | 0.5 | 512 | Quick specialist lookup |

### How It Works

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│  Patient  │────▶│  Server      │────▶│  Groq API    │────▶│  Llama   │
│  Symptoms │     │  Action      │     │  (gsk_xxx)   │     │  3.3/3.1 │
└──────────┘     └──────────────┘     └─────────────┘     └──────────┘
                        │                                        │
                        │◀────────── JSON Response ──────────────┘
                        │
                  ┌─────┴─────┐
                  │  Validate  │
                  │  (Zod)     │
                  └─────┬─────┘
                        │
                  ┌─────┴─────┐
                  │  Return to │
                  │  Frontend  │
                  └───────────┘
```

### Rate Limiting

In-memory rate limiting is applied per request type:
- **Symptom Analysis**: 10 requests per 60 seconds
- **Chatbot**: 10 requests per 60 seconds
- **Specialist Lookup**: 10 requests per 60 seconds

> The Groq API key is **never exposed to the browser** — all AI calls happen in Next.js Server Actions.

---

## 🗺️ Map & Location

### Map Library: Leaflet + React-Leaflet

| Component | Purpose |
|-----------|---------|
| **Leaflet** | Core mapping library (v1.9.4) |
| **React-Leaflet** | React bindings (v5.0.0) |
| **Tile Source** | OpenStreetMap (free, no API key needed) |
| **Custom Markers** | Color-coded: blue (user location), red (emergency), default (hospitals) |

### Distance Calculation

The **Haversine formula** calculates great-circle distance between two GPS coordinates:

$$d = 2r \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where $r = 6371$ km (Earth's radius).

### Preloaded Hospitals (Peshawar)

The platform includes 13+ real hospitals in Peshawar with verified coordinates:

| Hospital | Type | Key Departments |
|----------|------|----------------|
| Lady Reading Hospital (LRH) | Government | Cardiology, Neurology, Emergency, Oncology |
| Khyber Teaching Hospital (KTH) | Government | Cardiology, Psychiatry, Endocrinology |
| Hayatabad Medical Complex (HMC) | Government | Cardiology, Oncology, Radiology |
| North West General Hospital (NWGH) | Private | Multi-specialty |
| Rehman Medical Institute (RMI) | Private | Cardiology, Neurology, Oncology |
| Kuwait Teaching Hospital | Government | General Medicine, Pediatrics |
| Peshawar General Hospital | Private | Cardiology, Orthopedics |
| Shifa International Hospital | Private | Cardiology, Neurology |
| Mercy Hospital | Private | Gynecology, Pediatrics |
| Al-Khidmat Hospital | Charity | Ophthalmology, Dental |
| Institute of Kidney Diseases (IKD) | Specialized | Nephrology, Urology |
| Peshawar Institute of Cardiology (PIC) | Specialized | Cardiology |
| Children Hospital Peshawar | Specialized | Pediatrics |

---

## 👥 After Cloning — Team Member Setup Guide

> This section is for developers joining the project. Follow these steps in order.

### Step 1: Prerequisites Check

Before doing anything, make sure you have:

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm version
npm --version

# Check if PostgreSQL is running
psql --version
```

If you don't have PostgreSQL, install it:
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql@16`
- **Linux**: `sudo apt install postgresql postgresql-contrib`

### Step 2: Clone and Install

```bash
git clone <repo-url>
cd taif-proj
npm install
```

### Step 3: Create Your Database

```bash
# Open PostgreSQL CLI
psql -U postgres

# Create the database
CREATE DATABASE mediroute;

# Exit
\q
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Database — replace USER, PASSWORD, HOST, PORT with your values
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/mediroute"

# Groq AI — get your free API key at https://console.groq.com/
GROQ_API_KEY="gsk_your_api_key_here"
GROQ_MODEL_PRIMARY="llama-3.3-70b-versatile"
GROQ_MODEL_FAST="llama-3.1-8b-instant"

# JWT Secret — generate a random string
JWT_SECRET="your-strong-random-secret-change-in-production"
```

> ⚠️ **Never commit `.env` to git!** It's already in `.gitignore`.

### Step 5: Initialize the Database

```bash
# Push schema to your PostgreSQL database
npx prisma db push

# Generate the Prisma client (needed for TypeScript types)
npx prisma generate
```

### Step 6: Create Admin User

```bash
node create-admin.js
```

This creates:
- **Email**: `admin@mediroute.pk`
- **Password**: `admin123`

### Step 7: (Optional) Seed Demo Data

The seed script populates hospitals, demo patients, and demo doctors:

```bash
npx prisma db seed
```

### Step 8: Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Quick Test Checklist

After setup, verify everything works:

| Test | URL | What to check |
|------|-----|--------------|
| Home page | `/` | Hero section, nav links load |
| Register patient | `/register` | Can create a patient account |
| Login | `/login` | Can log in with created account |
| Admin login | `/login` | Log in with `admin@mediroute.pk` / `admin123` |
| Admin dashboard | `/admin` | Stats, pending doctors, user locations visible |
| Register doctor | `/register/doctor` | Form loads with hospital dropdown |
| Symptom checker | `/symptoms` | Type "tooth ache" → AI responds |
| Hospitals map | `/hospitals` | Map loads with hospital markers |
| Chatbot | `/chatbot` | MediBot responds to messages |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL` error | Check `.env` file exists and PostgreSQL is running |
| Prisma push fails | Run `npx prisma db push --accept-data-loss` |
| AI features not working | Verify `GROQ_API_KEY` in `.env` (starts with `gsk_`) |
| Map not loading | Internet connection required (tiles load from OpenStreetMap) |
| Location not working | Must use `localhost` (HTTPS not required for local dev) |
| Login redirect loop | Clear cookies, make sure JWT_SECRET is set |
| Port already in use | `npx kill-port 3000` then `npm run dev` |

---

### Project Conventions

| Convention | Rule |
|------------|------|
| **File naming** | PascalCase for components, kebab-case for utilities |
| **Server actions** | All in `src/app/actions/` with `'use server'` directive |
| **Client components** | All have `'use client'` at the top |
| **TypeScript** | Strict mode, all props typed |
| **Styling** | Tailwind CSS only, no custom CSS files |
| **Icons** | Use `react-icons/fa6` (Font Awesome 6 free) |
| **Auth** | Custom JWT via `jose`, session cookie `medi-route-session` |
| **API calls** | All via Next.js Server Actions, no REST endpoints |
| **Database** | Prisma ORM, no raw SQL |

### Before You Push

```bash
# Always run before committing
npm run lint        # Check for lint errors
npx prisma generate # Ensure client is up to date
```

---

## 🏗️ Updated Project Structure

```
taif-proj/
├── prisma/
│   ├── schema.prisma              # 9 models, 6 enums
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout + ClientLayout wrapper
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css
│   │   ├── actions/
│   │   │   ├── ai.ts              # Groq AI: symptom analysis + MediBot
│   │   │   ├── auth.ts            # Registration (patient/doctor) + login
│   │   │   ├── admin.ts           # Admin: approvals, stats, user locations
│   │   │   ├── appointments.ts    # Booking + appointment management
│   │   │   ├── chat.ts            # Chat history
│   │   │   ├── doctor.ts          # Schedule + date-specific availability
│   │   │   ├── location.ts        # GPS, hospitals, doctors by specialty
│   │   │   └── notifications.ts   # In-app notifications
│   │   ├── symptoms/              # AI symptom checker + doctor finder
│   │   ├── chatbot/               # MediBot AI chat
│   │   ├── hospitals/             # Hospital map + directory
│   │   ├── appointments/          # Patient appointments
│   │   ├── doctor/                # Doctor dashboard + calendar
│   │   │   └── schedule/          # Weekly schedule page
│   │   ├── admin/                 # Admin dashboard
│   │   ├── login/
│   │   └── register/
│   │       └── doctor/            # Doctor registration form
│   ├── components/
│   │   ├── ClientLayout.tsx       # AuthProvider wrapper
│   │   ├── NavLinks.tsx           # Role-based desktop nav ✨
│   │   ├── MobileNav.tsx          # Role-based mobile nav ✨
│   │   ├── LocationPrompt.tsx     # Auto location permission prompt ✨
│   │   ├── Map.tsx                # Leaflet interactive map
│   │   ├── NotificationBell.tsx   # Real-time notification bell
│   │   └── EmergencyButton.tsx    # 1122 emergency dial
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── session.ts             # JWT session management
│   │   ├── AuthProvider.tsx       # React auth context
│   │   ├── useGeolocation.ts      # Geolocation hook ✨
│   │   ├── ai-types.ts            # AI response types + Zod schemas
│   │   └── hospitals.ts           # Peshawar hospital seed data
│   └── middleware.ts              # Route protection middleware ✨
├── create-admin.js                # Admin user creation script
├── package.json
└── README.md
```

> ✨ = New since initial version

---

## 🆕 Recent Features Added

### Role-Based Navigation
- Navbar links change based on user role (Patient / Doctor / Admin)
- "My Appointments" — Patients only
- "Doctor Panel" — Doctors only  
- "Admin" — Admins only
- Logged-out users see: Register, Login, Patient Sign Up
- Logged-in users see: Name + Role badge + Logout button

### Date-Specific Doctor Calendar
- Doctors can set availability for **specific dates** (not just weekly patterns)
- Interactive monthly calendar on doctor dashboard
- Color-coded: 🟢 available, 🔴 unavailable
- Appointments listed per selected date

### Auto Location Prompt
- All visitors see a friendly banner asking to share location
- One-time only per browser (remembers choice)
- Saves GPS coordinates to database for logged-in users
- Falls back to Peshawar default if denied

### Admin: User Locations Panel
- Super admin can see which users have shared their location
- Shows coordinates, role, and last-updated timestamp
- Location stats summary (X of Y users shared)

### Doctor Registration: Hospital Selector
- Dropdown of all approved hospitals during registration
- Option to add custom clinic with its own GPS coordinates
- "Use My Location" button for automatic coordinate detection

### Symptom History
- Patients can see their previous symptom searches
- Click any history item to reuse it
- Stored per user in database

---

## 🔐 Authentication & Authorization

### Session Management

- **JWT-based sessions** using the `jose` library (lightweight, edge-compatible)
- Tokens stored in **HTTP-only cookies** (`medi-route-session`)
- Cookie settings:
  - `httpOnly: true` — prevents XSS
  - `secure: true` in production — HTTPS only
  - `sameSite: lax` — CSRF protection
  - `maxAge: 7 days`
- `bcryptjs` with 12 salt rounds for password hashing

### Role-Based Access

| Role | Permissions |
|------|------------|
| **PATIENT** | Symptom checker, chatbot, view hospitals, book/manage appointments |
| **DOCTOR** | View own appointments, manage weekly schedule |
| **ADMIN** | Approve/reject doctors, view platform statistics |

### Auth Flow

```
Register → Hash Password → Create User → (Doctor: pending approval)
Login → Verify Password → Sign JWT → Set Cookie → Redirect
Request → Read Cookie → Verify JWT → Check Role → Allow/Deny
Logout → Delete Cookie → Clear Session
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client from schema |
| `npm run db:push` | Push schema directly to database (dev) |
| `npm run db:migrate` | Create and apply migrations (prod) |
| `npm run db:studio` | Open Prisma Studio GUI for database |

### Utility Scripts

| Script | Purpose |
|--------|---------|
| `node create-admin.js` | Create an admin user account |
| `node create-demo-patient.js` | Create a demo patient for testing |
| `node approve-doctors.js` | Bulk approve pending doctor registrations |
| `node check-appointments.js` | Check appointment statuses |
| `node test-db.js` | Test database connectivity |

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Key Production Notes

1. **Environment Variables**: Set all required env vars in your hosting environment
2. **Database**: Use a managed PostgreSQL service (e.g., Neon, Supabase, Railway)
3. **JWT_SECRET**: Must be a strong, unique random string — never use the default
4. **Groq API Key**: Keep it secure; it's only used server-side
5. **Cookie Security**: `secure: true` is automatically set when `NODE_ENV=production`

### Compatible Hosting

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js server** with PostgreSQL access

---

## 🎨 Design System

### Custom Theme Colors (Tailwind)

```
primary:   #2563eb (Blue 600)     — Primary actions, links
emergency: #dc2626 (Red 600)      — Emergency button, urgent badges
medical:   #059669 (Emerald 600)  — Medical/department badges
```

---

## 🙏 Disclaimer

> **MediRoute AI is NOT a replacement for professional medical advice, diagnosis, or treatment.** Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition. In case of emergency, call **1122** (Pakistan) or visit the nearest hospital ER immediately.

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

*Built with ❤️ for the people of Peshawar.*
