# server/services/adm_dashboard_service.py
from app import db
from models import Resource, Download, SchoolClass, Subject, ClassSubject, User, Role, TokenBlocklist, Tag, ResourceTag
from schemas.adm_dashboard_analyticsSchema import (
    material_analytics_schema, 
    curriculum_gap_schema, 
    dashboard_overview_schema,
    security_audit_response_schema,
    tag_cloud_schema,
    dashboard_Search_schema
)
from flask import make_response, request
from sqlalchemy import select, func, desc, or_, literal,null
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def dashboard_search_service(query, page, per_page):
    try:        
        if not query:
            return {
                "status": "success",
                "data": {
                    "resource": [],
                    "users" : [],
                    "classes": []
                }
            }, 200
        
        offset = (page-1)*per_page

        # Resources Search
        resources = db.session.execute(
            select(Resource.id.label('resource_id'), 
                   Resource.title.label('resource_title')
            )
            .where(Resource.title.ilike(f"%{query}%"))
            .limit(per_page)
            .offset(offset)
        ).all()

        # Users Search
        users = db.session.execute(
            select(User.id.label('user_id'), 
                   User.username.label('user_name'),
                   User.email.label('user_email')
            )
            .where(
                or_(
                    User.username.ilike(f"%{query}%"),
                    User.email.ilike(f"%{query}%")
                )
            )
            .limit(per_page)
            .offset(offset)
        ).all()

        # Classes Search
        classes = db.session.execute(
            select(SchoolClass.id.label('class_id'), 
                   SchoolClass.class_name.label('class_classname')
            )
            .where(SchoolClass.class_name.ilike(f"%{query}%"))
            .limit(per_page)
            .offset(offset)
        ).all()

        payload = {
            'resources': resources, 
            'users': users,
            'classes': classes 
        }

        # Fixed: now correctly calls .dump() on the non-many instance
        return {
            "status": "success",
            "page":page,
            "per_page":per_page,
            "data" :dashboard_Search_schema.dump(payload)
        }, 200

    except SQLAlchemyError as e:
        logger.error(f"Search error: {str(e)}")
        return {"error": "Search failed"}, 500

def get_dashboard_overview_service():
    try:
        teachers_count = db.session.scalar(
            select(func.count(User.id))
            .join(Role)
            .where(Role.role_name == 'teacher', User.is_active == True)
        ) or 0

        students_count = db.session.scalar(
            select(func.count(User.id))
            .join(Role)
            .where(Role.role_name == 'student', User.is_active == True)
        ) or 0

        blocked_tokens = db.session.scalar(
            select(func.count(TokenBlocklist.id))
        ) or 0

        payload = {
            "teachers": teachers_count,
            "students": students_count,
            "system_health": {
                "blocked_tokens": blocked_tokens,
                "status": "OK" if blocked_tokens < 10 else "WARNING"
            }
        }

        return dashboard_overview_schema.dump(payload), 200

    except SQLAlchemyError as e:
        logger.error(f"Overview compilation failure: {str(e)}")
        return {"error": "Failed to load dashboard overview"}, 500

def get_top_trending_materials_service():
    try:
        stmt = (
            select(
                Resource.id.label('resource_id'),
                Resource.title.label('title'),
                func.count(Download.id).label('download_count'),
                Subject.subject_name.label('subject_name'),
                SchoolClass.class_name.label('class_name')
            )
            .join(Download, Resource.id == Download.resource_id)
            .join(Subject, Resource.subject_id == Subject.id)
            .join(SchoolClass, Resource.class_id == SchoolClass.id)
            .group_by(Resource.id, Subject.subject_name, SchoolClass.class_name)
            .order_by(desc('download_count'))
            .limit(5)
        )
        results = db.session.execute(stmt).all()
        return material_analytics_schema.dump(results), 200
    except SQLAlchemyError as e:
        logger.error(f"Database error in get_top_trending_materials_service: {str(e)}")
        return {"error": "An unexpected error occurred while compiling analytics."}, 500

def get_curriculum_gaps_service():
    try:
        notes_subquery = (
            select(Resource.class_id, Resource.subject_id)
            .where(Resource.resource_type == 'NOTE')
            .subquery()
        )

        stmt = (
            select(
                SchoolClass.id.label('class_id'),
                SchoolClass.class_name.label('class_name'),
                Subject.id.label('subject_id'),
                Subject.subject_name.label('subject_name'),
                literal("MISSING_NOTES").label('gap_type')
            )
            .join(ClassSubject, SchoolClass.id == ClassSubject.class_id)
            .join(Subject, ClassSubject.subject_id == Subject.id)
            .outerjoin(
                notes_subquery,
                (SchoolClass.id == notes_subquery.c.class_id) & (Subject.id == notes_subquery.c.subject_id)
            )
            .where(notes_subquery.c.class_id == None)
        
        )

        unlinked_stmt = (
            select(
                null().label('class_id'),
                null().label('class_name'),
                Subject.id.label('subject_id'),
                Subject.subject_name.label('subject_name'),
                literal("UNLINKED_SUBJECT").label('gap_type')
            )
            .outerjoin(ClassSubject, Subject.id == ClassSubject.subject_id)
            .where(ClassSubject.subject_id == None)
        )
        
        missing_notes_results = db.session.execute(stmt).all()
        unlinked_results = db.session.execute(unlinked_stmt).all()

        combined_results = list(missing_notes_results) + list(unlinked_results)
        return curriculum_gap_schema.dump(combined_results), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error in get_curriculum_gaps_service: {str(e)}")
        return {"error": "An unexpected error occurred while analyzing curriculum gaps."}, 500

def get_security_audit_service():
    try:
        inactive_users = db.session.scalars(
            select(User)
            .where(User.is_active == False)
            .order_by(desc(User.id))
        ).all()

        blocked_tokens = db.session.execute(
            select(
                TokenBlocklist.id,
                TokenBlocklist.jti,
                TokenBlocklist.created_at
            )
            .order_by(desc(TokenBlocklist.created_at))
            .limit(10)
        ).all()

        audit_payload = {
            "inactive_users": inactive_users,
            "token_events": blocked_tokens
        }

        return security_audit_response_schema.dump(audit_payload), 200

    except SQLAlchemyError as e:
        logger.error(f"Security audit transactional isolation error: {str(e)}")
        return {"error": "Security audit failed"}, 500

def get_tag_cloud_service():
    try:
        stmt = (
            select(
                Tag.id.label('tag_id'),
                Tag.tag_name.label('tag_name'),
                func.count(ResourceTag.resource_id).label('usage_count')
            )
            .join(ResourceTag, Tag.id == ResourceTag.tag_id)
            .group_by(Tag.id, Tag.tag_name)
            .order_by(desc('usage_count'))
        )

        results = db.session.execute(stmt).all()
        return tag_cloud_schema.dump(results), 200

    except SQLAlchemyError as e:
        logger.error(f"Tag cloud generation error: {str(e)}")
        return {"error": "Failed to load tag cloud"}, 500