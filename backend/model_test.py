import joblib
import numpy as np
import pandas as pd

# Load model
model = joblib.load('pcos_model (2).pkl')

print(f"Model type: {type(model).__name__}")
print(f"Expected features: {model.n_features_in_}")

# Encoding mappings (must match your training data encoding)
blood_group_map = {
    'A+': 1, 'A-': 2, 'B+': 3, 'B-': 4,
    'AB+': 5, 'AB-': 6, 'O+': 7, 'O-': 8
}

# Create test data with ENCODED values (all numeric)
test_data_dict = {
    'Sl. No': 1,
    'Patient File No.': 1234,
    ' Age (yrs)': 25.0,
    'Weight (Kg)': 65.0,
    'Height(Cm) ': 165.0,
    'BMI': 23.9,
    'Blood Group': 7,  # Encoded: O+ = 7
    'Pulse rate(bpm) ': 72.0,
    'RR (breaths/min)': 16.0,
    'Hb(g/dl)': 12.5,
    'Cycle(R/I)': 0,  # Encoded: R=0, I=1
    'Cycle length(days)': 28.0,
    'Marraige Status (Yrs)': 0.0,
    'Pregnant(Y/N)': 0,  # Encoded: N=0, Y=1
    'No. of aborptions': 0.0,
    ' I beta-HCG(mIU/mL)': 0.0,
    'II beta-HCG(mIU/mL)': 0.0,
    'FSH(mIU/mL)': 5.0,
    'LH(mIU/mL)': 4.0,
    'FSH/LH': 1.25,
    'Hip(inch)': 36.0,
    'Waist(inch)': 28.0,
    'Waist:Hip Ratio': 0.78,
    'TSH (mIU/L)': 2.5,
    'AMH(ng/mL)': 3.0,
    'PRL(ng/mL)': 15.0,
    'Vit D3 (ng/mL)': 30.0,
    'PRG(ng/mL)': 10.0,
    'RBS(mg/dl)': 95.0,
    'Weight gain(Y/N)': 0,  # Encoded: N=0, Y=1
    'hair growth(Y/N)': 0,
    'Skin darkening (Y/N)': 0,
    'Hair loss(Y/N)': 0,
    'Pimples(Y/N)': 0,
    'Fast food (Y/N)': 0,
    'Reg.Exercise(Y/N)': 1,  # Encoded: Y=1
    'BP _Systolic (mmHg)': 120.0,
    'BP _Diastolic (mmHg)': 80.0,
    'Follicle No. (L)': 10.0,
    'Follicle No. (R)': 10.0,
    'Avg. F size (L) (mm)': 5.0,
    'Avg. F size (R) (mm)': 5.0,
    'Endometrium (mm)': 8.0
}

# Create DataFrame
test_df = pd.DataFrame([test_data_dict])

# Ensure column order matches
test_df = test_df[model.feature_names_in_]

# Ensure all numeric
test_df = test_df.astype(float)

print(f"\nTest data shape: {test_df.shape}")
print(f"Test data dtypes: {test_df.dtypes.unique()}")
print(f"Columns match: {(test_df.columns == model.feature_names_in_).all()}")

# Make prediction
try:
    prediction = model.predict(test_df)
    print(f"\nPrediction: {prediction[0]}")
    print(f"Result: {'PCOS Risk' if prediction[0] == 1 else 'No PCOS Risk'}")
    
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(test_df)
        print(f"Probabilities: {probabilities[0]}")
        print(f"Confidence: {max(probabilities[0]):.2%}")
    
    print("\nTest successful!")
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()