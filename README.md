# 🩺 GynAi - AI-Powered Women's Health Platform

![HomePage Screenshot](/assests/homepage.png)
![RegisterPage Screenshot](/assests/registerpage.png)
![LoginPage Screenshot](/assests/loginpage.png)
![TrackerPage Screenshot](/assests/trackerpage.png)
![PredictPage Screenshot](/assests/predictpage.png)
![DoctorPage Screenshot](/assests/doctorpage.png)
![CommunityPage Screenshot](/assests/communitypage.png)
![DashboardPage Screenshot](/assests/dashboardpage.png)



> An AI-powered web application for PCOS (Polycystic Ovary Syndrome) prediction, symptom tracking, and women's healthcare management.

---

## About The Project

**GynAi** is a comprehensive women's health platform that leverages artificial intelligence to predict PCOS risk, track symptoms, and connect users with healthcare professionals. The platform aims to empower women with accessible health information and early detection tools.

### Key Objectives:
- Provide AI-based PCOS risk prediction
- Enable daily symptom tracking and pattern analysis
- Connect users with nearby gynecologists and specialists
- Educate about women's health conditions and management

**Live Demo:** [https://gynai-app.netlify.app/](https://gynai-app.netlify.app/)

---

## Features

### AI-Powered PCOS Prediction
- Advanced machine learning model for PCOS risk assessment
- Input various health parameters (BMI, hormones, symptoms)
- Instant risk analysis with confidence scores
- Personalized diet, exercise, and lifestyle recommendations

### Symptom Tracker
- Daily symptom logging (pain, mood, energy, sleep)
- Menstrual cycle tracking
- Physical and mental health monitoring
- Historical data visualization and pattern recognition

### Doctor Finder
- Search gynecologists and specialists by location
- Filter by specialty, availability, and ratings
- View consultation fees and doctor profiles
- Integrated Google Maps for directions
- Book appointments (interface ready)

### User Authentication
- Secure registration and login system
- Password encryption with bcrypt
- Session management
- Personalized dashboard

### Responsive Design
- Mobile-friendly interface
- Modern, intuitive UI/UX
- Fast loading times
- Cross-browser compatibility

---

## Tech Stack

### Frontend
- **HTML5** - Structure and content
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome** - Icons
- **Google Maps API** - Location services

### Backend
- **Python 3.9+** - Core programming language
- **Flask 3.0** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **MySQL** - Database for user management
- **bcrypt** - Password hashing
- **joblib** - ML model serialization

### Machine Learning
- **scikit-learn** - PCOS prediction model
- **pandas** - Data preprocessing
- **numpy** - Numerical computations

### Deployment & Cloud Services
- **Netlify** - Frontend hosting (PaaS)
- **Render** - Backend hosting (PaaS)
- **Google Maps API** - Maps integration (API Service)
- **MySQL** - Database service (DBaaS)

### Version Control
- **Git** - Version control
- **GitHub** - Code repository

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       USER'S BROWSER                         │
│                  (Chrome, Firefox, Safari)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    NETLIFY (Frontend - PaaS)                 │
│          https://harmonious-cobbler-92d292.netlify.app      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  • index.html (Homepage)                           │    │
│  │  • login.html / register.html (Authentication)     │    │
│  │  • prediction.html (PCOS Prediction)               │    │
│  │  • tracker.html (Symptom Tracker)                  │    │
│  │  • doctors.html (Doctor Finder)                    │    │
│  │  • dashboard.html (User Dashboard)                 │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON)
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                   RENDER (Backend - PaaS)                    │
│              https://gynai-web-1.onrender.com               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Flask Application (app.py)                        │    │
│  │  ├─ /register - User registration                  │    │
│  │  ├─ /login - User authentication                   │    │
│  │  ├─ /predict - PCOS prediction (ML model)          │    │
│  │  ├─ /api/doctors - Doctor listings                 │    │
│  │  └─ /api/config - API configuration                │    │
│  │                                                     │    │
│  │  ML Model: pcos_model.pkl                          │    │
│  │  Data: database.json (doctors)                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ↓                           ↓
┌────────────────────┐      ┌─────────────────────────────┐
│   MySQL Database   │      │   Google Maps API           │
│   (DBaaS)          │      │   (API Service)             │
│                    │      │                             │
│  Tables:           │      │  Services:                  │
│  • users           │      │  • Geocoding                │
│  • login_history   │      │  • Map Display              │
└────────────────────┘      │  • Directions               │
                            └─────────────────────────────┘
```

### Data Flow (PCOS Prediction Example)

```
1. User fills prediction form on Frontend (Netlify)
   ↓
2. JavaScript sends POST request to /predict endpoint
   Data: {age, weight, height, symptoms, hormones...}
   ↓
3. Flask backend receives JSON data (Render)
   ↓
4. Data preprocessing and feature engineering
   ↓
5. ML model (pcos_model.pkl) generates prediction
   ↓
6. Response sent back: {prediction: 0/1, confidence: 0.85}
   ↓
7. Frontend displays result with recommendations
```

---


## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher**
  ```bash
  python --version
  ```

- **MySQL Server**
  - Download from [MySQL Official Site](https://dev.mysql.com/downloads/)
  - Or use XAMPP/WAMP

- **Git**
  ```bash
  git --version
  ```

- **Code Editor** (VS Code recommended)

- **Modern Web Browser** (Chrome, Firefox, Safari)

---

### Installation

####  Clone the Repository

```bash
git clone https://github.com/yourusername/gynai.git
cd gynai
```

#### Backend Setup

**Navigate to backend directory:**
```bash
cd Backend
```

**Create virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Set up MySQL Database**

**Configure environment variables:**

Create `.env` file in Backend directory:
```env
SECRET_KEY=your-secret-key-change-this
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=user_system
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
PORT=5001
```

**Get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Copy key to `.env` file

#### 3️⃣ Frontend Setup

**Navigate to frontend directory:**
```bash
cd ../Frontend
```

**Update `templates/config.js`:**
```javascript
const API_CONFIG = {
  BACKEND_URL: 'http://127.0.0.1:5001',  // Local development
  
  getBaseURL: function() {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5001';
    }
    return this.BACKEND_URL;
  }
};

const API_BASE_URL = API_CONFIG.getBaseURL();
```

---

### Running Locally

#### 1️⃣ Start Backend Server

```bash
cd Backend
python app.py
```

You should see:
```
🚀 Gynai API Server Starting...
✓ Server running on: http://0.0.0.0:5001
✓ PCOS Model loaded successfully!
✓ Doctors database loaded successfully!
```

#### Start Frontend Server

**Option A: Using VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Opens at `http://127.0.0.1:5500`

**Option B: Using Python HTTP Server**
```bash
cd Frontend
python -m http.server 5500
```
Then open: `http://127.0.0.1:5500`

#### Access the Application

Open your browser and go to:
```
http://127.0.0.1:5500/index.html
```

---

## Deployment

### Frontend Deployment (Netlify)

#### Method 1: Drag & Drop (Easiest)

1. **Prepare files:**
   - Ensure `config.js` has production backend URL:
   ```javascript
   BACKEND_URL: 'https://gynai-web-1.onrender.com',
   ```

2. **Deploy:**
   - Go to [Netlify](https://www.netlify.com/)
   - Sign up / Login
   - Click "Add new site" → "Deploy manually"
   - Drag the `Frontend` folder to the upload area
   - Wait for deployment

3. **Get URL:**
   - Netlify provides URL like: `https://your-app-name.netlify.app`

#### Method 2: Git Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import from Git"
   - Connect GitHub
   - Select repository
   - Configure:
     - Base directory: `Frontend`
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

3. **Create `netlify.toml` in Frontend folder**

### Backend Deployment (Render)

#### Prepare for Deployment

**Ensure these files exist in Backend folder:**

**`requirements.txt`**

**`Procfile`**

**Update `app.py` CORS:**
```python
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://your-netlify-app.netlify.app",  # Add your Netlify URL
    "https://*.netlify.app"
])
```

#### Deploy to Render

1. **Push to GitHub:**
   ```bash
   cd Backend
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create Render Account:**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `gynai-backend` (or any name)
     - **Environment:** `Python 3`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app`
     - **Instance Type:** `Free`

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add:
     ```
     SECRET_KEY=your-secret-key-here
     DB_HOST=your-mysql-host
     DB_USER=your-mysql-user
     DB_PASSWORD=your-mysql-password
     DB_NAME=user_system
     GOOGLE_MAPS_API_KEY=your-api-key
     PORT=5001
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Get URL: `https://your-app.onrender.com`

#### Update Frontend Config

**Update `Frontend/templates/config.js`:**
```javascript
const API_CONFIG = {
  BACKEND_URL: 'https://your-app.onrender.com',  // Your Render URL
  
  getBaseURL: function() {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5001';
    }
    return this.BACKEND_URL;
  }
};
```

**Redeploy Frontend to Netlify** with updated config.

---

## API Documentation

### Base URL
```
Production: https://gynai-web-1.onrender.com
Local: http://127.0.0.1:5001
```

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 1
}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Logout
```http
POST /logout

Response: 200 OK
{
  "success": true,
  "message": "Logout successful"
}
```

### Prediction Endpoint

#### PCOS Prediction
```http
POST /predict
Content-Type: application/json

{
  "age": 25,
  "weight": 65,
  "height": 165,
  "bmi": 23.9,
  "bloodGroup": "A+",
  "cycle": "I",
  "weightGain": 1,
  "hairGrowth": 1,
  // ... other parameters
}

Response: 200 OK
{
  "prediction": 1,
  "confidence": 0.85,
  "message": "Prediction successful"
}
```

### Doctor Endpoints

#### Get All Doctors
```http
GET /api/doctors
Query Parameters:
  - specialty (optional)
  - availability (optional)
  - search (optional)

Response: 200 OK
[
  {
    "id": 1,
    "name": "Sneha Sharma",
    "specialty": "Gynecologist",
    "clinic": "City Hospital",
    "rating": 4.8,
    "consultationFee": 800,
    ...
  }
]
```

#### Get Google Maps Config
```http
GET /api/config

Response: 200 OK
{
  "googleMapsApiKey": "your-api-key"
}
```

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Project**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open Pull Request**

### Contribution Guidelines:
- Follow existing code style
- Write meaningful commit messages
- Update documentation for new features
- Add tests if applicable
- Ensure all tests pass

---

## License

Distributed under the MIT License. See `LICENSE` file for more information.

---
## Acknowledgments

- [Flask Documentation](https://flask.palletsprojects.com/)
- [scikit-learn](https://scikit-learn.org/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Font Awesome](https://fontawesome.com/)
- [MySQL](https://www.mysql.com/)
- [bcrypt](https://github.com/pyca/bcrypt/)

---

## Project Statistics

- **Lines of Code:** ~5000+
- **Files:** 30+
- **Technologies Used:** 15+
- **Cloud Services:** 4
- **Development Time:** X months
- **Contributors:** X

---

## 🔮 Future Enhancements

- [ ] Add real-time chat with doctors
- [ ] Implement appointment booking with calendar integration
- [ ] Add medication reminders
- [ ] Create mobile app (React Native / Flutter)
- [ ] Add multi-language support
- [ ] Integrate payment gateway for consultations
- [ ] Add AI chatbot for basic health queries
- [ ] Implement data export (PDF reports)
- [ ] Add community forum
- [ ] Integrate wearable device data

---

## ⚠️ Disclaimer

**Medical Disclaimer:** This application is for informational purposes only and should not be considered medical advice. Always consult with qualified healthcare professionals for accurate diagnosis and treatment. The PCOS prediction model is a screening tool and not a diagnostic instrument.

---

## 🎯 Project Status

🟢 **Active Development** - Regularly maintained and updated

---

Made with ❤️ for Women's Health

---

**⭐ Star this repo if you find it helpful!**

[Back to Top](#-gynai---ai-powered-womens-health-platform)