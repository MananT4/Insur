import joblib

model = joblib.load('premium_model.joblib')

#age, sex(0=male, 1=female), bmi, children, smoker(1=no, 0=yes)
input_data = [[19, 1, 27.9, 0, 0]]
predicted_premium = model.predict(input_data)

print(f"Expenses: {predicted_premium[0]}")

print(f"Predicted premium: : {predicted_premium[0]*0.12 + 0}")