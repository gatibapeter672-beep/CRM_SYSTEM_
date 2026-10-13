# server/schemas/student_curriculum_schema.py

from extensions import ma
from marshmallow import Schema, fields

class PortalUploaderSchema(Schema):
    first_name = fields.Str(dump_only=True)
    last_name = fields.Str(dump_only=True)

class PortalResourceSchema(Schema):
    id = fields.Int(dump_only=True)
    file_name = fields.Str(dump_only=True)
    file_path = fields.Str(dump_only=True)
    file_size = fields.Int(dump_only=True)
    resource_type = fields.Str(dump_only=True)
    uploader = fields.Nested(PortalUploaderSchema, dump_only=True)

class CurriculumSubjectSchema(Schema):
    id = fields.Int(dump_only=True)
    subject_name = fields.Str(dump_only=True)
    subject_code = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True)
    metrics = fields.Dict(keys=fields.Str(), values=fields.Int(), dump_only=True)
    resources = fields.List(fields.Nested(PortalResourceSchema), dump_only=True)

class ActionTrackingSchema(Schema):
    resource_id = fields.Int(required=True)

class StudentCurriculumResponseSchema(Schema):
    student_context = fields.Dict(dump_only=True)
    subject_binder = fields.List(fields.Nested(CurriculumSubjectSchema), dump_only=True)

student_curriculum_schema = StudentCurriculumResponseSchema()
action_tracking_schema = ActionTrackingSchema()