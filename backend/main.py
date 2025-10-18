from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import mysql.connector
import bcrypt
import os
import re
import json
from datetime import timedelta
from math import radians, sin, cos, sqrt, atan2
import joblib
import numpy as np
import pandas as pd

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True for production (HTTPS)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# CORS configuration
CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    os.getenv('FRONTEND_URL', '')
], allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'CaptainA1918@'),
    'database': os.getenv('DB_NAME', 'user_system')
}

# Google Maps API Key
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', 'YOUR_API_KEY_HERE')

# Load ML model
model = None
try:
    model = joblib.load('pcos_model (2).pkl')
    print("✓ PCOS Model loaded successfully!")
except Exception as e:
    print(f"✗ Error loading model: {e}")

# Load doctors data
doctors_data = {"doctors": [], "specialties": [], "availabilityOptions": []}
try:
    with open('database.json', 'r') as f:
        doctors_data = json.load(f)
    print("✓ Doctors database loaded successfully!")
except FileNotFoundError:
    print("✗ database.json not found")

# ==================== HELPER FUNCTIONS ====================

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return round(R * c, 2)

def encode_categorical(value, feature_name):
    blood_group_map = {
        'A+': 1, 'A-': 2, 'B+': 3, 'B-': 4,
        'AB+': 5, 'AB-': 6, 'O+': 7, 'O-': 8,
        '': 0, None: 0
    }
    cycle_map = {'R': 0, 'I': 1, '': 0, None: 0}
    yn_map = {'Y': 1, 'N': 0, '': 0, None: 0}
    
    if feature_name == 'Blood Group':
        return blood_group_map.get(value, 0)
    elif feature_name == 'Cycle(R/I)':
        return cycle_map.get(value, 0)
    elif feature_name in ['Pregnant(Y/N)', 'Weight gain(Y/N)', 'hair growth(Y/N)', 
                          'Skin darkening (Y/N)', 'Hair loss(Y/N)', 'Pimples(Y/N)',
                          'Fast food (Y/N)', 'Reg.Exercise(Y/N)']:
        return yn_map.get(value, 0)
    return value

def preprocess_input(data):
    """Preprocess input data for PCOS prediction"""
    features = {
        'Sl. No': 1,
        'Patient File No.': np.random.randint(1000, 9999),
        ' Age (yrs)': float(data.get('age', 25)),
        'Weight (Kg)': float(data.get('weight', 60)),
        'Height(Cm) ': float(data.get('height', 160)),
        'BMI': float(data.get('bmi', 23.4)),
        'Blood Group': data.get('bloodGroup', ''),
        'Pulse rate(bpm) ': float(data.get('pulseRate', 72)),
        'RR (breaths/min)': float(data.get('respiratoryRate', 16)),
        'Hb(g/dl)': float(data.get('hb', 12.5)),
        'Cycle(R/I)': data.get('cycle', 'R'),
        'Cycle length(days)': float(data.get('cycleLength', 28)),
        'Marraige Status (Yrs)': float(data.get('marriageStatus', 0)),
        'Pregnant(Y/N)': data.get('pregnant', 'N'),
        'No. of aborptions': float(data.get('abortions', 0)),
        ' I beta-HCG(mIU/mL)': float(data.get('betaHCG1', 0)) if data.get('betaHCG1') else 0,
        'II beta-HCG(mIU/mL)': float(data.get('betaHCG2', 0)) if data.get('betaHCG2') else 0,
        'FSH(mIU/mL)': float(data.get('fsh', 5.0)) if data.get('fsh') else 5.0,
        'LH(mIU/mL)': float(data.get('lh', 4.0)) if data.get('lh') else 4.0,
        'FSH/LH': 0,
        'Hip(inch)': float(data.get('hip', 36)),
        'Waist(inch)': float(data.get('waist', 28)),
        'Waist:Hip Ratio': 0,
        'TSH (mIU/L)': float(data.get('tsh', 2.5)) if data.get('tsh') else 2.5,
        'AMH(ng/mL)': float(data.get('amh', 3.0)) if data.get('amh') else 3.0,
        'PRL(ng/mL)': float(data.get('prl', 15.0)) if data.get('prl') else 15.0,
        'Vit D3 (ng/mL)': float(data.get('vitD3', 30.0)) if data.get('vitD3') else 30.0,
        'PRG(ng/mL)': float(data.get('prg', 10.0)) if data.get('prg') else 10.0,
        'RBS(mg/dl)': float(data.get('rbs', 95)) if data.get('rbs') else 95,
        'Weight gain(Y/N)': 'Y' if data.get('weightGain', 0) == 1 else 'N',
        'hair growth(Y/N)': 'Y' if data.get('hairGrowth', 0) == 1 else 'N',
        'Skin darkening (Y/N)': 'Y' if data.get('skinDarkening', 0) == 1 else 'N',
        'Hair loss(Y/N)': 'Y' if data.get('hairLoss', 0) == 1 else 'N',
        'Pimples(Y/N)': 'Y' if data.get('pimples', 0) == 1 else 'N',
        'Fast food (Y/N)': 'Y' if data.get('fastFood', 0) == 1 else 'N',
        'Reg.Exercise(Y/N)': 'Y' if data.get('regExercise', 0) == 1 else 'N',
        'BP _Systolic (mmHg)': float(data.get('bpSystolic', 120)),
        'BP _Diastolic (mmHg)': float(data.get('bpDiastolic', 80)),
        'Follicle No. (L)': float(data.get('follicleNoL', 10)) if data.get('follicleNoL') else 10,
        'Follicle No. (R)': float(data.get('follicleNoR', 10)) if data.get('follicleNoR') else 10,
        'Avg. F size (L) (mm)': float(data.get('avgFSizeL', 5.0)) if data.get('avgFSizeL') else 5.0,
        'Avg. F size (R) (mm)': float(data.get('avgFSizeR', 5.0)) if data.get('avgFSizeR') else 5.0,
        'Endometrium (mm)': float(data.get('endometrium', 8.0)) if data.get('endometrium') else 8.0
    }
    
    # Calculate derived features
    if features['Waist(inch)'] > 0 and features['Hip(inch)'] > 0:
        features['Waist:Hip Ratio'] = features['Waist(inch)'] / features['Hip(inch)']
    else:
        features['Waist:Hip Ratio'] = 0.78
    
    if features['LH(mIU/mL)'] > 0:
        features['FSH/LH'] = features['FSH(mIU/mL)'] / features['LH(mIU/mL)']
    else:
        features['FSH/LH'] = 1.25
    
    # Encode categorical features
    encoded_features = {k: encode_categorical(v, k) for k, v in features.items()}
    df = pd.DataFrame([encoded_features])
    df = df[model.feature_names_in_]
    return df.astype(float)

# ==================== AUTH ROUTES (from auth.py) ====================

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json() if request.is_json else request.form
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not username or not email or not password:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400
        if len(username) < 3:
            return jsonify({'success': False, 'error': 'Username must be at least 3 characters'}), 400
        if not validate_email(email):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        if len(password) < 6:
            return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Email already registered'}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'message': 'User registered successfully', 'user_id': user_id}), 201
    except Exception as e:
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'error': 'An error occurred'}), 500

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.get_json() if request.is_json else request.form
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500

        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, password FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

        user_id, username, user_email, stored_password = user
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')

        if bcrypt.checkpw(password.encode('utf-8'), stored_password):
            cursor.execute("INSERT INTO login_history (user_id) VALUES (%s)", (user_id,))
            conn.commit()
            cursor.close()
            conn.close()

            session.permanent = True
            session['user_id'] = user_id
            session['username'] = username
            session['email'] = user_email

            return jsonify({'success': True, 'message': 'Login successful', 'user': {'id': user_id, 'username': username, 'email': user_email}}), 200
        else:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Invalid email or password'}), 401
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': 'An error occurred'}), 500

@app.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 200
    session.clear()
    return jsonify({'success': True, 'message': 'Logout successful'}), 200

@app.route('/profile', methods=['GET', 'OPTIONS'])
def profile():
    if request.method == 'OPTIONS':
        return '', 200
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 401
    return jsonify({'success': True, 'user': {'id': session['user_id'], 'username': session['username'], 'email': session['email']}}), 200

# ==================== PREDICTION ROUTES (from app.py) ====================

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.get_json()
        input_df = preprocess_input(data)
        
        print(f"Input shape: {input_df.shape}")
        print(f"Input dtypes: {input_df.dtypes.unique()}")
        
        prediction = model.predict(input_df)[0]
        
        try:
            probabilities = model.predict_proba(input_df)[0]
            confidence = float(max(probabilities))
        except:
            confidence = 0.75
        
        return jsonify({
            'prediction': int(prediction),
            'confidence': confidence,
            'message': 'Prediction successful'
        })
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_type': type(model).__name__,
        'expected_features': int(model.n_features_in_),
        'feature_names': model.feature_names_in_.tolist()
    })

# ==================== DOCTOR/MAP ROUTES (from google_api.py) ====================

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({'googleMapsApiKey': GOOGLE_MAPS_API_KEY})

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    specialty = request.args.get('specialty')
    availability = request.args.get('availability')
    search = request.args.get('search', '').lower()
    
    doctors = doctors_data['doctors']
    
    if search:
        doctors = [d for d in doctors if 
                   search in d['name'].lower() or 
                   search in d['specialty'].lower() or 
                   search in d['clinic'].lower()]
    
    if specialty and specialty != 'all':
        doctors = [d for d in doctors if d['specialty'] == specialty]
    
    if availability and availability != 'all':
        if availability == 'Available Now':
            doctors = [d for d in doctors if d['availability'] == 'available']
        elif availability in ['Available Today', 'Available Tomorrow', 'Available This Week']:
            doctors = [d for d in doctors if d['availability'] != 'offline']
    
    return jsonify(doctors)

@app.route('/api/doctors/nearby', methods=['POST'])
def get_nearby_doctors():
    data = request.json
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')
    max_distance = data.get('maxDistance', 10)
    
    if not user_lat or not user_lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    doctors = doctors_data['doctors']
    nearby_doctors = []
    
    for doctor in doctors:
        doc_lat = doctor['location']['latitude']
        doc_lon = doctor['location']['longitude']
        distance = calculate_distance(user_lat, user_lon, doc_lat, doc_lon)
        
        if distance <= max_distance:
            doctor_copy = doctor.copy()
            doctor_copy['distance'] = distance
            nearby_doctors.append(doctor_copy)
    
    nearby_doctors.sort(key=lambda x: x['distance'])
    return jsonify(nearby_doctors)

@app.route('/api/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = next((d for d in doctors_data['doctors'] if d['id'] == doctor_id), None)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    return jsonify(doctor)

@app.route('/api/doctor/<int:doctor_id>/directions', methods=['POST'])
def get_directions(doctor_id):
    data = request.json
    origin = data.get('origin')
    
    doctor = next((d for d in doctors_data['doctors'] if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    if not origin:
        return jsonify({'error': 'Origin location required'}), 400
    
    destination = f"{doctor['location']['latitude']},{doctor['location']['longitude']}"
    
    return jsonify({
        'origin': origin,
        'destination': destination,
        'doctorName': doctor['name'],
        'clinic': doctor['clinic']
    })

@app.route('/api/specialties', methods=['GET'])
def get_specialties():
    return jsonify(doctors_data['specialties'])

@app.route('/api/availability-options', methods=['GET'])
def get_availability_options():
    return jsonify(doctors_data['availabilityOptions'])

@app.route('/api/book-appointment', methods=['POST'])
def book_appointment():
    data = request.json
    doctor_id = data.get('doctorId')
    patient_name = data.get('patientName')
    patient_email = data.get('patientEmail')
    patient_phone = data.get('patientPhone')
    appointment_date = data.get('appointmentDate')
    appointment_time = data.get('appointmentTime')
    
    if not all([doctor_id, patient_name, patient_email, patient_phone, appointment_date, appointment_time]):
        return jsonify({'error': 'All fields are required'}), 400
    
    doctor = next((d for d in doctors_data['doctors'] if d['id'] == doctor_id), None)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    appointment = {
        'appointmentId': f"APT{doctor_id}{len(patient_name)}",
        'doctorId': doctor_id,
        'doctorName': doctor['name'],
        'clinic': doctor['clinic'],
        'patientName': patient_name,
        'patientEmail': patient_email,
        'patientPhone': patient_phone,
        'appointmentDate': appointment_date,
        'appointmentTime': appointment_time,
        'consultationFee': doctor['consultationFee'],
        'status': 'confirmed'
    }
    
    return jsonify({
        'success': True,
        'message': 'Appointment booked successfully!',
        'appointment': appointment
    })

# ==================== GENERAL ROUTES ====================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Gynai API is running',
        'model_loaded': model is not None,
        'doctors_loaded': len(doctors_data['doctors']) > 0
    }), 200

@app.route('/')
def home():
    return jsonify({
        'message': 'Gynai API Server - All Services Running',
        'version': '1.0.0',
        'endpoints': {
            'auth': ['/register', '/login', '/logout', '/profile'],
            'prediction': ['/predict', '/model-info'],
            'doctors': ['/api/doctors', '/api/doctors/nearby', '/api/specialties', '/api/book-appointment'],
            'health': ['/health']
        }
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5001))
    print("\n" + "="*60)
    print("🚀 Gynai API Server Starting...")
    print("="*60)
    print(f"✓ Server running on: http://0.0.0.0:{port}")
    print(f"✓ Local access: http://127.0.0.1:{port}")
    print("="*60)
    print("📋 Available Services:")
    print("   • Authentication (register, login, logout)")
    print("   • PCOS Prediction Model")
    print("   • Doctor Finder & Booking")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=port, use_reloader=False)