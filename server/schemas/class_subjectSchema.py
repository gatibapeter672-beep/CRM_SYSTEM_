# server/schemas/class_subjectSchema.py

from app import ma
from models import ClassSubject


from schemas.subjectSchema import SubjectSchema
from schemas.classmodelSchema import ClassModelSchema

class ClassSubjectSchema(ma.SQLAlchemySchema):
    class Meta:
        models = ClassSubject
        load_instance = True

    
    id = ma.auto_field(dump_only=True)
    class_id = ma.Integer(required=True,load_only=True)
    subject_id = ma.Integer(required=True, load_only=True)
    school_class = ma.Nested("ClassModelSchema", dump_only=True, only=('class_name',))
    subject = ma.Nested("SubjectSchema", dump_only=True, only=("id", "subject_name"))

    url = ma.Hyperlinks(
        {
            "self" :  ma.URLFor(
                'class_subject_by_id',
                values = dict(id ='<id>'),
            ),
            "collection": ma.URLFor('class_subjects'),
        }
    )

class_subjectSchema = ClassSubjectSchema()
class_subjectsSchema = ClassSubjectSchema(many=True)