from services.auth_service import refresh_session

def handle_refresh(refresh_token):
    response = refresh_session(refresh_token)
    
    if response.session:
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
    
    return {"error": "Failed to refresh session"}
