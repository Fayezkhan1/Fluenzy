from services.auth_service import sign_up

def handle_register(email, password):
    response = sign_up(email, password)
    
    if response.user:
        return {
            "user": {"id": response.user.id, "email": response.user.email},
            "message": "Registration successful"
        }
    
    return {"error": "Registration failed"}
