from app import ma
from models import ResourceView

from schemas.userminiSchema import UserMiniSchema
from schemas.resourceSchema import ResourceSchema

class ResourceViewSchema(ma.SQLAlchemySchema):
    class Meta:
        models = ResourceView
        load_instance = True

    id = ma.auto_field(dump_only=True)
    user_id = ma.Integer(required=True, load_only=True)
    resource_id = ma.Integer(required=True, load_only=True)
    viewed_at = ma.auto_field(dump_only=True)
    user = ma.Nested(UserMiniSchema, dump_only=True)
    resource = ma.Nested(ResourceSchema, dump_only=True)

    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
            'resourceview_by_id',
            values = dict(id='<id>'),
            ),
            "collection" : ma.URLFor('resourceviews')
        }

    )

Resource_viewSchema = ResourceViewSchema()
Resource_viewsSchema = ResourceViewSchema(many=True)
