from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.decorators import role_required
from schemas.student_curriculum_schema import student_curriculum_schema, action_tracking_schema
from services.student_curriculum_service import get_student_curriculum_data, track_resource_action
from marshmallow import ValidationError
from app import api

class StudentCurriculumPortal(Resource):
    @jwt_required()
    @role_required("student")
    def get(self):
        student_user_id = get_jwt_identity()
        payload, status_code = get_student_curriculum_data(student_user_id)
        
        if status_code != 200:
            return payload, status_code
            
        return student_curriculum_schema.dump(payload), 200

class TrackResourceViewAction(Resource):
    @jwt_required()
    @role_required("student")
    def post(self):
        # Front-End Validation Guardrail: Ensure missing bodies/fields are thrown back instantly
        data = request.get_json(silent=True)
        if data is None:
            return {"error": "Missing or malformed JSON payload context."}, 400
            
        try:
            validated_data = action_tracking_schema.load(data)
        except ValidationError as e:
            return {"error": e.messages}, 400

        student_user_id = get_jwt_identity()
        return track_resource_action(
            student_user_id=student_user_id, 
            resource_id=validated_data.get("resource_id"), 
            action_type="VIEW"
        )

class TrackResourceDownloadAction(Resource):
    @jwt_required()
    @role_required("student")
    def post(self):
        data = request.get_json(silent=True)
        if data is None:
            return {"error": "Missing or malformed JSON payload context."}, 400
            
        try:
            validated_data = action_tracking_schema.load(data)
        except ValidationError as e:
            return {"error": e.messages}, 400

        student_user_id = get_jwt_identity()
        return track_resource_action(
            student_user_id=student_user_id, 
            resource_id=validated_data.get("resource_id"), 
            action_type="DOWNLOAD"
        )

# Mapping endpoints
api.add_resource(StudentCurriculumPortal, "/portal/student/curriculum")
api.add_resource(TrackResourceViewAction, "/portal/resources/track-view")
api.add_resource(TrackResourceDownloadAction, "/portal/resources/track-download")