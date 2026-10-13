from extensions import ma
from marshmallow import Schema, fields, validate

# --- NESTED ENTITY SCHEMAS ---

class SubjectItemSchema(Schema):
    id = fields.Int(dump_only=True)
    subject_name = fields.Str(dump_only=True)
    subject_code = fields.Str(dump_only=True)

class UserItemSchema(Schema):
    id = fields.Int(dump_only=True)
    first_name = fields.Str(dump_only=True)
    last_name = fields.Str(dump_only=True)
    email = fields.Str(dump_only=True)

class ResourceSummarySchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(dump_only=True)
    resource_type = fields.Str(dump_only=True)

# --- BRIDGE RELATIONSHIP SCHEMAS ---

class ClassSubjectBridgeSchema(Schema):
    id = fields.Int(dump_only=True)
    subject_id = fields.Int(dump_only=True)
    subject = fields.Nested(SubjectItemSchema, dump_only=True)

class TeacherClassBridgeSchema(Schema):
    id = fields.Int(dump_only=True)
    teacher_id = fields.Int(dump_only=True)
    teacher = fields.Nested(UserItemSchema, dump_only=True)

class StudentClassBridgeSchema(Schema):
    id = fields.Int(dump_only=True)
    student_id = fields.Int(dump_only=True)
    student = fields.Nested(UserItemSchema, dump_only=True)

# --- CLASS DECK MAIN RESPONSE SCHEMA ---

class ClassDeckDetailSchema(Schema):
    id = fields.Int(dump_only=True)
    class_name = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True)
    class_subjects = fields.List(fields.Nested(ClassSubjectBridgeSchema), dump_only=True)
    teacher_classes = fields.List(fields.Nested(TeacherClassBridgeSchema), dump_only=True)
    student_classes = fields.List(fields.Nested(StudentClassBridgeSchema), dump_only=True)
    resources = fields.List(fields.Nested(ResourceSummarySchema), dump_only=True)


# --- REQUEST MUTATION SCHEMAS ---

class CreateClassSchema(Schema):
    class_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(required=False, allow_none=True)

class BindEntitySchema(Schema):
    entity_id = fields.Int(required=True)  # Can be subject_id, teacher_id, or student_id depending on route


class GlobalPoolsSchema(Schema):
    subjects = fields.List(fields.Nested(SubjectItemSchema), dump_only=True)
    teachers = fields.List(fields.Nested(UserItemSchema), dump_only=True)
    students = fields.List(fields.Nested(UserItemSchema), dump_only=True)


# Schema Instances
class_deck_schema = ClassDeckDetailSchema(many=True)
single_class_schema = ClassDeckDetailSchema()
create_class_schema = CreateClassSchema()
bind_entity_schema = BindEntitySchema()
global_pools_schema = GlobalPoolsSchema()