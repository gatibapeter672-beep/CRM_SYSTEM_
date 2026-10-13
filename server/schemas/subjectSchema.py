# server/schemas/
from app import ma
from models import Subject


from schemas.resourceSchema import ResourceSchema
from schemas.class_subjectSchema import ClassSubjectSchema

class SubjectSchema(ma.SQLAlchemySchema):
    class Meta:
        models = Subject
        load_instance = True
    

    id = ma.auto_field(dump_only=True)
    subject_name = ma.auto_field()
    subject_code = ma.auto_field()
    description = ma.auto_field()
    resources = ma.Nested('ResourceSchema', dump_only=True, many=True, only=(id,))
    class_subjects = ma.Nested('ClassSubjectSchema', dump_only=True, many=True ,only=(id,))

    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'subject',
                values = dict(id='<id>'),
            ),
            "collection" : ma.URLFor('subjects'),
        }
    )

subject_schema = SubjectSchema()
subjects_schema = SubjectSchema(many=True)