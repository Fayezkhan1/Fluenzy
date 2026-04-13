from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def sign_up(email, password):
    response = supabase.auth.sign_up({"email": email, "password": password})
    return response

def sign_in(email, password):
    response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    return response

def sign_out(access_token):
    supabase.auth.sign_out()
    return {"message": "Logged out successfully"}

def refresh_session(refresh_token):
    response = supabase.auth.refresh_session(refresh_token)
    return response

def get_user(access_token):
    try:
        response = supabase.auth.get_user(access_token)
        return response
    except Exception as e:
        if "expired" in str(e).lower():
            return {"error": "token_expired"}
        return {"error": str(e)}
