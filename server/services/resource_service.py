import logging
from flask import make_response, request
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from marshmallow import ValidationError
from app import db
from models import Resource
from schemas.resourceSchema import resource_schema, resources_schema

logger = logging.getLogger(__name__)

def get_user_uploads_service(current_user_id):
    """Fetch all uploads created by the authenticated user."""
    try:
        stmt = (
            select(Resource)
            .where(Resource.uploaded_by == current_user_id)
            .order_by(Resource.created_at.desc())
        )
        user_resources = db.session.scalars(stmt).all()
        return make_response(resources_schema.dump(user_resources), 200)
    except SQLAlchemyError as e:
        logger.error(f"Error fetching uploads for user {current_user_id}: {str(e)}")
        return {"error": "An unexpected database error occurred while retrieving uploads."}, 500


def update_resource_status_service(resource_id, current_user_id):
    """Toggle status between ACTIVE and ARCHIVED, or accept payload update."""
    data = request.get_json(silent=True) or {}
    
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return {"error": "Resource not found."}, 404

        # Ownership security check
        if int(resource.uploaded_by) != int(current_user_id):
            return {"error": "Unauthorized action on this resource."}, 403

        # If explicit status is sent, use it; otherwise toggle ACTIVE <-> ARCHIVED
        if "status" in data:
            new_status = data["status"].upper()
            if new_status not in ["ACTIVE", "ARCHIVED", "DELETED"]:
                return {"error": "Invalid resource status provided."}, 400
            resource.status = new_status
        else:
            resource.status = "ARCHIVED" if resource.status == "ACTIVE" else "ACTIVE"

        db.session.commit()
        return make_response(resource_schema.dump(resource), 200)

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed to update status for resource ID {resource_id}: {str(e)}")
        return {"error": "Database error occurred while updating resource status."}, 500




def delete_resource_service(resource_id, current_user_id):
    """Permanently delete a resource and cascade-delete its views, tags, and downloads."""
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            logger.warning(f"Resource {resource_id} not found.")
            return {"error": "Resource not found."}, 404

        # 🔍 DIAGNOSTIC PRINT: Compare types and values
        print(f"DEBUG DELETE: current_user_id={current_user_id} ({type(current_user_id)}), resource.uploaded_by={resource.uploaded_by} ({type(resource.uploaded_by)})")

        # Ownership security check
        if int(resource.uploaded_by) != int(current_user_id):
            print(f"❌ MISMATCH: Resource uploaded by user {resource.uploaded_by}, but request made by user {current_user_id}")
            return {"error": "Unauthorized action on this resource."}, 403

        db.session.delete(resource)
        db.session.commit()
        return make_response({"message": "Resource and associated metrics successfully deleted."}, 200)

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed to delete resource ID {resource_id}: {str(e)}")
        return {"error": "Database error occurred while purging resource."}, 500



# def delete_resource_service(resource_id, current_user_id):
#     """Permanently delete a resource and cascade-delete its views, tags, and downloads."""
#     try:
#         print(current_user_id)
#         resource = db.session.get(Resource, resource_id)
#         if not resource:
#             return {"error": "Resource not found."}, 404

#         # Ownership security check
#         if resource.uploaded_by != current_user_id:
#             return {"error": "Unauthorized action on this resource."}, 403

#         db.session.delete(resource)
#         db.session.commit()
#         return make_response({"message": "Resource and associated metrics successfully deleted."}, 200)

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         logger.error(f"Failed to delete resource ID {resource_id}: {str(e)}")
#         return {"error": "Database error occurred while purging resource."}, 500