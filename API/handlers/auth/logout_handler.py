from services.auth_service import sign_out

def handle_logout(access_token):
    response = sign_out(access_token)
    return response
