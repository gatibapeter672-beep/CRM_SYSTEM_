# server/schemas/tagSchema.py

from app import ma
from models import Tag

from schemas.resource_tagSchema import ResourceTagSchema

class TagSchema(ma.SQLAlchemySchema):
    class Meta:
        models = Tag
        load_instance = True
    
    id = ma.auto_field(dump_only=True)
    tag_name = ma.auto_field()
    resource_tags = ma.Nested("ResourceTagSchema", many=True, dump_only=True, only=(id,))

    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'tag',
                values = dict(id='<id>'),
            ),
            "collection" : ma.URLFor('tags')
        }
    )

tag_schema = TagSchema()
tags_schema = TagSchema(many=True)