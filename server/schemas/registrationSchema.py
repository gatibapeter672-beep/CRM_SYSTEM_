# server/schemas/registrationSchema.py

from app import ma
from models import User
from marshmallow import fields, validates, ValidationError
import re
from schemas.roleSchema import RoleSchema

class RegistrationAuthSchema(ma.SQLAlchemySchema):
    class Meta:
        model =User
        load_instance =True
        include_fk=True
    
    
    id = ma.auto_field(dump_only=True)
    first_name = ma.auto_field()
    last_name  = ma.auto_field()
    email = ma.Email(required=True)
    password = ma.Str(required=True, load_only=True)
    is_active = ma.auto_field(dump_only=True)
    last_login = ma.auto_field(dump_only=True)
    created_at =  ma.auto_field(dump_only=True)
    role_id = ma.Integer(required=True, load_only=True)
    role = ma.Nested(RoleSchema, dump_only=True)

    @validates('password')
    def validate_password(self,value, **kwargs):
        if len(value)<8:
            raise ValidationError('password must be atleast 8 characters.')
        if not re.search(r"[A-Z]", value):
            raise ValidationError('password must contain at least one uppercase letter.')
        if not re.search(r"[0-9]", value):
            raise ValidationError('Password must contain at least one number.')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValidationError('Password must contain at least one special character.')
        
    
    url = ma.Hyperlinks(
        {
            "self": ma.URLFor('registration'),
        }
    )

registration_schema = RegistrationAuthSchema()
