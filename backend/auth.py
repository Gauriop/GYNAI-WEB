from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
import bcrypt
import os
import re
from datetime import timedelta

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)


CORS(app, supports_credentials=True, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
], allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])


db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'CaptainA1918@'),
    'database': os.getenv('DB_NAME', 'user_system')  # <- default to gynai_db
}

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    print("Starting Flask server on http://127.0.0.1:5001")
    print("Make sure your database 'gynai_db' exists with proper tables!")
    app.run(debug=True, port=5001, host='0.0.0.0', use_reloader=False)
