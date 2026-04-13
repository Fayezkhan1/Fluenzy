from flask import Blueprint, request, jsonify
from services.auth_service import get_user
from services.session_service import get_user_sessions, get_user_stats, delete_session

history_bp = Blueprint('history', __name__)

def get_user_id_from_token(req):
    token = req.headers.get('Authorization', '').replace('Bearer ', '')
    response = get_user(token)
    if hasattr(response, 'user') and response.user:
        return response.user.id
    return None

@history_bp.route('/sessions', methods=['GET'])
def get_sessions():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    sessions = get_user_sessions(user_id)
    return jsonify({'sessions': sessions})

@history_bp.route('/stats', methods=['GET'])
def get_stats():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    stats = get_user_stats(user_id)
    return jsonify(stats)

@history_bp.route('/session/<int:session_id>', methods=['DELETE'])
def remove_session(session_id):
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    success = delete_session(user_id, session_id)
    if success:
        return jsonify({'success': True})
    return jsonify({'error': 'Session not found'}), 404
