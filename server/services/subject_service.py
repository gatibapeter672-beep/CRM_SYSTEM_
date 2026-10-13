# server/service/subject_service.py

from schemas.subjectSchema import subject_schema, subjects_schema
from flask import request, make_response
import logging
from models import Subject
from app import db
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import ValidationError

logger = logging.getLogger(__name__)

def subject_getall_service():
    try:
        subjects = db.session.scalars(select(Subject)).all()
        return make_response(subjects_schema.dump(subjects), 200)
    except SQLAlchemyError as e:
        logger.error(f"Database error in subject_getall_service: {str(e)}")
        return {"error": "An unexpected error occurred while retrieving resource."},500

def suject_post():
    data = request.get_json(silent=True)
    if data is None:
        return {"error": "Invalid Json or missing request body."},400
    
    try:
        validated_data = subject_schema.load(data)
    except ValidationError as e:
        return {"error":e.messages},400
    
    new_subject = Subject(
        subject_name = validated_data.get('subject_name') ,
        subject_code = validated_data.get('subject_code') ,
        description = validated_data.get('description') ,
    )
    try:
        db.session.add(new_subject)
        db.session.commit()
        return make_response(subject_schema.dump(new_subject), 201)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database insertion failed: {str(e)}")
        return {'error': "Database error occured while creating the resource."},500


def subject_getbyid_service(id):
    try:
        subject = db.session.get(Subject, id)
        if not subject:
            return {"message": "Subject not found"}, 404
        return make_response(subject_schema.dump(subject), 200)
    except SQLAlchemyError as e:
        logger.error(f"Database error in subject_getbyid_service for ID {id}:{str(e)}")
        return {"error": "An unexpected error occured."},500

def resource_patchbyid_service(id):
    try:
        subject = db.session.get(Subject,id)
        if not subject:
            return {"message":"Subject not found"},404
    except SQLAlchemyError as e:
        logger.error(f"Database patch transaction update failed for ID {id}: {str(e)}")
        return {"error": "Could not finalize resource updates."},500

def subject_deletedbyid_service(id):
    try:
        subject = db.session.get(Subject, id)
        if not subject:
            return {"message": "Subject not found"},404
        db.session.delete(subject)
        db.session.commit()
        return make_response({"message":"SUject deleted successfully"},200)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database deletion transaction failed for ID {id}: {str(e)}")
        return {"error": "failed to delete resource due to dataase conflict."},500
