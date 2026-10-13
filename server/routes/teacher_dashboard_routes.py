from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.decorators import role_required
from schemas.teacher_dashboard_schema import teacher_dashboard_schema, publish_resource_schema
from services.teacher_dashboard_service import get_teacher_dashboard_metadata, create_new_class_resource
from marshmallow import ValidationError
from app import api

class TeacherWorkspaceMetadata(Resource):
    @jwt_required()
    @role_required("teacher")
    def get(self):
        """
        GET /portal/teacher/workspace
        Compiles structural statistics, classes matrix mappings, and transaction counters.
        """
        teacher_id = get_jwt_identity()
        payload, status_code = get_teacher_dashboard_metadata(teacher_id)
        
        if status_code != 200:
            return payload, status_code
            
        return teacher_dashboard_schema.dump(payload), 200



class FacultyPublishResource(Resource):
    @jwt_required()
    @role_required("teacher")
    def post(self):
        """
        POST /portal/teacher/resources/publish
        Handles multipart/form-data payload with file and text fields.
        """
        # Read form metadata and uploaded file
        form_data = request.form.to_dict()
        file_obj = request.files.get("file")

        if not file_obj:
            return {"error": "Missing uploaded file in request payload context."}, 400

        teacher_id = get_jwt_identity()
        return create_new_class_resource(teacher_id, form_data, file_obj)


# class FacultyPublishResource(Resource):
#     @jwt_required()
#     @role_required("teacher")
#     def post(self):
#         """
#         POST /portal/teacher/resources/publish
#         Validates structure payload from the workspace form, executing database writes.
#         """
#         data = request.get_json(silent=True)
#         if data is None:
#             return {"error": "Missing or unreadable transaction body payload content context."}, 400

#         try:
#             validated_payload = publish_resource_schema.load(data)
#         except ValidationError as e:
#             print("VALIDATION ERROR LOG:", e.messages)
#             return {"error": e.messages}, 400

#         teacher_id = get_jwt_identity()
#         print(teacher_id)
#         print(validated_payload)
#         return create_new_class_resource(teacher_id, validated_payload)
    

# Map paths directly onto the RESTful router instance
api.add_resource(TeacherWorkspaceMetadata, "/portal/teacher/workspace")
api.add_resource(FacultyPublishResource, "/portal/teacher/resources/publish")

