from flask import Flask, request, jsonify
import joblib
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

api_key = ""

URL = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=USD&tsyms=BTC,ETH&api_key="+api_key

api_response = requests.get(URL)
if api_response.status_code != 200:
    print("Failed to fetch data from external API")

premiumETH = api_response.json()['USD']['ETH']

model = joblib.load('premium_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        user_data = request.get_json().get('user_data', None)
        age = int(user_data.get('age'))
        sex = int(user_data.get('sex'))
        children = int(user_data.get('children'))
        bmi = float(user_data.get('bmi'))
        smoker = int(user_data.get('smoker'))

        input_data = [[age,sex,bmi,children,smoker]]
        expenses = model.predict(input_data)

        profit_margin = 0.12 #12% profit margin

        predicted_premium = expenses[0]*profit_margin
        return jsonify({'predicted_premium': premiumETH*predicted_premium}), 200

    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 400
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=10000)