# server/services/auth_service.py

from models import User
from app import db
from schemas.loginSchema import login_schema
from marshmallow import ValidationError
from schemas.registrationSchema import registration_schema


from datetime import datetime, timezone, timedelta
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies
)

from flask import make_response, jsonify


def login_user_service(data):
    if not data:
        return {"message": "no input data provided"}, 400

    try:
        validated_data = login_schema.load(data)
    except ValidationError as e:
        return {"errors": e.messages}, 400

    email = validated_data.email.lower()
    raw_password = data["password"]

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(raw_password) or not user.is_active:
        return {"message": "invalid credentials"}, 401

    user.last_login = datetime.now(timezone.utc)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    # access_token=create_access_token(identity=user.id)
    # refresh_token=create_refresh_token(identity=user.id)
    refresh_token = create_refresh_token(identity=str(user.id))
    
    
    response_payload = {
        "message": "Login successfull",
        "user": registration_schema.dump(user)
    }
    resp_json = jsonify(response_payload)

    response = make_response(
        resp_json,
        200
    )
    # 🚀🚀🚀 THIS IS WHAT YOU WERE MISSING
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)


    return response

