# server/services/auth_reg_service.py

from models import User, Role
from app import db
from schemas.registrationSchema import registration_schema
from marshmallow import ValidationError


def register_user_service(data):

    if not data:
        return {"error": "No input data provided"}, 400

    # validate
    try:
        validated_data = registration_schema.load(data)
    except ValidationError as e:
        return {"error": e.messages}, 400

    # check email
    if User.query.filter_by(email=validated_data.email).first():
        return {"error": "Email already registered"}, 400

    # check role
    role = db.session.get(Role, validated_data.role_id)
    if not role:
        return {"error": "Role not found"}, 404

    # create user
    new_user = User(
        first_name=validated_data.first_name,
        last_name=validated_data.last_name,
        email=validated_data.email.lower(),
        # password=validated_data.password,    password should not e read according models
        role_id=validated_data.role_id
        
    )
    # 🔐 SET password (DO NOT READ IT) 
    new_user.password = data["password"]

    db.session.add(new_user)
    db.session.commit()

    return {
        "message": "User registered successfully",
        "user": registration_schema.dump(new_user)
    }, 201
