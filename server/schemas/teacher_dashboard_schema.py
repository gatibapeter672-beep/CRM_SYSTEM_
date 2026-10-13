from extensions import ma
from marshmallow import Schema, fields, validate,EXCLUDE

# --- RESPONSE SCHEMAS ---

class SubjectSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    code = fields.Str(dump_only=True)

class WorkspaceStatsSchema(Schema):
    totalUploads = fields.Int(dump_only=True)
    uniqueViews = fields.Int(dump_only=True)
    totalDownloads = fields.Int(dump_only=True)

class AssignedClassRouteSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    code = fields.Str(dump_only=True)
    subjects = fields.List(fields.Nested(SubjectSchema), dump_only=True) # FIXED: Changed from single string to nested list
    uploadsCount = fields.Int(dump_only=True)

class RecentEngagementSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(dump_only=True)
    type = fields.Str(dump_only=True)
    views = fields.Int(dump_only=True)
    downloads = fields.Int(dump_only=True)

class TeacherDashboardResponseSchema(Schema):
    stats = fields.Nested(WorkspaceStatsSchema, dump_only=True)
    assignedClasses = fields.List(fields.Nested(AssignedClassRouteSchema), dump_only=True)
    recentEngagement = fields.List(fields.Nested(RecentEngagementSchema), dump_only=True)


# --- REQUEST (PAYLOAD) SCHEMAS ---

class PublishResourceSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    title = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    description = fields.Str(required=False, allow_none=True) # FIXED: Added description
    class_id = fields.Int(required=True)
    subject_id = fields.Int(required=True)                      # FIXED: Added subject_id
    resource_type = fields.Str(
        required=True, 
        validate=validate.OneOf(['NOTE', 'REVISION_QUESTION', 'PAST_PAPER', 'ASSIGNMENT'])
    )
    file_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    file_path = fields.Str(required=True)
    file_size = fields.Int(required=True)
    file_type = fields.Str(required=True)


teacher_dashboard_schema = TeacherDashboardResponseSchema()
publish_resource_schema = PublishResourceSchema()