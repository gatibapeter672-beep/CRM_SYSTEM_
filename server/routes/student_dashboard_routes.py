from flask import request, make_response
from flask_restful import Resource
from schemas.student_dashboard_schema import student_dashboard_schema
from services.student_dashboard_service import get_student_dashboard_data
from services.decorators import role_required
from flask_jwt_extended import get_jwt_identity
from app import api

class StudentDashboard(Resource):
    @role_required("student")
    def get(self):
        print(get_jwt_identity())
        student_user_id = get_jwt_identity()
        return get_student_dashboard_data(student_user_id)
    
api.add_resource(StudentDashboard, "/dashboard/student")