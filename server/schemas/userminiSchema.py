from app import ma
from models import User

class UserMiniSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User


id = ma.auto_field()
first_name = ma.auto_field()
last_name = ma.auto_field()

