from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import api
from services.teacher_class_service import get_teacher_classes_service

class MyClassesResource(Resource):
    @jwt_required()
    def get(self):
        # Retrieve authenticated teacher's ID from JWT payload
        current_user_id = int(get_jwt_identity())
        return get_teacher_classes_service(current_user_id)

# Map endpoint URL for frontend React component consumption
api.add_resource(MyClassesResource, '/api/teacher/my-classes', endpoint='teacher_my_classes')