import os
import time
from werkzeug.utils import secure_filename
from flask import current_app
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.user import User
from models.teacher_class import TeacherClass
from models.class_model import SchoolClass
from models.class_subject import ClassSubject
from models.resource import Resource
from models.resource_view import ResourceView
from models.download import Download
import logging

logger = logging.getLogger(__name__)


def get_teacher_dashboard_metadata(teacher_id: int):
    try:
        # 1. Gather global upload metrics owned by this faculty member
        total_uploads = db.session.scalar(
            select(func.count(Resource.id))
            .where(Resource.uploaded_by == teacher_id)
            .where(Resource.status == 'ACTIVE')
        ) or 0

        total_views = db.session.scalar(
            select(func.count(ResourceView.user_id))
            .join(Resource, ResourceView.resource_id == Resource.id)
            .where(Resource.uploaded_by == teacher_id)
        ) or 0

        total_downloads = db.session.scalar(
            select(func.count(Download.id))
            .join(Resource, Download.resource_id == Resource.id)
            .where(Resource.uploaded_by == teacher_id)
        ) or 0

        # 2. Fetch assigned classes and resolve primary subject (matching single-subject UI)
        teacher_classes = db.session.scalars(
            select(TeacherClass).where(TeacherClass.teacher_id == teacher_id)
        ).all()

        assigned_classes = []
        for tc in teacher_classes:
            s_class = tc.school_class
            if not s_class:
                continue

            # Deterministically grab the primary subject assigned to this class section
            class_subject_rels = db.session.scalars(
                select(ClassSubject).where(ClassSubject.class_id == s_class.id)
            ).all()
            subjects_list = [
                {
                    "id": cs.subject.id,
                    "name": cs.subject.subject_name,
                    "code": cs.subject.subject_code
                }
                for cs in class_subject_rels if cs.subject
            ]
            
            uploads_count = db.session.scalar(
                select(func.count(Resource.id))
                .where(Resource.class_id == s_class.id)
                .where(Resource.uploaded_by == teacher_id)
                .where(Resource.status == 'ACTIVE')
            ) or 0

            assigned_classes.append({
                "id": s_class.id,
                "name": s_class.class_name,
                "code": f"CLS-{s_class.id}",
                "subjects": subjects_list,
                "uploadsCount": uploads_count
            })

        # 3. Pull top items for Content Engagement Tracker (Optimized single query, no N+1)
        results = db.session.execute(
            select(
                Resource,
                func.count(func.distinct(ResourceView.id)).label("views_count"),
                func.count(func.distinct(Download.id)).label("downloads_count")
            )
            .outerjoin(ResourceView, ResourceView.resource_id == Resource.id)
            .outerjoin(Download, Download.resource_id == Resource.id)
            .where(Resource.uploaded_by == teacher_id)
            .where(Resource.status == 'ACTIVE')
            .group_by(Resource.id)
            .order_by(Resource.created_at.desc())
            .limit(5)
        ).all()

        recent_engagement = [
            {
                "id": res.id,
                "title": res.title or res.file_name,  # Correct title mapping
                "type": res.resource_type,
                "views": views_count,
                "downloads": downloads_count
            }
            for res, views_count, downloads_count in results
        ]

        return {
            "stats": {
                "totalUploads": total_uploads,
                "uniqueViews": total_views,
                "totalDownloads": total_downloads
            },
            "assignedClasses": assigned_classes,
            "recentEngagement": recent_engagement
        }, 200

    except SQLAlchemyError as e:
        logger.error(f"Error compiling teacher data metrics pipeline: {str(e)}")
        return {"error": "Internal database fault processing teacher workspace data."}, 500

# def create_new_class_resource(teacher_id: int, payload_data: dict):
#     try:
#         class_id = int(payload_data.get("class_id"))
#         subject_id = int(payload_data.get("subject_id"))
#         print("CLASS ID:", class_id)
#         print("SUBJECT ID:", subject_id)
#         # class_id = payload_data.get("class_id")
#         # subject_id = payload_data.get("subject_id")
#         # Verify teacher is mapped explicitly to this target class route before creating resources
#         is_assigned = db.session.scalar(
#             select(TeacherClass)
#             .where(TeacherClass.teacher_id == teacher_id)
#             .where(TeacherClass.class_id == class_id)
#             .limit(1)
#         )
#         if not is_assigned:
#             return {"error": "Access Denied: You are not authorized to deploy to this target class library route."}, 403

#         # Resolve subject identifier automatically mapped to this specific school room context
#         # class_subj = db.session.scalar(
#         #     select(ClassSubject).where(ClassSubject.class_id == class_id).limit(1)
#         # )


#         # class_subj = db.session.scalar(
#         #     select(ClassSubject)
#         #     .where(ClassSubject.class_id == class_id)
#         #     .where(ClassSubject.subject_id == subject_id)
           
#         # )
#         class_subj = db.session.execute(
#             select(ClassSubject)
#             .where(ClassSubject.class_id == class_id)
#             .where(ClassSubject.subject_id == subject_id)
#         ).scalar_one_or_none()
#         print(class_subj)
        
#         if not class_subj:
#             return {"error": "Target class route does not possess an assigned course subject framework mapping."}, 400

#         new_resource = Resource(
#             title=payload_data.get("title"),
#             description=payload_data.get("description"),
#             file_name=payload_data.get("file_name"),
#             file_path=payload_data.get("file_path"),
#             file_size=payload_data.get("file_size"),
#             file_type=payload_data.get("file_type"),
#             resource_type=payload_data.get("resource_type"),
#             class_id=class_id,
#             subject_id=subject_id,
#             uploaded_by=teacher_id,
#             status='ACTIVE'
#         )

#         db.session.add(new_resource)
#         db.session.commit()
#         return {"message": "Resource compiled and dispatched safely into class curriculum library grid.", "id": new_resource.id}, 201

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         logger.error(f"Critical asset deployment failure executing database session tracking write: {str(e)}")
#         return {"error": "Database write transactional tracking exception thrown handling file metadata context."}, 500



def create_new_class_resource(teacher_id: int, form_data: dict, file_obj):
    try:
        class_id = int(form_data.get("class_id"))
        subject_id = int(form_data.get("subject_id"))
        title = form_data.get("title")
        description = form_data.get("description", "")
        resource_type = form_data.get("resource_type", "NOTE")

        # 1. Verify authorization
        is_assigned = db.session.scalar(
            select(TeacherClass)
            .where(TeacherClass.teacher_id == teacher_id)
            .where(TeacherClass.class_id == class_id)
            .limit(1)
        )
        if not is_assigned:
            return {"error": "Access Denied: You are not authorized to deploy to this target class."}, 403

        # 2. Verify subject assignment
        class_subj = db.session.execute(
            select(ClassSubject)
            .where(ClassSubject.class_id == class_id)
            .where(ClassSubject.subject_id == subject_id)
        ).scalar_one_or_none()

        if not class_subj:
            return {"error": "Target class route does not possess an assigned course subject mapping."}, 400

        # 3. Handle physical file save to disk
        if not file_obj or file_obj.filename == '':
            return {"error": "No valid file uploaded."}, 400

        original_filename = secure_filename(file_obj.filename)
        timestamp = int(time.time() * 1000)
        unique_filename = f"{timestamp}_{original_filename}"

        # Define destination directory: server/uploads/resources
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'resources')
        os.makedirs(upload_folder, exist_ok=True)

        # Full path to save the physical file on your server
        file_disk_path = os.path.join(upload_folder, unique_filename)
        file_obj.save(file_disk_path)

        # Get file metadata
        file_size = os.path.getsize(file_disk_path)
        file_type = file_obj.mimetype or "application/octet-stream"
        db_file_path = f"/uploads/resources/{unique_filename}"

        # 4. Save metadata to Database
        new_resource = Resource(
            title=title,
            description=description,
            file_name=original_filename,
            file_path=db_file_path,
            file_size=file_size,
            file_type=file_type,
            resource_type=resource_type,
            class_id=class_id,
            subject_id=subject_id,
            uploaded_by=teacher_id,
            status='ACTIVE'
        )

        db.session.add(new_resource)
        db.session.commit()
        return {
            "message": "Resource compiled and dispatched safely into class curriculum library grid.",
            "id": new_resource.id,
            "file_path": db_file_path
        }, 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Critical asset deployment failure executing database write: {str(e)}")
        return {"error": "Database write transactional tracking exception thrown handling file metadata context."}, 500