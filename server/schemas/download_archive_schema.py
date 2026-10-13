from extensions import ma
from marshmallow import Schema, fields

class ArchiveSubjectSchema(Schema):
    id = fields.Int(dump_only=True)
    subject_name = fields.Str(dump_only=True)

class ArchiveResourceSchema(Schema):
    id = fields.Int(dump_only=True)
    file_name = fields.Str(dump_only=True)
    file_path = fields.Str(dump_only=True)
    file_size = fields.Int(dump_only=True)
    resource_type = fields.Str(dump_only=True)
    subject = fields.Nested(ArchiveSubjectSchema, dump_only=True)

class DownloadLogSchema(Schema):
    id = fields.Int(dump_only=True)
    downloaded_at = fields.DateTime(dump_only=True)
    time_ago = fields.Method("calculate_time_ago", dump_only=True)
    resource = fields.Nested(ArchiveResourceSchema, dump_only=True)

    def calculate_time_ago(self, obj):
        # Optional: Add utility function text formatting here (e.g., "2 days ago")
        # Returning None defaults the frontend to using the native downloaded_at string locale conversion block safely
        return None

download_archive_list_schema = DownloadLogSchema(many=True)