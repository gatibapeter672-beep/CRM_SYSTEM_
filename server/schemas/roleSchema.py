# server/schemas/roleSchema.py
from app import api, ma
from models import Role
from schemas.userminiSchema import UserMiniSchema

class RoleSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Role
        load_instance = True

    id = ma.auto_field(dump_only=True)
    role_name = ma.auto_field()
    description = ma.auto_field()
    created_at = ma.auto_field(dump_only=True)
    users = ma.Nested("UserMiniSchema", many=True, dump_only=True)
    # users = ma.auto_field(dump_only=True)

    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'role_by_id',
                values = dict(id='<id>')
            ),
            "collection": ma.URLFor('roles'),
        }
    )
role_schema = RoleSchema()
roles_schema = RoleSchema(many=True)