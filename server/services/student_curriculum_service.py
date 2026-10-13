from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from extensions import db
from models.user import User
from models.student_class import StudentClass
from models.class_subject import ClassSubject
from models.subject import Subject
from models.resource import Resource
from models.resource_view import ResourceView
from models.download import Download
import logging

logger = logging.getLogger(__name__)

def get_student_curriculum_data(student_user_id: int):
    try:
        student = db.session.get(User, student_user_id)
        if not student:
            return {"error": "Student profile not found."}, 404

        # 1. Resolve student class assignment
        student_class_record = db.session.scalar(
            select(StudentClass)
            .where(StudentClass.student_id == student_user_id)
            .limit(1)
        )

        if not student_class_record:
            return {
                "student_context": {"className": None},
                "subject_binder": []
            }, 200

        class_id = student_class_record.class_id
        class_name = student_class_record.school_class.class_name if student_class_record.school_class else "Unknown Class"

        # 2. Fetch all subjects allocated to this class
        class_subjects = db.session.scalars(
            select(ClassSubject)
            .where(ClassSubject.class_id == class_id)
        ).all()

        subject_binder = []
        for cs in class_subjects:
            subj = cs.subject
            if not subj:
                continue

            # Fetch active resources matching this specific subject and student class
            active_resources = db.session.scalars(
                select(Resource)
                .where(Resource.class_id == class_id)
                .where(Resource.subject_id == subj.id)
                .where(Resource.status == 'ACTIVE')
            ).all()

            # Compile discrete type badges metrics for this specific course box
            metrics = {'NOTE': 0, 'PAST_PAPER': 0, 'ASSIGNMENT': 0, 'REVISION_QUESTION': 0}
            resources_list = []

            for res in active_resources:
                if res.resource_type in metrics:
                    metrics[res.resource_type] += 1
                
                resources_list.append({
                    "id": res.id,
                    "file_name": res.file_name,
                    "file_path": res.file_path,
                    "file_size": res.file_size or 0,
                    "resource_type": res.resource_type,
                    "uploader": {
                        "first_name": res.uploader.first_name if res.uploader else "System",
                        "last_name": res.uploader.last_name if res.uploader else "Admin"
                    }
                })

            subject_binder.append({
                "id": subj.id,
                "subject_name": subj.subject_name,
                "subject_code": subj.subject_code or f"SUBJ-{subj.id}",
                "description": subj.description,
                "metrics": metrics,
                "resources": resources_list
            })

        payload = {
            "student_context": {"className": class_name},
            "subject_binder": subject_binder
        }
        return payload, 200

    except SQLAlchemyError as e:
        logger.error(f"Database error compilation inside curriculum data path: {str(e)}")
        return {"error": "Internal database error compiling curriculum data."}, 500


def track_resource_action(student_user_id: int, resource_id: int, action_type: str):
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return {"error": "Resource entry not found."}, 404

        if action_type == "VIEW":
            new_log = ResourceView(user_id=student_user_id, resource_id=resource_id)
        elif action_type == "DOWNLOAD":
            new_log = Download(user_id=student_user_id, resource_id=resource_id)
        else:
            return {"error": "Invalid interaction processing token."}, 400

        db.session.add(new_log)
        db.session.commit()
        return {"message": f"Historical tracking entry for resource ID [{resource_id}] processed successfully."}, 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Failed handling tracking interaction log for resource {resource_id}: {str(e)}")
        return {"error": "Could not finalize audit event recording."}, 500
    
    