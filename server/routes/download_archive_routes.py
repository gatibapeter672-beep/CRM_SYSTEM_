from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.decorators import role_required
from schemas.download_archive_schema import download_archive_list_schema
from services.download_archive_service import get_student_download_history
from app import api

class StudentDownloadArchivePortal(Resource):
    @jwt_required()
    @role_required("student")
    def get(self):
        """
        GET /portal/student/downloads-archive
        Returns full array payload structured explicitly to match front-end table loops.
        """
        student_user_id = get_jwt_identity()
        logs, status_code = get_student_download_history(student_user_id)
        
        if status_code != 200:
            return logs, status_code
            
        # Execute serialization strictly at the route border layout boundary
        return download_archive_list_schema.dump(logs), 200

# Mapping endpoints
api.add_resource(StudentDownloadArchivePortal, "/portal/student/downloads-archive")