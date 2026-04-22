🚨 Local Disaster Alert & Resource Coordination Platform

📌 Overview

The Local Disaster Alert & Resource Coordination Platform is a full-stack MERN web application designed to enhance communication, coordination, and response efficiency during natural disasters such as floods, earthquakes, cyclones, and fires.

This platform provides a centralized system where citizens can report incidents and request essential resources, volunteers can respond to emergencies, and administrators can monitor and manage relief operations in real-time. The system aims to reduce response delays and improve disaster management efficiency.


🎯 Key Features

👤 Authentication & Security

* User registration and login using JWT authentication
* Secure password hashing with bcrypt
* Protected routes and session handling

🧑‍🤝‍🧑 Role-Based Access Control (RBAC)

* Citizen: Report disasters and request help
* Volunteer: View and respond to nearby requests
* Admin: Monitor reports, manage users, and coordinate resources

🚨 Disaster Reporting System

* Report disasters with:
    * Location
    * Type (flood, earthquake, etc.)
    * Description
* Track report status (pending, in-progress, resolved)

📦 Resource Request System

* Request essential resources:
    * Food
    * Water
    * Shelter
    * Medical aid
* Track request progress and assignment

📊 Dashboard & Monitoring

* Role-based dashboards
* Overview of all reports and requests
* Real-time updates on system activities

⚡ Real-Time Communication

* Instant updates using Socket.io
* Live notifications for volunteers and users

🗺️ Map Integration (Optional)

* Display disaster locations on map
* Improve situational awareness

🏗️ Tech Stack

Frontend

* React.js (Vite)
* Tailwind CSS
* Axios
* React Router DOM

Backend

* Node.js
* Express.js

Database

* MongoDB (Mongoose)

Authentication

* JSON Web Tokens (JWT)
* bcrypt

Real-Time

* Socket.io

⚙️ Installation & Setup

🔹 Clone Repository

git clone https://github.com/your-username/disaster-platform.git
cd disaster-platform


🔹 Backend Setup

cd server
npm install
npm run start

Create .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


🔹 Frontend Setup

cd client
npm install
npm run dev

Create .env file:

VITE_GOOGLE_MAPS_API_KEY=your_api_key


🚀 Usage

1. Register or login as a user
2. Report disaster incidents or request resources
3. Volunteers view and respond to requests
4. Admin monitors and manages all activities
5. Real-time updates improve coordination


🔄 API Endpoints

Authentication

* POST /api/auth/register
* POST /api/auth/login

Disaster Reports

* POST /api/reports
* GET /api/reports

Resource Requests

* POST /api/requests
* GET /api/requests


🎓 Learning Outcomes

* Full-stack MERN application development
* Real-time systems using Socket.io
* Role-based access control implementation
* REST API design and integration
* Database modeling using MongoDB


🔮 Future Enhancements

* AI-based priority detection
* Push notifications
* Progressive Web App (PWA) support
* SMS alert integration
* Advanced analytics dashboard

photos:
<img width="503" height="515" alt="Screenshot 2026-04-23 at 1 37 07 AM" src="https://github.com/user-attachments/assets/53e92ef2-6fb9-4b70-beb9-e509656b8426" />

