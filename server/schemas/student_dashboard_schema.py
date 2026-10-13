from extensions import ma
from marshmallow import Schema, fields

# Lightweight sub-schemas to output only what the UI renders
class DashboardSubjectSchema(Schema):
    id = fields.Int(dump_only=True)
    subject_name = fields.Str(dump_only=True, attribute="subject_name")
    subject_code = fields.Str(dump_only=True, attribute="subject_code")
    file_count = fields.Int(dump_only=True)


class DashboardResourceSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(dump_only=True)
    resource_type = fields.Str(dump_only=True)
    author_name = fields.Str(dump_only=True)
    time_ago = fields.Str(dump_only=True)


class DashboardActivitySchema(Schema):
    id = fields.Str(dump_only=True)
    title = fields.Str(dump_only=True)
    action = fields.Str(dump_only=True)  # "Opened and read" or "Downloaded"
    timestamp = fields.Str(dump_only=True)
    activity_type = fields.Str(dump_only=True)  # "VIEW" or "DOWNLOAD"


# Unified Schema returning the complete composite dashboard payload in one round-trip
class StudentDashboardResponseSchema(Schema):
    student_context = fields.Dict()
    subject_binder = fields.List(fields.Nested(DashboardSubjectSchema))
    fresh_drops = fields.List(fields.Nested(DashboardResourceSchema))
    user_activity_logs = fields.List(fields.Nested(DashboardActivitySchema))


student_dashboard_schema = StudentDashboardResponseSchema()

