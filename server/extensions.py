# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()



@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    from models.token_blocklist import TokenBlocklist

    jti = jwt_payload["jti"]
    token = TokenBlocklist.query.filter_by(jti=jti).first()

    return token is not None