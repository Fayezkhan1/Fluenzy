from services.auth_service import sign_in

def handle_login(email, password):
    response = sign_in(email, password)
    
    if response.user:
        return {
            "user": {"id": response.user.id, "email": response.user.email},
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }
    
    return {"error": "Invalid credentials"}
