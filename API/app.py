import os
import warnings
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from controllers.auth_controller import auth_bp
from controllers.history_controller import history_bp
from controllers.profile_controller import profile_bp
from controllers.practise_controller import practise_bp

warnings.filterwarnings("ignore")
load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(history_bp, url_prefix='/api/history')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(practise_bp, url_prefix='/api/practise')

@app.route('/api/credits', methods=['GET'])
def get_credits():
    res = requests.get(
        'https://api.elevenlabs.io/v1/user/subscription',
        headers={'xi-api-key': os.getenv('ELEVENLABS_API_KEY')}
    )
    data = res.json()
    return jsonify({'remaining': data['character_limit'] - data['character_count']})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
