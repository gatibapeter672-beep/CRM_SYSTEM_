# server/routes/roles_routes.py

from flask_restful import Resource
from flask import request, make_response
from app import api

from services.role_service import(
    role_getall_service,
    role_getbyid_service,
    role_patchbyid_service,
    role_deletebyid_service,
    role_post
)
from services.decorators import role_required
# 


class IndexRole(Resource):
    def get(self):
        response_dict = {
            "Index": "Welcome to the role RESTful API",
        }

        response = make_response(
            response_dict,
            200
        )

        return response

api.add_resource(IndexRole, '/rls')

class Roles(Resource):
    def get(self):
        return role_getall_service()
    
    # i know the post is better here wat do u think or should i leave in id
    # @role_required('admin')
    def post(self):
        data = request.get_json()
        return role_post(data)
    


class Role(Resource):
    def get(self, id):
        data = Role.query.filter_by(id=id).first()
        return role_getbyid_service(data)
    
   

    @role_required('admin')
    def patch(self, id):
        data = Role.query.filter_by(id=id).first()
        
        return role_patchbyid_service(data)
        
    @role_required('admin')
    def delete(self,id):
        data = Role.query.filter_by(id=id).first()
        return role_deletebyid_service(data)
    

api.add_resource(Roles, '/roles', endpoint ='roles')
api.add_resource(Role, '/roles/<int:id>', endpoint='role_by_id')



    # "email": "admin@example.com",
    # "password": "Admin@123",

# {"message": "User registered successfully", "user": {"id": 7, "first_name": "Peter", "last_name": "Katiba", "email": "admin@example.com", "is_active": true, "last_login": null, "created_at": "2026-07-10T15:52:53.045350", "role": {"id": 1, "role_name": "admin", "description": "Full system access", "created_at": "2026-06-27T12:05:00.759119", "url": {"self": "/roles/1", "collection": "/roles"}}, "url": {"self": "/register"}}}


# already created these
# [
#   {
#     "created_at": "2026-06-27T12:05:00.759119",
#     "description": "Full system access",
#     "id": 1,
#     "role_name": "admin",
#     "url": {
#       "collection": "/roles",
#       "self": "/roles/1"
#     }
#   },
#   {
#     "created_at": "2026-06-27T12:07:37.922638",
#     "description": "limited system access",
#     "id": 2,
#     "role_name": "teacher",
#     "url": {
#       "collection": "/roles",
#       "self": "/roles/2"
#     }
#   },
#   {
#     "created_at": "2026-06-27T12:08:18.004099",
#     "description": "no system access",
#     "id": 3,
#     "role_name": "student",
#     "url": {
#       "collection": "/roles",
#       "self": "/roles/3"
#     }
#   }
# ]