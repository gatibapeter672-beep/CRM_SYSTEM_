# server/routes/auth_routes.py

from flask import  make_response
from flask_restful import Resource
from flask import request
from app import api
from services.auth_reg_service import register_user_service
from services.auth_service import login_user_service


class Index(Resource):
    def get(self):
        response_dict = {
            'registration':'welcome to the registration restful api'
        }

        response =make_response(
            response_dict,
            200,
        )
        return response

api.add_resource(Index, '/')

class Login(Resource):
    def post(self):
        data = request.get_json()
        return login_user_service(data)

class Registration(Resource):
    def post(self):
        data = request.get_json()
        return register_user_service(data)
     


api.add_resource(Login, '/login',endpoint='login')
api.add_resource(Registration, '/register',endpoint='registration')

