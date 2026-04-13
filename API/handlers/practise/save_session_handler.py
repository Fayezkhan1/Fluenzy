import json
from services.gemini_service import analyze_grammar, analyze_grammar_detailed
from services.session_service import save_session

def handle_save_session(user_id, transcripts, duration_seconds, words_spoken):
    try:
        grammatical_errors = analyze_grammar(transcripts)
    except Exception as e:
        print(f"Gemini error: {e}")
        grammatical_errors = "GEMINI_ERROR"

    try:
        grammar_analysis = analyze_grammar_detailed(transcripts)
        grammar_analysis_json = json.dumps(grammar_analysis)
    except Exception as e:
        print(f"Gemini detailed error: {e}")
        grammar_analysis_json = None

    return save_session(user_id, transcripts, duration_seconds, words_spoken, grammatical_errors, grammar_analysis_json)
