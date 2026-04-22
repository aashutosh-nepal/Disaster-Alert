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

<img width="1619" height="957" alt="Screenshot 2026-04-23 at 1 55 45 AM" src="https://github.com/user-attachments/assets/804cbfd1-9ce7-4af4-915a-171496fa5fea" />

<img width="1620" height="905" alt="Screenshot 2026-04-23 at 1 56 03 AM" src="https://github.com/user-attachments/assets/953300de-3d76-43ad-8553-08bcdd8c6078" />

<img width="1670" height="960" alt="Screenshot 2026-04-23 at 1 56 17 AM" src="https://github.com/user-attachments/assets/0a12a7f7-df6e-4a9b-880d-c9dd501da817" />

<img width="1660" height="944" alt="Screenshot 2026-04-23 at 1 57 00 AM" src="https://github.com/user-attachments/assets/46fbc373-286c-4c5e-84d7-8b5551a221b1" />

<img width="1644" height="924" alt="Screenshot 2026-04-23 at 1 57 40 AM" src="https://github.com/user-attachments/assets/1caa96fa-a300-4aba-a2a1-27f52e42e509" />

<img width="1649" height="956" alt="Screenshot 2026-04-23 at 1 57 57 AM" src="https://github.com/user-attachments/assets/99ef4a05-395d-4850-942e-0b4329c9e6dd" />
