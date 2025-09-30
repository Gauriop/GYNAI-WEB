import joblib

with open('pcos_model (2).pkl', 'rb') as f:
    model = joblib.load(f)

# Check expected features
if hasattr(model, 'feature_names_in_'):
    print("Expected features:", model.feature_names_in_)
    print("Number of features:", len(model.feature_names_in_))
else:
    print("Model doesn't store feature names")
    print("You need to check your training code")