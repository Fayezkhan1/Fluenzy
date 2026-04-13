import json
from flask import Blueprint, request, jsonify
from services.auth_service import get_user
from services.gemini_service import analyze_grammar_detailed
from handlers.practise.save_session_handler import handle_save_session

practise_bp = Blueprint('practise', __name__)

def get_user_id_from_token(req):
    token = req.headers.get('Authorization', '').replace('Bearer ', '')
    response = get_user(token)
    if hasattr(response, 'user') and response.user:
        return response.user.id
    return None

@practise_bp.route('/session', methods=['POST'])
def create_session():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    result = handle_save_session(
        user_id,
        data['transcripts'],
        data.get('duration_seconds', 0),
        data.get('words_spoken', 0)
    )
    if result:
        grammar_analysis = None
        if result.get('grammar_analysis'):
            try:
                grammar_analysis = json.loads(result['grammar_analysis'])
            except Exception:
                grammar_analysis = None
        return jsonify({'session_id': result['session_id'], 'grammar_analysis': grammar_analysis})
    return jsonify({'error': 'Failed to save session'}), 500

@practise_bp.route('/analyze', methods=['POST'])
def analyze():
    user_id = get_user_id_from_token(request)
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    try:
        analysis = analyze_grammar_detailed(data['transcripts'])
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
