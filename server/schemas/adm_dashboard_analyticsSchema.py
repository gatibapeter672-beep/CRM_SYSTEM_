# server/schemas/adm_dashboard_analyticsSchema.py
from app import ma

# --- Sub-schemas for Search Payload ---
class SearchResourceSchema(ma.Schema):
    class Meta:
        ordered = True
    resource_id = ma.Integer(dump_only=True)
    resource_title = ma.String(dump_only=True)

class SearchUserSchema(ma.Schema):
    class Meta:
        ordered = True
    user_id = ma.Integer(dump_only=True)
    user_name = ma.String(dump_only=True)
    user_email = ma.String(dump_only=True)

class SearchClassSchema(ma.Schema):
    class Meta:
        ordered = True
    class_id = ma.Integer(dump_only=True)
    class_classname = ma.String(dump_only=True)

class DashboardSearchSchema(ma.Schema):
    class Meta:
        ordered = True
    resources = ma.Nested(SearchResourceSchema, many=True, dump_only=True)
    users = ma.Nested(SearchUserSchema, many=True, dump_only=True)
    classes = ma.Nested(SearchClassSchema, many=True, dump_only=True)

# --- Analytics Schemas ---
class MaterialAnalyticsSchema(ma.Schema):
    class Meta:
        ordered = True
    resource_id = ma.Integer(dump_only=True)
    title = ma.String(dump_only=True)
    download_count = ma.Integer(dump_only=True)
    subject_name = ma.String(dump_only=True)
    class_name = ma.String(dump_only=True)

class CurriculumGapSchema(ma.Schema):
    class Meta:
        ordered = True
    class_id = ma.Integer(dump_only=True)
    class_name = ma.String(dump_only=True)
    subject_id = ma.Integer(dump_only=True)
    subject_name = ma.String(dump_only=True)
    gap_type = ma.String(dump_only=True)

class SecurityAuditSchema(ma.Schema):
    class Meta:
        ordered = True
    user_id = ma.Integer(attribute="id", dump_only=True) # Maps User.id to user_id
    username = ma.String(dump_only=True)
    email = ma.String(dump_only=True)
    is_active = ma.Boolean(dump_only=True)
    last_login = ma.DateTime(format="%Y-%m-%d %H:%M:%S", dump_only=True)

class SystemHealthSchema(ma.Schema):
    class Meta:
        ordered = True
    blocked_tokens = ma.Integer(dump_only=True)
    status = ma.String(dump_only=True)

class DashboardOverviewSchema(ma.Schema):
    class Meta:
        ordered = True
    teachers = ma.Integer(dump_only=True)
    students = ma.Integer(dump_only=True)
    system_health = ma.Nested(SystemHealthSchema, dump_only=True)

class TokenEventSchema(ma.Schema):
    class Meta:
        ordered = True
    user_id = ma.Integer(dump_only=True)
    jti = ma.String(dump_only=True)
    timestamp = ma.DateTime(attribute="created_at", format="%Y-%m-%d %H:%M:%S", dump_only=True)

class SecurityAuditResponseSchema(ma.Schema):
    class Meta:
        ordered = True
    inactive_users = ma.Nested(SecurityAuditSchema, many=True, dump_only=True)
    token_events = ma.Nested(TokenEventSchema, many=True, dump_only=True)

class TagCloudSchema(ma.Schema):
    class Meta:
        ordered = True
    tag_id = ma.Integer(dump_only=True)
    tag_name = ma.String(dump_only=True)
    usage_count = ma.Integer(dump_only=True)

# Initialize explicit singletons for clean service re-use
material_analytics_schema = MaterialAnalyticsSchema(many=True)
curriculum_gap_schema = CurriculumGapSchema(many=True)
dashboard_overview_schema = DashboardOverviewSchema()
security_audit_response_schema = SecurityAuditResponseSchema()
tag_cloud_schema = TagCloudSchema(many=True)
dashboard_Search_schema = DashboardSearchSchema() # Handled as a single structural object now