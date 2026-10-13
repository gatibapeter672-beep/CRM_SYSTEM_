# server/routes/class_subject_routes.py
from flask import request
from flask_restful import Resource
from app import api
from services.decorators import role_required
from services.class_subject_service import (
    class_subject_getall_service,
    class_subject_post_service,
    class_subject_delete_service
)

class ClassSubjects(Resource):
    def get(self):
        return class_subject_getall_service()

    @role_required('admin')
    def post(self):
        data = request.get_json(silent=True)
        return class_subject_post_service(data)

class ClassSubjectById(Resource):
    @role_required('admin')
    def delete(self, id):
        return class_subject_delete_service(id)

# API Route bindings mapping neatly onto the hypermedia requirements
api.add_resource(ClassSubjects, '/class-subjects', endpoint='class_subjects')
api.add_resource(ClassSubjectById, '/class-subjects/<int:id>', endpoint='class_subject_by_id')
api.add_resource(ClassSubjects, '/dashboard/class-subject/link', endpoint='class_subject_by_id')