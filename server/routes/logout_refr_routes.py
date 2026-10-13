# server/routes/logout_refr.py

from flask_jwt_extended import (
    jwt_required,
    get_jwt,
    get_jwt_identity,
    create_access_token,
    set_access_cookies,
    unset_jwt_cookies,
)
from flask_restful import Resource
from models.token_blocklist import TokenBlocklist
from extensions import db
from app import api
from datetime import datetime, timezone
from flask import jsonify, make_response

class Logout(Resource):
    @jwt_required(verify_type=False) # Allows both access and refresh tokens to hit this endpoint
    def post(self):
        jwt_payload = get_jwt()
        jti = jwt_payload["jti"]
        token_type = jwt_payload["type"]
        
        # Convert JWT exp timestamp to a timezone-aware datetime object
        expires_at = datetime.fromtimestamp(jwt_payload["exp"], tz=timezone.utc)

        # Check if already blacklisted to avoid unique constraint crashes
        exists = TokenBlocklist.query.filter_by(jti=jti).first()
        if not exists:
            blocked_token = TokenBlocklist(
                jti=jti,
                token_type=token_type,
                expires_at=expires_at
            )
            db.session.add(blocked_token)
            db.session.commit()
        # 2. Use unset_jwt_cookies to completely wipe the cookies from the browser
        response_payload = {"message": f"{token_type.capitalize()} session cleared successfully"}
        response = make_response(jsonify(response_payload), 200)
        unset_jwt_cookies(response)
        
        return response



class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        # 1. Grab the user context from the secure refresh cookie validation
        user_id = get_jwt_identity()
        
        # 2. Spin up a new access token
        new_access_token = create_access_token(identity=str(user_id))

        # 3. Create the shipping box and drop the new access cookie in cleanly
        response_payload = {"status": "session_renewed"}
        response = make_response(jsonify(response_payload), 200)
        set_access_cookies(response, new_access_token)

        return response
    
api.add_resource(Logout, '/logout')

api.add_resource(Refresh, '/refresh')
