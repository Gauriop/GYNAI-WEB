from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)
CORS(app)

# Configure your Google Maps API Key here
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', 'YOUR_API_KEY_HERE')

# Load doctors data
def load_doctors_data():
    try:
        with open('database.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"doctors": [], "specialties": [], "availabilityOptions": []}

doctors_data = load_doctors_data()

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return round(distance, 2)

@app.route('/api/config', methods=['GET'])
def get_config():
    """Return API configuration including Google Maps API key"""
    return jsonify({
        'googleMapsApiKey': GOOGLE_MAPS_API_KEY
    })

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    """Get all doctors with optional filtering"""
    specialty = request.args.get('specialty')
    availability = request.args.get('availability')
    search = request.args.get('search', '').lower()
    
    doctors = doctors_data['doctors']
    
    # Filter by search term
    if search:
        doctors = [d for d in doctors if 
                   search in d['name'].lower() or 
                   search in d['specialty'].lower() or 
                   search in d['clinic'].lower()]
    
    # Filter by specialty
    if specialty and specialty != 'all':
        doctors = [d for d in doctors if d['specialty'] == specialty]
    
    # Filter by availability
    if availability and availability != 'all':
        if availability == 'Available Now':
            doctors = [d for d in doctors if d['availability'] == 'available']
        elif availability in ['Available Today', 'Available Tomorrow', 'Available This Week']:
            doctors = [d for d in doctors if d['availability'] != 'offline']
    
    return jsonify(doctors)

@app.route('/api/doctors/nearby', methods=['POST'])
def get_nearby_doctors():
    """Get doctors near a specific location"""
    data = request.json
    user_lat = data.get('latitude')
    user_lon = data.get('longitude')
    max_distance = data.get('maxDistance', 10)  # Default 10 km radius
    
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
    
    # Sort by distance
    nearby_doctors.sort(key=lambda x: x['distance'])
    
    return jsonify(nearby_doctors)

@app.route('/api/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get specific doctor details"""
    doctor = next((d for d in doctors_data['doctors'] if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    return jsonify(doctor)

@app.route('/api/doctor/<int:doctor_id>/directions', methods=['POST'])
def get_directions(doctor_id):
    """Get directions from user location to doctor"""
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
    """Get all available specialties"""
    return jsonify(doctors_data['specialties'])

@app.route('/api/availability-options', methods=['GET'])
def get_availability_options():
    """Get all availability options"""
    return jsonify(doctors_data['availabilityOptions'])

@app.route('/api/book-appointment', methods=['POST'])
def book_appointment():
    """Book an appointment with a doctor"""
    data = request.json
    doctor_id = data.get('doctorId')
    patient_name = data.get('patientName')
    patient_email = data.get('patientEmail')
    patient_phone = data.get('patientPhone')
    appointment_date = data.get('appointmentDate')
    appointment_time = data.get('appointmentTime')
    
    # Validate required fields
    if not all([doctor_id, patient_name, patient_email, patient_phone, appointment_date, appointment_time]):
        return jsonify({'error': 'All fields are required'}), 400
    
    # Find doctor
    doctor = next((d for d in doctors_data['doctors'] if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    # In a real application, save this to a database
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

# Serve static files (HTML, CSS, JS)
@app.route('/')
def serve_index():
    return send_from_directory('.', 'doc.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)