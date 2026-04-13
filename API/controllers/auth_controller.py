from flask import Blueprint, request, jsonify
from handlers.auth.login_handler import handle_login
from handlers.auth.logout_handler import handle_logout
from handlers.auth.register_handler import handle_register
from handlers.auth.refresh_handler import handle_refresh

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result = handle_login(data['email'], data['password'])
    return jsonify(result)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    result = handle_register(data['email'], data['password'])
    return jsonify(result)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    result = handle_logout(token)
    return jsonify(result)

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    result = handle_refresh(data['refresh_token'])
    return jsonify(result)
