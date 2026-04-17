# 🎪 EventFlow — MERN Event Management System

A full-stack event management system built with MongoDB, Express, React, and Node.js.

## ✨ Features

- 📊 **Real-time Dashboard** with analytics charts (Pie + Bar charts)
- 🎪 **Event Management** — Create, edit, delete events with categories, status, capacity
- 👥 **Guest Management** — Add guests, track RSVPs (Yes/No/Maybe/Pending)
- ✅ **Check-In Tracking** — Toggle guest check-in status
- 🔍 **Search & Filter** — Filter guests by RSVP status, search by name/email
- 🔐 **JWT Authentication** — Secure login/register with token-based auth
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- 🌙 **Dark Theme** — Premium dark UI with purple gradient accents

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_management
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Start Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open App
Visit: **http://localhost:5173**

Register a new account to get started!

## 📁 Project Structure

```
int -222 project/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Profile
│   │   ├── eventController.js    # Event CRUD + Stats
│   │   └── guestController.js    # Guest CRUD + RSVP + Check-in
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection
│   ├── models/
│   │   ├── Event.js              # Event schema
│   │   ├── Guest.js              # Guest schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── guestRoutes.js
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance with JWT interceptor
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── EventCard.jsx
    │   │   ├── GuestTable.jsx
    │   │   ├── RSVPBadge.jsx
    │   │   └── Modal.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Events.jsx
    │   │   ├── EventDetail.jsx
    │   │   ├── GuestList.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css             # Dark theme design system
    ├── index.html
    └── vite.config.js
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new organizer |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (search/filter) |
| POST | `/api/events` | Create event |
| GET | `/api/events/stats` | Dashboard analytics |
| GET | `/api/events/:id` | Get single event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event + guests |

### Guests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guests?event=:id&rsvpStatus=yes` | List guests (filterable) |
| POST | `/api/guests` | Add guest |
| PUT | `/api/guests/:id` | Update guest / RSVP |
| DELETE | `/api/guests/:id` | Remove guest |
| PATCH | `/api/guests/:id/checkin` | Toggle check-in |
| GET | `/api/guests/stats/:eventId` | Per-event RSVP stats |

## 🛠 Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 18, Vite 5, React Router v6, Axios, Recharts, React Icons, date-fns  
**Design:** Custom dark theme CSS with CSS variables, glassmorphism, gradients
