from flask import make_response, request
from sqlachemy import select
from app import db
from models import Tag
from marshmallow import ValidationError
from schemas.tagSchema import tags_schema, tag_schema
from sqlalchemy.exc import SQLAlchemyError
import logging



logger = logging.getLogger(__name__)

def tag_getall_service():
    try:
        tags = db.session.scalars(
            select(Tag).all()
        )
        return make_response(tags_schema.dump(tags), 200)
    except SQLAlchemyError as e:
        logger.error(f"Dataase error in tag_getall_service:{str(e)}")
        return {"error":"An unexpected error occured while retrieving resources."},500
    
def tag_post():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid JSON or missing request body."}, 400
    
    try:
        validated_data = tag_schema.load(data)
    except ValidationError as e:
        return {"error": e.messages},

    new_tag = Tag(
        tag_name = validated_data.get('tag_name')
    )

    try:
        db.session.add(new_tag)
        db.session.commit()
        return make_response(tag_schema.dump(new_tag),201)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database insertion failed: {str(e)}")
        return {"error": "Database error occurred while creating the resource."}, 500
    
def tag_getbyid_services(id):
    try:
        tag = db.session.get(Tag, id)
        if not tag:
            return {"message":"Tag not found"},404
        return make_response(tag_schema.dump(tag), 200)
    except SQLAlchemyError as e:
        logger.error(f"Database error in tag_getbyid_services for ID {id}: {str(e)}")
        return {"error": "An unexpected error occurred."}, 500

def tag_patchbyid_service(id):
    try:
        tag = db.session.get(Tag, id)
        if not tag:
            return {"message":"Tag not found"}, 404
        
    except SQLAlchemyError as e:
        logger.error(f"Database read failure during patch for ID {id}: {str(e)}")
        return {"error": "Database lookup failed."},500
    
    patch_data = request.get_json(silent=True)
    if patch_data is None:
        return {"error": "Invalid JSON payload provided."}, 400
    try:
        validated_data = tag_schema.load(patch_data,partial=True)
    except ValidationError as e:
        return {"error": e.messages}, 400
    


    for key, value in validated_data.items():
        if hasattr(tag,key):
            setattr(tag, key, value)
    try:
        db.session.commit()
        return make_response(tag_schema.dump(tag), 200)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database patch transaction update failed for ID {id}: {str(e)}")
        return {"error": "Could not finalize tag updates."}, 500
    

def tag_deletedbyid_service(id):
    try:
        tag = db.session.get(Tag, id)
        if not tag:
            return {"message": "Tag not found"}, 404
        db.session.delete(tag)
        db.session.commit()
        return make_response({"message": "Resource deleted successfully"},200)
    
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database deletion transaction failed for ID {id}: {str(e)}")
        return {"error": "Failed to delete tag due to a database conflict."}, 500
