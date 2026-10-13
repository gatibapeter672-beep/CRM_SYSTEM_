# server/services/role_service.py
from models import Role
from flask import make_response, request, jsonify
from schemas.roleSchema import role_schema, roles_schema
from app import db
from marshmallow import ValidationError



def role_getall_service():
    roles = Role.query.all()

    response = make_response(
        roles_schema.dump(roles),
        200
    )
    return response



def role_post(data):
        
    try :
        validated_data = role_schema.load(data)
    except ValidationError as e:
        return {"error": e.messages},400
    
    new_role =Role(
        role_name = validated_data.role_name,
        description = validated_data.description,
    )



    db.session.add(new_role)
    db.session.commit()

    response = make_response(
        role_schema.dump(new_role),
        201,
    )

    return response




def role_getbyid_service(data):
    if not data:
        return {"message": "Role not found"},404
    
    response = make_response(
        role_schema.dump(data),
        200
    )
    return response



def role_patchbyid_service(data):
    if not data:
        return {"message":"Role not found"}, 404
    
    patch_data = request.get_json()
    for key, value in patch_data.items():
        if hasattr(data,key):
            setattr(data, key,value)
      
    db.session.commit()

    

    response = make_response(
        role_schema.dump(data),
        200
    )

    return response

def role_deletebyid_service(data):
    if not data:
        return {"message": "Role not found"}, 404
    db.session.delete(data)
    db.session.commit()

    response_dict = {"message": "Role deleted successfully"}
    response = make_response(
        response_dict,
        200
    )
    return response
    