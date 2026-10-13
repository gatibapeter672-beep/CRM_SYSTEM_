import logging
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError

from app import db
from models import (
    TeacherClass,
    SchoolClass,
    ClassSubject,
    Subject,
    StudentClass,
    User,
    Resource,
    ResourceView,
    Download,
)
from schemas.teacher_class_schema import (
    teacher_class_cohorts_schema,
    teacher_class_cohort_schema,
)

logger = logging.getLogger(__name__)


def _format_time_ago(dt: datetime) -> str:
    """Helper to convert a datetime object to relative human-readable strings."""
    if not dt:
        return "Never"
    
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
        
    diff = now - dt
    seconds = diff.total_seconds()

    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        return f"{minutes} min{'s' if minutes > 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds // 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif seconds < 172800:
        return "Yesterday"
    else:
        days = int(seconds // 86400)
        return f"{days} days ago"


def get_teacher_classes_service(teacher_id: int):
    """Fetches all assigned classes for a teacher with total uploads, library health, and student engagement rosters."""
    try:
        # 1. Fetch assigned classes for this teacher
        stmt = (
            select(SchoolClass)
            .join(TeacherClass, TeacherClass.class_id == SchoolClass.id)
            .where(TeacherClass.teacher_id == teacher_id)
        )
        classes = db.session.scalars(stmt).all()

        cohorts_payload = []

        for school_class in classes:
            # Get Subject information via ClassSubject junction
            cs_stmt = (
                select(Subject)
                .join(ClassSubject, ClassSubject.subject_id == Subject.id)
                .where(ClassSubject.class_id == school_class.id)
            )
            subject = db.session.scalars(cs_stmt).first()

            subject_name = subject.subject_name if subject else "General"
            course_code = subject.subject_code if (subject and subject.subject_code) else f"CLASS-{school_class.id}"

            # Compute Total Active Uploaded Materials
            total_uploads = db.session.scalar(
                select(func.count(Resource.id)).where(
                    Resource.class_id == school_class.id,
                    Resource.status == 'ACTIVE'
                )
            ) or 0

            # Compute Library Health Metrics (% of active resources viewed at least once)
            viewed_resources_count = db.session.scalar(
                select(func.count(func.distinct(ResourceView.resource_id)))
                .join(Resource, ResourceView.resource_id == Resource.id)
                .where(Resource.class_id == school_class.id, Resource.status == 'ACTIVE')
            ) or 0

            health_percentage = (
                round((viewed_resources_count / total_uploads) * 100)
                if total_uploads > 0
                else 0
            )

            # Build Student Roster Analytics
            students_stmt = (
                select(User)
                .join(StudentClass, StudentClass.student_id == User.id)
                .where(StudentClass.class_id == school_class.id)
            )
            enrolled_students = db.session.scalars(students_stmt).all()

            student_list = []
            for student in enrolled_students:
                # Count total unique document views/downloads for this student in this class
                views_count = db.session.scalar(
                    select(func.count(ResourceView.id))
                    .join(Resource, ResourceView.resource_id == Resource.id)
                    .where(
                        ResourceView.user_id == student.id,
                        Resource.class_id == school_class.id
                    )
                ) or 0

                downloads_count = db.session.scalar(
                    select(func.count(Download.id))
                    .join(Resource, Download.resource_id == Resource.id)
                    .where(
                        Download.user_id == student.id,
                        Resource.class_id == school_class.id
                    )
                ) or 0

                # Determine last active interaction timestamp
                latest_view = db.session.scalar(
                    select(func.max(ResourceView.viewed_at)).where(ResourceView.user_id == student.id)
                )
                latest_download = db.session.scalar(
                    select(func.max(Download.downloaded_at)).where(Download.user_id == student.id)
                )

                timestamps = [ts for ts in [latest_view, latest_download, student.last_login] if ts is not None]
                last_active_dt = max(timestamps) if timestamps else None

                student_list.append({
                    "id": student.id,
                    "name": f"{student.first_name} {student.last_name}",
                    "documents_read": views_count + downloads_count,
                    "last_active": _format_time_ago(last_active_dt)
                })

            cohorts_payload.append({
                "id": school_class.id,
                "class_name": school_class.class_name,
                "subject_name": subject_name,
                "course_code": course_code,
                "total_uploads": total_uploads,
                "library_health": f"{health_percentage}%",
                "students": student_list
            })

        return teacher_class_cohorts_schema.dump(cohorts_payload), 200

    except SQLAlchemyError as e:
        logger.error(f"Database error in get_teacher_classes_service: {str(e)}")
        return {"error": "Failed to retrieve assigned classes and cohort analytics."}, 500