from flask_restful import Resource as FlaskResource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import api
from services.resource_service import (
    get_user_uploads_service,
    update_resource_status_service,
    delete_resource_service
)

class MyUploadsResource(FlaskResource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        print(current_user_id)
        return get_user_uploads_service(current_user_id)

class ResourceDetailOperations(FlaskResource):
    @jwt_required()
    def patch(self, id):
        current_user_id = get_jwt_identity()
        return update_resource_status_service(id, current_user_id)

    @jwt_required()
    def delete(self, id):
        current_user_id = get_jwt_identity()
        return delete_resource_service(id, current_user_id)

# API Resource Endpoints
api.add_resource(MyUploadsResource, '/api/my-uploads', endpoint='my_uploads')
api.add_resource(ResourceDetailOperations, '/api/resources/<int:id>', endpoint='resource_detail_ops')