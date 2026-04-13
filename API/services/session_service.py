from datetime import datetime, timedelta
from config import SUPABASE_URL, SUPABASE_KEY
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_next_session_id(user_id):
    response = supabase.table('sessions').select('session_id').eq('user_id', user_id).order('session_id', desc=True).limit(1).execute()
    if response.data:
        return response.data[0]['session_id'] + 1
    return 1

def save_session(user_id, transcripts, duration_seconds=0, words_spoken=0, grammatical_errors='', grammar_analysis_json=None):
    session_id = get_next_session_id(user_id)
    row = {
        'user_id': user_id,
        'session_id': session_id,
        'transcripts': transcripts,
        'duration_seconds': duration_seconds,
        'words_spoken': words_spoken,
        'grammatical_errors': grammatical_errors,
    }
    if grammar_analysis_json is not None:
        row['grammar_analysis'] = grammar_analysis_json
    response = supabase.table('sessions').insert(row).execute()
    return response.data[0] if response.data else None

def get_user_sessions(user_id):
    response = supabase.table('sessions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return response.data

def delete_session(user_id, session_id):
    response = supabase.table('sessions').delete().eq('user_id', user_id).eq('session_id', session_id).execute()
    return len(response.data) > 0 if response.data else False

def get_user_stats(user_id):
    sessions = get_user_sessions(user_id)
    total_sessions = len(sessions)
    total_practice_time = sum(s.get('duration_seconds', 0) for s in sessions)

    if not sessions:
        return {'total_sessions': 0, 'streak': 0, 'total_practice_time': 0, 'daily_data': [], 'calendar_data': []}

    session_dates = set()
    for s in sessions:
        dt = datetime.fromisoformat(s['created_at'].replace('Z', '+00:00'))
        session_dates.add(dt.date())

    streak = 0
    today = datetime.utcnow().date()
    check_date = today
    while check_date in session_dates:
        streak += 1
        check_date -= timedelta(days=1)

    daily_map = {}
    for s in sessions:
        dt = datetime.fromisoformat(s['created_at'].replace('Z', '+00:00'))
        d = dt.date()
        if d not in daily_map:
            daily_map[d] = {'minutes': 0}
        daily_map[d]['minutes'] += round(s.get('duration_seconds', 0) / 60, 1)

    daily_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        daily_data.append({
            'date': d.strftime('%b %d'),
            'minutes': daily_map.get(d, {}).get('minutes', 0)
        })

    first_day = today.replace(day=1)
    last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    calendar_data = []
    d = first_day
    while d <= last_day:
        calendar_data.append({'date': d.strftime('%Y-%m-%d'), 'active': d in session_dates})
        d += timedelta(days=1)

    return {
        'total_sessions': total_sessions,
        'streak': streak,
        'total_practice_time': total_practice_time,
        'daily_data': daily_data,
        'calendar_data': calendar_data
    }
