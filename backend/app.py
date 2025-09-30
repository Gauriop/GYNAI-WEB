from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load model
try:
    model = joblib.load('pcos_model (2).pkl')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def encode_categorical(value, feature_name):
    """Encode categorical features to numeric"""
    
    # Blood Group encoding
    blood_group_map = {
        'A+': 1, 'A-': 2, 'B+': 3, 'B-': 4,
        'AB+': 5, 'AB-': 6, 'O+': 7, 'O-': 8,
        '': 0, None: 0
    }
    
    # Cycle encoding
    cycle_map = {'R': 0, 'I': 1, '': 0, None: 0}
    
    # Y/N encoding
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
    """Preprocess input data to match model expectations"""
    
    # Create feature dictionary with all 43 features
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
        'FSH/LH': 0,  # Will calculate
        'Hip(inch)': float(data.get('hip', 36)),
        'Waist(inch)': float(data.get('waist', 28)),
        'Waist:Hip Ratio': 0,  # Will calculate
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
    encoded_features = {}
    for key, value in features.items():
        encoded_features[key] = encode_categorical(value, key)
    
    # Create DataFrame
    df = pd.DataFrame([encoded_features])
    
    # Ensure correct column order
    df = df[model.feature_names_in_]
    
    # Convert all to float
    df = df.astype(float)
    
    return df

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.get_json()
        
        # Preprocess input
        input_df = preprocess_input(data)
        
        print(f"Input shape: {input_df.shape}")
        print(f"Input dtypes: {input_df.dtypes.unique()}")
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        # Get confidence
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_type': type(model).__name__,
        'expected_features': int(model.n_features_in_),
        'feature_names': model.feature_names_in_.tolist()
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("PCOS Prediction Server Starting...")
    print("="*50)
    print("Server: http://127.0.0.1:5000")
    print("="*50 + "\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)