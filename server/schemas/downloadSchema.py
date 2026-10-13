# server/schemas/downloadSchema.py

from app import ma
from models import Download

from schemas.userminiSchema import UserMiniSchema
from schemas.resourceSchema import ResourceSchema

class DownloadSchema(ma.SQLAlchemySchema):
    class Meta:
        models = Download
        load_instance = True

    id = ma.auto_field(dump_only=True)
    user_id = ma.Integer(required=True, load_only=True)
    resource_id = ma.Integer(required=True, load_only=True)
    downloaded_at = ma.auto_field(dump_only=True)
    user = ma.Nested(UserMiniSchema, dump_only=True)
    resource = ma.Nested(ResourceSchema, dump_only=True)
    
    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'download_by_id',
                values = dict(id='<id>'),
            ),
            "collection" : ma.URLFor('downloads'),
        }
    )


download_schema = DownloadSchema()
downloads_schema = DownloadSchema(many=True)