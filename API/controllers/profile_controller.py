from flask import Blueprint, request, jsonify
from handlers.profile.user_handler import handle_user

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/user', methods=['GET'])
def user():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    result = handle_user(token)
    if result.get("error"):
        return jsonify(result), 401
    return jsonify(result)
