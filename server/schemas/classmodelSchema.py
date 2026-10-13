# server/schemas/classmodelSchema.py

from app import ma
from models import SchoolClass

from schemas.resourceSchema import ResourceSchema
from schemas.class_subjectSchema import ClassSubjectSchema

class ClassModelSchema(ma.SQLAlchemySchema):
    class Meta:
        model =SchoolClass
        load_instance = True
    
    id = ma.auto_field(dump_only=True)
    class_name = ma.auto_field()
    description = ma.auto_field()
    resources = ma.Nested("ResourceSchema", many=True, dump_only=True, only=("id",))
    class_subjects = ma.Nested("ClassSubjectSchema", many=True, dump_only=True, only=("id",))

    url = ma.Hyperlinks(
        {
            "self" : ma.URLFor(
                'classmodel_by_id',
                values = dict(id='<id>')
            ),
            "collection" : ma.URLFor('classmodels'),

        }
    )

classmodel_schema = ClassModelSchema()
classmodels_schema = ClassModelSchema(many=True)