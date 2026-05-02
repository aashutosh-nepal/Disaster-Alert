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
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 00 07 PM" src="https://github.com/user-attachments/assets/f7fa8770-37e8-4fdb-99cb-79c48bf915db" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 00 22 PM" src="https://github.com/user-attachments/assets/524270b6-499a-4c05-a6c3-7f441d571255" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 00 37 PM" src="https://github.com/user-attachments/assets/429442d3-c3f5-4c06-bce0-e009ef5e6d73" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 00 59 PM" src="https://github.com/user-attachments/assets/b3b0ede1-e3f5-4155-a188-c66fbde4d7b1" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 01 18 PM" src="https://github.com/user-attachments/assets/84a444ed-fafc-4dca-a2c9-312fd3af8e0b" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 01 47 PM" src="https://github.com/user-attachments/assets/03c46b09-9823-4c97-82fd-35e13204c8f1" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 01 56 PM" src="https://github.com/user-attachments/assets/540d1219-1ace-427b-9aa5-280403a30d03" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 03 15 PM" src="https://github.com/user-attachments/assets/243a8758-fc3d-4821-ad75-5ec3a710ebd8" />
<img width="1680" height="1050" alt="Screenshot 2026-05-02 at 1 03 44 PM" src="https://github.com/user-attachments/assets/675b531b-21e1-454a-86ee-9cdc6d094d2e" />


