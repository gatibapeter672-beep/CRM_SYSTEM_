from app import ma
from models import ResourceTag
from schemas.resourceSchema import ResourceSchema
from schemas.tagSchema import TagSchema

class ResourceTagSchema(ma.SQLAlchemySchema):
    class Meta:
        models = ResourceTag
        load_instance = True
    
    id = ma.auto_field(dump_only=True)
    resource_id = ma.Integer(required=True, load_only=True)
    tag_id = ma.Integer(required=True, load_only=True)
    resource = ma.Nested(ResourceSchema, dump_only=True)
    tag = ma.Nested(TagSchema, dump_only=True )


    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'resource_tag_by_id',
                values = dict(id='<id>'),
            ),
            "collection": ma.URLFor('resourcetags')
        }
    )

resource_tag_schema = ResourceTagSchema()
resource_tags_schema = ResourceTagSchema(many=True)