🚨 Local Disaster Alert & Resource Coordination Platform

📌 Overview

The Local Disaster Alert & Resource Coordination Platform is a full-stack MERN web application designed to improve communication and coordination during emergency situations such as floods, earthquakes, and cyclones. It provides a centralized system for reporting disasters, requesting resources, and managing relief operations in real-time.

⸻

🎯 Features

👤 Authentication

* User registration & login (JWT-based)
* Secure password hashing (bcrypt)

🧑‍🤝‍🧑 Role-Based Access

* Citizen → Report disasters & request help
* Volunteer → Respond to requests
* Admin → Monitor and manage system

🚨 Disaster Reporting

* Report incidents with location, type, and description
* Track status of reports

📦 Resource Requests

* Request essentials like food, water, shelter, medical aid
* Track request progress

📊 Dashboard

* Overview of reports and requests
* Role-specific dashboards

⚡ Real-Time Updates

* Instant updates using Socket.io

🗺️ Map Integration (Optional)

* View disaster locations on map

⸻

🏗️ Tech Stack

Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* React Router

Backend

* Node.js
* Express.js

Database

* MongoDB (Mongoose)

Authentication

* JWT (JSON Web Tokens)
* bcrypt

Real-Time

* Socket.io

⸻

Local-Disaster-Alert-Platform/
│
├── client/                         # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Images, icons
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/                 # Main pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Report.jsx
│   │   │   └── Request.jsx
│   │   │
│   │   ├── services/              # API calls
│   │   │   └── api.js
│   │   │
│   │   ├── context/               # Global state (Auth)
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/                 # Custom hooks
│   │   │
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Styling
│   │
│   ├── .env                       # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   │
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   ├── DisasterReport.js
│   │   ├── ResourceRequest.js
│   │   └── Task.js
│   │
│   ├── controllers/               # Business logic
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   └── requestController.js
│   │
│   ├── routes/                    # API routes
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   └── requestRoutes.js
│   │
│   ├── middleware/                # Middleware functions
│   │   └── authMiddleware.js
│   │
│   ├── socket/                    # Socket.io setup (optional)
│   │   └── socket.js
│   │
│   ├── server.js                  # Main server file
│   ├── .env                       # Backend environment variables
│   └── package.json
│
├── README.md
└── .gitignore

⸻

⚙️ Installation & Setup

1️⃣ Clone Repository

git clone https://github.com/your-username/disaster-platform.git
cd disaster-platform

⸻

2️⃣ Setup Backend

cd server
npm install
npm run start

Create .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

⸻

3️⃣ Setup Frontend

cd client
npm install
npm run dev

⸻

4️⃣ Environment Variables (Frontend)

Create .env in client:

VITE_GOOGLE_MAPS_API_KEY=your_api_key

⸻

🚀 Usage

1. Register/Login
2. Citizen reports disaster or requests help
3. Volunteers respond to requests
4. Admin monitors and manages activities
5. Real-time updates improve coordination

⸻

🔄 API Endpoints

Auth

* POST /api/auth/register
* POST /api/auth/login

Reports

* POST /api/reports
* GET /api/reports

Requests

* POST /api/requests
* GET /api/requests

⸻

🎓 Learning Outcomes

* Full-stack MERN development
* Real-time communication (Socket.io)
* Role-based system design
* REST API development
* Database modeling

⸻

🌟 Future Enhancements

* AI-based priority detection
* Push notifications
* Offline support (PWA)
* SMS alerts
* Advanced analytics dashboard
