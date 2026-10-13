# server/services/decoration.py

from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def role_required(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # ensure JWT is valid
            verify_jwt_in_request()

            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return {"message": "User not found"}, 404

            if not user.is_active:
                return {"message": "User account is inactive"}, 403

            user_role = user.role.role_name.lower()
            print(user_role)

            if user_role not in [role.lower() for role in allowed_roles]:
                return {"message": "Access Forbidden: insufficient permissions"}, 403

            return fn(*args, **kwargs)

        return decorator
    return wrapper