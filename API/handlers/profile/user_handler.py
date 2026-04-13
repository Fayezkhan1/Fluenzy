from services.auth_service import get_user

def handle_user(access_token):
    response = get_user(access_token)
    
    if isinstance(response, dict) and response.get("error"):
        return response
    
    if hasattr(response, 'user') and response.user:
        return {
            "user": {"id": response.user.id, "email": response.user.email}
        }
    return {"error": "Invalid or expired token"}
