# 🚨 Disaster Alert

> **Local Disaster & Resource Coordination Platform**

A comprehensive web application for real-time disaster management, resource coordination, and emergency response. Connect citizens, volunteers, and administrators to enable faster response times and efficient disaster mitigation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)](https://www.mongodb.com/)

---

## �� Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Real-time Features](#real-time-features)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Disaster Alert is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to streamline disaster management and emergency response coordination.

The platform enables:
- **Citizens** to report disasters and request essential resources
- **Volunteers** to respond to emergencies and coordinate relief efforts
- **Administrators** to monitor activities, manage tasks, and oversee coordination

With real-time updates via WebSocket integration, the platform ensures minimal response delays and efficient resource allocation during critical situations.

---

## ✨ Key Features

### 🏘️ Citizen Features
- Report disasters with location, description, and media attachments
- Request essential resources (water, food, medical supplies, shelter)
- Real-time notifications for resource availability
- Track request status and volunteer responses

### 🤝 Volunteer Features
- Browse available disaster reports and resource requests
- Accept and manage assigned tasks
- Real-time updates on new emergencies
- Communication with citizens and administrators

### 👨‍💼 Administrator Features
- Comprehensive dashboard for monitoring all activities
- View all disaster reports and resource requests
- Manage volunteer assignments and task allocation
- System-wide resource coordination

### 🌐 Common Features
- User authentication with JWT tokens
- Role-based access control (Citizen, Volunteer, Admin)
- Real-time notifications and updates via WebSocket
- Interactive maps for disaster visualization
- Responsive design for mobile and desktop
- File upload support for disaster documentation

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Vite** - Next generation frontend tooling
- **React Router v7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet & React-Leaflet** - Interactive mapping
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time communication
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart development server
- **PostCSS & Autoprefixer** - CSS processing

---

## 📁 Project Structure

```
Disaster-Alert/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # App shell, navbar, sidebar
│   │   │   ├── maps/         # Map-related components
│   │   │   └── ui/           # UI components (Button, Modal, etc.)
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── citizen/      # Citizen dashboard
│   │   │   └── volunteer/    # Volunteer dashboard
│   │   ├── context/          # React Context (Auth, Notifications)
│   │   ├── services/         # API service modules
│   │   └── utils/            # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    # Express backend application
│   ├── controllers/          # Route controllers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── config/               # Configuration files
│   ├── middlewares/          # Custom middlewares
│   ├── utils/                # Utility functions
│   ├── uploads/              # User uploaded files
│   ├── package.json
│   └── server.js             # Entry point
│
├── README.md                 # Project documentation
└── LICENSE                   # MIT License
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** (v5.0 or higher) - [Local](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/aashutosh-nepal/Disaster-Alert.git
cd Disaster-Alert
```

### Step 2: Setup Backend

```bash
cd server
npm install
```

### Step 3: Setup Frontend

```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/disaster-alert

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Client URL(s) for CORS
CLIENT_URL=http://localhost:5173,http://localhost:5174
```

**Note:** For MongoDB Atlas, replace `MONGO_URI` with:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-alert
```

### Step 5: Verify MongoDB Connection

Ensure MongoDB is running:

```bash
# For local MongoDB
mongod
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**

```bash
cd server
npm run dev
```

Expected output:
```
[server] running on http://localhost:5000
```

**Terminal 2 - Start Frontend Dev Server:**

```bash
cd client
npm run dev
```

Expected output:
```
VITE v7.3.2 ready in 234 ms
➜  Local: http://localhost:5173/
```

### Production Build

**Build Frontend:**

```bash
cd client
npm run build
```

**Start Production Server:**

```bash
cd server
NODE_ENV=production npm start
```

---

## 🔌 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe",
  "role": "Citizen"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword"
}
```

### Disasters

#### Report a Disaster
```http
POST /api/disasters
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Building Collapse",
  "description": "Multi-story building collapsed",
  "severity": "critical",
  "latitude": 27.7172,
  "longitude": 85.3240,
  "image": <file>
}
```

#### Get All Disasters
```http
GET /api/disasters
Authorization: Bearer <token>
```

#### Get Disaster Details
```http
GET /api/disasters/:id
Authorization: Bearer <token>
```

### Resource Requests

#### Create Resource Request
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "disasterId": "disaster_id",
  "resourceType": "water",
  "quantity": 100,
  "priority": "high"
}
```

#### Get All Requests
```http
GET /api/requests
Authorization: Bearer <token>
```

#### Update Request Status
```http
PATCH /api/requests/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "fulfilled"
}
```

### Users

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9800000000"
}
```

---

## 🔄 Real-time Features

The application uses **Socket.IO** for real-time communication:

### Client Listeners
- `disasterCreated` - New disaster reported
- `requestCreated` - New resource request
- `statusUpdated` - Request/task status changed
- `volunteerAssigned` - Volunteer assigned to task
- `notificationReceived` - General notifications

### Server Events
- `newDisasterAlert` - Broadcast to connected users
- `resourceRequestUpdate` - Update request status
- `volunteerUpdate` - Volunteer assignment notification

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an [Issue](https://github.com/aashutosh-nepal/Disaster-Alert/issues) on GitHub
- Contact the maintainer

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world disaster management needs
- Community contributions and feedback

---

**Version:** 1.0.0 | **Last Updated:** April 2026
