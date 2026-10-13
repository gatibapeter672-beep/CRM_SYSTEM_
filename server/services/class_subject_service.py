# server/services/class_subject_service.py
from app import db
from models import ClassSubject
from schemas.class_subjectSchema import class_subjectSchema, class_subjectsSchema
from flask import make_response, request
from marshmallow import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def class_subject_getall_service():
    try:
        class_subjects = db.session.scalars(select(ClassSubject)).all()
        return make_response(class_subjectsSchema.dump(class_subjects), 200)
    except SQLAlchemyError as e:
        logger.error(f"Database error in class_subject_getall_service: {str(e)}")
        return {"error": "An unexpected error occurred while retrieving linkages."}, 500

def class_subject_post_service(data):
    
    if data is None:
        return {"error": "Invalid JSON or missing request body."}, 400

    try:
        validated_data = class_subjectSchema.load(data)
    except ValidationError as e:
        return {"error": e.messages}, 400

    new_link = ClassSubject(
        class_id=validated_data.get('class_id'),
        subject_id=validated_data.get('subject_id')
    )

    try:
        db.session.add(new_link)
        db.session.commit()
        return make_response(class_subjectSchema.dump(new_link), 201)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database linkage creation failed: {str(e)}")
        return {"error": "Could not bridge class and subject due to a database error."}, 500

def class_subject_delete_service(id):
    try:
        link = db.session.get(ClassSubject, id)
        if not link:
            return {"message": "Linkage record not found"}, 404
            
        db.session.delete(link)
        db.session.commit()
        return make_response({"message": "Linkage removed successfully"}, 200)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database linkage deletion failed for ID {id}: {str(e)}")
        return {"error": "Failed to remove mapping due to database constraints."}, 500