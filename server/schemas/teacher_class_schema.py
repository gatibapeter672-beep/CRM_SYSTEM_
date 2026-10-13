from app import ma
from marshmallow import fields

class StudentEngagementSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    documents_read = fields.Int(dump_only=True)
    last_active = fields.Str(dump_only=True)

class TeacherClassCohortSchema(ma.Schema):
    id = fields.Int(dump_only=True)  # class_id
    class_name = fields.Str(dump_only=True)
    subject_name = fields.Str(dump_only=True)
    course_code = fields.Str(dump_only=True)
    total_uploads = fields.Int(dump_only=True)
    library_health = fields.Str(dump_only=True)
    students = fields.List(fields.Nested(StudentEngagementSchema), dump_only=True)

teacher_class_cohort_schema = TeacherClassCohortSchema()
teacher_class_cohorts_schema = TeacherClassCohortSchema(many=True)