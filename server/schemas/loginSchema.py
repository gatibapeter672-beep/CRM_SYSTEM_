# server/schemas/loginSchema.py

from app import ma
from models import User


class LoginSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance= True
    
    email = ma.Email(required=True)
    password = ma.Str(required=True, load_only=True)

    url = ma.Hyperlinks(
        {
            "self": ma.URLFor('login')
        }
    )


login_schema= LoginSchema()